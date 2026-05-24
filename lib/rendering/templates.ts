export type TemplateId = 'executive' | 'tech';

export interface TemplateTheme {
  id: TemplateId;
  name: string;
  colors: {
    primary: string;
    text: string;
    muted: string;
    accent: string;
    border: string;
  };
  typography: {
    fontFamily: string; // Used for HTML preview
    pdfFont: string; // Used for pdfmake
    sizes: {
      name: number;
      header: number;
      section: number;
      body: number;
      small: number;
    };
    lineHeights: {
      relaxed: number;
      normal: number;
      tight: number;
    };
  };
  spacing: {
    pageMargin: [number, number, number, number]; // [left, top, right, bottom]
    sectionGap: number;
    itemGap: number;
    headerGap: number;
  };
}

export const EXECUTIVE_THEME: TemplateTheme = {
  id: 'executive',
  name: 'Executive Minimal',
  colors: {
    primary: '#111827', // Charcoal
    text: '#374151',
    muted: '#6B7280',
    accent: '#2563EB', // Subtle corporate blue
    border: '#E5E7EB',
  },
  typography: {
    fontFamily: '"Inter", "Helvetica Neue", Helvetica, Arial, sans-serif',
    pdfFont: 'Roboto',
    sizes: {
      name: 24,
      header: 11,
      section: 13,
      body: 10,
      small: 9,
    },
    lineHeights: {
      relaxed: 1.6,
      normal: 1.4,
      tight: 1.2,
    },
  },
  spacing: {
    pageMargin: [40, 40, 40, 40],
    sectionGap: 16,
    itemGap: 10,
    headerGap: 4,
  },
};

export const TECH_THEME: TemplateTheme = {
  id: 'tech',
  name: 'Modern Tech Professional',
  colors: {
    primary: '#0F172A', // Slate
    text: '#334155',
    muted: '#64748B',
    accent: '#10B981', // Emerald tech accent
    border: '#CBD5E1',
  },
  typography: {
    fontFamily: '"Inter", "Helvetica Neue", Helvetica, Arial, sans-serif',
    pdfFont: 'Roboto', // Stick to Roboto for safety in pdfmake unless custom VFS is injected
    sizes: {
      name: 26,
      header: 10,
      section: 14,
      body: 10,
      small: 9,
    },
    lineHeights: {
      relaxed: 1.5,
      normal: 1.4,
      tight: 1.3,
    },
  },
  spacing: {
    pageMargin: [40, 30, 40, 30],
    sectionGap: 18,
    itemGap: 12,
    headerGap: 6,
  },
};

export const TEMPLATES: Record<TemplateId, TemplateTheme> = {
  executive: EXECUTIVE_THEME,
  tech: TECH_THEME,
};
