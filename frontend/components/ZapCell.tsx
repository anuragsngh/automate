import React from "react";
import { ChevronRight, Settings } from "lucide-react";

export function ZapCell({
  name,
  index,
  onClick,
  image
}: {
  name: string;
  index: number;
  onClick: () => void;
  image?: string;
}) {
  const isTrigger = index === 1;

  return (
    <div
      onClick={onClick}
      className="group relative flex items-center justify-between w-80 sm:w-96 px-5 py-4 bg-white hover:bg-slate-50 border border-slate-200 hover:border-[#ff4f00] rounded-xl shadow-sm hover:shadow-md cursor-pointer transition-all duration-200"
    >
      <div className="flex items-center space-x-3.5">
        <div
          className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold ${
            isTrigger
              ? "bg-amber-100 text-[#ff4f00]"
              : "bg-slate-100 text-slate-700"
          }`}
        >
          {index}.
        </div>

        {image ? (
          <img
            src={image}
            alt={name}
            className="w-8 h-8 object-contain rounded-md"
          />
        ) : (
          <div className="w-8 h-8 rounded-md bg-slate-100 flex items-center justify-center text-slate-400">
            <Settings className="w-4 h-4" />
          </div>
        )}

        <div className="flex flex-col text-left">
          <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
            {isTrigger ? "Trigger" : "Action"}
          </span>
          <span className="font-semibold text-slate-800 text-sm truncate max-w-[180px]">
            {name || (isTrigger ? "Select Trigger" : "Select Action")}
          </span>
        </div>
      </div>

      <div className="text-slate-400 group-hover:text-[#ff4f00] transition-colors">
        <ChevronRight className="w-5 h-5" />
      </div>
    </div>
  );
}
