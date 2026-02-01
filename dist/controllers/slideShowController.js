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
exports.slideShowController = void 0;
const services_error_1 = require("../errors/services.error");
class slideShowController {
    constructor(logic) {
        this.logic = logic;
    }
    createSlideShow(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const body = req.body;
                const newSlideShow = yield this.logic.create(Object.assign(Object.assign({}, body), { isActive: body.isActive === "true" ? true : false, isFeatured: body.isFeatured === "true" ? true : false, order: Number(body.order) || 0, interval: Number(body.interval) || 5000, autoPlay: body.autoPlay === "true" ? true : false, icon: body.icon || "" }));
                return res.status(201).json({
                    success: true,
                    message: "Slideshow created successfully",
                    data: newSlideShow,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    getAllSlideShows(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { skip, take, visible } = req.query;
                const lang = req.lang || "EN";
                const slideShows = yield this.logic.getAllServices(lang, {
                    skip: Number(skip) || 0,
                    take: Number(take) || 10,
                }, visible === 'true' ? true : false);
                return res.status(200).json(Object.assign({ success: true, message: "Slideshows fetched successfully" }, slideShows));
            }
            catch (error) {
                next(error);
            }
        });
    }
    getAllSlideShowsMinmal(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // const skip = Number(page) - 1;
                // const take = Number(limit);
                const lang = req.lang || "EN";
                const slideShows = yield this.logic.getAllSlideShowsMinmal(lang);
                return res.status(200).json({
                    success: true,
                    message: "Slideshows fetched successfully",
                    data: slideShows,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    getSlideShowById(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const slideShow = yield this.logic.findById(id);
                if (!slideShow) {
                    return res.status(404).json({
                        success: false,
                        message: `Slideshow with ID ${id} not found`,
                    });
                }
                return res.status(200).json({
                    success: true,
                    message: "Slideshow fetched successfully",
                    data: slideShow,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    updateSlideShow(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const body = req.body;
                const id = req.params.id;
                const lang = req.lang || "EN";
                const updated = yield this.logic.update(lang, Object.assign(Object.assign({}, body), { slideShowId: id, isActive: body.isActive === "true" ? true : false, isFeatured: body.isFeatured === "true" ? true : false, order: Number(body.order) || 0, interval: Number(body.interval) || 5000, autoPlay: body.autoPlay === "true" ? true : false, icon: body.icon || "" }));
                return res.status(200).json({
                    success: true,
                    message: "Slideshow updated successfully",
                    data: updated,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    deleteSlideShow(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const deleted = yield this.logic.delete(id);
                return res.status(200).json({
                    success: true,
                    message: "Slideshow deleted successfully",
                    data: deleted,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    attachMany(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const body = req.body;
                const updated = yield this.logic.attachMany(body);
                return res.status(200).json({
                    success: true,
                    message: "Slideshow updated successfully",
                    data: updated,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    // ***
    CreateAndAttachMany(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const body = req.body;
                const lang = req.lang || "EN";
                const created = yield this.logic.createAndAttachMany(lang, body);
                return res.status(200).json({
                    success: true,
                    message: "Slideshow created and attached successfully",
                    data: created,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    // *** #
    bulkSlideOperations(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params; // slideShowId from URL
                const body = req.body;
                const lang = req.lang || "EN";
                const result = yield this.logic.bulkSlideOperations(lang, Object.assign({ slideShowId: id }, body));
                return res.status(200).json(result);
            }
            catch (error) {
                next(error);
            }
        });
    }
    UpdateAndAttachMany(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const body = req.body;
                const { id } = req.params;
                const lang = req.lang || "EN";
                if (!id)
                    throw new services_error_1.ServiceError("id is required", 400, "ID_NOT_FOUND");
                const updated = yield this.logic.updateAndAttachMany(Object.assign(Object.assign({}, body), { id }));
                return res.status(200).json({
                    success: true,
                    message: "Slideshow updated and attached successfully",
                    data: updated,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    getPaginatedSlides(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { page, perPage, pagesPerType } = req.body;
                const { id } = req.params;
                const lang = req.lang || "EN";
                const data = yield this.logic.getSlidesInSlideShow({
                    id,
                    page: Number(page) || 1,
                    pagesPerType: {
                        clients: pagesPerType &&
                            typeof pagesPerType === "object" &&
                            "clients" in pagesPerType
                            ? Number(pagesPerType["clients"])
                            : undefined,
                        projects: pagesPerType &&
                            typeof pagesPerType === "object" &&
                            "projects" in pagesPerType
                            ? Number(pagesPerType["projects"])
                            : undefined,
                        services: pagesPerType &&
                            typeof pagesPerType === "object" &&
                            "services" in pagesPerType
                            ? Number(pagesPerType["services"])
                            : undefined,
                        team: pagesPerType &&
                            typeof pagesPerType === "object" &&
                            "team" in pagesPerType
                            ? Number(pagesPerType["team"])
                            : undefined,
                        testimonials: pagesPerType &&
                            typeof pagesPerType === "object" &&
                            "testimonials" in pagesPerType
                            ? Number(pagesPerType["testimonials"])
                            : undefined,
                    },
                    perPage: perPage ? Number(perPage) : 10,
                });
                return res.status(200).json({
                    success: true,
                    message: "Slideshows fetched successfully",
                    data,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    getSlideShowWithSlides(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { skip, take } = req.params;
                const { page, perPage, pagesPerType } = req.body;
                const data = yield this.logic.getSlideShowWithSlides({
                    skip: Number(skip) || 0,
                    take: Number(take) || 10,
                    page: Number(page) || 1,
                    pagesPerType: {
                        clients: pagesPerType &&
                            typeof pagesPerType === "object" &&
                            "clients" in pagesPerType
                            ? Number(pagesPerType["clients"])
                            : undefined,
                        projects: pagesPerType &&
                            typeof pagesPerType === "object" &&
                            "projects" in pagesPerType
                            ? Number(pagesPerType["projects"])
                            : undefined,
                        services: pagesPerType &&
                            typeof pagesPerType === "object" &&
                            "services" in pagesPerType
                            ? Number(pagesPerType["services"])
                            : undefined,
                        team: pagesPerType &&
                            typeof pagesPerType === "object" &&
                            "team" in pagesPerType
                            ? Number(pagesPerType["team"])
                            : undefined,
                        testimonials: pagesPerType &&
                            typeof pagesPerType === "object" &&
                            "testimonials" in pagesPerType
                            ? Number(pagesPerType["testimonials"])
                            : undefined,
                    },
                    perPage: perPage ? Number(perPage) : 10,
                });
                return res.status(200).json({
                    success: true,
                    message: "Slideshows fetched successfully",
                    data,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    getAttachedsGrouped(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { skip, take } = req.query;
                const { id } = req.params;
                const data = yield this.logic.getAttachedsGrouped({
                    slideShowId: id,
                    skip: Number(skip) || 0,
                    take: Number(take) || 10,
                });
                return res.status(200).json(Object.assign({ success: true, message: "Slideshow type grouped successfully" }, data));
            }
            catch (error) {
                next(error);
            }
        });
    }
    getSlideShowsByType(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { skip, take } = req.query;
                const { type, } = req.body;
                const data = yield this.logic.getSlideshowsByType({
                    type,
                    skip: Number(skip) || 0,
                    take: Number(take) || 10,
                });
                return res.status(200).json(Object.assign({ success: true, message: "Slideshow type grouped successfully" }, data));
            }
            catch (error) {
                next(error);
            }
        });
    }
    getAttachesByType(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { skip, take } = req.query;
                const { type, } = req.body;
                const { id } = req.params;
                const data = yield this.logic.getAttachesByType({
                    skip,
                    take,
                    type,
                    slideShowId: id,
                });
                return res.status(200).json(Object.assign({ success: true, message: "Slideshow type attaches successfully" }, data));
            }
            catch (error) {
                next(error);
            }
        });
    }
    deAttachMany(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const body = req.body;
                const updated = yield this.logic.deattchMany(body);
                return res.status(200).json({
                    success: true,
                    message: "Slideshow deattached successfully",
                    data: updated,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    reorderBulkSlideShow(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const body = req.body;
                const updated = yield this.logic.reorderBulkSlideShow(body);
                return res.status(200).json({
                    success: true,
                    message: "Slideshow reordered successfully",
                    data: updated,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
}
exports.slideShowController = slideShowController;
