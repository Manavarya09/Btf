import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ARYA Mobility OS",
  description: "An AI-powered, multi-modal smart city platform for the UAE",
  icons: {
    icon: "/landing/assets/images/nav-logo.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body className="bg-white dark:bg-bg-dark text-text-primary dark:text-white">
        {children}
      </body>
    </html>
  );
}
