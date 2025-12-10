import { PrismaClientConfig } from "../../config/prisma";
import { HeroError } from "../../errors/hero.error";
import {
  deleteImageById,
  UploadImage,
  AssignImageToDBImage,
} from "../../lib/helpers";
import { CreateHeroDTO, UpdateHeroDTO } from "../../types/hero";

export class HeroRepository {
  constructor(private prisma: PrismaClientConfig) {}

  async findMany(skip: number, take: number) {
    try {
      const heroes = await this.prisma.hero.findMany({
        include: {
          backgroundImage: true,
        },
        skip: skip * take,
        take: take,
        orderBy: {
          createdAt: "desc",
        },
      });

      return heroes.map((hero) => {
        const { backgroundImage, ...rest } = hero;
        return {
          hero: rest,
          backgroundImage: backgroundImage || null,
        };
      });
    } catch (error) {
      console.error(error);
      throw new HeroError("Error finding heroes", 400, "HERO_FIND_MANY_ERROR");
    }
  }

  async count() {
    return this.prisma.hero.count();
  }

  async findById(id: string) {
    try {
      return this.prisma.hero.findUnique({
        where: { id },
        include: {
          backgroundImage: true,
        },
      });
    } catch (error) {
      console.error(error);
      throw new Error("Error finding hero by ID");
    }
  }

  async findActiveHero() {
    try {
      const hero = await this.prisma.hero.findFirst({
        where: { isActive: true },
        include: {
          backgroundImage: true,
        },
        orderBy: {
          updatedAt: "desc",
        },
      });

      if (!hero) return null;

      const { backgroundImage, ...rest } = hero;
      return {
        hero: rest,
        backgroundImage: backgroundImage || null,
      };
    } catch (error) {
      console.error(error);
      throw new HeroError(
        "Error finding active hero",
        400,
        "HERO_SEARCH_ERROR"
      );
    }
  }

  async SearchHero(searchTerm: string, skip: number, take: number) {
    try {
      const heroes = await this.prisma.hero.findMany({
        where: {
          OR: [
            {
              name: {
                contains: searchTerm,
                mode: "insensitive",
              },
            },
            {
              title: {
                contains: searchTerm,
                mode: "insensitive",
              },
            },
            {
              subtitle: {
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
          ],
        },
        include: {
          backgroundImage: true,
        },
        skip: skip * take,
        take,
        orderBy: {
          createdAt: "desc",
        },
      });

      return heroes.map((hero) => {
        const { backgroundImage, ...rest } = hero;
        return {
          hero: rest,
          backgroundImage: backgroundImage || null,
        };
      });
    } catch (error) {
      console.error(error);
      throw new HeroError("Error searching hero", 400, "HERO_SEARCH_ERROR");
    }
  }

  async create(data: CreateHeroDTO) {
    try {
      const transaction = await this.prisma.$transaction(
        async (tx) => {
          let imageId: string | null = null;

          // Upload background image if provided
          if (data.backgroundImage) {
            const createImage = await UploadImage(
              data.backgroundImage,
              data.name || "hero-background"
            );
            if (!createImage) throw new Error("error upload image");

            const imageToDB = await AssignImageToDBImage(
              {
                imageType: "HERO",
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

          if (data.isActive) {
            const currentActiveHero = await tx.hero.findFirst({
              where: {
                isActive: true,
              },
            });
            if (currentActiveHero) {
              await tx.hero.update({
                where: {
                  id: currentActiveHero.id,
                },
                data: {
                  isActive: false,
                },
              });
            }
          }

          const hero = await tx.hero.create({
            data: {
              name: data.name || "Main Hero",
              title: data.title,
              subtitle: data.subtitle,
              description: data.description,
              backgroundImageId: imageId,
              backgroundColor: data.backgroundColor,
              backgroundVideo: data.backgroundVideo,
              overlayColor: data.overlayColor,
              overlayOpacity: data.overlayOpacity,
              ctaText: data.ctaText,
              ctaUrl: data.ctaUrl,
              ctaVariant: data.ctaVariant,
              secondaryCtaText: data.secondaryCtaText,
              secondaryCtaUrl: data.secondaryCtaUrl,
              secondaryCtaVariant: data.secondaryCtaVariant,
              alignment: data.alignment,
              variant: data.variant || "CENTERED",
              minHeight: data.minHeight,
              titleSize: data.titleSize,
              titleColor: data.titleColor,
              subtitleColor: data.subtitleColor,
              descriptionColor: data.descriptionColor,
              showScrollIndicator: data.showScrollIndicator || false,
              customCSS: data.customCSS,
              styleOverrides: data.styleOverrides,
              isActive: data.isActive ?? true,
            },
            include: {
              backgroundImage: true,
            },
          });

          const { backgroundImage, ...rest } = hero;
          return { hero: rest, backgroundImage: backgroundImage };
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
      throw new Error("Error creating hero");
    }
  }

  async update(data: UpdateHeroDTO) {
    try {
      const transaction = await this.prisma.$transaction(
        async (prismaTx) => {
          let newImageId: string | null = null;

          if (!data.heroId) throw new Error("no heroId provided");

          const hero = await prismaTx.hero.findUnique({
            where: { id: data.heroId },
          });

          if (!hero) throw new Error("hero not found");

          newImageId = hero?.backgroundImageId || null;

          // Handle image update/removal
          if (data.imageState === "REMOVE") {
            if (hero.backgroundImageId) {
              await prismaTx.hero.update({
                where: { id: data.heroId },
                data: { backgroundImageId: null },
              });
              await deleteImageById(hero.backgroundImageId, prismaTx);
            }
            newImageId = null;
          }

          if (data.imageState === "UPDATE") {
            if (hero.backgroundImageId) {
              await prismaTx.hero.update({
                where: { id: data.heroId },
                data: { backgroundImageId: null },
              });
              await deleteImageById(hero.backgroundImageId, prismaTx);
            }

            if (!data.backgroundImage) throw new Error("no image provided");

            const createImage = await UploadImage(
              data.backgroundImage,
              data.name || "hero-update"
            );

            if (!createImage) throw new Error("error upload image");

            const imageToDB = await AssignImageToDBImage(
              {
                imageType: "HERO",
                blurhash: createImage.blurhash,
                width: createImage.width,
                height: createImage.height,
                data: createImage.data,
              },
              prismaTx
            );

            if (!imageToDB) throw new Error("error create imageToDB");
            newImageId = imageToDB.id;
          }

          // Update the hero with new data

          if (data.isActive) {
            const currentActiveHero = await prismaTx.hero.findFirst({
              where: {
                isActive: true,
              },
            });
            if (currentActiveHero) {
              await prismaTx.hero.update({
                where: {
                  id: currentActiveHero.id,
                },
                data: {
                  isActive: false,
                },
              });
            }
          }

          const updatedHero = await prismaTx.hero.update({
            where: { id: data.heroId },
            data: {
              name: data.name ?? hero.name,
              title: data.title ?? hero.title,
              subtitle: data.subtitle ?? hero.subtitle,
              description: data.description ?? hero.description,
              backgroundImageId: newImageId,
              backgroundColor: data.backgroundColor ?? hero.backgroundColor,
              backgroundVideo: data.backgroundVideo ?? hero.backgroundVideo,
              overlayColor: data.overlayColor ?? hero.overlayColor,
              overlayOpacity: data.overlayOpacity ?? hero.overlayOpacity,
              ctaText: data.ctaText ?? hero.ctaText,
              ctaUrl: data.ctaUrl ?? hero.ctaUrl,
              ctaVariant: data.ctaVariant ?? hero.ctaVariant,
              secondaryCtaText: data.secondaryCtaText ?? hero.secondaryCtaText,
              secondaryCtaUrl: data.secondaryCtaUrl ?? hero.secondaryCtaUrl,
              secondaryCtaVariant:
                data.secondaryCtaVariant ?? hero.secondaryCtaVariant,
              alignment: data.alignment ?? hero.alignment,
              variant: data.variant ?? hero.variant,
              minHeight: data.minHeight ?? hero.minHeight,
              titleSize: data.titleSize ?? hero.titleSize,
              titleColor: data.titleColor ?? hero.titleColor,
              subtitleColor: data.subtitleColor ?? hero.subtitleColor,
              descriptionColor: data.descriptionColor ?? hero.descriptionColor,
              showScrollIndicator:
                data.showScrollIndicator ?? hero.showScrollIndicator,
              customCSS: data.customCSS ?? hero.customCSS,
              styleOverrides: data.styleOverrides ?? hero.styleOverrides,
              isActive: data.isActive ?? hero.isActive,
            },
            include: { backgroundImage: true },
          });

          const { backgroundImage, ...rest } = updatedHero;
          return { hero: rest, backgroundImage: backgroundImage };
        },
        {
          timeout: 20000,
          maxWait: 5000,
        }
      );

      return transaction;
    } catch (error) {
      console.error(error);
      throw new Error("Error updating hero");
    }
  }

  async delete(id: string) {
    try {
      const transaction = await this.prisma.$transaction(
        async (prismaTx) => {
          const hero = await prismaTx.hero.findUnique({ where: { id } });
          if (!hero) throw new Error("hero not found");

          await prismaTx.hero.update({
            where: { id },
            data: { backgroundImageId: null },
          });

          if (hero.backgroundImageId)
            await deleteImageById(hero.backgroundImageId, prismaTx);

          await prismaTx.hero.delete({ where: { id } });
          return hero;
        },
        {
          timeout: 20000,
          maxWait: 5000,
        }
      );
      return transaction;
    } catch (error) {
      console.error(error);
      throw new Error("Error deleting hero");
    }
  }
}
