export interface ThemeInput {
  themeName: string;
  setting?: string;
  specifics: {
    cardName: string;
    thematicReference: string;
  }[];
}

export interface ThemeConfig {
  allowedTypes: string[];
  requiredFields: string[];
  examples: string[];
}

export interface ThemeVariation {
  name: string;
  description: string;
  subthemes: string[];
  cardMappings: Record<string, string[]>;
}

export interface ThemeSuggestion {
  name: string;
  confidence: number;
  description: string;
  examples: string[];
}