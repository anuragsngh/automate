"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { Appbar } from "@/components/Appbar";
import { PrimaryButton } from "@/components/buttons/PrimaryButton";
import { SecondaryButton } from "@/components/buttons/SecondaryButton";
import { BACKEND_URL, HOOKS_URL } from "../../config";
import {
  Copy,
  Check,
  ArrowLeft,
  Play,
  ArrowRight,
  Clock,
  Code2,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

interface Action {
  id: string;
  actionId: string;
  sortingOrder: number;
  metadata: any;
  type: {
    id: string;
    name: string;
    image: string;
  };
}

interface Trigger {
  id: string;
  triggerId: string;
  metadata: any;
  type: {
    id: string;
    name: string;
    image: string;
  };
}

interface ZapRun {
  id: string;
  createdAt: string;
  metadata: any;
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

export default function ZapDetail() {
  const router = useRouter();
  const params = useParams();
  const zapId = params.zapId as string;

  const [loading, setLoading] = useState(true);
  const [zap, setZap] = useState<Zap | null>(null);
  const [copied, setCopied] = useState(false);
  const [testPayload, setTestPayload] = useState(
    JSON.stringify(
      {
        comment: {
          email: "user@example.com",
          amount: "100",
          message: "Welcome to automated workflows!"
        }
      },
      null,
      2
    )
  );
  const [testStatus, setTestStatus] = useState<string | null>(null);
  const [isSendingTest, setIsSendingTest] = useState(false);

  const fetchZap = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const res = await axios.get(`${BACKEND_URL}/api/v1/zap/${zapId}`, {
        headers: { Authorization: token }
      });
      setZap(res.data.zap);
    } catch (err) {
      console.error("Error fetching zap:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (zapId) {
      fetchZap();
    }
  }, [zapId]);

  const webhookUrl = zap
    ? `${HOOKS_URL}/hooks/catch/${zap.userId}/${zap.id}`
    : "";

  const copyWebhook = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const sendTestWebhook = async () => {
    setIsSendingTest(true);
    setTestStatus(null);

    try {
      let parsedBody = {};
      try {
        parsedBody = JSON.parse(testPayload);
      } catch (e) {
        alert("Invalid JSON in test payload.");
        setIsSendingTest(false);
        return;
      }

      await axios.post(webhookUrl, parsedBody);
      setTestStatus("success");
      // Refresh zap details after short delay
      setTimeout(() => fetchZap(), 1500);
    } catch (err: any) {
      console.error("Error triggering test webhook:", err);
      setTestStatus("error");
    } finally {
      setIsSendingTest(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Appbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-10">
        {/* Back Link */}
        <button
          onClick={() => router.push("/dashboard")}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>

        {loading ? (
          <div className="flex items-center justify-center py-24 text-slate-500">
            <div className="w-8 h-8 border-4 border-[#ff4f00] border-t-transparent rounded-full animate-spin mr-3"></div>
            Loading Automation details...
          </div>
        ) : !zap ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 p-8">
            <h3 className="text-xl font-bold text-slate-900 mb-2">Automation not found</h3>
            <p className="text-sm text-slate-500 mb-6">
              The Automation you requested does not exist or you do not have permission to view it.
            </p>
            <PrimaryButton onClick={() => router.push("/dashboard")}>
              Return to Dashboard
            </PrimaryButton>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Top Overview Card */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-200">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#ff4f00]">
                    Automation Workflow
                  </span>
                  <h1 className="text-2xl font-extrabold text-slate-900 mt-1">
                    {zap.trigger?.type?.name || "Webhook"} Pipeline
                  </h1>
                  <p className="text-xs text-slate-500 mt-1 font-mono">ID: {zap.id}</p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 gap-2">
                    <span className="text-xs font-mono text-slate-700 truncate max-w-[280px]">
                      {webhookUrl}
                    </span>
                    <button
                      onClick={copyWebhook}
                      className="text-slate-500 hover:text-[#ff4f00] transition-colors p-1"
                      title="Copy Webhook URL"
                    >
                      {copied ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Workflow Pipeline Visual */}
              <div className="pt-6">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">
                  Execution Sequence
                </h4>
                <div className="flex flex-wrap items-center gap-3">
                  {/* Trigger Node */}
                  <div className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-2xl">
                    <img
                      src={zap.trigger?.type?.image}
                      alt="Trigger"
                      className="w-8 h-8 object-contain rounded-lg"
                    />
                    <div>
                      <div className="text-xs font-bold text-amber-900">1. Trigger</div>
                      <div className="text-sm font-semibold text-slate-800">
                        {zap.trigger?.type?.name}
                      </div>
                    </div>
                  </div>

                  {zap.actions.map((action, idx) => (
                    <div key={action.id} className="flex items-center gap-3">
                      <ArrowRight className="w-5 h-5 text-slate-400" />
                      <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-2xl">
                        <img
                          src={action.type?.image}
                          alt={action.type?.name}
                          className="w-8 h-8 object-contain rounded-lg"
                        />
                        <div>
                          <div className="text-xs font-bold text-slate-500">
                            {idx + 2}. Action
                          </div>
                          <div className="text-sm font-semibold text-slate-800">
                            {action.type?.name}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Test Trigger & Run Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Test Webhook Card */}
              <div className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Code2 className="w-5 h-5 text-[#ff4f00]" />
                    <h3 className="text-lg font-bold text-slate-900">
                      Test Trigger Webhook
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 mb-4">
                    Send a test POST request to your Automation webhook URL with sample metadata to trigger the workflow.
                  </p>

                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                    JSON Payload
                  </label>
                  <textarea
                    rows={8}
                    value={testPayload}
                    onChange={(e) => setTestPayload(e.target.value)}
                    className="w-full font-mono text-xs p-3.5 bg-slate-900 text-green-400 rounded-xl border border-slate-800 focus:outline-none focus:ring-2 focus:ring-[#ff4f00] shadow-inner"
                  />
                </div>

                <div className="mt-6 flex items-center justify-between">
                  <PrimaryButton
                    onClick={sendTestWebhook}
                    disabled={isSendingTest}
                    className="flex items-center gap-2"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    {isSendingTest ? "Sending..." : "Send Test Webhook"}
                  </PrimaryButton>

                  {testStatus === "success" && (
                    <div className="flex items-center gap-1.5 text-xs text-green-600 font-semibold">
                      <CheckCircle2 className="w-4 h-4" /> Webhook sent!
                    </div>
                  )}
                  {testStatus === "error" && (
                    <div className="flex items-center gap-1.5 text-xs text-red-600 font-semibold">
                      <AlertCircle className="w-4 h-4" /> Failed to trigger
                    </div>
                  )}
                </div>
              </div>

              {/* Execution History */}
              <div className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-5 h-5 text-slate-700" />
                  <h3 className="text-lg font-bold text-slate-900">
                    Recent Execution Runs ({zap.zapRuns?.length || 0})
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mb-4">
                  History of incoming events and executions processed by Outbox and Kafka.
                </p>

                {zap.zapRuns?.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 text-xs border border-dashed border-slate-200 rounded-2xl">
                    No runs recorded yet. Use the test trigger to run this workflow.
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                    {zap.zapRuns.map((run) => (
                      <div
                        key={run.id}
                        className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-slate-600 font-semibold">
                            Run ID: {run.id.slice(0, 8)}...
                          </span>
                          <span className="text-slate-400">
                            {new Date(run.createdAt).toLocaleTimeString()} •{" "}
                            {new Date(run.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="bg-white p-2 rounded-lg border border-slate-200 font-mono text-[11px] text-slate-700 overflow-x-auto">
                          {JSON.stringify(run.metadata)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
