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
exports.ClientRepository = void 0;
const slugify_1 = __importDefault(require("slugify"));
const crypto_1 = require("crypto");
const helpers_1 = require("../../lib/helpers");
const client_error_1 = require("../../errors/client.error");
class ClientRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    findMany(skip, take) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const clients = this.prisma.client.findMany({
                    include: {
                        image: true,
                        logo: true,
                    },
                    skip: skip * take,
                    take: take,
                    orderBy: {
                        order: "asc",
                    },
                });
                return (yield clients).map((client) => {
                    const { image, logo } = client, rest = __rest(client, ["image", "logo"]);
                    return {
                        client: rest,
                        image: image || null,
                        logo: logo || null,
                    };
                });
            }
            catch (error) {
                console.error(error);
                throw new client_error_1.ClientError("Error finding client", 400, "CLIENT_FIND_MANY_ERROR");
            }
        });
    }
    isValidOrder(_a) {
        return __awaiter(this, arguments, void 0, function* ({ order }) {
            try {
                const find = yield this.prisma.client.findFirst({
                    where: { order },
                });
                return {
                    isValid: !find,
                    takenby: find,
                };
            }
            catch (error) {
                console.error(error);
                throw new Error("Error finding client by order");
            }
        });
    }
    count() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.client.count();
        });
    }
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return this.prisma.client.findUnique({
                    where: { id },
                    include: {
                        image: true,
                        logo: true,
                    },
                });
            }
            catch (error) {
                console.error(error);
                throw new Error("Error finding client by ID");
            }
        });
    }
    findBySlug(slug) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const findedClient = yield this.prisma.client.findUnique({
                    where: { slug },
                    include: {
                        image: true,
                        logo: true,
                    },
                });
                if (!findedClient) {
                    return null;
                }
                const { image, logo } = findedClient, rest = __rest(findedClient, ["image", "logo"]);
                return {
                    image: image || null,
                    logo: logo || null,
                    client: rest,
                };
            }
            catch (error) {
                console.error(error);
                throw new client_error_1.ClientError("Error finding client", 400, "CLIENT_SEARCH_ERROR");
            }
        });
    }
    SearchClient(searchTerm, skip, take) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const clients = yield this.prisma.client.findMany({
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
                                industry: {
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
                        logo: true,
                    },
                    skip: skip * take,
                    take,
                    orderBy: {
                        createdAt: "desc",
                    },
                });
                return clients.map((client) => {
                    const { image, logo } = client, rest = __rest(client, ["image", "logo"]);
                    return {
                        client: rest,
                        image: image || null,
                        logo: logo || null,
                    };
                });
            }
            catch (error) {
                console.error(error);
                throw new client_error_1.ClientError("Error searching client", 400, "CLIENT_SEARCH_ERROR");
            }
        });
    }
    create(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const transaction = yield this.prisma.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                    const slug = (0, slugify_1.default)(data.name + (0, crypto_1.randomUUID)().substring(0, 8), {
                        lower: true,
                    });
                    if (!slug)
                        throw new Error("error create slug");
                    let imageId = null;
                    let logoId = null;
                    // Upload main image if provided
                    if (data.image) {
                        const createImage = yield (0, helpers_1.UploadImage)(data.image, data.name);
                        if (!createImage)
                            throw new Error("error upload image");
                        const imageToDB = yield (0, helpers_1.AssignImageToDBImage)({
                            imageType: "CLIENT",
                            blurhash: createImage.blurhash,
                            width: createImage.width,
                            height: createImage.height,
                            data: createImage.data,
                        }, tx);
                        if (!imageToDB)
                            throw new Error("error create imageToDB");
                        imageId = imageToDB.id;
                    }
                    // Upload logo if provided
                    if (data.logo) {
                        const createLogo = yield (0, helpers_1.UploadImage)(data.logo, data.name + "-logo");
                        if (!createLogo)
                            throw new Error("error upload logo");
                        const logoToDB = yield (0, helpers_1.AssignImageToDBImage)({
                            imageType: "CLIENT",
                            blurhash: createLogo.blurhash,
                            width: createLogo.width,
                            height: createLogo.height,
                            data: createLogo.data,
                        }, tx);
                        if (!logoToDB)
                            throw new Error("error create logoToDB");
                        logoId = logoToDB.id;
                    }
                    const client = yield tx.client.create({
                        data: {
                            slug: slug,
                            name: data.name,
                            description: data.description,
                            richDescription: data.richDescription,
                            website: data.website,
                            industry: data.industry,
                            imageId: imageId,
                            logoId: logoId,
                            isActive: data.isActive || false,
                            isFeatured: data.isFeatured || false,
                            order: data.order || 0,
                        },
                        include: {
                            image: true,
                            logo: true,
                        },
                    });
                    const { image, logo } = client, rest = __rest(client, ["image", "logo"]);
                    return { Image: image, Logo: logo, client: rest };
                }), {
                    timeout: 20000,
                    isolationLevel: "Serializable",
                    maxWait: 5000,
                });
                return transaction;
            }
            catch (error) {
                console.error(error);
                throw new Error("Error creating client");
            }
        });
    }
    update(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const transaction = yield this.prisma.$transaction((prismaTx) => __awaiter(this, void 0, void 0, function* () {
                    var _a, _b, _c;
                    let NewImageId = null;
                    let NewLogoId = null;
                    if (!data.clientId)
                        throw new Error("no clientId provided");
                    const client = yield prismaTx.client.findUnique({
                        where: { id: data.clientId },
                    });
                    if (!client)
                        throw new Error("client not found");
                    NewImageId = (client === null || client === void 0 ? void 0 : client.imageId) || null;
                    NewLogoId = (client === null || client === void 0 ? void 0 : client.logoId) || null;
                    // Handle image update/removal
                    if (data.imageState === "REMOVE") {
                        if (client.imageId) {
                            yield prismaTx.client.update({
                                where: { id: data.clientId },
                                data: { imageId: null },
                            });
                            yield (0, helpers_1.deleteImageById)(client.imageId, prismaTx);
                        }
                        NewImageId = null;
                    }
                    if (data.imageState === "UPDATE") {
                        if (client.imageId) {
                            yield prismaTx.client.update({
                                where: { id: data.clientId },
                                data: { imageId: null },
                            });
                            yield (0, helpers_1.deleteImageById)(client.imageId, prismaTx);
                        }
                        if (!data.image)
                            throw new Error("no image provided");
                        const createImage = yield (0, helpers_1.UploadImage)(data.image, data.name || "update");
                        if (!createImage)
                            throw new Error("error upload image");
                        const imageToDB = yield (0, helpers_1.AssignImageToDBImage)({
                            imageType: "CLIENT",
                            blurhash: createImage.blurhash,
                            width: createImage.width,
                            height: createImage.height,
                            data: createImage.data,
                        }, prismaTx);
                        if (!imageToDB)
                            throw new Error("error create imageToDB");
                        NewImageId = imageToDB.id;
                    }
                    // Handle logo update/removal
                    if (data.logoState === "REMOVE") {
                        if (client.logoId) {
                            yield prismaTx.client.update({
                                where: { id: data.clientId },
                                data: { logoId: null },
                            });
                            yield (0, helpers_1.deleteImageById)(client.logoId, prismaTx);
                        }
                        NewLogoId = null;
                    }
                    if (data.logoState === "UPDATE") {
                        if (client.logoId) {
                            yield prismaTx.client.update({
                                where: { id: data.clientId },
                                data: { logoId: null },
                            });
                            yield (0, helpers_1.deleteImageById)(client.logoId, prismaTx);
                        }
                        if (!data.logo)
                            throw new Error("no logo provided");
                        const createLogo = yield (0, helpers_1.UploadImage)(data.logo, (data.name || "update") + "-logo");
                        if (!createLogo)
                            throw new Error("error upload logo");
                        const logoToDB = yield (0, helpers_1.AssignImageToDBImage)({
                            imageType: "CLIENT",
                            blurhash: createLogo.blurhash,
                            width: createLogo.width,
                            height: createLogo.height,
                            data: createLogo.data,
                        }, prismaTx);
                        if (!logoToDB)
                            throw new Error("error create logoToDB");
                        NewLogoId = logoToDB.id;
                    }
                    // Generate new slug if name changed
                    if (data.name && data.name !== client.name) {
                        const slug = (0, slugify_1.default)(data.name + (0, crypto_1.randomUUID)().substring(0, 8), {
                            lower: true,
                        });
                        data.slug = slug;
                    }
                    // Update the client with new data
                    const updatedClient = yield prismaTx.client.update({
                        where: { id: data.clientId },
                        data: {
                            slug: data.slug || client.slug,
                            name: data.name || client.name,
                            description: data.description || client.description,
                            richDescription: data.richDescription || client.richDescription,
                            website: data.website || client.website,
                            industry: data.industry || client.industry,
                            imageId: NewImageId,
                            logoId: NewLogoId,
                            isActive: (_a = data.isActive) !== null && _a !== void 0 ? _a : client.isActive,
                            isFeatured: (_b = data.isFeatured) !== null && _b !== void 0 ? _b : client.isFeatured,
                            order: (_c = data.order) !== null && _c !== void 0 ? _c : client.order,
                        },
                        include: { image: true, logo: true },
                    });
                    const { image, logo } = updatedClient, rest = __rest(updatedClient, ["image", "logo"]);
                    return { Image: image, Logo: logo, client: rest };
                }), {
                    timeout: 20000,
                    maxWait: 5000,
                });
                return transaction;
            }
            catch (error) {
                console.error(error);
                throw new Error("Error updating client");
            }
        });
    }
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const transaction = yield this.prisma.$transaction((prismaTx) => __awaiter(this, void 0, void 0, function* () {
                    const client = yield prismaTx.client.findUnique({ where: { id } });
                    if (!client)
                        throw new Error("client not found");
                    yield prismaTx.client.update({
                        where: { id },
                        data: { imageId: null, logoId: null },
                    });
                    if (client.imageId)
                        yield (0, helpers_1.deleteImageById)(client.imageId, prismaTx);
                    if (client.logoId)
                        yield (0, helpers_1.deleteImageById)(client.logoId, prismaTx);
                    yield prismaTx.client.delete({ where: { id } });
                    return client;
                }), {
                    timeout: 20000,
                    maxWait: 5000,
                });
                return transaction;
            }
            catch (error) {
                console.error(error);
                throw new Error("Error deleting client");
            }
        });
    }
}
exports.ClientRepository = ClientRepository;
