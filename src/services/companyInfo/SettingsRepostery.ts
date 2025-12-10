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

export class CompanyInfoRepostery {
  constructor(
    private prisma: PrismaClientConfig //   private ContactValidator: ContactValidator
  ) {}

  async findSettings() {
    try {
      const settings = await this.prisma.companyInfo.findMany();
      return settings;
    } catch (error) {
      throw new Error("Error fetching settings");
    }
  }
  async createSettings({
    logo,
    data,
  }: {
    logo?: Buffer;
    data: Omit<CompanyInfo, "id" | "createdAt" | "updatedAt" | "logoId">;
  }) {
    try {
      let logoId: string | undefined = undefined;
      const transaction = await this.prisma.$transaction(async (tx) => {
        if (logo) {
          const uploadImage = await UploadImage(logo, data.name);
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
            tx
          );
          if (!assignImage) {
            throw new CompanyInfoCreationError("Error assigning image to DB");
          }
          logoId = assignImage.id;
        }
        // data.image = assignImage;

        const newSettings = await tx.companyInfo.create({
          data: {
            ...data,
            logoId: logoId || null,
          },
        });
        return newSettings;
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
        },
      });

      return settings;
    } catch (error) {
      throw new CompanyInfoError("Error fetching settings");
    }
  }
  async updateSettings(
    id: string,
    data: {
      CompanyInfo: Partial<CompanyInfo>;
      logo?: Buffer;
      LogoState: "KEEP" | "REMOVE" | "UPDATE";
    }
  ) {
    try {
      const updatedSettings = await this.prisma.$transaction(async (tx) => {
        let imageId = data.CompanyInfo.logoId;
        if (data.LogoState === "REMOVE" && imageId) {
          await deleteImageById(imageId, tx);
        } else if (data.LogoState === "UPDATE" && data.logo) {
          if (imageId) {
            await deleteImageById(imageId, tx);
          }
          const uploadImage = await UploadImage(
            data.logo,
            data.CompanyInfo.name || "company-logo"
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
            },
            tx
          );
          if (!assignImage) {
            throw new CompanyInfoCreationError("Error assigning image to DB");
          }
          imageId = assignImage.id;
        }
        const updated = await tx.companyInfo.update({
          where: { id },
          data: {
            ...data.CompanyInfo,
            logoId: imageId,
          },
        });
        return updated;
      });
      return updatedSettings;
    } catch (error) {
      throw new CompanyInfoError("Error updating settings");
    }
  }

  async getMimalStats() {
    try {
      const totalServices = await this.prisma.service.count({
        where: { isActive: true },
      });

      const progressProjects = await this.prisma.project.count({
        where: { status: "IN_PROGRESS" },
      });
      const CompletedProjects = await this.prisma.project.count({
        where: { status: "COMPLETED" },
      });

      const totalTeamMembers = await this.prisma.teamMember.count();

      const newContactsThisMonth = await this.prisma.contact.count({
        where: {
          createdAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1), // first day of month
          },
        },
      });
      


      const testimonialCount = await this.prisma.testimonial.count({});

      return {
        
        stats: [
          {
            label: "Total Services",
            value: totalServices,
            // change: "+2 this month",
          },
          {
            label: "project in progress",
            value: progressProjects,
            // change: "+5 this month",
          },
          {
            label: "Completed Projects",
            value: CompletedProjects,
            // change: "+5 this month",/
          },
          {
            label: "Team Members",
            value: totalTeamMembers,
            // change: "New",
          },
          {
            label: "New Contacts",
            value: newContactsThisMonth,
            // change: "+12.5% from last month",
          },
          {
            label: "Testimonials",
            value: testimonialCount,
            // change: "Approved",
          },
        ],
      };
    } catch (error) {
      throw new CompanyInfoError("Error fetching mimal stats");
    }
  }
}
