import { CompanyInfo } from "@prisma/client";
import { PrismaClientConfig } from "../../config/prisma";
import {
  CompanyInfoCreationError,
  CompanyInfoError,
} from "../../errors/schema/companyInfo";
import {
  AssignImageToDBImage,
  deleteImageById,
  UploadImage,
} from "../../lib/helpers";

export class CompanyInfoRepository {
  constructor(private prisma: PrismaClientConfig) {}

  async findSettings() {
    try {
      const settings = await this.prisma.companyInfo.findMany({
        include: {
          logo: true,
          companyTranslation: {
            select: {
              name: true,
              tagline: true,
              description: true,
              footerText: true,
              metaTitle: true,
              metaDescription: true,
              metaKeywords: true,
              lang: true,
            },
          },
        },
      });

      return settings.map((company) => {
        const { logo, companyTranslation, ...rest } = company;
        return {
          company: { ...rest },
          logo: logo || null,
          translation: companyTranslation,
        };
      });
    } catch (error) {
      throw new Error("Error fetching settings");
    }
  }

  async createSettings({
    logo,
    data,
  }: {
    logo?: Buffer;
    data: {
      // English translations
      name_en: string;
      tagline_en?: string;
      description_en?: string;
      footerText_en?: string;
      metaTitle_en?: string;
      metaDescription_en?: string;
      metaKeywords_en?: string;
      // Arabic translations
      name_ar: string;
      tagline_ar?: string;
      description_ar?: string;
      footerText_ar?: string;
      metaTitle_ar?: string;
      metaDescription_ar?: string;
      metaKeywords_ar?: string;
      // Non-translatable fields
      email: string;
      phone?: string;
      address?: string;
      city?: string;
      country?: string;
      postalCode?: string;
      facebook?: string;
      twitter?: string;
      linkedin?: string;
      instagram?: string;
      github?: string;
      youtube?: string;
    };
  }) {
    try {
      let logoId: string | null = null;
      const transaction = await this.prisma.$transaction(async (tx) => {
        if (logo) {
          const uploadImage = await UploadImage(logo, data.name_en);
          if (!uploadImage?.data?.length) {
            throw new CompanyInfoCreationError("Error uploading image");
          }
          const assignImage = await AssignImageToDBImage(
            {
              imageType: "COMPANY_LOGO",
              data: { ...uploadImage?.data },
              blurhash: uploadImage?.blurhash || "",
              height: uploadImage?.height || 25,
              width: uploadImage?.width || 25,
            },
            tx,
          );
          if (!assignImage) {
            throw new CompanyInfoCreationError("Error assigning image to DB");
          }
          logoId = assignImage.id;
        }

        const newSettings = await tx.companyInfo.create({
          data: {
            name: "",
            email: data.email,
            phone: data.phone,
            address: data.address,
            city: data.city,
            country: data.country,
            postalCode: data.postalCode,
            facebook: data.facebook,
            twitter: data.twitter,
            linkedin: data.linkedin,
            instagram: data.instagram,
            github: data.github,
            youtube: data.youtube,
            logoId: logoId,
            companyTranslation: {
              createMany: {
                data: [
                  {
                    name: data.name_en,
                    tagline: data.tagline_en,
                    description: data.description_en,
                    footerText: data.footerText_en,
                    metaTitle: data.metaTitle_en,
                    metaDescription: data.metaDescription_en,
                    metaKeywords: data.metaKeywords_en,
                    lang: "EN",
                  },
                  {
                    name: data.name_ar,
                    tagline: data.tagline_ar,
                    description: data.description_ar,
                    footerText: data.footerText_ar,
                    metaTitle: data.metaTitle_ar,
                    metaDescription: data.metaDescription_ar,
                    metaKeywords: data.metaKeywords_ar,
                    lang: "AR",
                  },
                ],
              },
            },
          },
          include: {
            logo: true,
            companyTranslation: {
              select: {
                name: true,
                tagline: true,
                description: true,
                footerText: true,
                metaTitle: true,
                metaDescription: true,
                metaKeywords: true,
                lang: true,
              },
            },
          },
        });

        const { logo: logoImage, companyTranslation, ...rest } = newSettings;
        return {
          Logo: logoImage,
          translation: companyTranslation,
          company: { ...rest },
        };
      });
      return transaction;
    } catch (error) {
      console.log(error);
      throw new CompanyInfoCreationError("Error creating settings");
    }
  }

  async getSettings() {
    try {
      const settings = await this.prisma.companyInfo.findFirst({
        include: {
          logo: true,
          companyTranslation: {
            select: {
              name: true,
              tagline: true,
              description: true,
              footerText: true,
              metaTitle: true,
              metaDescription: true,
              metaKeywords: true,
              lang: true,
            },
          },
        },
      });

      const skip = 0;
      const take = 3;
      const totalItems = await this.prisma.slideShow.count();
      const remainingItems = totalItems - (skip * take + 0);
      const data = {
        totalItems,
        remainingItems,
        nowCount: 0,
        totalPages: Math.ceil(totalItems / take),
        currentPage: skip + 1,
        pageSize: take,
      };

      if (!settings) return null;

      const { logo, companyTranslation, ...rest } = settings;
      return {
        company: { ...rest },
        logo: logo || null,
        translation: companyTranslation, 
        slideShowsPages: data
      };
    } catch (error) {
      console.log(error);
      throw new CompanyInfoError("Error fetching settings");
    }
  }

  async updateSettings(
    id: string,
    data: {
      CompanyInfo: {
        // English translations
        name_en?: string;
        tagline_en?: string;
        description_en?: string;
        footerText_en?: string;
        metaTitle_en?: string;
        metaDescription_en?: string;
        metaKeywords_en?: string;
        // Arabic translations
        name_ar?: string;
        tagline_ar?: string;
        description_ar?: string;
        footerText_ar?: string;
        metaTitle_ar?: string;
        metaDescription_ar?: string;
        metaKeywords_ar?: string;
        // Non-translatable fields
        email?: string;
        phone?: string;
        address?: string;
        city?: string;
        country?: string;
        postalCode?: string;
        facebook?: string;
        twitter?: string;
        linkedin?: string;
        instagram?: string;
        github?: string;
        youtube?: string;
        logoId?: string;
      };
      logo?: Buffer;
      LogoState: "KEEP" | "REMOVE" | "UPDATE";
    },
  ) {
    try {
      const updatedSettings = await this.prisma.$transaction(async (tx) => {
        const existingCompany = await tx.companyInfo.findUnique({
          where: { id },
        });

        if (!existingCompany) {
          throw new CompanyInfoError("Company info not found");
        }

        let imageId = existingCompany.logoId;

        if (data.LogoState === "REMOVE" && imageId) {
          await tx.companyInfo.update({
            where: { id },
            data: { logoId: null },
          });
          await deleteImageById(imageId, tx);
          imageId = null;
        } else if (data.LogoState === "UPDATE" && data.logo) {
          if (imageId) {
            await tx.companyInfo.update({
              where: { id },
              data: { logoId: null },
            });
            await deleteImageById(imageId, tx);
          }
          const uploadImage = await UploadImage(
            data.logo,
            data.CompanyInfo.name_en || "company-logo",
          );
          if (!uploadImage?.data?.length) {
            throw new CompanyInfoCreationError("Error uploading image");
          }
          const assignImage = await AssignImageToDBImage(
            {
              imageType: "COMPANY_LOGO",
              data: { ...uploadImage?.data },
              blurhash: uploadImage?.blurhash || "",
              height: uploadImage?.height || 25,
              width: uploadImage?.width || 25,
            },
            tx,
          );
          if (!assignImage) {
            throw new CompanyInfoCreationError("Error assigning image to DB");
          }
          imageId = assignImage.id;
        }

        const updated = await tx.companyInfo.update({
          where: { id },
          data: {
            email: data.CompanyInfo.email || existingCompany.email,
            phone: data.CompanyInfo.phone ?? existingCompany.phone,
            address: data.CompanyInfo.address ?? existingCompany.address,
            city: data.CompanyInfo.city ?? existingCompany.city,
            country: data.CompanyInfo.country ?? existingCompany.country,
            postalCode:
              data.CompanyInfo.postalCode ?? existingCompany.postalCode,
            facebook: data.CompanyInfo.facebook ?? existingCompany.facebook,
            twitter: data.CompanyInfo.twitter ?? existingCompany.twitter,
            linkedin: data.CompanyInfo.linkedin ?? existingCompany.linkedin,
            instagram: data.CompanyInfo.instagram ?? existingCompany.instagram,
            github: data.CompanyInfo.github ?? existingCompany.github,
            youtube: data.CompanyInfo.youtube ?? existingCompany.youtube,
            logoId: imageId,
          },
          include: {
            logo: true,
          },
        });

        // Update or create English translation
        const translationEN = await tx.companyTranslation.upsert({
          where: {
            companyId_lang: {
              companyId: id,
              lang: "EN",
            },
          },
          update: {
            name: data.CompanyInfo.name_en,
            tagline: data.CompanyInfo.tagline_en,
            description: data.CompanyInfo.description_en,
            footerText: data.CompanyInfo.footerText_en,
            metaTitle: data.CompanyInfo.metaTitle_en,
            metaDescription: data.CompanyInfo.metaDescription_en,
            metaKeywords: data.CompanyInfo.metaKeywords_en,
          },
          create: {
            companyId: id,
            name: data.CompanyInfo.name_en || "Company",
            tagline: data.CompanyInfo.tagline_en,
            description: data.CompanyInfo.description_en,
            footerText: data.CompanyInfo.footerText_en,
            metaTitle: data.CompanyInfo.metaTitle_en,
            metaDescription: data.CompanyInfo.metaDescription_en,
            metaKeywords: data.CompanyInfo.metaKeywords_en,
            lang: "EN",
          },
        });

        // Update or create Arabic translation
        const translationAR = await tx.companyTranslation.upsert({
          where: {
            companyId_lang: {
              companyId: id,
              lang: "AR",
            },
          },
          update: {
            name: data.CompanyInfo.name_ar,
            tagline: data.CompanyInfo.tagline_ar,
            description: data.CompanyInfo.description_ar,
            footerText: data.CompanyInfo.footerText_ar,
            metaTitle: data.CompanyInfo.metaTitle_ar,
            metaDescription: data.CompanyInfo.metaDescription_ar,
            metaKeywords: data.CompanyInfo.metaKeywords_ar,
          },
          create: {
            companyId: id,
            name: data.CompanyInfo.name_ar || "شركة",
            tagline: data.CompanyInfo.tagline_ar,
            description: data.CompanyInfo.description_ar,
            footerText: data.CompanyInfo.footerText_ar,
            metaTitle: data.CompanyInfo.metaTitle_ar,
            metaDescription: data.CompanyInfo.metaDescription_ar,
            metaKeywords: data.CompanyInfo.metaKeywords_ar,
            lang: "AR",
          },
        });

        const { logo, ...rest } = updated;
        return {
          Logo: logo,
          translation: [translationEN, translationAR],
          company: { ...rest },
        };
      });
      return updatedSettings;
    } catch (error) {
      console.log(error);
      throw new CompanyInfoError("Error updating settings");
    }
  }

  async getMinimalStats() {
    try {
      const totalServices = await this.prisma.service.count({
        where: { isActive: true },
      });

      const progressProjects = await this.prisma.project.count({
        where: { status: "IN_PROGRESS" },
      });
      const completedProjects = await this.prisma.project.count({
        where: { status: "COMPLETED" },
      });

      const totalTeamMembers = await this.prisma.teamMember.count();

      const newContactsThisMonth = await this.prisma.contact.count({
        where: {
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
      });

      const testimonialCount = await this.prisma.testimonial.count({});

      return {
        stats: [
          {
            label: "Total Services",
            value: totalServices,
          },
          {
            label: "project in progress",
            value: progressProjects,
          },
          {
            label: "Completed Projects",
            value: completedProjects,
          },
          {
            label: "Team Members",
            value: totalTeamMembers,
          },
          {
            label: "New Contacts",
            value: newContactsThisMonth,
          },
          {
            label: "Testimonials",
            value: testimonialCount,
          },
        ],
      };
    } catch (error) {
      throw new CompanyInfoError("Error fetching minimal stats");
    }
  }
}
