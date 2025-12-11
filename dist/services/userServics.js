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
exports.userService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const prisma_1 = __importDefault(require("../config/prisma"));
const user_schema_1 = require("../validtation/user-schema");
// import { supabaseAdmin, supabaseClient } from "../config/supabase";
const helpers_1 = require("../lib/helpers");
const server_1 = require("uploadthing/server");
// import { throwDeprecation } from "process";
const utapi = new server_1.UTApi();
class userService {
    static create(_a) {
        return __awaiter(this, arguments, void 0, function* ({ name, email, password, role = "ADMIN", gender = "MALE", }) {
            try {
                if (!name || !email || !password) {
                    return "All fields are required";
                }
                // console.log("email", email)
                if (yield prisma_1.default.user.findUnique({
                    where: {
                        email: email,
                    },
                })) {
                    throw new Error("Email already exists");
                }
                const parsed = user_schema_1.userRegisterSchema.safeParse({
                    name,
                    email,
                    password,
                    role,
                });
                if (!parsed.success) {
                    return parsed.error.message;
                }
                const hashedpassword = yield bcryptjs_1.default.hash(password, 10);
                const createUser = prisma_1.default.user.create({
                    data: {
                        gender,
                        name: name,
                        email: email,
                        password: hashedpassword,
                        role: role,
                        profile: {
                            create: {},
                        },
                    },
                    omit: {
                        password: true,
                    },
                });
                return Object.assign(Object.assign({}, createUser), { password: "_" });
            }
            catch (error) {
                console.log(error);
                throw new Error(error);
            }
        });
    }
    static login(_a) {
        return __awaiter(this, arguments, void 0, function* ({ email, password }) {
            try {
                if (!email || !password) {
                    return "All fields are required";
                }
                const finduser = yield prisma_1.default.user.findUnique({
                    where: {
                        email: email,
                    },
                });
                if (!finduser) {
                    return "User not found";
                }
                const isPasswordCorrect = yield bcryptjs_1.default.compare(password, finduser.password);
                if (!isPasswordCorrect) {
                    return "Incorrect password";
                }
                const findProfile = yield prisma_1.default.profile.findUnique({
                    where: {
                        userId: finduser.id,
                    },
                    select: {
                        id: true,
                        isProfileComplete: true,
                    },
                });
                return Object.assign(Object.assign({}, finduser), { profileId: findProfile === null || findProfile === void 0 ? void 0 : findProfile.id, isProfileComplete: findProfile === null || findProfile === void 0 ? void 0 : findProfile.isProfileComplete, password: "_" });
            }
            catch (error) {
                console.log(error);
                return null;
            }
        });
    }
    static sendOTP(_a) {
        return __awaiter(this, arguments, void 0, function* ({ Method, userId, }) {
            try {
                if (!userId)
                    return { success: false, error: "User not found" };
                const user = yield prisma_1.default.user.findUnique({
                    where: { id: userId },
                    select: {
                        email: true,
                        profile: {
                            select: { phone: true },
                        },
                    },
                });
                // console.log("User found:", user)
                if (!user)
                    return { success: false, error: "User not found" };
                // if (Method === "email") {
                //     if (!user.email) return { success: false, error: "Email not found" }
                //     // console.log("Sending OTP to email:", user.email)
                //     // Add timeout wrapper
                //     const otpPromise = await supabaseAdmin.auth.signInWithOtp({
                //         email: user.email, // Fixed: use user.email instead of userId
                //         options: {
                //             emailRedirectTo: `${process.env.FRONTEND_URL}/auth/callback`,
                //             // shouldCreateUser: false
                //         }
                //     })
                //     // console.log("OTP response:", otpPromise)
                //     return { success: true, data: otpPromise }
                // }
                // if (Method === "phone" && user.profile?.phone) {
                //     // console.log("Sending OTP to phone:", user.profile.phone)
                //     const otpPromise = await supabaseAdmin.auth.signInWithOtp({
                //         phone: user.profile.phone,
                //         options: {
                //             emailRedirectTo: `${process.env.FRONTEND_URL}/auth/callback`,
                //             shouldCreateUser: false
                //         }
                //     })
                //     // console.log("OTP response:", otpPromise)
                //     return { success: true, data: otpPromise }
                // }
                return {
                    success: false,
                    error: "Invalid method or missing contact info",
                };
            }
            catch (error) {
                console.error("SendOTP Error:", error);
                return { success: false, error: error || "Failed to send OTP" };
            }
        });
    }
    static verifyOtp(otp, Method, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                if (!userId)
                    return "User not found";
                const user = yield prisma_1.default.user.findUnique({
                    where: {
                        id: userId,
                    },
                    select: {
                        email: true,
                        profile: {
                            select: {
                                phone: true,
                            },
                        },
                    },
                });
                if (!user)
                    return "User not found";
                if (user.email === null && Method === "email")
                    return "Email not found";
                if (((_a = user.profile) === null || _a === void 0 ? void 0 : _a.phone) === null && Method === "phone")
                    return "Phone not found";
                // if (Method === "phone") {
                //     const session = await supabaseClient.auth.verifyOtp({
                //         phone: user.profile?.phone ?? "",
                //         token: otp,
                //         type: "sms",
                //     })
                //     return session
                // }
                // if (Method === "email") {
                //     const session = await supabaseClient.auth.verifyOtp({
                //         email: user.email,
                //         token: otp,
                //         type: "email",
                //     })
                //     return session
                // }
            }
            catch (error) {
                console.log(error);
                return null;
            }
        });
    }
    static syncUser(_a) {
        return __awaiter(this, arguments, void 0, function* ({ supabaseUserId, email, emailVerficatiion, provider, }) {
            try {
                return yield prisma_1.default.user.update({
                    where: {
                        email,
                    },
                    data: {
                        email,
                        emailConfirmed: emailVerficatiion,
                    },
                });
            }
            catch (error) {
                console.log(error);
            }
        });
    }
    static getUser(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!userId)
                    return "User not found";
                return yield prisma_1.default.user.findUnique({
                    where: {
                        id: userId,
                    },
                    omit: {
                        password: true,
                    },
                });
            }
            catch (error) {
                console.log(error);
                return "User not found";
            }
        });
    }
    static CreateProfile(_a) {
        return __awaiter(this, arguments, void 0, function* ({ userId, RemoveAvatar, phone, dateOfBirth, bio, avatar, }) {
            if (!userId)
                throw new Error("userId not found");
            try {
                const findUser = yield prisma_1.default.user.findUnique({
                    where: {
                        id: userId,
                    },
                    select: {
                        id: true,
                        profile: {
                            include: {
                                avatar: {
                                    select: {
                                        id: true,
                                        key: true,
                                    },
                                },
                            },
                        },
                    },
                });
                if (!findUser)
                    throw new Error("user not found");
                let imageUpload;
                const transaction = yield prisma_1.default.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                    var _a, _b, _c, _d, _e, _f;
                    try {
                        // if there no profile
                        if (!((_a = findUser.profile) === null || _a === void 0 ? void 0 : _a.id)) {
                            let createProfile = yield tx.profile.create({
                                data: {
                                    bio,
                                    phone,
                                    dateOfBirth,
                                    isProfileComplete: true,
                                    userId: findUser.id,
                                },
                            });
                            if (avatar) {
                                imageUpload = yield (0, helpers_1.UploadImage)(avatar);
                                if (!imageUpload)
                                    throw new Error("Error processing Avatar");
                                const insert = yield (0, helpers_1.AssignImageToDBImage)({
                                    blurhash: imageUpload === null || imageUpload === void 0 ? void 0 : imageUpload.blurhash,
                                    data: imageUpload === null || imageUpload === void 0 ? void 0 : imageUpload.data,
                                    height: imageUpload === null || imageUpload === void 0 ? void 0 : imageUpload.height,
                                    width: imageUpload === null || imageUpload === void 0 ? void 0 : imageUpload.width,
                                    imageType: "PROFILE"
                                    // type: "PROFILE_PICTURE"
                                });
                                if (insert) {
                                    yield tx.profile.update({
                                        where: {
                                            id: createProfile.id,
                                        },
                                        data: {
                                            avatarId: insert.id,
                                        },
                                    });
                                }
                            }
                            return yield tx.profile.findUnique({
                                where: {
                                    id: createProfile.id,
                                },
                                include: {
                                    avatar: true,
                                },
                            });
                        }
                        else {
                            const upData = {
                                bio,
                                phone,
                                dateOfBirth,
                            };
                            const _g = Object.assign({}, findUser.profile), { avatar: avatarDB } = _g, rest = __rest(_g, ["avatar"]);
                            const update = yield tx.profile.update({
                                where: {
                                    id: findUser.profile.id,
                                },
                                data: Object.assign(Object.assign(Object.assign({}, rest), upData), { isProfileComplete: true }),
                            });
                            if (RemoveAvatar && (avatarDB === null || avatarDB === void 0 ? void 0 : avatarDB.key)) {
                                utapi.deleteFiles(avatarDB.key);
                                yield tx.image.delete({
                                    where: {
                                        id: avatarDB.id,
                                    },
                                });
                                return yield tx.profile.findUnique({
                                    where: {
                                        id: findUser.profile.id,
                                    },
                                    include: {
                                        avatar: true,
                                    },
                                });
                            }
                            else {
                                if (avatar) {
                                    imageUpload = yield (0, helpers_1.UploadImage)(avatar);
                                    const insert = yield (0, helpers_1.AssignImageToDBImage)(Object.assign(Object.assign({}, imageUpload), { imageType: "PROFILE" }));
                                    yield tx.profile.update({
                                        where: {
                                            id: update.id,
                                        },
                                        data: {
                                            avatarId: insert.id,
                                        },
                                    });
                                }
                                if ((_b = findUser.profile.avatar) === null || _b === void 0 ? void 0 : _b.id) {
                                    yield tx.image.delete({
                                        where: {
                                            id: findUser.profile.avatar.id,
                                        },
                                    });
                                }
                                return yield tx.profile.findUnique({
                                    where: {
                                        id: findUser.profile.id,
                                    },
                                    include: {
                                        avatar: true,
                                    },
                                });
                            }
                        }
                    }
                    catch (error) {
                        console.log(error);
                        if ((_d = (_c = imageUpload === null || imageUpload === void 0 ? void 0 : imageUpload.data) === null || _c === void 0 ? void 0 : _c[0].data) === null || _d === void 0 ? void 0 : _d.key) {
                            utapi.deleteFiles((_f = (_e = imageUpload === null || imageUpload === void 0 ? void 0 : imageUpload.data) === null || _e === void 0 ? void 0 : _e[0].data) === null || _f === void 0 ? void 0 : _f.key);
                        }
                        throw new Error("Error transiction");
                    }
                    // await tx.image.create
                }), {
                    timeout: 60000,
                });
                return transaction;
            }
            catch (error) {
                console.log(error);
                throw new Error("Something went wrong");
            }
        });
    }
    static findOrCreateFromGoogle(_a) {
        return __awaiter(this, arguments, void 0, function* ({ name, email, googleId, image, }) {
            try {
                if (!name || !email || !googleId) {
                    throw new Error("info incomplete");
                }
                const tx = yield prisma_1.default.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                    try {
                        const findUSer = yield tx.user.findUnique({
                            where: {
                                email,
                            },
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                role: true,
                            },
                        });
                        if (!findUSer) {
                            const user = yield tx.user.create({
                                data: {
                                    name,
                                    email,
                                    googleId,
                                    role: "ADMIN",
                                    password: "_google",
                                    emailConfirmed: true,
                                    profile: {
                                        create: {
                                            avatar: {
                                                create: {
                                                    width: 100,
                                                    height: 100,
                                                    blurHash: "_google",
                                                    filename: "_google",
                                                    key: "_google",
                                                    fileHash: "_google",
                                                    alt: "_google",
                                                    url: image,
                                                    type: "_google",
                                                    imageType: "PROFILE",
                                                },
                                            },
                                        },
                                    },
                                },
                            });
                            return Object.assign(Object.assign({}, user), { password: "_" });
                        }
                        if (!!findUSer) {
                            return Object.assign(Object.assign({}, findUSer), { password: "_" });
                        }
                    }
                    catch (err) {
                        console.log(err);
                        throw new Error(err);
                    }
                }));
                return tx;
            }
            catch (error) {
                console.log(error);
                throw new Error(error);
            }
        });
    }
    static successGoogle(_a) {
        return __awaiter(this, arguments, void 0, function* ({ dateOfBirth, role, gender, phone, bio, userId, avatar, }) {
            try {
                const findAdmins = yield prisma_1.default.user.count({
                    where: {
                        role: "ADMIN",
                    },
                });
                let imageUpload;
                let insert;
                if (findAdmins >= 2 && role === "ADMIN")
                    throw new Error("cannot add admin again");
                const tx = yield prisma_1.default.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                    var _a, _b;
                    try {
                        if (!userId)
                            throw new Error("user not found");
                        const findUser = yield tx.user.findUnique({
                            where: {
                                id: userId,
                            },
                            select: {
                                role: true,
                                gender: true,
                            },
                        });
                        if (!findUser)
                            throw new Error("user not found");
                        if (avatar) {
                            imageUpload = yield (0, helpers_1.UploadImage)(avatar);
                            insert = yield (0, helpers_1.AssignImageToDBImage)(Object.assign(Object.assign({}, imageUpload), { imageType: "PROFILE" }));
                        }
                        const profile = yield tx.profile.findUnique({
                            where: {
                                userId,
                            },
                            include: {
                                avatar: {
                                    select: {
                                        key: true,
                                    },
                                },
                            },
                        });
                        if (!profile) {
                            yield tx.profile.create({
                                data: {
                                    userId,
                                    bio: bio || "" || null,
                                    dateOfBirth: dateOfBirth
                                        ? new Date(dateOfBirth) || null
                                        : null,
                                    phone: phone || null,
                                    isProfileComplete: true,
                                    // avatarId: insert.id || null
                                },
                            });
                            yield tx.user.update({
                                where: {
                                    id: userId,
                                },
                                data: {
                                    role: role || findUser.role,
                                    gender: gender || findUser.gender,
                                },
                            });
                            if (insert === null || insert === void 0 ? void 0 : insert.id) {
                                yield tx.profile.update({
                                    where: {
                                        userId,
                                    },
                                    data: {
                                        avatarId: insert === null || insert === void 0 ? void 0 : insert.id,
                                    },
                                });
                            }
                            return yield tx.profile.findUnique({
                                where: {
                                    userId,
                                },
                                include: {
                                    avatar: true,
                                    user: true,
                                },
                            });
                        }
                        else {
                            if ((_a = profile.avatar) === null || _a === void 0 ? void 0 : _a.key) {
                                utapi.deleteFiles((_b = profile.avatar) === null || _b === void 0 ? void 0 : _b.key);
                            }
                            if (profile.avatarId) {
                                yield tx.image.delete({
                                    where: {
                                        id: profile.avatarId,
                                    },
                                });
                            }
                            console.log("isIn", dateOfBirth, role, gender);
                            yield tx.profile.update({
                                where: {
                                    userId,
                                },
                                data: {
                                    phone: phone || profile.phone || null,
                                    bio: bio || profile.bio || null,
                                    dateOfBirth: dateOfBirth
                                        ? new Date(dateOfBirth) || profile.dateOfBirth || null
                                        : profile.dateOfBirth || null,
                                    isProfileComplete: true,
                                },
                            });
                            if (insert === null || insert === void 0 ? void 0 : insert.id) {
                                yield tx.profile.update({
                                    where: {
                                        userId,
                                    },
                                    data: {
                                        avatarId: insert.id,
                                    },
                                });
                            }
                            yield tx.user.update({
                                where: {
                                    id: userId,
                                },
                                data: {
                                    role: role || findUser.role,
                                    gender: gender || findUser.gender,
                                },
                            });
                            return yield tx.profile.findUnique({
                                where: {
                                    userId,
                                },
                                include: {
                                    user: true,
                                    avatar: true,
                                },
                            });
                        }
                    }
                    catch (err) {
                        console.log(err);
                        throw new Error(err);
                    }
                }), {
                    timeout: 60000,
                });
                console.log(tx);
                return tx;
            }
            catch (error) {
                console.log(error);
                throw new Error(error);
            }
            // const
        });
    }
}
exports.userService = userService;
// export const AssignImageToDBImage = async (
//   data:
//     | {
//         blurhash?: string;
//         width?: number;
//         height?: number;
//         data?: UploadFileResult[];
//         // type: ImageType,
//       }
//     | undefined
// ) => {
//   if (!data) throw new Error("image Data error");
//   try {
//     if (!data.data?.[0].data) throw new Error("error upload Image");
//     else {
//       const imageUploaded = data.data?.[0].data;
//       const tx = await prisma.$transaction(async (tx) => {
//         try {
//           const image = await prisma.image.create({
//             data: {
//               fileHash: imageUploaded.fileHash,
//               key: imageUploaded.key,
//               typeImage: imageUploaded.type,
//               alt: imageUploaded.name + "-alt",
//               customId: imageUploaded.customId,
//               filename: imageUploaded.name,
//               url: imageUploaded.ufsUrl,
//               blurHash: data.blurhash,
//               height: data.height,
//               width: data.width,
//               type: data.
//               size: imageUploaded.size,
//             },
//             select: {
//               id: true,
//               imageType: true
//             },
//           });
//           return image;
//         } catch (error) {
//           if (data.data?.[0].data?.key)
//             utapi.deleteFiles(data.data?.[0].data.key);
//           console.log(error);
//           throw new Error("transiction Error");
//         }
//       });
//       return tx;
//     }
//   } catch (error) {
//     console.log(error);
//     throw new Error("error insert to db");
//   }
// };
