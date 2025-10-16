import { NextFunction, Request, Response } from "express";
import { slideShowLogic } from "../services/slideShow/slideShow.logic";
import { ServiceError } from "../errors/services.error";
import { SlideshowType } from "@prisma/client";

export class slideShowController {
  constructor(private logic: slideShowLogic) {}

  async createSlideShow(req: Request, res: Response, next: NextFunction) {
    try {
      const body = req.body;
      const newSlideShow = await this.logic.create({
        ...body,
        isActive: body.isActive === "true" ? true : false,
        isFeatured: body.isFeatured === "true" ? true : false,
        order: Number(body.order) || 0,
        interval: Number(body.interval) || 5000,
        autoPlay: body.autoPlay === "true" ? true : false,
        icon: body.icon || "",
      });

      return res.status(201).json({
        success: true,
        message: "Slideshow created successfully",
        data: newSlideShow,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAllSlideShows(req: Request, res: Response, next: NextFunction) {
    try {
      const { skip, take } = req.query;
      // const skip = Number(page) - 1;
      // const take = Number(limit);

      const slideShows = await this.logic.getAllServices({
        skip: Number(skip) || 0,
        take: Number(take) || 10,
      });

      return res.status(200).json({
        success: true,
        message: "Slideshows fetched successfully",
        ...slideShows,
      });
    } catch (error) {
      next(error);
    }
  }

  async getSlideShowById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const slideShow = await this.logic.findById(id);

      if (!slideShow) {
        return res.status(404).json({
          success: false,
          message: `Slideshow with ID ${id} not found`,
        });
      }

      return res.status(200).json({
        success: true,
        message: "Slideshow fetched successfully",
        data: slideShow,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateSlideShow(req: Request, res: Response, next: NextFunction) {
    try {
      const body = req.body;
      const id = req.params.id;
      // if(!id) throw new ServiceError("id is required" , 400 , "ID_NOT_FOUND");
      const updated = await this.logic.update({
        ...body,
        slideShowId: id,
        isActive: body.isActive === "true" ? true : false,
        isFeatured: body.isFeatured === "true" ? true : false,
        order: Number(body.order) || 0,
        interval: Number(body.interval) || 5000,
        autoPlay: body.autoPlay === "true" ? true : false,
        icon: body.icon || "",
      });

      return res.status(200).json({
        success: true,
        message: "Slideshow updated successfully",
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteSlideShow(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const deleted = await this.logic.delete(id);

      return res.status(200).json({
        success: true,
        message: "Slideshow deleted successfully",
        data: deleted,
      });
    } catch (error) {
      next(error);
    }
  }
  async attachMany(req: Request, res: Response, next: NextFunction) {
    try {
      const body = req.body;
      const updated = await this.logic.attachMany(body);
      return res.status(200).json({
        success: true,
        message: "Slideshow updated successfully",
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAttachedsGrouped(req: Request, res: Response, next: NextFunction) {
    try {
      const { skip, take } = req.query;
      const { id } = req.params;
      const data = await this.logic.getAttachedsGrouped({
        slideShowId: id,
        skip: Number(skip) || 0,
        take: Number(take) || 10,
      });
      return res.status(200).json({
        success: true,
        message: "Slideshow type grouped successfully",
        ...data,
      });
    } catch (error) {
      next(error);
    }
  }
  async getSlideShowsByType(req: Request, res: Response, next: NextFunction) {
    try {
      console.log("triggered");
      const { skip, take } = req.query;

      const {
        type,
      }: {
        type: SlideshowType;
      } = req.body;

      const data = await this.logic.getSlideshowsByType({
        type,
        skip: Number(skip) || 0,
        take: Number(take) || 10,
      });
      return res.status(200).json({
        success: true,
        message: "Slideshow type grouped successfully",
        ...data,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAttachesByType(req: Request, res: Response, next: NextFunction) {
    try {
      const { skip, take } = req.query;
      const {
        type,
      }: {
        type: SlideshowType;
      } = req.body;
      const { id } = req.params;
      console.log({
        skip,
        take,
        type,
        id,
      });
      const data = await this.logic.getAttachesByType({
        skip,
        take,
        type,
        slideShowId: id,
      });
      return res.status(200).json({
        success: true,
        message: "Slideshow type attaches successfully",
        ...data,
      });
    } catch (error) {
      next(error);
    }
  }
  async deAttachMany(req: Request, res: Response, next: NextFunction) {
    try {
      const body = req.body;
console.log(body)
      const updated = await this.logic.deattchMany(body);
      return res.status(200).json({
        success: true,
        message: "Slideshow deattached successfully",
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }
}
