import { Request, Response, NextFunction } from "express";
import { CompanyInfoLogic } from "../services/companyInfo/settingsLogic";
import prisma from "../config/prisma";

export class companyInfoController {
  constructor(private logic: CompanyInfoLogic) {}

  async createSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const lang = req.lang as "AR" | "EN" || "EN";
      const body = req.body;
      const newSettings = await this.logic.createSettings( lang,{
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
    async SwitchLang(req: Request, res: Response, next: NextFunction) {
    try {
      const { lang } = req.body;
      if (!["EN", "AR"].includes(lang)) {
        return res.status(400).json({ error: "Invalid language" });
      }

      const companyInfo = await prisma.companyInfo.findFirst();
      const currentLang = companyInfo?.lang;

      if (lang === currentLang) {
        return res.status(400).json({ error: "Language already set" });
      }

      await prisma.companyInfo.update({
        where: {
          id: companyInfo?.id,
        },
        data: {
          lang,
        },
      });

      res.cookie("user_lang", lang, {
        maxAge: 365 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      });

      res.json({
        success: true,
        lang,
        isRTL: lang === "AR",
      });
    } catch (error) {
      next(error);
    }
  }
  async currentLang(req: Request, res: Response, next: NextFunction) {
    try {
      const companyInfo = await prisma.companyInfo.findFirst();
      const currentLang = companyInfo?.lang || "EN";
      res.cookie("user_lang", currentLang, {
        maxAge: 365 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      });

      res.json({
        success: true,
        currentLang,
        isRTL: currentLang === "AR",
      });
    } catch (error) {
      next(error);
    }
  }

  async updateSettings(req: Request, res: Response, next: NextFunction) {
    try {
      const lang = req.lang as "AR" | "EN" || "EN";

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
      const updatedSettings = await this.logic.updateSettings( lang , id, {
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
