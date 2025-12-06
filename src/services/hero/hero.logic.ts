import { HeroError, HeroNotFoundError } from "../../errors/hero.error";
import { HeroValidator } from "../../errors/schema/hero.validation.schema";
import { CreateHeroDTO, UpdateHeroDTO } from "../../types/hero";
import { PaginatedResponse, PaginationParams } from "../../types/services";
import { HeroRepository } from "./hero.repostery";

export class HeroLogic {
  constructor(
    private repository: HeroRepository,
    private validator: HeroValidator
  ) {}

  async getAllHeroes(
    params: PaginationParams
  ): Promise<
    PaginatedResponse<
      Awaited<ReturnType<typeof this.repository.findMany>>[number]
    >
  > {
    const skip = params.skip || 0;
    const take = params.take || 10;

    const [heroes, totalItems] = await Promise.all([
      this.repository.findMany(skip, take),
      this.repository.count(),
    ]);

    const remainingItems = totalItems - (skip * take + heroes.length);

    return {
      data: heroes,
      pagination: {
        totalItems,
        remainingItems,
        nowCount: heroes.length,
        totalPages: Math.ceil(totalItems / take),
        currentPage: skip + 1,
        pageSize: take,
      },
    };
  }

  async getHeroById(id: string): Promise<any> {
    this.validator.validateId(id);
    const hero = await this.repository.findById(id);
    if (!hero) {
      throw new HeroNotFoundError(id);
    }
    const { backgroundImage, ...rest } = hero;
    return {
      backgroundImage: backgroundImage,
      hero: rest,
    };
  }

  async getActiveHero(): Promise<Awaited<
    ReturnType<typeof this.repository.findActiveHero>
  >> {
    const hero = await this.repository.findActiveHero();
    if (!hero) {
      throw new HeroError('No active hero found', 404, 'NO_ACTIVE_HERO');
    }
    return hero;
  }

  async createHero(
    data: CreateHeroDTO
  ): Promise<Awaited<ReturnType<typeof this.repository.create>>> {
    const valid = this.validator.validateCreate(data);
    const hero = await this.repository.create(valid);
    if (!hero) throw new Error('error create hero');
    return hero;
  }

  async deleteHero(heroId: string) {
    try {
      if (!heroId) throw new Error('id is required');
      this.validator.validateId(heroId);
      const deletedHero = await this.repository.delete(heroId);
      if (!deletedHero) throw new Error('error deleting hero');
      return deletedHero;
    } catch (error) {
      console.error(error);
      throw new Error('Error deleting hero');
    }
  }

  async Search(q: string) {
    if (!q)
      throw new HeroError(
        'search query is required',
        400,
        'SEARCH_QUERY_REQUIRED'
      );
    const heroes = await this.repository.SearchHero(q, 0, 10);
    if (!heroes)
      throw new HeroError(
        'error searching heroes',
        400,
        'ERROR_SEARCHING_HEROES'
      );
    return heroes;
  }

  async updateHero(data: UpdateHeroDTO) {
    this.validator.validateUpdate(data);
    const updatedHero = await this.repository.update(data);
    if (!updatedHero)
      throw new HeroError('error updating hero', 400, 'ERROR_UPDATING_HERO');
    const { hero, backgroundImage } = updatedHero;
    return { hero, backgroundImage };
  }
}