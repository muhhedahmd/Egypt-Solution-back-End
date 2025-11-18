import slugify from "slugify";
import { randomUUID } from "crypto";
import { PrismaClientConfig } from "../../config/prisma";
import {
  deleteImageById,
  UploadImage,
  AssignImageToDBImage,
} from "../../lib/helpers";
import {
  CreateClientDTO,
  UpdateClient,
  InterFaceSearchClient,
} from "../../types/client";
import { ClientError } from "../../errors/client.error";

export class ClientRepository {
  constructor(private prisma: PrismaClientConfig) {}

  async findMany(skip: number, take: number) {
    try {
      const clients = this.prisma.client.findMany({
        include: {
          image: true,
          logo: true,
        },
        skip: skip * take,
        take: take,
        orderBy: {
          order: "asc",
        },
      });
      return (await clients).map((client) => {
        const { image, logo, ...rest } = client;
        return {
          client: rest,
          image: image || null,
          logo: logo || null,
        };
      });
    } catch (error) {
      console.error(error);
      throw new ClientError(
        "Error finding client",
        400,
        "CLIENT_FIND_MANY_ERROR"
      );
    }
  }

  async isValidOrder({ order }: { order: number }) {
    try {
      const find = await this.prisma.client.findFirst({
        where: { order },
      });
      return {
        isValid: !find,
        takenby: find,
      };
    } catch (error) {
      console.error(error);
      throw new Error("Error finding client by order");
    }
  }

  async count() {
    return this.prisma.client.count();
  }

  async findById(id: string) {
    try {
      return this.prisma.client.findUnique({
        where: { id },
        include: {
          image: true,
          logo: true,
        },
      });
    } catch (error) {
      console.error(error);
      throw new Error("Error finding client by ID");
    }
  }

  async findBySlug(slug: string) {
    try {
      const findedClient = await this.prisma.client.findUnique({
        where: { slug },
        include: {
          image: true,
          logo: true,
        },
      });

      if (!findedClient) {
        return null;
      }

      const { image, logo, ...rest } = findedClient;
      return {
        image: image || null,
        logo: logo || null,
        client: rest,
      };
    } catch (error) {
      console.error(error);
      throw new ClientError("Error finding client", 400, "CLIENT_SEARCH_ERROR");
    }
  }

  async SearchClient(searchTerm: string, skip: number, take: number) {
    try {
      const clients = await this.prisma.client.findMany({
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
              industry: {
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
          logo: true,
        },
        skip: skip * take,
        take,
        orderBy: {
          createdAt: "desc",
        },
      });

      return clients.map((client) => {
        const { image, logo, ...rest } = client;
        return {
          client: rest,
          image: image || null,
          logo: logo || null,
        };
      });
    } catch (error) {
      console.error(error);
      throw new ClientError(
        "Error searching client",
        400,
        "CLIENT_SEARCH_ERROR"
      );
    }
  }

  async create(data: CreateClientDTO & { slug: string }) {
    try {
      const transaction = await this.prisma.$transaction(
        async (tx) => {
          const slug = slugify(data.name + randomUUID().substring(0, 8), {
            lower: true,
          });
          if (!slug) throw new Error("error create slug");

          let imageId: string | null = null;
          let logoId: string | null = null;

          // Upload main image if provided
          if (data.image) {
            const createImage = await UploadImage(data.image, data.name);
            if (!createImage) throw new Error("error upload image");

            const imageToDB = await AssignImageToDBImage(
              {
                imageType: "CLIENT",
                blurhash: createImage.blurhash,
                width: createImage.width,
                height: createImage.height,
                data: createImage.data,
              },
              tx
            );
            if (!imageToDB) throw new Error("error create imageToDB");
            imageId = imageToDB.id;
          }

          // Upload logo if provided
          if (data.logo) {
            const createLogo = await UploadImage(
              data.logo,
              data.name + "-logo"
            );
            if (!createLogo) throw new Error("error upload logo");

            const logoToDB = await AssignImageToDBImage(
              {
                imageType: "CLIENT",
                blurhash: createLogo.blurhash,
                width: createLogo.width,
                height: createLogo.height,
                data: createLogo.data,
              },
              tx
            );
            if (!logoToDB) throw new Error("error create logoToDB");
            logoId = logoToDB.id;
          }

          const client = await tx.client.create({
            data: {
              slug: slug,
              name: data.name,
              description: data.description,
              richDescription: data.richDescription,
              website: data.website,
              industry: data.industry,
              imageId: imageId,
              logoId: logoId,
              isActive: data.isActive || false,
              isFeatured: data.isFeatured || false,
              order: data.order || 0,
            },
            include: {
              image: true,
              logo: true,
            },
          });

          const { image, logo, ...rest } = client;
          return { Image: image, Logo: logo, client: rest };
        },
        {
          timeout: 20000,
          isolationLevel: "Serializable",
          maxWait: 5000,
        }
      );
      return transaction;
    } catch (error) {
      console.error(error);
      throw new Error("Error creating client");
    }
  }

  async update(data: UpdateClient) {
    try {
      const transaction = await this.prisma.$transaction(
        async (prismaTx) => {
          let NewImageId: string | null = null;
          let NewLogoId: string | null = null;

          if (!data.clientId) throw new Error("no clientId provided");

          const client = await prismaTx.client.findUnique({
            where: { id: data.clientId },
          });

          if (!client) throw new Error("client not found");

          NewImageId = client?.imageId || null;
          NewLogoId = client?.logoId || null;

          // Handle image update/removal
          if (data.imageState === "REMOVE") {
            if (client.imageId) {
              await prismaTx.client.update({
                where: { id: data.clientId },
                data: { imageId: null },
              });
              await deleteImageById(client.imageId, prismaTx);
            }
            NewImageId = null;
          }

          if (data.imageState === "UPDATE") {
            if (client.imageId) {
              await prismaTx.client.update({
                where: { id: data.clientId },
                data: { imageId: null },
              });
              await deleteImageById(client.imageId, prismaTx);
            }

            if (!data.image) throw new Error("no image provided");

            const createImage = await UploadImage(
              data.image,
              data.name || "update"
            );

            if (!createImage) throw new Error("error upload image");

            const imageToDB = await AssignImageToDBImage(
              {
                imageType: "CLIENT",
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

          // Handle logo update/removal
          if (data.logoState === "REMOVE") {
            if (client.logoId) {
              await prismaTx.client.update({
                where: { id: data.clientId },
                data: { logoId: null },
              });
              await deleteImageById(client.logoId, prismaTx);
            }
            NewLogoId = null;
          }

          if (data.logoState === "UPDATE") {
            if (client.logoId) {
              await prismaTx.client.update({
                where: { id: data.clientId },
                data: { logoId: null },
              });
              await deleteImageById(client.logoId, prismaTx);
            }

            if (!data.logo) throw new Error("no logo provided");

            const createLogo = await UploadImage(
              data.logo,
              (data.name || "update") + "-logo"
            );

            if (!createLogo) throw new Error("error upload logo");

            const logoToDB = await AssignImageToDBImage(
              {
                imageType: "CLIENT",
                blurhash: createLogo.blurhash,
                width: createLogo.width,
                height: createLogo.height,
                data: createLogo.data,
              },
              prismaTx
            );

            if (!logoToDB) throw new Error("error create logoToDB");
            NewLogoId = logoToDB.id;
          }

          // Generate new slug if name changed
          if (data.name && data.name !== client.name) {
            const slug = slugify(data.name + randomUUID().substring(0, 8), {
              lower: true,
            });
            data.slug = slug;
          }

          // Update the client with new data
          const updatedClient = await prismaTx.client.update({
            where: { id: data.clientId },
            data: {
              slug: data.slug || client.slug,
              name: data.name || client.name,
              description: data.description || client.description,
              richDescription: data.richDescription || client.richDescription,
              website: data.website || client.website,
              industry: data.industry || client.industry,
              imageId: NewImageId,
              logoId: NewLogoId,
              isActive: data.isActive ?? client.isActive,
              isFeatured: data.isFeatured ?? client.isFeatured,
              order: data.order ?? client.order,
            },
            include: { image: true, logo: true },
          });

          const { image, logo, ...rest } = updatedClient;
          return { Image: image, Logo: logo, client: rest };
        },
        {
          timeout: 20000,
          maxWait: 5000,
        }
      );

      return transaction;
    } catch (error) {
      console.error(error);
      throw new Error("Error updating client");
    }
  }

  async delete(id: string) {
    try {
      const transaction = await this.prisma.$transaction(
        async (prismaTx) => {
          const client = await prismaTx.client.findUnique({ where: { id } });
          if (!client) throw new Error("client not found");

          await prismaTx.client.update({
            where: { id },
            data: { imageId: null, logoId: null },
          });

          if (client.imageId) await deleteImageById(client.imageId, prismaTx);
          if (client.logoId) await deleteImageById(client.logoId, prismaTx);

          await prismaTx.client.delete({ where: { id } });
          return client;
        },
        {
          timeout: 20000,
          maxWait: 5000,
        }
      );
      return transaction;
    } catch (error) {
      console.error(error);
      throw new Error("Error deleting client");
    }
  }
}
