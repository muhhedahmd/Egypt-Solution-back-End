import { CompanyInfo } from "@prisma/client";
import {
  CompanyInfoCreationError,
  CompanyInfoError,
} from "../../errors/schema/companyInfo";
import { CompanyInfoRepository } from "./SettingsRepostery";

export class CompanyInfoLogic {
  constructor(private settingsRepo: CompanyInfoRepository) {}


  async createSettings(lang  :"EN" | "AR", {
    data,
    logo,
  }: {
    data:any;
    logo?: Buffer ;
  }) {
    try {
      const newSettings = await this.settingsRepo.createSettings(  { data , logo });
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
    lang :"EN" | "AR",
     id: string,
    data: any
  ) {
    try {
      const updatedSettings = await this.settingsRepo.updateSettings(   id, data);
      return updatedSettings;
    } catch (error) {
      if (error instanceof CompanyInfoError) throw error;
      throw new CompanyInfoError("Failed to update company settings");
    }
  }

  async getMimalStats() {
    try {
      const stats = await this.settingsRepo.getMinimalStats();
      return stats;
    } catch (error) {
      if (error instanceof CompanyInfoError) throw error;
      throw new CompanyInfoError("Failed to fetch company settings");
    }
  }

}

