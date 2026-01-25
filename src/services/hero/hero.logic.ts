import { HeroError, HeroNotFoundError } from "../../errors/hero.error";
import { HeroValidator } from "../../errors/schema/hero.validation.schema";
import { CreateHeroDTO, UpdateHeroDTO } from "../../types/hero";
import { PaginatedResponse, PaginationParams } from "../../types/services";
import { HeroRepository } from "./hero.repostery";

export class HeroLogic {
  constructor(
    private repository: HeroRepository,
    private validator: HeroValidator,
  ) {}

  async getAllHeroes(
    lang: "AR" | "EN" = "EN",
    params: PaginationParams,
  ): Promise<
    PaginatedResponse<
      Awaited<ReturnType<typeof this.repository.findMany>>[number]
    >
  > {
    const skip = params.skip || 0;
    const take = params.take || 10;

    const [heroes, totalItems] = await Promise.all([
      this.repository.findMany(lang, skip, take),
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

  async getHeroById(lang: "AR" | "EN" = "EN", id: string): Promise<any> {
    this.validator.validateId(id);
    const hero = await this.repository.findById(lang, id);
    if (!hero) {
      throw new HeroNotFoundError(id);
    }
    const { backgroundImage, ...rest } = hero;
    return {
      backgroundImage: backgroundImage,
      hero: rest,
    };
  }

  async getActiveHero({
    lang,
  }: {
    lang: "AR" | "EN";
  }): Promise<Awaited<ReturnType<typeof this.repository.findActiveHero>>> {
    console.log(lang , "lang lang")
    const hero = await this.repository.findActiveHero(lang);
    if (!hero) {
      throw new HeroError("No active hero found", 404, "NO_ACTIVE_HERO");
    }
    return hero;
  }

  async createHero(
    lang: "AR" | "EN" = "EN",
    data: CreateHeroDTO,
  ): Promise<Awaited<ReturnType<typeof this.repository.create>>> {
    const valid = this.validator.validateCreate(data);
    const hero = await this.repository.create(lang, valid);
    if (!hero) throw new Error("error create hero");
    return hero;
  }

  async ToggleActive(
    id: string,
  ): Promise<Awaited<ReturnType<typeof this.repository.toggleActive>>> {
    const valid = this.validator.validateId(id);
    const res = await this.repository.toggleActive(valid);
    if (!res) throw new Error("error change hero active");
    return res;
  }

  async deleteHero(heroId: string) {
    try {
      if (!heroId) throw new Error("id is required");
      this.validator.validateId(heroId);
      const deletedHero = await this.repository.delete(heroId);
      if (!deletedHero) throw new Error("error deleting hero");
      return deletedHero;
    } catch (error) {
      console.error(error);
      throw new Error("Error deleting hero");
    }
  }

  async Search(q: string) {
    if (!q)
      throw new HeroError(
        "search query is required",
        400,
        "SEARCH_QUERY_REQUIRED",
      );
    const heroes = await this.repository.SearchHero(q, 0, 10);
    if (!heroes)
      throw new HeroError(
        "error searching heroes",
        400,
        "ERROR_SEARCHING_HEROES",
      );
    return heroes;
  }

  async updateHero(lang: "AR" | "EN" = "EN", data: UpdateHeroDTO) {
    this.validator.validateUpdate(data);
    console.log(data.heroId);
    const updatedHero = await this.repository.update(lang, data);

    if (!updatedHero)
      throw new HeroError("error updating hero", 400, "ERROR_UPDATING_HERO");
    const { hero, backgroundImage } = updatedHero;
    return { hero, backgroundImage };
  }
}
