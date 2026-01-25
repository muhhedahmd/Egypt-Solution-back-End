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
exports.ServicesRepository = void 0;
const helpers_1 = require("../../lib/helpers");
const helpers_2 = require("../../lib/helpers");
const slugify_1 = __importDefault(require("slugify"));
const crypto_1 = require("crypto");
const services_error_1 = require("../../errors/services.error");
class ServicesRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    findMany() {
        return __awaiter(this, arguments, void 0, function* (lang = "EN", skip, take, Active, isFeatured) {
            const _Where = {};
            if (Active)
                _Where.isActive = true;
            if (Active && isFeatured) {
                _Where.isActive = true;
                _Where.isFeatured = true;
            }
            const find = yield this.prisma.service.findMany({
                where: _Where,
                select: {
                    id: true,
                    slug: true,
                    price: true,
                    isActive: true,
                    isFeatured: true,
                    createdAt: true,
                    updatedAt: true,
                    image: true,
                    serviceTranslation: {
                        where: {
                            lang,
                        },
                    },
                },
                skip: skip * take,
                take: take,
            });
            const fixedReturn = find.map((s) => {
                const { image, serviceTranslation, createdAt, id, isActive, isFeatured, price, slug, updatedAt, } = s;
                return Object.assign(Object.assign({ image }, serviceTranslation[0]), { createdAt,
                    id,
                    isActive,
                    isFeatured,
                    price,
                    slug,
                    updatedAt });
            });
            return fixedReturn;
        });
    }
    isValidOrder(_a) {
        return __awaiter(this, arguments, void 0, function* ({ order }) {
            console.log({ order });
            try {
                const find = yield this.prisma.service.findFirst({
                    where: { order },
                });
                return {
                    isValid: !find,
                    takenby: find,
                };
            }
            catch (error) {
                console.log(error);
                throw new Error("Error finding service by order");
            }
        });
    }
    count() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.service.count();
        });
    }
    findById() {
        return __awaiter(this, arguments, void 0, function* (lang = "EN", id) {
            try {
                const find = yield this.prisma.service.findUnique({
                    where: { id },
                    select: {
                        id: true,
                        slug: true,
                        price: true,
                        isActive: true,
                        isFeatured: true,
                        createdAt: true,
                        updatedAt: true,
                        image: true,
                        serviceTranslation: {
                            where: {
                                lang,
                            },
                        },
                    },
                });
                if (!find)
                    throw new Error("Error finding service by ID");
                const { image, serviceTranslation, createdAt, isActive, isFeatured, price, slug, updatedAt, } = find;
                return Object.assign(Object.assign({ image }, serviceTranslation[0]), { createdAt,
                    id,
                    isActive,
                    isFeatured,
                    price,
                    slug,
                    updatedAt });
            }
            catch (error) {
                console.log(error);
                throw new Error("Error finding service by ID");
            }
        });
    }
    findBySlug(slug) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const findedService = yield this.prisma.service.findUnique({
                    where: { slug },
                    include: {
                        image: true,
                        serviceTranslation: true,
                        projects: {
                            include: {
                                image: true,
                            },
                        },
                    },
                });
                if (!findedService) {
                    return null;
                }
                // const image = findedService?.image
                const { image, projects } = findedService, rest = __rest(findedService, ["image", "projects"]);
                return {
                    image: image || null,
                    projects: projects.map((project) => {
                        const { image: PImage } = project, pRest = __rest(project, ["image"]);
                        return {
                            project: pRest,
                            image: PImage || null,
                        };
                    }),
                    service: rest,
                };
            }
            catch (error) {
                console.error(error);
                throw new services_error_1.ServiceError("Error finding service", 400, "SERVICE_SEARCH_ERROR");
            }
        });
    }
    SearchService(searchTerm, skip, take) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const Services = yield this.prisma.service.findMany({
                    where: {
                        OR: [
                            {
                                name: {
                                    contains: searchTerm,
                                    mode: "insensitive",
                                },
                            },
                            {
                                description: {
                                    contains: searchTerm,
                                    mode: "insensitive",
                                },
                            },
                            {
                                richDescription: {
                                    contains: searchTerm,
                                    mode: "insensitive",
                                },
                            },
                            {
                                slug: {
                                    contains: searchTerm,
                                    mode: "insensitive",
                                },
                            },
                        ],
                    },
                    include: {
                        image: true,
                    },
                    skip: skip * take,
                    take,
                    orderBy: {
                        createdAt: "desc",
                    },
                });
                return Services;
            }
            catch (error) {
                console.error(error);
                throw new services_error_1.ServiceError("Error searching service", 400, "SERVICE_SEARCH_ERROR");
            }
        });
    }
    create(lang, data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const transication = yield this.prisma.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                    var _a, _b, _c;
                    const slug = (0, slugify_1.default)(data.name + (0, crypto_1.randomUUID)().substring(0, 8), {
                        lower: true,
                    });
                    if (!slug)
                        throw new Error("error create slug");
                    if (!data.image)
                        throw new Error("no image provided");
                    const createImage = yield (0, helpers_1.UploadImage)(data.image, data.name);
                    if (!createImage)
                        throw new Error("error upload image");
                    const imageToDB = yield (0, helpers_2.AssignImageToDBImage)({
                        imageType: "SERVICE",
                        blurhash: createImage.blurhash,
                        width: createImage.width,
                        height: createImage.height,
                        data: createImage.data,
                    }, tx);
                    if (!imageToDB)
                        throw new Error("error create imageToDB");
                    let iconUrl = data.icon;
                    if (!iconUrl && data.iconImage) {
                        const createIconImage = yield (0, helpers_1.UploadImageWithoutBlurHAsh)(data.iconImage, data.name + "icon");
                        if (createIconImage)
                            iconUrl = (_c = (_b = (_a = createIconImage.data) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.data) === null || _c === void 0 ? void 0 : _c.ufsUrl;
                    }
                    const service = yield tx.service.create({
                        data: {
                            slug: slug,
                            name: "",
                            imageId: imageToDB.id,
                            icon: iconUrl || "",
                            price: data.price || "",
                            isActive: data.isActive || false,
                            isFeatured: data.isFeatured || false,
                            order: data.order || 0,
                            serviceTranslation: {
                                create: {
                                    name: data.name,
                                    description: data.description,
                                    richDescription: data.richDescription,
                                    lang: lang,
                                },
                            },
                        },
                        select: {
                            id: true,
                            slug: true,
                            price: true,
                            isActive: true,
                            isFeatured: true,
                            createdAt: true,
                            updatedAt: true,
                            serviceTranslation: true,
                            image: true,
                        },
                    });
                    const { image, serviceTranslation } = service, rest = __rest(service, ["image", "serviceTranslation"]);
                    const translatedData = Object.assign(Object.assign({}, serviceTranslation[0]), { serviceId: service.id });
                    return { Image: image, service: Object.assign(Object.assign({}, rest), translatedData) };
                }), {
                    timeout: 20000,
                    maxWait: 5000,
                });
                return transication;
            }
            catch (error) {
                console.log(error);
            }
        });
    }
    update(lang, data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const transaction = yield this.prisma.$transaction((prismaTx) => __awaiter(this, void 0, void 0, function* () {
                    let NewImageId = null;
                    if (!data.serviceId)
                        throw new Error("no serviceId provided");
                    const service = yield prismaTx.service.findUnique({
                        where: { id: data.serviceId },
                    });
                    if (!service)
                        throw new Error("service not found");
                    console.log("update service in repo", data, service);
                    NewImageId = (service === null || service === void 0 ? void 0 : service.imageId) || null;
                    if (data.imageState === "REMOVE") {
                        if (service.imageId) {
                            yield prismaTx.service.update({
                                where: { id: data.serviceId },
                                data: { imageId: null },
                            });
                            yield (0, helpers_1.deleteImageById)(service.imageId, prismaTx);
                        }
                        NewImageId = null;
                    }
                    if (data.imageState === "UPDATE") {
                        if (service.imageId) {
                            yield prismaTx.service.update({
                                where: { id: data.serviceId },
                                data: { imageId: null },
                            });
                            yield (0, helpers_1.deleteImageById)(service.imageId, prismaTx);
                        }
                        if (!data.image)
                            throw new Error("no image provided");
                        const createImage = yield (0, helpers_1.UploadImage)(data.image, data.name || "update");
                        if (!createImage)
                            throw new Error("error upload image");
                        const imageToDB = yield (0, helpers_2.AssignImageToDBImage)({
                            imageType: "SERVICE",
                            blurhash: createImage.blurhash,
                            width: createImage.width,
                            height: createImage.height,
                            data: createImage.data,
                        }, prismaTx);
                        if (!imageToDB)
                            throw new Error("error create imageToDB");
                        NewImageId = imageToDB.id;
                    }
                    // Generate new slug if name changed
                    if (data.name && data.name !== service.name) {
                        const slug = (0, slugify_1.default)(data.name + (0, crypto_1.randomUUID)().substring(0, 8), {
                            lower: true,
                        });
                        data.slug = slug;
                    }
                    // console.log("Service ID:", data.serviceId, NewImageId);
                    // Update the service with new data
                    const updatedService = yield prismaTx.service.update({
                        where: { id: data.serviceId },
                        data: {
                            slug: data.slug || service.slug,
                            name: "",
                            imageId: NewImageId,
                            icon: data.icon || service.icon || "",
                            price: data.price || service.price || "",
                            isActive: data.isActive || service.isActive || false,
                            isFeatured: data.isFeatured || service.isFeatured || false,
                            order: data.order || service.order || 0,
                        },
                        select: {
                            id: true,
                            slug: true,
                            price: true,
                            isActive: true,
                            isFeatured: true,
                            createdAt: true,
                            updatedAt: true,
                            image: true,
                        },
                    });
                    // update translation
                    const updateTranslation = yield prismaTx.serviceTranslation.upsert({
                        where: {
                            serviceId_lang: {
                                lang,
                                serviceId: data.serviceId,
                            },
                        },
                        update: {
                            name: data.name || service.name || "",
                            description: data.description || service.description,
                            richDescription: data.richDescription || service.richDescription,
                        },
                        create: {
                            serviceId: data.serviceId,
                            name: data.name || service.name || "",
                            description: data.description || service.description,
                            richDescription: data.richDescription || service.richDescription,
                            lang,
                        },
                        // data: {
                        //   name: data.name || service.name,
                        //   description: data.description || service.description,
                        //   richDescription: data.richDescription || service.richDescription,
                        //   lang ,
                        // },
                        select: {
                            name: true,
                            description: true,
                            richDescription: true,
                        },
                    });
                    const { image } = updatedService, rest = __rest(updatedService, ["image"]);
                    return { Image: image, service: Object.assign(Object.assign({}, rest), updateTranslation) };
                }), {
                    timeout: 20000,
                    maxWait: 5000,
                });
                return transaction;
            }
            catch (error) {
                console.log(error);
                throw new Error("Error updating service");
            }
        });
    }
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const transaction = yield this.prisma.$transaction((prismaTx) => __awaiter(this, void 0, void 0, function* () {
                    const service = yield prismaTx.service.findUnique({ where: { id } });
                    if (!service)
                        throw new Error("service not found");
                    yield prismaTx.service.update({
                        where: { id },
                        data: { imageId: null },
                    });
                    if (service.imageId)
                        yield (0, helpers_1.deleteImageById)(service.imageId, prismaTx);
                    yield prismaTx.service.delete({ where: { id } });
                    return service;
                }), {
                    timeout: 20000, // (milliseconds)
                    maxWait: 5000, // default: 2000
                });
                return transaction;
            }
            catch (error) {
                console.log(error);
                throw new Error("Error deleting service");
            }
        });
    }
}
exports.ServicesRepository = ServicesRepository;
