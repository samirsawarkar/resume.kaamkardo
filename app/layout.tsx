import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-heading",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "ATS Resume Score + 30-Day Job Hunt OS | resume.kaamkardo.com",
  description:
    "Upload your resume and get an instant ATS score (0–100), find out exactly why HR is rejecting you, and unlock a 10/10 rewritten resume + complete job-hunt system for ₹299.",
  keywords: [
    "ATS resume score india",
    "free resume checker",
    "resume rewrite india",
    "job hunt system india",
    "cold email generator",
    "kaamkardo resume",
    "best resume for freshers india",
  ],
  authors: [{ name: "KaamKarDo" }],
  creator: "KaamKarDo",
  metadataBase: new URL("https://resume.kaamkardo.com"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Your Resume is Failing You. Find Out Why — Free.",
    description:
      "Instant ATS score + brutal feedback. Unlock the 30-Day Job Hunt OS for ₹299.",
    url: "https://resume.kaamkardo.com",
    siteName: "KaamKarDo Resume",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free ATS Resume Score | KaamKarDo",
    description:
      "Upload your resume. Get your score. Unlock the 30-Day Job Hunt OS.",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${plusJakarta.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
          <Toaster theme="system" position="bottom-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
