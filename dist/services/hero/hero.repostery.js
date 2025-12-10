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
    findMany(skip, take) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const heroes = yield this.prisma.hero.findMany({
                    include: {
                        backgroundImage: true,
                    },
                    skip: skip * take,
                    take: take,
                    orderBy: {
                        createdAt: 'desc',
                    },
                });
                return heroes.map((hero) => {
                    const { backgroundImage } = hero, rest = __rest(hero, ["backgroundImage"]);
                    return {
                        hero: rest,
                        backgroundImage: backgroundImage || null,
                    };
                });
            }
            catch (error) {
                console.error(error);
                throw new hero_error_1.HeroError('Error finding heroes', 400, 'HERO_FIND_MANY_ERROR');
            }
        });
    }
    count() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.hero.count();
        });
    }
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return this.prisma.hero.findUnique({
                    where: { id },
                    include: {
                        backgroundImage: true,
                    },
                });
            }
            catch (error) {
                console.error(error);
                throw new Error('Error finding hero by ID');
            }
        });
    }
    findActiveHero() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const hero = yield this.prisma.hero.findFirst({
                    where: { isActive: true },
                    include: {
                        backgroundImage: true,
                    },
                    orderBy: {
                        updatedAt: 'desc',
                    },
                });
                if (!hero)
                    return null;
                const { backgroundImage } = hero, rest = __rest(hero, ["backgroundImage"]);
                return {
                    hero: rest,
                    backgroundImage: backgroundImage || null,
                };
            }
            catch (error) {
                console.error(error);
                throw new hero_error_1.HeroError('Error finding active hero', 400, 'HERO_SEARCH_ERROR');
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
                                name: {
                                    contains: searchTerm,
                                    mode: 'insensitive',
                                },
                            },
                            {
                                title: {
                                    contains: searchTerm,
                                    mode: 'insensitive',
                                },
                            },
                            {
                                subtitle: {
                                    contains: searchTerm,
                                    mode: 'insensitive',
                                },
                            },
                            {
                                description: {
                                    contains: searchTerm,
                                    mode: 'insensitive',
                                },
                            },
                        ],
                    },
                    include: {
                        backgroundImage: true,
                    },
                    skip: skip * take,
                    take,
                    orderBy: {
                        createdAt: 'desc',
                    },
                });
                return heroes.map((hero) => {
                    const { backgroundImage } = hero, rest = __rest(hero, ["backgroundImage"]);
                    return {
                        hero: rest,
                        backgroundImage: backgroundImage || null,
                    };
                });
            }
            catch (error) {
                console.error(error);
                throw new hero_error_1.HeroError('Error searching hero', 400, 'HERO_SEARCH_ERROR');
            }
        });
    }
    create(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const transaction = yield this.prisma.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                    var _a;
                    let imageId = null;
                    // Upload background image if provided
                    if (data.backgroundImage) {
                        const createImage = yield (0, helpers_1.UploadImage)(data.backgroundImage, data.name || 'hero-background');
                        if (!createImage)
                            throw new Error('error upload image');
                        const imageToDB = yield (0, helpers_1.AssignImageToDBImage)({
                            imageType: 'HERO',
                            blurhash: createImage.blurhash,
                            width: createImage.width,
                            height: createImage.height,
                            data: createImage.data,
                        }, tx);
                        if (!imageToDB)
                            throw new Error('error create imageToDB');
                        imageId = imageToDB.id;
                    }
                    const hero = yield tx.hero.create({
                        data: {
                            name: data.name || 'Main Hero',
                            title: data.title,
                            subtitle: data.subtitle,
                            description: data.description,
                            backgroundImageId: imageId,
                            backgroundColor: data.backgroundColor,
                            backgroundVideo: data.backgroundVideo,
                            overlayColor: data.overlayColor,
                            overlayOpacity: data.overlayOpacity,
                            ctaText: data.ctaText,
                            ctaUrl: data.ctaUrl,
                            ctaVariant: data.ctaVariant,
                            secondaryCtaText: data.secondaryCtaText,
                            secondaryCtaUrl: data.secondaryCtaUrl,
                            secondaryCtaVariant: data.secondaryCtaVariant,
                            alignment: data.alignment,
                            variant: data.variant || 'CENTERED',
                            minHeight: data.minHeight,
                            titleSize: data.titleSize,
                            titleColor: data.titleColor,
                            subtitleColor: data.subtitleColor,
                            descriptionColor: data.descriptionColor,
                            showScrollIndicator: data.showScrollIndicator || false,
                            customCSS: data.customCSS,
                            styleOverrides: data.styleOverrides,
                            isActive: (_a = data.isActive) !== null && _a !== void 0 ? _a : true,
                        },
                        include: {
                            backgroundImage: true,
                        },
                    });
                    const { backgroundImage } = hero, rest = __rest(hero, ["backgroundImage"]);
                    return { hero: rest, backgroundImage: backgroundImage };
                }), {
                    timeout: 20000,
                    isolationLevel: 'Serializable',
                    maxWait: 5000,
                });
                return transaction;
            }
            catch (error) {
                console.error(error);
                throw new Error('Error creating hero');
            }
        });
    }
    update(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const transaction = yield this.prisma.$transaction((prismaTx) => __awaiter(this, void 0, void 0, function* () {
                    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0;
                    let newImageId = null;
                    if (!data.heroId)
                        throw new Error('no heroId provided');
                    const hero = yield prismaTx.hero.findUnique({
                        where: { id: data.heroId },
                    });
                    if (!hero)
                        throw new Error('hero not found');
                    newImageId = (hero === null || hero === void 0 ? void 0 : hero.backgroundImageId) || null;
                    // Handle image update/removal
                    if (data.imageState === 'REMOVE') {
                        if (hero.backgroundImageId) {
                            yield prismaTx.hero.update({
                                where: { id: data.heroId },
                                data: { backgroundImageId: null },
                            });
                            yield (0, helpers_1.deleteImageById)(hero.backgroundImageId, prismaTx);
                        }
                        newImageId = null;
                    }
                    if (data.imageState === 'UPDATE') {
                        if (hero.backgroundImageId) {
                            yield prismaTx.hero.update({
                                where: { id: data.heroId },
                                data: { backgroundImageId: null },
                            });
                            yield (0, helpers_1.deleteImageById)(hero.backgroundImageId, prismaTx);
                        }
                        if (!data.backgroundImage)
                            throw new Error('no image provided');
                        const createImage = yield (0, helpers_1.UploadImage)(data.backgroundImage, data.name || 'hero-update');
                        if (!createImage)
                            throw new Error('error upload image');
                        const imageToDB = yield (0, helpers_1.AssignImageToDBImage)({
                            imageType: 'HERO',
                            blurhash: createImage.blurhash,
                            width: createImage.width,
                            height: createImage.height,
                            data: createImage.data,
                        }, prismaTx);
                        if (!imageToDB)
                            throw new Error('error create imageToDB');
                        newImageId = imageToDB.id;
                    }
                    // Update the hero with new data
                    const updatedHero = yield prismaTx.hero.update({
                        where: { id: data.heroId },
                        data: {
                            name: (_a = data.name) !== null && _a !== void 0 ? _a : hero.name,
                            title: (_b = data.title) !== null && _b !== void 0 ? _b : hero.title,
                            subtitle: (_c = data.subtitle) !== null && _c !== void 0 ? _c : hero.subtitle,
                            description: (_d = data.description) !== null && _d !== void 0 ? _d : hero.description,
                            backgroundImageId: newImageId,
                            backgroundColor: (_e = data.backgroundColor) !== null && _e !== void 0 ? _e : hero.backgroundColor,
                            backgroundVideo: (_f = data.backgroundVideo) !== null && _f !== void 0 ? _f : hero.backgroundVideo,
                            overlayColor: (_g = data.overlayColor) !== null && _g !== void 0 ? _g : hero.overlayColor,
                            overlayOpacity: (_h = data.overlayOpacity) !== null && _h !== void 0 ? _h : hero.overlayOpacity,
                            ctaText: (_j = data.ctaText) !== null && _j !== void 0 ? _j : hero.ctaText,
                            ctaUrl: (_k = data.ctaUrl) !== null && _k !== void 0 ? _k : hero.ctaUrl,
                            ctaVariant: (_l = data.ctaVariant) !== null && _l !== void 0 ? _l : hero.ctaVariant,
                            secondaryCtaText: (_m = data.secondaryCtaText) !== null && _m !== void 0 ? _m : hero.secondaryCtaText,
                            secondaryCtaUrl: (_o = data.secondaryCtaUrl) !== null && _o !== void 0 ? _o : hero.secondaryCtaUrl,
                            secondaryCtaVariant: (_p = data.secondaryCtaVariant) !== null && _p !== void 0 ? _p : hero.secondaryCtaVariant,
                            alignment: (_q = data.alignment) !== null && _q !== void 0 ? _q : hero.alignment,
                            variant: (_r = data.variant) !== null && _r !== void 0 ? _r : hero.variant,
                            minHeight: (_s = data.minHeight) !== null && _s !== void 0 ? _s : hero.minHeight,
                            titleSize: (_t = data.titleSize) !== null && _t !== void 0 ? _t : hero.titleSize,
                            titleColor: (_u = data.titleColor) !== null && _u !== void 0 ? _u : hero.titleColor,
                            subtitleColor: (_v = data.subtitleColor) !== null && _v !== void 0 ? _v : hero.subtitleColor,
                            descriptionColor: (_w = data.descriptionColor) !== null && _w !== void 0 ? _w : hero.descriptionColor,
                            showScrollIndicator: (_x = data.showScrollIndicator) !== null && _x !== void 0 ? _x : hero.showScrollIndicator,
                            customCSS: (_y = data.customCSS) !== null && _y !== void 0 ? _y : hero.customCSS,
                            styleOverrides: (_z = data.styleOverrides) !== null && _z !== void 0 ? _z : hero.styleOverrides,
                            isActive: (_0 = data.isActive) !== null && _0 !== void 0 ? _0 : hero.isActive,
                        },
                        include: { backgroundImage: true },
                    });
                    const { backgroundImage } = updatedHero, rest = __rest(updatedHero, ["backgroundImage"]);
                    return { hero: rest, backgroundImage: backgroundImage };
                }), {
                    timeout: 20000,
                    maxWait: 5000,
                });
                return transaction;
            }
            catch (error) {
                console.error(error);
                throw new Error('Error updating hero');
            }
        });
    }
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const transaction = yield this.prisma.$transaction((prismaTx) => __awaiter(this, void 0, void 0, function* () {
                    const hero = yield prismaTx.hero.findUnique({ where: { id } });
                    if (!hero)
                        throw new Error('hero not found');
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
                throw new Error('Error deleting hero');
            }
        });
    }
}
exports.HeroRepository = HeroRepository;
