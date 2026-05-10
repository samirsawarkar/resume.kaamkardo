import { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Check Your ATS Resume Score Instantly | KaamKarDo",
  description: "Upload your resume and get a brutal, honest ATS score in seconds. See exactly what HR sees and find out why you aren't getting shortlisted.",
  alternates: {
    canonical: "/ats-score",
  },
  openGraph: {
    title: "Check Your ATS Resume Score Instantly | KaamKarDo",
    description: "Upload your resume and get a brutal, honest ATS score in seconds. See exactly what HR sees and find out why you aren't getting shortlisted.",
    url: "https://resume.kaamkardo.com/ats-score",
  },
  twitter: {
    title: "Check Your ATS Resume Score Instantly | KaamKarDo",
    description: "Upload your resume and get a brutal, honest ATS score in seconds. See exactly what HR sees and find out why you aren't getting shortlisted.",
  }
}

export default function AtsScoreLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
