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
exports.ContactController = void 0;
const contact_error_1 = require("../errors/contact.error");
class ContactController {
    constructor(logic) {
        this.logic = logic;
    }
    cerateContact(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const body = req.body;
                const ipAddress = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
                const userAgent = req.headers["user-agent"];
                const newContact = yield this.logic.create(Object.assign(Object.assign({}, body), { ipAddress,
                    userAgent }));
                return res.status(201).json({
                    success: true,
                    message: "Contact created successfully",
                    data: newContact,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    getPagnittedContacts(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { skip, take } = req.query;
                const contacts = yield this.logic.getPagnittedMany({
                    skip: Number(skip) || 0,
                    take: Number(take) || 10,
                });
                return res.status(200).json(Object.assign({ success: true, message: "Contacts fetched successfully" }, contacts));
            }
            catch (error) {
                next(error);
            }
        });
    }
    getContactById(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const contact = yield this.logic.getById(id);
                return res.status(200).json({
                    success: true,
                    message: "Contact fetched successfully",
                    data: contact,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    searchContacts(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { skip, take, q } = req.query;
                if (typeof q !== "string") {
                    throw new contact_error_1.ContactError("Query parameter 'q' must be a string");
                }
                const contacts = yield this.logic.searchContacts(q, Number(skip) || 0, Number(take) || 10);
                return res.status(200).json(Object.assign({ success: true, message: "Contacts fetched successfully" }, contacts));
            }
            catch (error) {
                next(error);
            }
        });
    }
    getStats(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const stats = yield this.logic.getStats();
                return res.status(200).json({
                    success: true,
                    message: "Contact stats fetched successfully",
                    data: stats,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    multiFilter(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { skip = 0, take = 10 } = req.query;
                const filters = __rest(req.body, []);
                const filtersTyped = Object.entries(filters).reduce((acc, [key, value]) => {
                    acc[key] = value;
                    return acc;
                }, {});
                const result = yield this.logic.multiFilter(filtersTyped, Number(skip), Number(take));
                return res.status(200).json(Object.assign({ success: true }, result));
            }
            catch (error) {
                next(error);
            }
        });
    }
    //   async delete(req: Request, res: Response, next: NextFunction) {
    //   try {
    //     const { id } = req.params
    //     await this.logic.delete(id)
    //     return res.status(200).json({
    //       success: true,
    //       message: 'Contact deleted successfully',
    //     })
    //   } catch (error) {
    //     next(error)
    //     }
    // }
    update(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const body = req.body;
                const updatedContact = yield this.logic.update(id, body);
                return res.status(200).json({
                    success: true,
                    message: "Contact updated successfully",
                    data: updatedContact,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
    replay(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const { response, subject, message } = req.body;
                const replay = yield this.logic.replay({ id, response });
                return res.status(200).json({
                    success: true,
                    message: "Contact replayed successfully",
                    data: replay,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
}
exports.ContactController = ContactController;
