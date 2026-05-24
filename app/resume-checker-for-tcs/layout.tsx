import { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Resume Checker for TCS, Infosys & Wipro | KaamKarDo",
  description: "Check if your resume passes the strict ATS filters used by TCS, Infosys, Wipro, and other Indian IT giants. Get instant optimization feedback.",
  alternates: {
    canonical: "/resume-checker-for-tcs",
  },
  openGraph: {
    title: "Resume Checker for TCS, Infosys & Wipro | KaamKarDo",
    description: "Check if your resume passes the strict ATS filters used by TCS and Indian IT giants.",
    url: "https://resume.kaamkardo.com/resume-checker-for-tcs",
  }
}

export default function TcsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
