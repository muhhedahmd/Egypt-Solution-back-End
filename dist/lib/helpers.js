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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteImageById = exports.getImageById = exports.AssignImageToDBImage = exports.UploadImageWithoutBlurHAsh = exports.UploadImage = void 0;
exports.generateBlurhash_with_size = generateBlurhash_with_size;
const blurhash_1 = require("blurhash");
const sharp_1 = __importDefault(require("sharp"));
const server_1 = require("uploadthing/server");
const prisma_1 = __importDefault(require("../config/prisma"));
const utapi = new server_1.UTApi();
function generateBlurhash_with_size(buffer) {
    return __awaiter(this, void 0, void 0, function* () {
        const { data, info } = yield (0, sharp_1.default)(buffer)
            .raw()
            .ensureAlpha()
            .resize(32, 32, { fit: "inside" })
            .toBuffer({ resolveWithObject: true });
        return {
            width: info.width,
            height: info.height,
            blurHash: (0, blurhash_1.encode)(new Uint8ClampedArray(data), info.width, info.height, 4, 4),
        };
    });
}
const UploadImage = (logo, name) => __awaiter(void 0, void 0, void 0, function* () {
    let logoUpload = null;
    if (logo) {
        try {
            // Generate blur hash and get dimensions
            const buffer = Buffer.from(logo);
            const blurHashAndSize = yield generateBlurhash_with_size(buffer);
            //   const arrayBuffer = await logo .buffer;
            // Create File object for UploadThing
            const logoBlob = new Blob([buffer], { type: "image/jpeg" });
            const logoFile = new File([logoBlob], name || "logo.jpg", {
                type: "image/jpeg",
            });
            // Upload to UploadThing
            const uploadResult = yield utapi.uploadFiles([logoFile]);
            logoUpload = {
                blurhash: blurHashAndSize.blurHash,
                height: blurHashAndSize.height,
                width: blurHashAndSize.width,
                data: uploadResult,
            };
            return logoUpload;
        }
        catch (uploadError) {
            console.error("Logo upload failed:", uploadError);
        }
    }
});
exports.UploadImage = UploadImage;
const UploadImageWithoutBlurHAsh = (logo, name) => __awaiter(void 0, void 0, void 0, function* () {
    let logoUpload = null;
    if (logo) {
        try {
            // Generate blur hash and get dimensions
            const buffer = Buffer.from(logo);
            //   const arrayBuffer = await logo .buffer;
            // Create File object for UploadThing
            const logoBlob = new Blob([buffer], { type: "image/jpeg" });
            const logoFile = new File([logoBlob], name || "logo.jpg", {
                type: "image/jpeg",
            });
            // Upload to UploadThing
            const uploadResult = yield utapi.uploadFiles([logoFile]);
            logoUpload = {
                data: uploadResult,
            };
            return logoUpload;
        }
        catch (uploadError) {
            console.error("Logo upload failed:", uploadError);
        }
    }
});
exports.UploadImageWithoutBlurHAsh = UploadImageWithoutBlurHAsh;
const AssignImageToDBImage = (data, txInstance) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g;
    if (!data)
        throw new Error("image Data error");
    const prismaTx = txInstance || prisma_1.default;
    try {
        if (!((_a = data.data) === null || _a === void 0 ? void 0 : _a[0].data))
            throw new Error("error upload Image");
        else {
            if (!txInstance) {
                const imageUploaded = (_b = data.data) === null || _b === void 0 ? void 0 : _b[0].data;
                const tx = yield prisma_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
                    var _a, _b, _c;
                    try {
                        const image = yield tx.image.create({
                            data: {
                                fileHash: imageUploaded.fileHash,
                                key: imageUploaded.key,
                                type: imageUploaded.type,
                                alt: imageUploaded.name + "-alt",
                                customId: imageUploaded.customId,
                                filename: imageUploaded.name,
                                url: imageUploaded.ufsUrl,
                                blurHash: data.blurhash,
                                height: data.height,
                                width: data.width,
                                imageType: data.imageType,
                                size: imageUploaded.size,
                            },
                            select: {
                                id: true,
                                imageType: true,
                            },
                        });
                        return image;
                    }
                    catch (error) {
                        if ((_b = (_a = data.data) === null || _a === void 0 ? void 0 : _a[0].data) === null || _b === void 0 ? void 0 : _b.key)
                            utapi.deleteFiles((_c = data.data) === null || _c === void 0 ? void 0 : _c[0].data.key);
                        console.log(error);
                        throw new Error("transiction Error");
                    }
                }));
                return tx;
            }
            else {
                if (!((_c = data.data) === null || _c === void 0 ? void 0 : _c[0].data))
                    throw new Error("error upload Image");
                const imageUploaded = (_d = data.data) === null || _d === void 0 ? void 0 : _d[0].data;
                try {
                    const image = yield prismaTx.image.create({
                        data: {
                            type: imageUploaded.type,
                            imageType: data.imageType,
                            fileHash: imageUploaded.fileHash,
                            key: imageUploaded.key,
                            alt: imageUploaded.name + "-alt",
                            customId: imageUploaded.customId,
                            filename: imageUploaded.name,
                            url: imageUploaded.ufsUrl,
                            blurHash: data.blurhash,
                            height: data.height,
                            width: data.width,
                            size: imageUploaded.size,
                        },
                        select: {
                            id: true,
                            imageType: true,
                        },
                    });
                    return image;
                }
                catch (error) {
                    if ((_f = (_e = data.data) === null || _e === void 0 ? void 0 : _e[0].data) === null || _f === void 0 ? void 0 : _f.key)
                        utapi.deleteFiles((_g = data.data) === null || _g === void 0 ? void 0 : _g[0].data.key);
                    console.log(error);
                    throw new Error("transiction Error");
                }
            }
        }
    }
    catch (error) {
        console.log(error);
        throw new Error("error insert to db");
    }
});
exports.AssignImageToDBImage = AssignImageToDBImage;
const getImageById = (_a) => __awaiter(void 0, [_a], void 0, function* ({ imageId }) {
    try {
        const image = yield prisma_1.default.image.findUnique({
            where: {
                id: imageId,
            },
        });
        return image;
    }
    catch (error) {
        console.log(error);
        throw new Error("error get image");
    }
});
exports.getImageById = getImageById;
const deleteImageById = (id, txInstance) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const prismaToUse = txInstance !== null && txInstance !== void 0 ? txInstance : prisma_1.default;
        console.log("Deleting image with ID:", id, "using txInstance:", !!txInstance);
        const image = yield prismaToUse.image.findUnique({
            where: { id },
        });
        if (!image)
            throw new Error("image not found");
        const deletedImage = yield prismaToUse.image.delete({
            where: { id },
        });
        if (deletedImage.key)
            yield utapi.deleteFiles(deletedImage.key);
        console.log("Deleted image:", deletedImage);
        return deletedImage;
    }
    catch (error) {
        console.log(error);
        throw new Error("error delete image");
    }
});
exports.deleteImageById = deleteImageById;
