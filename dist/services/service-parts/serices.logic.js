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
exports.ServicesLogic = void 0;
const slugify_1 = __importDefault(require("slugify"));
const crypto_1 = require("crypto");
const services_error_1 = require("../../errors/services.error");
class ServicesLogic {
    constructor(repository, validator) {
        this.repository = repository;
        this.validator = validator;
    }
    isValidOrder(_a) {
        return __awaiter(this, arguments, void 0, function* ({ order }) {
            const isValid = yield this.repository.isValidOrder({
                order,
            });
            return isValid;
        });
    }
    getAllServices(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const skip = params.skip || 0;
            const take = params.take || 10;
            const [services, totalItems] = yield Promise.all([
                this.repository.findMany(skip, take),
                this.repository.count(),
            ]);
            const remainingItems = totalItems - (skip * take + services.length);
            return {
                data: services,
                pagination: {
                    totalItems,
                    remainingItems,
                    nowCount: services.length,
                    totalPages: Math.ceil(totalItems / take),
                    currentPage: skip + 1,
                    pageSize: take,
                },
            };
        });
    }
    getServiceById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log({
                id,
            });
            this.validator.validateId(id);
            const service = yield this.repository.findById(id);
            if (!service) {
                throw new services_error_1.ServiceNotFoundError(id);
            }
            const { image } = service, rest = __rest(service, ["image"]);
            return {
                Image: image,
                service: rest,
            };
        });
    }
    getServiceBySlug(slug) {
        return __awaiter(this, void 0, void 0, function* () {
            this.validator.validateSlug(slug);
            const service = yield this.repository.findBySlug(slug);
            if (!service) {
                throw new services_error_1.ServiceError(`service with slug not found ${slug} `, 404, "SERVICE_NOT_FOUND");
            }
            return service;
        });
    }
    createService(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const valid = this.validator.validateCreate(data);
            const slug = (0, slugify_1.default)(data.name + (0, crypto_1.randomUUID)().substring(0, 8), {
                lower: true,
            });
            const serices = yield this.repository.create(Object.assign(Object.assign({}, valid), { slug: slug }));
            if (!serices)
                throw new Error("error create services");
            return serices;
        });
    }
    deleteService(serviceId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!serviceId)
                    throw new Error("id is required");
                this.validator.validateId(serviceId);
                const deletedService = yield this.repository.delete(serviceId);
                if (!deletedService)
                    throw new Error("error deleting service");
                return deletedService;
            }
            catch (error) {
                console.log(error);
                throw new Error("Error deleting service");
            }
        });
    }
    Search(q) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!q)
                throw new services_error_1.ServiceError("search query is required", 400, "SEARCH_QUERY_REQUIRED");
            const services = yield this.repository.SearchService(q, 0, 10);
            if (!services)
                throw new services_error_1.ServiceError("error searching services", 400, "ERROR_SEARCHING_SERVICES");
            return services;
        });
    }
    updateService(data) {
        return __awaiter(this, void 0, void 0, function* () {
            this.validator.validateUpdate(data);
            const updatedService = yield this.repository.update(data);
            if (!updatedService)
                throw new services_error_1.ServiceError("error updating service", 400, "ERROR_UPDATING_SERVICE");
            const { Image } = updatedService, rest = __rest(updatedService, ["Image"]);
            return Object.assign({ Image }, rest);
        });
    }
}
exports.ServicesLogic = ServicesLogic;
