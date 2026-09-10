import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Automate - Reliable Workflow Automation",
  description: "Automate your workflows seamlessly across apps and APIs with Kafka-driven reliable architecture.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-[#fbfbfa] text-slate-900 min-h-screen flex flex-col">
        {children}
      </body>
    </html>
  );
}
