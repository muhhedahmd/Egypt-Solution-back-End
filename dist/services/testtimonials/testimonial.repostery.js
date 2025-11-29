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
exports.TestimonialRepository = void 0;
const helpers_1 = require("../../lib/helpers");
const testimonal_error_1 = require("../../errors/testimonal.error");
class TestimonialRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    findMany(skip, take) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.testimonial.findMany({
                include: {
                    avatar: true,
                    slideShows: {
                        include: {
                            slideShow: true,
                        },
                    },
                },
                skip: skip * take,
                take: take,
                orderBy: {
                    order: 'asc',
                },
            });
        });
    }
    isValidOrder(_a) {
        return __awaiter(this, arguments, void 0, function* ({ order }) {
            try {
                const find = yield this.prisma.testimonial.findFirst({
                    where: { order },
                });
                return {
                    isValid: !find,
                    takenby: find,
                };
            }
            catch (error) {
                console.error(error);
                throw new Error('Error finding testimonial by order');
            }
        });
    }
    count() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.testimonial.count();
        });
    }
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return this.prisma.testimonial.findUnique({
                    where: { id },
                    include: {
                        avatar: true,
                        slideShows: {
                            include: {
                                slideShow: true,
                            },
                        },
                    },
                });
            }
            catch (error) {
                console.error(error);
                throw new Error('Error finding testimonial by ID');
            }
        });
    }
    SearchTestimonial(searchTerm, skip, take) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const testimonials = yield this.prisma.testimonial.findMany({
                    where: {
                        OR: [
                            {
                                clientName: {
                                    contains: searchTerm,
                                    mode: 'insensitive',
                                },
                            },
                            {
                                clientPosition: {
                                    contains: searchTerm,
                                    mode: 'insensitive',
                                },
                            },
                            {
                                clientCompany: {
                                    contains: searchTerm,
                                    mode: 'insensitive',
                                },
                            },
                            {
                                content: {
                                    contains: searchTerm,
                                    mode: 'insensitive',
                                },
                            },
                        ],
                    },
                    include: {
                        avatar: true,
                    },
                    skip: skip * take,
                    take,
                    orderBy: {
                        createdAt: 'desc',
                    },
                });
                return testimonials;
            }
            catch (error) {
                console.error(error);
                throw new testimonal_error_1.TestimonialError('Error searching testimonial', 400, 'TESTIMONIAL_SEARCH_ERROR');
            }
        });
    }
    create(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const transaction = yield this.prisma.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                    var _a, _b;
                    let avatarId = null;
                    // Upload avatar if provided
                    if (data.avatar) {
                        const createAvatar = yield (0, helpers_1.UploadImage)(data.avatar, data.clientName);
                        if (!createAvatar)
                            throw new Error('error upload avatar');
                        const avatarToDB = yield (0, helpers_1.AssignImageToDBImage)({
                            imageType: 'TESTIMONIAL',
                            blurhash: createAvatar.blurhash,
                            width: createAvatar.width,
                            height: createAvatar.height,
                            data: createAvatar.data,
                        }, tx);
                        if (!avatarToDB)
                            throw new Error('error create avatarToDB');
                        avatarId = avatarToDB.id;
                    }
                    const testimonial = yield tx.testimonial.create({
                        data: {
                            clientName: data.clientName,
                            clientPosition: data.clientPosition,
                            clientCompany: data.clientCompany,
                            content: data.content,
                            rating: data.rating || 5,
                            avatarId: avatarId,
                            isActive: (_a = data.isActive) !== null && _a !== void 0 ? _a : true,
                            isFeatured: (_b = data.isFeatured) !== null && _b !== void 0 ? _b : false,
                            order: data.order || 0,
                        },
                        include: {
                            avatar: true,
                        },
                    });
                    const { avatar } = testimonial, rest = __rest(testimonial, ["avatar"]);
                    return { Avatar: avatar, testimonial: rest };
                }), {
                    timeout: 20000,
                    isolationLevel: 'Serializable',
                    maxWait: 5000,
                });
                return transaction;
            }
            catch (error) {
                console.error(error);
                throw new Error('Error creating testimonial');
            }
        });
    }
    update(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const transaction = yield this.prisma.$transaction((prismaTx) => __awaiter(this, void 0, void 0, function* () {
                    var _a, _b, _c, _d;
                    let NewAvatarId = null;
                    if (!data.testimonialId)
                        throw new Error('no testimonialId provided');
                    const testimonial = yield prismaTx.testimonial.findUnique({
                        where: { id: data.testimonialId },
                    });
                    if (!testimonial)
                        throw new Error('testimonial not found');
                    NewAvatarId = (testimonial === null || testimonial === void 0 ? void 0 : testimonial.avatarId) || null;
                    // Handle avatar update/removal
                    if (data.avatarState === 'REMOVE') {
                        if (testimonial.avatarId) {
                            yield prismaTx.testimonial.update({
                                where: { id: data.testimonialId },
                                data: { avatarId: null },
                            });
                            yield (0, helpers_1.deleteImageById)(testimonial.avatarId, prismaTx);
                        }
                        NewAvatarId = null;
                    }
                    if (data.avatarState === 'UPDATE') {
                        if (testimonial.avatarId) {
                            yield prismaTx.testimonial.update({
                                where: { id: data.testimonialId },
                                data: { avatarId: null },
                            });
                            yield (0, helpers_1.deleteImageById)(testimonial.avatarId, prismaTx);
                        }
                        if (!data.avatar)
                            throw new Error('no avatar provided');
                        const createAvatar = yield (0, helpers_1.UploadImage)(data.avatar, data.clientName || 'update');
                        if (!createAvatar)
                            throw new Error('error upload avatar');
                        const avatarToDB = yield (0, helpers_1.AssignImageToDBImage)({
                            imageType: 'TESTIMONIAL',
                            blurhash: createAvatar.blurhash,
                            width: createAvatar.width,
                            height: createAvatar.height,
                            data: createAvatar.data,
                        }, prismaTx);
                        if (!avatarToDB)
                            throw new Error('error create avatarToDB');
                        NewAvatarId = avatarToDB.id;
                    }
                    // Update the testimonial with new data
                    const updatedTestimonial = yield prismaTx.testimonial.update({
                        where: { id: data.testimonialId },
                        data: {
                            clientName: data.clientName || testimonial.clientName,
                            clientPosition: data.clientPosition || testimonial.clientPosition,
                            clientCompany: data.clientCompany || testimonial.clientCompany,
                            content: data.content || testimonial.content,
                            rating: (_a = data.rating) !== null && _a !== void 0 ? _a : testimonial.rating,
                            avatarId: NewAvatarId,
                            isActive: (_b = data.isActive) !== null && _b !== void 0 ? _b : testimonial.isActive,
                            isFeatured: (_c = data.isFeatured) !== null && _c !== void 0 ? _c : testimonial.isFeatured,
                            order: (_d = data.order) !== null && _d !== void 0 ? _d : testimonial.order,
                        },
                        include: { avatar: true },
                    });
                    const { avatar } = updatedTestimonial, rest = __rest(updatedTestimonial, ["avatar"]);
                    return { Avatar: avatar, testimonial: rest };
                }), {
                    timeout: 20000,
                    maxWait: 5000,
                });
                return transaction;
            }
            catch (error) {
                console.error(error);
                throw new Error('Error updating testimonial');
            }
        });
    }
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const transaction = yield this.prisma.$transaction((prismaTx) => __awaiter(this, void 0, void 0, function* () {
                    const testimonial = yield prismaTx.testimonial.findUnique({
                        where: { id }
                    });
                    if (!testimonial)
                        throw new Error('testimonial not found');
                    yield prismaTx.testimonial.update({
                        where: { id },
                        data: { avatarId: null },
                    });
                    if (testimonial.avatarId)
                        yield (0, helpers_1.deleteImageById)(testimonial.avatarId, prismaTx);
                    yield prismaTx.testimonial.delete({ where: { id } });
                    return testimonial;
                }), {
                    timeout: 20000,
                    maxWait: 5000,
                });
                return transaction;
            }
            catch (error) {
                console.error(error);
                throw new Error('Error deleting testimonial');
            }
        });
    }
}
exports.TestimonialRepository = TestimonialRepository;
