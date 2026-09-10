import React from "react";
import { Check } from "lucide-react";

export function CheckFeature({ title }: { title: string }) {
  return (
    <div className="flex items-center space-x-2">
      <div className="flex items-center justify-center w-5 h-5 rounded-full bg-green-100 text-green-600">
        <Check className="w-3.5 h-3.5 stroke-[3]" />
      </div>
      <span className="font-medium text-slate-700">{title}</span>
    </div>
  );
}
