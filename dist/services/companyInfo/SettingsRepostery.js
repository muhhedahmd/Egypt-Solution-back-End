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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompanyInfoRepository = void 0;
const companyInfo_1 = require("../../errors/schema/companyInfo");
const helpers_1 = require("../../lib/helpers");
class CompanyInfoRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    findSettings() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const settings = yield this.prisma.companyInfo.findMany({
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
                    const { logo, companyTranslation } = company, rest = __rest(company, ["logo", "companyTranslation"]);
                    return {
                        company: Object.assign({}, rest),
                        logo: logo || null,
                        translation: companyTranslation,
                    };
                });
            }
            catch (error) {
                throw new Error("Error fetching settings");
            }
        });
    }
    createSettings(_a) {
        return __awaiter(this, arguments, void 0, function* ({ logo, data, }) {
            try {
                let logoId = null;
                const transaction = yield this.prisma.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                    var _a;
                    if (logo) {
                        const uploadImage = yield (0, helpers_1.UploadImage)(logo, data.name_en);
                        if (!((_a = uploadImage === null || uploadImage === void 0 ? void 0 : uploadImage.data) === null || _a === void 0 ? void 0 : _a.length)) {
                            throw new companyInfo_1.CompanyInfoCreationError("Error uploading image");
                        }
                        const assignImage = yield (0, helpers_1.AssignImageToDBImage)({
                            imageType: "COMPANY_LOGO",
                            data: Object.assign({}, uploadImage === null || uploadImage === void 0 ? void 0 : uploadImage.data),
                            blurhash: (uploadImage === null || uploadImage === void 0 ? void 0 : uploadImage.blurhash) || "",
                            height: (uploadImage === null || uploadImage === void 0 ? void 0 : uploadImage.height) || 25,
                            width: (uploadImage === null || uploadImage === void 0 ? void 0 : uploadImage.width) || 25,
                        }, tx);
                        if (!assignImage) {
                            throw new companyInfo_1.CompanyInfoCreationError("Error assigning image to DB");
                        }
                        logoId = assignImage.id;
                    }
                    const newSettings = yield tx.companyInfo.create({
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
                    const { logo: logoImage, companyTranslation } = newSettings, rest = __rest(newSettings, ["logo", "companyTranslation"]);
                    return {
                        Logo: logoImage,
                        translation: companyTranslation,
                        company: Object.assign({}, rest),
                    };
                }));
                return transaction;
            }
            catch (error) {
                console.log(error);
                throw new companyInfo_1.CompanyInfoCreationError("Error creating settings");
            }
        });
    }
    getSettings() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const settings = yield this.prisma.companyInfo.findFirst({
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
                if (!settings)
                    return null;
                const { logo, companyTranslation } = settings, rest = __rest(settings, ["logo", "companyTranslation"]);
                return {
                    company: Object.assign({}, rest),
                    logo: logo || null,
                    translation: companyTranslation,
                };
            }
            catch (error) {
                console.log(error);
                throw new companyInfo_1.CompanyInfoError("Error fetching settings");
            }
        });
    }
    updateSettings(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const updatedSettings = yield this.prisma.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
                    const existingCompany = yield tx.companyInfo.findUnique({
                        where: { id },
                    });
                    if (!existingCompany) {
                        throw new companyInfo_1.CompanyInfoError("Company info not found");
                    }
                    let imageId = existingCompany.logoId;
                    if (data.LogoState === "REMOVE" && imageId) {
                        yield tx.companyInfo.update({
                            where: { id },
                            data: { logoId: null },
                        });
                        yield (0, helpers_1.deleteImageById)(imageId, tx);
                        imageId = null;
                    }
                    else if (data.LogoState === "UPDATE" && data.logo) {
                        if (imageId) {
                            yield tx.companyInfo.update({
                                where: { id },
                                data: { logoId: null },
                            });
                            yield (0, helpers_1.deleteImageById)(imageId, tx);
                        }
                        const uploadImage = yield (0, helpers_1.UploadImage)(data.logo, data.CompanyInfo.name_en || "company-logo");
                        if (!((_a = uploadImage === null || uploadImage === void 0 ? void 0 : uploadImage.data) === null || _a === void 0 ? void 0 : _a.length)) {
                            throw new companyInfo_1.CompanyInfoCreationError("Error uploading image");
                        }
                        const assignImage = yield (0, helpers_1.AssignImageToDBImage)({
                            imageType: "COMPANY_LOGO",
                            data: Object.assign({}, uploadImage === null || uploadImage === void 0 ? void 0 : uploadImage.data),
                            blurhash: (uploadImage === null || uploadImage === void 0 ? void 0 : uploadImage.blurhash) || "",
                            height: (uploadImage === null || uploadImage === void 0 ? void 0 : uploadImage.height) || 25,
                            width: (uploadImage === null || uploadImage === void 0 ? void 0 : uploadImage.width) || 25,
                        }, tx);
                        if (!assignImage) {
                            throw new companyInfo_1.CompanyInfoCreationError("Error assigning image to DB");
                        }
                        imageId = assignImage.id;
                    }
                    const updated = yield tx.companyInfo.update({
                        where: { id },
                        data: {
                            email: data.CompanyInfo.email || existingCompany.email,
                            phone: (_b = data.CompanyInfo.phone) !== null && _b !== void 0 ? _b : existingCompany.phone,
                            address: (_c = data.CompanyInfo.address) !== null && _c !== void 0 ? _c : existingCompany.address,
                            city: (_d = data.CompanyInfo.city) !== null && _d !== void 0 ? _d : existingCompany.city,
                            country: (_e = data.CompanyInfo.country) !== null && _e !== void 0 ? _e : existingCompany.country,
                            postalCode: (_f = data.CompanyInfo.postalCode) !== null && _f !== void 0 ? _f : existingCompany.postalCode,
                            facebook: (_g = data.CompanyInfo.facebook) !== null && _g !== void 0 ? _g : existingCompany.facebook,
                            twitter: (_h = data.CompanyInfo.twitter) !== null && _h !== void 0 ? _h : existingCompany.twitter,
                            linkedin: (_j = data.CompanyInfo.linkedin) !== null && _j !== void 0 ? _j : existingCompany.linkedin,
                            instagram: (_k = data.CompanyInfo.instagram) !== null && _k !== void 0 ? _k : existingCompany.instagram,
                            github: (_l = data.CompanyInfo.github) !== null && _l !== void 0 ? _l : existingCompany.github,
                            youtube: (_m = data.CompanyInfo.youtube) !== null && _m !== void 0 ? _m : existingCompany.youtube,
                            logoId: imageId,
                        },
                        include: {
                            logo: true,
                        },
                    });
                    // Update or create English translation
                    const translationEN = yield tx.companyTranslation.upsert({
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
                    const translationAR = yield tx.companyTranslation.upsert({
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
                    const { logo } = updated, rest = __rest(updated, ["logo"]);
                    return {
                        Logo: logo,
                        translation: [translationEN, translationAR],
                        company: Object.assign({}, rest),
                    };
                }));
                return updatedSettings;
            }
            catch (error) {
                console.log(error);
                throw new companyInfo_1.CompanyInfoError("Error updating settings");
            }
        });
    }
    getMinimalStats() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const totalServices = yield this.prisma.service.count({
                    where: { isActive: true },
                });
                const progressProjects = yield this.prisma.project.count({
                    where: { status: "IN_PROGRESS" },
                });
                const completedProjects = yield this.prisma.project.count({
                    where: { status: "COMPLETED" },
                });
                const totalTeamMembers = yield this.prisma.teamMember.count();
                const newContactsThisMonth = yield this.prisma.contact.count({
                    where: {
                        createdAt: {
                            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
                        },
                    },
                });
                const testimonialCount = yield this.prisma.testimonial.count({});
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
            }
            catch (error) {
                throw new companyInfo_1.CompanyInfoError("Error fetching minimal stats");
            }
        });
    }
}
exports.CompanyInfoRepository = CompanyInfoRepository;
