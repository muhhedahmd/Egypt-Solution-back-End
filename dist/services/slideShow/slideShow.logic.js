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
exports.slideShowLogic = void 0;
const crypto_1 = require("crypto");
const slugify_1 = __importDefault(require("slugify"));
const services_error_1 = require("../../errors/services.error");
const client_1 = require("@prisma/client");
const redis_1 = require("../../config/redis");
const keys_1 = require("../../config/keys");
class slideShowLogic {
    constructor(repository, validator) {
        this.repository = repository;
        this.validator = validator;
    }
    getAllServices(lang, params, visible) {
        return __awaiter(this, void 0, void 0, function* () {
            this.validator.validatePagination(params);
            const skip = params.skip || 0;
            const take = params.take || 10;
            const redis = yield (0, redis_1.getRedisClient)();
            const key = (0, keys_1.slideShowsKey)(`${skip.toString()}-${take.toString()}`);
            const hashData = yield redis.get(key);
            if (hashData) {
                return JSON.parse(hashData);
            }
            const [slideShows, totalItems] = yield Promise.all([
                this.repository.findMany(lang, { skip, take }, visible),
                this.repository.count(visible),
            ]);
            const remainingItems = totalItems - (skip * take + slideShows.length);
            const data = {
                data: slideShows,
                pagination: {
                    totalItems,
                    remainingItems,
                    nowCount: slideShows.length,
                    totalPages: Math.ceil(totalItems / take),
                    currentPage: skip + 1,
                    pageSize: take,
                },
            };
            if (!(slideShows === null || slideShows === void 0 ? void 0 : slideShows.length))
                return data;
            yield redis.setEx(key, 900, JSON.stringify(data));
            return data;
        });
    }
    getAllSlideShowsMinmal(lang) {
        return __awaiter(this, void 0, void 0, function* () {
            const slideShows = yield this.repository.findManyMinimal(lang);
            return slideShows;
        });
    }
    create(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const dataCreate = this.validator.validateCreate(data);
            const slug = (0, slugify_1.default)(dataCreate.title + (0, crypto_1.randomUUID)().substring(0, 6), {
                lower: true,
            });
            const slideShow = yield this.repository.create(Object.assign(Object.assign({}, dataCreate), { slug }));
            if (!slideShow)
                throw new services_error_1.ServiceError("error create services", 400, "SLIDESHOW_CREATION_ERROR");
            return slideShow;
        });
    }
    update(lang, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const dataUpdate = this.validator.validateUpdate(data);
            const updateSlideShow = yield this.repository.update(lang, dataUpdate);
            return updateSlideShow;
        });
    }
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const validId = this.validator.validateId(id);
            const deleteSlideShow = yield this.repository.delete(validId);
            return deleteSlideShow;
        });
    }
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const validId = this.validator.validateId(id);
            const redis = yield (0, redis_1.getRedisClient)();
            const key = (0, keys_1.slideShowKeyById)(validId);
            const hashData = yield redis.get(key);
            if (hashData) {
                return JSON.parse(hashData);
            }
            else {
                const findSlideShow = yield this.repository.findById(validId);
                if (!findSlideShow)
                    return null;
                try {
                    yield redis.setEx(key, 120, JSON.stringify(findSlideShow));
                    return findSlideShow;
                }
                catch (error) {
                    console.log(error);
                }
            }
        });
    }
    attach(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const valid = this.validator.validateAttachGlobal(data);
            const createAttachSlideShow = yield this.repository.attach(valid);
            return createAttachSlideShow;
        });
    }
    deattach(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const valid = this.validator.validateDeattachGlobal(data);
            const updatedService = yield this.repository.Deattach(valid);
            return updatedService;
        });
    }
    // ***
    createAndAttachMany(lang, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const valid = this.validator.validCreateAndAttachManySchema(data);
            if (!valid)
                throw new services_error_1.ServiceError("Invalid data for create and attach many", 400, "SLIDESHOW_CREATE_ATTACH_MANY_ERROR");
            const { slides } = valid, rest = __rest(valid, ["slides"]);
            const createdAndAttached = yield this.repository.createAndAttachMany(lang, Object.assign({ slides: slides.map((slide) => ({
                    id: slide.attachId,
                    type: slide.attachType,
                    order: slide.order,
                    isVisible: slide.isVisible,
                    customTitle: slide.customTitle,
                    customDesc: slide.customDesc,
                })) }, rest));
            return createdAndAttached;
        });
    }
    //*** */
    bulkSlideOperations(lang, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const valid = this.validator.validateBulkSlideOperations(data);
            if (!valid) {
                throw new services_error_1.ServiceError("Invalid data for bulk slide operations", 400, "INVALID_BULK_OPERATIONS_DATA");
            }
            const result = yield this.repository.bulkSlideOperations(lang, valid);
            return {
                success: true,
                message: "Bulk operations completed successfully",
                data: {
                    slideShow: result.slideShow,
                    summary: {
                        created: result.created.length,
                        updated: result.updated.length,
                        deleted: result.deleted.length,
                        reordered: result.reordered.length,
                    },
                    details: result,
                },
            };
        });
    }
    updateAndAttachMany(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const valid = this.validator.validUpdateAndAttachManySchema(data);
            if (!valid)
                throw new services_error_1.ServiceError("Invalid data for update and attach many", 400, "SLIDESHOW_UPDATE_ATTACH_MANY_ERROR");
            const { slides, delete: delArr, update } = valid, rest = __rest(valid, ["slides", "delete", "update"]);
            const updatedAndAttached = yield this.repository.updateAndAttachMany(Object.assign(Object.assign({}, rest), { slides, delete: delArr, update }));
            return updatedAndAttached;
        });
    }
    // ***
    getSlidesInSlideShow(_a) {
        return __awaiter(this, arguments, void 0, function* ({ id, page, pagesPerType, perPage, }) {
            var _b;
            const validId = this.validator.validateId(id);
            const slideShow = yield this.repository.findById(validId);
            const type = ((_b = slideShow.slideShow) === null || _b === void 0 ? void 0 : _b.type) || client_1.SlideshowType.CUSTOM;
            const redis = yield (0, redis_1.getRedisClient)();
            const key = (0, keys_1.slideShowsSlidesKey)(`slideshow:${validId}:${type}`);
            const field = `page:${page}:per:${perPage}`;
            const start = performance.now();
            const cached = yield redis.hGet(key, field);
            if (cached) {
                const duration = performance.now() - start;
                console.log(`[SlideShow] getSlidesPaged took redis ${duration.toFixed(2)} ms`);
                return JSON.parse(cached);
            }
            else {
                const slides = yield this.repository.getSlidesPaged(validId, {
                    page,
                    pagesPerType,
                    perPage,
                });
                yield redis.hSet(key, field, JSON.stringify(slides));
                yield redis.expire(key, 900);
                const duration = performance.now() - start;
                console.log(`[SlideShow] getSlidesPaged took ${duration.toFixed(2)} ms`);
                return slides;
            }
        });
    }
    // ***XXXXXXXXXXX
    getSlideShowWithSlides(_a) {
        return __awaiter(this, arguments, void 0, function* ({ skip, take, page, pagesPerType, perPage, }) {
            // const { skip, take } = this.validator.validatePagination(params);
            const slides = yield this.repository.getSlideShowsWithSlidesPaged({
                skip,
                take,
            }, {
                page,
                pagesPerType,
                perPage,
            });
            return slides;
        });
    }
    // ***
    attachMany(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const valid = this.validator.validateBulkAttach(data);
            const updatedService = yield this.repository.attachMany({
                attachobj: valid.items,
                slideShowId: valid.slideShowId,
            });
            return updatedService;
        });
    }
    deattchMany(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const valid = this.validator.validateBulkDeattach(data);
            const updatedService = yield this.repository.DeattachMany({
                items: valid.items,
                slideShowId: valid.slideShowId,
            });
            return updatedService;
        });
    }
    getAttachedsGrouped(_a) {
        return __awaiter(this, arguments, void 0, function* ({ skip, take, slideShowId, }) {
            try {
                const validatePagination = this.validator.validatePagination({
                    skip,
                    take,
                });
                const validateId = this.validator.validateId(slideShowId);
                const [groups, allGroups] = yield Promise.all([
                    yield this.repository.getAttachedsGrouped(Object.assign({ slideShowId: validateId }, validatePagination)),
                    yield this.repository.getALlGroup(validateId),
                ]);
                const totalItems = allGroups.length;
                const remainingItems = totalItems - (skip * take + groups.length);
                return {
                    data: groups,
                    pagination: {
                        totalItems,
                        remainingItems,
                        nowCount: groups.length,
                        totalPages: Math.ceil(totalItems / take),
                        currentPage: skip + 1,
                        pageSize: take,
                    },
                };
            }
            catch (error) {
                console.error(error);
                throw new services_error_1.ServiceError("error get slide shows", 400, "SLIDESHOWS_GET_ERROR");
            }
        });
    }
    getSlideshowsByType(_a) {
        return __awaiter(this, arguments, void 0, function* ({ skip, take, type, }) {
            try {
                const validatePagination = this.validator.validatePagination({
                    skip,
                    take,
                });
                const validateType = this.validator.validateType({ type });
                // const validateId = this.validator.validateId(slideShowId);
                const [attaches, count] = yield Promise.all([
                    yield this.repository.getslideShowByType(Object.assign(Object.assign({}, validatePagination), { type: validateType })),
                    yield this.repository.getSlideShowByTypeCount(validateType),
                ]);
                const totalItems = count;
                const remainingItems = totalItems - (skip * take + attaches.length);
                return {
                    data: attaches,
                    pagination: {
                        totalItems,
                        remainingItems,
                        nowCount: attaches.length,
                        totalPages: Math.ceil(totalItems / take),
                        currentPage: skip + 1,
                        pageSize: take,
                    },
                };
            }
            catch (error) {
                console.error(error);
                throw new services_error_1.ServiceError("error get slide shows", 400, "SLIDESHOWS_GET_ERROR");
            }
        });
    }
    getAttachesByType(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { slideShowId, skip, take, type } = data;
                const validatePagination = this.validator.validatePagination({
                    skip,
                    take,
                });
                const validateType = this.validator.validateModelNaming({ type });
                const validateId = this.validator.validateId(slideShowId);
                const [attaches, count] = yield Promise.all([
                    yield this.repository.getAttachesByType(Object.assign(Object.assign({}, validatePagination), { type: validateType, slideShowId: validateId })),
                    yield this.repository.getAttachesByTypeCount({
                        slideShowId,
                        type: validateType,
                    }),
                ]);
                const totalItems = +count;
                const remainingItems = totalItems - (skip * take + attaches.length);
                return {
                    data: attaches,
                    pagination: {
                        totalItems,
                        remainingItems,
                        nowCount: attaches.length,
                        totalPages: Math.ceil(totalItems / take),
                        currentPage: +skip + 1,
                        pageSize: +take,
                    },
                };
            }
            catch (error) {
                console.error(error);
                throw new services_error_1.ServiceError("error get slide shows", 400, "SLIDESHOWS_GET_ERROR");
            }
        });
    }
    reorderBulkSlideShow(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const valid = this.validator.validateBulkReorder(data);
            const updatedService = yield this.repository.reorderBulkSlideShow({
                slideShowOrder: valid,
            });
            return updatedService;
        });
    }
}
exports.slideShowLogic = slideShowLogic;
