import { Document, Packer, Paragraph, TextRun, HeadingLevel, convertInchesToTwip } from "docx";
import { TEMPLATES, TemplateId } from "./templates";

export function generateDocx(resumeJson: any, templateId: TemplateId = "executive") {
  const theme = TEMPLATES[templateId] || TEMPLATES.executive;
  const p = resumeJson.header || {};

  const doc = new Document({
    sections: [{
      properties: {
        page: {
          margin: {
            top: convertInchesToTwip(theme.spacing.pageMargin[1] / 72),
            bottom: convertInchesToTwip(theme.spacing.pageMargin[3] / 72),
            left: convertInchesToTwip(theme.spacing.pageMargin[0] / 72),
            right: convertInchesToTwip(theme.spacing.pageMargin[2] / 72),
          }
        }
      },
      children: [
        // Name
        new Paragraph({
          text: p.name || "Resume",
          heading: HeadingLevel.HEADING_1,
          spacing: { after: theme.spacing.headerGap * 10 },
        }),
        // Contact Info
        new Paragraph({
          children: [
            new TextRun([
              p.email || "",
              p.phone ? `  |  ${p.phone}` : "",
              p.location ? `  |  ${p.location}` : "",
              p.linkedin ? `  |  ${p.linkedin}` : "",
            ].filter(Boolean).join("")),
          ],
          spacing: { after: theme.spacing.sectionGap * 10 },
        }),
        
        // Summary
        ...(resumeJson.summary ? [
          new Paragraph({ text: "Professional Summary", heading: HeadingLevel.HEADING_2, spacing: { before: theme.spacing.sectionGap * 10, after: theme.spacing.itemGap * 10 } }),
          new Paragraph({ text: resumeJson.summary || "", spacing: { after: theme.spacing.itemGap * 10 } }),
        ] : []),
        
        // Experience
        ...(resumeJson.experience && resumeJson.experience.length > 0 ? [
          new Paragraph({ text: "Experience", heading: HeadingLevel.HEADING_2, spacing: { before: theme.spacing.sectionGap * 10, after: theme.spacing.itemGap * 10 } }),
          ...resumeJson.experience.flatMap((exp: any) => [
            new Paragraph({
              children: [
                new TextRun({ text: exp.role || "", bold: true }),
                new TextRun(` at ${exp.company || ""} | ${[exp.duration, exp.location].filter(Boolean).join(" - ")}`)
              ],
              spacing: { before: theme.spacing.itemGap * 10, after: 40 }
            }),
            ...(exp.bullets || []).map((b: any) => new Paragraph({
              text: b,
              bullet: { level: 0 }
            }))
          ])
        ] : []),
        
        // Skills
        ...(resumeJson.skills && resumeJson.skills.length > 0 ? [
          new Paragraph({ text: "Skills", heading: HeadingLevel.HEADING_2, spacing: { before: theme.spacing.sectionGap * 10, after: theme.spacing.itemGap * 10 } }),
          ...resumeJson.skills.map((s: any) => 
            new Paragraph({
              children: [
                new TextRun({ text: `${s.category}: `, bold: true }),
                new TextRun((s.items || []).join(", "))
              ]
            })
          )
        ] : []),

        // Projects
        ...(resumeJson.projects && resumeJson.projects.length > 0 ? [
          new Paragraph({ text: "Projects", heading: HeadingLevel.HEADING_2, spacing: { before: theme.spacing.sectionGap * 10, after: theme.spacing.itemGap * 10 } }),
          ...resumeJson.projects.flatMap((proj: any) => [
            new Paragraph({
              children: [
                new TextRun({ text: proj.name || "", bold: true }),
                new TextRun(proj.duration ? ` | ${proj.duration}` : "")
              ],
              spacing: { before: theme.spacing.itemGap * 10, after: 40 }
            }),
            ...(proj.bullets || []).map((b: any) => new Paragraph({
              text: b,
              bullet: { level: 0 }
            }))
          ])
        ] : []),

        // Education
        ...(resumeJson.education && resumeJson.education.length > 0 ? [
          new Paragraph({ text: "Education", heading: HeadingLevel.HEADING_2, spacing: { before: theme.spacing.sectionGap * 10, after: theme.spacing.itemGap * 10 } }),
          ...resumeJson.education.map((edu: any) => new Paragraph({
            text: `${edu.degree || ""} — ${edu.institution || ""} (${edu.year || ""})`,
            bullet: { level: 0 }
          }))
        ] : [])
      ],
    }],
  });

  return doc;
}
