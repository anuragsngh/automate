"use client";

import { useRouter } from "next/navigation";
import { PrimaryButton } from "./buttons/PrimaryButton";
import { SecondaryButton } from "./buttons/SecondaryButton";
import { CheckFeature } from "./CheckFeature";
import { ArrowRight, Sparkles } from "lucide-react";

export function Hero() {
  const router = useRouter();

  return (
    <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28">
      {}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-amber-200/40 via-orange-100/30 to-transparent rounded-full blur-3xl -z-10 pointer-events-none" />

      <div className="max-w-5xl mx-auto px-6 text-center">
        {}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-50 border border-orange-200 text-orange-700 text-xs font-semibold uppercase tracking-wider mb-6 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-[#ff4f00]" />
          Next-Gen Event-Driven Automation
        </div>

        {}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.1] mb-6">
          Automate as fast as you can <span className="text-[#ff4f00]">type</span>.
        </h1>

        {}
        <p className="max-w-2xl mx-auto text-lg sm:text-xl text-slate-600 leading-relaxed mb-10">
          AI makes you fast. Automate makes you scalable. Connect your favorite tools, webhooks, and services into bulletproof workflows powered by Apache Kafka.
        </p>

        {}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
          <PrimaryButton
            size="big"
            onClick={() => router.push("/signup")}
            className="w-full sm:w-auto shadow-lg shadow-orange-500/20"
          >
            Get Started Free <ArrowRight className="w-5 h-5 ml-2" />
          </PrimaryButton>
          <SecondaryButton
            size="big"
            onClick={() => router.push("/login")}
            className="w-full sm:w-auto"
          >
            Explore Dashboard
          </SecondaryButton>
        </div>

        {}
        <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-600">
          <CheckFeature title="Free 14-day trial" />
          <CheckFeature title="Transactional Outbox reliability" />
          <CheckFeature title="Kafka event streaming" />
          <CheckFeature title="Dynamic variable templating" />
        </div>
      </div>
    </section>
  );
}
