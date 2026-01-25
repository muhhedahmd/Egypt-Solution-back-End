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
  constructor(private prisma: PrismaClientConfig) { }

  async findMany( skip: number, take: number) {
    const teamMembers = await this.prisma.teamMember.findMany({
      include: {
        image: true,
        TeamMemberTranslation: {
          select: {
            name: true,
            position: true,
            bio: true,
            lang: true,
          },
        },
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

    return teamMembers.map((member) => {
      const { image, TeamMemberTranslation, slideShows, ...rest } = member;
      return {
        teamMember: { ...rest },
        image: image || null,
        translation: TeamMemberTranslation,
        slideShows,
      };
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

  async findManyActive(
   
    skip: number,
    take: number,
    isFeatured: boolean
  ) {
    const teamMembers = await this.prisma.teamMember.findMany({
      where: {
        isActive: true,
        isFeatured: isFeatured || false,
      },
      include: {
        image: true,
        TeamMemberTranslation: {
          select: {
            name: true,
            position: true,
            bio: true,

            lang: true,
          },
        },
      },
      skip: skip * take,
      take: take,
      orderBy: {
        order: "asc",
      },
    });

    return teamMembers.map((member) => {
      const { image, TeamMemberTranslation, ...rest } = member;
      return {
        teamMember: { ...rest },
        image: image || null,
        translation: TeamMemberTranslation,
      };
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
      const member = await this.prisma.teamMember.findUnique({
        where: { id },
        include: {
          image: true,
          TeamMemberTranslation: {
            select: {
              name: true,
              position: true,
              bio: true,
              lang: true,
            },
          },
          slideShows: {
            include: {
              slideShow: true,
            },
          },
        },
      });

      if (!member) return null;

      const { image, TeamMemberTranslation, slideShows, ...rest } = member;
      return {
        teamMember: { ...rest },
        image: image || null,
        translation: TeamMemberTranslation,
        slideShows,
      };
    } catch (error) {
      console.error(error);
      throw new Error("Error finding team member by ID");
    }
  }

  async findBySlug( slug: string) {
    try {
      const findedTeamMember = await this.prisma.teamMember.findUnique({
        where: { slug },
        include: {
          image: true,
          TeamMemberTranslation: {
            select: {
              name: true,
              position: true,
              bio: true,
              lang: true,
            },
          },
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

      const { image, TeamMemberTranslation, slideShows, ...rest } =
        findedTeamMember;
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
        teamMember: { ...rest },
        translation: TeamMemberTranslation,
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
    lang: "EN" | "AR",
    searchTerm: string,
    skip: number,
    take: number
  ): Promise<InterFaceSearchTeamMember[]> {
    try {
      const teamMembers = await this.prisma.teamMember.findMany({
        where: {
          OR: [
            {
              TeamMemberTranslation: {
                some: {
                  name: {
                    contains: searchTerm,
                    mode: "insensitive",
                  },
                },
              },
            },
            {
              TeamMemberTranslation: {
                some: {
                  position: {
                    contains: searchTerm,
                    mode: "insensitive",
                  },
                },
              },
            },
            {
              TeamMemberTranslation: {
                some: {
                  bio: {
                    contains: searchTerm,
                    mode: "insensitive",
                  },
                },
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
          TeamMemberTranslation: {
            where: { lang },
            select: {
              name: true,
              position: true,
              bio: true,
              lang: true,
            },
          },
        },
        skip: skip * take,
        take,
        orderBy: {
          createdAt: "desc",
        },
      });

      return teamMembers.map((member) => {
        const { image, TeamMemberTranslation, ...rest } = member;
        return {
          ...rest,
          translation: TeamMemberTranslation,
          image,
        } as InterFaceSearchTeamMember;
      });
    } catch (error) {
      console.error(error);
      throw new TeamError(
        "Error searching team member",
        400,
        "TEAM_SEARCH_ERROR"
      );
    }
  }

  async create(
    lang: "EN" | "AR",
    data: CreateTeamMemberDTO & { slug: string }
  ) {
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
              email: data.email,
              phone: data.phone,
              linkedin: data.linkedin,
              github: data.github,
              twitter: data.twitter,
              imageId: imageId,
              isActive: data.isActive || false,
              isFeatured: data.isFeatured || false,
              order: data.order || 0,
              name: "",
              position: "",
              TeamMemberTranslation: {
                create: {
                  name: data.name,
                  position: data.position,
                  bio: data.bio,
                  lang: lang,
                },
              },
            },
            include: {
              image: true,
              TeamMemberTranslation: {
                where: { lang },
                select: {
                  name: true,
                  position: true,
                  bio: true,
                  lang: true,
                },
              },
            },
          });

          const { image, TeamMemberTranslation, ...rest } = teamMember;
          return {
            Image: image,
            translation: TeamMemberTranslation,

            teamMember: { ...rest },
          };
        },
        {
          timeout: 20000,
          maxWait: 5000,
        }
      );
      return transaction;
    } catch (error) {
      console.error(error);
      throw new Error("Error creating team member");
    }
  }

  async update(lang: "EN" | "AR", data: UpdateTeamMember) {
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
          if (data.name) {
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
            include: {
              image: true,

            },
          });

          // Update or create translation
          const t = await prismaTx.teamMemberTranslation.upsert({
            where: {
              memberId_lang: {
                memberId: data.teamId,
                lang: lang,
              },
            },
            update: {
              name: data.name,
              position: data.position,
              bio: data.bio,
            },
            create: {
              memberId: data.teamId,
              name: data.name || "Team Member",
              position: data.position || "Position",
              bio: data.bio,
              lang: lang,
            },
          });

          const { image, ...rest } = updatedTeamMember;
          // const translation = translations.find((t) => t.lang === lang);
          return {
            Image: image,
            translation: t,
            teamMember: { ...rest },
          };
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

  async delete( id: string) {
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
