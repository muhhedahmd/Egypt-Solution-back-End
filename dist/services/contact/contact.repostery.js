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
exports.ContactRepostery = void 0;
const contact_error_1 = require("../../errors/contact.error");
const resend_1 = require("resend");
class ContactRepostery {
    // private prisma: PrismaClientConfig
    buildWhereClause(type, filterValues) {
        const filterMap = {
            email: () => ({
                email: {
                    contains: filterValues.email || "",
                    mode: "insensitive",
                },
            }),
            name: () => ({
                name: {
                    contains: filterValues.name || "",
                    mode: "insensitive",
                },
            }),
            phone: () => ({
                phone: {
                    contains: filterValues.phone || "",
                    mode: "insensitive",
                },
            }),
            company: () => ({
                company: {
                    contains: filterValues.company || "",
                    mode: "insensitive",
                },
            }),
            subject: () => ({
                subject: {
                    contains: filterValues.subject || "",
                    mode: "insensitive",
                },
            }),
            message: () => ({
                message: {
                    contains: filterValues.message || "",
                    mode: "insensitive",
                },
            }),
            category: filterValues.category
                ? () => ({
                    category: filterValues.category,
                })
                : () => ({}),
            status: filterValues.status
                ? () => ({
                    status: {
                        equals: filterValues.status,
                    },
                })
                : () => ({}),
            priority: filterValues.priority
                ? () => ({
                    priority: filterValues.priority,
                })
                : () => ({}),
            budget: () => ({
                budget: {
                    contains: filterValues.budget || "",
                    mode: "insensitive",
                },
            }),
            timeline: () => ({
                timeline: {
                    contains: filterValues.timeline || "",
                    mode: "insensitive",
                },
            }),
            dateRange: () => {
                const dateFilter = {};
                if (filterValues.startDate) {
                    dateFilter.gte = new Date(filterValues.startDate);
                }
                if (filterValues.endDate) {
                    dateFilter.lte = new Date(filterValues.endDate);
                }
                return {
                    createdAt: dateFilter,
                };
            },
        };
        const buildFilter = filterMap[type];
        if (!buildFilter) {
            throw new contact_error_1.ContactError(`Invalid filter type: ${type}`);
        }
        return buildFilter();
    }
    constructor(prisma) {
        this.prisma = prisma;
    }
    count() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const count = yield this.prisma.contact.count();
                return count;
            }
            catch (error) {
                console.log(error);
                throw new Error("Error counting contacts");
            }
        });
    }
    findMany(skip, take) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const contacts = yield this.prisma.contact.findMany({
                    skip: skip * take,
                    take,
                });
                return contacts;
            }
            catch (error) {
                console.log(error);
                throw new contact_error_1.ContactError("Error finding contacts");
            }
        });
    }
    create(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const contact = yield this.prisma.contact.create({
                    data: Object.assign({}, data),
                });
                return contact;
            }
            catch (error) {
                console.log(error);
                throw new contact_error_1.ContactError("Error creating contact");
            }
        });
    }
    statics() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const total = yield this.prisma.contact.count();
                const resolved = yield this.prisma.contact.count({
                    where: {
                        OR: [
                            { status: "RESOLVED" },
                            {
                                resolved: true,
                            },
                        ],
                    },
                });
                const urgent = yield this.prisma.contact.count({
                    where: {
                        priority: "URGENT",
                    },
                });
                const pending = total - resolved;
                return {
                    total,
                    resolved,
                    pending,
                    urgent,
                    resolvedPercentage: total ? ((resolved / total) * 100).toFixed(2) : 0,
                    pendingPercentage: total ? ((pending / total) * 100).toFixed(2) : 0,
                    urgentPercentage: total ? ((urgent / total) * 100).toFixed(2) : 0,
                    resolutionRate: pending ? ((resolved / pending) * 100).toFixed(2) : 0,
                };
            }
            catch (error) {
                console.log(error);
                throw new contact_error_1.ContactError("Error getting contact statistics");
            }
        });
    }
    filter(params) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { type, skip, take } = params, filterValues = __rest(params, ["type", "skip", "take"]);
                const whereClause = this.buildWhereClause(type, filterValues);
                const [totalItems, contacts] = yield Promise.all([
                    this.prisma.contact.count({ where: whereClause }),
                    this.prisma.contact.findMany({
                        where: whereClause,
                        skip: skip * take,
                        take,
                        orderBy: { createdAt: "desc" },
                    }),
                ]);
                return {
                    data: contacts,
                    pagination: {
                        totalItems,
                        remainingItems: Math.max(0, totalItems - (skip * take + contacts.length)),
                        nowCount: contacts.length,
                        totalPages: Math.ceil(totalItems / take),
                        currentPage: skip + 1,
                        pageSize: take,
                    },
                };
            }
            catch (error) {
                console.error("Error filtering contacts:", error);
                throw new contact_error_1.ContactError("Error filtering contacts");
            }
        });
    }
    multiFilter(filters, skip, take) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
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
                    AND: whereConditions,
                };
                const [totalItems, contacts] = yield Promise.all([
                    this.prisma.contact.count({ where: whereClause }),
                    this.prisma.contact.findMany({
                        where: whereClause,
                        skip: skip * take,
                        take,
                        orderBy: { createdAt: "desc" },
                    }),
                ]);
                return {
                    data: contacts,
                    pagination: {
                        totalItems,
                        remainingItems: Math.max(0, totalItems - (skip * take + contacts.length)),
                        nowCount: contacts.length,
                        totalPages: Math.ceil(totalItems / take),
                        currentPage: skip + 1,
                        pageSize: take,
                    },
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
                const [totalItems, contacts] = yield Promise.all([
                    this.prisma.contact.count({ where: whereClause }),
                    this.prisma.contact.findMany({
                        where: whereClause,
                        skip: skip * take,
                        take,
                        orderBy: { createdAt: "desc" },
                    }),
                ]);
                return {
                    data: contacts,
                    pagination: {
                        totalItems,
                        remainingItems: Math.max(0, totalItems - (skip * take + contacts.length)),
                        nowCount: contacts.length,
                        totalPages: Math.ceil(totalItems / take),
                        currentPage: skip + 1,
                        pageSize: take,
                    },
                };
            }
            catch (error) {
                console.error("Error searching contacts:", error);
                throw new contact_error_1.ContactError("Error searching contacts");
            }
        });
    }
    getContactsByStatus(status, skip, take) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.filter({
                type: "status",
                status,
                skip,
                take,
            });
        });
    }
    getContactsByPriority(priority, skip, take) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.filter({
                type: "priority",
                priority,
                skip,
                take,
            });
        });
    }
    getContactsByCategory(category, skip, take) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.filter({
                type: "category",
                category,
                skip,
                take,
            });
        });
    }
    getContactsByDateRange(startDate, endDate, skip, take) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.filter({
                type: "dateRange",
                startDate,
                endDate,
                skip,
                take,
            });
        });
    }
    replayEmail(id, response, respondedBy, subject, message) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!response)
                    throw new contact_error_1.ContactError("Response content is required for replaying email");
                if (!id)
                    throw new contact_error_1.ContactError("Contact ID is required for replaying email");
                const resend = new resend_1.Resend(process.env.RESEND_API_KEY || "");
                const FormalEmail = yield this.prisma.companyInfo.findFirst();
                if (!FormalEmail || !FormalEmail.email) {
                    throw new contact_error_1.ContactError("Formal email not configured");
                }
                const contact = yield this.prisma.contact.findUnique({ where: { id } });
                if (!contact)
                    throw new Error("Contact not found");
                const { data, error } = yield resend.emails.send({
                    from: `Your Company <${FormalEmail === null || FormalEmail === void 0 ? void 0 : FormalEmail.email}>`,
                    to: contact.email,
                    subject: `Re: ${contact.subject}`,
                    html: `
        <h2>Re: ${contact.subject}</h2>
        <p>Dear ${contact.name},</p>
        <p>${response.replace(/\n/g, "<br>")}</p>
        <p>Best regards,<br>${respondedBy || "Support Team"}</p>
        <hr>
        <p><strong>Original Message:</strong></p>
        <p>${contact.message.replace(/\n/g, "<br>")}</p>
      `,
                });
                if (error)
                    throw new contact_error_1.ContactError("Error replaying email to contact");
                yield this.prisma.contact.update({
                    where: { id },
                    data: {
                        response,
                        respondedBy,
                        respondedAt: new Date(),
                        status: "RESOLVED",
                    },
                });
                return { success: true, data };
            }
            catch (error) {
                console.log(error);
                throw new contact_error_1.ContactError("Error replaying email to contact");
            }
        });
    }
    update(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const contact = yield this.prisma.contact.update({ where: { id }, data });
                return contact;
            }
            catch (error) {
                console.log(error);
                throw new contact_error_1.ContactUpdateError("Error updating contact");
            }
        });
    }
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const contact = yield this.prisma.contact.delete({ where: { id } });
                return contact;
            }
            catch (error) {
                console.log(error);
                throw new contact_error_1.ContactDeletionError("Error deleting contact");
            }
        });
    }
    findManyWithCount(whereClause, skip, take) {
        return __awaiter(this, void 0, void 0, function* () {
            const [totalItems, contacts] = yield Promise.all([
                this.prisma.contact.count({ where: whereClause }),
                this.prisma.contact.findMany({
                    where: whereClause,
                    skip: skip * take,
                    take,
                    orderBy: { createdAt: "desc" },
                }),
            ]);
            return { contacts, totalItems };
        });
    }
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.contact.findUnique({
                where: { id },
            });
        });
    }
}
exports.ContactRepostery = ContactRepostery;
