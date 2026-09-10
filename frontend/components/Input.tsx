import React from "react";

export function Input({
  label,
  placeholder,
  onChange,
  type = "text",
  value,
  name,
  required = false
}: {
  label: string;
  placeholder: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: "text" | "password" | "email" | "number";
  value?: string;
  name?: string;
  required?: boolean;
}) {
  return (
    <div className="w-full mb-3">
      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        required={required}
        placeholder={placeholder}
        onChange={onChange}
        className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff4f00] focus:border-transparent transition-all shadow-sm"
      />
    </div>
  );
}
