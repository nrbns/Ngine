// NGINE Design System - Production Grade
// Calm, honest, intentional, serious, human, trustworthy

export const colors = {
  // Neutral base
  background: '#ffffff',
  surface: '#f9fafb',
  border: '#e5e7eb',
  
  // Text hierarchy
  textPrimary: '#111827',
  textSecondary: '#6b7280',
  textTertiary: '#9ca3af',
  
  // Status colors (meaningful only)
  statusAligned: '#10b981',    // Green
  statusDrifting: '#f59e0b',   // Amber
  statusBroken: '#ef4444',     // Red
  statusRecovering: '#3b82f6', // Blue
  
  // Accent
  accent: '#3b82f6',
  accentHover: '#2563eb',

  // Dark theme tokens (used for the mobile UI mockups)
  darkBackground: '#2c3e50',
  darkSurface: '#3c5266',
  darkTextPrimary: '#ffffff',
  darkTextSecondary: '#bdc3c7',
};

export const typography = {
  // Use Inter or SF Pro
  fontFamily: {
    regular: 'System', // Will use SF Pro on iOS, Roboto on Android
    medium: 'System',
    semibold: 'System',
    bold: 'System',
  },
  
  // Large headers, plenty of spacing
  h1: {
    fontSize: 32,
    fontWeight: '700' as const,
    lineHeight: 40,
    letterSpacing: -0.5,
  },
  h2: {
    fontSize: 24,
    fontWeight: '600' as const,
    lineHeight: 32,
    letterSpacing: -0.3,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 28,
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
};

// No neon, no gradients abuse
export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
};

