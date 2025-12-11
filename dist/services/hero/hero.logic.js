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
exports.HeroLogic = void 0;
const hero_error_1 = require("../../errors/hero.error");
class HeroLogic {
    constructor(repository, validator) {
        this.repository = repository;
        this.validator = validator;
    }
    getAllHeroes(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const skip = params.skip || 0;
            const take = params.take || 10;
            const [heroes, totalItems] = yield Promise.all([
                this.repository.findMany(skip, take),
                this.repository.count(),
            ]);
            const remainingItems = totalItems - (skip * take + heroes.length);
            return {
                data: heroes,
                pagination: {
                    totalItems,
                    remainingItems,
                    nowCount: heroes.length,
                    totalPages: Math.ceil(totalItems / take),
                    currentPage: skip + 1,
                    pageSize: take,
                },
            };
        });
    }
    getHeroById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            this.validator.validateId(id);
            const hero = yield this.repository.findById(id);
            if (!hero) {
                throw new hero_error_1.HeroNotFoundError(id);
            }
            const { backgroundImage } = hero, rest = __rest(hero, ["backgroundImage"]);
            return {
                backgroundImage: backgroundImage,
                hero: rest,
            };
        });
    }
    getActiveHero() {
        return __awaiter(this, void 0, void 0, function* () {
            const hero = yield this.repository.findActiveHero();
            if (!hero) {
                throw new hero_error_1.HeroError('No active hero found', 404, 'NO_ACTIVE_HERO');
            }
            return hero;
        });
    }
    createHero(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const valid = this.validator.validateCreate(data);
            const hero = yield this.repository.create(valid);
            if (!hero)
                throw new Error('error create hero');
            return hero;
        });
    }
    deleteHero(heroId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!heroId)
                    throw new Error('id is required');
                this.validator.validateId(heroId);
                const deletedHero = yield this.repository.delete(heroId);
                if (!deletedHero)
                    throw new Error('error deleting hero');
                return deletedHero;
            }
            catch (error) {
                console.error(error);
                throw new Error('Error deleting hero');
            }
        });
    }
    Search(q) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!q)
                throw new hero_error_1.HeroError('search query is required', 400, 'SEARCH_QUERY_REQUIRED');
            const heroes = yield this.repository.SearchHero(q, 0, 10);
            if (!heroes)
                throw new hero_error_1.HeroError('error searching heroes', 400, 'ERROR_SEARCHING_HEROES');
            return heroes;
        });
    }
    updateHero(data) {
        return __awaiter(this, void 0, void 0, function* () {
            this.validator.validateUpdate(data);
            const updatedHero = yield this.repository.update(data);
            if (!updatedHero)
                throw new hero_error_1.HeroError('error updating hero', 400, 'ERROR_UPDATING_HERO');
            const { hero, backgroundImage } = updatedHero;
            return { hero, backgroundImage };
        });
    }
}
exports.HeroLogic = HeroLogic;
