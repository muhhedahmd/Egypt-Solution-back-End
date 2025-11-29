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
exports.TestimonialController = void 0;
const testimonal_error_1 = require("../errors/testimonal.error");
class TestimonialController {
    constructor(testimonialLogic) {
        this.testimonialLogic = testimonialLogic;
    }
    getAllTestimonials(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { skip, take } = req.query;
                const testimonials = yield this.testimonialLogic.getAllTestimonials({
                    skip: Number(skip) || 0,
                    take: Number(take) || 10,
                });
                if (!testimonials)
                    throw new testimonal_error_1.TestimonialNotFoundError('error get testimonials');
                return res.json(Object.assign(Object.assign({}, testimonials), { message: 'testimonials fetched successfully' }));
            }
            catch (error) {
                next(error);
            }
        });
    }
    getTestimonialById(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                if (!id)
                    throw new testimonal_error_1.TestimonialNotFoundError('id is required');
                const testimonial = yield this.testimonialLogic.getTestimonialById(id);
                return res.json({
                    data: testimonial,
                    message: 'testimonial fetched successfully',
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    isValidOrder(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { order } = req.query;
                if (typeof Number(order) !== 'number' || isNaN(Number(order)))
                    throw new testimonal_error_1.TestimonialNotFoundError('order is not valid');
                const isValidOrder = yield this.testimonialLogic.isValidOrder({
                    order: Number(order),
                });
                return res.json({
                    data: {
                        isValid: isValidOrder.isValid,
                        takenBy: isValidOrder.takenby,
                    },
                    message: 'checked order successfully',
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    createTestimonial(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                const data = req.body;
                console.log(Object.assign(Object.assign({}, data), { isActive: data.isActive === 'true' ? true : false, isFeatured: data.isFeatured === 'true' ? true : false, rating: Number(data.rating) || 5, order: Number(data.order) || 0, avatar: Array.isArray(req.files) && req.files.length > 0
                        ? (_a = req.files.find((f) => f.fieldname === 'avatar')) === null || _a === void 0 ? void 0 : _a.buffer
                        : null }));
                const newTestimonial = yield this.testimonialLogic.createTestimonial(Object.assign(Object.assign({}, data), { isActive: data.isActive === 'true' ? true : false, isFeatured: data.isFeatured === 'true' ? true : false, rating: Number(data.rating) || 5, order: Number(data.order) || 0, avatar: Array.isArray(req.files) && req.files.length > 0
                        ? (_b = req.files.find((f) => f.fieldname === 'avatar')) === null || _b === void 0 ? void 0 : _b.buffer
                        : null }));
                return res.status(201).json({
                    data: newTestimonial,
                    message: 'testimonial created successfully',
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    updateTestimonial(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { id } = req.params;
                const testimonialData = req.body;
                const files = req.files;
                const data = Object.assign(Object.assign({}, testimonialData), { testimonialId: id, avatar: Array.isArray(files) && files.length > 0
                        ? (_a = files.find((f) => f.fieldname === 'avatar')) === null || _a === void 0 ? void 0 : _a.buffer
                        : undefined, avatarState: testimonialData === null || testimonialData === void 0 ? void 0 : testimonialData.avatarState });
                const updatedTestimonial = yield this.testimonialLogic.updateTestimonial(Object.assign(Object.assign({}, data), { isActive: data.isActive === 'true' ? true : data.isActive === 'false' ? false : undefined, isFeatured: data.isFeatured === 'true' ? true : data.isFeatured === 'false' ? false : undefined, rating: data.rating ? Number(data.rating) : undefined, order: data.order ? Number(data.order) : undefined }));
                return res.json({
                    data: updatedTestimonial,
                    message: 'testimonial updated successfully',
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    deleteTestimonial(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                if (!id)
                    throw new testimonal_error_1.TestimonialNotFoundError('id is required');
                const deletedTestimonial = yield this.testimonialLogic.deleteTestimonial(id);
                if (!deletedTestimonial)
                    throw new testimonal_error_1.TestimonialNotFoundError('error deleting testimonial');
                return res.json({
                    data: deletedTestimonial,
                    message: 'testimonial deleted successfully',
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    SearchTestimonials(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { q } = req.query;
                if (!q || typeof q !== 'string')
                    throw new testimonal_error_1.TestimonialError('search query is required', 400, 'SEARCH_QUERY_REQUIRED');
                const testimonials = yield this.testimonialLogic.Search(q);
                if (!testimonials)
                    throw new testimonal_error_1.TestimonialNotFoundError('error searching testimonials');
                return res.json({
                    data: testimonials,
                    message: 'testimonials searched successfully',
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
}
exports.TestimonialController = TestimonialController;
