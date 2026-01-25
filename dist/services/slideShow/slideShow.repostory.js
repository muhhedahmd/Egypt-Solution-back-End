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
exports.slideShowRepository = void 0;
const slugify_1 = __importDefault(require("slugify"));
const services_error_1 = require("../../errors/services.error");
const crypto_1 = require("crypto");
class slideShowRepository {
    constructor(prisma) {
        this.prisma = prisma;
    }
    modelMap(prismaToUse) {
        return {
            service: prismaToUse.service,
            project: prismaToUse.project,
            client: prismaToUse.client,
            teamMember: prismaToUse.teamMember,
            testimonial: prismaToUse.testimonial,
        };
    }
    modelAttachMap(prismaToUse) {
        return {
            service: prismaToUse.serviceSlideShow,
            project: prismaToUse.projectSlideShow,
            client: prismaToUse.clientSlideShow,
            teamMember: prismaToUse.teamSlideShow,
            testimonial: prismaToUse.testimonialSlideShow,
        };
    }
    findManyMinimal(lang, prismaTouse) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const findMany = yield (prismaTouse || this.prisma).slideShow.findMany({
                    select: {
                        id: true,
                        title: true,
                        order: true,
                        slug: true,
                        type: true,
                        SlideShowTranslation: {
                            where: {
                                lang,
                            },
                            select: {
                                title: true,
                            },
                        },
                    },
                    orderBy: {
                        order: "asc",
                    },
                });
                return findMany.map((slideShow) => {
                    var _a, _b;
                    return {
                        id: slideShow.id,
                        title: ((_b = (_a = slideShow === null || slideShow === void 0 ? void 0 : slideShow.SlideShowTranslation) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.title) || "",
                        order: slideShow.order,
                        slug: slideShow.slug,
                        type: slideShow.type,
                    };
                });
            }
            catch (error) {
                console.log(error);
                throw new services_error_1.ServiceError("slideShow not found", 404, "Cannot find slideShow in DB");
            }
        });
    }
    findById(id, prismaTouse) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const find = yield (prismaTouse || this.prisma).slideShow.findUnique({
                    where: {
                        id,
                    },
                    omit: {
                        title: true,
                        description: true,
                    },
                });
                const findTranslation = yield (prismaTouse || this.prisma).slideShowTranslation.findMany({
                    where: {
                        slideShowId: id,
                    },
                });
                return { slideShow: find, translation: findTranslation };
            }
            catch (error) {
                throw new services_error_1.ServiceError("slideShow not found id: " + id, 404, "id not found in DB");
            }
        });
    }
    findBySlugFull(slug) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const slideShow = yield this.prisma.slideShow.findUnique({
                    where: {
                        slug,
                    },
                    include: {
                        clients: {
                            include: {
                                client: {
                                    include: {
                                        image: true,
                                        logo: true,
                                    },
                                },
                            },
                        },
                        projects: {
                            include: {
                                project: {
                                    include: {
                                        image: true,
                                    },
                                },
                            },
                        },
                        services: {
                            include: {
                                service: {
                                    include: {
                                        image: true,
                                    },
                                },
                            },
                        },
                        team: {
                            include: {
                                team: {
                                    include: {
                                        image: true,
                                    },
                                },
                            },
                        },
                        testimonials: {
                            include: {
                                testimonial: {
                                    include: {
                                        avatar: true,
                                    },
                                },
                            },
                        },
                    },
                });
                if (!slideShow) {
                    throw new services_error_1.ServiceError("slideShow not found  slug: " + slug, 404, "id not found in DB");
                }
                const { projects, services, clients, team, testimonials } = slideShow, rest = __rest(slideShow, ["projects", "services", "clients", "team", "testimonials"]);
                const slideShowData = rest;
                return { slideShowData, projects, services, clients, team, testimonials };
            }
            catch (error) {
                throw new services_error_1.ServiceError("slideShow not found  slug: " + slug, 404, "id not found in DB");
            }
        });
    }
    findAttachTable(id, attachType, prismaTouse) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.modelMap(prismaTouse || this.prisma)[attachType])
                throw new services_error_1.ServiceError("slideShow attach + " + attachType + " not found id: " + id, 404, "id not found in DB");
            const findAttached = yield this.modelMap(prismaTouse || this.prisma)[attachType].findUnique({
                where: { id },
            });
            if (!findAttached)
                throw new services_error_1.ServiceError("slideShow attach + " + attachType + " not found id: " + id, 404, "id not found in DB");
            return findAttached;
        });
    }
    findByTitle(title) {
        return __awaiter(this, void 0, void 0, function* () {
            const find = yield this.prisma.slideShow.findFirst({
                where: {
                    title,
                },
            });
            return find;
        });
    }
    count() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.prisma.slideShow.count();
        });
    }
    // crud
    findMany(lang_1, _a) {
        return __awaiter(this, arguments, void 0, function* (lang, { skip, take }) {
            try {
                const slideShows = yield this.prisma.slideShow.findMany({
                    skip: skip * take,
                    take,
                    orderBy: {
                        order: "asc",
                    },
                    include: {
                        SlideShowTranslation: {
                            select: {
                                lang: true,
                                title: true,
                                description: true,
                            },
                        },
                    },
                });
                return slideShows === null || slideShows === void 0 ? void 0 : slideShows.map((slideshow) => {
                    const { SlideShowTranslation } = slideshow, rest = __rest(slideshow, ["SlideShowTranslation"]);
                    const currentTranslation = SlideShowTranslation.find((el) => el.lang === lang);
                    return Object.assign(Object.assign(Object.assign({}, rest), currentTranslation), { translations: SlideShowTranslation });
                });
            }
            catch (error) {
                console.error(error);
                throw new services_error_1.ServiceError("error get slide shows", 400, "SLIDESHOWS_GET_ERROR");
            }
        });
    }
    create(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const transiction = this.prisma.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                    const lastOrder = (yield this.count()) - 1;
                    const findIstheretheOrder = yield tx.slideShow.findFirst({
                        where: {
                            order: data.order,
                        },
                    });
                    if (findIstheretheOrder) {
                        data.order = lastOrder + 1;
                    }
                    if (data.order && data.order > lastOrder) {
                        data.order = lastOrder + 1;
                    }
                    const create = yield tx.slideShow.create({
                        data: {
                            type: data.type,
                            composition: data.composition,
                            slug: data.slug,
                            title: data.title,
                            order: data.order,
                            isActive: data.isActive,
                            description: data.description,
                            interval: data.interval,
                            background: data.background,
                            autoPlay: data.autoPlay,
                        },
                    });
                    return create;
                }));
                return transiction;
            }
            catch (error) {
                console.error(error);
                throw new services_error_1.ServiceError("error creating a slideshow", 400, "SLIDESHOW_CREATION_ERROR");
            }
        });
    }
    update(lang, data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const transaction = yield this.prisma.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                    const _find = yield this.findById(data.slideShowId, tx);
                    const find = _find.slideShow;
                    const enTranslation = _find.translation.find((l) => l.lang === "EN");
                    if (!find)
                        throw new services_error_1.ServiceError("slideShow not found id: " + data.slideShowId, 404, "id not found in DB");
                    let slug = find.slug;
                    if (data.title && data.title != (enTranslation === null || enTranslation === void 0 ? void 0 : enTranslation.title)) {
                        slug = (0, slugify_1.default)(data.title + (0, crypto_1.randomUUID)().substring(0, 6), {
                            lower: true,
                        });
                    }
                    const isOrderChanged = data.order !== undefined && data.order != find.order;
                    if (isOrderChanged)
                        yield this.reorderUpdate({
                            slideShowUpdate: {
                                id: find.id,
                                order: find.order,
                            },
                            orderBeforeUpdate: find.order,
                        });
                    const updateSlideShow = yield tx.slideShow.update({
                        where: {
                            id: data.slideShowId,
                        },
                        data: {
                            type: data.type || find.type,
                            composition: data.composition || find.composition,
                            slug,
                            title: "",
                            order: data.order === undefined ? find.order : data.order,
                            isActive: data.isActive || find.isActive,
                            description: "",
                            interval: data.interval || find.interval,
                            background: data.background || find.background,
                            autoPlay: data.autoPlay || find.autoPlay,
                        },
                    });
                    const findTheCurrentTranslation = yield tx.slideShowTranslation.findUnique({
                        where: {
                            slideShowId_lang: {
                                lang,
                                slideShowId: data.slideShowId,
                            },
                        },
                    });
                    const projectTranslation = yield tx.slideShowTranslation.upsert({
                        where: {
                            slideShowId_lang: {
                                lang,
                                slideShowId: data.slideShowId,
                            },
                        },
                        update: {
                            title: data.title || (findTheCurrentTranslation === null || findTheCurrentTranslation === void 0 ? void 0 : findTheCurrentTranslation.title),
                            description: data.description || (findTheCurrentTranslation === null || findTheCurrentTranslation === void 0 ? void 0 : findTheCurrentTranslation.description),
                        },
                        create: {
                            slideShowId: data.slideShowId,
                            lang,
                            title: data.title || "",
                            description: data.description || "",
                        },
                    });
                    return { SlideShow: updateSlideShow, translation: projectTranslation };
                }));
                return transaction;
            }
            catch (error) {
                console.error(error);
                throw new services_error_1.ServiceError("error updating a slideshow", 400, "SLIDESHOW_UPDATE_ERROR");
            }
        });
    }
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.findById(id);
                const deleteSlideShow = yield this.prisma.slideShow.delete({
                    where: {
                        id,
                    },
                });
                yield this.reorderDelete({ slideShowDelete: deleteSlideShow });
                return deleteSlideShow;
            }
            catch (error) {
                console.error(error);
                throw new services_error_1.ServiceError("error deleting a slideshow", 400, "SLIDESHOW_DELETE_ERROR");
            }
        });
    }
    // reorder logic
    reorderDelete(_a) {
        return __awaiter(this, arguments, void 0, function* ({ slideShowDelete }) {
            try {
                const order = slideShowDelete.order;
                const theRest = yield this.prisma.slideShow.findMany({
                    where: {
                        order: {
                            gt: order,
                        },
                    },
                    orderBy: {
                        order: "asc",
                    },
                });
                const promises = yield Promise.all(theRest.map((att) => {
                    return this.prisma.slideShow.update({
                        where: {
                            id: att.id,
                        },
                        data: {
                            order: att.order - 1,
                        },
                    });
                }));
                return promises;
            }
            catch (error) { }
        });
    }
    // reorderUpdate for better that will be a swap
    reorderUpdate(_a) {
        return __awaiter(this, arguments, void 0, function* ({ slideShowUpdate, orderBeforeUpdate, }) {
            try {
                const order = slideShowUpdate.order;
                const findOrder = yield this.prisma.slideShow.findFirst({
                    where: {
                        order,
                    },
                });
                if (findOrder) {
                    return this.prisma.slideShow.update({
                        where: {
                            id: findOrder.id,
                        },
                        data: {
                            order: orderBeforeUpdate,
                        },
                    });
                }
            }
            catch (error) {
                console.error(error);
                throw new services_error_1.ServiceError("error updating a slideshow Reorder", 400, "SLIDESHOW_UPDATE_ERROR");
            }
        });
    }
    reorderBulkSlideShow(_a) {
        return __awaiter(this, arguments, void 0, function* ({ slideShowOrder, }) {
            try {
                if (!slideShowOrder.length) {
                    return [];
                }
                const result = yield this.prisma.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                    const promises = slideShowOrder.map((item) => __awaiter(this, void 0, void 0, function* () {
                        return tx.slideShow.update({
                            where: {
                                id: item.id,
                            },
                            data: {
                                order: item.order,
                            },
                            select: {
                                id: true,
                                order: true,
                            },
                        });
                    }));
                    return yield Promise.all(promises);
                }));
                return result;
            }
            catch (error) {
                console.error(error);
                throw new services_error_1.ServiceError("Error updating slideshow reorder", 400, "SLIDESHOW_UPDATE_ERROR");
            }
        });
    }
    slideShowSlidesCount(slideShowId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const svcCount = this.prisma.serviceSlideShow.count({
                    where: { slideShowId },
                });
                const prjCount = this.prisma.projectSlideShow.count({
                    where: { slideShowId },
                });
                const cliCount = this.prisma.clientSlideShow.count({
                    where: { slideShowId },
                });
                const tstCount = this.prisma.testimonialSlideShow.count({
                    where: { slideShowId },
                });
                const tmCount = this.prisma.teamSlideShow.count({
                    where: { slideShowId },
                });
                return {
                    services: yield svcCount,
                    projects: yield prjCount,
                    clients: yield cliCount,
                    testimonials: yield tstCount,
                    team: yield tmCount,
                };
            }
            catch (error) {
                console.error(error);
                throw new services_error_1.ServiceError("error getting slide show slides count", 400, "SLIDESHOW_SLIDES_COUNT_ERROR");
            }
        });
    }
    getSlidesPaged(slideShowId, opts, tx) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f, _g;
            const prismaToUse = tx || this.prisma;
            yield this.findById(slideShowId);
            const perPageDefault = Math.min(Math.max((_a = opts === null || opts === void 0 ? void 0 : opts.perPage) !== null && _a !== void 0 ? _a : 10, 1), 100);
            const pageDefault = Math.max((_b = opts === null || opts === void 0 ? void 0 : opts.page) !== null && _b !== void 0 ? _b : 1, 1);
            const getSkipTake = (page, perPage = perPageDefault) => {
                const p = Math.max(page !== null && page !== void 0 ? page : pageDefault, 1);
                return { skip: (p - 1) * perPage, take: perPage + 1, page: p, perPage };
            };
            const svc = getSkipTake((_c = opts === null || opts === void 0 ? void 0 : opts.pagesPerType) === null || _c === void 0 ? void 0 : _c.services);
            const prj = getSkipTake((_d = opts === null || opts === void 0 ? void 0 : opts.pagesPerType) === null || _d === void 0 ? void 0 : _d.projects);
            const cli = getSkipTake((_e = opts === null || opts === void 0 ? void 0 : opts.pagesPerType) === null || _e === void 0 ? void 0 : _e.clients);
            const tst = getSkipTake((_f = opts === null || opts === void 0 ? void 0 : opts.pagesPerType) === null || _f === void 0 ? void 0 : _f.testimonials);
            const tm = getSkipTake((_g = opts === null || opts === void 0 ? void 0 : opts.pagesPerType) === null || _g === void 0 ? void 0 : _g.team);
            const [rawSvc, rawPrj, rawCli, rawTst, rawTm] = yield Promise.all([
                prismaToUse.serviceSlideShow.findMany({
                    where: { slideShowId },
                    orderBy: { order: "asc" },
                    skip: svc.skip,
                    take: svc.take,
                    include: {
                        service: {
                            include: {
                                image: true,
                                serviceTranslation: true,
                            },
                        },
                    },
                }),
                prismaToUse.projectSlideShow.findMany({
                    where: { slideShowId },
                    orderBy: { order: "asc" },
                    skip: prj.skip,
                    take: prj.take,
                    include: {
                        project: {
                            include: {
                                image: true,
                                ProjectTranslation: true,
                                services: {
                                    select: {
                                        name: true,
                                        icon: true,
                                    },
                                },
                                technologies: {
                                    select: {
                                        technology: {
                                            select: {
                                                icon: true,
                                                name: true,
                                                category: true,
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                }),
                prismaToUse.clientSlideShow.findMany({
                    where: { slideShowId },
                    orderBy: { order: "asc" },
                    skip: cli.skip,
                    take: cli.take,
                    include: {
                        client: {
                            include: {
                                image: true,
                                logo: true,
                                ClientTranslation: true,
                            },
                        },
                    },
                }),
                prismaToUse.testimonialSlideShow.findMany({
                    where: { slideShowId },
                    orderBy: { order: "asc" },
                    skip: tst.skip,
                    take: tst.take,
                    include: {
                        testimonial: {
                            include: {
                                avatar: true,
                                TestimonialTranslation: true,
                            },
                        },
                    },
                }),
                prismaToUse.teamSlideShow.findMany({
                    where: { slideShowId },
                    orderBy: { order: "asc" },
                    skip: tm.skip,
                    take: tm.take,
                    include: {
                        team: {
                            include: {
                                image: true,
                                TeamMemberTranslation: true,
                            },
                        },
                    },
                }),
            ]);
            const process = (arr, perPage) => {
                const hasMore = arr.length > perPage;
                if (hasMore)
                    arr = arr.slice(0, perPage);
                return { items: arr, hasMore };
            };
            const svcPage = process(rawSvc, svc.perPage);
            const prjPage = process(rawPrj, prj.perPage);
            const cliPage = process(rawCli, cli.perPage);
            const tstPage = process(rawTst, tst.perPage);
            const tmPage = process(rawTm, tm.perPage);
            const toSlides = (rows, type, dataKey) => rows.map((r) => {
                var _a, _b, _c, _d, _e;
                // r = pivot row (e.g. clientSlideShow), r[dataKey] = actual client/project object
                const entity = (_a = r[dataKey]) !== null && _a !== void 0 ? _a : null;
                const order = typeof r.order === "number" && r.order !== 0
                    ? r.order
                    : ((_b = entity === null || entity === void 0 ? void 0 : entity.order) !== null && _b !== void 0 ? _b : 1000);
                const isVisible = typeof r.isVisible === "boolean"
                    ? r.isVisible
                    : ((_c = entity === null || entity === void 0 ? void 0 : entity.isActive) !== null && _c !== void 0 ? _c : true);
                return {
                    type,
                    // slide id should be pivot id (the slideshow item id), data.id is resource id
                    id: r.id,
                    order,
                    isVisible,
                    data: entity,
                    translation: (entity === null || entity === void 0 ? void 0 : entity.TeamMemberTranslation) ||
                        (entity === null || entity === void 0 ? void 0 : entity.TestimonialTranslation) ||
                        (entity === null || entity === void 0 ? void 0 : entity.ClientTranslation) ||
                        (entity === null || entity === void 0 ? void 0 : entity.serviceTranslation) ||
                        (entity === null || entity === void 0 ? void 0 : entity.ProjectTranslation) ||
                        [],
                    // copy any custom fields from pivot if exist
                    customDesc: (_d = r.customDesc) !== null && _d !== void 0 ? _d : null,
                    customTitle: (_e = r.customTitle) !== null && _e !== void 0 ? _e : null,
                };
            });
            const slides = [
                ...toSlides(svcPage.items, "service", "service"),
                ...toSlides(prjPage.items, "project", "project"),
                ...toSlides(cliPage.items, "client", "client"),
                ...toSlides(tstPage.items, "testimonial", "testimonial"),
                ...toSlides(tmPage.items, "team", "team"),
            ].sort((a, b) => { var _a, _b; return ((_a = a.order) !== null && _a !== void 0 ? _a : 0) - ((_b = b.order) !== null && _b !== void 0 ? _b : 0); });
            return {
                pages: {
                    services: {
                        page: svc.page,
                        perPage: svc.perPage,
                        hasMore: svcPage.hasMore,
                    },
                    projects: {
                        page: prj.page,
                        perPage: prj.perPage,
                        hasMore: prjPage.hasMore,
                    },
                    clients: {
                        page: cli.page,
                        perPage: cli.perPage,
                        hasMore: cliPage.hasMore,
                    },
                    testimonials: {
                        page: tst.page,
                        perPage: tst.perPage,
                        hasMore: tstPage.hasMore,
                    },
                    team: { page: tm.page, perPage: tm.perPage, hasMore: tmPage.hasMore },
                },
                slides,
                slidesCount: yield this.slideShowSlidesCount(slideShowId),
            };
        });
    }
    getSlideShowsWithSlidesPaged(_a, opts_1) {
        return __awaiter(this, arguments, void 0, function* (
        // slideShowId: string,
        { skip, take }, opts) {
            try {
                const transaction = this.prisma.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                    const slideShows = yield tx.slideShow.findMany({
                        where: {
                            isActive: true,
                        },
                        orderBy: {
                            order: "asc",
                        },
                        skip: skip * take,
                        take: take,
                    });
                    if (slideShows.length) {
                        const slideShowWithSlides = slideShows.map((slideShow) => __awaiter(this, void 0, void 0, function* () {
                            return {
                                slideShow,
                                slides: yield this.getSlidesPaged(slideShow.id, opts, tx),
                            };
                        }));
                        const slides = yield Promise.all(slideShowWithSlides);
                        return slides;
                    }
                    return null;
                    // return await this.getSlideShowsWithSlidesPaged(tx, opts);
                }), {
                    maxWait: 10000,
                    timeout: 20000,
                });
                return transaction;
            }
            catch (error) {
                throw new services_error_1.ServiceError("error getting slide shows", 400, "SLIDESHOW_ERROR");
            }
        });
    }
    // attaches
    attach(_a) {
        return __awaiter(this, arguments, void 0, function* ({ slideShowId, attachType, attachId, order, isVisible, customDesc = "", customTitle = "", isMany = false, tx, skipOrder, }) {
            try {
                const prismaTouse = tx || this.prisma;
                if (!isMany)
                    yield this.findById(slideShowId);
                const findAttach = yield this.modelMap(prismaTouse || this.prisma)[attachType].findUnique({
                    where: { id: attachId },
                });
                console.log(findAttach);
                if (!findAttach) {
                    throw new services_error_1.ServiceError("Attach entity not found id: " + attachId, 404, "id not found in DB");
                }
                const fieldName = `${attachType === "teamMember" ? "team" : attachType}Id`;
                if (!skipOrder) {
                    const lastOrder = (yield this.modelAttachMap(prismaTouse || this.prisma)[attachType].count()) - 1;
                    const findIstheretheOrder = yield this.modelAttachMap(prismaTouse || this.prisma)[attachType].findFirst({
                        where: {
                            order: order,
                        },
                    });
                    if (findIstheretheOrder) {
                        order = lastOrder + 1;
                    }
                    if (order && order > lastOrder) {
                        order = lastOrder + 1;
                    }
                }
                let attach;
                if (attachType === "service") {
                    attach = yield this.modelAttachMap(prismaTouse || this.prisma)[attachType]
                        .create({
                        data: {
                            slideShowId,
                            [fieldName]: attachId,
                            order,
                            isVisible,
                            customTitle: customTitle || "",
                            customDesc: customDesc || "",
                        },
                    });
                }
                else {
                    yield this.modelAttachMap(prismaTouse || this.prisma)[attachType]
                        .create({
                        data: {
                            slideShowId,
                            [fieldName]: attachId,
                            order,
                            isVisible,
                        },
                    });
                }
                return Object.assign(Object.assign({}, attach), { _id: attach === null || attach === void 0 ? void 0 : attach.fieldName });
            }
            catch (error) {
                console.error(error);
                throw new services_error_1.ServiceError("error attaching to slideshow", 400, "SLIDESHOW_ATTACH_ERROR");
            }
        });
    }
    // reorder  on the slide show attachments and reodred in slide show attachmentJoinsModel
    attachMany(_a) {
        return __awaiter(this, arguments, void 0, function* ({ slideShowId, attachobj, }) {
            try {
                yield this.findById(slideShowId);
                const tranisction = this.prisma.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                    const promises = yield Promise.all(attachobj.map((att) => {
                        return this.attach({
                            slideShowId,
                            attachType: att.type,
                            attachId: att.id,
                            order: att.order,
                            isVisible: att.isVisible,
                            isMany: true,
                            customTitle: att.customTitle || "",
                            customDesc: att.customDesc || "",
                            tx,
                        });
                    }));
                    return promises;
                }));
                return tranisction;
            }
            catch (error) {
                console.error(error);
                throw new services_error_1.ServiceError("error attaching to slideshow", 400, "SLIDESHOW_ATTACH_ERROR_MANY");
            }
        });
    }
    Deattach(_a) {
        return __awaiter(this, arguments, void 0, function* ({ slideShowId, type: attachType, id: attachId, isMany = false, tx, }) {
            try {
                const prismaTouse = tx || this.prisma;
                if (!isMany)
                    yield this.findById(slideShowId, prismaTouse);
                const findTheAttachedTable = yield this.findAttachTable(attachId, attachType, prismaTouse);
                console.log(findTheAttachedTable);
                if (!findTheAttachedTable) {
                    throw new services_error_1.ServiceError("Attach entity not found id: " + attachId, 404, "id not found in DB");
                }
                const fieldName = `${attachType === "teamMember" ? "team" : attachType}Id`;
                let attach;
                attach = yield this.modelAttachMap(prismaTouse || this.prisma)[attachType]
                    .delete({
                    where: {
                        [`${fieldName}_slideShowId`]: {
                            slideShowId,
                            [fieldName]: attachId,
                        },
                        // [fieldName]: attachId, slideShowId
                    },
                });
                return attach;
            }
            catch (error) {
                console.error(error);
                throw new services_error_1.ServiceError("error attaching to slideshow", 400, "SLIDESHOW_ATTACH_ERROR");
            }
        });
    }
    DeatchWithJoinTableId(_a) {
        return __awaiter(this, arguments, void 0, function* ({ slideShowId, type: attachType, id: attachId, isMany = false, tx, }) {
            try {
                const prismaTouse = tx || this.prisma;
                if (!isMany)
                    yield this.findById(slideShowId, prismaTouse);
                // const findTheAttachedTable = await this.findAttachTable(
                //   attachId,
                //   attachType,
                //   prismaTouse
                // );
                // console.log( findTheAttachedTable)
                // if (!findTheAttachedTable) {
                //   throw new ServiceError(
                //     "Attach entity not found id: " + attachId,
                //     404,
                //     "id not found in DB"
                //   );
                // }
                // const fieldName = `${
                //   attachType === "teamMember" ? "team" : attachType
                // }Id` as any;
                let attach;
                attach = yield this.modelAttachMap(prismaTouse || this.prisma)[attachType]
                    .delete({
                    where: {
                        id: attachId,
                        // [fieldName]: attachId, slideShowId
                    },
                });
                return attach;
            }
            catch (error) {
                console.error(error);
                throw new services_error_1.ServiceError("error attaching to slideshow", 400, "SLIDESHOW_ATTACH_ERROR");
            }
        });
    }
    DeattachMany(_a) {
        return __awaiter(this, arguments, void 0, function* ({ slideShowId, items: attachobj }) {
            try {
                const tranisction = this.prisma.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                    yield this.findById(slideShowId, tx);
                    const promises = yield Promise.all(attachobj.map((att) => {
                        return this.Deattach({
                            slideShowId,
                            type: att.type,
                            id: att.id,
                            isMany: true,
                            tx,
                        });
                    }));
                    return promises;
                }));
                return tranisction;
            }
            catch (error) {
                console.error(error);
                throw new services_error_1.ServiceError("error attaching to slideshow", 400, "SLIDESHOW_ATTACH_ERROR_MANY");
            }
        });
    }
    // ***
    createAndAttachMany(lang, _a) {
        return __awaiter(this, void 0, void 0, function* () {
            var { slides } = _a, rest = __rest(_a, ["slides"]);
            try {
                const transiction = this.prisma.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                    const slug = (0, slugify_1.default)(rest.title + (0, crypto_1.randomUUID)().substring(0, 6), {
                        lower: true,
                    });
                    const lastOrder = (yield this.count()) - 1;
                    const findIstheretheOrder = yield tx.slideShow.findFirst({
                        where: {
                            order: rest.order,
                        },
                    });
                    if (findIstheretheOrder) {
                        rest.order = lastOrder + 1;
                    }
                    if (rest.order && rest.order > lastOrder) {
                        rest.order = lastOrder + 1;
                    }
                    const slideShow = yield tx.slideShow.create({
                        data: Object.assign(Object.assign({}, rest), { title: "", description: "", slug }),
                    });
                    const translation = yield tx.slideShowTranslation.create({
                        data: {
                            slideShowId: slideShow.id,
                            lang,
                            title: rest.title,
                            description: rest.title,
                        },
                    });
                    const cerated = Promise.all(slides.map((att) => {
                        return this.attach({
                            slideShowId: slideShow.id,
                            attachType: att.type,
                            attachId: att.id,
                            order: att.order || 1,
                            isVisible: att.isVisible,
                            isMany: true,
                            customTitle: att.customTitle || "",
                            customDesc: att.customDesc || "",
                            tx,
                        });
                    }));
                    return {
                        slideShow: Object.assign(Object.assign({}, slideShow), { title: translation.title, description: translation.description }),
                        translation,
                        attacheds: yield cerated,
                    };
                }), {
                    maxWait: 5000,
                    timeout: 20000,
                });
                console.log(transiction);
                return transiction;
            }
            catch (error) {
                console.error(error);
                throw new services_error_1.ServiceError("error creating and attaching to slideshow", 400, "SLIDESHOW_CREATE_ATTACH_ERROR_MANY");
            }
        });
    }
    //***
    updateAndAttachMany(_a) {
        return __awaiter(this, void 0, void 0, function* () {
            var { slides: newSlides, delete: deleteArr, update } = _a, rest = __rest(_a, ["slides", "delete", "update"]);
            try {
                const transaction = this.prisma.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                    // TODO: Implement update and attach logic
                    const find = yield this.findById(rest.id, tx);
                    if (!find) {
                        throw new services_error_1.ServiceError("slideShow not found id: " + rest.id, 404, "id not found in DB");
                    }
                    const updateSlideShow = yield tx.slideShow.update({
                        where: {
                            id: rest.id,
                        },
                        data: Object.assign({}, rest),
                    });
                    let cerated;
                    if (newSlides) {
                        cerated = Promise.all(newSlides.map((att) => {
                            var _a;
                            if (!((_a = find === null || find === void 0 ? void 0 : find.slideShow) === null || _a === void 0 ? void 0 : _a.id))
                                return;
                            return this.attach({
                                slideShowId: find.slideShow.id,
                                attachType: att.type,
                                attachId: att.id,
                                order: att.order || 1,
                                isVisible: att.isVisible,
                                isMany: true,
                                customTitle: att.customTitle || "",
                                customDesc: att.customDesc || "",
                                tx,
                            });
                        }));
                    }
                    let deleted;
                    if (deleteArr) {
                        deleted = Promise.all(deleteArr.map((id) => {
                            var _a, _b;
                            if (!((_a = find === null || find === void 0 ? void 0 : find.slideShow) === null || _a === void 0 ? void 0 : _a.id))
                                return;
                            return this.Deattach({
                                slideShowId: (_b = find === null || find === void 0 ? void 0 : find.slideShow) === null || _b === void 0 ? void 0 : _b.id,
                                type: id.type,
                                id: id.id,
                                isMany: true,
                                tx,
                            });
                        }));
                    }
                    let updated;
                    if (update) {
                        updated = Promise.all(update.map((up) => {
                            return this.updateAttach({
                                attachType: up.type,
                                attachId: up.id,
                                order: up.order,
                                isVisible: up.isVisible,
                                customTitle: up.customTitle || "",
                                customDesc: up.customDesc || "",
                                tx,
                            });
                        }));
                    }
                    return {
                        slideShow: updateSlideShow,
                        attacheds: yield cerated,
                        deleted: yield deleted,
                        updated: yield updated,
                    };
                }));
                return transaction;
            }
            catch (error) {
                console.error(error);
                throw new services_error_1.ServiceError("error updating and attaching to slideshow", 400, "SLIDESHOW_UPDATE_ATTACH_ERROR_MANY");
            }
        });
    }
    updateAttach(_a) {
        return __awaiter(this, arguments, void 0, function* ({ attachType, attachId, order, isVisible, customDesc = "", customTitle = "", tx, }) {
            try {
                const prismaTouse = tx || this.prisma;
                // Check if attachment exists by attachId (the junction table record ID)
                const existingAttachment = yield this.modelAttachMap(prismaTouse)[attachType].findUnique({
                    where: {
                        id: attachId,
                    },
                });
                if (!existingAttachment) {
                    throw new services_error_1.ServiceError(`Attachment not found with id: ${attachId}`, 404, "ATTACHMENT_NOT_FOUND");
                }
                // Build update data
                const updateData = {
                    order,
                    isVisible,
                };
                // Only services support custom title and description
                if (attachType === "service") {
                    updateData.customTitle = customTitle || "";
                    updateData.customDesc = customDesc || "";
                }
                // Update the attachment
                const attach = yield this.modelAttachMap(prismaTouse)[attachType].update({
                    where: {
                        id: attachId,
                    },
                    data: updateData,
                });
                return attach;
            }
            catch (error) {
                console.error("Error in updateAttach:", error);
                if (error instanceof services_error_1.ServiceError) {
                    throw error;
                }
                throw new services_error_1.ServiceError("Error updating attachment in slideshow", 400, "SLIDESHOW_UPDATE_ATTACH_ERROR");
            }
        });
    }
    getALlGroup(slideShowId) {
        return __awaiter(this, void 0, void 0, function* () {
            const allGroups = yield this.prisma.slideShow.groupBy({
                where: { id: slideShowId },
                by: ["type"],
                _count: true,
            });
            return allGroups;
        });
    }
    getAttachedsGrouped(_a) {
        return __awaiter(this, arguments, void 0, function* ({ slideShowId, skip, take, }) {
            try {
                const res = yield this.prisma.slideShow.groupBy({
                    where: {
                        id: slideShowId,
                    },
                    by: ["type"],
                    orderBy: {
                        type: "asc",
                    },
                    _count: true,
                    skip: skip * take,
                    take: take,
                });
                return res;
            }
            catch (error) {
                console.error(error);
                throw new services_error_1.ServiceError("error getting attacheds to slideshow Grouped by type", 400, "SLIDESHOW_ATTACH_ERROR_MANY");
            }
        });
    }
    getSlideShowByTypeCount(type) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.prisma.slideShow.count({
                where: {
                    type,
                },
            });
        });
    }
    getslideShowByType(_a) {
        return __awaiter(this, arguments, void 0, function* ({ type, skip, take, }) {
            try {
                const find = yield this.prisma.slideShow.findMany({
                    where: {
                        type: type,
                    },
                    orderBy: {
                        order: "asc",
                    },
                    include: {
                        [type.toLowerCase()]: {
                            orderBy: {
                                order: "asc",
                            },
                        },
                    },
                    skip: skip * take,
                    take: take,
                });
                return find;
            }
            catch (error) {
                console.error(error);
                throw new services_error_1.ServiceError("error getting attacheds to slideshow", 400, "SLIDESHOW_ATTACH_ERROR_MANY");
            }
        });
    }
    getAttachesByTypeCount(_a) {
        return __awaiter(this, arguments, void 0, function* ({ slideShowId, type, }) {
            const d = yield this.modelAttachMap(this.prisma)[type].count({});
            return d;
        });
    }
    getAttachesByType(_a) {
        return __awaiter(this, arguments, void 0, function* ({ slideShowId, type, skip, take, }) {
            try {
                const transaction = this.prisma.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                    yield this.findById(slideShowId, tx);
                    return yield this.modelAttachMap(tx)[type].findMany({
                        skip: skip * take,
                        take: take,
                        include: {
                            [type]: true,
                        },
                        orderBy: {
                            order: "asc",
                        },
                    });
                }));
                return transaction;
            }
            catch (error) {
                console.error(error);
                throw new services_error_1.ServiceError("error getting attacheds to slideshow", 400, "SLIDESHOW_ATTACH_ERROR_MANY");
            }
        });
    }
    // ***
    bulkSlideOperations(lang_1, _a) {
        return __awaiter(this, arguments, void 0, function* (lang, { slideShowId, newSlides = [], updateSlides = [], deletedSlides = [], updatedOrder = [], }) {
            try {
                const transaction = yield this.prisma.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                    // Verify slideshow exists
                    const slideShow = yield this.findById(slideShowId, tx);
                    if (!slideShow) {
                        throw new services_error_1.ServiceError(`Slideshow not found with id: ${slideShowId}`, 404, "SLIDESHOW_NOT_FOUND");
                    }
                    const deleted = yield Promise.all(deletedSlides.map((item) => {
                        return this.DeatchWithJoinTableId({
                            tx,
                            type: item.type === "team" ? "teamMember" : item.type,
                            id: item.id,
                            isMany: true,
                            slideShowId: slideShowId,
                        });
                    }));
                    const created = yield Promise.all(newSlides.map((slide) => {
                        return this.attach({
                            slideShowId,
                            attachType: slide.type === "team" ? "teamMember" : slide.type,
                            attachId: slide.id, // Resource ID
                            order: slide.order,
                            isVisible: slide.isVisible,
                            customTitle: slide.customTitle || "",
                            customDesc: slide.customDescription || "",
                            isMany: true,
                            tx,
                            skipOrder: true,
                        });
                    }));
                    // 3. UPDATE SLIDES (metadata only, not order)
                    const updated = yield Promise.all(updateSlides.map((slide) => __awaiter(this, void 0, void 0, function* () {
                        const updateData = {};
                        console.log({
                            slide,
                        }, "customDescription");
                        if (slide.isVisible !== undefined) {
                            updateData.isVisible = slide.isVisible;
                        }
                        // Only services support custom title and description
                        if (slide.type === "service") {
                            if (slide.customTitle !== undefined) {
                                updateData.customTitle = slide.customTitle;
                            }
                            if (slide.customDescription !== undefined) {
                                updateData.customDesc = slide.customDescription;
                            }
                        }
                        const attachType = (slide.type === "team" ? "teamMember" : slide.type);
                        return yield this.modelAttachMap(tx)[attachType].update({
                            where: {
                                id: slide.id,
                            },
                            data: updateData,
                        });
                        // return await (this.modelAttachMap(tx)[slide.type].update as any)({
                        //   where: { id: slide.id },
                        //   data: updateData,
                        // });
                    })));
                    // 4. UPDATE ORDER (separate from metadata updates)
                    const reordered = yield Promise.all(updatedOrder.map((slide) => __awaiter(this, void 0, void 0, function* () {
                        const attachType = (slide.type === "team" ? "teamMember" : slide.type);
                        return yield this.modelAttachMap(tx)[attachType].update({
                            where: {
                                id: slide.id,
                            },
                            data: {
                                order: slide.order,
                            },
                        });
                    })));
                    return {
                        slideShow,
                        created,
                        updated,
                        deleted,
                        reordered: reordered,
                    };
                }), {
                    timeout: 120000,
                    maxWait: 120000,
                });
                return transaction;
            }
            catch (error) {
                console.error("Bulk slide operations error:", error);
                if (error instanceof services_error_1.ServiceError) {
                    throw error;
                }
                throw new services_error_1.ServiceError("Error performing bulk slide operations", 400, "BULK_SLIDE_OPERATIONS_ERROR");
            }
        });
    }
}
exports.slideShowRepository = slideShowRepository;
