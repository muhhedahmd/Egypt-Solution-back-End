
import { z } from 'zod';
import { ButtonVariant, TextAlign, HeroVariant } from '@prisma/client';
import { HeroValidationError } from '../hero.error';
import { CreateHeroDTO, UpdateHeroDTO } from '../../types/hero';


const createHeroSchema = z.object({
  name: z.string().min(1).max(255).optional().default('Main Hero'),
  title: z.string().min(1, 'Title is required').max(500),
  subtitle: z.string().max(500).optional(),
  description: z.string().optional(),
  backgroundColor: z.string().optional(),
  backgroundVideo: z.string().url('Invalid video URL').optional().or(z.literal('')),
  overlayColor: z.string().optional(),
  overlayOpacity: z.number().min(0).max(1).optional(),
  ctaText: z.string().max(100).optional(),
  ctaUrl: z.string().optional(),
  ctaVariant: z.nativeEnum(ButtonVariant).optional(),
  secondaryCtaText: z.string().max(100).optional(),
  secondaryCtaUrl: z.string().optional(),
  secondaryCtaVariant: z.nativeEnum(ButtonVariant).optional(),
  alignment: z.nativeEnum(TextAlign).optional(),
  variant: z.nativeEnum(HeroVariant).optional().default(HeroVariant.CENTERED),
  minHeight: z.number().int().min(200).max(2000).optional(),
  titleSize: z.string().max(50).optional(),
  titleColor: z.string().optional(),
  subtitleColor: z.string().optional(),
  descriptionColor: z.string().optional(),
  showScrollIndicator: z.boolean().optional().default(false),
  customCSS: z.string().optional(),
  styleOverrides: z.any().optional(),
  isActive: z.boolean().optional().default(true),
  backgroundImage: z.instanceof(Buffer).optional(),
});

const updateHeroSchema = z.object({
  heroId: z.string().min(1, 'Hero ID is required'),
  name: z.string().min(1).max(255).optional(),
  title: z.string().min(1).max(500).optional(),
  subtitle: z.string().max(500).optional(),
  description: z.string().optional(),
  backgroundColor: z.string().optional(),
  backgroundVideo: z.string().url('Invalid video URL').optional().or(z.literal('')).nullable(),
  overlayColor: z.string().optional(),
  overlayOpacity: z.number().min(0).max(1).optional(),
  ctaText: z.string().max(100).optional(),
  ctaUrl: z.string().optional(),
  ctaVariant: z.nativeEnum(ButtonVariant).optional(),
  secondaryCtaText: z.string().max(100).optional(),
  secondaryCtaUrl: z.string().optional(),
  secondaryCtaVariant: z.nativeEnum(ButtonVariant).optional(),
  alignment: z.nativeEnum(TextAlign).optional(),
  variant: z.nativeEnum(HeroVariant).optional(),
  minHeight: z.number().int().min(200).max(2000).optional(),
  titleSize: z.string().max(50).optional(),
  titleColor: z.string().optional(),
  subtitleColor: z.string().optional(),
  descriptionColor: z.string().optional(),
  showScrollIndicator: z.boolean().optional(),
  customCSS: z.string().optional().nullable(),
  styleOverrides: z.any().optional().nullable(),
  isActive: z.boolean().optional(),
  backgroundImage: z.instanceof(Buffer).optional(),
  imageState: z.enum(['KEEP', 'REMOVE', 'UPDATE']).optional(),
});

const idSchema = z.string().min(1, 'ID is required');

export class HeroValidator {
  validateCreate(data: unknown): CreateHeroDTO {
    try {
      return createHeroSchema.parse(data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const messages = error.errors
          .map((e) => `${e.path.join('.')}: ${e.message}`)
          .join(', ');
        throw new HeroValidationError(
          `Validation failed: ${messages}`,
          'CREATE_VALIDATION_ERROR'
        );
      }
      throw new HeroValidationError('Invalid hero data');
    }
  }

  validateUpdate(data: unknown): any {
    try {
      return updateHeroSchema.parse(data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const messages = error.errors
          .map((e) => `${e.path.join('.')}: ${e.message}`)
          .join(', ');
        throw new HeroValidationError(
          `Validation failed: ${messages}`,
          'UPDATE_VALIDATION_ERROR'
        );
      }
      throw new HeroValidationError('Invalid update data');
    }
  }

  validateId(id: unknown): string {
    try {
      return idSchema.parse(id);
    } catch (error) {
      throw new HeroValidationError('Invalid hero ID', 'INVALID_ID');
    }
  }
}