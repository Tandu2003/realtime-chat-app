import "./globals.css";

import { ReactNode } from "react";

import AuthInitProvider from "@/components/providers/AuthInitProvider";
import { ReduxProvider } from "@/redux/provider";

export const metadata = {
  title: "My Chat App",
  description: "Chat with your friends in real-time!",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ReduxProvider>
          <AuthInitProvider>{children}</AuthInitProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
