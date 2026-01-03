import slugify from "slugify";
import { randomUUID } from "crypto";
import { PrismaClientConfig } from "../../config/prisma";
import {
  deleteImageById,
  UploadImage,
  AssignImageToDBImage,
} from "../../lib/helpers";
import {
  CreateTeamMemberDTO,
  UpdateTeamMember,
  InterFaceSearchTeamMember,
} from "../../types/team";
import { TeamError } from "../../errors/team.error";

export class TeamRepository {
  constructor(private prisma: PrismaClientConfig) {}

  async findMany(skip: number, take: number) {

    return this.prisma.teamMember.findMany({
      include: {
        image: true,
        slideShows: {
          include: {
            slideShow: true,
          },
        },
      },
      skip: skip * take,
      take: take,
      orderBy: {
        order: "asc",
      },
    });
  }
  async ActiveCount(isFeatured?: boolean) {
    return this.prisma.teamMember.count({
      where: {
        isActive: true,
        isFeatured: isFeatured || false,
      },
    });
  }
  async findManyActive(skip: number, take: number, isFeatured: boolean) {

    return this.prisma.teamMember.findMany({
      where: {
        isActive: true,
        isFeatured: isFeatured || false,
      },
      include: {
        image: true,
      },
      skip: skip * take,
      take: take,
      orderBy: {
        order: "asc",
      },
    });
  }

  async isValidOrder({ order }: { order: number }) {
    try {
      const find = await this.prisma.teamMember.findFirst({
        where: { order },
      });
      return {
        isValid: !find,
        takenby: find,
      };
    } catch (error) {
      console.error(error);
      throw new Error("Error finding team member by order");
    }
  }

  async count() {
    return this.prisma.teamMember.count();
  }

  async findById(id: string) {
    try {
      return this.prisma.teamMember.findUnique({
        where: { id },
        include: {
          image: true,
          slideShows: {
            include: {
              slideShow: true,
            },
          },
        },
      });
    } catch (error) {
      console.error(error);
      throw new Error("Error finding team member by ID");
    }
  }

  async findBySlug(slug: string) {
    try {
      const findedTeamMember = await this.prisma.teamMember.findUnique({
        where: { slug },
        include: {
          image: true,
          slideShows: {
            include: {
              slideShow: true,
            },
            orderBy: {
              order: "asc",
            },
          },
        },
      });

      if (!findedTeamMember) {
        return null;
      }

      const { image, slideShows, ...rest } = findedTeamMember;
      return {
        image: image || null,
        slideShows: slideShows.map((ss) => ({
          id: ss.id,
          order: ss.order,
          isVisible: ss.isVisible,
          slideShow: ss.slideShow,
          createdAt: ss.createdAt,
          updatedAt: ss.updatedAt,
        })),
        teamMember: rest,
      };
    } catch (error) {
      console.error(error);
      throw new TeamError(
        "Error finding team member",
        400,
        "TEAM_SEARCH_ERROR"
      );
    }
  }

  async SearchTeamMember(
    searchTerm: string,
    skip: number,
    take: number
  ): Promise<InterFaceSearchTeamMember[]> {
    try {
      const teamMembers = await this.prisma.teamMember.findMany({
        where: {
          OR: [
            {
              name: {
                contains: searchTerm,
                mode: "insensitive",
              },
            },
            {
              position: {
                contains: searchTerm,
                mode: "insensitive",
              },
            },
            {
              bio: {
                contains: searchTerm,
                mode: "insensitive",
              },
            },
            {
              email: {
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

      return teamMembers;
    } catch (error) {
      console.error(error);
      throw new TeamError(
        "Error searching team member",
        400,
        "TEAM_SEARCH_ERROR"
      );
    }
  }

  async create(data: CreateTeamMemberDTO & { slug: string }) {
    try {
      const transaction = await this.prisma.$transaction(
        async (tx) => {
          const slug = slugify(data.name + randomUUID().substring(0, 8), {
            lower: true,
          });
          if (!slug) throw new Error("error create slug");

          let imageId: string | null = null;

          // Upload image if provided
          if (data.image) {
            const createImage = await UploadImage(data.image, data.name);
            if (!createImage) throw new Error("error upload image");

            const imageToDB = await AssignImageToDBImage(
              {
                imageType: "TEAM",
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

          const teamMember = await tx.teamMember.create({
            data: {
              slug: slug,
              name: data.name,
              position: data.position,
              bio: data.bio,
              email: data.email,
              phone: data.phone,
              linkedin: data.linkedin,
              github: data.github,
              twitter: data.twitter,
              imageId: imageId,
              isActive: data.isActive || false,
              isFeatured: data.isFeatured || false,
              order: data.order || 0,
            },
            include: {
              image: true,
            },
          });

          const { image, ...rest } = teamMember;
          return { Image: image, teamMember: rest };
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
      throw new Error("Error creating team member");
    }
  }

  async update(data: UpdateTeamMember) {
    try {
      const transaction = await this.prisma.$transaction(
        async (prismaTx) => {
          let NewImageId: string | null = null;

          if (!data.teamId) throw new Error("no teamId provided");

          const teamMember = await prismaTx.teamMember.findUnique({
            where: { id: data.teamId },
          });

          if (!teamMember) throw new Error("team member not found");

          NewImageId = teamMember?.imageId || null;

          // Handle image update/removal
          if (data.imageState === "REMOVE") {
            if (teamMember.imageId) {
              await prismaTx.teamMember.update({
                where: { id: data.teamId },
                data: { imageId: null },
              });
              await deleteImageById(teamMember.imageId, prismaTx);
            }
            NewImageId = null;
          }

          if (data.imageState === "UPDATE") {
            if (teamMember.imageId) {
              await prismaTx.teamMember.update({
                where: { id: data.teamId },
                data: { imageId: null },
              });
              await deleteImageById(teamMember.imageId, prismaTx);
            }

            if (!data.image) throw new Error("no image provided");

            const createImage = await UploadImage(
              data.image,
              data.name || "update"
            );

            if (!createImage) throw new Error("error upload image");

            const imageToDB = await AssignImageToDBImage(
              {
                imageType: "TEAM",
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
          if (data.name && data.name !== teamMember.name) {
            const slug = slugify(data.name + randomUUID().substring(0, 8), {
              lower: true,
            });
            data.slug = slug;
          }

          // Update the team member with new data
          const updatedTeamMember = await prismaTx.teamMember.update({
            where: { id: data.teamId },
            data: {
              slug: data.slug || teamMember.slug,
              name: data.name || teamMember.name,
              position: data.position || teamMember.position,
              bio: data.bio || teamMember.bio,
              email: data.email || teamMember.email,
              phone: data.phone || teamMember.phone,
              linkedin: data.linkedin || teamMember.linkedin,
              github: data.github || teamMember.github,
              twitter: data.twitter || teamMember.twitter,
              imageId: NewImageId,
              isActive: data.isActive ?? teamMember.isActive,
              isFeatured: data.isFeatured ?? teamMember.isFeatured,
              order: data.order ?? teamMember.order,
            },
            include: { image: true },
          });

          const { image, ...rest } = updatedTeamMember;
          return { Image: image, teamMember: rest };
        },
        {
          timeout: 20000,
          maxWait: 5000,
        }
      );

      return transaction;
    } catch (error) {
      console.error(error);
      throw new Error("Error updating team member");
    }
  }

  async delete(id: string) {
    try {
      const transaction = await this.prisma.$transaction(
        async (prismaTx) => {
          const teamMember = await prismaTx.teamMember.findUnique({
            where: { id },
          });
          if (!teamMember) throw new Error("team member not found");

          await prismaTx.teamMember.update({
            where: { id },
            data: { imageId: null },
          });

          if (teamMember.imageId)
            await deleteImageById(teamMember.imageId, prismaTx);

          await prismaTx.teamMember.delete({ where: { id } });
          return teamMember;
        },
        {
          timeout: 20000,
          maxWait: 5000,
        }
      );
      return transaction;
    } catch (error) {
      console.error(error);
      throw new Error("Error deleting team member");
    }
  }
}
