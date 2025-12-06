// ============================================================================
// HERO TYPES
// ============================================================================

import { ButtonVariant, TextAlign, HeroVariant } from '@prisma/client';

export interface IHero {
  id: string;
  name: string;
  title: string;
  subtitle?: string | null;
  description?: string | null;
  backgroundImageId?: string | null;
  backgroundColor?: string | null;
  backgroundVideo?: string | null;
  overlayColor?: string | null;
  overlayOpacity?: number | null;
  ctaText?: string | null;
  ctaUrl?: string | null;
  ctaVariant?: ButtonVariant | null;
  secondaryCtaText?: string | null;
  secondaryCtaUrl?: string | null;
  secondaryCtaVariant?: ButtonVariant | null;
  alignment?: TextAlign | null;
  variant: HeroVariant;
  minHeight?: number | null;
  titleSize?: string | null;
  titleColor?: string | null;
  subtitleColor?: string | null;
  descriptionColor?: string | null;
  showScrollIndicator: boolean;
  customCSS?: string | null;
  styleOverrides?: any;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateHeroDTO {
  name?: string;
  title: string;
  subtitle?: string;
  description?: string;
  backgroundColor?: string;
  backgroundVideo?: string;
  overlayColor?: string;
  overlayOpacity?: number;
  ctaText?: string;
  ctaUrl?: string;
  ctaVariant?: ButtonVariant;
  secondaryCtaText?: string;
  secondaryCtaUrl?: string;
  secondaryCtaVariant?: ButtonVariant;
  alignment?: TextAlign;
  variant?: HeroVariant;
  minHeight?: number;
  titleSize?: string;
  titleColor?: string;
  subtitleColor?: string;
  descriptionColor?: string;
  showScrollIndicator?: boolean;
  customCSS?: string;
  styleOverrides?: any;
  isActive?: boolean;
  backgroundImage?: Buffer;
}

export interface UpdateHeroDTO {
  heroId: string;
  name?: string;
  title?: string;
  subtitle?: string;
  description?: string;
  backgroundColor?: string;
  backgroundVideo?: string;
  overlayColor?: string;
  overlayOpacity?: number;
  ctaText?: string;
  ctaUrl?: string;
  ctaVariant?: ButtonVariant;
  secondaryCtaText?: string;
  secondaryCtaUrl?: string;
  secondaryCtaVariant?: ButtonVariant;
  alignment?: TextAlign;
  variant?: HeroVariant;
  minHeight?: number;
  titleSize?: string;
  titleColor?: string;
  subtitleColor?: string;
  descriptionColor?: string;
  showScrollIndicator?: boolean;
  customCSS?: string;
  styleOverrides?: any;
  isActive?: boolean;
  backgroundImage?: Buffer;
  imageState?: 'KEEP' | 'REMOVE' | 'UPDATE';
}

export interface IHeroRepositoryResponse {
  hero: Omit<IHero, 'backgroundImageId'>;
  backgroundImage: any | null;
}

