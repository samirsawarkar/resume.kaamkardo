import { Metadata } from 'next'

export const metadata: Metadata = {
  title: "Why is My Resume Not Getting Shortlisted? | Free ATS Test",
  description: "Find out exactly why your resume is getting rejected by HR and ATS bots. Upload your CV for a free diagnostic scan and start getting interviews.",
  alternates: {
    canonical: "/why-is-my-resume-not-getting-shortlisted",
  },
  openGraph: {
    title: "Why is My Resume Not Getting Shortlisted? | Free ATS Test",
    description: "Find out exactly why your resume is getting rejected by HR and ATS bots.",
    url: "https://resume.kaamkardo.com/why-is-my-resume-not-getting-shortlisted",
  }
}

export default function WhyNotShortlistedLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
