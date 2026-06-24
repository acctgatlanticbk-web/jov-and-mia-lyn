"use client"

import { useEffect, useState, useMemo, type CSSProperties } from "react"
import { siteConfig as defaultSiteConfig } from "@/content/site"
import { useSiteConfig } from "@/hooks/use-site-config"
import { parseWeddingDate } from "@/lib/wedding-date"

// Palette lives in globals.css → @theme inline → --color-motif-*
const TEXT = "var(--color-motif-medium)"
const TEXT_DEEP = "var(--color-motif-medium)"
const ACCENT = "var(--color-motif-accent)"
const PALETTE = {
  cream: "var(--color-motif-cream)",
  silver: "var(--color-motif-silver)",
  soft: "var(--color-motif-soft)",
  accent: "var(--color-motif-accent)",
  deep: "var(--color-motif-deep)",
  yellow: "var(--color-motif-yellow)",
  medium: "var(--color-motif-medium)",
} as const
const PALETTE_COLORS = [
  PALETTE.cream,
  PALETTE.silver,
  PALETTE.soft,
  PALETTE.accent,
  PALETTE.yellow,
  PALETTE.medium,
] as const

const HERO_BACKGROUND = `linear-gradient(
  165deg,
  var(--color-motif-cream) 0%,
  color-mix(in srgb, var(--color-motif-cream) 88%, white) 22%,
  #FFFFFF 48%,
  color-mix(in srgb, var(--color-motif-soft) 16%, transparent) 74%,
  color-mix(in srgb, var(--color-motif-yellow) 12%, transparent) 100%
)`

const BLANK_HOLD_MS = 800
const CONTENT_DELAY_MS = 1700

const smg: CSSProperties = {
  fontFamily: "'SortsMillGoudy', Georgia, serif",
  fontStyle: "normal",
}
const hps: CSSProperties = {
  fontFamily: "'HelloParisSans', serif",
}

const coupleNameFont: React.CSSProperties = {
  fontFamily: 'var(--font-cheque), serif',
};

interface AmbientOrb {
  id: number
  x: number
  y: number
  size: number
  color: string
  opacity: number
  duration: number
  delay: number
  driftX: number
  driftY: number
}

interface SparkParticle {
  id: number
  x: number
  y: number
  size: number
  color: string
  opacity: number
  duration: number
  delay: number
  driftX: number
  driftY: number
  twinkleDuration: number
}

function createAmbientOrbs(count: number): AmbientOrb[] {
  return Array.from({ length: count }, (_, id) => ({
    id,
    x: 4 + Math.random() * 92,
    y: 6 + Math.random() * 88,
    size: 60 + Math.random() * 100,
    color: PALETTE_COLORS[Math.floor(Math.random() * PALETTE_COLORS.length)],
    opacity: 0.06 + Math.random() * 0.09,
    duration: 16 + Math.random() * 14,
    delay: Math.random() * 6,
    driftX: -14 + Math.random() * 28,
    driftY: -12 + Math.random() * 24,
  }))
}

function createSparkParticles(count: number): SparkParticle[] {
  return Array.from({ length: count }, (_, id) => ({
    id,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 1.5 + Math.random() * 3,
    color: PALETTE_COLORS[Math.floor(Math.random() * PALETTE_COLORS.length)],
    opacity: 0.18 + Math.random() * 0.22,
    duration: 12 + Math.random() * 16,
    delay: Math.random() * 10,
    driftX: -10 + Math.random() * 20,
    driftY: -12 + Math.random() * 24,
    twinkleDuration: 3 + Math.random() * 4,
  }))
}

function DottedRule({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={
        compact
          ? "w-[3.25rem] border-t border-dotted md:w-[4rem]"
          : "flex-1 border-t border-dotted"
      }
      style={{ borderColor: TEXT_DEEP }}
    />
  )
}

interface HeroProps {
  visible?: boolean
}

export function Hero({ visible = false }: HeroProps) {
  const siteConfig = useSiteConfig()
  const [decorVisible, setDecorVisible] = useState(false)
  const [contentVisible, setContentVisible] = useState(false)

  useEffect(() => {
    if (!visible) {
      setDecorVisible(false)
      setContentVisible(false)
      return
    }

    const decorTimer = setTimeout(() => setDecorVisible(true), BLANK_HOLD_MS)
    const showTimer = setTimeout(() => setContentVisible(true), CONTENT_DELAY_MS)
    return () => {
      clearTimeout(decorTimer)
      clearTimeout(showTimer)
    }
  }, [visible])

  const fade = (delay: number): CSSProperties => ({
    transition: `opacity 0.85s ease ${delay}ms, transform 0.85s ease ${delay}ms`,
    opacity: contentVisible ? 1 : 0,
    transform: contentVisible ? "translateY(0)" : "translateY(16px)",
  })

  const groomNickname = siteConfig.couple.groomNickname || siteConfig.couple.groom
  const brideNickname = siteConfig.couple.brideNickname || siteConfig.couple.bride

  const ceremonyDate =
    siteConfig.ceremony.date ?? siteConfig.wedding.date ?? defaultSiteConfig.ceremony.date
  const parsedDate = useMemo(
    () =>
      parseWeddingDate(ceremonyDate, parseWeddingDate(defaultSiteConfig.ceremony.date)),
    [ceremonyDate],
  )
  const ceremonyDay = (
    siteConfig.ceremony.day ?? parsedDate.dayOfWeek ?? defaultSiteConfig.ceremony.day
  ).toUpperCase()
  const ceremonyTime =
    siteConfig.ceremony.time ??
    siteConfig.wedding.time ??
    defaultSiteConfig.ceremony.time
  const { month, day: dateNum, year } = parsedDate
  const ambientOrbs = useMemo(() => createAmbientOrbs(5), [])
  const sparkParticles = useMemo(() => createSparkParticles(16), [])

  return (
    <section
      id="home"
      className="relative isolate min-h-screen flex items-center justify-center overflow-hidden"
      style={{ background: "var(--color-motif-cream)" }}
    >
      {/* Solid base — guarantees zero transparency even during animations */}
      <div className="hero-base pointer-events-none absolute inset-0 z-0" aria-hidden />
      <div className="hero-wash pointer-events-none absolute inset-0 z-0" aria-hidden />

      {/* Ambient color wash + floating particles (layered on opaque base) */}
      <div className="particle-field particle-field-visible pointer-events-none absolute inset-0 z-[1]" aria-hidden>
        <div className="particle-gradient" />
        {ambientOrbs.map((orb) => (
          <span
            key={`orb-${orb.id}`}
            className="particle-orb"
            style={{
              left: `${orb.x}%`,
              top: `${orb.y}%`,
              width: orb.size,
              height: orb.size,
              backgroundColor: orb.color,
              opacity: orb.opacity,
              animationDuration: `${orb.duration}s`,
              animationDelay: `${orb.delay}s`,
              ["--drift-x" as string]: `${orb.driftX}px`,
              ["--drift-y" as string]: `${orb.driftY}px`,
            }}
          />
        ))}
        {sparkParticles.map((particle) => (
          <span
            key={`spark-${particle.id}`}
            className="particle-spark"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: particle.size,
              height: particle.size,
              backgroundColor: particle.color,
              color: particle.color,
              opacity: particle.opacity,
              animationDuration: `${particle.duration}s, ${particle.twinkleDuration}s`,
              animationDelay: `${particle.delay}s, ${particle.delay * 0.4}s`,
              ["--drift-x" as string]: `${particle.driftX}px`,
              ["--drift-y" as string]: `${particle.driftY}px`,
            }}
          />
        ))}
      </div>

      {/* Corner florals */}
      <div
        className={`decor-corner decor-top-left pointer-events-none absolute left-0 top-0 z-[2]${decorVisible ? " decor-visible" : ""}`}
        style={decorVisible ? undefined : { opacity: 0, visibility: "hidden" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/decoration/decoration/left-top-decoration.png" alt="" className="block h-auto w-auto max-w-[130px] sm:max-w-[160px] md:max-w-[210px] lg:max-w-[260px]" />
      </div>

      <div
        className={`decor-corner decor-top-right pointer-events-none absolute right-0 top-0 z-[2]${decorVisible ? " decor-visible" : ""}`}
        style={decorVisible ? undefined : { opacity: 0, visibility: "hidden" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/decoration/decoration/right-top-decoration.png" alt="" className="block h-auto w-auto max-w-[130px] sm:max-w-[160px] md:max-w-[210px] lg:max-w-[260px]" />
      </div>

      <div
        className={`decor-corner decor-bottom-left pointer-events-none absolute bottom-0 left-0 z-[2]${decorVisible ? " decor-visible" : ""}`}
        style={decorVisible ? undefined : { opacity: 0, visibility: "hidden" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/decoration/decoration/left-bottom-decoration.png" alt="" className="block h-auto w-auto max-w-[130px] sm:max-w-[160px] md:max-w-[210px] lg:max-w-[260px]" />
      </div>

      <div
        className={`decor-corner decor-bottom-right pointer-events-none absolute bottom-0 right-0 z-[2]${decorVisible ? " decor-visible" : ""}`}
        style={decorVisible ? undefined : { opacity: 0, visibility: "hidden" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/decoration/decoration/right-bottom-decoration.png" alt="" className="block h-auto w-auto max-w-[130px] sm:max-w-[160px] md:max-w-[210px] lg:max-w-[260px]" />
      </div>

      {/* Bottom-center floral — mobile only */}
      <div
        className={`decor-bottom pointer-events-none absolute bottom-0 left-0 right-0 z-[3] md:hidden${decorVisible ? " decor-visible" : ""}`}
        style={decorVisible ? undefined : { opacity: 0, visibility: "hidden" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/decoration/decoration/bottom-center-decoration.png" alt="" className="block h-auto w-full" />
      </div>

      <div className="relative z-10 w-full container mx-auto px-5 sm:px-8 md:px-12 lg:px-16 flex flex-col items-center justify-center min-h-screen pt-20 sm:pt-24 pb-12 sm:pb-16">
        <div
          className="w-full max-w-[310px] md:max-w-[520px] flex flex-col items-center text-center"
          style={{
            color: TEXT,
            WebkitFontSmoothing: "antialiased",
            visibility: contentVisible ? "visible" : "hidden",
          }}
        >
          {/* SAVE THE DATE — arch */}
          <div style={{ ...fade(0) }} className="mb-1 w-full">
            <div className="-translate-y-2 md:-translate-y-3">
            <svg
              viewBox="0 0 300 100"
              className="mx-auto h-[66px] w-full md:hidden"
              aria-hidden
              overflow="visible"
            >
              <defs>
                <path id="heroArcMob" d="M 6 80 A 178 178 0 0 1 294 80" fill="none" />
              </defs>
              <text fill={TEXT_DEEP} style={{ ...smg, fontSize: "24px", letterSpacing: "0.32em" }}>
                <textPath href="#heroArcMob" startOffset="50%" textAnchor="middle">
                  SAVE THE DATE
                </textPath>
              </text>
            </svg>

            <svg
              viewBox="0 0 480 130"
              className="mx-auto hidden h-[90px] w-full md:block"
              aria-hidden
              overflow="visible"
            >
              <defs>
                <path id="heroArcDsk" d="M 10 104 A 280 280 0 0 1 470 104" fill="none" />
              </defs>
              <text fill={TEXT_DEEP} style={{ ...smg, fontSize: "36px", letterSpacing: "0.3em" }}>
                <textPath href="#heroArcDsk" startOffset="50%" textAnchor="middle">
                  SAVE THE DATE
                </textPath>
              </text>
            </svg>
            </div>
          </div>

          {/* Invitation copy */}
          <div style={{ ...fade(100) }} className="mt-2 flex w-full flex-col items-center gap-2 md:mt-3 md:gap-2.5">
            <div className="flex w-full max-w-[280px] items-center justify-center gap-2 md:max-w-[320px]">
              <DottedRule compact />
              <p
                className="shrink-0 text-[10px] tracking-[0.32em] uppercase md:text-[12px]"
                style={{ ...smg, color: TEXT, opacity: 0.88 }}
              >
                With joy in our hearts
              </p>
              <DottedRule compact />
            </div>
            <p
              className="max-w-[280px] text-[13px] leading-[1.55] md:max-w-none md:text-[17px] md:leading-[1.6]"
              style={{ ...smg, color: TEXT, fontStyle: "italic" }}
            >
              we invite you to witness
              <br className="md:hidden" />
              {" "}the wedding of
            </p>
          </div>

          {/* Groom name */}
          <div style={{ ...fade(220) }} className="mt-4 w-full md:mt-5">
          <h1
            className="w-full leading-none"
            style={{
              ...hps,
              fontSize: "clamp(52px, 14vw, 72px)",
              color: ACCENT,
              fontWeight: 400,
              letterSpacing: "0.04em",
              textTransform: "capitalize",
              ...coupleNameFont,
            }}
          >
            {groomNickname}
          </h1>
          </div>

          {/* and */}
          <div
            style={{ ...fade(320) }}
            className="my-2 flex w-full items-center justify-center gap-2 md:my-3"
          >
            <DottedRule compact />
            <span className="shrink-0 text-[13px] md:text-[16px]" style={{ ...smg, color: TEXT }}>
              and
            </span>
            <DottedRule compact />
          </div>

          {/* Bride name */}
          <div style={{ ...fade(420) }} className="w-full">
          <h1
            className="w-full leading-none"
            style={{
              ...hps,
              fontSize: "clamp(52px, 14vw, 72px)",
              color: ACCENT,
              fontWeight: 400,
              letterSpacing: "0.04em",
              textTransform: "capitalize",
              ...coupleNameFont,
            }}
          >
            {brideNickname}
          </h1>
          </div>

          {/* Together with their families */}
          <div style={{ ...fade(520) }} className="mt-4 w-full md:mt-5">
          <p
            className="w-full text-[12px] leading-[1.65] md:text-[14px] md:leading-[1.75]"
            style={{ ...smg, color: TEXT }}
          >
            Together with their families
            <br />
            invite you to their wedding celebration
          </p>
          </div>

          {/* Date block */}
          <div style={{ ...fade(620) }} className="mt-4 w-full md:mt-5">
            <div
              className="mx-auto grid w-full max-w-[260px] gap-y-0 md:max-w-[340px]"
              style={{
                gridTemplateColumns: "1fr auto 1fr",
                gridTemplateRows: "auto auto auto",
              }}
            >
              <div
                className="col-start-2 row-start-1 border-x border-t border-dotted px-1.5 pb-0 pt-0.5 text-center md:px-2"
                style={{ borderColor: TEXT_DEEP }}
              >
                <span
                  className="text-[10px] font-bold tracking-[0.18em] uppercase md:text-[12px]"
                  style={{ ...smg, color: TEXT }}
                >
                  {month}
                </span>
              </div>

              <div className="col-start-1 row-start-2 flex flex-col justify-center gap-[2px] px-0.5 md:px-1">
                <div className="border-t border-dotted" style={{ borderColor: TEXT_DEEP }} />
                <span
                  className="text-center text-[10px] tracking-[0.14em] uppercase md:text-[12px]"
                  style={{ ...smg, color: TEXT }}
                >
                  {ceremonyDay}
                </span>
                <div className="border-t border-dotted" style={{ borderColor: TEXT_DEEP }} />
              </div>

              <div
                className="col-start-2 row-start-2 flex items-center justify-center border-x border-dotted px-1 pb-0 pt-0 md:px-1.5"
                style={{ borderColor: TEXT_DEEP }}
              >
                <span
                  className="leading-[0.85]"
                  style={{
                    ...hps,
                    fontSize: "clamp(52px, 14vw, 68px)",
                    color: ACCENT,
                  }}
                >
                  {dateNum}
                </span>
              </div>

              <div className="col-start-3 row-start-2 flex flex-col justify-center gap-[2px] px-0.5 md:px-1">
                <div className="border-t border-dotted" style={{ borderColor: TEXT_DEEP }} />
                <span
                  className="whitespace-nowrap text-center text-[10px] tracking-[0.12em] uppercase md:text-[12px]"
                  style={{ ...smg, color: TEXT }}
                >
                  At {ceremonyTime}
                </span>
                <div className="border-t border-dotted" style={{ borderColor: TEXT_DEEP }} />
              </div>

              <div
                className="col-start-2 row-start-3 border-x border-b border-dotted px-1.5 pb-0.5 pt-0 text-center md:px-2"
                style={{ borderColor: TEXT_DEEP }}
              >
                <span
                  className="text-[14px] font-bold leading-none tracking-[0.12em] md:text-[18px]"
                  style={{ ...smg, color: TEXT_DEEP, fontWeight: 700 }}
                >
                  {year}
                </span>
              </div>
            </div>
          </div>

          {/* at / venue */}
          <div style={{ ...fade(720) }} className="mt-4 flex w-full flex-col items-center md:mt-5">
            <div className="flex items-center justify-center gap-1.5 md:gap-2">
              <DottedRule compact />
              <span className="text-[13px] md:text-[15px]" style={{ ...smg, color: TEXT }}>
                at
              </span>
              <DottedRule compact />
            </div>
            <p
              className="mt-2 text-[13px] leading-snug md:mt-2.5 md:text-[15px]"
              style={{ ...smg, color: TEXT }}
            >
              {siteConfig.ceremony.location}
            </p>
          </div>

          {/* Call-to-action */}
          <div style={{ ...fade(840) }} className="mt-7 flex w-full flex-col items-center gap-3 sm:gap-4 px-2 sm:px-4 md:mt-8">
            <p
              className="text-[12px] leading-relaxed md:text-[14px]"
              style={{ ...smg, color: TEXT }}
            >
              Your presence, prayers, and love will mean the world to us.
            </p>

            <a
              href="#guest-list"
              className="group relative w-full sm:min-w-[200px] md:min-w-[220px] rounded-lg overflow-hidden transition-all duration-300 hover:-translate-y-1 focus-visible:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-motif-accent/50"
              style={{
                backgroundColor: ACCENT,
                boxShadow:
                  "0 10px 24px color-mix(in srgb, var(--color-motif-accent) 28%, transparent)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "var(--color-motif-deep)"
                e.currentTarget.style.boxShadow =
                  "0 12px 28px color-mix(in srgb, var(--color-motif-accent) 35%, transparent)"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = ACCENT
                e.currentTarget.style.boxShadow =
                  "0 10px 24px color-mix(in srgb, var(--color-motif-accent) 28%, transparent)"
              }}
            >
              <span
                className="relative z-10 inline-flex h-full min-h-[3rem] sm:min-h-[3.25rem] w-full items-center justify-center px-6 sm:px-8 text-[0.65rem] sm:text-[0.7rem] md:text-xs uppercase tracking-[0.28em] sm:tracking-[0.32em] font-semibold transition-all duration-300"
                style={{ ...smg, fontWeight: 600, color: "#FFFFFF" }}
              >
                Confirm Attendance
              </span>
            </a>
          </div>
        </div>
      </div>

      <style jsx>{`
        .hero-base {
          background: ${HERO_BACKGROUND};
        }

        .hero-wash {
          background:
            radial-gradient(
              ellipse 120% 80% at 50% 0%,
              #FFFFFF 0%,
              color-mix(in srgb, var(--color-motif-cream) 92%, white) 55%,
              var(--color-motif-cream) 100%
            ),
            linear-gradient(
              180deg,
              var(--color-motif-cream) 0%,
              color-mix(in srgb, var(--color-motif-silver) 35%, var(--color-motif-cream)) 100%
            );
        }

        .decor-corner,
        .decor-bottom {
          opacity: 0;
          will-change: transform, opacity;
        }

        .decor-top-left {
          transform: translate(-12%, -12%);
          transition:
            opacity 1.35s cubic-bezier(0.16, 1, 0.3, 1) 0.06s,
            transform 1.65s cubic-bezier(0.16, 1, 0.3, 1) 0.06s;
        }

        .decor-top-right {
          transform: translate(12%, -12%);
          transition:
            opacity 1.35s cubic-bezier(0.16, 1, 0.3, 1) 0.14s,
            transform 1.65s cubic-bezier(0.16, 1, 0.3, 1) 0.14s;
        }

        .decor-bottom-left {
          transform: translate(-12%, 12%);
          transition:
            opacity 1.35s cubic-bezier(0.16, 1, 0.3, 1) 0.22s,
            transform 1.65s cubic-bezier(0.16, 1, 0.3, 1) 0.22s;
        }

        .decor-bottom-right {
          transform: translate(12%, 12%);
          transition:
            opacity 1.35s cubic-bezier(0.16, 1, 0.3, 1) 0.30s,
            transform 1.65s cubic-bezier(0.16, 1, 0.3, 1) 0.30s;
        }

        .decor-bottom {
          transform: translateY(28%);
          transition:
            opacity 1.2s cubic-bezier(0.16, 1, 0.3, 1) 0.38s,
            transform 1.55s cubic-bezier(0.16, 1, 0.3, 1) 0.38s;
        }

        .decor-corner.decor-visible,
        .decor-bottom.decor-visible {
          opacity: 1;
          transform: translate(0, 0);
        }

        .particle-field {
          animation: particleFieldIntro 1.1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .particle-field-visible {
          opacity: 1;
        }

        @keyframes particleFieldIntro {
          0% {
            opacity: 0.92;
          }
          100% {
            opacity: 1;
          }
        }

        .particle-gradient {
          position: absolute;
          inset: -20%;
          background:
            radial-gradient(circle at 14% 18%, color-mix(in srgb, var(--color-motif-yellow) 14%, transparent) 0%, transparent 40%),
            radial-gradient(circle at 86% 14%, color-mix(in srgb, var(--color-motif-soft) 18%, transparent) 0%, transparent 38%),
            radial-gradient(circle at 78% 82%, color-mix(in srgb, var(--color-motif-accent) 14%, transparent) 0%, transparent 42%),
            radial-gradient(circle at 20% 78%, color-mix(in srgb, var(--color-motif-silver) 20%, transparent) 0%, transparent 38%),
            radial-gradient(circle at 50% 50%, color-mix(in srgb, var(--color-motif-cream) 22%, transparent) 0%, transparent 52%);
          animation: gradientBreath 22s ease-in-out infinite alternate;
        }

        .particle-orb,
        .particle-spark {
          position: absolute;
          border-radius: 9999px;
          will-change: transform, opacity;
          animation-name: particleDrift;
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
          animation-direction: alternate;
        }

        .particle-orb {
          filter: blur(38px);
          transform: translate3d(-50%, -50%, 0);
        }

        .particle-spark {
          transform: translate3d(-50%, -50%, 0);
          box-shadow: 0 0 6px color-mix(in srgb, currentColor 35%, transparent);
          animation-name: particleDrift, particleTwinkleOpacity;
        }

        @keyframes particleTwinkleOpacity {
          0%, 100% {
            opacity: 0.12;
          }
          50% {
            opacity: 0.45;
          }
        }

        @keyframes gradientBreath {
          0% {
            transform: scale(1) translate3d(0, 0, 0);
          }
          100% {
            transform: scale(1.05) translate3d(0, -1%, 0);
          }
        }

        @keyframes particleDrift {
          0% {
            transform: translate3d(calc(-50% + 0px), calc(-50% + 0px), 0);
          }
          100% {
            transform: translate3d(
              calc(-50% + var(--drift-x, 12px)),
              calc(-50% + var(--drift-y, -18px)),
              0
            );
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .particle-field {
            animation: none !important;
            opacity: 1;
          }

          .particle-gradient,
          .particle-orb,
          .particle-spark {
            animation: none !important;
          }
        }
      `}</style>
    </section>
  )
}
