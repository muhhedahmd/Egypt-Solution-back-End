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
exports.ServicesController = void 0;
const services_error_1 = require("../errors/services.error");
class ServicesController {
    constructor(servicesLogic) {
        this.servicesLogic = servicesLogic;
    }
    // Add methods to handle services-related operations here // pagniate
    getAllServices(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { skip, take, Active, isFeatured } = req.query;
                const services = yield this.servicesLogic.getAllServices({
                    skip: Number(skip) || 0,
                    take: Number(take) || 10,
                    Active: Active === "true" ? true : false,
                    isFeatured: isFeatured === "true" ? true : false
                });
                if (!services)
                    throw new services_error_1.ServiceNotFoundError("error get services");
                return res.json(Object.assign(Object.assign({}, services), { message: "services fetched successfully" }));
            }
            catch (error) {
                next(error);
            }
        });
    }
    getServiceById(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                if (!id)
                    throw new services_error_1.ServiceNotFoundError("id is required");
                const service = yield this.servicesLogic.getServiceById(id);
                return res.json({
                    data: service,
                    message: "service fetched successfully",
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    getServiceBySlug(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { slug } = req.params;
                const service = yield this.servicesLogic.getServiceBySlug(slug);
                return res.json({
                    data: service,
                    message: "service fetched successfully",
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
                if (typeof Number(order) !== "number" || isNaN(Number(order)))
                    throw new services_error_1.ServiceNotFoundError("order is not valid");
                const isValidOrder = yield this.servicesLogic.isValidOrder({
                    order: Number(order),
                });
                return res.json({
                    data: {
                        isValid: isValidOrder.isValid,
                        takenBy: isValidOrder.takenby,
                    },
                    message: "checked order successfully",
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    createService(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d;
            try {
                const data = req.body;
                // name
                // slug
                // description
                // richDescription
                // price
                // order
                // isActive
                // isFeatured
                // icon
                // image
                // iconImage
                console.log(Object.assign(Object.assign({}, data), { isActive: data.isActive === "true" ? true : false, isFeatured: data.isFeatured === "true" ? true : false, order: Number(data.order) || 0, icon: data.icon || "", 
                    // iconImage: req.files || "",
                    image: Array.isArray(req.files) && req.files.length > 0 ? (_a = req.files.find((f) => f.fieldname === "image")) === null || _a === void 0 ? void 0 : _a.buffer : null, iconImage: Array.isArray(req.files) && req.files.length > 0 ? (_b = req.files.find((f) => f.fieldname === "iconImage")) === null || _b === void 0 ? void 0 : _b.buffer : null }));
                const newService = yield this.servicesLogic.createService(Object.assign(Object.assign({}, data), { isActive: data.isActive === "true" ? true : false, isFeatured: data.isFeatured === "true" ? true : false, order: Number(data.order) || 0, icon: data.icon || "", image: Array.isArray(req.files) && req.files.length > 0 ? (_c = req.files.find((f) => f.fieldname === "image")) === null || _c === void 0 ? void 0 : _c.buffer : null, iconImage: Array.isArray(req.files) && req.files.length > 0 ? (_d = req.files.find((f) => f.fieldname === "iconImage")) === null || _d === void 0 ? void 0 : _d.buffer : null }));
                return res.status(201).json({
                    data: newService,
                    message: "service created successfully",
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    updateService(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { id } = req.params;
                const serviceData = req.body;
                const data = Object.assign(Object.assign({}, serviceData), { serviceId: id, image: Array.isArray(req.files) && req.files.length > 0
                        ? (_a = req === null || req === void 0 ? void 0 : req.files[0]) === null || _a === void 0 ? void 0 : _a.buffer
                        : undefined, imageState: serviceData === null || serviceData === void 0 ? void 0 : serviceData.imageState });
                const updatedService = yield this.servicesLogic.updateService(Object.assign(Object.assign({}, data), { isActive: data.isActive === "true" ? true : false, isFeatured: data.isFeatured === "true" ? true : false, order: Number(data.order) || 0, icon: data.icon || "" }));
                return res.json({
                    data: updatedService,
                    message: "service updated successfully",
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    deleteService(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                console.log("id3m[fom3[mf]] ", id);
                if (!id)
                    throw new services_error_1.ServiceNotFoundError("id is required");
                const deletedService = yield this.servicesLogic.deleteService(id);
                if (!deletedService)
                    throw new services_error_1.ServiceNotFoundError("error deleting service");
                return res.json({
                    data: deletedService,
                    message: "service deleted successfully",
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    SearchServices(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { q } = req.query;
                if (!q || typeof q !== "string")
                    throw new services_error_1.ServiceError("search query is required", 400, "SEARCH_QUERY_REQUIRED");
                console.log("q", q);
                const services = yield this.servicesLogic.Search(q);
                if (!services)
                    throw new services_error_1.ServiceNotFoundError("error searching services");
                return res.json({
                    data: services,
                    message: "services searched successfully",
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
}
exports.ServicesController = ServicesController;
