import { TEMPLATES, TemplateId } from "./templates";

export function generatePdfDefinition(resumeJson: any, templateId: TemplateId = "executive") {
  const theme = TEMPLATES[templateId] || TEMPLATES.executive;
  const p = resumeJson.header || {};

  const docDefinition: any = {
    pageMargins: theme.spacing.pageMargin,
    content: [
      {
        text: p.name || "Resume",
        style: "name",
      },
      {
        text: [
          p.email || "",
          p.phone ? `  |  ${p.phone}` : "",
          p.location ? `  |  ${p.location}` : "",
          p.linkedin ? `  |  ${p.linkedin}` : "",
        ].filter(Boolean).join(""),
        style: "contact",
      },
    ],
    styles: {
      name: {
        fontSize: theme.typography.sizes.name,
        bold: true,
        color: theme.colors.primary,
        margin: [0, 0, 0, theme.spacing.headerGap],
        lineHeight: theme.typography.lineHeights.tight,
      },
      contact: {
        fontSize: theme.typography.sizes.small,
        color: theme.colors.muted,
        margin: [0, 0, 0, theme.spacing.sectionGap],
        lineHeight: theme.typography.lineHeights.tight,
      },
      sectionHeading: {
        fontSize: theme.typography.sizes.section,
        bold: true,
        color: theme.colors.accent,
        margin: [0, theme.spacing.sectionGap, 0, theme.spacing.itemGap],
        lineHeight: theme.typography.lineHeights.tight,
      },
      body: {
        fontSize: theme.typography.sizes.body,
        color: theme.colors.text,
        lineHeight: theme.typography.lineHeights.normal,
      },
      itemTitle: {
        fontSize: theme.typography.sizes.body,
        bold: true,
        color: theme.colors.primary,
      },
      itemSubtitle: {
        fontSize: theme.typography.sizes.body,
        color: theme.colors.muted,
      },
      bullets: {
        fontSize: theme.typography.sizes.body,
        color: theme.colors.text,
        lineHeight: theme.typography.lineHeights.normal,
        margin: [0, 4, 0, theme.spacing.itemGap],
      },
    },
    defaultStyle: {
      font: theme.typography.pdfFont,
      color: theme.colors.text,
      lineHeight: theme.typography.lineHeights.normal,
      fontSize: theme.typography.sizes.body,
    },
  };

  // Summary
  if (resumeJson.summary) {
    docDefinition.content.push({ text: "Professional Summary", style: "sectionHeading" });
    docDefinition.content.push({ text: resumeJson.summary, style: "body", margin: [0, 0, 0, theme.spacing.itemGap] });
  }

  // Experience
  if (resumeJson.experience && resumeJson.experience.length > 0) {
    docDefinition.content.push({ text: "Experience", style: "sectionHeading" });
    resumeJson.experience.forEach((exp: any) => {
      docDefinition.content.push({
        text: [
          { text: exp.role || "", style: "itemTitle" },
          { text: exp.company ? ` at ${exp.company}` : "", style: "itemTitle" },
          { text: exp.duration || exp.location ? `  |  ${[exp.duration, exp.location].filter(Boolean).join(" - ")}` : "", style: "itemSubtitle" }
        ],
        margin: [0, 0, 0, 4]
      });
      if (exp.bullets && exp.bullets.length > 0) {
        docDefinition.content.push({
          ul: exp.bullets,
          style: "bullets",
        });
      }
    });
  }

  // Projects
  if (resumeJson.projects && resumeJson.projects.length > 0) {
    docDefinition.content.push({ text: "Projects", style: "sectionHeading" });
    resumeJson.projects.forEach((proj: any) => {
      docDefinition.content.push({
        text: [
          { text: proj.name || "", style: "itemTitle" },
          { text: proj.duration ? `  |  ${proj.duration}` : "", style: "itemSubtitle" }
        ],
        margin: [0, 0, 0, 4]
      });
      if (proj.bullets && proj.bullets.length > 0) {
        docDefinition.content.push({
          ul: proj.bullets,
          style: "bullets",
        });
      }
    });
  }

  // Education
  if (resumeJson.education && resumeJson.education.length > 0) {
    docDefinition.content.push({ text: "Education", style: "sectionHeading" });
    docDefinition.content.push({
      ul: resumeJson.education.map((edu: any) => 
        `${edu.degree || ""} — ${edu.institution || ""} (${edu.year || ""})`
      ),
      style: "bullets"
    });
  }

  // Skills
  if (resumeJson.skills && resumeJson.skills.length > 0) {
    docDefinition.content.push({ text: "Skills", style: "sectionHeading" });
    resumeJson.skills.forEach((s: any) => {
      docDefinition.content.push({
        text: [
          { text: `${s.category}: `, style: "itemTitle" },
          { text: (s.items || []).join(", "), style: "body" }
        ],
        margin: [0, 0, 0, 4]
      });
    });
  }

  return docDefinition;
}
