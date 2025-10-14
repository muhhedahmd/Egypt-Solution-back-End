import { deleteImageById, UploadImage } from "../../lib/helpers";
import { CreateServiceDTO, updateService } from "../../types/services";
import { PrismaClientConfig } from "../../config/prisma";
import { AssignImageToDBImage } from "../../lib/helpers";
import slugify from "slugify";
import { randomUUID } from "crypto";

export class ServicesRepository {
  constructor(private prisma: PrismaClientConfig) {}

  async findMany(skip: number, take: number) {
    return this.prisma.service.findMany({
      include: { image: true },

      skip: skip * take,
      take: take,
    });
  }

  async count() {
    return this.prisma.service.count();
  }

  async findById(id: string) {
    try {
      return this.prisma.service.findUnique({
        where: { id },
        include: { image: true },
      });
    } catch (error) {
      console.log(error);
      throw new Error("Error finding service by ID");
    }
  }

  async create(data: CreateServiceDTO & { slug: string }) {

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
          const service = await tx.service.create({
            data: {
              slug: slug,
              name: data.name,
              description: data.description,
              richDescription: data.richDescription,
              imageId: imageToDB.id,
              icon: data.icon || "",
              price: data.price ||   "",
              isActive: data.isActive ||  false,
              isFeatured: data.isFeatured ||  false,
              order: data.order  || 0,
            },
            include: {
              image: true,
            },
          });
          const { image, ...rest } = service;
          return { Image: image, service: rest };
        },
        {
          timeout: 20000, // (milliseconds)
          isolationLevel: "Serializable",
          maxWait: 5000, // default: 2000
        }
      );
      return transication;
    } catch (error) {
      console.log(error);
    }
  }

  async update(data: updateService) {
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

          console.log("Service ID:", data.serviceId, NewImageId);

          // Update the service with new data
          const updatedService = await prismaTx.service.update({
            where: { id: data.serviceId },
            data: {
              slug: data.slug || service.slug,
              name: data.name || service.name,
              description: data.description || service.description,
              richDescription: data.richDescription || service.richDescription,
              imageId: NewImageId, 
              icon: data.icon || service.icon || "",
              price: data.price ||  service.price|| "",
              isActive: data.isActive || service.isActive || false,
              isFeatured: data.isFeatured || service.isFeatured || false,
              order: data.order || service.order || 0,
            },
            include: { image: true },
          });

          const { image, ...rest } = updatedService;
          return { Image: image, service: rest };
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
          isolationLevel: "Serializable",
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
