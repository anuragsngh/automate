"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Appbar } from "@/components/Appbar";
import { PrimaryButton } from "@/components/buttons/PrimaryButton";
import { SecondaryButton } from "@/components/buttons/SecondaryButton";
import { ZapCell } from "@/components/ZapCell";
import { Input } from "@/components/Input";
import { BACKEND_URL } from "../../config";
import { Plus, X, Sparkles, HelpCircle, ArrowDown, Calendar, Bot, Mail, CheckCircle2 } from "lucide-react";

interface AvailableItem {
  id: string;
  name: string;
  image: string;
}

interface TriggerStep {
  id: string;
  name: string;
  image: string;
  metadata?: Record<string, any>;
}

interface ActionStep {
  index: number;
  availableActionId: string;
  availableActionName: string;
  image?: string;
  metadata: Record<string, any>;
}

export default function CreateZap() {
  const router = useRouter();
  const [availableTriggers, setAvailableTriggers] = useState<AvailableItem[]>([]);
  const [availableActions, setAvailableActions] = useState<AvailableItem[]>([]);
  const [selectedTrigger, setSelectedTrigger] = useState<TriggerStep | null>(null);
  const [selectedActions, setSelectedActions] = useState<ActionStep[]>([]);
  const [selectedModalIndex, setSelectedModalIndex] = useState<number | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    axios
      .get(`${BACKEND_URL}/api/v1/trigger/available`)
      .then((res) => {
        const triggers = res.data.availableTriggers || [];
        setAvailableTriggers(triggers);
        if (triggers.length > 0 && !selectedTrigger) {
          setSelectedTrigger({
            id: triggers[0].id,
            name: triggers[0].name,
            image: triggers[0].image,
            metadata: {}
          });
        }
      })
      .catch((err) => console.error("Error loading triggers:", err));

    axios
      .get(`${BACKEND_URL}/api/v1/action/available`)
      .then((res) => setAvailableActions(res.data.availableActions || []))
      .catch((err) => console.error("Error loading actions:", err));
  }, []);

  const handlePublish = async () => {
    if (!selectedTrigger) {
      alert("Please select a Trigger first.");
      return;
    }

    if (selectedActions.length === 0) {
      alert("Please add at least one Action to your workflow.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    setIsPublishing(true);
    try {
      await axios.post(
        `${BACKEND_URL}/api/v1/zap`,
        {
          availableTriggerId: selectedTrigger.id,
          triggerMetadata: selectedTrigger.metadata || {},
          actions: selectedActions.map((action) => ({
            availableActionId: action.availableActionId,
            actionMetadata: action.metadata || {}
          }))
        },
        {
          headers: {
            Authorization: token
          }
        }
      );

      router.push("/dashboard");
    } catch (err: any) {
      console.error("Error publishing Automation:", err);
      alert(err.response?.data?.message || "Failed to publish Automation.");
    } finally {
      setIsPublishing(false);
    }
  };

  const addActionSlot = () => {
    setSelectedActions((prev) => [
      ...prev,
      {
        index: prev.length + 2,
        availableActionId: "",
        availableActionName: "",
        metadata: {}
      }
    ]);
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-100">
      <Appbar />

      {}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-14 z-30 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Workflow Builder</h2>
          <p className="text-xs text-slate-500">Configure trigger and multi-step action pipeline</p>
        </div>
        <PrimaryButton
          onClick={handlePublish}
          disabled={isPublishing || !selectedTrigger || selectedActions.length === 0}
          className="shadow-md font-semibold"
        >
          {isPublishing ? "Publishing Automation..." : "Publish Automation"}
        </PrimaryButton>
      </div>

      {}
      <main className="flex-1 flex flex-col items-center justify-start py-12 px-6">
        <div className="flex flex-col items-center w-full max-w-xl">
          {}
          <div className="flex flex-col items-center">
            <ZapCell
              index={1}
              name={selectedTrigger?.name || "Select Trigger"}
              image={selectedTrigger?.image}
              onClick={() => setSelectedModalIndex(1)}
            />
            <div className="connector-line my-3" />
          </div>

          {}
          {selectedActions.map((action, idx) => (
            <div key={idx} className="flex flex-col items-center">
              <ZapCell
                index={action.index}
                name={action.availableActionName || "Select Action"}
                image={action.image}
                onClick={() => setSelectedModalIndex(action.index)}
              />
              <div className="connector-line my-3" />
            </div>
          ))}

          {}
          <button
            onClick={addActionSlot}
            className="flex items-center justify-center gap-2 w-48 py-3 bg-white hover:bg-orange-50 text-slate-700 hover:text-[#ff4f00] border-2 border-dashed border-slate-300 hover:border-[#ff4f00] rounded-2xl font-semibold text-sm transition-all duration-200 shadow-sm"
          >
            <Plus className="w-4 h-4" /> Add Next Step
          </button>
        </div>
      </main>

      {}
      {selectedModalIndex !== null && (
        <ConfigureModal
          index={selectedModalIndex}
          isTrigger={selectedModalIndex === 1}
          availableItems={selectedModalIndex === 1 ? availableTriggers : availableActions}
          currentMetadata={
            selectedModalIndex === 1
              ? selectedTrigger?.metadata || {}
              : selectedActions[selectedModalIndex - 2]?.metadata || {}
          }
          currentApp={
            selectedModalIndex === 1
              ? selectedTrigger
              : availableActions.find(
                  (a) => a.id === selectedActions[selectedModalIndex - 2]?.availableActionId
                ) || null
          }
          onClose={() => setSelectedModalIndex(null)}
          onSelect={(selected) => {
            if (selectedModalIndex === 1) {
              setSelectedTrigger({
                id: selected.id,
                name: selected.name,
                image: selected.image,
                metadata: selected.metadata || {}
              });
            } else {
              setSelectedActions((prev) => {
                const updated = [...prev];
                const actionPos = selectedModalIndex - 2;
                updated[actionPos] = {
                  index: selectedModalIndex,
                  availableActionId: selected.id,
                  availableActionName: selected.name,
                  image: selected.image,
                  metadata: selected.metadata || {}
                };
                return updated;
              });
            }
            setSelectedModalIndex(null);
          }}
        />
      )}
    </div>
  );
}

function ConfigureModal({
  index,
  isTrigger,
  availableItems,
  currentMetadata,
  currentApp,
  onClose,
  onSelect
}: {
  index: number;
  isTrigger: boolean;
  availableItems: AvailableItem[];
  currentMetadata: Record<string, any>;
  currentApp: AvailableItem | null;
  onClose: () => void;
  onSelect: (selected: { id: string; name: string; image: string; metadata?: any }) => void;
}) {
  const [step, setStep] = useState<"choose_app" | "configure_fields">(
    currentApp?.id ? "configure_fields" : "choose_app"
  );
  const [selectedApp, setSelectedApp] = useState<AvailableItem | null>(currentApp);

  const [calendarEventTitle, setCalendarEventTitle] = useState(
    currentMetadata.eventTitle || "Weekly AI Digest"
  );
  const [calendarRecurrenceDay, setCalendarRecurrenceDay] = useState(
    currentMetadata.recurrenceDay || "Sunday"
  );
  const [calendarId, setCalendarId] = useState(currentMetadata.calendarId || "primary");

  const [aiTopic, setAiTopic] = useState(
    currentMetadata.topic || "Trending AI breakthroughs, model releases, and research from past week"
  );
  const [aiDepth, setAiDepth] = useState(currentMetadata.depth || "comprehensive");

  const [emailTo, setEmailTo] = useState(currentMetadata.email || currentMetadata.to || "");
  const [emailSubject, setEmailSubject] = useState(
    currentMetadata.subject || "Weekly AI News Digest — {event.summary}"
  );
  const [emailBody, setEmailBody] = useState(
    currentMetadata.body || "Hello,\n\nHere is your weekly AI news intelligence digest:\n\n{ai_summary}\n\nAutomated with Automate."
  );

  const handleSelectApp = (item: AvailableItem) => {
    setSelectedApp(item);
    if (item.id === "webhook") {

      onSelect({
        id: item.id,
        name: item.name,
        image: item.image,
        metadata: {}
      });
    } else {
      setStep("configure_fields");
    }
  };

  const handleSaveFields = () => {
    if (!selectedApp) return;

    let metadata: Record<string, any> = {};

    if (selectedApp.id === "google-calendar") {
      metadata = {
        eventTitle: calendarEventTitle,
        recurrenceDay: calendarRecurrenceDay,
        calendarId
      };
    } else if (selectedApp.id === "ai-agent") {
      metadata = {
        topic: aiTopic,
        depth: aiDepth
      };
    } else if (selectedApp.id === "email") {
      metadata = {
        to: emailTo,
        email: emailTo,
        subject: emailSubject,
        body: emailBody
      };
    }

    onSelect({
      id: selectedApp.id,
      name: selectedApp.name,
      image: selectedApp.image,
      metadata
    });
  };

  const insertVariableIntoBody = (variableTag: string) => {
    setEmailBody((prev: string) => `${prev} ${variableTag}`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-xl w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div>
            <span className="text-xs font-bold text-[#ff4f00] uppercase tracking-wider">
              Step {index} • {isTrigger ? "Trigger Event" : "Action Step"}
            </span>
            <h3 className="text-lg font-bold text-slate-900">
              {step === "choose_app"
                ? `Select an ${isTrigger ? "Event Trigger" : "Action App"}`
                : `Configure ${selectedApp?.name}`}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {}
        <div className="p-6 max-h-[80vh] overflow-y-auto">
          {step === "choose_app" ? (
            <div className="space-y-3">
              {availableItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleSelectApp(item)}
                  className="flex items-center justify-between p-4 rounded-2xl border border-slate-200 hover:border-[#ff4f00] hover:bg-orange-50/50 cursor-pointer transition-all duration-200 group"
                >
                  <div className="flex items-center space-x-3.5">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-10 h-10 object-contain rounded-xl"
                    />
                    <div>
                      <h4 className="font-bold text-slate-900 group-hover:text-[#ff4f00] text-base transition-colors">
                        {item.name}
                      </h4>
                      <p className="text-xs text-slate-500">
                        {item.id === "webhook" && "Fires when an external HTTP POST request is received"}
                        {item.id === "google-calendar" && "Fires when recurring events occur (e.g. Every Sunday)"}
                        {item.id === "ai-agent" && "Autonomously searches the web and writes summaries"}
                        {item.id === "email" && "Sends an email message via SMTP"}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {}
              {selectedApp?.id === "google-calendar" && (
                <div className="space-y-4">
                  <div className="p-3 bg-blue-50 border border-blue-200 text-blue-900 rounded-xl text-xs flex items-start gap-2">
                    <Calendar className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <span>
                      The Google Calendar poller monitors your calendar for instances of recurring events matching your filter and triggers your workflow automatically.
                    </span>
                  </div>

                  <Input
                    label="Calendar Event Title Filter"
                    placeholder="e.g. Weekly AI Digest"
                    value={calendarEventTitle}
                    onChange={(e) => setCalendarEventTitle(e.target.value)}
                    required
                  />

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      Recurrence Schedule
                    </label>
                    <select
                      value={calendarRecurrenceDay}
                      onChange={(e) => setCalendarRecurrenceDay(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff4f00]"
                    >
                      <option value="Sunday">Every Sunday (Weekly Digest)</option>
                      <option value="Monday">Every Monday (Weekly Kickoff)</option>
                      <option value="Friday">Every Friday (Weekend Wrapup)</option>
                      <option value="Daily">Daily Recurring Event</option>
                    </select>
                  </div>

                  <Input
                    label="Calendar ID"
                    placeholder="primary"
                    value={calendarId}
                    onChange={(e) => setCalendarId(e.target.value)}
                  />
                </div>
              )}

              {}
              {selectedApp?.id === "ai-agent" && (
                <div className="space-y-4">
                  <div className="p-3 bg-purple-50 border border-purple-200 text-purple-900 rounded-xl text-xs flex items-start gap-2">
                    <Bot className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                    <span>
                      The AI Agent will autonomously search the web for news from the past 7 days on your topic, compile a digest, and expose the <code className="font-mono bg-purple-100 px-1 rounded">{"{ai_summary}"}</code> variable for subsequent steps.
                    </span>
                  </div>

                  <div className="w-full">
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      Research Topic & Instructions <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={3}
                      placeholder="e.g. Trending AI breakthroughs, model releases, and research from past week"
                      value={aiTopic}
                      onChange={(e) => setAiTopic(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff4f00]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      Digest Format
                    </label>
                    <select
                      value={aiDepth}
                      onChange={(e) => setAiDepth(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff4f00]"
                    >
                      <option value="comprehensive">Comprehensive (Top Headlines + Models + Research + Tools)</option>
                      <option value="concise">Concise Executive Summary (Bullet points only)</option>
                    </select>
                  </div>
                </div>
              )}

              {}
              {selectedApp?.id === "email" && (
                <div className="space-y-4">
                  {}
                  <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-xs">
                    <div className="flex items-center gap-1.5 font-semibold mb-1">
                      <HelpCircle className="w-4 h-4 text-amber-600" />
                      <span>Available Dynamic Tags (Click to insert):</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      <button
                        type="button"
                        onClick={() => insertVariableIntoBody("{ai_summary}")}
                        className="px-2 py-1 bg-white hover:bg-amber-100 border border-amber-300 text-amber-900 rounded-md font-mono text-xs shadow-2xs transition-colors"
                      >
                        + {"{ai_summary}"}
                      </button>
                      <button
                        type="button"
                        onClick={() => insertVariableIntoBody("{event.summary}")}
                        className="px-2 py-1 bg-white hover:bg-amber-100 border border-amber-300 text-amber-900 rounded-md font-mono text-xs shadow-2xs transition-colors"
                      >
                        + {"{event.summary}"}
                      </button>
                      <button
                        type="button"
                        onClick={() => insertVariableIntoBody("{comment.email}")}
                        className="px-2 py-1 bg-white hover:bg-amber-100 border border-amber-300 text-amber-900 rounded-md font-mono text-xs shadow-2xs transition-colors"
                      >
                        + {"{comment.email}"}
                      </button>
                    </div>
                  </div>

                  <Input
                    label="Recipient Email (To)"
                    placeholder="e.g. subscriber@example.com or {comment.email}"
                    value={emailTo}
                    onChange={(e) => setEmailTo(e.target.value)}
                    required
                  />

                  <Input
                    label="Email Subject"
                    placeholder="e.g. Weekly AI News Digest"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                  />

                  <div className="w-full">
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                      Email Body <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={5}
                      placeholder="e.g. Hello, here is your digest: {ai_summary}"
                      value={emailBody}
                      onChange={(e) => setEmailBody(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff4f00] shadow-sm font-mono text-xs"
                    />
                  </div>
                </div>
              )}

              {}
              <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                <SecondaryButton onClick={() => setStep("choose_app")}>
                  Change App
                </SecondaryButton>
                <PrimaryButton onClick={handleSaveFields}>
                  Save {isTrigger ? "Trigger" : "Action"}
                </PrimaryButton>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
