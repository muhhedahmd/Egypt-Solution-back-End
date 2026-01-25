import {
  deleteImageById,
  UploadImage,
  UploadImageWithoutBlurHAsh,
} from "../../lib/helpers";
import {
  CreateServiceDTO,
  updateService,
  interFaceSearchService,
} from "../../types/services";

import { PrismaClientConfig } from "../../config/prisma";
import { AssignImageToDBImage } from "../../lib/helpers";
import slugify from "slugify";
import { randomUUID } from "crypto";
import { ServiceError } from "../../errors/services.error";

export class ServicesRepository {
  constructor(private prisma: PrismaClientConfig) {}

  async findMany(
    lang: "AR" | "EN" = "EN",
    skip: number,
    take: number,
    Active: boolean,
    isFeatured: boolean
  ) {
    const _Where: Record<string, boolean> = {};
    if (Active) _Where.isActive = true;
    if (Active && isFeatured) {
      _Where.isActive = true;
      _Where.isFeatured = true;
    }

    const find = await this.prisma.service.findMany({
      where: _Where,
      select: {
        id: true,
        slug: true,
        price: true,
        isActive: true,
        isFeatured: true,
        createdAt: true,
        updatedAt: true,
        image: true,
        serviceTranslation: {
          where: {
            lang,
          },
        },
      },

      skip: skip * take,
      take: take,
    });

    const fixedReturn = find.map((s) => {
      const {
        image,
        serviceTranslation,
        createdAt,
        id,
        isActive,
        isFeatured,
        price,
        slug,
        updatedAt,
      } = s;
      return {
        image,
        ...serviceTranslation[0],
        createdAt,
        id,
        isActive,
        isFeatured,
        price,
        slug,
        updatedAt,
      };
    });
    return fixedReturn;
  }

  async isValidOrder({ order }: { order: number }) {
    console.log({ order });
    try {
      const find = await this.prisma.service.findFirst({
        where: { order },
      });
      return {
        isValid: !find,
        takenby: find,
      };
    } catch (error) {
      console.log(error);
      throw new Error("Error finding service by order");
    }
  }
  async count() {
    return this.prisma.service.count();
  }

  async findById(lang: "EN" | "AR" = "EN", id: string) {
    try {
      const find = await this.prisma.service.findUnique({
        where: { id },
        select: {
          id: true,
          slug: true,
          price: true,
          isActive: true,
          isFeatured: true,
          createdAt: true,
          updatedAt: true,
          image: true,
          serviceTranslation: {
            where: {
              lang,
            },
          },
        },
      });
      if (!find) throw new Error("Error finding service by ID");

      const {
        image,
        serviceTranslation,
        createdAt,
        isActive,
        isFeatured,
        price,
        slug,
        updatedAt,
      } = find;
      return {
        image,
        ...serviceTranslation[0],
        createdAt,
        id,
        isActive,
        isFeatured,
        price,
        slug,
        updatedAt,
      };
    } catch (error) {
      console.log(error);
      throw new Error("Error finding service by ID");
    }
  }

  async findBySlug( slug: string) {
    try {
      const findedService = await this.prisma.service.findUnique({
        where: { slug },
        include: {
          image: true,
          serviceTranslation:  true ,
          projects: {
            include: {
              image: true,
            },
          },
        },
      });

      if (!findedService) {
        return null;
      }

      // const image = findedService?.image
      const { image, projects, ...rest } = findedService;
      return {
        image: image || null,
        projects: projects.map((project) => {
          const { image: PImage, ...pRest } = project;
          return {
            project: pRest,
            image: PImage || null,
          };
        }),
        service: rest,
      };
    } catch (error) {
      console.error(error);
      throw new ServiceError(
        "Error finding service",
        400,
        "SERVICE_SEARCH_ERROR"
      );
    }
  }
  async SearchService(
    searchTerm: string,
    skip: number,
    take: number
  ): Promise<interFaceSearchService[]> {
    try {
      const Services = await this.prisma.service.findMany({
        where: {
          OR: [
            {
              name: {
                contains: searchTerm,
                mode: "insensitive",
              },
            },
            {
              description: {
                contains: searchTerm,
                mode: "insensitive",
              },
            },
            {
              richDescription: {
                contains: searchTerm,
                mode: "insensitive",
              },
            },
            {
              slug: {
                contains: searchTerm,
                mode: "insensitive",
              },
            },
          ],
        },
        include: {
          image: true,
        },
        skip: skip * take,
        take,
        orderBy: {
          createdAt: "desc",
        },
      });

      return Services;
    } catch (error) {
      console.error(error);
      throw new ServiceError(
        "Error searching service",
        400,
        "SERVICE_SEARCH_ERROR"
      );
    }
  }
  async create(lang: "EN" | "AR", data: CreateServiceDTO & { slug: string }) {
    try {
      const transication = await this.prisma.$transaction(
        async (tx) => {
          const slug = slugify(data.name + randomUUID().substring(0, 8), {
            lower: true,
          });
          if (!slug) throw new Error("error create slug");

          if (!data.image) throw new Error("no image provided");
          const createImage = await UploadImage(data.image, data.name);
          if (!createImage) throw new Error("error upload image");
          const imageToDB = await AssignImageToDBImage(
            {
              imageType: "SERVICE",
              blurhash: createImage.blurhash,
              width: createImage.width,
              height: createImage.height,
              data: createImage.data,
            },
            tx
          );
          if (!imageToDB) throw new Error("error create imageToDB");

          let iconUrl = data.icon;
          if (!iconUrl && data.iconImage) {
            const createIconImage = await UploadImageWithoutBlurHAsh(
              data.iconImage,
              data.name + "icon"
            );
            if (createIconImage)
              iconUrl = createIconImage.data?.[0]?.data?.ufsUrl;
          }
          const service = await tx.service.create({
            data: {
              slug: slug,
              name: "",

              imageId: imageToDB.id,
              icon: iconUrl || "",
              price: data.price || "",
              isActive: data.isActive || false,
              isFeatured: data.isFeatured || false,
              order: data.order || 0,
              serviceTranslation: {
                create: {
                  name: data.name,
                  description: data.description,
                  richDescription: data.richDescription,
                  lang: lang,
                },
              },
            },
            select: {
              id: true,
              slug: true,
              price: true,
              isActive: true,
              isFeatured: true,
              createdAt: true,
              updatedAt: true,
              serviceTranslation: true,
              image: true,
            },
          });
          const { image, serviceTranslation, ...rest } = service;
          const translatedData = {
            ...serviceTranslation[0],
            serviceId: service.id,
          };
          return { Image: image, service: { ...rest, ...translatedData } };
        },
        {
          timeout: 20000,
          maxWait: 5000,
        }
      );
      return transication;
    } catch (error) {
      console.log(error);
    }
  }

  async update(lang: "EN" | "AR", data: updateService) {
    try {
      const transaction = await this.prisma.$transaction(
        async (prismaTx) => {
          let NewImageId: string | null = null;

          if (!data.serviceId) throw new Error("no serviceId provided");

          const service = await prismaTx.service.findUnique({
            where: { id: data.serviceId },
          });

          if (!service) throw new Error("service not found");

          console.log("update service in repo", data, service);

          NewImageId = service?.imageId || null;

          if (data.imageState === "REMOVE") {
            if (service.imageId) {
              await prismaTx.service.update({
                where: { id: data.serviceId },
                data: { imageId: null },
              });
              await deleteImageById(service.imageId, prismaTx);
            }
            NewImageId = null;
          }

          if (data.imageState === "UPDATE") {
            if (service.imageId) {
              await prismaTx.service.update({
                where: { id: data.serviceId },
                data: { imageId: null },
              });

              await deleteImageById(service.imageId, prismaTx);
            }

            if (!data.image) throw new Error("no image provided");

            const createImage = await UploadImage(
              data.image,
              data.name || "update"
            );

            if (!createImage) throw new Error("error upload image");

            const imageToDB = await AssignImageToDBImage(
              {
                imageType: "SERVICE",
                blurhash: createImage.blurhash,
                width: createImage.width,
                height: createImage.height,
                data: createImage.data,
              },
              prismaTx
            );

            if (!imageToDB) throw new Error("error create imageToDB");

            NewImageId = imageToDB.id;
          }

          // Generate new slug if name changed
          if (data.name && data.name !== service.name) {
            const slug = slugify(data.name + randomUUID().substring(0, 8), {
              lower: true,
            });
            data.slug = slug;
          }

          // console.log("Service ID:", data.serviceId, NewImageId);

          // Update the service with new data
          const updatedService = await prismaTx.service.update({
            where: { id: data.serviceId },
            data: {
              slug: data.slug || service.slug,
              name: "",

              imageId: NewImageId,
              icon: data.icon || service.icon || "",
              price: data.price || service.price || "",
              isActive: data.isActive || service.isActive || false,
              isFeatured: data.isFeatured || service.isFeatured || false,
              order: data.order || service.order || 0,
            },
            select: {
              id: true,
              slug: true,
              price: true,
              isActive: true,
              isFeatured: true,
              createdAt: true,
              updatedAt: true,
              image: true,
            },
          });

          // update translation
          const updateTranslation = await prismaTx.serviceTranslation.upsert({
            where: {
              serviceId_lang: {
                lang,
                serviceId: data.serviceId,
              },
            },
            update: {
              name: data.name || service.name || "",
              description: data.description || service.description,
              richDescription: data.richDescription || service.richDescription,
            },
            create: {
              serviceId: data.serviceId,
              name: data.name || service.name || "",
              description: data.description || service.description,
              richDescription: data.richDescription || service.richDescription,
              lang,
            },
            // data: {

            //   name: data.name || service.name,
            //   description: data.description || service.description,
            //   richDescription: data.richDescription || service.richDescription,
            //   lang ,
            // },
            select: {
              name: true,
              description: true,
              richDescription: true,
            },
          });

          const { image, ...rest } = updatedService;
          return { Image: image, service: { ...rest, ...updateTranslation } };
        },
        {
          timeout: 20000,
          maxWait: 5000,
        }
      );

      return transaction;
    } catch (error) {
      console.log(error);
      throw new Error("Error updating service");
    }
  }

  async delete(id: string) {
    try {
      const transaction = await this.prisma.$transaction(
        async (prismaTx) => {
          const service = await prismaTx.service.findUnique({ where: { id } });
          if (!service) throw new Error("service not found");
          await prismaTx.service.update({
            where: { id },
            data: { imageId: null },
          });
          if (service.imageId) await deleteImageById(service.imageId, prismaTx);
          await prismaTx.service.delete({ where: { id } });
          return service;
        },
        {
          timeout: 20000, // (milliseconds)
          maxWait: 5000, // default: 2000
        }
      );
      return transaction;
    } catch (error) {
      console.log(error);
      throw new Error("Error deleting service");
    }
  }
}
