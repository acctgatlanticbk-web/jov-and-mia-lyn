import fs from "fs"
import path from "path"
import { v2 as cloudinary } from "cloudinary"
import { PROJECT_PREFIX } from "@/lib/cloudinary"
import { galleryFallbackImages } from "@/content/gallery-images"

const GALLERY_FOLDERS = ["desktop-background", "mobile-background"] as const

function sortByNumericSuffix(paths: string[]): string[] {
  return [...paths].sort((a, b) => {
    const numA = parseInt(a.match(/\((\d+)\)/)?.[1] || "0", 10)
    const numB = parseInt(b.match(/\((\d+)\)/)?.[1] || "0", 10)
    return numA - numB
  })
}

function readGalleryImagesFromPublic(): string[] {
  const images: string[] = []

  for (const folder of GALLERY_FOLDERS) {
    const dir = path.join(process.cwd(), "public", folder)
    if (!fs.existsSync(dir)) continue

    const files = fs
      .readdirSync(dir)
      .filter((file) => /\.webp$/i.test(file))
      .map((file) => `/${folder}/${file}`)

    images.push(...sortByNumericSuffix(files))
  }

  return images
}

function publicIdToLocalPath(publicId: string): string | null {
  const prefix = `${PROJECT_PREFIX}/`
  if (!publicId.startsWith(prefix)) return null

  const relative = publicId.slice(prefix.length)
  const folder = relative.split("/")[0]
  if (!GALLERY_FOLDERS.includes(folder as (typeof GALLERY_FOLDERS)[number])) {
    return null
  }

  return `/${relative}.webp`
}

async function fetchGalleryImagesFromCloudinary(): Promise<string[]> {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  const apiKey = process.env.CLOUDINARY_API_KEY
  const apiSecret = process.env.CLOUDINARY_API_SECRET

  if (!cloudName || !apiKey || !apiSecret) return []

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  })

  const images: string[] = []

  for (const folder of GALLERY_FOLDERS) {
    const prefix = `${PROJECT_PREFIX}/${folder}`
    let nextCursor: string | undefined

    do {
      const response = await cloudinary.api.resources({
        type: "upload",
        prefix,
        max_results: 500,
        ...(nextCursor ? { next_cursor: nextCursor } : {}),
      })

      for (const resource of response.resources) {
        const localPath = publicIdToLocalPath(resource.public_id)
        if (localPath) images.push(localPath)
      }

      nextCursor = response.next_cursor
    } while (nextCursor)
  }

  return sortByNumericSuffix(images)
}

/**
 * Loads gallery images from public folders (local dev), Cloudinary (production),
 * or the bundled manifest fallback.
 */
export async function fetchGalleryImages(): Promise<string[]> {
  const local = readGalleryImagesFromPublic()
  if (local.length > 0) return local

  try {
    const fromCloudinary = await fetchGalleryImagesFromCloudinary()
    if (fromCloudinary.length > 0) return fromCloudinary
  } catch {
    // Cloudinary unavailable — use bundled manifest
  }

  return galleryFallbackImages
}
