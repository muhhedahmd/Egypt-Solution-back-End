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
exports.ContactLogic = void 0;
const contact_error_1 = require("../../errors/contact.error");
class ContactLogic {
    buildPagination(totalItems, nowCount, skip, take) {
        return {
            totalItems,
            remainingItems: Math.max(0, totalItems - (skip * take + nowCount)),
            nowCount,
            totalPages: Math.ceil(totalItems / take),
            currentPage: skip + 1,
            pageSize: take,
        };
    }
    constructor(ContactRepostery, ContactValidator) {
        this.ContactRepostery = ContactRepostery;
        this.ContactValidator = ContactValidator;
    }
    getPagnittedMany(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const { skip, take } = this.ContactValidator.paginationParamsValidation(params);
            const [totalItems, contacts] = yield Promise.all([
                yield this.ContactRepostery.count(),
                yield this.ContactRepostery.findMany(skip, take),
            ]);
            if (!contacts)
                throw new Error("Error finding contacts");
            return {
                data: contacts,
                pagination: {
                    totalItems,
                    remainingItems: totalItems - (skip * take + contacts.length),
                    nowCount: contacts.length,
                    totalPages: Math.ceil(totalItems / take),
                    currentPage: skip + 1,
                    pageSize: take,
                },
            };
        });
    }
    create(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const validatedData = this.ContactValidator.createContactValidation(data);
            console.log("validatedData", validatedData);
            const newContact = yield this.ContactRepostery.create(Object.assign({}, validatedData));
            return newContact;
        });
    }
    getStats() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this.ContactRepostery.statics();
            }
            catch (error) {
                console.error("Error fetching stats:", error);
                throw new contact_error_1.ContactError("Error fetching stats");
            }
        });
    }
    filter(params) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { type, skip, take } = params, filterValues = __rest(params, ["type", "skip", "take"]);
                const whereClause = this.ContactRepostery.buildWhereClause(type, filterValues);
                const { contacts, totalItems } = yield this.ContactRepostery.findManyWithCount(whereClause, skip, take);
                return {
                    data: contacts,
                    pagination: this.buildPagination(totalItems, contacts.length, skip, take),
                };
            }
            catch (error) {
                if (error instanceof contact_error_1.ContactError)
                    throw error;
                console.error("Error filtering contacts:", error);
                throw new contact_error_1.ContactError("Error filtering contacts");
            }
        });
    }
    multiFilter(filters, skip, take) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // this.ContactValidator.multiFilterValidation({ ...filters, skip, take });
                const whereConditions = [];
                Object.entries(filters).forEach(([key, value]) => {
                    if (value !== undefined && value !== null && value !== "") {
                        const filterType = key;
                        switch (filterType) {
                            case "email":
                            case "name":
                            case "phone":
                            case "company":
                            case "subject":
                            case "message":
                            case "budget":
                            case "timeline":
                                whereConditions.push({
                                    [filterType]: {
                                        contains: value,
                                        mode: "insensitive",
                                    },
                                });
                                break;
                            case "category":
                            case "status":
                            case "priority":
                                whereConditions.push({
                                    [filterType]: {
                                        equals: value,
                                    },
                                });
                                break;
                            case "dateRange":
                                if (value.startDate || value.endDate) {
                                    const dateFilter = {};
                                    if (value.startDate)
                                        dateFilter.gte = new Date(value.startDate);
                                    if (value.endDate)
                                        dateFilter.lte = new Date(value.endDate);
                                    whereConditions.push({
                                        createdAt: dateFilter,
                                    });
                                }
                                break;
                        }
                    }
                });
                const whereClause = {
                    AND: whereConditions.length > 0 ? whereConditions : undefined,
                };
                const { contacts, totalItems } = yield this.ContactRepostery.findManyWithCount(whereClause, skip, take);
                return {
                    data: contacts,
                    pagination: this.buildPagination(totalItems, contacts.length, skip, take),
                };
            }
            catch (error) {
                console.error("Error in multi-filter:", error);
                throw new contact_error_1.ContactError("Error filtering contacts");
            }
        });
    }
    searchContacts(searchQuery, skip, take) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const whereClause = {
                    OR: [
                        { name: { contains: searchQuery, mode: "insensitive" } },
                        { email: { contains: searchQuery, mode: "insensitive" } },
                        { company: { contains: searchQuery, mode: "insensitive" } },
                        { subject: { contains: searchQuery, mode: "insensitive" } },
                        { message: { contains: searchQuery, mode: "insensitive" } },
                    ],
                };
                const { contacts, totalItems } = yield this.ContactRepostery.findManyWithCount(whereClause, skip, take);
                return {
                    data: contacts,
                    pagination: this.buildPagination(totalItems, contacts.length, skip, take),
                };
            }
            catch (error) {
                console.error("Error searching contacts:", error);
                if (error instanceof contact_error_1.ContactError)
                    throw error;
                throw new contact_error_1.ContactError("Error searching contacts");
            }
        });
    }
    getById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const contact = yield this.ContactRepostery.findById(id);
                if (!contact) {
                    throw new contact_error_1.ContactNotFoundError('Contact not found');
                }
                return contact;
            }
            catch (error) {
                if (error instanceof contact_error_1.ContactError)
                    throw error;
                throw new contact_error_1.ContactError('Error fetching contact');
            }
        });
    }
    update(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const validatedData = this.ContactValidator.updateContactValidation(data);
            const updatedContact = yield this.ContactRepostery.update(id, validatedData);
            return updatedContact;
        });
    }
    replay(_a) {
        return __awaiter(this, arguments, void 0, function* ({ id, response, subject, message }) {
            const replay = this.ContactRepostery.replayEmail(id, response, subject, message);
            return replay;
        });
    }
}
exports.ContactLogic = ContactLogic;
