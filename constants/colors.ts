import { ColorTheme, Theme } from '@/types/theme';

// Paleta de cores moderna e customizável
export const colors: Record<Theme, Readonly<ColorTheme>> = {
  [Theme.LIGHT]: {
    // COR PRIMÁRIA: Azul confiável e tecnológico
    primary: {
      main: '#3B82F6', // Azul padrão, excelente para UI
      light: '#60A5FA',
      dark: '#2563EB',
      text: '#FFFFFF', // Texto branco para alto contraste
    },
    // COR SECUNDÁRIA: Laranja energético para destaque
    secondary: {
      main: '#F97316', // Laranja vibrante
      light: '#FB923C',
      dark: '#EA580C',
      text: '#FFFFFF',
    },
    background: {
      default: '#F9FAFB', // Fundo principal quase branco
      paper: '#FFFFFF',   // Fundo de cards e modais
      elevated: '#FFFFFF',
    },
    text: {
      primary: '#1F2937',   // Texto principal escuro
      secondary: '#6B7280', // Texto secundário/cinza
      disabled: '#9CA3AF',
      hint: '#9CA3AF',
    },
    // Cor do botão primário reflete a cor primária
    button: {
      primary: '#3B82F6',
      secondary: '#F3F4F6',
      disabled: '#E5E7EB',
      text: '#FFFFFF',
    },
    border: '#E5E7EB',
    divider: '#F3F4F6',
    // Cores de feedback universais
    error: '#EF4444',
    warning: '#F59E0B',
    info: '#0EA5E9',
    success: '#10B981',
    action: {
      active: 'rgba(31, 41, 55, 0.54)',
      hover: 'rgba(31, 41, 55, 0.04)',
      selected: 'rgba(31, 41, 55, 0.08)',
      disabled: 'rgba(31, 41, 55, 0.26)',
    },
    shadow: 'rgba(0, 0, 0, 0.1)',
  },
  // --- TEMA ESCURO ---
  [Theme.DARK]: {
    // COR PRIMÁRIA (MODO ESCURO): Azul mais claro para visibilidade
    primary: {
      main: '#60A5FA',
      light: '#93C5FD',
      dark: '#3B82F6',
      text: '#111827', // Texto escuro para contraste no botão azul claro
    },
    // COR SECUNDÁRIA (MODO ESCURO): Laranja mais claro
    secondary: {
      main: '#FB923C',
      light: '#FDBA74',
      dark: '#F97316',
      text: '#431407', // Texto laranja bem escuro
    },
    background: {
      default: '#111827', // Fundo principal escuro
      paper: '#1F2937',   // Fundo de cards escuro
      elevated: '#374151',
    },
    text: {
      primary: '#F9FAFB',   // Texto principal claro
      secondary: '#D1D5DB', // Texto secundário claro
      disabled: '#6B7280',
      hint: '#9CA3AF',
    },
    // Cor do botão primário para o modo escuro
    button: {
      primary: '#60A5FA',
      secondary: '#374151',
      disabled: '#4B5563',
      text: '#111827',
    },
    border: '#374151',
    divider: '#1F2937',
    // Cores de feedback mais claras para o modo escuro
    error: '#F87171',
    warning: '#FBBF24',
    info: '#38BDF8',
    success: '#34D399',
    action: {
      active: 'rgba(249, 250, 251, 0.7)',
      hover: 'rgba(249, 250, 251, 0.08)',
      selected: 'rgba(249, 250, 251, 0.16)',
      disabled: 'rgba(249, 250, 251, 0.3)',
    },
    shadow: 'rgba(0, 0, 0, 0.5)',
  },
};

export default colors;