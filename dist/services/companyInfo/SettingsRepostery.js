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
exports.CompanyInfoRepostery = void 0;
const companyInfo_1 = require("../../errors/schema/companyInfo");
const helpers_1 = require("../../lib/helpers");
class CompanyInfoRepostery {
    constructor(prisma //   private ContactValidator: ContactValidator
    ) {
        this.prisma = prisma;
    }
    findSettings() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const settings = yield this.prisma.companyInfo.findMany();
                return settings;
            }
            catch (error) {
                throw new Error("Error fetching settings");
            }
        });
    }
    createSettings(_a) {
        return __awaiter(this, arguments, void 0, function* ({ logo, data, }) {
            try {
                let logoId = undefined;
                const transaction = yield this.prisma.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                    var _a;
                    if (logo) {
                        const uploadImage = yield (0, helpers_1.UploadImage)(logo, data.name);
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
                    // data.image = assignImage;
                    const newSettings = yield tx.companyInfo.create({
                        data: Object.assign(Object.assign({}, data), { logoId: logoId || null }),
                    });
                    return newSettings;
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
                    },
                });
                return settings;
            }
            catch (error) {
                throw new companyInfo_1.CompanyInfoError("Error fetching settings");
            }
        });
    }
    updateSettings(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const updatedSettings = yield this.prisma.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                    var _a;
                    let imageId = data.CompanyInfo.logoId;
                    if (data.LogoState === "REMOVE" && imageId) {
                        yield (0, helpers_1.deleteImageById)(imageId, tx);
                    }
                    else if (data.LogoState === "UPDATE" && data.logo) {
                        if (imageId) {
                            yield (0, helpers_1.deleteImageById)(imageId, tx);
                        }
                        const uploadImage = yield (0, helpers_1.UploadImage)(data.logo, data.CompanyInfo.name || "company-logo");
                        if (!((_a = uploadImage === null || uploadImage === void 0 ? void 0 : uploadImage.data) === null || _a === void 0 ? void 0 : _a.length)) {
                            throw new companyInfo_1.CompanyInfoCreationError("Error uploading image");
                        }
                        const assignImage = yield (0, helpers_1.AssignImageToDBImage)({
                            imageType: "COMPANY_LOGO",
                            data: Object.assign({}, uploadImage === null || uploadImage === void 0 ? void 0 : uploadImage.data),
                            blurhash: (uploadImage === null || uploadImage === void 0 ? void 0 : uploadImage.blurhash) || "",
                            height: (uploadImage === null || uploadImage === void 0 ? void 0 : uploadImage.height) || 25,
                        }, tx);
                        if (!assignImage) {
                            throw new companyInfo_1.CompanyInfoCreationError("Error assigning image to DB");
                        }
                        imageId = assignImage.id;
                    }
                    const updated = yield tx.companyInfo.update({
                        where: { id },
                        data: Object.assign(Object.assign({}, data.CompanyInfo), { logoId: imageId }),
                    });
                    return updated;
                }));
                return updatedSettings;
            }
            catch (error) {
                throw new companyInfo_1.CompanyInfoError("Error updating settings");
            }
        });
    }
    getMimalStats() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const totalServices = yield this.prisma.service.count({
                    where: { isActive: true },
                });
                const progressProjects = yield this.prisma.project.count({
                    where: { status: "IN_PROGRESS" },
                });
                const CompletedProjects = yield this.prisma.project.count({
                    where: { status: "COMPLETED" },
                });
                const totalTeamMembers = yield this.prisma.teamMember.count();
                const newContactsThisMonth = yield this.prisma.contact.count({
                    where: {
                        createdAt: {
                            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1), // first day of month
                        },
                    },
                });
                const testimonialCount = yield this.prisma.testimonial.count({});
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
            }
            catch (error) {
                throw new companyInfo_1.CompanyInfoError("Error fetching mimal stats");
            }
        });
    }
}
exports.CompanyInfoRepostery = CompanyInfoRepostery;
