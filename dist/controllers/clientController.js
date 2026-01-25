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
exports.ClientController = void 0;
const client_error_1 = require("../errors/client.error");
class ClientController {
    constructor(clientLogic) {
        this.clientLogic = clientLogic;
    }
    getAllClients(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { skip, take } = req.query;
                const clients = yield this.clientLogic.getAllClients({
                    skip: Number(skip) || 0,
                    take: Number(take) || 10,
                });
                if (!clients)
                    throw new client_error_1.ClientNotFoundError("error get clients");
                return res.json(Object.assign(Object.assign({}, clients), { message: "clients fetched successfully", success: true }));
            }
            catch (error) {
                next(error);
            }
        });
    }
    getClientById(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                if (!id)
                    throw new client_error_1.ClientNotFoundError("id is required");
                const client = yield this.clientLogic.getClientById(id);
                return res.json({
                    data: client,
                    message: "client fetched successfully",
                    success: true,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    getClientBySlug(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { slug } = req.params;
                const client = yield this.clientLogic.getClientBySlug(slug);
                return res.json({
                    data: client,
                    message: "client fetched successfully",
                    success: true,
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
                    throw new client_error_1.ClientNotFoundError("order is not valid");
                const isValidOrder = yield this.clientLogic.isValidOrder({
                    order: Number(order),
                });
                return res.json({
                    data: {
                        isValid: isValidOrder.isValid,
                        takenBy: isValidOrder.takenby,
                    },
                    message: "checked order successfully",
                    success: true,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    createClient(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                const data = req.body;
                const lang = req.lang || "EN";
                const newClient = yield this.clientLogic.createClient(lang, Object.assign(Object.assign({}, data), { isActive: data.isActive === "true" ? true : false, isFeatured: data.isFeatured === "true" ? true : false, order: Number(data.order) || 0, image: Array.isArray(req.files) && req.files.length > 0
                        ? (_a = req.files.find((f) => f.fieldname === "image")) === null || _a === void 0 ? void 0 : _a.buffer
                        : null, logo: Array.isArray(req.files) && req.files.length > 0
                        ? (_b = req.files.find((f) => f.fieldname === "logo")) === null || _b === void 0 ? void 0 : _b.buffer
                        : null }));
                return res.status(201).json({
                    data: newClient,
                    message: "client created successfully",
                    success: true,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    updateClient(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                const { id } = req.params;
                const clientData = req.body;
                const files = req.files;
                const lang = req.lang || "EN";
                const data = Object.assign(Object.assign({}, clientData), { clientId: id, image: Array.isArray(files) && files.length > 0
                        ? (_a = files.find((f) => f.fieldname === "image")) === null || _a === void 0 ? void 0 : _a.buffer
                        : undefined, logo: Array.isArray(files) && files.length > 0
                        ? (_b = files.find((f) => f.fieldname === "logo")) === null || _b === void 0 ? void 0 : _b.buffer
                        : undefined, imageState: clientData === null || clientData === void 0 ? void 0 : clientData.imageState, logoState: clientData === null || clientData === void 0 ? void 0 : clientData.logoState });
                const updatedClient = yield this.clientLogic.updateClient(lang, Object.assign(Object.assign({}, data), { isActive: data.isActive === "true"
                        ? true
                        : data.isActive === "false"
                            ? false
                            : undefined, isFeatured: data.isFeatured === "true"
                        ? true
                        : data.isFeatured === "false"
                            ? false
                            : undefined, order: data.order ? Number(data.order) : undefined }));
                return res.json({
                    data: updatedClient,
                    message: "client updated successfully",
                    success: true,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    deleteClient(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                if (!id)
                    throw new client_error_1.ClientNotFoundError("id is required");
                const deletedClient = yield this.clientLogic.deleteClient(id);
                if (!deletedClient)
                    throw new client_error_1.ClientNotFoundError("error deleting client");
                return res.json({
                    data: deletedClient,
                    message: "client deleted successfully",
                    success: true,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    SearchClients(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { q } = req.query;
                const lang = req.lang || "EN";
                if (!q || typeof q !== "string")
                    throw new client_error_1.ClientError("search query is required", 400, "SEARCH_QUERY_REQUIRED");
                const clients = yield this.clientLogic.Search(lang, q);
                if (!clients)
                    throw new client_error_1.ClientNotFoundError("error searching clients");
                return res.json({
                    data: clients,
                    message: "clients searched successfully",
                    success: true,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
}
exports.ClientController = ClientController;
