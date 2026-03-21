"use client";

import { memo } from "react";
import Image from "next/image";
import Link from "next/link";

// Hero image is now passed as a prop
export default function Hero({ heroImageSrc }: { heroImageSrc: string }) {

  const ValuePropsStrip = memo(function ValuePropsStrip() {
    return (
      <div className="relative z-10 border-t border-white/25 bg-black/45 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-8 px-4 py-5 sm:gap-12 sm:py-6">
          <div className="flex items-center gap-3 text-white">
            <span className="text-[var(--gold-soft)]">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </span>
            <span className="text-sm font-semibold uppercase tracking-wider sm:text-base">
              High quality prints
            </span>
          </div>
          <div className="flex items-center gap-3 text-white">
            <span className="text-[var(--gold-soft)]">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </span>
            <span className="text-sm font-semibold uppercase tracking-wider sm:text-base">
              Premium apparel
            </span>
          </div>
          <div className="flex items-center gap-3 text-white">
            <span className="text-[var(--gold-soft)]">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2a1 1 0 011 1v8a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
              </svg>
            </span>
            <span className="text-sm font-semibold uppercase tracking-wider sm:text-base">
              Fast shipping
            </span>
          </div>
        </div>
      </div>
    );
  });

  return (
    <section className="relative flex min-h-[85vh] flex-col overflow-hidden bg-[var(--background)] sm:min-h-[90vh]">
      <div className="absolute inset-0">
        <Image
          src={heroImageSrc}
          alt="Alpine apparel in a premium gym setting"
          fill
          priority
          sizes="100vw"
          quality={95}
          className="object-cover object-top brightness-110 saturate-[1.05]"
        />
        {/* Lighter overlay so the hero photo reads brighter; tweak opacity to taste */}
        <div
          className="absolute inset-0 bg-black/25"
          aria-hidden="true"
        />
      </div>

      <div className="relative z-10 flex flex-1 items-end justify-center pb-8">
        <Link
          href="/new-arrivals"
          className="rounded border border-white/35 bg-black/65 px-8 py-3 text-sm font-semibold uppercase tracking-wider text-white shadow-lg transition hover:bg-black/75 hover:border-white/55"
        >
          Shop Now
        </Link>
      </div>

      <ValuePropsStrip />
    </section >
  );
}
