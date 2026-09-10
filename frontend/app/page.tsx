import { Appbar } from "@/components/Appbar";
import { Hero } from "@/components/Hero";
import { Feature } from "@/components/Feature";
import { Webhook, Mail, Coins, Layers, Zap, ShieldCheck } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Appbar />
      <main className="flex-1">
        <Hero />

        {/* Features section */}
        <section className="max-w-6xl mx-auto px-6 py-16">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-4">
              Everything you need to automate workflows reliably
            </h2>
            <p className="text-slate-600">
              Built on modern distributed architecture using PostgreSQL transactional outbox pattern and Kafka message streaming.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Feature
              title="Instant Webhook Ingestion"
              subtitle="Trigger complex flows instantly from Stripe, GitHub, Shopify, or custom APIs with guaranteed delivery."
              icon={<Webhook className="w-6 h-6" />}
            />
            <Feature
              title="Multi-Step Actions"
              subtitle="Chain multiple actions together in ordered sequence with dynamic variable substitution like {comment.amount}."
              icon={<Layers className="w-6 h-6" />}
            />
            <Feature
              title="Transactional Outbox Pattern"
              subtitle="Zero event loss. Ingestion stores runs atomically with outbox entries, processed asynchronously by Kafka."
              icon={<ShieldCheck className="w-6 h-6" />}
            />
            <Feature
              title="Automated Email Delivery"
              subtitle="Send formatted email notifications with dynamic template resolution to any recipient directly."
              icon={<Mail className="w-6 h-6" />}
            />
            <Feature
              title="Custom API Integrations"
              subtitle="Connect your workflows to custom webhook listeners and external REST API endpoints."
              icon={<Zap className="w-6 h-6" />}
            />
            <Feature
              title="Scalable Kafka Workers"
              subtitle="Horizontal scaling ready. Multiple background workers consume partitions concurrently with offset commits."
              icon={<Zap className="w-6 h-6" />}
            />
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-white py-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 Automate. Distributed workflow automation platform.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-slate-900 transition-colors">Privacy</a>
            <a href="#" className="hover:text-slate-900 transition-colors">Terms</a>
            <a href="#" className="hover:text-slate-900 transition-colors">Documentation</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
