import { CompanyInfo } from "@prisma/client";
import { CompanyInfoRepostery } from "./SettingsRepostery";
import {
  CompanyInfoCreationError,
  CompanyInfoError,
} from "../../errors/schema/companyInfo";

export class CompanyInfoLogic {
  constructor(private settingsRepo: CompanyInfoRepostery) {}


  async createSettings({
    data,
    logo,
  }: {
    data: Omit<CompanyInfo, "id" | "createdAt" | "updatedAt" | "logoId">;
    logo?: Buffer ;
  }) {
    try {
      const newSettings = await this.settingsRepo.createSettings({ data, logo });
      return newSettings;
    } catch (error) {
      if (error instanceof CompanyInfoCreationError) {
        throw error;
      }
      throw new CompanyInfoCreationError("Failed to create company settings");
    }
  }


  async getSettings() {
    try {
      const settings = await this.settingsRepo.getSettings();
      if (!settings) {
        throw new CompanyInfoError("No company settings found");
      }
      return settings;
    } catch (error) {
      if (error instanceof CompanyInfoError) throw error;
      throw new CompanyInfoError("Failed to fetch company settings");
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
      const updatedSettings = await this.settingsRepo.updateSettings(id, data);
      return updatedSettings;
    } catch (error) {
      if (error instanceof CompanyInfoError) throw error;
      throw new CompanyInfoError("Failed to update company settings");
    }
  }

  async getMimalStats() {
    try {
      const stats = await this.settingsRepo.getMimalStats();
      return stats;
    } catch (error) {
      if (error instanceof CompanyInfoError) throw error;
      throw new CompanyInfoError("Failed to fetch company settings");
    }
  }

}

