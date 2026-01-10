// NGINE Design Tokens - Exact spacing and typography from wireframes

export const SPACING = {
  // Padding
  screen: 20, // Main screen padding
  card: 24, // Card internal padding
  section: 16, // Section spacing
  
  // Gaps
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  
  // Button heights
  button: 48, // Minimum tap target
  chip: 44, // Chip tap area
  
  // Specific gaps
  actionButtonGap: 12, // Gap between action buttons
  energyChipGap: 12, // Gap between energy chips
} as const

export const TYPOGRAPHY = {
  // Headers
  greeting: {
    fontSize: 32,
    fontWeight: '800' as const,
    lineHeight: 40,
    letterSpacing: -0.5,
  },
  
  // Identity text
  identity: {
    fontSize: 18,
    fontWeight: '500' as const,
    lineHeight: 24,
    fontStyle: 'italic' as const,
  },
  
  // Goal card
  goalTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    lineHeight: 32,
    letterSpacing: -0.5,
  },
  goalMdd: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 24,
  },
  
  // Buttons
  button: {
    fontSize: 16,
    fontWeight: '700' as const,
    letterSpacing: 0.5,
  },
  
  // Question
  question: {
    fontSize: 22,
    fontWeight: '700' as const,
    lineHeight: 28,
    letterSpacing: -0.3,
  },
  
  // Labels
  label: {
    fontSize: 14,
    fontWeight: '600' as const,
    letterSpacing: 0.5,
  },
  
  // Metrics
  metric: {
    fontSize: 40,
    fontWeight: '800' as const,
    lineHeight: 48,
    letterSpacing: -1,
  },
  metricLabel: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
  },
} as const

export const BORDER_RADIUS = {
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
  card: 18,
  button: 14,
  chip: 12,
  pill: 20,
  round: 9999,
} as const

// Enhanced shadows for depth
export const SHADOWS = {
  sm: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 12,
  },
  // Colored shadows for primary elements
  primary: {
    shadowColor: '#6C6FF5',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  success: {
    shadowColor: '#4ADE80',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
} as const

// Alias for compatibility
export const radius = BORDER_RADIUS

export const LAYOUT = {
  // Single column
  maxWidth: '100%',
  columnGap: SPACING.md,
  
  // Action row
  actionButtonGap: SPACING.sm,
  
  // Energy selector
  energyChipGap: SPACING.sm,
  energyChipSize: 56,
} as const


