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
exports.TeamRepository = void 0;
const slugify_1 = __importDefault(require("slugify"));
const crypto_1 = require("crypto");
const helpers_1 = require("../../lib/helpers");
const team_error_1 = require("../../errors/team.error");
class TeamRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    findMany(skip, take) {
        return __awaiter(this, void 0, void 0, function* () {
            const teamMembers = yield this.prisma.teamMember.findMany({
                include: {
                    image: true,
                    TeamMemberTranslation: {
                        select: {
                            name: true,
                            position: true,
                            bio: true,
                            lang: true,
                        },
                    },
                    slideShows: {
                        include: {
                            slideShow: true,
                        },
                    },
                },
                skip: skip * take,
                take: take,
                orderBy: {
                    order: "asc",
                },
            });
            return teamMembers.map((member) => {
                const { image, TeamMemberTranslation, slideShows } = member, rest = __rest(member, ["image", "TeamMemberTranslation", "slideShows"]);
                return {
                    teamMember: Object.assign({}, rest),
                    image: image || null,
                    translation: TeamMemberTranslation,
                    slideShows,
                };
            });
        });
    }
    ActiveCount(isFeatured) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.teamMember.count({
                where: {
                    isActive: true,
                    isFeatured: isFeatured || false,
                },
            });
        });
    }
    findManyActive(skip, take, isFeatured) {
        return __awaiter(this, void 0, void 0, function* () {
            const teamMembers = yield this.prisma.teamMember.findMany({
                where: {
                    isActive: true,
                    isFeatured: isFeatured || false,
                },
                include: {
                    image: true,
                    TeamMemberTranslation: {
                        select: {
                            name: true,
                            position: true,
                            bio: true,
                            lang: true,
                        },
                    },
                },
                skip: skip * take,
                take: take,
                orderBy: {
                    order: "asc",
                },
            });
            return teamMembers.map((member) => {
                const { image, TeamMemberTranslation } = member, rest = __rest(member, ["image", "TeamMemberTranslation"]);
                return {
                    teamMember: Object.assign({}, rest),
                    image: image || null,
                    translation: TeamMemberTranslation,
                };
            });
        });
    }
    isValidOrder(_a) {
        return __awaiter(this, arguments, void 0, function* ({ order }) {
            try {
                const find = yield this.prisma.teamMember.findFirst({
                    where: { order },
                });
                return {
                    isValid: !find,
                    takenby: find,
                };
            }
            catch (error) {
                console.error(error);
                throw new Error("Error finding team member by order");
            }
        });
    }
    count() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.teamMember.count();
        });
    }
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const member = yield this.prisma.teamMember.findUnique({
                    where: { id },
                    include: {
                        image: true,
                        TeamMemberTranslation: {
                            select: {
                                name: true,
                                position: true,
                                bio: true,
                                lang: true,
                            },
                        },
                        slideShows: {
                            include: {
                                slideShow: true,
                            },
                        },
                    },
                });
                if (!member)
                    return null;
                const { image, TeamMemberTranslation, slideShows } = member, rest = __rest(member, ["image", "TeamMemberTranslation", "slideShows"]);
                return {
                    teamMember: Object.assign({}, rest),
                    image: image || null,
                    translation: TeamMemberTranslation,
                    slideShows,
                };
            }
            catch (error) {
                console.error(error);
                throw new Error("Error finding team member by ID");
            }
        });
    }
    findBySlug(slug) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const findedTeamMember = yield this.prisma.teamMember.findUnique({
                    where: { slug },
                    include: {
                        image: true,
                        TeamMemberTranslation: {
                            select: {
                                name: true,
                                position: true,
                                bio: true,
                                lang: true,
                            },
                        },
                        slideShows: {
                            include: {
                                slideShow: true,
                            },
                            orderBy: {
                                order: "asc",
                            },
                        },
                    },
                });
                if (!findedTeamMember) {
                    return null;
                }
                const { image, TeamMemberTranslation, slideShows } = findedTeamMember, rest = __rest(findedTeamMember, ["image", "TeamMemberTranslation", "slideShows"]);
                return {
                    image: image || null,
                    slideShows: slideShows.map((ss) => ({
                        id: ss.id,
                        order: ss.order,
                        isVisible: ss.isVisible,
                        slideShow: ss.slideShow,
                        createdAt: ss.createdAt,
                        updatedAt: ss.updatedAt,
                    })),
                    teamMember: Object.assign({}, rest),
                    translation: TeamMemberTranslation,
                };
            }
            catch (error) {
                console.error(error);
                throw new team_error_1.TeamError("Error finding team member", 400, "TEAM_SEARCH_ERROR");
            }
        });
    }
    SearchTeamMember(lang, searchTerm, skip, take) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const teamMembers = yield this.prisma.teamMember.findMany({
                    where: {
                        OR: [
                            {
                                TeamMemberTranslation: {
                                    some: {
                                        name: {
                                            contains: searchTerm,
                                            mode: "insensitive",
                                        },
                                    },
                                },
                            },
                            {
                                TeamMemberTranslation: {
                                    some: {
                                        position: {
                                            contains: searchTerm,
                                            mode: "insensitive",
                                        },
                                    },
                                },
                            },
                            {
                                TeamMemberTranslation: {
                                    some: {
                                        bio: {
                                            contains: searchTerm,
                                            mode: "insensitive",
                                        },
                                    },
                                },
                            },
                            {
                                email: {
                                    contains: searchTerm,
                                    mode: "insensitive",
                                },
                            },
                            {
                                slug: {
                                    contains: searchTerm,
                                    mode: "insensitive",
                                },
                            },
                        ],
                    },
                    include: {
                        image: true,
                        TeamMemberTranslation: {
                            where: { lang },
                            select: {
                                name: true,
                                position: true,
                                bio: true,
                                lang: true,
                            },
                        },
                    },
                    skip: skip * take,
                    take,
                    orderBy: {
                        createdAt: "desc",
                    },
                });
                return teamMembers.map((member) => {
                    const { image, TeamMemberTranslation } = member, rest = __rest(member, ["image", "TeamMemberTranslation"]);
                    return Object.assign(Object.assign({}, rest), { translation: TeamMemberTranslation, image });
                });
            }
            catch (error) {
                console.error(error);
                throw new team_error_1.TeamError("Error searching team member", 400, "TEAM_SEARCH_ERROR");
            }
        });
    }
    create(lang, data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const transaction = yield this.prisma.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                    const slug = (0, slugify_1.default)(data.name + (0, crypto_1.randomUUID)().substring(0, 8), {
                        lower: true,
                    });
                    if (!slug)
                        throw new Error("error create slug");
                    let imageId = null;
                    // Upload image if provided
                    if (data.image) {
                        const createImage = yield (0, helpers_1.UploadImage)(data.image, data.name);
                        if (!createImage)
                            throw new Error("error upload image");
                        const imageToDB = yield (0, helpers_1.AssignImageToDBImage)({
                            imageType: "TEAM",
                            blurhash: createImage.blurhash,
                            width: createImage.width,
                            height: createImage.height,
                            data: createImage.data,
                        }, tx);
                        if (!imageToDB)
                            throw new Error("error create imageToDB");
                        imageId = imageToDB.id;
                    }
                    const teamMember = yield tx.teamMember.create({
                        data: {
                            slug: slug,
                            email: data.email,
                            phone: data.phone,
                            linkedin: data.linkedin,
                            github: data.github,
                            twitter: data.twitter,
                            imageId: imageId,
                            isActive: data.isActive || false,
                            isFeatured: data.isFeatured || false,
                            order: data.order || 0,
                            name: "",
                            position: "",
                            TeamMemberTranslation: {
                                create: {
                                    name: data.name,
                                    position: data.position,
                                    bio: data.bio,
                                    lang: lang,
                                },
                            },
                        },
                        include: {
                            image: true,
                            TeamMemberTranslation: {
                                where: { lang },
                                select: {
                                    name: true,
                                    position: true,
                                    bio: true,
                                    lang: true,
                                },
                            },
                        },
                    });
                    const { image, TeamMemberTranslation } = teamMember, rest = __rest(teamMember, ["image", "TeamMemberTranslation"]);
                    return {
                        Image: image,
                        translation: TeamMemberTranslation,
                        teamMember: Object.assign({}, rest),
                    };
                }), {
                    timeout: 20000,
                    maxWait: 5000,
                });
                return transaction;
            }
            catch (error) {
                console.error(error);
                throw new Error("Error creating team member");
            }
        });
    }
    update(lang, data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const transaction = yield this.prisma.$transaction((prismaTx) => __awaiter(this, void 0, void 0, function* () {
                    var _a, _b, _c;
                    let NewImageId = null;
                    if (!data.teamId)
                        throw new Error("no teamId provided");
                    const teamMember = yield prismaTx.teamMember.findUnique({
                        where: { id: data.teamId },
                    });
                    if (!teamMember)
                        throw new Error("team member not found");
                    NewImageId = (teamMember === null || teamMember === void 0 ? void 0 : teamMember.imageId) || null;
                    // Handle image update/removal
                    if (data.imageState === "REMOVE") {
                        if (teamMember.imageId) {
                            yield prismaTx.teamMember.update({
                                where: { id: data.teamId },
                                data: { imageId: null },
                            });
                            yield (0, helpers_1.deleteImageById)(teamMember.imageId, prismaTx);
                        }
                        NewImageId = null;
                    }
                    if (data.imageState === "UPDATE") {
                        if (teamMember.imageId) {
                            yield prismaTx.teamMember.update({
                                where: { id: data.teamId },
                                data: { imageId: null },
                            });
                            yield (0, helpers_1.deleteImageById)(teamMember.imageId, prismaTx);
                        }
                        if (!data.image)
                            throw new Error("no image provided");
                        const createImage = yield (0, helpers_1.UploadImage)(data.image, data.name || "update");
                        if (!createImage)
                            throw new Error("error upload image");
                        const imageToDB = yield (0, helpers_1.AssignImageToDBImage)({
                            imageType: "TEAM",
                            blurhash: createImage.blurhash,
                            width: createImage.width,
                            height: createImage.height,
                            data: createImage.data,
                        }, prismaTx);
                        if (!imageToDB)
                            throw new Error("error create imageToDB");
                        NewImageId = imageToDB.id;
                    }
                    // Generate new slug if name changed
                    if (data.name) {
                        const slug = (0, slugify_1.default)(data.name + (0, crypto_1.randomUUID)().substring(0, 8), {
                            lower: true,
                        });
                        data.slug = slug;
                    }
                    // Update the team member with new data
                    const updatedTeamMember = yield prismaTx.teamMember.update({
                        where: { id: data.teamId },
                        data: {
                            slug: data.slug || teamMember.slug,
                            email: data.email || teamMember.email,
                            phone: data.phone || teamMember.phone,
                            linkedin: data.linkedin || teamMember.linkedin,
                            github: data.github || teamMember.github,
                            twitter: data.twitter || teamMember.twitter,
                            imageId: NewImageId,
                            isActive: (_a = data.isActive) !== null && _a !== void 0 ? _a : teamMember.isActive,
                            isFeatured: (_b = data.isFeatured) !== null && _b !== void 0 ? _b : teamMember.isFeatured,
                            order: (_c = data.order) !== null && _c !== void 0 ? _c : teamMember.order,
                        },
                        include: {
                            image: true,
                        },
                    });
                    // Update or create translation
                    const t = yield prismaTx.teamMemberTranslation.upsert({
                        where: {
                            memberId_lang: {
                                memberId: data.teamId,
                                lang: lang,
                            },
                        },
                        update: {
                            name: data.name,
                            position: data.position,
                            bio: data.bio,
                        },
                        create: {
                            memberId: data.teamId,
                            name: data.name || "Team Member",
                            position: data.position || "Position",
                            bio: data.bio,
                            lang: lang,
                        },
                    });
                    const { image } = updatedTeamMember, rest = __rest(updatedTeamMember, ["image"]);
                    // const translation = translations.find((t) => t.lang === lang);
                    return {
                        Image: image,
                        translation: t,
                        teamMember: Object.assign({}, rest),
                    };
                }), {
                    timeout: 20000,
                    maxWait: 5000,
                });
                return transaction;
            }
            catch (error) {
                console.error(error);
                throw new Error("Error updating team member");
            }
        });
    }
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const transaction = yield this.prisma.$transaction((prismaTx) => __awaiter(this, void 0, void 0, function* () {
                    const teamMember = yield prismaTx.teamMember.findUnique({
                        where: { id },
                    });
                    if (!teamMember)
                        throw new Error("team member not found");
                    yield prismaTx.teamMember.update({
                        where: { id },
                        data: { imageId: null },
                    });
                    if (teamMember.imageId)
                        yield (0, helpers_1.deleteImageById)(teamMember.imageId, prismaTx);
                    yield prismaTx.teamMember.delete({ where: { id } });
                    return teamMember;
                }), {
                    timeout: 20000,
                    maxWait: 5000,
                });
                return transaction;
            }
            catch (error) {
                console.error(error);
                throw new Error("Error deleting team member");
            }
        });
    }
}
exports.TeamRepository = TeamRepository;
