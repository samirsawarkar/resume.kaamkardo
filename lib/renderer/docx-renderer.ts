// ═══════════════════════════════════════════════════════════════
// lib/renderer/docx-renderer.ts
// ATS-Safe DOCX Builder. No tables in body. Pure text nodes.
// ═══════════════════════════════════════════════════════════════

import { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, AlignmentType, BorderStyle } from "docx";
import type { OptimizedResume } from "../pipeline/types";
import { ATS_FONTS, ATS_SIZES, ATS_MARGINS, STANDARD_SECTION_HEADINGS } from "./ats-safe-rules";

export async function buildDocx(resume: OptimizedResume): Promise<Buffer> {
  const p = resume.header;

  const noBorders = {
    top: { style: BorderStyle.NONE, size: 0, color: "auto" },
    bottom: { style: BorderStyle.NONE, size: 0, color: "auto" },
    left: { style: BorderStyle.NONE, size: 0, color: "auto" },
    right: { style: BorderStyle.NONE, size: 0, color: "auto" },
  };

  // 1. HEADER (Table allowed here only)
  const headerTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: noBorders,
    rows: [
      new TableRow({
        children: [
          new TableCell({
            borders: noBorders,
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: p?.name || "Candidate Resume",
                    bold: true,
                    size: ATS_SIZES.NAME_HEADER * 2, // docx uses half-points
                    font: ATS_FONTS.PRIMARY,
                  }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: p?.tagline || "",
                    italics: true,
                    size: ATS_SIZES.BODY_TEXT * 2,
                    font: ATS_FONTS.SECONDARY,
                  }),
                ],
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: [
                      p?.email || "",
                      p?.phone || "",
                      p?.location || "",
                      p?.links?.linkedin || "",
                      p?.links?.github || ""
                    ].filter(Boolean).join(" | "),
                    size: ATS_SIZES.SMALL_TEXT * 2,
                    font: ATS_FONTS.PRIMARY,
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });

  const children: any[] = [headerTable, new Paragraph({ text: "" })];

  const addHeading = (text: string) => {
    children.push(
      new Paragraph({
        text,
        heading: HeadingLevel.HEADING_1,
        border: {
          bottom: { color: "000000", space: 1, style: BorderStyle.SINGLE, size: 6 }
        }
      })
    );
  };

  // 2. METRICS BAR (Table allowed here)
  if (resume.metrics_bar && resume.metrics_bar.length > 0) {
    const metricCells = resume.metrics_bar.map(m => new TableCell({
      borders: noBorders,
      children: [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({ text: m.value || "", bold: true, size: ATS_SIZES.BODY_TEXT * 2, font: ATS_FONTS.PRIMARY }),
            new TextRun({ text: `\n${m.label || ""}`, size: ATS_SIZES.SMALL_TEXT * 2, font: ATS_FONTS.SECONDARY })
          ]
        })
      ]
    }));

    children.push(new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: noBorders,
      rows: [new TableRow({ children: metricCells })]
    }));
    children.push(new Paragraph({ text: "" }));
  }

  // 3. SUMMARY
  if (resume.summary) {
    addHeading(STANDARD_SECTION_HEADINGS.SUMMARY);
    children.push(new Paragraph({
      children: [new TextRun({ text: resume.summary, size: ATS_SIZES.BODY_TEXT * 2, font: ATS_FONTS.PRIMARY })]
    }));
    children.push(new Paragraph({ text: "" }));
  }

  // 4. SKILLS
  if (resume.skills && resume.skills.length > 0) {
    addHeading(STANDARD_SECTION_HEADINGS.SKILLS);
    resume.skills.forEach(skillCat => {
      children.push(new Paragraph({
        children: [
          new TextRun({ text: `${skillCat.category || "Skills"}: `, bold: true, size: ATS_SIZES.BODY_TEXT * 2, font: ATS_FONTS.PRIMARY }),
          new TextRun({ text: (skillCat.items || []).join(", "), size: ATS_SIZES.BODY_TEXT * 2, font: ATS_FONTS.PRIMARY })
        ]
      }));
    });
    children.push(new Paragraph({ text: "" }));
  }

  // Helper for Experience/Projects
  const renderExpBlock = (exp: any) => {
    children.push(new Paragraph({
      children: [
        new TextRun({ text: exp.role || exp.name || "Role", bold: true, size: ATS_SIZES.BODY_TEXT * 2, font: ATS_FONTS.PRIMARY }),
        new TextRun({ text: (exp.company || exp.subtitle) ? ` | ${exp.company || exp.subtitle}` : "", italics: true, size: ATS_SIZES.BODY_TEXT * 2, font: ATS_FONTS.PRIMARY }),
      ]
    }));
    
    if (exp.duration || exp.location) {
      children.push(new Paragraph({
        alignment: AlignmentType.RIGHT,
        children: [
          new TextRun({ text: [exp.duration || "", exp.location || ""].filter(Boolean).join(" | "), size: ATS_SIZES.SMALL_TEXT * 2, font: ATS_FONTS.SECONDARY })
        ]
      }));
    }

    if (exp.bullets && exp.bullets.length > 0) {
      exp.bullets.forEach((b: string) => {
        children.push(new Paragraph({
          text: b,
          bullet: { level: 0 },
          style: "Normal"
        }));
      });
    }
    children.push(new Paragraph({ text: "" }));
  };

  // 5. EXPERIENCE
  if (resume.experience && resume.experience.length > 0) {
    addHeading(STANDARD_SECTION_HEADINGS.EXPERIENCE);
    resume.experience.forEach(renderExpBlock);
  }

  // 6. PROJECTS
  if (resume.projects && resume.projects.length > 0) {
    addHeading(STANDARD_SECTION_HEADINGS.PROJECTS);
    resume.projects.forEach(renderExpBlock);
  }

  // 7. OPEN SOURCE
  if (resume.open_source && resume.open_source.length > 0) {
    addHeading(STANDARD_SECTION_HEADINGS.OPEN_SOURCE);
    resume.open_source.forEach(renderExpBlock);
  }

  // 8. PUBLICATIONS
  if (resume.publications && resume.publications.length > 0) {
    addHeading(STANDARD_SECTION_HEADINGS.PUBLICATIONS);
    resume.publications.forEach(pub => {
      children.push(new Paragraph({
        children: [
          new TextRun({ text: pub.title || "", bold: true, size: ATS_SIZES.BODY_TEXT * 2, font: ATS_FONTS.PRIMARY }),
          new TextRun({ text: ` — ${pub.venue || ""} (${pub.year || ""})`, size: ATS_SIZES.BODY_TEXT * 2, font: ATS_FONTS.PRIMARY })
        ]
      }));
      if (pub.one_line) {
        children.push(new Paragraph({ children: [new TextRun({ text: pub.one_line, size: ATS_SIZES.BODY_TEXT * 2, font: ATS_FONTS.PRIMARY })] }));
      }
    });
    children.push(new Paragraph({ text: "" }));
  }

  // 9. EDUCATION
  if (resume.education && resume.education.length > 0) {
    addHeading(STANDARD_SECTION_HEADINGS.EDUCATION);
    resume.education.forEach(edu => {
      children.push(new Paragraph({
        children: [
          new TextRun({ text: edu.degree || "", bold: true, size: ATS_SIZES.BODY_TEXT * 2, font: ATS_FONTS.PRIMARY }),
          new TextRun({ text: ` | ${edu.institution || ""}`, size: ATS_SIZES.BODY_TEXT * 2, font: ATS_FONTS.PRIMARY })
        ]
      }));
      const eduDetails = [edu.location, edu.year, edu.score].filter(Boolean).join(" | ");
      if (eduDetails) {
        children.push(new Paragraph({ children: [new TextRun({ text: eduDetails, size: ATS_SIZES.SMALL_TEXT * 2, font: ATS_FONTS.SECONDARY })] }));
      }
      if (edu.relevant_courses) {
        children.push(new Paragraph({ children: [new TextRun({ text: `Relevant Coursework: ${edu.relevant_courses}`, size: ATS_SIZES.SMALL_TEXT * 2, font: ATS_FONTS.SECONDARY })] }));
      }
      children.push(new Paragraph({ text: "" }));
    });
  }

  // 10. CERTIFICATIONS
  if (resume.certifications && resume.certifications.length > 0) {
    addHeading(STANDARD_SECTION_HEADINGS.CERTIFICATIONS);
    resume.certifications.forEach(cert => {
      children.push(new Paragraph({
        text: `${cert.name || ""} — ${cert.issuer || ""} (${cert.year || ""})`,
        bullet: { level: 0 },
        style: "Normal"
      }));
    });
    children.push(new Paragraph({ text: "" }));
  }

  // 11. LANGUAGES
  if (resume.languages && resume.languages.length > 0) {
    addHeading(STANDARD_SECTION_HEADINGS.LANGUAGES);
    children.push(new Paragraph({
      children: [new TextRun({ text: resume.languages.join(", "), size: ATS_SIZES.BODY_TEXT * 2, font: ATS_FONTS.PRIMARY })]
    }));
  }

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: {
            size: ATS_SIZES.BODY_TEXT * 2,
            font: ATS_FONTS.PRIMARY,
          },
        },
      },
    },
    sections: [{
      properties: {
        page: {
          margin: {
            top: ATS_MARGINS.TOP,
            right: ATS_MARGINS.RIGHT,
            bottom: ATS_MARGINS.BOTTOM,
            left: ATS_MARGINS.LEFT,
          },
        },
      },
      children,
    }],
  });

  return Packer.toBuffer(doc);
}
