import { ColorTheme, Theme } from "@/types/theme";

// =================================================================================
// PALETA DE CORES "HORIZONTE DIGITAL" PARA O APP TANQUE-CHEIO
//
// CONCEITO:
// Uma fusão entre a jornada na estrada e a tecnologia. O azul do céu e o
// laranja do sol no horizonte criam uma paleta confiável e energética,
// ideal para um app de navegação e consulta de preços.
//
// - PRIMÁRIA (Azul Céu Digital): Representa confiança, inteligência e o caminho
//   a ser percorrido. É a base para a navegação e ações principais.
// - SECUNDÁRIA (Laranja Horizonte): Cor vibrante para destacar o mais
//   importante: preços, economia e alertas. Captura a atenção do usuário.
// - UI/UX: Foco em consistência, acessibilidade (WCAG) e hierarquia visual clara.
// =================================================================================

export const colors: Record<Theme, Readonly<ColorTheme>> = {
  // --- TEMA CLARO ---
  [Theme.LIGHT]: {
    // COR PRIMÁRIA: Azul moderno e acessível.
    primary: {
      main: "#3B82F6", // Tailwind Blue 500
      light: "#60A5FA",
      dark: "#2563EB",
      text: "#FFFFFF", // Texto branco para máximo contraste e legibilidade.
    },
    // COR SECUNDÁRIA: Laranja energético para destaque.
    secondary: {
      main: "#F97316", // Tailwind Orange 500
      light: "#FB923C",
      dark: "#EA580C",
      text: "#FFFFFF", // Texto branco para máximo contraste.
    },
    // FUNDOS: Tons neutros para focar no conteúdo.
    background: {
      default: "#F8FAFC", // Fundo principal suave (Tailwind Slate 50)
      paper: "#FFFFFF", // Cards e superfícies brancos para destaque.
      elevated: "#FFFFFF",
    },
    // TEXTOS: Cinzas escuros para conforto de leitura e hierarquia.
    text: {
      primary: "#0F172A", // Cinza-azulado escuro, mais sofisticado que preto (Slate 900)
      secondary: "#64748B", // Tom médio para informações de apoio (Slate 500)
      disabled: "#94A3B8", // (Slate 400)
      hint: "#94A3B8",
    },
    // BOTÕES: Cores consistentes com a paleta.
    button: {
      primary: "#3B82F6", // Usa a cor primária diretamente para consistência.
      secondary: "#E2E8F0", // Botão secundário neutro (Slate 200)
      disabled: "#F1F5F9", // (Slate 100)
      text: "#FFFFFF", // Texto do botão primário.
    },
    // OUTROS ELEMENTOS DE UI:
    border: "#E2E8F0", // Borda sutil (Slate 200)
    divider: "#F1F5F9", // Divisor quase invisível (Slate 100)
    // CORES DE FEEDBACK: Vivas e universais.
    error: "#EF4444", // (Red 500)
    warning: "#F59E0B", // (Amber 500)
    info: "#06B6D4", // Ciano para não competir com o primário (Cyan 500)
    success: "#22C55E", // (Green 500)
    // AÇÕES DO USUÁRIO:
    action: {
      active: "rgba(59, 130, 246, 0.2)",
      hover: "rgba(59, 130, 246, 0.08)",
      selected: "rgba(59, 130, 246, 0.12)",
      disabled: "rgba(15, 23, 42, 0.1)",
    },
    shadow: "rgba(15, 23, 42, 0.08)",
  },

  // --- TEMA ESCURO ---
  [Theme.DARK]: {
    // COR PRIMÁRIA: Azul mais claro para se destacar no fundo escuro.
    primary: {
      main: "#60A5FA", // Tailwind Blue 400
      light: "#93C5FD",
      dark: "#3B82F6",
      text: "#FFFFFF", // Texto branco sempre, para máxima legibilidade.
    },
    // COR SECUNDÁRIA: Laranja claro e vibrante.
    secondary: {
      main: "#FB923C", // Tailwind Orange 400
      light: "#FDBA74",
      dark: "#F97316",
      text: "#FFFFFF", // Texto branco sempre.
    },
    // FUNDOS: Tons de ardósia (azul-acinzentado) para um look tech.
    background: {
      default: "#0F172A", // Fundo principal azul-ardósia escuro (Slate 900)
      paper: "#1E293B", // Fundo de cards (Slate 800)
      elevated: "#293548",
    },
    // TEXTOS: Brancos e cinzas claros para conforto visual.
    text: {
      primary: "#F1F5F9", // Branco "quebrado", mais confortável (Slate 100)
      secondary: "#94A3B8", // Cinza claro para informações secundárias (Slate 400)
      disabled: "#475569", // (Slate 600)
      hint: "#64748B",
    },
    // BOTÕES: Cores consistentes com a paleta escura.
    button: {
      primary: "#60A5FA", // Usa a cor primária escura diretamente.
      secondary: "#334155", // (Slate 700)
      disabled: "#1E293B", // (Slate 800)
      text: "#FFFFFF", // Texto branco no botão primário.
    },
    border: "#475569", // ALTERADO: (Slate 600) Tom mais claro para uma borda visível.
    divider: "#334155", // ALTERADO: (Slate 700) Agora visível sobre os fundos.
    // CORES DE FEEDBACK: Claras para se destacar no escuro.
    error: "#F87171", // (Red 400)
    warning: "#FBBF24", // (Amber 400)
    info: "#22D3EE", // (Cyan 400)
    success: "#4ADE80", // (Green 400)
    // AÇÕES DO USUÁRIO:
    action: {
      active: "rgba(96, 165, 250, 0.25)",
      hover: "rgba(96, 165, 250, 0.08)",
      selected: "rgba(96, 165, 250, 0.16)",
      disabled: "rgba(241, 245, 249, 0.15)",
    },
    shadow: "rgba(0, 0, 0, 0.3)",
  },
};

export default colors;
