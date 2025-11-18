import { z } from 'zod';
import { TeamValidationError } from '../team.error';
import { CreateTeamMemberDTO, UpdateTeamMember } from '../../types/team';

const createTeamMemberSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name too long'),
  position: z.string().min(1, 'Position is required').max(255, 'Position too long'),
  bio: z.string().optional(),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().optional(),
  linkedin: z.string().url('Invalid LinkedIn URL').optional().or(z.literal('')),
  github: z.string().url('Invalid GitHub URL').optional().or(z.literal('')),
  twitter: z.string().url('Invalid Twitter URL').optional().or(z.literal('')),
  isActive: z.boolean().optional().default(true),
  isFeatured: z.boolean().optional().default(false),
  order: z.number().int().min(0).optional().default(0),
  image: z.instanceof(Buffer).optional(),
});

const updateTeamMemberSchema = z.object({
  teamId: z.string().min(1, 'Team member ID is required'),
  name: z.string().min(1).max(255).optional(),
  slug: z.string().optional(),
  position: z.string().min(1).max(255).optional(),
  bio: z.string().optional(),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().optional(),
  linkedin: z.string().url('Invalid LinkedIn URL').optional().or(z.literal('')),
  github: z.string().url('Invalid GitHub URL').optional().or(z.literal('')),
  twitter: z.string().url('Invalid Twitter URL').optional().or(z.literal('')),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  order: z.number().int().min(0).optional(),
  image: z.instanceof(Buffer).optional(),
  imageState: z.enum(['KEEP', 'REMOVE', 'UPDATE']).optional(),
});

const idSchema = z.string().min(1, 'ID is required');
const slugSchema = z.string().min(1, 'Slug is required');

export class TeamValidator {
  validateCreate(data: unknown): CreateTeamMemberDTO {
    try {
      return createTeamMemberSchema.parse(data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const messages = error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
        throw new TeamValidationError(
          `Validation failed: ${messages}`,
          'CREATE_VALIDATION_ERROR'
        );
      }
      throw new TeamValidationError('Invalid team member data');
    }
  }

  validateUpdate(data: unknown): UpdateTeamMember {
    try {
      return updateTeamMemberSchema.parse(data);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const messages = error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
        throw new TeamValidationError(
          `Validation failed: ${messages}`,
          'UPDATE_VALIDATION_ERROR'
        );
      }
      throw new TeamValidationError('Invalid update data');
    }
  }

  validateId(id: unknown): string {
    try {
      return idSchema.parse(id);
    } catch (error) {
      throw new TeamValidationError('Invalid team member ID', 'INVALID_ID');
    }
  }

  validateSlug(slug: unknown): string {
    try {
      return slugSchema.parse(slug);
    } catch (error) {
      throw new TeamValidationError('Invalid slug', 'INVALID_SLUG');
    }
  }
}