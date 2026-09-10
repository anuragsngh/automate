"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Appbar } from "@/components/Appbar";
import { Input } from "@/components/Input";
import { PrimaryButton } from "@/components/buttons/PrimaryButton";
import { BACKEND_URL } from "../config";
import { CheckFeature } from "@/components/CheckFeature";
import { AlertCircle } from "lucide-react";

export default function Signup() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await axios.post(`${BACKEND_URL}/api/v1/user/signup`, {
        username: email,
        password,
        name
      });

      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        router.push("/dashboard");
      } else {
        router.push("/login");
      }
    } catch (err: any) {
      console.error(err);
      setError(
        err.response?.data?.message ||
        err.response?.data?.errors?.[0]?.message ||
        "Failed to sign up. Please verify your details."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Appbar />
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="flex flex-col md:flex-row w-full max-w-4xl bg-white rounded-3xl border border-slate-200/80 shadow-xl overflow-hidden">
          {/* Left Brand Feature Column */}
          <div className="md:w-1/2 bg-slate-900 text-white p-8 md:p-12 flex flex-col justify-between">
            <div>
              <div className="inline-block px-3 py-1 bg-orange-500/20 text-[#ff4f00] text-xs font-bold rounded-full mb-6 uppercase tracking-wider">
                Automate Platform
              </div>
              <h2 className="text-3xl font-extrabold tracking-tight mb-4">
                Join thousands automating their work with Automate.
              </h2>
              <p className="text-slate-400 text-sm leading-relaxed mb-8">
                Build flexible workflows that connect your favorite services and execute tasks reliably with Kafka and transactional outboxes.
              </p>
            </div>

            <div className="space-y-3 pt-6 border-t border-slate-800 text-sm">
              <div className="flex items-center space-x-2 text-slate-300">
                <span className="text-[#ff4f00] font-bold">✓</span>
                <span>Fast & easy multi-step automations</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-300">
                <span className="text-[#ff4f00] font-bold">✓</span>
                <span>Robust event queue with zero dropped events</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-300">
                <span className="text-[#ff4f00] font-bold">✓</span>
                <span>Instant webhook trigger URLs</span>
              </div>
            </div>
          </div>

          {/* Right Form Column */}
          <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Create your account</h3>
            <p className="text-sm text-slate-500 mb-6">
              Already have an account?{" "}
              <Link href="/login" className="text-[#ff4f00] font-semibold hover:underline">
                Log in
              </Link>
            </p>

            {error && (
              <div className="flex items-center gap-2 p-3.5 mb-5 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Full Name"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <Input
                label="Email"
                type="email"
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Input
                label="Password"
                type="password"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <div className="pt-2">
                <PrimaryButton
                  type="submit"
                  size="big"
                  disabled={loading}
                  className="w-full font-semibold shadow-md"
                >
                  {loading ? "Creating account..." : "Sign Up Free"}
                </PrimaryButton>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
