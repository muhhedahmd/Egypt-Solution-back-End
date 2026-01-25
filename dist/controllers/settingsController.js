"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.companyInfoController = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
class companyInfoController {
    constructor(logic) {
        this.logic = logic;
    }
    createSettings(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const lang = req.lang || "EN";
                const body = req.body;
                const newSettings = yield this.logic.createSettings(lang, {
                    data: body,
                    logo: Array.isArray(req.files) && req.files
                        ? (_a = req.files[0]) === null || _a === void 0 ? void 0 : _a.buffer
                        : undefined,
                });
                return res.status(201).json({
                    success: true,
                    message: "Settings created successfully",
                    data: newSettings,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    getSettings(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const settings = yield this.logic.getSettings();
                return res.status(200).json({
                    success: true,
                    message: "Settings fetched successfully",
                    data: settings,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    SwitchLang(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { lang } = req.body;
                if (!["EN", "AR"].includes(lang)) {
                    return res.status(400).json({ error: "Invalid language" });
                }
                const companyInfo = yield prisma_1.default.companyInfo.findFirst();
                const currentLang = companyInfo === null || companyInfo === void 0 ? void 0 : companyInfo.lang;
                if (lang === currentLang) {
                    return res.status(400).json({ error: "Language already set" });
                }
                yield prisma_1.default.companyInfo.update({
                    where: {
                        id: companyInfo === null || companyInfo === void 0 ? void 0 : companyInfo.id,
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
            }
            catch (error) {
                next(error);
            }
        });
    }
    currentLang(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const companyInfo = yield prisma_1.default.companyInfo.findFirst();
                const currentLang = (companyInfo === null || companyInfo === void 0 ? void 0 : companyInfo.lang) || "EN";
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
            }
            catch (error) {
                next(error);
            }
        });
    }
    updateSettings(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                const lang = req.lang || "EN";
                const { id } = req.params;
                const body = req.body;
                const { LogoState } = body, CompanyInfo = __rest(body, ["LogoState"]);
                console.log(id, {
                    CompanyInfo,
                    LogoState,
                    logo: Array.isArray(req.files) && req.files
                        ? (_a = req.files[0]) === null || _a === void 0 ? void 0 : _a.buffer
                        : undefined,
                });
                const updatedSettings = yield this.logic.updateSettings(lang, id, {
                    CompanyInfo,
                    LogoState,
                    logo: Array.isArray(req.files) && req.files
                        ? (_b = req.files[0]) === null || _b === void 0 ? void 0 : _b.buffer
                        : undefined,
                });
                return res.status(200).json({
                    success: true,
                    message: "Settings updated successfully",
                    data: updatedSettings,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    getMimalStats(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const stats = yield this.logic.getMimalStats();
                return res.status(200).json({
                    success: true,
                    message: "Stats fetched successfully",
                    data: stats,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
}
exports.companyInfoController = companyInfoController;
