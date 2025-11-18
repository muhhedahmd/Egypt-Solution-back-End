
import { z } from 'zod';
import { CreateTestimonialDTO, UpdateTestimonial } from '../../types/testimonal';
import { TestimonialValidationError } from '../testimonal.error';

const createTestimonialSchema = z.object({
  clientName: z.string().min(1, 'Client name is required').max(255, 'Name too long'),
  clientPosition: z.string().optional(),
  clientCompany: z.string().optional(),
  content: z.string().min(1, 'Content is required'),
  rating: z.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating must be at most 5').default(5),
  isActive: z.boolean().optional().default(true),
  isFeatured: z.boolean().optional().default(false),
  order: z.number().int().min(0).optional().default(0),
  avatar: z.instanceof(Buffer).optional(),
});

const updateTestimonialSchema = z.object({
  testimonialId: z.string().min(1, 'Testimonial ID is required'),
  clientName: z.string().min(1).max(255).optional(),
  clientPosition: z.string().optional(),
  clientCompany: z.string().optional(),
  content: z.string().min(1).optional(),
  rating: z.number().int().min(1).max(5).optional(),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  order: z.number().int().min(0).optional(),
  avatar: z.instanceof(Buffer).optional(),
  avatarState: z.enum(['KEEP', 'REMOVE', 'UPDATE']).optional(),
});

const idSchema = z.string().min(1, 'ID is required');

export class TestimonialValidator {
  validateCreate(data: unknown): CreateTestimonialDTO {
    try {
      return createTestimonialSchema.parse(data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const messages = error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
        throw new TestimonialValidationError(
          `Validation failed: ${messages}`,
          'CREATE_VALIDATION_ERROR'
        );
      }
      throw new TestimonialValidationError('Invalid testimonial data');
    }
  }

  validateUpdate(data: unknown): UpdateTestimonial {
    try {
      return updateTestimonialSchema.parse(data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const messages = error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
        throw new TestimonialValidationError(
          `Validation failed: ${messages}`,
          'UPDATE_VALIDATION_ERROR'
        );
      }
      throw new TestimonialValidationError('Invalid update data');
    }
  }

  validateId(id: unknown): string {
    try {
      return idSchema.parse(id);
    } catch (error) {
      throw new TestimonialValidationError('Invalid testimonial ID', 'INVALID_ID');
    }
  }
}