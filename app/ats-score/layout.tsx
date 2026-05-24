import { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Free ATS Resume Checker & Score Calculator | KaamKarDo",
  description: "Upload your resume for a free, brutal ATS score. Find out exactly why HR is rejecting you and get instant feedback on missing keywords and formatting errors.",
  alternates: {
    canonical: "/ats-score",
  },
  openGraph: {
    title: "Free ATS Resume Checker & Score Calculator | KaamKarDo",
    description: "Upload your resume for a free, brutal ATS score. Find out exactly why HR is rejecting you.",
    url: "https://resume.kaamkardo.com/ats-score",
  },
  twitter: {
    title: "Free ATS Resume Checker & Score Calculator | KaamKarDo",
    description: "Upload your resume for a free, brutal ATS score. Find out exactly why HR is rejecting you.",
  }
}

export default function AtsScoreLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
