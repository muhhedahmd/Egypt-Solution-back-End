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
exports.HeroRepository = void 0;
const hero_error_1 = require("../../errors/hero.error");
const helpers_1 = require("../../lib/helpers");
class HeroRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    findMany() {
        return __awaiter(this, arguments, void 0, function* (lang = "EN", skip, take) {
            try {
                const heroes = yield this.prisma.hero.findMany({
                    include: {
                        backgroundImage: true,
                        HeroTranslation: {
                            select: {
                                id: true,
                                name: true,
                                ctaText: true,
                                description: true,
                                secondaryCtaText: true,
                                lang: true,
                                subtitle: true,
                                title: true,
                            },
                        },
                    },
                    skip: skip * take,
                    take: take,
                    orderBy: {
                        createdAt: "desc",
                    },
                });
                return heroes.map((hero) => {
                    const { backgroundImage, HeroTranslation } = hero, rest = __rest(hero, ["backgroundImage", "HeroTranslation"]);
                    return {
                        hero: Object.assign(Object.assign({}, rest), { HeroTranslation }),
                        backgroundImage: backgroundImage || null,
                    };
                });
            }
            catch (error) {
                console.error(error);
                throw new hero_error_1.HeroError("Error finding heroes", 400, "HERO_FIND_MANY_ERROR");
            }
        });
    }
    count() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.hero.count();
        });
    }
    findById() {
        return __awaiter(this, arguments, void 0, function* (lang = "EN", id) {
            try {
                const hero = yield this.prisma.hero.findUnique({
                    where: { id },
                    include: {
                        backgroundImage: true,
                        HeroTranslation: {
                            where: {
                                lang,
                            },
                            select: {
                                name: true,
                                ctaText: true,
                                description: true,
                                secondaryCtaText: true,
                                lang: true,
                                subtitle: true,
                                title: true,
                            },
                        },
                    },
                });
                if (!hero)
                    return null;
                const { backgroundImage, HeroTranslation } = hero, rest = __rest(hero, ["backgroundImage", "HeroTranslation"]);
                return {
                    hero: Object.assign(Object.assign({}, rest), HeroTranslation[0]),
                    backgroundImage: backgroundImage || null,
                };
            }
            catch (error) {
                console.error(error);
                throw new Error("Error finding hero by ID");
            }
        });
    }
    toggleActive(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const hero = yield this.prisma.hero.findUnique({
                    where: { id },
                    select: {
                        isActive: true,
                    },
                });
                if (!hero) {
                    throw new hero_error_1.HeroError("Hero not found", 404, "HERO_NOT_FOUND");
                }
                const newActiveState = !hero.isActive;
                if (newActiveState === true) {
                    yield this.prisma.hero.updateMany({
                        where: {
                            id: {
                                not: id,
                            },
                        },
                        data: {
                            isActive: false,
                        },
                    });
                }
                return yield this.prisma.hero.update({
                    where: { id },
                    data: {
                        isActive: newActiveState,
                    },
                    select: {
                        id: true,
                        isActive: true,
                    },
                });
            }
            catch (error) {
                if (error instanceof hero_error_1.HeroError)
                    throw error;
                throw new hero_error_1.HeroError("Error toggling active hero", 400, "HERO_TOGGLE_ERROR");
            }
        });
    }
    findActiveHero() {
        return __awaiter(this, arguments, void 0, function* (lang = "EN") {
            console.log(lang, "lang");
            try {
                const hero = yield this.prisma.hero.findFirst({
                    where: { isActive: true },
                    include: {
                        backgroundImage: true,
                        HeroTranslation: {
                            where: {
                                lang,
                            },
                            select: {
                                name: true,
                                ctaText: true,
                                description: true,
                                secondaryCtaText: true,
                                lang: true,
                                subtitle: true,
                                title: true,
                            },
                        },
                    },
                    orderBy: {
                        updatedAt: "desc",
                    },
                });
                if (!hero)
                    return null;
                const { backgroundImage, HeroTranslation } = hero, rest = __rest(hero, ["backgroundImage", "HeroTranslation"]);
                return {
                    hero: Object.assign(Object.assign({}, rest), HeroTranslation[0]),
                    backgroundImage: backgroundImage || null,
                };
            }
            catch (error) {
                console.error(error);
                throw new hero_error_1.HeroError("Error finding active hero", 400, "HERO_SEARCH_ERROR");
            }
        });
    }
    SearchHero(searchTerm, skip, take) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const heroes = yield this.prisma.hero.findMany({
                    where: {
                        OR: [
                            {
                                HeroTranslation: {
                                    some: {
                                        name: {
                                            contains: searchTerm,
                                            mode: "insensitive",
                                        },
                                    },
                                },
                            },
                            {
                                HeroTranslation: {
                                    some: {
                                        title: {
                                            contains: searchTerm,
                                            mode: "insensitive",
                                        },
                                    },
                                },
                            },
                            {
                                HeroTranslation: {
                                    some: {
                                        subtitle: {
                                            contains: searchTerm,
                                            mode: "insensitive",
                                        },
                                    },
                                },
                            },
                            {
                                HeroTranslation: {
                                    some: {
                                        description: {
                                            contains: searchTerm,
                                            mode: "insensitive",
                                        },
                                    },
                                },
                            },
                        ],
                    },
                    include: {
                        backgroundImage: true,
                        HeroTranslation: {
                            select: {
                                name: true,
                                ctaText: true,
                                description: true,
                                secondaryCtaText: true,
                                lang: true,
                                subtitle: true,
                                title: true,
                            },
                        },
                    },
                    skip: skip * take,
                    take,
                    orderBy: {
                        createdAt: "desc",
                    },
                });
                return heroes.map((hero) => {
                    const { backgroundImage, HeroTranslation } = hero, rest = __rest(hero, ["backgroundImage", "HeroTranslation"]);
                    return {
                        hero: Object.assign(Object.assign({}, rest), { HeroTranslation }),
                        backgroundImage: backgroundImage || null,
                    };
                });
            }
            catch (error) {
                console.error(error);
                throw new hero_error_1.HeroError("Error searching hero", 400, "HERO_SEARCH_ERROR");
            }
        });
    }
    create(lang, data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const transaction = yield this.prisma.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                    var _a;
                    let imageId = null;
                    // Upload background image if provided
                    if (data.backgroundImage) {
                        const createImage = yield (0, helpers_1.UploadImage)(data.backgroundImage, data.name || "hero-background");
                        if (!createImage)
                            throw new Error("error upload image");
                        const imageToDB = yield (0, helpers_1.AssignImageToDBImage)({
                            imageType: "HERO",
                            blurhash: createImage.blurhash,
                            width: createImage.width,
                            height: createImage.height,
                            data: createImage.data,
                        }, tx);
                        if (!imageToDB)
                            throw new Error("error create imageToDB");
                        imageId = imageToDB.id;
                    }
                    if (data.isActive) {
                        const currentActiveHero = yield tx.hero.findFirst({
                            where: {
                                isActive: true,
                            },
                        });
                        if (currentActiveHero) {
                            yield tx.hero.update({
                                where: {
                                    id: currentActiveHero.id,
                                },
                                data: {
                                    isActive: false,
                                },
                            });
                        }
                    }
                    const hero = yield tx.hero.create({
                        data: {
                            name: "",
                            title: "",
                            backgroundImageId: imageId,
                            backgroundColor: data.backgroundColor,
                            backgroundVideo: data.backgroundVideo,
                            overlayColor: data.overlayColor,
                            overlayOpacity: data.overlayOpacity,
                            ctaUrl: data.ctaUrl,
                            ctaVariant: data.ctaVariant,
                            secondaryCtaUrl: data.secondaryCtaUrl,
                            secondaryCtaVariant: data.secondaryCtaVariant,
                            alignment: data.alignment,
                            variant: data.variant || "CENTERED",
                            minHeight: data.minHeight,
                            titleSize: data.titleSize,
                            titleColor: data.titleColor,
                            subtitleColor: data.subtitleColor,
                            descriptionColor: data.descriptionColor,
                            showScrollIndicator: data.showScrollIndicator || false,
                            customCSS: data.customCSS,
                            styleOverrides: data.styleOverrides,
                            isActive: (_a = data.isActive) !== null && _a !== void 0 ? _a : true,
                            HeroTranslation: {
                                create: {
                                    name: data.name || "Main Hero",
                                    title: data.title,
                                    subtitle: data.subtitle,
                                    description: data.description,
                                    ctaText: data.ctaText,
                                    secondaryCtaText: data.secondaryCtaText,
                                    lang: lang,
                                },
                            },
                        },
                        include: {
                            backgroundImage: true,
                            HeroTranslation: {
                                select: {
                                    name: true,
                                    ctaText: true,
                                    description: true,
                                    secondaryCtaText: true,
                                    lang: true,
                                    subtitle: true,
                                    title: true,
                                },
                            },
                        },
                    });
                    const { backgroundImage, HeroTranslation } = hero, rest = __rest(hero, ["backgroundImage", "HeroTranslation"]);
                    return {
                        hero: Object.assign(Object.assign({}, rest), HeroTranslation[0]),
                        backgroundImage: backgroundImage,
                    };
                }), {
                    timeout: 20000,
                    isolationLevel: "Serializable",
                    maxWait: 5000,
                });
                return transaction;
            }
            catch (error) {
                console.error(error);
                throw new Error("Error creating hero");
            }
        });
    }
    update(lang, data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const transaction = yield this.prisma.$transaction((prismaTx) => __awaiter(this, void 0, void 0, function* () {
                    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u;
                    let newImageId = null;
                    if (!data.heroId)
                        throw new Error("no heroId provided");
                    const hero = yield prismaTx.hero.findUnique({
                        where: { id: data.heroId },
                    });
                    if (!hero)
                        throw new Error("hero not found");
                    newImageId = (hero === null || hero === void 0 ? void 0 : hero.backgroundImageId) || null;
                    // Handle image update/removal
                    if (data.imageState === "REMOVE") {
                        if (hero.backgroundImageId) {
                            yield prismaTx.hero.update({
                                where: { id: data.heroId },
                                data: { backgroundImageId: null },
                            });
                            yield (0, helpers_1.deleteImageById)(hero.backgroundImageId, prismaTx);
                        }
                        newImageId = null;
                    }
                    if (data.imageState === "UPDATE") {
                        if (hero.backgroundImageId) {
                            yield prismaTx.hero.update({
                                where: { id: data.heroId },
                                data: { backgroundImageId: null },
                            });
                            yield (0, helpers_1.deleteImageById)(hero.backgroundImageId, prismaTx);
                        }
                        if (!data.backgroundImage)
                            throw new Error("no image provided");
                        const createImage = yield (0, helpers_1.UploadImage)(data.backgroundImage, data.name || "hero-update");
                        if (!createImage)
                            throw new Error("error upload image");
                        const imageToDB = yield (0, helpers_1.AssignImageToDBImage)({
                            imageType: "HERO",
                            blurhash: createImage.blurhash,
                            width: createImage.width,
                            height: createImage.height,
                            data: createImage.data,
                        }, prismaTx);
                        if (!imageToDB)
                            throw new Error("error create imageToDB");
                        newImageId = imageToDB.id;
                    }
                    // Update the hero with new data
                    if (data.isActive) {
                        const currentActiveHero = yield prismaTx.hero.findFirst({
                            where: {
                                isActive: true,
                            },
                        });
                        if (currentActiveHero) {
                            yield prismaTx.hero.update({
                                where: {
                                    id: currentActiveHero.id,
                                },
                                data: {
                                    isActive: false,
                                },
                            });
                        }
                    }
                    const updatedHero = yield prismaTx.hero.update({
                        where: { id: data.heroId },
                        data: {
                            name: "",
                            title: "",
                            backgroundImageId: newImageId,
                            backgroundColor: (_a = data.backgroundColor) !== null && _a !== void 0 ? _a : hero.backgroundColor,
                            backgroundVideo: (_b = data.backgroundVideo) !== null && _b !== void 0 ? _b : hero.backgroundVideo,
                            overlayColor: (_c = data.overlayColor) !== null && _c !== void 0 ? _c : hero.overlayColor,
                            overlayOpacity: (_d = data.overlayOpacity) !== null && _d !== void 0 ? _d : hero.overlayOpacity,
                            ctaUrl: (_e = data.ctaUrl) !== null && _e !== void 0 ? _e : hero.ctaUrl,
                            ctaVariant: (_f = data.ctaVariant) !== null && _f !== void 0 ? _f : hero.ctaVariant,
                            secondaryCtaUrl: (_g = data.secondaryCtaUrl) !== null && _g !== void 0 ? _g : hero.secondaryCtaUrl,
                            secondaryCtaVariant: (_h = data.secondaryCtaVariant) !== null && _h !== void 0 ? _h : hero.secondaryCtaVariant,
                            alignment: (_j = data.alignment) !== null && _j !== void 0 ? _j : hero.alignment,
                            variant: (_k = data.variant) !== null && _k !== void 0 ? _k : hero.variant,
                            minHeight: (_l = data.minHeight) !== null && _l !== void 0 ? _l : hero.minHeight,
                            titleSize: (_m = data.titleSize) !== null && _m !== void 0 ? _m : hero.titleSize,
                            titleColor: (_o = data.titleColor) !== null && _o !== void 0 ? _o : hero.titleColor,
                            subtitleColor: (_p = data.subtitleColor) !== null && _p !== void 0 ? _p : hero.subtitleColor,
                            descriptionColor: (_q = data.descriptionColor) !== null && _q !== void 0 ? _q : hero.descriptionColor,
                            showScrollIndicator: (_r = data.showScrollIndicator) !== null && _r !== void 0 ? _r : hero.showScrollIndicator,
                            customCSS: (_s = data.customCSS) !== null && _s !== void 0 ? _s : hero.customCSS,
                            styleOverrides: (_t = data.styleOverrides) !== null && _t !== void 0 ? _t : hero.styleOverrides,
                            isActive: (_u = data.isActive) !== null && _u !== void 0 ? _u : hero.isActive,
                        },
                        include: {
                            backgroundImage: true,
                            HeroTranslation: {
                                select: {
                                    name: true,
                                    ctaText: true,
                                    description: true,
                                    secondaryCtaText: true,
                                    lang: true,
                                    subtitle: true,
                                    title: true,
                                },
                            },
                        },
                    });
                    // Update translation
                    yield prismaTx.heroTranslation.upsert({
                        where: {
                            heroId_lang: {
                                lang,
                                heroId: data.heroId,
                            },
                        },
                        update: {
                            name: data.name || hero.name,
                            title: data.title || hero.title,
                            subtitle: data.subtitle || hero.subtitle,
                            description: data.description || hero.description,
                            ctaText: data.ctaText || hero.ctaText,
                            secondaryCtaText: data.secondaryCtaText || hero.secondaryCtaText,
                        },
                        create: {
                            heroId: data.heroId,
                            name: data.name || hero.name,
                            title: data.title || hero.title,
                            subtitle: data.subtitle || hero.subtitle,
                            description: data.description || hero.description,
                            ctaText: data.ctaText || hero.ctaText,
                            secondaryCtaText: data.secondaryCtaText || hero.secondaryCtaText,
                            lang,
                        },
                        select: {
                            name: true,
                            ctaText: true,
                            description: true,
                            secondaryCtaText: true,
                            lang: true,
                            subtitle: true,
                            title: true,
                        },
                    });
                    const { backgroundImage, HeroTranslation } = updatedHero, rest = __rest(updatedHero, ["backgroundImage", "HeroTranslation"]);
                    const translation = HeroTranslation.find((t) => t.lang === lang);
                    return {
                        hero: Object.assign(Object.assign({}, rest), translation),
                        backgroundImage: backgroundImage,
                    };
                }), {
                    timeout: 20000,
                    maxWait: 5000,
                });
                return transaction;
            }
            catch (error) {
                console.error(error);
                throw new Error("Error updating hero");
            }
        });
    }
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const transaction = yield this.prisma.$transaction((prismaTx) => __awaiter(this, void 0, void 0, function* () {
                    const hero = yield prismaTx.hero.findUnique({ where: { id } });
                    if (!hero)
                        throw new Error("hero not found");
                    yield prismaTx.hero.update({
                        where: { id },
                        data: { backgroundImageId: null },
                    });
                    if (hero.backgroundImageId)
                        yield (0, helpers_1.deleteImageById)(hero.backgroundImageId, prismaTx);
                    yield prismaTx.hero.delete({ where: { id } });
                    return hero;
                }), {
                    timeout: 20000,
                    maxWait: 5000,
                });
                return transaction;
            }
            catch (error) {
                console.error(error);
                throw new Error("Error deleting hero");
            }
        });
    }
}
exports.HeroRepository = HeroRepository;
