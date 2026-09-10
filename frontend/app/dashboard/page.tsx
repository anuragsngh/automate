"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { Appbar } from "@/components/Appbar";
import { PrimaryButton } from "@/components/buttons/PrimaryButton";
import { BACKEND_URL, HOOKS_URL } from "../config";
import {
  Copy,
  Check,
  Plus,
  ArrowRight,
  Trash2,
  Play,
  Zap as ZapIcon,
  ExternalLink,
  Layers,
  Calendar,
  Sparkles
} from "lucide-react";

interface Action {
  id: string;
  actionId: string;
  sortingOrder: number;
  type: {
    id: string;
    name: string;
    image: string;
  };
}

interface Trigger {
  id: string;
  triggerId: string;
  metadata?: Record<string, any>;
  type: {
    id: string;
    name: string;
    image: string;
  };
}

interface ZapRun {
  id: string;
  createdAt: string;
}

interface Zap {
  id: string;
  triggerId: string;
  userId: number;
  createdAt: string;
  actions: Action[];
  trigger: Trigger;
  zapRuns: ZapRun[];
}

export default function Dashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [zaps, setZaps] = useState<Zap[]>([]);
  const [userId, setUserId] = useState<number | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [triggeringId, setTriggeringId] = useState<string | null>(null);
  const [triggerSuccessId, setTriggerSuccessId] = useState<string | null>(null);

  const fetchZaps = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const [userRes, zapRes] = await Promise.all([
        axios.get(`${BACKEND_URL}/api/v1/user`, {
          headers: { Authorization: token }
        }),
        axios.get(`${BACKEND_URL}/api/v1/zap`, {
          headers: { Authorization: token }
        })
      ]);

      if (userRes.data?.user?.id) {
        setUserId(userRes.data.user.id);
      }
      setZaps(zapRes.data.zaps || []);
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchZaps();
  }, []);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleTriggerNow = async (zapId: string) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    setTriggeringId(zapId);
    try {
      await axios.post(
        `${BACKEND_URL}/api/v1/zap/${zapId}/trigger`,
        {},
        { headers: { Authorization: token } }
      );
      setTriggerSuccessId(zapId);
      setTimeout(() => setTriggerSuccessId(null), 3000);
      fetchZaps();
    } catch (err: any) {
      console.error("Failed to trigger Zap:", err);
      alert(err.response?.data?.message || "Failed to trigger workflow");
    } finally {
      setTriggeringId(null);
    }
  };

  const handleDelete = async (zapId: string) => {
    if (!confirm("Are you sure you want to delete this Automation?")) return;
    const token = localStorage.getItem("token");

    try {
      await axios.delete(`${BACKEND_URL}/api/v1/zap/${zapId}`, {
        headers: { Authorization: token }
      });
      setZaps((prev) => prev.filter((z) => z.id !== zapId));
    } catch (err) {
      console.error("Failed to delete Automation:", err);
      alert("Failed to delete Automation");
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Appbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-10">
        {}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-8 border-b border-slate-200">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
              My Automations
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Manage your automated workflows, Google Calendar recurring triggers, and monitor executions.
            </p>
          </div>
          <PrimaryButton
            size="normal"
            onClick={() => router.push("/zap/create")}
            className="flex items-center gap-2 shadow-sm font-semibold"
          >
            <Plus className="w-4 h-4" /> Create Automation
          </PrimaryButton>
        </div>

        {}
        {loading ? (
          <div className="flex items-center justify-center py-24 text-slate-500">
            <div className="w-8 h-8 border-4 border-[#ff4f00] border-t-transparent rounded-full animate-spin mr-3"></div>
            Loading your Automations...
          </div>
        ) : zaps.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-3xl border border-dashed border-slate-300 mt-8 p-8">
            <div className="w-16 h-16 rounded-2xl bg-orange-50 flex items-center justify-center text-[#ff4f00] mb-4">
              <Layers className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No Automations created yet</h3>
            <p className="text-sm text-slate-500 max-w-sm mb-6">
              Connect Google Calendar recurring events with AI Agent researchers and email digests in minutes.
            </p>
            <PrimaryButton onClick={() => router.push("/zap/create")}>
              Create your first Automation
            </PrimaryButton>
          </div>
        ) : (
          <div className="mt-8 space-y-4">
            {zaps.map((zap) => {
              const webhookUrl = `${HOOKS_URL}/hooks/catch/${userId || 1}/${zap.id}`;
              const formattedDate = new Date(zap.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric"
              });

              const isCalendarTrigger =
                zap.trigger?.type?.id === "google-calendar" ||
                zap.trigger?.triggerId === "google-calendar";

              return (
                <div
                  key={zap.id}
                  className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-all flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6"
                >
                  {}
                  <div className="flex items-center space-x-3">
                    {}
                    <div
                      className={`flex items-center p-2 rounded-xl border ${
                        isCalendarTrigger
                          ? "bg-blue-50 border-blue-200"
                          : "bg-amber-50 border-amber-200"
                      }`}
                      title={`Trigger: ${zap.trigger?.type?.name || "Webhook"}`}
                    >
                      <img
                        src={
                          zap.trigger?.type?.image ||
                          "https://cdn.iconscout.com/icon/free/png-512/free-webhook-icon-download-in-svg-png-gif-file-formats--api-code-technology-webhooks-web-development-pack-icons-5015609.png"
                        }
                        alt="Trigger"
                        className="w-7 h-7 object-contain rounded-md"
                      />
                    </div>

                    <ArrowRight className="w-4 h-4 text-slate-300 shrink-0" />

                    {}
                    <div className="flex items-center space-x-2">
                      {zap.actions.map((act, idx) => (
                        <div key={act.id} className="flex items-center space-x-2">
                          <div
                            className="flex items-center p-2 rounded-xl bg-slate-50 border border-slate-200"
                            title={`Action ${idx + 1}: ${act.type?.name}`}
                          >
                            <img
                              src={act.type?.image}
                              alt={act.type?.name}
                              className="w-7 h-7 object-contain rounded-md"
                            />
                          </div>
                          {idx < zap.actions.length - 1 && (
                            <ArrowRight className="w-3 h-3 text-slate-300 shrink-0" />
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="ml-2 hidden sm:block">
                      <div className="font-semibold text-slate-900 text-sm">
                        {zap.trigger?.type?.name || "Webhook"} →{" "}
                        {zap.actions.map((a) => a.type?.name).join(" → ")}
                      </div>
                      <div className="text-xs text-slate-400">Created on {formattedDate}</div>
                    </div>
                  </div>

                  {}
                  <div className="flex items-center flex-wrap gap-2 w-full lg:w-auto">
                    {isCalendarTrigger ? (
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-200 text-blue-800 rounded-xl text-xs font-semibold">
                          <Calendar className="w-3.5 h-3.5 text-blue-600" />
                          <span>Recurring: Sunday</span>
                        </div>
                        <button
                          onClick={() => handleTriggerNow(zap.id)}
                          disabled={triggeringId === zap.id}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 hover:bg-[#ff4f00] text-[#ff4f00] hover:text-white border border-orange-200 hover:border-[#ff4f00] rounded-xl text-xs font-semibold transition-all shadow-xs"
                          title="Simulate / Trigger Calendar Event Now"
                        >
                          {triggeringId === zap.id ? (
                            <>
                              <div className="w-3 h-3 border-2 border-[#ff4f00] border-t-transparent rounded-full animate-spin" />
                              Triggering...
                            </>
                          ) : triggerSuccessId === zap.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-green-600" />
                              Triggered!
                            </>
                          ) : (
                            <>
                              <Play className="w-3.5 h-3.5" />
                              Run Trigger Now
                            </>
                          )}
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center w-full lg:w-auto bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 gap-2 max-w-md">
                        <span className="text-xs font-mono text-slate-600 truncate flex-1 select-all">
                          {webhookUrl}
                        </span>
                        <button
                          onClick={() => copyToClipboard(webhookUrl, zap.id)}
                          className="p-1.5 text-slate-500 hover:text-[#ff4f00] hover:bg-white rounded-lg transition-colors"
                          title="Copy Webhook URL"
                        >
                          {copiedId === zap.id ? (
                            <Check className="w-4 h-4 text-green-600" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    )}
                  </div>

                  {}
                  <div className="flex items-center space-x-2 w-full lg:w-auto justify-end">
                    <Link
                      href={`/zap/${zap.id}`}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold transition-colors"
                    >
                      Inspect <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                    <button
                      onClick={() => handleDelete(zap.id)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                      title="Delete Automation"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
