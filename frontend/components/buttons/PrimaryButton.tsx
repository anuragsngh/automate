import { ReactNode } from "react";

export function PrimaryButton({
  children,
  onClick,
  size = "normal",
  className = "",
  disabled = false,
  type = "button"
}: {
  children: ReactNode;
  onClick?: () => void;
  size?: "small" | "normal" | "big";
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex items-center justify-center font-medium rounded-full transition-all duration-200 shadow-sm active:scale-95 disabled:opacity-50 disabled:pointer-events-none bg-[#ff4f00] hover:bg-[#e04500] text-white ${
        size === "small"
          ? "text-xs px-4 py-1.5"
          : size === "big"
          ? "text-lg px-8 py-3.5 shadow-md font-semibold"
          : "text-sm px-5 py-2.5"
      } ${className}`}
    >
      {children}
    </button>
  );
}
