import { Metadata } from 'next'

export const metadata: Metadata = {
  title: "ATS Resume Score Checker for Freshers | KaamKarDo",
  description: "Free ATS resume checker tailored for freshers and college graduates. Upload your first resume and see what HR and entry-level ATS systems look for.",
  alternates: {
    canonical: "/ats-score-for-freshers",
  },
  openGraph: {
    title: "ATS Resume Score Checker for Freshers | KaamKarDo",
    description: "Free ATS resume checker tailored for freshers and college graduates.",
    url: "https://resume.kaamkardo.com/ats-score-for-freshers",
  }
}

export default function AtsScoreFreshersLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
