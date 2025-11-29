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
exports.projectRepository = void 0;
const crypto_1 = require("crypto");
const slugify_1 = __importDefault(require("slugify"));
const helpers_1 = require("../../lib/helpers");
const services_error_1 = require("../../errors/services.error");
class projectRepository {
    constructor(prisma // private project : ServicesRepository
    ) {
        this.prisma = prisma;
    }
    // reorder logic
    reorderDelete(_a) {
        return __awaiter(this, arguments, void 0, function* ({ projectDeleted }) {
            try {
                const order = projectDeleted.order;
                const theRest = yield this.prisma.project.findMany({
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
                    return this.prisma.project.update({
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
            catch (error) {
                console.error(error);
                throw new services_error_1.ServiceError("error updating a projects Reorder", 400, "SLIDESHOW_UPDATE_ERROR");
            }
        });
    }
    // reorderUpdate for better that will be a swap
    reorderUpdate(_a) {
        return __awaiter(this, arguments, void 0, function* ({ projectUpdate, orderBeforeUpdate, }) {
            try {
                const order = projectUpdate.order;
                const findOrder = yield this.prisma.project.findFirst({
                    where: {
                        order,
                    },
                });
                if (findOrder) {
                    return this.prisma.project.update({
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
                throw new services_error_1.ServiceError("error updating a projects Reorder", 400, "SLIDESHOW_UPDATE_ERROR");
            }
        });
    }
    findMany(skip, take) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.project.findMany({
                include: {
                    image: true,
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
                skip: skip * take,
                take: take,
            });
        });
    }
    count() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.prisma.project.count();
        });
    }
    findBySlugFull(id, prismaTouse) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const project = yield (prismaTouse || this.prisma).project.findUnique({
                    where: {
                        slug: id,
                    },
                    include: {
                        image: true,
                        technologies: {
                            select: {
                                technology: {
                                    select: {
                                        slug: true,
                                        id: true,
                                        icon: true,
                                        name: true,
                                        category: true,
                                    },
                                },
                            },
                        },
                        services: {
                            include: {
                                image: true,
                            },
                        },
                    },
                });
                if (!project)
                    return null;
                const { image, technologies, services } = project, rest = __rest(project, ["image", "technologies", "services"]);
                return {
                    image,
                    servicesData: services.map((service) => {
                        const { image } = service, rest = __rest(service, ["image"]);
                        return {
                            image: image || null,
                            service: rest,
                        };
                    }),
                    technologies: technologies.map((tech) => tech.technology),
                    project: rest,
                };
            }
            catch (error) {
                console.log(error);
                throw new services_error_1.ServiceError("error finding project by ID", 400, "PROJECT_GET_ERROR");
            }
        });
    }
    findById(id, prismaTouse) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const project = (prismaTouse || this.prisma).project.findUnique({
                    where: { id },
                    include: {
                        image: true,
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
                });
                return project;
            }
            catch (error) {
                console.log(error);
                throw new services_error_1.ServiceError("error finding project by ID", 400, "PROJECT_GET_ERROR");
            }
        });
    }
    create(data, prismaTouse) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const transication = yield this.prisma.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                    const slug = (0, slugify_1.default)(data.title + (0, crypto_1.randomUUID)().substring(0, 8), {
                        lower: true,
                    });
                    if (!slug)
                        throw new Error("error create slug");
                    if (data.image) {
                        const createImage = yield (0, helpers_1.UploadImage)(data.image, data.title);
                        if (!createImage)
                            throw new Error("error upload image");
                        const imageToDB = yield (0, helpers_1.AssignImageToDBImage)({
                            imageType: "PROJECT",
                            blurhash: createImage.blurhash,
                            width: createImage.width,
                            height: createImage.height,
                            data: createImage.data,
                        }, tx);
                        data.imageId = imageToDB.id;
                    }
                    const lastOrder = (yield this.count()) - 1;
                    const findIstheretheOrder = yield tx.project.findFirst({
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
                    const { slug: _slug, image: _image } = data, CerateRest = __rest(data, ["slug", "image"]);
                    const project = yield tx.project.create({
                        data: Object.assign(Object.assign({}, CerateRest), { 
                            // imageId: imageToDB.id || null,
                            order: data.order || 0, slug: slug }),
                        include: {
                            image: true,
                        },
                    });
                    const { image } = project, rest = __rest(project, ["image"]);
                    return { Image: image, project: rest };
                }), {
                    timeout: 20000,
                    maxWait: 5000,
                });
                return transication;
            }
            catch (error) {
                console.log(error);
                throw new services_error_1.ServiceError("error creating a project", 400, "PROJECT_CREATE_ERROR");
            }
        });
    }
    createTransiaction(data, prismaTouse) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const prismaTx = prismaTouse || this.prisma;
                const slug = (0, slugify_1.default)(data.title + (0, crypto_1.randomUUID)().substring(0, 8), {
                    lower: true,
                });
                if (!slug)
                    throw new Error("error create slug");
                if (data.image) {
                    const createImage = yield (0, helpers_1.UploadImage)(data.image, data.title);
                    if (!createImage)
                        throw new Error("error upload image");
                    const imageToDB = yield (0, helpers_1.AssignImageToDBImage)({
                        imageType: "PROJECT",
                        blurhash: createImage.blurhash,
                        width: createImage.width,
                        height: createImage.height,
                        data: createImage.data,
                    }, prismaTx);
                    data.imageId = imageToDB.id;
                }
                const lastOrder = (yield this.count()) - 1;
                const findIstheretheOrder = yield prismaTx.project.findFirst({
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
                const { slug: _slug, image: _image } = data, CerateRest = __rest(data, ["slug", "image"]);
                const project = yield prismaTx.project.create({
                    data: Object.assign(Object.assign({}, CerateRest), { 
                        // imageId: imageToDB.id || null,
                        order: data.order || 0, slug: slug }),
                    include: {
                        image: true,
                    },
                });
                const { image } = project, rest = __rest(project, ["image"]);
                return { Image: image, project: rest };
            }
            catch (error) {
                console.log(error);
                throw new services_error_1.ServiceError("error creating a project", 400, "PROJECT_CREATE_ERROR");
            }
        });
    }
    CreateProjecAndAssignTechnologies(_a) {
        return __awaiter(this, arguments, void 0, function* ({ project, technologies, services, }) {
            const slug = (0, slugify_1.default)(project.title, { lower: true });
            const transaction = yield this.prisma.$transaction((prismaTx) => __awaiter(this, void 0, void 0, function* () {
                const createdProject = yield this.createTransiaction(Object.assign(Object.assign({}, project), { slug }), prismaTx);
                let projectTechnologies = [];
                let projectServices = [];
                if (technologies) {
                    projectTechnologies = yield Promise.all(technologies.map((tech) => __awaiter(this, void 0, void 0, function* () {
                        const Tech = yield prismaTx.projectTechnology.create({
                            data: {
                                projectId: createdProject.project.id,
                                technologyId: tech,
                            },
                            select: {
                                technology: true,
                            },
                        });
                        return Tech.technology;
                    })));
                }
                if (services) {
                    projectServices = yield Promise.all(services.flatMap((service, idx) => __awaiter(this, void 0, void 0, function* () {
                        const serviceTech = yield prismaTx.project.update({
                            where: {
                                id: createdProject.project.id,
                            },
                            data: {
                                services: {
                                    connect: {
                                        id: service,
                                    },
                                },
                            },
                            select: {
                                services: true,
                            },
                        });
                        return serviceTech.services.filter((s, index) => s.id === service)[0];
                    })));
                }
                return { createdProject, projectTechnologies, projectServices };
            }), {
                timeout: 20000,
                maxWait: 5000,
            });
            return transaction;
        });
    }
    update(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const transaction = yield this.prisma.$transaction((prismaTx) => __awaiter(this, void 0, void 0, function* () {
                    let NewImageId = null;
                    if (!data.id)
                        throw new Error("no serviceId provided");
                    const project = yield this.findById(data.id, prismaTx);
                    if (!project)
                        throw new Error("project not found");
                    NewImageId = (project === null || project === void 0 ? void 0 : project.imageId) || null;
                    if (data.imageState === "REMOVE") {
                        if (project.imageId) {
                            yield prismaTx.project.update({
                                where: { id: data.id },
                                data: { imageId: null },
                            });
                            yield (0, helpers_1.deleteImageById)(project.imageId, prismaTx);
                        }
                        NewImageId = null;
                    }
                    if (data.imageState === "UPDATE") {
                        if (project.imageId) {
                            yield prismaTx.project.update({
                                where: { id: data.id },
                                data: { imageId: null },
                            });
                            yield (0, helpers_1.deleteImageById)(project.imageId, prismaTx);
                        }
                        if (!data.image)
                            throw new Error("no image provided");
                        const createImage = yield (0, helpers_1.UploadImage)(data.image, data.title || "update");
                        if (!createImage)
                            throw new Error("error upload image");
                        const imageToDB = yield (0, helpers_1.AssignImageToDBImage)({
                            imageType: "PROJECT",
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
                    if (data.title && data.title !== project.title) {
                        const slug = (0, slugify_1.default)(data.title + (0, crypto_1.randomUUID)().substring(0, 8), {
                            lower: true,
                        });
                        data.slug = slug;
                    }
                    // console.log("project ID:", data.serviceId, NewImageId);
                    const isOrderChanged = data.order !== undefined && data.order != project.order;
                    if (isOrderChanged)
                        yield this.reorderUpdate({
                            projectUpdate: project,
                            orderBeforeUpdate: project.order,
                        });
                    // Update the project with new data
                    const updatedService = yield prismaTx.project.update({
                        where: { id: data.id },
                        data: {
                            slug: data.slug || project.slug,
                            title: data.title || project.title,
                            description: data.description || project.description,
                            richDescription: data.richDescription || project.richDescription,
                            imageId: NewImageId,
                            clientName: data.clientName || project.clientName || "",
                            clientCompany: data.clientCompany || project.clientCompany || "",
                            status: data.status || project.status || false,
                            startDate: data.startDate || project.startDate || new Date(),
                            endDate: data.endDate || project.endDate || new Date(),
                            isFeatured: data.isFeatured || project.isFeatured || false,
                            order: data.order || project.order || 0,
                        },
                        include: { image: true },
                    });
                    const { image } = updatedService, rest = __rest(updatedService, ["image"]);
                    return { Image: image, project: rest };
                }), {
                    timeout: 20000,
                    maxWait: 5000,
                });
                return transaction;
            }
            catch (error) {
                console.log(error);
                throw new Error("Error updating project");
            }
        });
    }
    delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const transaction = yield this.prisma.$transaction((prismaTx) => __awaiter(this, void 0, void 0, function* () {
                    const project = yield prismaTx.project.findUnique({ where: { id } });
                    if (!project)
                        throw new Error("project not found");
                    yield prismaTx.project.update({
                        where: { id },
                        data: { imageId: null },
                    });
                    if (project.imageId)
                        yield (0, helpers_1.deleteImageById)(project.imageId, prismaTx);
                    const projectDeleted = yield prismaTx.project.delete({
                        where: { id },
                    });
                    yield this.reorderDelete({ projectDeleted });
                    return project;
                }), {
                    timeout: 20000,
                    maxWait: 5000,
                });
                return transaction;
            }
            catch (error) {
                console.log(error);
                throw new Error("Error deleting project");
            }
        });
    }
    findTechById(id, tx) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const technology = yield (tx || this.prisma).technology.findUnique({
                    where: { id },
                });
                return technology;
            }
            catch (error) {
                if ((error === null || error === void 0 ? void 0 : error.code) === "P2025") {
                    throw new services_error_1.ServiceError(" technology not found", 404, "TECHNOLOGY_GET_ERROR");
                }
                console.log(error);
                throw new services_error_1.ServiceError("error finding technology by ID", 400, "TECHNOLOGY_GET_ERROR");
            }
        });
    }
    countTechnologies() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this.prisma.technology.count();
            }
            catch (error) {
                console.error(error);
                throw new services_error_1.ServiceError("Error counting technologies", 400, "TECHNOLOGY_COUNT_ERROR");
            }
        });
    }
    findManyTechnologies(skip, take) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this.prisma.technology.findMany({
                    skip: skip * take,
                    take,
                    orderBy: {
                        name: "asc",
                    },
                    include: {
                        _count: {
                            select: {
                                projects: true,
                            },
                        },
                    },
                });
            }
            catch (error) {
                console.error(error);
                throw new services_error_1.ServiceError("Error finding technologies", 400, "TECHNOLOGY_GET_ERROR");
            }
        });
    }
    createTechnology(data, tx) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                const slug = (0, slugify_1.default)(data.name + (0, crypto_1.randomUUID)().substring(0, 8), {
                    lower: true,
                });
                const pxToUse = tx ? tx : this.prisma;
                let icon = "";
                if (data.icon)
                    icon = yield (0, helpers_1.UploadImageWithoutBlurHAsh)(data.icon, slug);
                const technology = yield pxToUse.technology.create({
                    data: {
                        name: data.name,
                        icon: ((_b = (_a = icon === null || icon === void 0 ? void 0 : icon.data) === null || _a === void 0 ? void 0 : _a[0].data) === null || _b === void 0 ? void 0 : _b.ufsUrl) || "",
                        category: data.category || "",
                        slug,
                    },
                });
                return technology;
            }
            catch (error) {
                console.log(error);
                throw new services_error_1.ServiceError("error creating technology", 400, "TECHNOLOGY_CREATE_ERROR");
            }
        });
    }
    updateTechnology(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const technology = yield this.prisma.technology.update({
                    where: { id },
                    data: {
                        name: data.name,
                        // icon: data.icon,
                        category: data.category,
                    },
                });
                return technology;
            }
            catch (error) {
                if (error.code === "P2025") {
                    throw new services_error_1.ServiceError("Technology not found", 404, "TECHNOLOGY_NOT_FOUND");
                }
                console.error(error);
                throw new services_error_1.ServiceError("Error updating technology", 400, "TECHNOLOGY_UPDATE_ERROR");
            }
        });
    }
    deleteTechnology(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.prisma.projectTechnology.deleteMany({
                    where: { technologyId: id },
                });
                const technology = yield this.prisma.technology.delete({
                    where: { id },
                });
                return technology;
            }
            catch (error) {
                if (error.code === "P2025") {
                    throw new services_error_1.ServiceError("Technology not found", 404, "TECHNOLOGY_NOT_FOUND");
                }
                console.error(error);
                throw new services_error_1.ServiceError("Error deleting technology", 400, "TECHNOLOGY_DELETE_ERROR");
            }
        });
    }
    assignProjectToTechnolgy(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const transaction = yield this.prisma.$transaction((prismaTx) => __awaiter(this, void 0, void 0, function* () {
                    const promises = yield Promise.all(data.map((data) => __awaiter(this, void 0, void 0, function* () {
                        yield this.findById(data.projectId, prismaTx);
                        yield this.findTechById(data.technologyId, prismaTx);
                        console.log({ data });
                        const projectTechnology = yield prismaTx.projectTechnology.create({
                            data: {
                                projectId: data.projectId,
                                technologyId: data.technologyId,
                            },
                            include: { project: true, technology: true },
                        });
                        return projectTechnology;
                    })));
                    return promises;
                }), {
                    timeout: 20000,
                    maxWait: 5000,
                });
                return transaction;
            }
            catch (error) {
                console.log(error);
                throw new services_error_1.ServiceError("error assign project to technology", 400, "ASSIGN_PROJECT_TO_TECHNOLOGY_ERROR");
            }
        });
    }
    removeProjectToTechnolgy(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const transaction = yield this.prisma.$transaction((prismaTx) => __awaiter(this, void 0, void 0, function* () {
                    const promises = yield Promise.all(data.map((data) => __awaiter(this, void 0, void 0, function* () {
                        yield this.findById(data.projectId, prismaTx);
                        yield this.findTechById(data.technologyId, prismaTx);
                        const projectTechnology = yield prismaTx.projectTechnology.delete({
                            where: {
                                projectId_technologyId: {
                                    projectId: data.projectId,
                                    technologyId: data.technologyId,
                                },
                            },
                        });
                        return projectTechnology;
                    })));
                    return promises;
                }), {
                    timeout: 20000,
                    maxWait: 5000,
                });
                return transaction;
            }
            catch (error) {
                console.log(error);
                throw new services_error_1.ServiceError("error remove project to technology", 400, "REMOVE_PROJECT_TO_TECHNOLOGY_ERROR");
            }
        });
    }
    createTechnologyAndProject(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const transaction = yield this.prisma.$transaction((prismaTx) => __awaiter(this, void 0, void 0, function* () {
                    const technology = yield this.createTechnology({
                        icon: data.CreateTechnology.icon || null,
                        name: data.CreateTechnology.name,
                        category: data.CreateTechnology.category,
                    }, prismaTx);
                    const projectIds = (yield Promise.all(data.CreateProject.map((project) => this.create(project, prismaTx)))).map((project) => project.project.id);
                    console.log(projectIds, technology.id);
                    const dataToAssign = projectIds.map((projectId) => ({
                        projectId,
                        technologyId: technology.id,
                    }));
                    const projectWithTechnology = yield Promise.all(dataToAssign.map((data) => __awaiter(this, void 0, void 0, function* () {
                        yield this.findById(data.projectId, prismaTx);
                        yield this.findTechById(data.technologyId, prismaTx);
                        const projectTechnology = yield prismaTx.projectTechnology.create({
                            data: {
                                projectId: data.projectId,
                                technologyId: data.technologyId,
                            },
                            include: { project: true, technology: true },
                        });
                        return projectTechnology;
                    })));
                    return { technology, projectWithTechnology };
                }), {
                    timeout: 20000,
                    maxWait: 5000,
                });
                const result = transaction.projectWithTechnology.map((projectWithTechnology) => {
                    return projectWithTechnology.project;
                    // technology: projectWithTechnology.technology,
                });
                return { technology: transaction.technology, projects: Object.assign({}, result) };
            }
            catch (error) {
                console.log(error);
                throw new services_error_1.ServiceError("error creating technology and project", 400, "TECHNOLOGY_CREATE_ERROR");
            }
        });
    }
    createProjectAndTechnologies(_a) {
        return __awaiter(this, arguments, void 0, function* ({ project, technologies, }) {
            try {
                const transaction = yield this.prisma.$transaction((prismaTx) => __awaiter(this, void 0, void 0, function* () {
                    const createdProject = yield this.create(project, prismaTx);
                    const createdTechnologies = yield Promise.all(technologies.map((tech) => this.createTechnology(tech, prismaTx)));
                    const projectTechnologies = yield Promise.all(createdTechnologies.map((tech) => __awaiter(this, void 0, void 0, function* () {
                        return yield prismaTx.projectTechnology.create({
                            data: {
                                projectId: createdProject.project.id,
                                technologyId: tech.id,
                            },
                        });
                    })));
                    return { createdProject, createdTechnologies };
                }), {
                    timeout: 20000,
                    maxWait: 5000,
                });
                return transaction;
            }
            catch (error) {
                console.log(error);
                throw new services_error_1.ServiceError("error creating project and technologies", 400, "PROJECT_CREATE_ERROR");
            }
        });
    }
    findTechnologiesByProject(projectId, skip, take) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const technologies = yield this.prisma.projectTechnology.findMany({
                    where: { projectId },
                    skip,
                    take,
                    include: { technology: true },
                });
                return technologies;
            }
            catch (error) {
                console.log(error);
                throw new services_error_1.ServiceError("error finding technologies by project", 400, "TECHNOLOGY_GET_ERROR");
            }
        });
    }
    findTechnologiesByProjectCount(projectId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const technologies = yield this.prisma.projectTechnology.count({
                    where: { projectId },
                });
                return technologies;
            }
            catch (error) {
                console.log(error);
                throw new services_error_1.ServiceError("error finding technologies by project", 400, "TECHNOLOGY_GET_ERROR");
            }
        });
    }
    findProjectsByTechnology(technologyId, skip, take) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const projects = yield this.prisma.projectTechnology.findMany({
                    where: { technologyId },
                    skip,
                    take,
                    include: { project: true },
                });
                return projects;
            }
            catch (error) {
                console.log(error);
                throw new services_error_1.ServiceError("error finding projects by technology", 400, "PROJECT_GET_ERROR");
            }
        });
    }
    findProjectsByTechnologyCount(technologyId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const count = yield this.prisma.projectTechnology.count({
                    where: { technologyId },
                });
                return count;
            }
            catch (error) {
                console.log(error);
                throw new services_error_1.ServiceError("error finding projects by technology count", 400, "PROJECT_GET_ERROR");
            }
        });
    }
    searchProjects(searchTerm, skip, take) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const find = yield this.prisma.project.findMany({
                    where: {
                        OR: [
                            {
                                title: {
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
                                clientName: {
                                    contains: searchTerm,
                                    mode: "insensitive",
                                },
                            },
                            {
                                clientCompany: {
                                    contains: searchTerm,
                                    mode: "insensitive",
                                },
                            },
                        ],
                    },
                    include: {
                        image: true,
                        technologies: {
                            include: {
                                technology: true,
                            },
                        },
                    },
                    skip: skip * take,
                    take,
                    orderBy: {
                        createdAt: "desc",
                    },
                });
                if (!find) {
                    throw new services_error_1.ServiceError("No projects found", 400, "PROJECT_SEARCH_ERROR");
                }
                const projects = find.map((project) => {
                    const { image, technologies } = project, rest = __rest(project, ["image", "technologies"]);
                    return {
                        project: rest,
                        image,
                        technologies: (technologies === null || technologies === void 0 ? void 0 : technologies.map((item) => {
                            return {
                                id: item.technology.id,
                                slug: item.technology.slug,
                                icon: item.technology.icon,
                                name: item.technology.name,
                                category: item.technology.category,
                            };
                        })) || [],
                    };
                });
                return projects;
            }
            catch (error) {
                console.error(error);
                throw new services_error_1.ServiceError("Error searching projects", 400, "PROJECT_SEARCH_ERROR");
            }
        });
    }
    countSearchResults(searchTerm) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this.prisma.project.count({
                    where: {
                        OR: [
                            {
                                title: {
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
                                clientName: {
                                    contains: searchTerm,
                                    mode: "insensitive",
                                },
                            },
                            {
                                clientCompany: {
                                    contains: searchTerm,
                                    mode: "insensitive",
                                },
                            },
                        ],
                    },
                    orderBy: {
                        createdAt: "desc",
                    },
                });
            }
            catch (error) {
                console.error(error);
                throw new services_error_1.ServiceError("Error counting featured projects", 400, "PROJECT_COUNT_ERROR");
            }
        });
    }
    searchTechnologies(searchTerm, skip, take) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this.prisma.technology.findMany({
                    where: {
                        name: {
                            contains: searchTerm,
                            mode: "insensitive",
                        },
                    },
                    skip: skip * take,
                    take,
                    orderBy: {
                        name: "asc",
                    },
                });
            }
            catch (error) {
                console.error(error);
                throw new services_error_1.ServiceError("Error searching technologies", 400, "TECHNOLOGY_SEARCH_ERROR");
            }
        });
    }
    countSearchResultsTech(searchTerm) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this.prisma.technology.count({
                    where: {
                        name: {
                            contains: searchTerm,
                            mode: "insensitive",
                        },
                    },
                });
            }
            catch (error) {
                console.error(error);
                throw new services_error_1.ServiceError("Error counting search results", 400, "TECHNOLOGY_COUNT_ERROR");
            }
        });
    }
    getFeaturedProjects(skip, take) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this.prisma.project.findMany({
                    where: {
                        isFeatured: true,
                    },
                    include: {
                        image: true,
                        technologies: {
                            include: {
                                technology: true,
                            },
                        },
                    },
                    skip: skip * take,
                    take,
                    orderBy: {
                        order: "asc",
                    },
                });
            }
            catch (error) {
                console.error(error);
                throw new services_error_1.ServiceError("Error getting featured projects", 400, "PROJECT_GET_ERROR");
            }
        });
    }
    countFeaturedProjects() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this.prisma.project.count({
                    where: {
                        isFeatured: true,
                    },
                });
            }
            catch (error) {
                console.error(error);
                throw new services_error_1.ServiceError("Error counting featured projects", 400, "PROJECT_COUNT_ERROR");
            }
        });
    }
    countProjectsByStatus(status) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this.prisma.project.count({
                    where: {
                        status,
                    },
                });
            }
            catch (error) {
                console.error(error);
                throw new services_error_1.ServiceError("Error counting projects by status", 400, "PROJECT_COUNT_ERROR");
            }
        });
    }
    getProjectsByStatus(status, skip, take) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this.prisma.project.findMany({
                    where: {
                        status,
                    },
                    include: {
                        image: true,
                        technologies: {
                            include: {
                                technology: true,
                            },
                        },
                    },
                    skip: skip * take,
                    take,
                    orderBy: {
                        createdAt: "desc",
                    },
                });
            }
            catch (error) {
                console.error(error);
                throw new services_error_1.ServiceError("Error getting projects by status", 400, "PROJECT_GET_ERROR");
            }
        });
    }
    getTechnologiesByCategory(category, skip, take) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this.prisma.technology.findMany({
                    where: {
                        category: {
                            equals: category,
                            mode: "insensitive",
                        },
                    },
                    include: {
                        _count: {
                            select: {
                                projects: true,
                            },
                        },
                    },
                    skip: skip * take,
                    take,
                    orderBy: {
                        name: "asc",
                    },
                });
            }
            catch (error) {
                console.error(error);
                throw new services_error_1.ServiceError("Error getting technologies by category", 400, "TECHNOLOGY_GET_ERROR");
            }
        });
    }
    countTechnologiesByCategory(category) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this.prisma.technology.count({
                    where: {
                        category: {
                            equals: category,
                            mode: "insensitive",
                        },
                    },
                });
            }
            catch (error) {
                console.error(error);
                throw new services_error_1.ServiceError("Error getting technologies count by category", 400, "TECHNOLOGY_GET_ERROR");
            }
        });
    }
    getAllCategories(_a) {
        return __awaiter(this, arguments, void 0, function* ({ skip, take, }) {
            try {
                const technologies = yield this.prisma.technology.findMany({
                    select: {
                        category: true,
                    },
                    distinct: ["category"],
                    where: {
                        AND: [
                            {
                                category: {
                                    not: null,
                                },
                            },
                            {
                                category: {
                                    not: "",
                                },
                            },
                        ],
                    },
                    skip: skip * take,
                    take,
                    orderBy: {
                        name: "asc",
                    },
                });
                return technologies
                    .map((t) => t.category)
                    .filter((c) => c !== null);
            }
            catch (error) {
                console.error(error);
                throw new services_error_1.ServiceError("Error getting categories", 400, "TECHNOLOGY_GET_ERROR");
            }
        });
    }
    getCountCategories() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this.prisma.technology.count({
                    where: {
                        AND: [
                            {
                                category: {
                                    not: null,
                                },
                            },
                            {
                                category: {
                                    not: "",
                                },
                            },
                        ],
                    },
                });
            }
            catch (error) {
                console.error(error);
                throw new services_error_1.ServiceError("Error getting categories", 400, "TECHNOLOGY_GET_ERROR");
            }
        });
    }
}
exports.projectRepository = projectRepository;
