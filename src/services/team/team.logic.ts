
import slugify from 'slugify';
import { randomUUID } from 'crypto';
import { TeamRepository } from './team.repository';
import { TeamValidator } from '../../errors/schema/team.validation.schema';
import {
  CreateTeamMemberDTO,
  ITeamMember,
  ITeamMemberRepositoryCreateResponse,
  PaginatedResponse,
  PaginationParams,
  UpdateTeamMember,
} from '../../types/team';
import {
  TeamError,
  TeamNotFoundError,
} from '../../errors/team.error';

export class TeamLogic {
  constructor(
    private repository: TeamRepository,
    private validator: TeamValidator
  ) {}

  async isValidOrder({ order }: { order: number }) {
    const isValid = await this.repository.isValidOrder({ order });
    return isValid;
  }

  async getAllTeamMembers(
    params: PaginationParams
  ): Promise<PaginatedResponse<ITeamMember>> {
    const skip = params.skip || 0;
    const take = params.take || 10;

    const [teamMembers, totalItems] = await Promise.all([
      this.repository.findMany(skip, take),
      this.repository.count(),
    ]);

    const remainingItems = totalItems - (skip * take + teamMembers.length);

    return {
      data: teamMembers as any,
      pagination: {
        totalItems,
        remainingItems,
        nowCount: teamMembers.length,
        totalPages: Math.ceil(totalItems / take),
        currentPage: skip + 1,
        pageSize: take,
      },
    };
  }
  async getAllTeamMembersActive(
    params: PaginationParams & { isFeatured?: boolean }
  ): Promise<PaginatedResponse<ITeamMember>> {
    const skip = params.skip || 0;
    const take = params.take || 10;
    const isFeatured = params.isFeatured || false;

    const [teamMembers, totalItems] = await Promise.all([
      this.repository.findManyActive(skip, take, isFeatured),
      this.repository.ActiveCount(isFeatured),
    ]);

    const remainingItems = totalItems - (skip * take + teamMembers.length);

    return {
      data: teamMembers ,
      pagination: {
        totalItems,
        remainingItems,
        nowCount: teamMembers.length,
        totalPages: Math.ceil(totalItems / take),
        currentPage: skip + 1,
        pageSize: take,
      },
    };
  }

  async getTeamMemberById(id: string): Promise<any> {
    this.validator.validateId(id);
    const teamMember = await this.repository.findById(id);
    if (!teamMember) {
      throw new TeamNotFoundError(id);
    }
    const { image, ...rest } = teamMember;
    return {
      Image: image,
      teamMember: rest,
    };
  }

  async getTeamMemberBySlug(
    slug: string
  ): Promise<Awaited<ReturnType<typeof this.repository.findBySlug>>> {
    this.validator.validateSlug(slug);
    const teamMember = await this.repository.findBySlug(slug);
    if (!teamMember) {
      throw new TeamError(
        `team member with slug not found ${slug}`,
        404,
        'TEAM_NOT_FOUND'
      );
    }
    return teamMember;
  }

  async createTeamMember(
    data: CreateTeamMemberDTO
  ): Promise<ITeamMemberRepositoryCreateResponse> {
    const valid = this.validator.validateCreate(data);
    const slug = slugify(data.name + randomUUID().substring(0, 8), {
      lower: true,
    });
    const teamMember = await this.repository.create({
      ...valid,
      slug: slug,
    });
    if (!teamMember) throw new Error('error create team member');
    return teamMember;
  }

  async deleteTeamMember(teamId: string) {
    try {
      if (!teamId) throw new Error('id is required');
      this.validator.validateId(teamId);
      const deletedTeamMember = await this.repository.delete(teamId);
      if (!deletedTeamMember) throw new Error('error deleting team member');
      return deletedTeamMember;
    } catch (error) {
      console.error(error);
      throw new Error('Error deleting team member');
    }
  }

  async Search(q: string) {
    if (!q)
      throw new TeamError(
        'search query is required',
        400,
        'SEARCH_QUERY_REQUIRED'
      );
    const teamMembers = await this.repository.SearchTeamMember(q, 0, 10);
    if (!teamMembers)
      throw new TeamError(
        'error searching team members',
        400,
        'ERROR_SEARCHING_TEAM_MEMBERS'
      );
    return teamMembers;
  }

  async updateTeamMember(data: UpdateTeamMember) {
    this.validator.validateUpdate(data);
    const updatedTeamMember = await this.repository.update(data);
    if (!updatedTeamMember)
      throw new TeamError(
        'error updating team member',
        400,
        'ERROR_UPDATING_TEAM_MEMBER'
      );
    const { Image, ...rest } = updatedTeamMember;
    return { Image, ...rest };
  }
}