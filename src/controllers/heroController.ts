
import { NextFunction, Response, Request } from 'express';
import { HeroLogic } from '../services/hero/hero.logic';
import { HeroError, HeroNotFoundError } from '../errors/hero.error';

export class HeroController {
  private heroLogic: HeroLogic;

  constructor(heroLogic: HeroLogic) {
    this.heroLogic = heroLogic;
  }

  async getAllHeroes(req: Request, res: Response, next: NextFunction) {
    try {
      const { skip, take } = req.query;

      const heroes = await this.heroLogic.getAllHeroes({
        skip: Number(skip) || 0,
        take: Number(take) || 10,
      });

      if (!heroes) throw new HeroNotFoundError('error get heroes');

      return res.json({
        ...heroes,
        message: 'heroes fetched successfully',
        success: true,
      });
    } catch (error) {
      next(error);
    }
  }

  async getHeroById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      if (!id) throw new HeroNotFoundError('id is required');

      const hero = await this.heroLogic.getHeroById(id);

      return res.json({
        data: hero,
        message: 'hero fetched successfully',
        success: true,
      });
    } catch (error) {
      next(error);
    }
  }

  async getActiveHero(req: Request, res: Response, next: NextFunction) {
    try {
      const hero = await this.heroLogic.getActiveHero();

      return res.json({
        data: hero,
        message: 'active hero fetched successfully',
        success: true,
      });
    } catch (error) {
      next(error);
    }
  }

  async createHero(req: Request, res: Response, next: NextFunction) {
    try {
      const data = req.body;

      // Parse JSON fields
      let styleOverrides = null;
      // if (data.styleOverrides) {
      //   try {
      //     styleOverrides = JSON.parse(data.styleOverrides);
      //   } catch (e) {
      //     console.error('Error parsing styleOverrides:', e);
      //   }
      // }

      // console.log({
      //   ...data,
      //   isActive: data.isActive === 'true' ? true : false,
      //   showScrollIndicator:
      //     data.showScrollIndicator === 'true' ? true : false,
      //   overlayOpacity: data.overlayOpacity
      //     ? parseFloat(data.overlayOpacity)
      //     : undefined,
      //   minHeight: data.minHeight ? Number(data.minHeight) : undefined,
      //   styleOverrides: styleOverrides,
      //   backgroundImage:
      //     Array.isArray(req.files) && req.files.length > 0
      //       ? req.files.find((f) => f.fieldname === 'backgroundImage')?.buffer
      //       : null,
      // })

      const newHero = await this.heroLogic.createHero({

        ...data,
        isActive: data.isActive === 'true' ? true : false,
        showScrollIndicator:
          data.showScrollIndicator === 'true' ? true : false,
        overlayOpacity: data.overlayOpacity
          ? parseFloat(data.overlayOpacity)
          : undefined,
        minHeight: data.minHeight ? Number(data.minHeight) : undefined,
        styleOverrides: styleOverrides,
        backgroundImage:
          Array.isArray(req.files) && req.files.length > 0
            ? req.files.find((f) => f.fieldname === 'backgroundImage')?.buffer
            : undefined,
      });

      return res.status(201).json({
        data: newHero,
        message: 'hero created successfully',
        success: true,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateHero(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const heroData = req.body;

      const files = req.files as Express.Multer.File[] | undefined;

      // Parse JSON fields
      let styleOverrides = undefined;
      if (heroData.styleOverrides) {
        try {
          styleOverrides = JSON.parse(heroData.styleOverrides);
        } catch (e) {
          console.error('Error parsing styleOverrides:', e);
        }
      }

      const data = {
        ...heroData,
        heroId: id,
        backgroundImage:
          Array.isArray(files) && files.length > 0
            ? files.find((f) => f.fieldname === 'backgroundImage')?.buffer
            : undefined,
        imageState: heroData?.imageState as
          | 'KEEP'
          | 'REMOVE'
          | 'UPDATE'
          | undefined,
      };

      const updatedHero = await this.heroLogic.updateHero({
        ...data,
        isActive:
          data.isActive === 'true'
            ? true
            : data.isActive === 'false'
            ? false
            : undefined,
        showScrollIndicator:
          data.showScrollIndicator === 'true'
            ? true
            : data.showScrollIndicator === 'false'
            ? false
            : undefined,
        overlayOpacity: data.overlayOpacity
          ? parseFloat(data.overlayOpacity)
          : undefined,
        minHeight: data.minHeight ? Number(data.minHeight) : undefined,
        styleOverrides: styleOverrides,
      });

      return res.json({
        data: updatedHero,
        message: 'hero updated successfully',
        success: true,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteHero(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      if (!id) throw new HeroNotFoundError('id is required');

      const deletedHero = await this.heroLogic.deleteHero(id);
      if (!deletedHero) throw new HeroNotFoundError('error deleting hero');

      return res.json({
        data: deletedHero,
        message: 'hero deleted successfully',
        success: true,
      });
    } catch (error) {
      next(error);
    }
  }

  async SearchHeroes(req: Request, res: Response, next: NextFunction) {
    try {
      const { q } = req.query;
      if (!q || typeof q !== 'string')
        throw new HeroError(
          'search query is required',
          400,
          'SEARCH_QUERY_REQUIRED'
        );

      const heroes = await this.heroLogic.Search(q);
      if (!heroes) throw new HeroNotFoundError('error searching heroes');

      return res.json({
        data: heroes,
        message: 'heroes searched successfully',
        success: true,
      });
    } catch (error) {
      next(error);
    }
  }
}