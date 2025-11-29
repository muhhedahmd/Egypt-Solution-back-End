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
    constructor(prisma // private service : ServicesRepository
    ) {
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
    findById(id, prismaTouse) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const find = yield (prismaTouse || this.prisma).slideShow.findUnique({
                    where: {
                        id,
                    },
                });
                return find;
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
    findAttachTable(id, attachType, prismaTouse
    // modelMap: modelMap
    ) {
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
    findMany(_a) {
        return __awaiter(this, arguments, void 0, function* ({ skip, take }) {
            try {
                return yield this.prisma.slideShow.findMany({
                    skip: skip * take,
                    take,
                    orderBy: {
                        order: "asc",
                    },
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
    update(data) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("commingOrder", data.order);
            try {
                const transaction = yield this.prisma.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                    const find = yield this.findById(data.slideShowId, tx);
                    if (!find)
                        throw new services_error_1.ServiceError("slideShow not found id: " + data.slideShowId, 404, "id not found in DB");
                    let slug = find.slug;
                    if (data.title && data.title != find.title) {
                        slug = (0, slugify_1.default)(data.title + (0, crypto_1.randomUUID)().substring(0, 6), {
                            lower: true,
                        });
                    }
                    const isOrderChanged = data.order !== undefined && data.order != find.order;
                    if (isOrderChanged)
                        yield this.reorderUpdate({
                            slideShowUpdate: find,
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
                            title: data.title || find.title,
                            order: data.order === undefined ? find.order : data.order,
                            isActive: data.isActive || find.isActive,
                            description: data.description || find.description,
                            interval: data.interval || find.interval,
                            background: data.background || find.background,
                            autoPlay: data.autoPlay || find.autoPlay,
                        },
                    });
                    return updateSlideShow;
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
                console.log({
                    findOrder,
                });
            }
            catch (error) {
                console.error(error);
                throw new services_error_1.ServiceError("error updating a slideshow Reorder", 400, "SLIDESHOW_UPDATE_ERROR");
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
    getSlidesPaged(slideShowId, opts) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f, _g;
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
                this.prisma.serviceSlideShow.findMany({
                    where: { slideShowId },
                    orderBy: { order: "asc" },
                    skip: svc.skip,
                    take: svc.take,
                    select: {
                        id: true,
                        order: true,
                        customDesc: true,
                        customTitle: true,
                        isVisible: true,
                        service: {
                            select: { id: true, name: true, slug: true, image: true },
                        },
                    },
                }),
                this.prisma.projectSlideShow.findMany({
                    where: { slideShowId },
                    orderBy: { order: "asc" },
                    skip: prj.skip,
                    take: prj.take,
                    select: {
                        id: true,
                        order: true,
                        isVisible: true,
                        project: {
                            select: { id: true, title: true, slug: true, image: true },
                        },
                    },
                }),
                this.prisma.clientSlideShow.findMany({
                    where: { slideShowId },
                    orderBy: { order: "asc" },
                    skip: cli.skip,
                    take: cli.take,
                    select: {
                        id: true,
                        order: true,
                        isVisible: true,
                        client: { select: { id: true, name: true, slug: true, image: true } },
                    },
                }),
                this.prisma.testimonialSlideShow.findMany({
                    where: { slideShowId },
                    orderBy: { order: "asc" },
                    skip: tst.skip,
                    take: tst.take,
                    select: {
                        id: true,
                        order: true,
                        isVisible: true,
                        testimonial: {
                            select: { id: true, clientName: true, content: true, avatar: true },
                        },
                    },
                }),
                this.prisma.teamSlideShow.findMany({
                    where: { slideShowId },
                    orderBy: { order: "asc" },
                    skip: tm.skip,
                    take: tm.take,
                    select: {
                        id: true,
                        order: true,
                        isVisible: true,
                        team: {
                            select: { id: true, name: true, position: true, image: true },
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
            const toSlides = (rows, type, dataKey) => rows.map((r) => ({ type, id: r.id, order: r.order, data: r[dataKey] }));
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
    // async getSlidesPagedFull(
    //   slideShowId: string,
    //   opts?: {
    //     perPage?: number;
    //     page?: number;
    //     pagesPerType?: Partial<
    //       Record<
    //         "services" | "projects" | "clients" | "testimonials" | "team",
    //         number
    //       >
    //     >;
    //   }
    // ) {
    //   await this.findById(slideShowId);
    //   const perPageDefault = Math.min(Math.max(opts?.perPage ?? 10, 1), 100);
    //   const pageDefault = Math.max(opts?.page ?? 1, 1);
    //   const getSkipTake = (page?: number, perPage = perPageDefault) => {
    //     const p = Math.max(page ?? pageDefault, 1);
    //     return { skip: (p - 1) * perPage, take: perPage + 1, page: p, perPage };
    //   };
    //   const svc = getSkipTake(opts?.pagesPerType?.services);
    //   const prj = getSkipTake(opts?.pagesPerType?.projects);
    //   const cli = getSkipTake(opts?.pagesPerType?.clients);
    //   const tst = getSkipTake(opts?.pagesPerType?.testimonials);
    //   const tm = getSkipTake(opts?.pagesPerType?.team);
    //   const [rawSvc, rawPrj, rawCli, rawTst, rawTm] = await Promise.all([
    //     this.prisma.serviceSlideShow.findMany({
    //       where: { slideShowId },
    //       orderBy: { order: "asc" },
    //       skip: svc.skip,
    //       take: svc.take,
    //       select: {
    //         id: true,
    //         order: true,
    //         customDesc: true,
    //         customTitle: true,
    //         isVisible: true,
    //         service: {
    //           select: { id: true, name: true, slug: true, image: true },
    //         },
    //       },
    //     }),
    //     this.prisma.projectSlideShow.findMany({
    //       where: { slideShowId },
    //       orderBy: { order: "asc" },
    //       skip: prj.skip,
    //       take: prj.take,
    //       select: {
    //         id: true,
    //         order: true,
    //         isVisible: true,
    //         project: {
    //           select: { id: true, title: true, slug: true, image: true },
    //         },
    //       },
    //     }),
    //     this.prisma.clientSlideShow.findMany({
    //       where: { slideShowId },
    //       orderBy: { order: "asc" },
    //       skip: cli.skip,
    //       take: cli.take,
    //       select: {
    //         id: true,
    //         order: true,
    //         isVisible: true,
    //         client: { select: { id: true, name: true, slug: true, image: true } },
    //       },
    //     }),
    //     this.prisma.testimonialSlideShow.findMany({
    //       where: { slideShowId },
    //       orderBy: { order: "asc" },
    //       skip: tst.skip,
    //       take: tst.take,
    //       select: {
    //         id: true,
    //         order: true,
    //         isVisible: true,
    //         testimonial: {
    //           select: { id: true, clientName: true, content: true, avatar: true },
    //         },
    //       },
    //     }),
    //     this.prisma.teamSlideShow.findMany({
    //       where: { slideShowId },
    //       orderBy: { order: "asc" },
    //       skip: tm.skip,
    //       take: tm.take,
    //       select: {
    //         id: true,
    //         order: true,
    //         isVisible: true,
    //         team: {
    //           select: { id: true, name: true, position: true, image: true },
    //         },
    //       },
    //     }),
    //   ]);
    //   const process = (arr: any[], perPage: number) => {
    //     const hasMore = arr.length > perPage;
    //     if (hasMore) arr = arr.slice(0, perPage);
    //     return { items: arr, hasMore };
    //   };
    //   const svcPage = process(rawSvc, svc.perPage);
    //   const prjPage = process(rawPrj, prj.perPage);
    //   const cliPage = process(rawCli, cli.perPage);
    //   const tstPage = process(rawTst, tst.perPage);
    //   const tmPage = process(rawTm, tm.perPage);
    //   const toSlides = (rows: any[], type: string, dataKey: string) =>
    //     rows.map((r) => ({ type, id: r.id, order: r.order, data: r[dataKey] }));
    //   const slides = [
    //     ...toSlides(svcPage.items, "service", "service"),
    //     ...toSlides(prjPage.items, "project", "project"),
    //     ...toSlides(cliPage.items, "client", "client"),
    //     ...toSlides(tstPage.items, "testimonial", "testimonial"),
    //     ...toSlides(tmPage.items, "team", "team"),
    //   ].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    //   return {
    //     pages: {
    //       services: {
    //         page: svc.page,
    //         perPage: svc.perPage,
    //         hasMore: svcPage.hasMore,
    //       },
    //       projects: {
    //         page: prj.page,
    //         perPage: prj.perPage,
    //         hasMore: prjPage.hasMore,
    //       },
    //       clients: {
    //         page: cli.page,
    //         perPage: cli.perPage,
    //         hasMore: cliPage.hasMore,
    //       },
    //       testimonials: {
    //         page: tst.page,
    //         perPage: tst.perPage,
    //         hasMore: tstPage.hasMore,
    //       },
    //       team: { page: tm.page, perPage: tm.perPage, hasMore: tmPage.hasMore },
    //     },
    //     slides,
    //     slidesCount: await this.slideShowSlidesCount(slideShowId),
    //   };
    // }
    // attaches
    attach(_a) {
        return __awaiter(this, arguments, void 0, function* ({ slideShowId, attachType, attachId, order, isVisible, customDesc = "", customTitle = "", isMany = false, tx, }) {
            try {
                const prismaTouse = tx || this.prisma;
                if (!isMany)
                    yield this.findById(slideShowId);
                const findAttach = yield this.modelMap(prismaTouse || this.prisma)[attachType].findUnique({
                    where: { id: attachId },
                });
                if (!findAttach) {
                    throw new services_error_1.ServiceError("Attach entity not found id: " + attachId, 404, "id not found in DB");
                }
                const fieldName = `${attachType === "teamMember" ? "team" : attachType}Id`;
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
                let attach;
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
                return attach;
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
    createAndAttachMany(_a) {
        return __awaiter(this, void 0, void 0, function* () {
            var { slides } = _a, rest = __rest(_a, ["slides"]);
            try {
                const transiction = this.prisma.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                    const slug = (0, slugify_1.default)(rest.title + (0, crypto_1.randomUUID)().substring(0, 6), {
                        lower: true,
                    });
                    const slideShow = yield tx.slideShow.create({
                        data: Object.assign(Object.assign({}, rest), { slug }),
                    });
                    const cerated = Promise.all(slides.map((att) => {
                        return this.attach({
                            slideShowId: slideShow.id,
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
                    return { slideShow, attacheds: yield cerated };
                }), {
                    maxWait: 5000,
                    timeout: 10000,
                });
                return transiction;
            }
            catch (error) {
                console.error(error);
                throw new services_error_1.ServiceError("error creating and attaching to slideshow", 400, "SLIDESHOW_CREATE_ATTACH_ERROR_MANY");
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
}
exports.slideShowRepository = slideShowRepository;
