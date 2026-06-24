"use client"

import React from "react"
import { useState, useEffect, useMemo, useRef } from "react"
import { entourage as staticEntourage, principalSponsors as staticSponsors } from "@/content/site"
import { useSiteConfig } from "@/hooks/use-site-config"
import { Loader2, Users } from "lucide-react"
import { Cinzel } from "next/font/google"

const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["400", "600"],
})

interface EntourageMember {
  name: string
  roleCategory: string
  roleTitle: string
  email: string
}

interface PrincipalSponsor {
  malePrincipalSponsor: string
  femalePrincipalSponsor: string
}

/** Accepts PascalCase from API / Sheets or camelCase */
function entourageMemberFromApi(row: Record<string, unknown>): EntourageMember {
  const r = row as Record<string, string | undefined>
  return {
    name: r.name ?? r.Name ?? "",
    roleCategory: r.roleCategory ?? r.RoleCategory ?? "",
    roleTitle: r.roleTitle ?? r.RoleTitle ?? "",
    email: r.email ?? r.Email ?? "",
  }
}

function principalSponsorFromApi(row: Record<string, unknown>): PrincipalSponsor {
  const r = row as Record<string, string | undefined>
  return {
    malePrincipalSponsor: r.malePrincipalSponsor ?? r.MalePrincipalSponsor ?? "",
    femalePrincipalSponsor: r.femalePrincipalSponsor ?? r.FemalePrincipalSponsor ?? "",
  }
}

// Colors sourced from globals.css @theme inline — edit there to update everywhere
const palette = {
  body: "#2a2520",
  heading: "#1a1a1a",
  label: "var(--color-motif-medium)",
  accent: "var(--color-motif-accent)",
  deep: "var(--color-motif-deep)",
  medium: "var(--color-motif-medium)",
  softBrown: "var(--color-motif-medium)",
  background: "var(--color-motif-cream)",
  champagneGold: "var(--color-motif-silver)",
  champagneLight: "var(--color-motif-cream)",
  sage: "var(--color-motif-medium)",
} as const

const bodyFont: React.CSSProperties = {
  fontFamily: "'SortsMillGoudy', Georgia, serif",
}

const nameStyle: React.CSSProperties = {
  fontFamily: "'SortsMillGoudy', Georgia, serif",
  fontSize: "clamp(0.6875rem, 2.55vw, 1.0625rem)",
  lineHeight: 1.3,
}

const ct = {
  label: "text-[11px] sm:text-xs md:text-sm",
  sectionTitle: "text-[10px] sm:text-xs md:text-sm lg:text-base",
  role: "text-[9px] sm:text-[10px] md:text-xs",
  body: "text-xs sm:text-sm md:text-base",
  bodyLg: "text-sm sm:text-base md:text-lg",
} as const

function mapStaticEntourage(): EntourageMember[] {
  const roleToCategory: Record<string, string> = {
    "Best Man": "Best Man",
    "Matron of Honor": "Matron of Honor",
    "Maid of Honor": "Maid of Honor",
    "Bridesmaid": "Bridesmaids",
    "Groomsman": "Groomsmen",
    "Father": "Parents of the Bride",
    "Mother": "Parents of the Bride",
    "Brother": "Parents of the Groom",
    "Flower Girl": "Flower Girls",
    "Little Bride": "Little Bride",
    "Little Groom": "Little Groom",
    "Ring Bearer": "Ring Bearer",
    "Coin Bearer": "Coin Bearer",
    "Bible Bearer": "Bible Bearer",
  }
  return staticEntourage.map(({ role, name, group }) => {
    let category = roleToCategory[role] ?? (role.endsWith("s") ? role : role + "s")
    if (group === "kate-family") category = "Parents of the Bride"
    if (group === "christian-family") category = "Parents of the Groom"
    if (group === "candle") category = "Candle Sponsors"
    if (group === "cord") category = "Cord Sponsors"
    return { name, roleTitle: role, roleCategory: category, email: "" }
  })
}

function mapStaticSponsors(): PrincipalSponsor[] {
  return staticSponsors
    .filter((s) => s.name || s.spouse)
    .map(({ name, spouse }) => ({
      malePrincipalSponsor: name || "",
      femalePrincipalSponsor: spouse || "",
    }))
}

const ROLE_CATEGORY_ORDER = [
  "OFFICIATING MINISTER",
  "The Couple",
  "Parents of the Groom",
  "Parents of the Bride",
  "Family of the Groom",
  "Family of the Bride",
  "Matron of Honor",
  "Best Man",
  "Maid of Honor",
  "Candle Sponsors",
  "Veil Sponsors",
  "Cord Sponsors",
  "Groomsmen",
  "Bridesmaids",
  "Little Groom",
  "Little Bride",
  "Ring Bearer",
  "Bible Bearer",
  "Coin Bearer",
  "Flower Girls",
]

const HIDDEN_ROLE_CATEGORIES = new Set<string>([])

function normalizeRoleCategory(category: string): string {
  const normalized = category.trim()
  if (normalized.toLowerCase() === "officiating minister") {
    return "OFFICIATING MINISTER"
  }
  return normalized
}

/** Title case per word; uses Unicode letters so ñe → Ñe (not ñE from ASCII-only `/\b\w/g`). */
function toTitleCaseDisplayName(name: string): string {
  const lower = name.toLocaleLowerCase("es")
  return lower.replace(
    /(^|[\s'\-])(\p{L})/gu,
    (_, sep: string, letter: string) => sep + letter.toLocaleUpperCase("es")
  )
}

export function Entourage() {
  const siteConfig = useSiteConfig()
  const [entourage, setEntourage] = useState<EntourageMember[]>([])
  const [sponsors, setSponsors] = useState<PrincipalSponsor[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef<HTMLDivElement>(null)

  const fetchEntourage = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/entourage", { cache: "no-store" })
      if (!response.ok) throw new Error("Failed to fetch entourage")
      const data: unknown = await response.json()
      const list =
        Array.isArray(data) && data.length > 0
          ? data.map((row) => entourageMemberFromApi(row as Record<string, unknown>))
          : mapStaticEntourage()
      setEntourage(list)
    } catch (err: unknown) {
      console.error("Failed to load entourage:", err)
      setEntourage(mapStaticEntourage())
      setError(null)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchSponsors = async () => {
    try {
      const res = await fetch("/api/principal-sponsor", { cache: "no-store" })
      if (!res.ok) throw new Error("Failed to load principal sponsors")
      const data: unknown = await res.json()
      const list =
        Array.isArray(data) && data.length > 0
          ? data.map((row) => principalSponsorFromApi(row as Record<string, unknown>)).filter((s) => s.malePrincipalSponsor || s.femalePrincipalSponsor)
          : mapStaticSponsors()
      setSponsors(list)
    } catch (e: unknown) {
      console.error("Failed to load sponsors:", e)
      setSponsors(mapStaticSponsors())
    }
  }

  useEffect(() => {
    fetchEntourage()
    fetchSponsors()

    // Set up auto-refresh listener for dashboard updates
    const handleEntourageUpdate = () => {
      setTimeout(() => {
        fetchEntourage()
        fetchSponsors()
      }, 1000)
    }

    window.addEventListener("entourageUpdated", handleEntourageUpdate)

    return () => {
      window.removeEventListener("entourageUpdated", handleEntourageUpdate)
    }
  }, [])

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current)
      }
    }
  }, [])

  // Group entourage by role category
  const grouped = useMemo(() => {
    const grouped: Record<string, EntourageMember[]> = {}
    
    entourage.forEach((member) => {
      const category = normalizeRoleCategory(member.roleCategory)

      // Skip members without a category or in "Other"
      if (!category || category === "Other") {
        return
      }
      if (!grouped[category]) {
        grouped[category] = []
      }
      grouped[category].push(member)
    })
    
    return grouped
  }, [entourage])

  const hasParents =
    (grouped["Parents of the Groom"]?.length ?? 0) > 0 || (grouped["Parents of the Bride"]?.length ?? 0) > 0

  // Helper component for elegant section titles (category labels)
  const SectionTitle = ({
    children,
    align = "center",
    className = "",
  }: {
    children: React.ReactNode
    align?: "left" | "center" | "right"
    className?: string
  }) => {
    const textAlign =
      align === "right" ? "text-right" : align === "left" ? "text-left" : "text-center"
    return (
      <h3
        className={`relative ${cinzel.className} ${ct.sectionTitle} tracking-[0.1em] sm:tracking-[0.14em] md:tracking-[0.16em] uppercase mb-1.5 sm:mb-2 md:mb-2.5 ${textAlign} ${className} transition-all duration-300 whitespace-nowrap font-semibold leading-tight`}
        style={{ color: palette.accent }}
      >
        {children}
      </h3>
    )
  }

  // Helper component for name items with role title (supports alignment)
  const NameItem = ({
    member,
    align = "center",
    showRole = false,
  }: {
    member: EntourageMember
    align?: "left" | "center" | "right"
    showRole?: boolean
  }) => {
    const containerAlign =
      align === "right" ? "items-end" : align === "left" ? "items-start" : "items-center"
    const textAlign =
      align === "right" ? "text-right" : align === "left" ? "text-left" : "text-center"
    const displayName = toTitleCaseDisplayName(member.name)
    return (
      <div
        className={`relative flex flex-col ${containerAlign} justify-center py-0.5 sm:py-1 min-w-0 w-full max-w-full group/item transition-all duration-300`}
      >
        <div
          className="absolute inset-0 bg-gradient-to-r from-transparent to-transparent opacity-0 group-hover/item:opacity-100 transition-opacity duration-300 rounded-md"
          style={{ background: 'linear-gradient(to right, transparent, color-mix(in srgb, var(--color-motif-silver) 21%, transparent), transparent)' }}
        />
        <p
          className={`relative font-medium ${textAlign} transition-all duration-300 whitespace-nowrap max-w-full overflow-hidden text-ellipsis`}
          style={{ ...nameStyle, color: palette.heading }}
          title={displayName}
        >
          {displayName}
        </p>
        {showRole && member.roleTitle && (
          <p
            className={`relative ${ct.role} font-medium mt-0.5 leading-tight ${textAlign} tracking-wide uppercase transition-colors duration-300 whitespace-nowrap max-w-full overflow-hidden text-ellipsis`}
            style={{ color: palette.label }}
            title={member.roleTitle}
          >
            {member.roleTitle}
          </p>
        )}
      </div>
    )
  }

  // Helper component for two-column layout wrapper
  const TwoColumnLayout = ({ 
    children, 
    leftTitle, 
    rightTitle,
    singleTitle,
    centerContent = false 
  }: { 
    children: React.ReactNode
    leftTitle?: string
    rightTitle?: string
    singleTitle?: string
    centerContent?: boolean
  }) => {
    if (singleTitle) {
      return (
        <div className="mb-2 sm:mb-2.5 md:mb-3">
          <SectionTitle>{singleTitle}</SectionTitle>
          <div className={`grid grid-cols-2 gap-x-1.5 sm:gap-x-3 md:gap-x-5 gap-y-1 sm:gap-y-1.5 ${centerContent ? 'max-w-3xl mx-auto' : ''}`}>
            {children}
          </div>
        </div>
      )
    }

    return (
      <div className="mb-2 sm:mb-2.5 md:mb-3">
        <div className="grid grid-cols-2 gap-x-1.5 sm:gap-x-3 md:gap-x-5 mb-2 sm:mb-2.5 md:mb-3">
          {leftTitle && (
            <SectionTitle align="right" className="pr-0.5 sm:pr-1">{leftTitle}</SectionTitle>
          )}
          {rightTitle && (
            <SectionTitle align="left" className="pl-0.5 sm:pl-1">{rightTitle}</SectionTitle>
          )}
        </div>
        <div className={`grid grid-cols-2 gap-x-1.5 sm:gap-x-3 md:gap-x-5 gap-y-1 sm:gap-y-1.5 ${centerContent ? 'max-w-3xl mx-auto' : ''}`}>
          {children}
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full" style={{ backgroundColor: 'var(--color-motif-cream)' }}>
      {/* Full-bleed layered background — champagne + beige with soft movement */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        {/* Soft diagonal wash */}
        <div
          className="absolute inset-0 opacity-[0.26]"
          style={{
            background: 'linear-gradient(145deg, var(--color-motif-cream) 0%, color-mix(in srgb, var(--color-motif-silver) 14%, transparent) 35%, color-mix(in srgb, var(--color-motif-medium) 6%, transparent) 70%, color-mix(in srgb, var(--color-motif-deep) 3%, transparent) 100%)',
          }}
        />
        {/* Gentle spotlight behind center card */}
        <div
          className="absolute inset-0 opacity-[0.16]"
          style={{
            background: 'radial-gradient(circle at 50% 15%, var(--color-motif-silver) 0%, transparent 58%)',
          }}
        />
        {/* Vertical soft stripes for subtle texture */}
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(90deg, rgba(255,255,255,0.0) 0, rgba(255,255,255,0.0) 32px, rgba(255,255,255,0.24) 33px, rgba(255,255,255,0.24) 34px)",
          }}
        />
      </div>

      <section
        ref={sectionRef}
        id="entourage"
        className="relative z-10 py-10 md:py-14 lg:py-16"
      >
      {/* Corner florals — behind content */}
      <div className="decor-corner decor-top-left decor-visible pointer-events-none absolute left-0 top-0 z-[1]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/decoration/decoration/left-top-decoration.png" alt="" className="block h-auto w-auto max-w-[130px] sm:max-w-[160px] md:max-w-[210px] lg:max-w-[260px]" />
      </div>
      <div className="decor-corner decor-top-right decor-visible pointer-events-none absolute right-0 top-0 z-[1]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/decoration/decoration/right-top-decoration.png" alt="" className="block h-auto w-auto max-w-[130px] sm:max-w-[160px] md:max-w-[210px] lg:max-w-[260px]" />
      </div>
      <div className="decor-corner decor-bottom-left decor-visible pointer-events-none absolute bottom-0 left-0 z-[1]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/decoration/decoration/left-bottom-decoration.png" alt="" className="block h-auto w-auto max-w-[130px] sm:max-w-[160px] md:max-w-[210px] lg:max-w-[260px]" />
      </div>
      <div className="decor-corner decor-bottom-right decor-visible pointer-events-none absolute bottom-0 right-0 z-[1]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/decoration/decoration/right-bottom-decoration.png" alt="" className="block h-auto w-auto max-w-[130px] sm:max-w-[160px] md:max-w-[210px] lg:max-w-[260px]" />
      </div>
      <div className="decor-bottom decor-visible pointer-events-none absolute bottom-0 left-0 right-0 z-[1] md:hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/decoration/decoration/bottom-center-decoration.png" alt="" className="block h-auto w-full" />
      </div>

      {/* Section Header */}
      <div className={`relative z-20 text-center mt-12 sm:mt-16 md:mt-20 lg:mt-24 mb-6 sm:mb-8 md:mb-10 px-6 sm:px-10 md:px-12 transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-10"}`}>
        <p
          className={`${cinzel.className} ${ct.label} uppercase tracking-[0.2em] sm:tracking-[0.24em] mb-2 sm:mb-3`}
          style={{ color: palette.label }}
        >
          With {siteConfig.couple.groomNickname} &amp; {siteConfig.couple.brideNickname}
        </p>

        <h2
          className="leading-none mb-2 sm:mb-3"
          style={{
            fontFamily: "var(--font-brittany), cursive",
            fontSize: "clamp(1.85rem, 8vw, 4.5rem)",
            color: palette.accent,
            letterSpacing: "0.01em",
          }}
        >
          Wedding Entourage
        </h2>

        <p
          className={`${ct.bodyLg} max-w-xl mx-auto leading-relaxed italic`}
          style={{ ...bodyFont, color: palette.body }}
        >
          Honoring those who stand with us on our special day
        </p>

        <div className="flex items-center justify-center gap-2 mt-3 sm:mt-4">
          <span className="h-px w-10 sm:w-16 md:w-20 bg-motif-accent/40" />
          <span className="w-1.5 h-1.5 rounded-full bg-motif-accent" />
          <span className="h-px w-10 sm:w-16 md:w-20 bg-motif-accent/40" />
        </div>
      </div>

      {/* Central Card Container */}
      <div
        className={`relative z-20 max-w-5xl mx-auto px-6 sm:px-10 md:px-12 my-6 sm:my-8 md:my-10 mb-12 sm:mb-16 md:mb-20 transition-all duration-1000 delay-300 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}
      >
        <div
          className="relative z-20 backdrop-blur-xl rounded-xl sm:rounded-2xl overflow-hidden shadow-lg transition-all duration-500 group border border-white/50"
          style={{
            backgroundColor: "color-mix(in srgb, var(--color-motif-cream) 68%, transparent)",
            boxShadow:
              "0 18px 40px color-mix(in srgb, var(--color-motif-deep) 10%, transparent), inset 0 1px 0 color-mix(in srgb, white 60%, transparent)",
          }}
        >
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/25 via-transparent to-motif-accent/[0.04]"
            aria-hidden
          />
          {/* Card content */}
          <div className="relative p-4 sm:p-5 md:p-6 z-20">
            {isLoading ? (
              <div className="flex items-center justify-center py-24 sm:py-28 md:py-32">
                <div className="flex flex-col items-center gap-4">
                  <Loader2 className="h-10 w-10 sm:h-12 sm:w-12 animate-spin opacity-70" style={{ color: palette.accent }} />
                  <span className={ct.body} style={{ ...bodyFont, color: palette.body }}>Loading entourage...</span>
                </div>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center py-24 sm:py-28 md:py-32">
                <div className="text-center">
                  <p className={`${ct.bodyLg} mb-3`} style={{ ...bodyFont, color: palette.body }}>{error}</p>
                  <button
                    onClick={fetchEntourage}
                    className={`${cinzel.className} ${ct.body} underline transition-colors duration-200 hover:opacity-80`}
                    style={{ color: palette.accent }}
                  >
                    Try again
                  </button>
                </div>
              </div>
            ) : entourage.length === 0 ? (
              <div className="text-center py-24 sm:py-28 md:py-32">
                <Users className="h-14 w-14 sm:h-16 sm:w-16 mx-auto mb-4 opacity-30" style={{ color: palette.accent }} />
                <p className={ct.bodyLg} style={{ ...bodyFont, color: palette.body }}>No entourage members yet</p>
              </div>
            ) : (
            <>
              {ROLE_CATEGORY_ORDER.map((category, categoryIndex) => {
                const members = grouped[category] || []
                
                if (members.length === 0) return null
                if (HIDDEN_ROLE_CATEGORIES.has(category)) return null

                // Render OFFICIATING MINISTER directly above Principal Sponsors (in Parents block)
                if (category === "OFFICIATING MINISTER" && hasParents) return null

                // Special handling for The Couple - display Bride and Groom side by side
                if (category === "The Couple") {
                   const groom = members.find(m => m.roleTitle?.toLowerCase().includes('groom'))
                  const bride = members.find(m => m.roleTitle?.toLowerCase().includes('bride'))
                  
                  return (
                    <div key={category}>
                      {categoryIndex > 0 && (
                        <div className="flex justify-center py-2 sm:py-2.5 md:py-3 mb-2 sm:mb-2.5 md:mb-3">
                          <div className="w-full max-w-md h-px" style={{ background: 'linear-gradient(to right, transparent, color-mix(in srgb, var(--color-motif-medium) 31%, transparent), transparent)' }}></div>
                        </div>
                      )}
                      <TwoColumnLayout singleTitle="The Couple" centerContent={true}>
                        <div className="px-0.5 sm:px-1 md:px-1.5 min-w-0 overflow-hidden">
                          {groom && <NameItem member={groom} align="right" />}
                        </div>
                        <div className="px-0.5 sm:px-1 md:px-1.5 min-w-0 overflow-hidden">
                          {bride && <NameItem member={bride} align="left" />}
                        </div>
                      </TwoColumnLayout>
                    </div>
                  )
                }

                // Special handling for Parents sections - combine into single two-column layout
                if (category === "Parents of the Bride" || category === "Parents of the Groom") {
                  // Get both parent groups
                  const parentsBride = grouped["Parents of the Bride"] || []
                  const parentsGroom = grouped["Parents of the Groom"] || []
                  
                  // Helper function to sort parents: father first, then mother
                  const sortParents = (members: EntourageMember[]) => {
                    return [...members].sort((a, b) => {
                      const aIsFather = a.roleTitle?.toLowerCase().includes('father') ?? false
                      const bIsFather = b.roleTitle?.toLowerCase().includes('father') ?? false
                      
                      // Father comes first
                      if (aIsFather && !bIsFather) return -1
                      if (!aIsFather && bIsFather) return 1
                      return 0
                    })
                  }
                  
                  // Only render once (when processing "Parents of the Groom")
                  if (category === "Parents of the Groom") {
                    return (
                      <div key="Parents">
                        {categoryIndex > 0 && (
                          <div className="flex justify-center py-2 sm:py-2.5 md:py-3 mb-2 sm:mb-2.5 md:mb-3">
                            <div className="w-full max-w-md h-px" style={{ background: 'linear-gradient(to right, transparent, color-mix(in srgb, var(--color-motif-medium) 31%, transparent), transparent)' }}></div>
                          </div>
                        )}
                        <TwoColumnLayout leftTitle="Groom’s Parents" rightTitle="Bride’s Parents">
                          {(() => {
                            const leftArr = sortParents(parentsGroom)
                            const rightArr = sortParents(parentsBride)
                            const maxLen = Math.max(leftArr.length, rightArr.length)
                            const rows = []
                            for (let i = 0; i < maxLen; i++) {
                              const left = leftArr[i]
                              const right = rightArr[i]
                              rows.push(
                                <React.Fragment key={`parents-row-${i}`}>
                                  <div key={`parent-groom-${i}`} className="px-0.5 sm:px-1 md:px-1.5 min-w-0 overflow-hidden">
                                    {left ? <NameItem member={left} align="right" /> : <div className="py-0.5" />}
                                  </div>
                                  <div key={`parent-bride-${i}`} className="px-0.5 sm:px-1 md:px-1.5 min-w-0 overflow-hidden">
                                    {right ? <NameItem member={right} align="left" /> : <div className="py-0.5" />}
                                  </div>
                                </React.Fragment>
                              )
                            }
                            return rows
                          })()}
                        </TwoColumnLayout>
                        
                        {/* Officiating Minister section - displayed above Principal Sponsors */}
                        {(() => {
                          const officiating = grouped["OFFICIATING MINISTER"] || []
                          if (officiating.length === 0) return null
                          return (
                            <div key="OfficiatingMinisterBeforeSponsors" className="mt-4 sm:mt-5 md:mt-6">
                              <TwoColumnLayout singleTitle="OFFICIATING MINISTER" centerContent={true}>
                                {officiating.map((member, idx) => (
                                  <div
                                    key={`officiating-${idx}-${member.name}`}
                                    className="col-span-2 flex justify-center min-w-0 overflow-hidden px-0.5 sm:px-1"
                                  >
                                    <NameItem member={member} align="center" showRole={false} />
                                  </div>
                                ))}
                              </TwoColumnLayout>
                            </div>
                          )
                        })()}

                        {/* Principal Sponsors section - displayed after Parents */}
                        {sponsors.length > 0 && (
                          <div key="SponsorsAfterParents">
                            <div className="flex justify-center py-1.5 sm:py-2 md:py-2.5 mb-2 sm:mb-2.5 md:mb-3">
                            </div>
                            <TwoColumnLayout singleTitle="Principal Sponsors" centerContent={true}>
                              {sponsors.map((sponsor, idx) => (
                                <React.Fragment key={`sponsor-row-${idx}`}>
                                  <div key={`sponsor-male-${idx}`} className="px-0.5 sm:px-1 md:px-1.5 min-w-0 overflow-hidden">
                                    {sponsor.malePrincipalSponsor ? (
                                      <NameItem 
                                        member={{
                                          name: sponsor.malePrincipalSponsor,
                                          roleCategory: "",
                                          roleTitle: "",
                                          email: ""
                                        }} 
                                        align="right" 
                                        showRole={false}
                                      />
                                    ) : (
                                      <div className="py-0.5 sm:py-1 md:py-1.5" />
                                    )}
                                  </div>
                                  <div key={`sponsor-female-${idx}`} className="px-0.5 sm:px-1 md:px-1.5 min-w-0 overflow-hidden">
                                    {sponsor.femalePrincipalSponsor ? (
                                      <NameItem 
                                        member={{
                                          name: sponsor.femalePrincipalSponsor,
                                          roleCategory: "",
                                          roleTitle: "",
                                          email: ""
                                        }} 
                                        align="left" 
                                        showRole={false}
                                      />
                                    ) : (
                                      <div className="py-0.5 sm:py-1 md:py-1.5" />
                                    )}
                                  </div>
                                </React.Fragment>
                              ))}
                            </TwoColumnLayout>
                          </div>
                        )}
                      </div>
                    )
                  }
                  // Skip rendering for "Parents of the Bride" since it's already rendered above
                  return null
                }

                // Special handling for Family of the Groom/Bride - combine into single two-column layout
                if (category === "Family of the Groom" || category === "Family of the Bride") {
                  const familyGroom = grouped["Family of the Groom"] || []
                  const familyBride = grouped["Family of the Bride"] || []

                  if (category === "Family of the Groom") {
                    return (
                      <div key="Family">
                        {categoryIndex > 0 && (
                          <div className="flex justify-center py-2 sm:py-2.5 md:py-3 mb-2 sm:mb-2.5 md:mb-3">
                            <div className="w-full max-w-md h-px" style={{ background: 'linear-gradient(to right, transparent, color-mix(in srgb, var(--color-motif-medium) 31%, transparent), transparent)' }}></div>
                          </div>
                        )}
                        <TwoColumnLayout leftTitle="Family of the Groom" rightTitle="Family of the Bride">
                          {(() => {
                            const maxLen = Math.max(familyGroom.length, familyBride.length)
                            const rows = []
                            for (let i = 0; i < maxLen; i++) {
                              const left = familyGroom[i]
                              const right = familyBride[i]
                              rows.push(
                                <React.Fragment key={`family-row-${i}`}>
                                  <div key={`family-groom-${i}`} className="px-0.5 sm:px-1 md:px-1.5 min-w-0 overflow-hidden">
                                    {left ? <NameItem member={left} align="right" /> : <div className="py-0.5" />}
                                  </div>
                                  <div key={`family-bride-${i}`} className="px-0.5 sm:px-1 md:px-1.5 min-w-0 overflow-hidden">
                                    {right ? <NameItem member={right} align="left" /> : <div className="py-0.5" />}
                                  </div>
                                </React.Fragment>
                              )
                            }
                            return rows
                          })()}
                        </TwoColumnLayout>
                      </div>
                    )
                  }

                  return null
                }

                // Special handling for Maid/Matron of Honor and Best Man - combine into single two-column layout
                if (category === "Matron of Honor" || category === "Maid of Honor" || category === "Best Man") {
                  // Get both honor attendant groups - combine Maid and Matron of Honor
                  const maidOfHonor = [...(grouped["Maid of Honor"] || []), ...(grouped["Matron of Honor"] || [])]
                  const bestMan = grouped["Best Man"] || []
                  
                  // Only render once (when processing "Best Man")
                  if (category === "Best Man") {
                    return (
                      <div key="HonorAttendants">
                        {categoryIndex > 0 && (
                          <div className="flex justify-center py-2 sm:py-2.5 md:py-3 mb-2 sm:mb-2.5 md:mb-3">
                            <div className="w-full max-w-md h-px" style={{ background: 'linear-gradient(to right, transparent, color-mix(in srgb, var(--color-motif-medium) 31%, transparent), transparent)' }}></div>
                          </div>
                        )}
                        <TwoColumnLayout leftTitle="Best Men" rightTitle="Matron of Honor ">
                          {(() => {
                            const maxLen = Math.max(bestMan.length, maidOfHonor.length)
                            const rows = []
                            for (let i = 0; i < maxLen; i++) {
                              const left = bestMan[i]
                              const right = maidOfHonor[i]
                              rows.push(
                                <React.Fragment key={`honor-row-${i}`}>
                                  <div key={`maid-cell-${i}`} className="px-0.5 sm:px-1 md:px-1.5 min-w-0 overflow-hidden">
                                    {left ? <NameItem member={left} align="right" /> : <div className="py-0.5" />}
                                  </div>
                                  <div key={`bestman-cell-${i}`} className="px-0.5 sm:px-1 md:px-1.5 min-w-0 overflow-hidden">
                                    {right ? <NameItem member={right} align="left" /> : <div className="py-0.5" />}
                                  </div>
                                </React.Fragment>
                              )
                            }
                            return rows
                          })()}
                        </TwoColumnLayout>
                      </div>
                    )
                  }
                  // Skip rendering for "Matron of Honor" and "Maid of Honor" since they're already rendered above
                  return null
                }

                // Special handling for Little Groom and Little Bride - combine into single two-column layout
                if (category === "Little Groom" || category === "Little Bride") {
                  // Get both little ones groups
                  const littleGroom = grouped["Little Groom"] || []
                  const littleBride = grouped["Little Bride"] || []
                  
                  // Only render once (when processing "Little Groom")
                  if (category === "Little Groom") {
                    return (
                      <div key="LittleOnes">
                        {categoryIndex > 0 && (
                          <div className="flex justify-center py-2 sm:py-2.5 md:py-3 mb-2 sm:mb-2.5 md:mb-3">
                            <div className="w-full max-w-md h-px" style={{ background: 'linear-gradient(to right, transparent, color-mix(in srgb, var(--color-motif-medium) 31%, transparent), transparent)' }}></div>
                          </div>
                        )}
                        <TwoColumnLayout leftTitle="Little Groom" rightTitle="Little Bride">
                          {(() => {
                            const maxLen = Math.max(littleGroom.length, littleBride.length)
                            const rows = []
                            for (let i = 0; i < maxLen; i++) {
                              const left = littleGroom[i]
                              const right = littleBride[i]
                              rows.push(
                                <React.Fragment key={`little-row-${i}`}>
                                  <div key={`littlegroom-cell-${i}`} className="px-0.5 sm:px-1 md:px-1.5 min-w-0 overflow-hidden">
                                    {left ? <NameItem member={left} align="right" /> : <div className="py-0.5" />}
                                  </div>
                                  <div key={`littlebride-cell-${i}`} className="px-0.5 sm:px-1 md:px-1.5 min-w-0 overflow-hidden">
                                    {right ? <NameItem member={right} align="left" /> : <div className="py-0.5" />}
                                  </div>
                                </React.Fragment>
                              )
                            }
                            return rows
                          })()}
                        </TwoColumnLayout>
                      </div>
                    )
                  }
                  // Skip rendering for "Little Bride" since it's already rendered above
                  return null
                }

                // Special handling for Bridesmaids and Groomsmen - combine into single two-column layout
                if (category === "Bridesmaids" || category === "Groomsmen") {
                  // Get both bridal party groups
                  const bridesmaids = grouped["Bridesmaids"] || []
                  const groomsmen = grouped["Groomsmen"] || []
                  
                  // Only render once (when processing "Bridesmaids")
                  if (category === "Bridesmaids") {
                    return (
                      <React.Fragment key="BridalPartySection">
                        {/* Groomsmen/Bridesmaids section */}
                        <div key="BridalParty">
                          {categoryIndex > 0 && (
                            <div className="flex justify-center py-2 sm:py-2.5 md:py-3 mb-2 sm:mb-2.5 md:mb-3">
                              <div className="w-full max-w-md h-px" style={{ background: 'linear-gradient(to right, transparent, color-mix(in srgb, var(--color-motif-medium) 31%, transparent), transparent)' }}></div>
                            </div>
                          )}
                          <TwoColumnLayout leftTitle="Groomsmen" rightTitle="Bridesmaids">
                            {(() => {
                              const maxLen = Math.max(bridesmaids.length, groomsmen.length)
                              const rows = []
                              for (let i = 0; i < maxLen; i++) {
                                const groomsman = groomsmen[i]
                                const bridesmaid = bridesmaids[i]
                                rows.push(
                                  <React.Fragment key={`bridal-row-${i}`}>
                                    <div key={`groomsman-cell-${i}`} className="px-0.5 sm:px-1 md:px-1.5 min-w-0 overflow-hidden">
                                      {groomsman ? <NameItem member={groomsman} align="right" /> : <div className="py-0.5 sm:py-1 md:py-1.5" />}
                                    </div>
                                    <div key={`bridesmaid-cell-${i}`} className="px-0.5 sm:px-1 md:px-1.5 min-w-0 overflow-hidden">
                                      {bridesmaid ? <NameItem member={bridesmaid} align="left" /> : <div className="py-0.5 sm:py-1 md:py-1.5" />}
                                    </div>
                                  </React.Fragment>
                                )
                              }
                              return rows
                            })()}
                          </TwoColumnLayout>
                        </div>
                      </React.Fragment>
                    )
                  }
                  // Skip rendering for "Groomsmen" since it's already rendered above
                  return null
                }

                // Secondary Sponsors block: render all three groups under one heading
                if (category === "Candle Sponsors" || category === "Veil Sponsors" || category === "Cord Sponsors") {
                  // Only render the full block once — when processing the first one that exists in order
                  const secondarySponsorGroups = ["Candle Sponsors", "Veil Sponsors", "Cord Sponsors"] as const
                  const firstPresentGroup = secondarySponsorGroups.find((g) => (grouped[g]?.length ?? 0) > 0)
                  if (category !== firstPresentGroup) return null

                  const renderPairedGroup = (groupName: string) => {
                    const grpMembers = grouped[groupName] || []
                    if (grpMembers.length === 0) return null
                    return (
                      <div key={groupName} className="mb-2 sm:mb-2.5 md:mb-3">
                        <TwoColumnLayout singleTitle={groupName} centerContent={true}>
                          {grpMembers.length === 2 ? (
                            <>
                              <div className="px-0.5 sm:px-1 md:px-1.5 min-w-0 overflow-hidden">
                                <NameItem member={grpMembers[0]} align="right" />
                              </div>
                              <div className="px-0.5 sm:px-1 md:px-1.5 min-w-0 overflow-hidden">
                                <NameItem member={grpMembers[1]} align="left" />
                              </div>
                            </>
                          ) : (
                            <div className="col-span-full">
                              <div className="max-w-sm mx-auto flex flex-col items-center gap-0.5 sm:gap-1 md:gap-1">
                                {grpMembers.map((member, idx) => (
                                  <NameItem key={`${groupName}-${idx}-${member.name}`} member={member} align="center" />
                                ))}
                              </div>
                            </div>
                          )}
                        </TwoColumnLayout>
                      </div>
                    )
                  }

                  return (
                    <div key="SecondarySponsorBlock">
                      {categoryIndex > 0 && (
                        <div className="flex justify-center py-2 sm:py-2.5 md:py-3 mb-2 sm:mb-2.5 md:mb-3">
                          <div className="w-full max-w-md h-px" style={{ background: 'linear-gradient(to right, transparent, color-mix(in srgb, var(--color-motif-medium) 31%, transparent), transparent)' }}></div>
                        </div>
                      )}
                      {/* Parent heading */}
                      <div className="mb-2 sm:mb-2.5 md:mb-3">
                        <SectionTitle>Secondary Sponsors</SectionTitle>
                      </div>
                      {secondarySponsorGroups.map(renderPairedGroup)}
                    </div>
                  )
                }

                // Default: single title, centered content
                return (
                  <div key={category}>
                    {categoryIndex > 0 && (
                      <div className="flex justify-center py-2 sm:py-2.5 md:py-3 mb-2 sm:mb-2.5 md:mb-3">
                        <div className="w-full max-w-md h-px" style={{ background: 'linear-gradient(to right, transparent, color-mix(in srgb, var(--color-motif-medium) 31%, transparent), transparent)' }}></div>
                      </div>
                    )}
                    <TwoColumnLayout singleTitle={category} centerContent={true}>
                      {(() => {
                        const SINGLE_COLUMN_SECTIONS = new Set([
                          "Best Man",
                          "Maid of Honor",
                          "Ring Bearer",
                          "Coin Bearer",
                          "Bible Bearer",
                          "Flower Girls",
                          "Presider",
                        ])
                        // Special rule: paired sponsor roles with exactly 2 names should meet at center
                        const PAIRED_SECTIONS = new Set(["Candle Sponsors", "Cord Sponsors", "Veil Sponsors"])
                        if (PAIRED_SECTIONS.has(category) && members.length === 2) {
                          const left = members[0]
                          const right = members[1]
                          return (
                            <>
                              <div className="px-0.5 sm:px-1 md:px-1.5 min-w-0 overflow-hidden">
                                <NameItem member={left} align="right" />
                              </div>
                              <div className="px-0.5 sm:px-1 md:px-1.5 min-w-0 overflow-hidden">
                                <NameItem member={right} align="left" />
                              </div>
                            </>
                          )
                        }
                        if (SINGLE_COLUMN_SECTIONS.has(category) || members.length <= 2) {
                          return (
                            <div className="col-span-full">
                              <div className="max-w-sm mx-auto flex flex-col items-center gap-1 sm:gap-1.5 md:gap-2">
                                {members.map((member, idx) => (
                                  <NameItem key={`${category}-${idx}-${member.name}`} member={member} align="center" />
                                ))}
                              </div>
                            </div>
                          )
                        }
                        // Default two-column sections: render row-by-row pairs to keep alignment on small screens
                        const half = Math.ceil(members.length / 2)
                        const left = members.slice(0, half)
                        const right = members.slice(half)
                        const maxLen = Math.max(left.length, right.length)
                        const rows = []
                        for (let i = 0; i < maxLen; i++) {
                          const l = left[i]
                          const r = right[i]
                          rows.push(
                            <React.Fragment key={`${category}-row-${i}`}>
                              <div key={`${category}-cell-left-${i}`} className="px-0.5 sm:px-1 md:px-1.5 min-w-0 overflow-hidden">
                                {l ? <NameItem member={l} align="right" /> : <div className="py-0.5 sm:py-1 md:py-1.5" />}
                              </div>
                              <div key={`${category}-cell-right-${i}`} className="px-0.5 sm:px-1 md:px-1.5 min-w-0 overflow-hidden">
                                {r ? <NameItem member={r} align="left" /> : <div className="py-0.5 sm:py-1 md:py-1.5" />}
                              </div>
                            </React.Fragment>
                          )
                        }
                        return rows
                      })()}
                    </TwoColumnLayout>
                  </div>
                )
              })}
              
              {/* Display any other categories not in the ordered list */}
              {Object.keys(grouped).filter(cat => !ROLE_CATEGORY_ORDER.includes(cat) && cat !== "Other").map((category) => {
                const members = grouped[category]
                return (
                  <div key={category}>
                    <div className="flex justify-center py-3 sm:py-4 md:py-5 mb-5 sm:mb-6 md:mb-8">

                    </div>
                    <TwoColumnLayout singleTitle={category} centerContent={true}>
                      {(() => {
                        if (members.length <= 2) {
                          return (
                            <div className="col-span-full">
                              <div className="max-w-sm mx-auto flex flex-col items-center gap-1 sm:gap-1.5 md:gap-2">
                                {members.map((member, idx) => (
                                  <NameItem key={`${category}-${idx}-${member.name}`} member={member} align="center" />
                                ))}
                              </div>
                            </div>
                          )
                        }
                        // Pair row-by-row for other categories as well
                        const half = Math.ceil(members.length / 2)
                        const left = members.slice(0, half)
                        const right = members.slice(half)
                        const maxLen = Math.max(left.length, right.length)
                        const rows = []
                        for (let i = 0; i < maxLen; i++) {
                          const l = left[i]
                          const r = right[i]
                          rows.push(
                            <React.Fragment key={`${category}-row-${i}`}>
                              <div key={`${category}-cell-left-${i}`} className="px-0.5 sm:px-1 md:px-1.5 min-w-0 overflow-hidden">
                                {l ? <NameItem member={l} align="right" /> : <div className="py-0.5 sm:py-1 md:py-1.5" />}
                              </div>
                              <div key={`${category}-cell-right-${i}`} className="px-0.5 sm:px-1 md:px-1.5 min-w-0 overflow-hidden">
                                {r ? <NameItem member={r} align="left" /> : <div className="py-0.5 sm:py-1 md:py-1.5" />}
                              </div>
                            </React.Fragment>
                          )
                        }
                        return rows
                      })()}
                    </TwoColumnLayout>
                  </div>
                )
              })}
            </>
            )}
          </div>
        </div>
      </div>
      </section>
    </div>
  )
}