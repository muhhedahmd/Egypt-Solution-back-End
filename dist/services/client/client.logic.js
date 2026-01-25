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
exports.ClientLogic = void 0;
const slugify_1 = __importDefault(require("slugify"));
const crypto_1 = require("crypto");
const client_error_1 = require("../../errors/client.error");
class ClientLogic {
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
    getAllClients(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const skip = params.skip || 0;
            const take = params.take || 10;
            const [clients, totalItems] = yield Promise.all([
                this.repository.findMany(skip, take),
                this.repository.count(),
            ]);
            const remainingItems = totalItems - (skip * take + clients.length);
            return {
                data: clients,
                pagination: {
                    totalItems,
                    remainingItems,
                    nowCount: clients.length,
                    totalPages: Math.ceil(totalItems / take),
                    currentPage: skip + 1,
                    pageSize: take,
                },
            };
        });
    }
    getClientById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            this.validator.validateId(id);
            const client = yield this.repository.findById(id);
            if (!client) {
                throw new client_error_1.ClientNotFoundError(id);
            }
            return client;
        });
    }
    getClientBySlug(slug) {
        return __awaiter(this, void 0, void 0, function* () {
            this.validator.validateSlug(slug);
            const client = yield this.repository.findBySlug(slug);
            if (!client) {
                throw new client_error_1.ClientError(`client with slug not found ${slug}`, 404, 'CLIENT_NOT_FOUND');
            }
            return client;
        });
    }
    createClient(lang, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const valid = this.validator.validateCreate(data);
            const slug = (0, slugify_1.default)(data.name + (0, crypto_1.randomUUID)().substring(0, 8), {
                lower: true,
            });
            const client = yield this.repository.create(lang, Object.assign(Object.assign({}, valid), { slug: slug }));
            if (!client)
                throw new Error('error create client');
            return client;
        });
    }
    deleteClient(clientId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!clientId)
                    throw new Error('id is required');
                this.validator.validateId(clientId);
                const deletedClient = yield this.repository.delete(clientId);
                if (!deletedClient)
                    throw new Error('error deleting client');
                return deletedClient;
            }
            catch (error) {
                console.error(error);
                throw new Error('Error deleting client');
            }
        });
    }
    Search(lang, q) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!q)
                throw new client_error_1.ClientError('search query is required', 400, 'SEARCH_QUERY_REQUIRED');
            const clients = yield this.repository.SearchClient(lang, q, 0, 10);
            if (!clients)
                throw new client_error_1.ClientError('error searching clients', 400, 'ERROR_SEARCHING_CLIENTS');
            return clients;
        });
    }
    updateClient(lang, data) {
        return __awaiter(this, void 0, void 0, function* () {
            this.validator.validateUpdate(data);
            const updatedClient = yield this.repository.update(lang, data);
            if (!updatedClient)
                throw new client_error_1.ClientError('error updating client', 400, 'ERROR_UPDATING_CLIENT');
            const { Image, Logo } = updatedClient, rest = __rest(updatedClient, ["Image", "Logo"]);
            return Object.assign({ Image, Logo }, rest);
        });
    }
}
exports.ClientLogic = ClientLogic;
