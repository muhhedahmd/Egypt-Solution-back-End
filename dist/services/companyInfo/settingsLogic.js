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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompanyInfoLogic = void 0;
const companyInfo_1 = require("../../errors/schema/companyInfo");
class CompanyInfoLogic {
    constructor(settingsRepo) {
        this.settingsRepo = settingsRepo;
    }
    createSettings(_a) {
        return __awaiter(this, arguments, void 0, function* ({ data, logo, }) {
            try {
                const newSettings = yield this.settingsRepo.createSettings({ data, logo });
                return newSettings;
            }
            catch (error) {
                if (error instanceof companyInfo_1.CompanyInfoCreationError) {
                    throw error;
                }
                throw new companyInfo_1.CompanyInfoCreationError("Failed to create company settings");
            }
        });
    }
    getSettings() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const settings = yield this.settingsRepo.getSettings();
                if (!settings) {
                    throw new companyInfo_1.CompanyInfoError("No company settings found");
                }
                return settings;
            }
            catch (error) {
                if (error instanceof companyInfo_1.CompanyInfoError)
                    throw error;
                throw new companyInfo_1.CompanyInfoError("Failed to fetch company settings");
            }
        });
    }
    updateSettings(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const updatedSettings = yield this.settingsRepo.updateSettings(id, data);
                return updatedSettings;
            }
            catch (error) {
                if (error instanceof companyInfo_1.CompanyInfoError)
                    throw error;
                throw new companyInfo_1.CompanyInfoError("Failed to update company settings");
            }
        });
    }
    getMimalStats() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const stats = yield this.settingsRepo.getMimalStats();
                return stats;
            }
            catch (error) {
                if (error instanceof companyInfo_1.CompanyInfoError)
                    throw error;
                throw new companyInfo_1.CompanyInfoError("Failed to fetch company settings");
            }
        });
    }
}
exports.CompanyInfoLogic = CompanyInfoLogic;
