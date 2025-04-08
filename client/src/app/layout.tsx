import "./globals.css";

import { ReactNode } from "react";

import { Providers } from "@/store/provider";

export const metadata = {
  title: "My Chat App",
  description: "Chat with your friends in real-time!",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
