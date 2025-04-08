import "./globals.css";

import { ReactNode } from "react";

import { ReduxProvider } from "@/redux/provider";

export const metadata = {
  title: "My Chat App",
  description: "Chat with your friends in real-time!",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ReduxProvider>{children}</ReduxProvider>
      </body>
    </html>
  );
}
