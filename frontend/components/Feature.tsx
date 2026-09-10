import React, { ReactNode } from "react";

export function Feature({
  title,
  subtitle,
  icon
}: {
  title: string;
  subtitle: string;
  icon?: ReactNode;
}) {
  return (
    <div className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-200">
      {icon && (
        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-orange-50 text-[#ff4f00] mb-4">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
      <p className="text-sm text-slate-600 leading-relaxed">{subtitle}</p>
    </div>
  );
}
