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
exports.TestimonialLogic = void 0;
const testimonal_error_1 = require("../../errors/testimonal.error");
class TestimonialLogic {
    constructor(repository, validator) {
        this.repository = repository;
        this.validator = validator;
    }
    isValidOrder(_a) {
        return __awaiter(this, arguments, void 0, function* ({ order }) {
            const isValid = yield this.repository.isValidOrder({ order });
            return isValid;
        });
    }
    getAllTestimonials(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const skip = params.skip || 0;
            const take = params.take || 10;
            const [testimonials, totalItems] = yield Promise.all([
                this.repository.findMany(skip, take),
                this.repository.count(),
            ]);
            const remainingItems = totalItems - (skip * take + testimonials.length);
            return {
                data: testimonials,
                pagination: {
                    totalItems,
                    remainingItems,
                    nowCount: testimonials.length,
                    totalPages: Math.ceil(totalItems / take),
                    currentPage: skip + 1,
                    pageSize: take,
                },
            };
        });
    }
    getTestimonialById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            this.validator.validateId(id);
            const testimonial = yield this.repository.findById(id);
            if (!testimonial) {
                throw new testimonal_error_1.TestimonialNotFoundError(id);
            }
            // const  = testimonial;
            return testimonial;
        });
    }
    createTestimonial(lang, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const valid = this.validator.validateCreate(data);
            const testimonial = yield this.repository.create(lang, valid);
            if (!testimonial)
                throw new Error("error create testimonial");
            return testimonial;
        });
    }
    deleteTestimonial(testimonialId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!testimonialId)
                    throw new Error("id is required");
                this.validator.validateId(testimonialId);
                const deletedTestimonial = yield this.repository.delete(testimonialId);
                if (!deletedTestimonial)
                    throw new Error("error deleting testimonial");
                return deletedTestimonial;
            }
            catch (error) {
                console.error(error);
                throw new Error("Error deleting testimonial");
            }
        });
    }
    Search(lang, q) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!q)
                throw new testimonal_error_1.TestimonialError("search query is required", 400, "SEARCH_QUERY_REQUIRED");
            const testimonials = yield this.repository.SearchTestimonial(lang, q, 0, 10);
            if (!testimonials)
                throw new testimonal_error_1.TestimonialError("error searching testimonials", 400, "ERROR_SEARCHING_TESTIMONIALS");
            return testimonials;
        });
    }
    updateTestimonial(lang, data) {
        return __awaiter(this, void 0, void 0, function* () {
            this.validator.validateUpdate(data);
            const updatedTestimonial = yield this.repository.update(lang, data);
            if (!updatedTestimonial)
                throw new testimonal_error_1.TestimonialError("error updating testimonial", 400, "ERROR_UPDATING_TESTIMONIAL");
            const { Avatar } = updatedTestimonial, rest = __rest(updatedTestimonial, ["Avatar"]);
            return Object.assign({ Avatar }, rest);
        });
    }
}
exports.TestimonialLogic = TestimonialLogic;
