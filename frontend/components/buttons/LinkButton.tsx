import { ReactNode } from "react";

export function LinkButton({
  children,
  onClick,
  className = ""
}: {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 cursor-pointer hover:bg-slate-100 rounded-lg text-slate-600 hover:text-slate-900 transition-colors font-medium text-sm ${className}`}
    >
      {children}
    </button>
  );
}
