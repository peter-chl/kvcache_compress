import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "KV Cache Compression",
  description: "A reference to KV cache compression methods for LLM inference.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, sans-serif", margin: "0 auto", maxWidth: 640, padding: "4rem 1rem" }}>
        {children}
      </body>
    </html>
  );
}
