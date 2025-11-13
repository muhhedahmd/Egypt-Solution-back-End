import slugify from "slugify";
import { PrismaClientConfig } from "../../config/prisma";
import { ServiceError } from "../../errors/services.error";
import {
  CreateslideShowDTO,
  UpdateslideShowDTO,
  AttachmentTypes,
  deattachManyDTO,
  deattachDTO,
  AttachmentWithSlideShowRelationsModels,
  CreateAndAttachMany,
} from "../../types/slideShow";
import { randomUUID } from "crypto";
import {
  ClientSlideShow,
  Prisma,
  ProjectSlideShow,
  ServiceSlideShow,
  SlideShow,
  SlideshowType,
  TeamSlideShow,
  TestimonialSlideShow,
} from "@prisma/client";
import { txInstance } from "../../lib/helpers";
import { promise } from "zod";
import { includes } from "zod/v4";

export class slideShowRepository {
  constructor(
    private prisma: PrismaClientConfig // private service : ServicesRepository
  ) {}
  private modelMap(prismaToUse: txInstance | PrismaClientConfig) {
    return {
      service: prismaToUse.service,
      project: prismaToUse.project,
      client: prismaToUse.client,
      teamMember: prismaToUse.teamMember,
      testimonial: prismaToUse.testimonial,
    };
  }

  private modelAttachMap(prismaToUse: txInstance | PrismaClientConfig) {
    return {
      service: prismaToUse.serviceSlideShow,
      project: prismaToUse.projectSlideShow,
      client: prismaToUse.clientSlideShow,
      teamMember: prismaToUse.teamSlideShow,
      testimonial: prismaToUse.testimonialSlideShow,
    };
  }

  async findById(id: string, prismaTouse?: txInstance) {
    try {
      const find = await (prismaTouse || this.prisma).slideShow.findUnique({
        where: {
          id,
        },
      });
      return find;
    } catch (error) {
      throw new ServiceError(
        "slideShow not found id: " + id,
        404,
        "id not found in DB"
      );
    }
  }

  async findBySlugFull(slug: string) {
    try {
      const slideShow = await this.prisma.slideShow.findUnique({
        where: {
          slug,
        },
        include: {
          clients: {
            include: {
              client: {
                include: {
                  image: true,
                  logo: true,
                },
              },
            },
          },
          projects: {
            include: {
              project: {
                include: {
                  image: true,
                },
              },
            },
          },
          services: {
            include: {
              service: {
                include: {
                  image: true,
                },
              },
            },
          },
          team: {
            include: {
              team: {
                include: {
                  image: true,
                },
              },
            },
          },
          testimonials: {
            include: {
              testimonial: {
                include: {
                  avatar: true,
                },
              },
            },
          },
        },
      });
      if (!slideShow) {
        throw new ServiceError(
          "slideShow not found  slug: " + slug,
          404,
          "id not found in DB"
        );
      }
      const { projects, services, clients, team, testimonials , ...rest } = slideShow;
      const slideShowData = rest 
      return {  slideShowData, projects, services, clients, team, testimonials };
    } catch (error) {
      throw new ServiceError(
        "slideShow not found  slug: " + slug,
        404,
        "id not found in DB"
      );
    }
  }

  async findAttachTable(
    id: string,
    attachType: "service" | "client" | "project" | "testimonial" | "teamMember",
    prismaTouse?: txInstance | PrismaClientConfig
    // modelMap: modelMap
  ): Promise<
    | ServiceSlideShow
    | ClientSlideShow
    | ProjectSlideShow
    | TestimonialSlideShow
    | TeamSlideShow
  > {
    if (!this.modelMap(prismaTouse || this.prisma)[attachType])
      throw new ServiceError(
        "slideShow attach + " + attachType + " not found id: " + id,
        404,
        "id not found in DB"
      );

    const findAttached = await (
      this.modelMap(prismaTouse || this.prisma)[attachType].findUnique as any
    )({
      where: { id },
    });

    if (!findAttached)
      throw new ServiceError(
        "slideShow attach + " + attachType + " not found id: " + id,
        404,
        "id not found in DB"
      );
    return findAttached as any;
  }
  async findByTitle(title: string) {
    const find = await this.prisma.slideShow.findFirst({
      where: {
        title,
      },
    });
    return find;
  }
  async count() {
    return await this.prisma.slideShow.count();
  }

  // crud
  async findMany({ skip, take }: { skip: number; take: number }) {
    try {
      return await this.prisma.slideShow.findMany({
        skip: skip * take,
        take,
        orderBy: {
          order: "asc",
        },
      });
    } catch (error) {
      console.error(error);
      throw new ServiceError(
        "error get slide shows",
        400,
        "SLIDESHOWS_GET_ERROR"
      );
    }
  }
  async create(data: CreateslideShowDTO) {
    try {
      const transiction = this.prisma.$transaction(async (tx) => {
        const lastOrder = (await this.count()) - 1;
        const findIstheretheOrder = await tx.slideShow.findFirst({
          where: {
            order: data.order,
          },
        });

        if (findIstheretheOrder) {
          data.order = lastOrder + 1;
        }
        if (data.order && data.order > lastOrder) {
          data.order = lastOrder + 1;
        }

        const create = await tx.slideShow.create({
          data: {
            type: data.type,
            composition: data.composition,
            slug: data.slug,
            title: data.title,
            order: data.order,
            isActive: data.isActive,
            description: data.description,
            interval: data.interval,
            background: data.background,
            autoPlay: data.autoPlay,
          },
        });
        return create;
      });
      return transiction;
    } catch (error) {
      console.error(error);
      throw new ServiceError(
        "error creating a slideshow",
        400,
        "SLIDESHOW_CREATION_ERROR"
      );
    }
  }

  async update(data: UpdateslideShowDTO) {
    console.log("commingOrder", data.order);

    try {
      const transaction = await this.prisma.$transaction(async (tx) => {
        const find = await this.findById(data.slideShowId, tx);
        if (!find)
          throw new ServiceError(
            "slideShow not found id: " + data.slideShowId,
            404,
            "id not found in DB"
          );
        let slug = find.slug;
        if (data.title && data.title != find.title) {
          slug = slugify(data.title + randomUUID().substring(0, 6), {
            lower: true,
          });
        }
        const isOrderChanged =
          data.order !== undefined && data.order != find.order;
        if (isOrderChanged)
          await this.reorderUpdate({
            slideShowUpdate: find,
            orderBeforeUpdate: find.order,
          });

        const updateSlideShow = await tx.slideShow.update({
          where: {
            id: data.slideShowId,
          },
          data: {
            type: data.type || find.type,
            composition: data.composition || find.composition,
            slug,
            title: data.title || find.title,
            order: data.order === undefined ? find.order : data.order,
            isActive: data.isActive || find.isActive,
            description: data.description || find.description,
            interval: data.interval || find.interval,
            background: data.background || find.background,
            autoPlay: data.autoPlay || find.autoPlay,
          },
        });

        return updateSlideShow;
      });
      return transaction;
    } catch (error) {
      console.error(error);
      throw new ServiceError(
        "error updating a slideshow",
        400,
        "SLIDESHOW_UPDATE_ERROR"
      );
    }
  }
  async delete(id: string) {
    try {
      await this.findById(id);
      const deleteSlideShow = await this.prisma.slideShow.delete({
        where: {
          id,
        },
      });
      await this.reorderDelete({ slideShowDelete: deleteSlideShow });
      return deleteSlideShow;
    } catch (error) {
      console.error(error);
      throw new ServiceError(
        "error deleting a slideshow",
        400,
        "SLIDESHOW_DELETE_ERROR"
      );
    }
  }

  // reorder logic
  async reorderDelete({ slideShowDelete }: { slideShowDelete: SlideShow }) {
    try {
      const order = slideShowDelete.order;
      const theRest = await this.prisma.slideShow.findMany({
        where: {
          order: {
            gt: order,
          },
        },
        orderBy: {
          order: "asc",
        },
      });
      const promises = await Promise.all(
        theRest.map((att) => {
          return this.prisma.slideShow.update({
            where: {
              id: att.id,
            },
            data: {
              order: att.order - 1,
            },
          });
        })
      );

      return promises;
    } catch (error) {}
  }

  // reorderUpdate for better that will be a swap

  async reorderUpdate({
    slideShowUpdate,
    orderBeforeUpdate,
  }: {
    slideShowUpdate: SlideShow;
    orderBeforeUpdate: number;
  }) {
    try {
      const order = slideShowUpdate.order;

      const findOrder = await this.prisma.slideShow.findFirst({
        where: {
          order,
        },
      });
      if (findOrder) {
        return this.prisma.slideShow.update({
          where: {
            id: findOrder.id,
          },
          data: {
            order: orderBeforeUpdate,
          },
        });
      }

      console.log({
        findOrder,
      });
    } catch (error) {
      console.error(error);
      throw new ServiceError(
        "error updating a slideshow Reorder",
        400,
        "SLIDESHOW_UPDATE_ERROR"
      );
    }
  }

  async slideShowSlidesCount(slideShowId: string) {
    try {
      const svcCount = this.prisma.serviceSlideShow.count({
        where: { slideShowId },
      });
      const prjCount = this.prisma.projectSlideShow.count({
        where: { slideShowId },
      });
      const cliCount = this.prisma.clientSlideShow.count({
        where: { slideShowId },
      });
      const tstCount = this.prisma.testimonialSlideShow.count({
        where: { slideShowId },
      });
      const tmCount = this.prisma.teamSlideShow.count({
        where: { slideShowId },
      });
      return {
        services: await svcCount,
        projects: await prjCount,
        clients: await cliCount,
        testimonials: await tstCount,
        team: await tmCount,
      };
    } catch (error) {
      console.error(error);
      throw new ServiceError(
        "error getting slide show slides count",
        400,
        "SLIDESHOW_SLIDES_COUNT_ERROR"
      );
    }
  }
  async getSlidesPaged(
    
    slideShowId: string,
    opts?: {
      perPage?: number;
      page?: number;
      pagesPerType?: Partial<
        Record<
          "services" | "projects" | "clients" | "testimonials" | "team",
          number
        >
      >;
    }
  ) {
    await this.findById(slideShowId);
    const perPageDefault = Math.min(Math.max(opts?.perPage ?? 10, 1), 100);
    const pageDefault = Math.max(opts?.page ?? 1, 1);

    const getSkipTake = (page?: number, perPage = perPageDefault) => {
      const p = Math.max(page ?? pageDefault, 1);
      return { skip: (p - 1) * perPage, take: perPage + 1, page: p, perPage };
    };

    const svc = getSkipTake(opts?.pagesPerType?.services);
    const prj = getSkipTake(opts?.pagesPerType?.projects);
    const cli = getSkipTake(opts?.pagesPerType?.clients);
    const tst = getSkipTake(opts?.pagesPerType?.testimonials);
    const tm = getSkipTake(opts?.pagesPerType?.team);
    const [rawSvc, rawPrj, rawCli, rawTst, rawTm] = await Promise.all([
      this.prisma.serviceSlideShow.findMany({
        where: { slideShowId },
        orderBy: { order: "asc" },
        skip: svc.skip,
        take: svc.take,
        select: {
          id: true,
          order: true,
          customDesc: true,
          customTitle: true,
          isVisible: true,
          service: {
            select: { id: true, name: true, slug: true, image: true },
          },
        },
      }),
      this.prisma.projectSlideShow.findMany({
        where: { slideShowId },
        orderBy: { order: "asc" },
        skip: prj.skip,
        take: prj.take,
        select: {
          id: true,
          order: true,
          isVisible: true,
          project: {
            select: { id: true, title: true, slug: true, image: true },
          },
        },
      }),

      this.prisma.clientSlideShow.findMany({
        where: { slideShowId },
        orderBy: { order: "asc" },
        skip: cli.skip,
        take: cli.take,

        select: {
          id: true,
          order: true,
          isVisible: true,

          client: { select: { id: true, name: true, slug: true, image: true } },
        },
      }),
      this.prisma.testimonialSlideShow.findMany({
        where: { slideShowId },
        orderBy: { order: "asc" },
        skip: tst.skip,
        take: tst.take,
        select: {
          id: true,
          order: true,
          isVisible: true,

          testimonial: {
            select: { id: true, clientName: true, content: true, avatar: true },
          },
        },
      }),
      this.prisma.teamSlideShow.findMany({
        where: { slideShowId },
        orderBy: { order: "asc" },
        skip: tm.skip,
        take: tm.take,
        select: {
          id: true,
          order: true,
          isVisible: true,
          team: {
            select: { id: true, name: true, position: true, image: true },
          },
        },
      }),
    ]);

    const process = (arr: any[], perPage: number) => {
      const hasMore = arr.length > perPage;
      if (hasMore) arr = arr.slice(0, perPage);
      return { items: arr, hasMore };
    };

    const svcPage = process(rawSvc, svc.perPage);
    const prjPage = process(rawPrj, prj.perPage);
    const cliPage = process(rawCli, cli.perPage);
    const tstPage = process(rawTst, tst.perPage);
    const tmPage = process(rawTm, tm.perPage);

    const toSlides = (rows: any[], type: string, dataKey: string) =>
      rows.map((r) => ({ type, id: r.id, order: r.order, data: r[dataKey] }));

    const slides = [
      ...toSlides(svcPage.items, "service", "service"),
      ...toSlides(prjPage.items, "project", "project"),
      ...toSlides(cliPage.items, "client", "client"),
      ...toSlides(tstPage.items, "testimonial", "testimonial"),
      ...toSlides(tmPage.items, "team", "team"),
    ].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

    return {
      pages: {
        services: {
          page: svc.page,
          perPage: svc.perPage,
          hasMore: svcPage.hasMore,
        },
        projects: {
          page: prj.page,
          perPage: prj.perPage,
          hasMore: prjPage.hasMore,
        },
        clients: {
          page: cli.page,
          perPage: cli.perPage,
          hasMore: cliPage.hasMore,
        },
        testimonials: {
          page: tst.page,
          perPage: tst.perPage,
          hasMore: tstPage.hasMore,
        },
        team: { page: tm.page, perPage: tm.perPage, hasMore: tmPage.hasMore },
      },
      slides,
      slidesCount: await this.slideShowSlidesCount(slideShowId),
    };
  }
  // async getSlidesPagedFull(
  //   slideShowId: string,
  //   opts?: {
  //     perPage?: number;
  //     page?: number;
  //     pagesPerType?: Partial<
  //       Record<
  //         "services" | "projects" | "clients" | "testimonials" | "team",
  //         number
  //       >
  //     >;
  //   }
  // ) {
  //   await this.findById(slideShowId);
  //   const perPageDefault = Math.min(Math.max(opts?.perPage ?? 10, 1), 100);
  //   const pageDefault = Math.max(opts?.page ?? 1, 1);

  //   const getSkipTake = (page?: number, perPage = perPageDefault) => {
  //     const p = Math.max(page ?? pageDefault, 1);
  //     return { skip: (p - 1) * perPage, take: perPage + 1, page: p, perPage };
  //   };

  //   const svc = getSkipTake(opts?.pagesPerType?.services);
  //   const prj = getSkipTake(opts?.pagesPerType?.projects);
  //   const cli = getSkipTake(opts?.pagesPerType?.clients);
  //   const tst = getSkipTake(opts?.pagesPerType?.testimonials);
  //   const tm = getSkipTake(opts?.pagesPerType?.team);
  //   const [rawSvc, rawPrj, rawCli, rawTst, rawTm] = await Promise.all([
  //     this.prisma.serviceSlideShow.findMany({
  //       where: { slideShowId },
  //       orderBy: { order: "asc" },
  //       skip: svc.skip,
  //       take: svc.take,
  //       select: {
  //         id: true,
  //         order: true,
  //         customDesc: true,
  //         customTitle: true,
  //         isVisible: true,
  //         service: {
  //           select: { id: true, name: true, slug: true, image: true },
  //         },
  //       },
  //     }),
  //     this.prisma.projectSlideShow.findMany({
  //       where: { slideShowId },
  //       orderBy: { order: "asc" },
  //       skip: prj.skip,
  //       take: prj.take,
  //       select: {
  //         id: true,
  //         order: true,
  //         isVisible: true,
  //         project: {
  //           select: { id: true, title: true, slug: true, image: true },
  //         },
  //       },
  //     }),

  //     this.prisma.clientSlideShow.findMany({
  //       where: { slideShowId },
  //       orderBy: { order: "asc" },
  //       skip: cli.skip,
  //       take: cli.take,

  //       select: {
  //         id: true,
  //         order: true,
  //         isVisible: true,

  //         client: { select: { id: true, name: true, slug: true, image: true } },
  //       },
  //     }),
  //     this.prisma.testimonialSlideShow.findMany({
  //       where: { slideShowId },
  //       orderBy: { order: "asc" },
  //       skip: tst.skip,
  //       take: tst.take,
  //       select: {
  //         id: true,
  //         order: true,
  //         isVisible: true,

  //         testimonial: {
  //           select: { id: true, clientName: true, content: true, avatar: true },
  //         },
  //       },
  //     }),
  //     this.prisma.teamSlideShow.findMany({
  //       where: { slideShowId },
  //       orderBy: { order: "asc" },
  //       skip: tm.skip,
  //       take: tm.take,
  //       select: {
  //         id: true,
  //         order: true,
  //         isVisible: true,
  //         team: {
  //           select: { id: true, name: true, position: true, image: true },
  //         },
  //       },
  //     }),
  //   ]);

  //   const process = (arr: any[], perPage: number) => {
  //     const hasMore = arr.length > perPage;
  //     if (hasMore) arr = arr.slice(0, perPage);
  //     return { items: arr, hasMore };
  //   };

  //   const svcPage = process(rawSvc, svc.perPage);
  //   const prjPage = process(rawPrj, prj.perPage);
  //   const cliPage = process(rawCli, cli.perPage);
  //   const tstPage = process(rawTst, tst.perPage);
  //   const tmPage = process(rawTm, tm.perPage);

  //   const toSlides = (rows: any[], type: string, dataKey: string) =>
  //     rows.map((r) => ({ type, id: r.id, order: r.order, data: r[dataKey] }));

  //   const slides = [
  //     ...toSlides(svcPage.items, "service", "service"),
  //     ...toSlides(prjPage.items, "project", "project"),
  //     ...toSlides(cliPage.items, "client", "client"),
  //     ...toSlides(tstPage.items, "testimonial", "testimonial"),
  //     ...toSlides(tmPage.items, "team", "team"),
  //   ].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  //   return {
  //     pages: {
  //       services: {
  //         page: svc.page,
  //         perPage: svc.perPage,
  //         hasMore: svcPage.hasMore,
  //       },
  //       projects: {
  //         page: prj.page,
  //         perPage: prj.perPage,
  //         hasMore: prjPage.hasMore,
  //       },
  //       clients: {
  //         page: cli.page,
  //         perPage: cli.perPage,
  //         hasMore: cliPage.hasMore,
  //       },
  //       testimonials: {
  //         page: tst.page,
  //         perPage: tst.perPage,
  //         hasMore: tstPage.hasMore,
  //       },
  //       team: { page: tm.page, perPage: tm.perPage, hasMore: tmPage.hasMore },
  //     },
  //     slides,
  //     slidesCount: await this.slideShowSlidesCount(slideShowId),
  //   };
  // }

  // attaches
  async attach({
    slideShowId,
    attachType,
    attachId,
    order,
    isVisible,
    customDesc = "",
    customTitle = "",
    isMany = false,
    tx,
  }: {
    slideShowId: string;
    attachType: "service" | "client" | "project" | "testimonial" | "teamMember";
    attachId: string;
    order: number;
    isVisible: boolean;
    isMany?: boolean;
    customTitle?: string;
    customDesc?: string;
    tx?: txInstance;
  }): Promise<AttachmentTypes> {
    try {
      const prismaTouse = tx || this.prisma;
      if (!isMany) await this.findById(slideShowId);

      const findAttach = await (
        this.modelMap(prismaTouse || this.prisma)[attachType].findUnique as any
      )({
        where: { id: attachId },
      });

      if (!findAttach) {
        throw new ServiceError(
          "Attach entity not found id: " + attachId,
          404,
          "id not found in DB"
        );
      }

      const fieldName = `${
        attachType === "teamMember" ? "team" : attachType
      }Id` as any;

      const lastOrder =
        (await (
          this.modelAttachMap(prismaTouse || this.prisma)[attachType] as any
        ).count()) - 1;
      const findIstheretheOrder = await (
        this.modelAttachMap(prismaTouse || this.prisma)[attachType] as any
      ).findFirst({
        where: {
          order: order,
        },
      });

      if (findIstheretheOrder) {
        order = lastOrder + 1;
      }
      if (order && order > lastOrder) {
        order = lastOrder + 1;
      }

      let attach;

      attach = await (
        this.modelAttachMap(prismaTouse || this.prisma)[attachType]
          .create as any
      )({
        data: {
          slideShowId,
          [fieldName]: attachId,
          order,
          isVisible,
          customTitle: customTitle || "",
          customDesc: customDesc || "",
        },
      });

      return attach as
        | TestimonialSlideShow
        | TeamSlideShow
        | ClientSlideShow
        | ProjectSlideShow
        | ServiceSlideShow;
    } catch (error) {
      console.error(error);
      throw new ServiceError(
        "error attaching to slideshow",
        400,
        "SLIDESHOW_ATTACH_ERROR"
      );
    }
  }

  // reorder  on the slide show attachments and reodred in slide show attachmentJoinsModel

  async attachMany({
    slideShowId,
    attachobj,
  }: {
    slideShowId: string;
    attachobj: Array<{
      type: "service" | "client" | "project" | "testimonial" | "teamMember";
      id: string;
      order: number;
      isVisible: boolean;
      customTitle?: string;
      customDesc?: string;
    }>;
  }) {
    try {
      await this.findById(slideShowId);
      const tranisction = this.prisma.$transaction(async (tx) => {
        const promises = await Promise.all(
          attachobj.map((att) => {
            return this.attach({
              slideShowId,
              attachType: att.type,
              attachId: att.id,
              order: att.order,
              isVisible: att.isVisible,
              isMany: true,
              customTitle: att.customTitle || "",
              customDesc: att.customDesc || "",
              tx,
            });
          })
        );
        return promises;
      });
      return tranisction;
    } catch (error) {
      console.error(error);
      throw new ServiceError(
        "error attaching to slideshow",
        400,
        "SLIDESHOW_ATTACH_ERROR_MANY"
      );
    }
  }

  async Deattach({
    slideShowId,
    type: attachType,
    id: attachId,
    isMany = false,
    tx,
  }: deattachDTO & {
    tx?: txInstance;
    isMany?: boolean;
  }): Promise<AttachmentWithSlideShowRelationsModels> {
    try {
      const prismaTouse = tx || this.prisma;
      if (!isMany) await this.findById(slideShowId, prismaTouse);

      const findTheAttachedTable = await this.findAttachTable(
        attachId,
        attachType,
        prismaTouse
      );

      if (!findTheAttachedTable) {
        throw new ServiceError(
          "Attach entity not found id: " + attachId,
          404,
          "id not found in DB"
        );
      }

      const fieldName = `${
        attachType === "teamMember" ? "team" : attachType
      }Id` as any;

      let attach;

      attach = await (
        this.modelAttachMap(prismaTouse || this.prisma)[attachType]
          .delete as any
      )({
        where: {
          [`${fieldName}_slideShowId`]: {
            slideShowId,
            [fieldName]: attachId,
          },

          // [fieldName]: attachId, slideShowId
        },
      });

      return attach as AttachmentWithSlideShowRelationsModels;
    } catch (error) {
      console.error(error);
      throw new ServiceError(
        "error attaching to slideshow",
        400,
        "SLIDESHOW_ATTACH_ERROR"
      );
    }
  }
  async DeattachMany({ slideShowId, items: attachobj }: deattachManyDTO) {
    try {
      const tranisction = this.prisma.$transaction(async (tx) => {
        await this.findById(slideShowId, tx);
        const promises = await Promise.all(
          attachobj.map((att) => {
            return this.Deattach({
              slideShowId,
              type: att.type,
              id: att.id,
              isMany: true,
              tx,
            });
          })
        );
        return promises;
      });
      return tranisction;
    } catch (error) {
      console.error(error);
      throw new ServiceError(
        "error attaching to slideshow",
        400,
        "SLIDESHOW_ATTACH_ERROR_MANY"
      );
    }
  }

  async createAndAttachMany({ slides, ...rest }: CreateAndAttachMany) {
    try {
      const transiction = this.prisma.$transaction(
        async (tx) => {
          const slug = slugify(rest.title + randomUUID().substring(0, 6), {
            lower: true,
          });

          const slideShow = await tx.slideShow.create({
            data: {
              ...rest,
              slug,
            },
          });
          const cerated = Promise.all(
            slides.map((att) => {
              return this.attach({
                slideShowId: slideShow.id,
                attachType: att.type,
                attachId: att.id,
                order: att.order,
                isVisible: att.isVisible,
                isMany: true,
                customTitle: att.customTitle || "",
                customDesc: att.customDesc || "",
                tx,
              });
            })
          );

          return { slideShow, attacheds: await cerated };
        },
        {
          maxWait: 5000,
          timeout: 10000,
        }
      );
      return transiction;
    } catch (error) {
      console.error(error);
      throw new ServiceError(
        "error creating and attaching to slideshow",
        400,
        "SLIDESHOW_CREATE_ATTACH_ERROR_MANY"
      );
    }
  }

  async getALlGroup(slideShowId: string) {
    const allGroups = await this.prisma.slideShow.groupBy({
      where: { id: slideShowId },
      by: ["type"],
      _count: true,
    });

    return allGroups;
  }
  async getAttachedsGrouped({
    slideShowId,
    skip,
    take,
  }: {
    slideShowId: string;
    skip: number;
    take: number;
  }): Promise<
    (Prisma.PickEnumerable<Prisma.SlideShowGroupByOutputType, "type"[]> & {})[]
  > {
    try {
      const res = await this.prisma.slideShow.groupBy({
        where: {
          id: slideShowId,
        },
        by: ["type"],
        orderBy: {
          type: "asc",
        },
        _count: true,

        skip: skip * take,
        take: take,
      });
      return res;
    } catch (error) {
      console.error(error);
      throw new ServiceError(
        "error getting attacheds to slideshow Grouped by type",
        400,
        "SLIDESHOW_ATTACH_ERROR_MANY"
      );
    }
  }
  async getSlideShowByTypeCount(type: SlideshowType) {
    return await this.prisma.slideShow.count({
      where: {
        type,
      },
    });
  }
  async getslideShowByType({
    type,
    skip,
    take,
  }: {
    type: SlideshowType;
    skip: number;
    take: number;
  }) {
    try {
      const find = await this.prisma.slideShow.findMany({
        where: {
          type: type,
        },
        orderBy: {
          order: "asc",
        },
        include: {
          [type.toLowerCase()]: {
            orderBy: {
              order: "asc",
            },
          },
        },
        skip: skip * take,
        take: take,
      });
      return find;
    } catch (error) {
      console.error(error);
      throw new ServiceError(
        "error getting attacheds to slideshow",
        400,
        "SLIDESHOW_ATTACH_ERROR_MANY"
      );
    }
  }
  async getAttachesByTypeCount({
    slideShowId,
    type,
  }: {
    slideShowId: string;
    type: "service" | "client" | "project" | "testimonial" | "teamMember";
  }) {
    const d = await (this.modelAttachMap(this.prisma)[type] as any).count({});
    return d;
  }
  async getAttachesByType({
    slideShowId,
    type,
    skip,
    take,
  }: {
    slideShowId: string;
    type: "service" | "client" | "project" | "testimonial" | "teamMember";
    skip: number;
    take: number;
  }) {
    try {
      const transaction = this.prisma.$transaction(async (tx) => {
        await this.findById(slideShowId, tx);
        return await (this.modelAttachMap(tx)[type] as any).findMany({
          skip: skip * take,
          take: take,
          include: {
            [type]: true,
          },
          orderBy: {
            order: "asc",
          },
        });
      });
      return transaction;
    } catch (error) {
      console.error(error);
      throw new ServiceError(
        "error getting attacheds to slideshow",
        400,
        "SLIDESHOW_ATTACH_ERROR_MANY"
      );
    }
  }
}
