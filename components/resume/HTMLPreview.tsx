"use client";

import React from "react";
import { TEMPLATES, TemplateId } from "@/lib/rendering/templates";

interface HTMLPreviewProps {
  resumeJson: any;
  templateId?: TemplateId;
}

export default function HTMLPreview({ resumeJson, templateId = "executive" }: HTMLPreviewProps) {
  const theme = TEMPLATES[templateId] || TEMPLATES.executive;
  const p = resumeJson?.header || {};

  return (
    <div 
      className="bg-white mx-auto shadow-2xl rounded-sm overflow-hidden"
      style={{
        width: "100%",
        maxWidth: "800px", // A4 proportion approximation
        minHeight: "1050px",
        padding: `${theme.spacing.pageMargin[1]}px ${theme.spacing.pageMargin[2]}px ${theme.spacing.pageMargin[3]}px ${theme.spacing.pageMargin[0]}px`,
        fontFamily: theme.typography.fontFamily,
        color: theme.colors.text,
        lineHeight: theme.typography.lineHeights.normal,
        fontSize: `${theme.typography.sizes.body}px`,
        boxSizing: "border-box"
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: `${theme.spacing.headerGap}px` }}>
        <h1 
          style={{ 
            fontSize: `${theme.typography.sizes.name}px`, 
            color: theme.colors.primary, 
            fontWeight: "bold",
            lineHeight: theme.typography.lineHeights.tight,
            margin: 0
          }}
        >
          {p.name || "Resume"}
        </h1>
      </div>

      <div style={{ marginBottom: `${theme.spacing.sectionGap}px` }}>
        <p 
          style={{ 
            fontSize: `${theme.typography.sizes.small}px`, 
            color: theme.colors.muted,
            margin: 0
          }}
        >
          {[
            p.email || "",
            p.phone ? `  |  ${p.phone}` : "",
            p.location ? `  |  ${p.location}` : "",
            p.linkedin ? `  |  ${p.linkedin}` : "",
          ].filter(Boolean).join("")}
        </p>
      </div>

      {/* Summary */}
      {resumeJson?.summary && (
        <div style={{ marginBottom: `${theme.spacing.sectionGap}px` }}>
          <h2 
            style={{ 
              fontSize: `${theme.typography.sizes.section}px`, 
              color: theme.colors.accent, 
              fontWeight: "bold",
              marginBottom: `${theme.spacing.itemGap}px`,
              borderBottom: `1px solid ${theme.colors.border}`,
              paddingBottom: "4px"
            }}
          >
            Professional Summary
          </h2>
          <p style={{ margin: 0 }}>{resumeJson.summary}</p>
        </div>
      )}

      {/* Experience */}
      {resumeJson?.experience && resumeJson.experience.length > 0 && (
        <div style={{ marginBottom: `${theme.spacing.sectionGap}px` }}>
          <h2 
            style={{ 
              fontSize: `${theme.typography.sizes.section}px`, 
              color: theme.colors.accent, 
              fontWeight: "bold",
              marginBottom: `${theme.spacing.itemGap}px`,
              borderBottom: `1px solid ${theme.colors.border}`,
              paddingBottom: "4px"
            }}
          >
            Experience
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: `${theme.spacing.itemGap}px` }}>
            {resumeJson.experience.map((exp: any, i: number) => (
              <div key={i}>
                <div style={{ marginBottom: "4px" }}>
                  <strong style={{ color: theme.colors.primary }}>{exp.role || ""}</strong>
                  {exp.company && <strong style={{ color: theme.colors.primary }}> at {exp.company}</strong>}
                  <span style={{ color: theme.colors.muted, fontSize: `${theme.typography.sizes.small}px` }}>
                    {exp.duration || exp.location ? `  |  ${[exp.duration, exp.location].filter(Boolean).join(" - ")}` : ""}
                  </span>
                </div>
                {exp.bullets && exp.bullets.length > 0 && (
                  <ul style={{ margin: 0, paddingLeft: "18px", listStyleType: "disc" }}>
                    {exp.bullets.map((b: string, j: number) => (
                      <li key={j} style={{ marginBottom: "4px" }}>{b}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Projects */}
      {resumeJson?.projects && resumeJson.projects.length > 0 && (
        <div style={{ marginBottom: `${theme.spacing.sectionGap}px` }}>
          <h2 
            style={{ 
              fontSize: `${theme.typography.sizes.section}px`, 
              color: theme.colors.accent, 
              fontWeight: "bold",
              marginBottom: `${theme.spacing.itemGap}px`,
              borderBottom: `1px solid ${theme.colors.border}`,
              paddingBottom: "4px"
            }}
          >
            Projects
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: `${theme.spacing.itemGap}px` }}>
            {resumeJson.projects.map((proj: any, i: number) => (
              <div key={i}>
                <div style={{ marginBottom: "4px" }}>
                  <strong style={{ color: theme.colors.primary }}>{proj.name || ""}</strong>
                  {proj.duration && <span style={{ color: theme.colors.muted, fontSize: `${theme.typography.sizes.small}px` }}>  |  {proj.duration}</span>}
                </div>
                {proj.bullets && proj.bullets.length > 0 && (
                  <ul style={{ margin: 0, paddingLeft: "18px", listStyleType: "disc" }}>
                    {proj.bullets.map((b: string, j: number) => (
                      <li key={j} style={{ marginBottom: "4px" }}>{b}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {resumeJson?.education && resumeJson.education.length > 0 && (
        <div style={{ marginBottom: `${theme.spacing.sectionGap}px` }}>
          <h2 
            style={{ 
              fontSize: `${theme.typography.sizes.section}px`, 
              color: theme.colors.accent, 
              fontWeight: "bold",
              marginBottom: `${theme.spacing.itemGap}px`,
              borderBottom: `1px solid ${theme.colors.border}`,
              paddingBottom: "4px"
            }}
          >
            Education
          </h2>
          <ul style={{ margin: 0, paddingLeft: "18px", listStyleType: "disc" }}>
            {resumeJson.education.map((edu: any, i: number) => (
              <li key={i} style={{ marginBottom: "4px" }}>
                {edu.degree || ""} — {edu.institution || ""} ({edu.year || ""})
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Skills */}
      {resumeJson?.skills && resumeJson.skills.length > 0 && (
        <div style={{ marginBottom: `${theme.spacing.sectionGap}px` }}>
          <h2 
            style={{ 
              fontSize: `${theme.typography.sizes.section}px`, 
              color: theme.colors.accent, 
              fontWeight: "bold",
              marginBottom: `${theme.spacing.itemGap}px`,
              borderBottom: `1px solid ${theme.colors.border}`,
              paddingBottom: "4px"
            }}
          >
            Skills
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            {resumeJson.skills.map((s: any, i: number) => (
              <div key={i}>
                <strong style={{ color: theme.colors.primary }}>{s.category}: </strong>
                <span>{(s.items || []).join(", ")}</span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
