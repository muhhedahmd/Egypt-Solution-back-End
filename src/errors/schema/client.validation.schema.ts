
import { z } from 'zod';
import { CreateClientDTO, UpdateClient } from '../../types/client';
import { ClientValidationError } from '../client.error';

const createClientSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name too long'),
  description: z.string().optional(),
  richDescription: z.string().optional(),
  website: z.string().url('Invalid website URL').optional().or(z.literal('')),
  industry: z.string().optional(),
  isActive: z.boolean().optional().default(true),
  isFeatured: z.boolean().optional().default(false),
  order: z.number().int().min(0).optional().default(0),
  image: z.instanceof(Buffer).optional(),
  logo: z.instanceof(Buffer).optional(),
});

const updateClientSchema = z.object({
  clientId: z.string().min(1, 'Client ID is required'),
  name: z.string().min(1).max(255).optional(),
  slug: z.string().optional(),
  description: z.string().optional(),
  richDescription: z.string().optional(),
  website: z.string().url('Invalid website URL').optional().or(z.literal('')),
  industry: z.string().optional(),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  order: z.number().int().min(0).optional(),
  image: z.instanceof(Buffer).optional(),
  logo: z.instanceof(Buffer).optional(),
  imageState: z.enum(['KEEP', 'REMOVE', 'UPDATE']).optional(),
  logoState: z.enum(['KEEP', 'REMOVE', 'UPDATE']).optional(),
});

const idSchema = z.string().min(1, 'ID is required');
const slugSchema = z.string().min(1, 'Slug is required');

export class ClientValidator {
  validateCreate(data: unknown): CreateClientDTO {
    try {
      return createClientSchema.parse(data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const messages = error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
        throw new ClientValidationError(
          `Validation failed: ${messages}`,
          'CREATE_VALIDATION_ERROR'
        );
      }
      throw new ClientValidationError('Invalid client data');
    }
  }

  validateUpdate(data: unknown): UpdateClient {
    try {
      return updateClientSchema.parse(data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const messages = error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
        throw new ClientValidationError(
          `Validation failed: ${messages}`,
          'UPDATE_VALIDATION_ERROR'
        );
      }
      throw new ClientValidationError('Invalid update data');
    }
  }

  validateId(id: unknown): string {
    try {
      return idSchema.parse(id);
    } catch (error) {
      throw new ClientValidationError('Invalid client ID', 'INVALID_ID');
    }
  }

  validateSlug(slug: unknown): string {
    try {
      return slugSchema.parse(slug);
    } catch (error) {
      throw new ClientValidationError('Invalid slug', 'INVALID_SLUG');
    }
  }
}