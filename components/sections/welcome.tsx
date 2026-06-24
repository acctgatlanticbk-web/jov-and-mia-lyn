"use client"

import { useSiteConfig } from "@/hooks/use-site-config"
import { Cormorant_Garamond, Cinzel } from "next/font/google"

// Palette lives in globals.css → @theme inline → --color-motif-*
const palette = {
  deep: "var(--color-motif-deep)",
  medium: "var(--color-motif-medium)",
  accent: "var(--color-motif-accent)",
  silver: "var(--color-motif-silver)",
  body: "color-mix(in srgb, var(--color-motif-medium) 28%, #2a2520)",
} as const

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
})

const cinzel = Cinzel({
  subsets: ["latin"],
  weight: "400",
})

export function Welcome() {
  const siteConfig = useSiteConfig()
  const brideName = siteConfig.couple.brideNickname || siteConfig.couple.bride
  const groomName = siteConfig.couple.groomNickname || siteConfig.couple.groom

  return (
    <section
      id="welcome"
      className="relative overflow-hidden pt-12 pb-4 sm:pt-16 sm:pb-6 md:pt-20 md:pb-8"
    >
      <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 md:px-8">
        <div className="relative overflow-hidden rounded-2xl border border-motif-silver/50 bg-motif-cream px-4 py-6 shadow-[0_16px_60px_color-mix(in_srgb,var(--color-motif-deep)_10%,transparent)] sm:rounded-3xl sm:px-5 sm:py-8 md:rounded-[2rem] md:px-8 md:py-10 lg:px-10 lg:py-12">
          <div className="relative space-y-4 text-center sm:space-y-6 md:space-y-7 lg:space-y-8">
            <div className="space-y-1 sm:space-y-1.5 md:space-y-2.5">
              <p
                className={`${cormorant.className} text-xs uppercase tracking-[0.24em] sm:text-sm sm:tracking-[0.28em] md:text-base`}
                style={{ color: palette.medium }}
              >
                {siteConfig.couple.groomNickname} &amp; {siteConfig.couple.brideNickname}
              </p>
              <h2
                className="leading-none"
                style={{
                  fontFamily: "var(--font-brittany), cursive",
                  fontSize: "clamp(2rem, 9vw, 4.5rem)",
                  color: palette.deep,
                  letterSpacing: "0.01em",
                }}
              >
                Welcome to our forever
              </h2>

              <div className="space-y-0.5 sm:space-y-1">
                <p
                  className={`${cormorant.className} text-sm italic leading-relaxed sm:text-base md:text-lg`}
                  style={{ color: palette.body }}
                >
                  &quot;I have found the one whom my soul loves.&quot;
                </p>
                <p
                  className={`${cormorant.className} text-sm italic leading-relaxed sm:text-base md:text-lg`}
                  style={{ color: palette.medium }}
                >
                  Song of Solomon 3:4
                </p>
              </div>

              <div className="flex items-center justify-center gap-2 pt-1">
                <span className="h-px w-10 bg-motif-silver sm:w-16 md:w-20" />
                <span className="h-1.5 w-1.5 rounded-full bg-motif-accent" />
                <span className="h-px w-10 bg-motif-silver sm:w-16 md:w-20" />
              </div>
            </div>

            <div
              className={`${cormorant.className} space-y-3 text-sm leading-relaxed sm:space-y-4 sm:text-base sm:leading-7 md:space-y-5 md:text-lg md:leading-8`}
              style={{ color: palette.body }}
            >
              With joyful hearts, we invite you to celebrate this beautiful beginning with us.
Together with our families, we welcome you to share in our wedding day.
Please continue below for our letter to our loved ones, event details, and RSVP information.

              <div className="space-y-5 pt-3 sm:space-y-6 sm:pt-4 md:space-y-7 md:pt-5">
                {/* <div className="flex items-center justify-center gap-2">
                  <span className="h-px w-10 bg-motif-silver sm:w-16 md:w-20" />
                  <span className="h-1.5 w-1.5 rounded-full bg-motif-accent" />
                  <span className="h-px w-10 bg-motif-silver sm:w-16 md:w-20" />
                </div> */}

                {/* <div className="mx-auto max-w-md rounded-xl border border-motif-silver/60 bg-white/80 px-4 py-4 sm:rounded-2xl sm:px-6 sm:py-5">
                  <p
                    className={`${cormorant.className} mb-2 text-xs uppercase tracking-[0.22em] sm:mb-2.5 sm:text-sm sm:tracking-[0.26em]`}
                    style={{ color: palette.medium }}
                  >
                    Share in our joy
                  </p>
                  <p
                    className="mb-3 text-sm leading-relaxed sm:mb-3.5 sm:text-base md:text-lg"
                    style={{ color: palette.body }}
                  >
                    As you celebrate with us, please use our official hashtag when posting your photos
                    and memories.
                  </p>
                  <p
                    className={`${cinzel.className} text-base tracking-[0.06em] sm:text-lg sm:tracking-[0.08em] md:text-xl`}
                    style={{ color: palette.deep }}
                  >
                    {siteConfig.snapShare.hashtag.join(" ")}
                  </p>
                </div> */}

                <div className="space-y-1.5 pt-1 sm:space-y-2">
                  {/* <p
                    className={`${cormorant.className} text-sm italic sm:text-base md:text-lg`}
                    style={{ color: palette.medium }}
                  >
                    With all our love,
                  </p> */}
                  {/* <p
                    className={`${cinzel.className} text-xl tracking-[0.1em] sm:text-2xl sm:tracking-[0.14em] md:text-3xl`}
                    style={{ color: palette.deep }}
                  >
                    {groomName} &amp; {brideName}
                  </p> */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
