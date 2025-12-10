import { Request, Response, NextFunction } from "express";
import { CompanyInfoLogic } from "../services/companyInfo/settingsLogic";

export class companyInfoController {
  constructor(private logic: CompanyInfoLogic) {}

  async createSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const body = req.body;
      const newSettings = await this.logic.createSettings({
        data: body,
        logo:
          Array.isArray(req.files) && req.files
            ? req.files[0]?.buffer
            : undefined,
      });
      return res.status(201).json({
        success: true,
        message: "Settings created successfully",
        data: newSettings,
      });
    } catch (error) {
      next(error);
    }
  }
  async getSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const settings = await this.logic.getSettings();
      return res.status(200).json({
        success: true,
        message: "Settings fetched successfully",
        data: settings,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const body = req.body;

      const { LogoState, ...CompanyInfo } = body;
      console.log(
        id, {
        CompanyInfo,
        LogoState,
        logo:
          Array.isArray(req.files) && req.files
            ? req.files[0]?.buffer
            : undefined,
      }
      )
      const updatedSettings = await this.logic.updateSettings(id, {
        CompanyInfo,
        LogoState,
        logo:
          Array.isArray(req.files) && req.files
            ? req.files[0]?.buffer
            : undefined,
      });

      return res.status(200).json({
        success: true,
        message: "Settings updated successfully",
        data: updatedSettings,
      });
    } catch (error) {
      next(error);
    }
  }

  async getMimalStats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await this.logic.getMimalStats();
      return res.status(200).json({
        success: true,
        message: "Stats fetched successfully",
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }
}
