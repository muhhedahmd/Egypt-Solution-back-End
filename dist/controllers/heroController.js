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
exports.HeroController = void 0;
const hero_error_1 = require("../errors/hero.error");
class HeroController {
    constructor(heroLogic) {
        this.heroLogic = heroLogic;
    }
    getAllHeroes(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { skip, take } = req.query;
                const heroes = yield this.heroLogic.getAllHeroes({
                    skip: Number(skip) || 0,
                    take: Number(take) || 10,
                });
                if (!heroes)
                    throw new hero_error_1.HeroNotFoundError('error get heroes');
                return res.json(Object.assign(Object.assign({}, heroes), { message: 'heroes fetched successfully', success: true }));
            }
            catch (error) {
                next(error);
            }
        });
    }
    getHeroById(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                if (!id)
                    throw new hero_error_1.HeroNotFoundError('id is required');
                const hero = yield this.heroLogic.getHeroById(id);
                return res.json({
                    data: hero,
                    message: 'hero fetched successfully',
                    success: true,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    getActiveHero(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const hero = yield this.heroLogic.getActiveHero();
                return res.json({
                    data: hero,
                    message: 'active hero fetched successfully',
                    success: true,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    createHero(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const data = req.body;
                // Parse JSON fields
                let styleOverrides = null;
                // if (data.styleOverrides) {
                //   try {
                //     styleOverrides = JSON.parse(data.styleOverrides);
                //   } catch (e) {
                //     console.error('Error parsing styleOverrides:', e);
                //   }
                // }
                // console.log({
                //   ...data,
                //   isActive: data.isActive === 'true' ? true : false,
                //   showScrollIndicator:
                //     data.showScrollIndicator === 'true' ? true : false,
                //   overlayOpacity: data.overlayOpacity
                //     ? parseFloat(data.overlayOpacity)
                //     : undefined,
                //   minHeight: data.minHeight ? Number(data.minHeight) : undefined,
                //   styleOverrides: styleOverrides,
                //   backgroundImage:
                //     Array.isArray(req.files) && req.files.length > 0
                //       ? req.files.find((f) => f.fieldname === 'backgroundImage')?.buffer
                //       : null,
                // })
                const newHero = yield this.heroLogic.createHero(Object.assign(Object.assign({}, data), { isActive: data.isActive === 'true' ? true : false, showScrollIndicator: data.showScrollIndicator === 'true' ? true : false, overlayOpacity: data.overlayOpacity
                        ? parseFloat(data.overlayOpacity)
                        : undefined, minHeight: data.minHeight ? Number(data.minHeight) : undefined, styleOverrides: styleOverrides, backgroundImage: Array.isArray(req.files) && req.files.length > 0
                        ? (_a = req.files.find((f) => f.fieldname === 'backgroundImage')) === null || _a === void 0 ? void 0 : _a.buffer
                        : undefined }));
                return res.status(201).json({
                    data: newHero,
                    message: 'hero created successfully',
                    success: true,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    updateHero(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { id } = req.params;
                const heroData = req.body;
                const files = req.files;
                // Parse JSON fields
                let styleOverrides = undefined;
                if (heroData.styleOverrides) {
                    try {
                        styleOverrides = JSON.parse(heroData.styleOverrides);
                    }
                    catch (e) {
                        console.error('Error parsing styleOverrides:', e);
                    }
                }
                const data = Object.assign(Object.assign({}, heroData), { heroId: id, backgroundImage: Array.isArray(files) && files.length > 0
                        ? (_a = files.find((f) => f.fieldname === 'backgroundImage')) === null || _a === void 0 ? void 0 : _a.buffer
                        : undefined, imageState: heroData === null || heroData === void 0 ? void 0 : heroData.imageState });
                const updatedHero = yield this.heroLogic.updateHero(Object.assign(Object.assign({}, data), { isActive: data.isActive === 'true'
                        ? true
                        : data.isActive === 'false'
                            ? false
                            : undefined, showScrollIndicator: data.showScrollIndicator === 'true'
                        ? true
                        : data.showScrollIndicator === 'false'
                            ? false
                            : undefined, overlayOpacity: data.overlayOpacity
                        ? parseFloat(data.overlayOpacity)
                        : undefined, minHeight: data.minHeight ? Number(data.minHeight) : undefined, styleOverrides: styleOverrides }));
                return res.json({
                    data: updatedHero,
                    message: 'hero updated successfully',
                    success: true,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    deleteHero(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                if (!id)
                    throw new hero_error_1.HeroNotFoundError('id is required');
                const deletedHero = yield this.heroLogic.deleteHero(id);
                if (!deletedHero)
                    throw new hero_error_1.HeroNotFoundError('error deleting hero');
                return res.json({
                    data: deletedHero,
                    message: 'hero deleted successfully',
                    success: true,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    SearchHeroes(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { q } = req.query;
                if (!q || typeof q !== 'string')
                    throw new hero_error_1.HeroError('search query is required', 400, 'SEARCH_QUERY_REQUIRED');
                const heroes = yield this.heroLogic.Search(q);
                if (!heroes)
                    throw new hero_error_1.HeroNotFoundError('error searching heroes');
                return res.json({
                    data: heroes,
                    message: 'heroes searched successfully',
                    success: true,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
}
exports.HeroController = HeroController;
