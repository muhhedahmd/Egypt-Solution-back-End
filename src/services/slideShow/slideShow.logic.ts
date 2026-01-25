import { randomUUID } from "crypto";
import { SlideShowValidator } from "../../validtation/slideShow-schema";
import { slideShowRepository } from "./slideShow.repostory";
import slugify from "slugify";
import { ServiceError } from "../../errors/services.error";
import { PaginatedResponse, PaginationParams } from "../../types/services";
import { Prisma, SlideShow, SlideshowType } from "@prisma/client";
import { AttachmentTypes } from "../../types/slideShow";
import { getRedisClient } from "../../config/redis";
import { slideShowKeyById, slideShowsKey } from "../../config/keys";

export class slideShowLogic {
  constructor(
    private repository: slideShowRepository,
    private validator: SlideShowValidator,
  ) {}

  async getAllServices(
    lang: "EN" | "AR",
    params: PaginationParams,
  ): Promise<PaginatedResponse<SlideShow>> {
    this.validator.validatePagination(params);
    const skip = params.skip || 0;
    const take = params.take || 10;
    const redis = await getRedisClient();
    const key = slideShowsKey(`${skip.toString()}-${take.toString()}`);
    const hashData = await redis.get(key);
    if (hashData) {
      return JSON.parse(hashData) as any;
    }
    const [slideShows, totalItems] = await Promise.all([
      this.repository.findMany( lang , { skip, take }),
      this.repository.count(),
    ]);
    const remainingItems = totalItems - (skip * take + slideShows.length);
    const data = {
      data: slideShows,
      pagination: {
        totalItems,
        remainingItems,
        nowCount: slideShows.length,
        totalPages: Math.ceil(totalItems / take),
        currentPage: skip + 1,
        pageSize: take,
      },
    };
    if (!slideShows?.length) return data;
    await redis.setEx(key, 120, JSON.stringify(data));
    return data;
  }
  async getAllSlideShowsMinmal(
    lang: "EN" | "AR",
  ): Promise<Partial<SlideShow>[] | undefined> {
    const slideShows = await this.repository.findManyMinimal(lang);
    return slideShows;
  }
  async create(data: unknown): Promise<SlideShow> {
    const dataCreate = this.validator.validateCreate(data);
    const slug = slugify(dataCreate.title + randomUUID().substring(0, 6), {
      lower: true,
    });
    const slideShow = await this.repository.create({ ...dataCreate, slug });
    if (!slideShow)
      throw new ServiceError(
        "error create services",
        400,
        "SLIDESHOW_CREATION_ERROR",
      );

    return slideShow;
  }
  async update(
    lang: "EN" | "AR",
    data: unknown,
  ): Promise<Awaited<ReturnType<typeof this.repository.update>>> {
    const dataUpdate = this.validator.validateUpdate(data);
    const updateSlideShow = await this.repository.update(lang, dataUpdate);
    return updateSlideShow;
  }
  async delete(id: string): Promise<SlideShow> {
    const validId = this.validator.validateId(id);
    const deleteSlideShow = await this.repository.delete(validId);
    return deleteSlideShow;
  }

  async findById(id: string) {
    const validId = this.validator.validateId(id);
    const redis = await getRedisClient();
    const key = slideShowKeyById(validId);
    const hashData = await redis.get(key);
    if (hashData) {
      return JSON.parse(hashData) as SlideShow;
    } else {
      const findSlideShow = await this.repository.findById(validId);
      if (!findSlideShow) return null;
      try {
        await redis.setEx(key, 10, JSON.stringify(findSlideShow));
        return findSlideShow;
      } catch (error) {
        console.log(error);
      }
    }
  }
  async attach(data: unknown): Promise<AttachmentTypes> {
    const valid = this.validator.validateAttachGlobal(data);
    const createAttachSlideShow = await this.repository.attach(valid);
    return createAttachSlideShow;
  }
  async deattach(data: unknown): Promise<AttachmentTypes> {
    const valid = this.validator.validateDeattachGlobal(data);
    const updatedService = await this.repository.Deattach(valid);
    return updatedService;
  }
  // ***
  async createAndAttachMany(
    lang: "EN" | "AR",
    data: unknown,
  ): Promise<{ slideShow: SlideShow; attacheds: AttachmentTypes[] }> {
    const valid = this.validator.validCreateAndAttachManySchema(data);
    if (!valid)
      throw new ServiceError(
        "Invalid data for create and attach many",
        400,
        "SLIDESHOW_CREATE_ATTACH_MANY_ERROR",
      );

    const { slides, ...rest } = valid;

    const createdAndAttached = await this.repository.createAndAttachMany(lang, {
      slides: slides.map((slide) => ({
        id: slide.attachId,
        type: slide.attachType,
        order: slide.order,
        isVisible: slide.isVisible,
        customTitle: slide.customTitle,
        customDesc: slide.customDesc,
      })),
      ...rest,
    });
    return createdAndAttached;
  }
  //*** */
  async bulkSlideOperations(lang: "EN" | "AR", data: unknown) {
    const valid = this.validator.validateBulkSlideOperations(data);

    if (!valid) {
      throw new ServiceError(
        "Invalid data for bulk slide operations",
        400,
        "INVALID_BULK_OPERATIONS_DATA",
      );
    }

    const result = await this.repository.bulkSlideOperations(lang, valid);

    return {
      success: true,
      message: "Bulk operations completed successfully",
      data: {
        slideShow: result.slideShow,
        summary: {
          created: result.created.length,
          updated: result.updated.length,
          deleted: result.deleted.length,
          reordered: result.reordered.length,
        },
        details: result,
      },
    };
  }

  async updateAndAttachMany(data: unknown) {
    const valid = this.validator.validUpdateAndAttachManySchema(data);
    if (!valid)
      throw new ServiceError(
        "Invalid data for update and attach many",
        400,
        "SLIDESHOW_UPDATE_ATTACH_MANY_ERROR",
      );

    const { slides, delete: delArr, update, ...rest } = valid;
    const updatedAndAttached = await this.repository.updateAndAttachMany({
      ...rest,
      slides,
      delete: delArr,
      update,
    });
    return updatedAndAttached;
  }

  // ***
  async getSlidesInSlideShow({
    id,
    page,
    pagesPerType,
    perPage,
  }: {
    id: string;
    page: number;
    pagesPerType?: Partial<
      Record<
        "services" | "projects" | "clients" | "testimonials" | "team",
        number
      >
    >;
    perPage: number;
  }) {
    const validId = this.validator.validateId(id);
    const slides = await this.repository.getSlidesPaged(validId, {
      page,
      pagesPerType,
      perPage,
    });
    return slides;
  }
  async getSlideShowWithSlides({
    skip,
    take,
    page,
    pagesPerType,
    perPage,
  }: {
    skip: number;
    take: number;
    page: number;
    pagesPerType?: Partial<
      Record<
        "services" | "projects" | "clients" | "testimonials" | "team",
        number
      >
    >;
    perPage: number;
  }) {
    // const { skip, take } = this.validator.validatePagination(params);
    const slides = await this.repository.getSlideShowsWithSlidesPaged(
      {
        skip,
        take,
      },
      {
        page,
        pagesPerType,
        perPage,
      },
    );
    return slides;
  }

  // ***
  async attachMany(data: unknown): Promise<AttachmentTypes[]> {
    const valid = this.validator.validateBulkAttach(data);
    const updatedService = await this.repository.attachMany({
      attachobj: valid.items,
      slideShowId: valid.slideShowId,
    });
    return updatedService;
  }
  async deattchMany(data: unknown): Promise<AttachmentTypes[]> {
    const valid = this.validator.validateBulkDeattach(data);
    const updatedService = await this.repository.DeattachMany({
      items: valid.items,
      slideShowId: valid.slideShowId,
    });
    return updatedService;
  }

  async getAttachedsGrouped({
    skip,
    take,
    slideShowId,
  }: {
    skip: number;
    take: number;
    slideShowId: string;
  }): Promise<
    PaginatedResponse<
      Prisma.PickEnumerable<Prisma.SlideShowGroupByOutputType, "type"[]>
    >
  > {
    try {
      const validatePagination = this.validator.validatePagination({
        skip,
        take,
      });
      const validateId = this.validator.validateId(slideShowId);
      const [groups, allGroups] = await Promise.all([
        await this.repository.getAttachedsGrouped({
          slideShowId: validateId,
          ...validatePagination,
        }),
        await this.repository.getALlGroup(validateId),
      ]);

      const totalItems = allGroups.length;
      const remainingItems = totalItems - (skip * take + groups.length);

      return {
        data: groups,
        pagination: {
          totalItems,
          remainingItems,
          nowCount: groups.length,
          totalPages: Math.ceil(totalItems / take),
          currentPage: skip + 1,
          pageSize: take,
        },
      };
    } catch (error) {
      console.error(error);
      throw new ServiceError(
        "error get slide shows",
        400,
        "SLIDESHOWS_GET_ERROR",
      );
    }
  }
  async getSlideshowsByType({
    skip,
    take,
    type,
  }: {
    skip: number;
    take: number;
    type: SlideshowType;
  }): Promise<
    PaginatedResponse<
      Prisma.PickEnumerable<Prisma.SlideShowGroupByOutputType, "type"[]>
    >
  > {
    try {
      const validatePagination = this.validator.validatePagination({
        skip,
        take,
      });

      const validateType = this.validator.validateType({ type });
      // const validateId = this.validator.validateId(slideShowId);
      const [attaches, count] = await Promise.all([
        await this.repository.getslideShowByType({
          ...validatePagination,
          type: validateType,
        }),
        await this.repository.getSlideShowByTypeCount(validateType),
      ]);

      const totalItems = count;
      const remainingItems = totalItems - (skip * take + attaches.length);
      return {
        data: attaches,
        pagination: {
          totalItems,
          remainingItems,
          nowCount: attaches.length,
          totalPages: Math.ceil(totalItems / take),
          currentPage: skip + 1,
          pageSize: take,
        },
      };
    } catch (error) {
      console.error(error);
      throw new ServiceError(
        "error get slide shows",
        400,
        "SLIDESHOWS_GET_ERROR",
      );
    }
  }
  async getAttachesByType(
    data: unknown,
  ): Promise<
    PaginatedResponse<
      Prisma.PickEnumerable<Prisma.SlideShowGroupByOutputType, "type"[]>
    >
  > {
    try {
      const { slideShowId, skip, take, type } = data as any;

      const validatePagination = this.validator.validatePagination({
        skip,
        take,
      });
      const validateType = this.validator.validateModelNaming({ type });
      const validateId = this.validator.validateId(slideShowId);

      const [attaches, count] = await Promise.all([
        await this.repository.getAttachesByType({
          ...validatePagination,
          type: validateType,
          slideShowId: validateId,
        }),
        await this.repository.getAttachesByTypeCount({
          slideShowId,
          type: validateType,
        }),
      ]);

      const totalItems = +count;
      const remainingItems = totalItems - (skip * take + attaches.length);
      return {
        data: attaches,
        pagination: {
          totalItems,
          remainingItems,
          nowCount: attaches.length,
          totalPages: Math.ceil(totalItems / take),
          currentPage: +skip + 1,
          pageSize: +take,
        },
      };
    } catch (error) {
      console.error(error);
      throw new ServiceError(
        "error get slide shows",
        400,
        "SLIDESHOWS_GET_ERROR",
      );
    }
  }
  async reorderBulkSlideShow(data: unknown) {
    const valid = this.validator.validateBulkReorder(data);
    const updatedService = await this.repository.reorderBulkSlideShow({
      slideShowOrder: valid,
    });
    return updatedService;
  }
  //***  */
}
