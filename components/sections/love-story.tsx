"use client"

import React from 'react';
import Link from 'next/link';
import { StorySection } from '@/components/StorySection';
import { Cinzel } from "next/font/google";

const cinzel = Cinzel({
  subsets: ["latin"],
  weight: "400",
})

const coupleFont: React.CSSProperties = {
  fontFamily: "'HelloParisSans', serif",
}

const bodyFont: React.CSSProperties = {
  fontFamily: "'SortsMillGoudy', Georgia, serif",
}

// Palette lives in globals.css → @theme inline → --color-motif-*
// Edit there once to update every component.

export function LoveStory() {
  return (
    <div className="min-h-screen bg-motif-cream overflow-x-hidden">


      <div className="text-center z-0 relative px-4 pt-6 sm:pt-8">
        <div className="w-12 sm:w-16 h-[1px] bg-motif-silver mx-auto mb-4 sm:mb-6 opacity-60"></div>
        <h1
           className="leading-none"
           style={{
            fontFamily: "var(--font-cheque), cursive",
             fontSize: "clamp(2.15rem, 9vw, 4.75rem)",
             color: 'var(--color-motif-deep)',
             letterSpacing: "0.04em",
           }}
          >
          A Letter to Our Loved Ones
          </h1>

        <p
          className="text-sm sm:text-lg md:text-xl lg:text-2xl xl:text-3xl tracking-[0.14em] sm:tracking-[0.18em] font-normal leading-snug mb-1 text-black max-w-4xl mx-auto mt-4"
          style={bodyFont}
        >
        With full hearts, we invite you to share in one of the most beautiful and meaningful moments of our lives.
        </p>
      </div>

      <StorySection
        theme="light"
        layout="image-left"
        isFirst={true}
        imageSrc="/mobile-background/couple (2).webp"
        text={
          <>
            <p>
            Our love story has not always been simple, but it has always been real. It has been built through years of friendship, patience, prayers, tears, forgiveness, and choosing each other again and again. As two women who found love in one another, we know that our journey may not be understood by everyone in the same way. But in our hearts, we believe that a love that is honest, faithful, kind, and pure is never something to be ashamed of; it is something to be grateful for.
            </p>
          </>
        }
      />

      <StorySection
        theme="dark"
        layout="image-right"
        imageSrc="/mobile-background/couple (9).webp"
        text={
          <>
            <p>
            We trust in God&apos;s love. A love that does not turn away. A love that listens, heals, forgives, and embraces. A love that teaches us not to judge, but to understand; not to hate, but to show kindness; not to close our hearts, but to make room for grace.
            </p>
          </>
        }
      />

      <StorySection
        theme="light"
        layout="image-left"
        imageSrc="/mobile-background/couple (3).webp"
        text={
          <>
            <p>
            As we begin this new chapter together, we carry with us the hope that our union will be surrounded not by judgment, but by love. Not by fear, but by faith. Not by doubt, but by the quiet belief that God sees our hearts and knows the sincerity of our love.
            </p>
          </>
        }
      />

      <StorySection
        theme="dark"
        layout="image-right"
        imageSrc="/mobile-background/couple (13).webp"
        text={
          <>
            <p>
            To our families and friends, thank you for walking with us in your own way. Thank you for the love you have given, the prayers you have whispered, the forgiveness you have offered, and the moments you have shared with us. Your presence means more than words can ever express.
            </p>
          </>
        }
      />

      <StorySection
        theme="light"
        layout="image-left"
        isLast={true}
        imageSrc="/mobile-background/couple (8).webp"
        text={
          <>
            <p className="mb-4">
            On this day, we do not only celebrate a wedding. We celebrate love that endured, faith that remained, and grace that carried us here.
            </p>
            <p className="mb-4">
            As we say yes to forever, we humbly ask for your blessings, your prayers, and your open hearts as we continue our journey together with God&apos;s love as our guide, forgiveness as our strength, and love as our promise.
            </p>
            <p>
            With all our love and gratitude,<br />
            Jov &amp; Mia
            </p>
          </>
        }
      />
      
      {/* Footer Decoration */}
      <div className="bg-motif-cream pt-8 sm:pt-10 md:pt-12 pb-16 sm:pb-20 md:pb-24 text-center text-motif-deep z-0 relative px-4">
        <div className="w-12 sm:w-16 h-[1px] bg-motif-silver mx-auto mb-4 sm:mb-6 opacity-60"></div>
        <Link 
          href="#guest-list"
          className={`${cinzel.className} group relative inline-flex items-center justify-center px-6 sm:px-8 md:px-10 py-2.5 sm:py-3 md:py-3.5 text-[0.7rem] sm:text-xs md:text-sm tracking-[0.2em] sm:tracking-[0.3em] uppercase font-normal text-motif-cream bg-motif-deep rounded-sm border border-motif-deep transition-all duration-300 hover:bg-motif-accent hover:border-motif-accent hover:text-motif-cream hover:-translate-y-0.5 active:translate-y-0 shadow-sm hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-motif-soft/50 focus-visible:ring-offset-2 focus-visible:ring-offset-motif-cream`}
        >
          <span className="relative z-10">Join us</span>
          {/* Subtle glow effect on hover */}
          <div className="absolute inset-0 rounded-sm bg-motif-soft opacity-0 group-hover:opacity-25 blur-md transition-opacity duration-300 -z-0"></div>
        </Link>
      </div>
    </div>
  );
}
