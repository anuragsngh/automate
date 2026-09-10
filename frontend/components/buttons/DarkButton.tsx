import { ReactNode } from "react";

export function DarkButton({
  children,
  onClick,
  size = "normal",
  className = "",
  type = "button"
}: {
  children: ReactNode;
  onClick?: () => void;
  size?: "small" | "normal" | "big";
  className?: string;
  type?: "button" | "submit" | "reset";
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`inline-flex items-center justify-center font-medium rounded-full transition-all duration-200 bg-slate-900 hover:bg-slate-800 text-white shadow-sm active:scale-95 ${
        size === "small"
          ? "text-xs px-4 py-1.5"
          : size === "big"
          ? "text-lg px-8 py-3.5 font-semibold"
          : "text-sm px-5 py-2.5"
      } ${className}`}
    >
      {children}
    </button>
  );
}
