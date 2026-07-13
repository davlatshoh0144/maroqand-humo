import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/academy/shared/theme-provider";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Marokand Humo Academy — Master USA Truck Dispatch From Anywhere",
  description:
    "Practical training for dispatch, compliance, broker communication, documentation, and operations. Learn USA trucking dispatch through structured lessons, practice assignments, and realistic case studies.",
  keywords: [
    "truck dispatch",
    "dispatch training",
    "logistics academy",
    "broker communication",
    "DOT compliance",
    "ELD training",
    "freight dispatch",
    "trucking operations",
    "Marokand Humo Academy",
  ],
  authors: [{ name: "Marokand Humo Academy" }],
  icons: {
    icon: "/logo-simple.png",
  },
  openGraph: {
    title: "Marokand Humo Academy",
    description: "Master USA Truck Dispatch From Anywhere",
    type: "website",
    siteName: "Marokand Humo Academy",
  },
  twitter: {
    card: "summary_large_image",
    title: "Marokand Humo Academy",
    description: "Master USA Truck Dispatch From Anywhere",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased bg-background text-foreground`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster position="bottom-right" richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
