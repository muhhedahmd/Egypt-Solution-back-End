import { Gender, ImageType, UserRole } from "@prisma/client";

import bcrypt from "bcryptjs"
import prisma from "../config/prisma";
import { userRegisterSchema } from "../validtation/user-schema";
import { supabaseAdmin, supabaseClient } from "../config/supabase";
import { UploadImage } from "../lib/helpers";
import { UploadFileResult } from "uploadthing/types";
import { UTApi } from "uploadthing/server";
// import { throwDeprecation } from "process";
const utapi = new UTApi()




export class userService {
    static async create({
        name,
        email,
        password,
        role = "ADMIN",
        gender = "MALE"
    }: {
        name: string,
        email: string,
        role: UserRole,
        password: string
        gender: Gender
    }) {
        try {


            if (!name || !email || !password) {
                return "All fields are required"
            }
            // console.log("email", email)
            if (await prisma.user.findUnique({
                where: {
                    email: email
                }
            })) {
                throw new Error( "Email already exists") 
            }
            const parsed = userRegisterSchema.safeParse({ name, email, password, role });

            if (!parsed.success) {
                return parsed.error.message;
            }
            const hashedpassword = await bcrypt.hash(password, 10)
            const createUser = prisma.user.create({
                data: {
                    gender,
                    name: name,
                    email: email,
                    password: hashedpassword,
                    role: role === "ADMIN" ? UserRole.ADMIN : role === "GUEST" ? UserRole.GUEST : UserRole.CUSTOMER,
                    profile: {
                        create: {}
                    },

                },

                omit: {
                    password: true
                }

            })

            return {
                ...createUser,

                password: "_",
            }


        } catch (error) {
            console.log(error)
            throw new Error(error as string)

        }

    }

    static async login(
        {
            email,
            password
        }: {
            email: string,
            password: string
        }
    ) {
        try {

            if (!email || !password) {
                return "All fields are required"
            }
            const finduser = await prisma.user.findUnique({

                where: {
                    email: email

                }

            })

            if (!finduser) {
                return "User not found"
            }
            const isPasswordCorrect = await bcrypt.compare(password, finduser.password)
            if (!isPasswordCorrect) {
                return "Incorrect password"
            }

            const findProfile = await prisma.profile.findUnique({
                where: {
                    userId: finduser.id
                },
                select: {
                    id: true,
                    isProfileComplete: true
                }
            })



            return {
                ...finduser,
                profileId: findProfile?.id,
                isProfileComplete: findProfile?.isProfileComplete,
                password: "_"
            }
        } catch (error) {
            console.log(error)
            return null
        }



    }
    static async sendOTP({
        Method,
        userId
    }: {
        userId: string,
        Method: "phone" | "email"
    }) {
        try {
            if (!userId) return { success: false, error: "User not found" }

            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: {
                    email: true,
                    profile: {
                        select: { phone: true }
                    }
                }
            })

            // console.log("User found:", user)

            if (!user) return { success: false, error: "User not found" }

            if (Method === "email") {
                if (!user.email) return { success: false, error: "Email not found" }

                // console.log("Sending OTP to email:", user.email)

                // Add timeout wrapper
                const otpPromise = await supabaseAdmin.auth.signInWithOtp({
                    email: user.email, // Fixed: use user.email instead of userId

                    options: {
                        emailRedirectTo: `${process.env.FRONTEND_URL}/auth/callback`,
                        // shouldCreateUser: false
                    }
                })


                // console.log("OTP response:", otpPromise)

                return { success: true, data: otpPromise }
            }

            if (Method === "phone" && user.profile?.phone) {
                // console.log("Sending OTP to phone:", user.profile.phone)

                const otpPromise = await supabaseAdmin.auth.signInWithOtp({
                    phone: user.profile.phone,
                    options: {
                        emailRedirectTo: `${process.env.FRONTEND_URL}/auth/callback`,
                        shouldCreateUser: false
                    }
                })


                // console.log("OTP response:", otpPromise)

                return { success: true, data: otpPromise }
            }

            return { success: false, error: "Invalid method or missing contact info" }

        } catch (error) {
            console.error("SendOTP Error:", error)
            return { success: false, error: error || "Failed to send OTP" }
        }
    }
    static async verifyOtp(otp: string, Method: "phone" | "email", userId: string) {

        try {

            if (!userId) return "User not found"
            const user = await prisma.user.findUnique({
                where: {
                    id: userId
                },
                select: {
                    email: true,
                    profile: {
                        select: {
                            phone: true
                        }
                    }
                }
            })
            if (!user) return "User not found"
            if (user.email === null && Method === "email") return "Email not found"
            if (user.profile?.phone === null && Method === "phone") return "Phone not found"
            if (Method === "phone") {
                const session = await supabaseClient.auth.verifyOtp({

                    phone: user.profile?.phone ?? "",
                    token: otp,
                    type: "sms",


                })

                return session
            }

            if (Method === "email") {

                const session = await supabaseClient.auth.verifyOtp({

                    email: user.email,
                    token: otp,
                    type: "email",


                })
                return session
            }

        } catch (error) {
            console.log(error)
            return null

        }
    }
    static async syncUser(

        { supabaseUserId,
            email,
            emailVerficatiion,
            provider,
        }: {
            supabaseUserId: string,
            email: string,
            emailVerficatiion: boolean,
            provider: string
        }
    ) {
        try {

            return await prisma.user.update({
                where: {
                    email

                },
                data: {
                    email,
                    emailConfirmed: emailVerficatiion,
                }

            })




        } catch (error) {
            console.log(error)
        }
    }
    static async getUser(userId: string) {
        try {
            if (!userId) return "User not found"
            return await prisma.user.findUnique({
                where: {
                    id: userId
                },
                omit: {
                    password: true,
                }
            })
        } catch (error) {
            console.log(error)
            return "User not found"
        }
    }
    static async CreateProfile({

        userId,
        RemoveAvatar,
        phone,
        dateOfBirth,
        bio,
        avatar,
    }: {
        userId: string,
        RemoveAvatar: boolean,
        avatar: Buffer,
        phone: string,
        dateOfBirth: Date,
        bio: string
    }) {

        if (!userId) throw new Error("userId not found")
        try {


            const findUser = await prisma.user.findUnique({
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
                                    key: true
                                }
                            }
                        }
                    }
                }
            })
            if (!findUser) throw new Error("user not found")

            let imageUpload: {
                blurhash: string;
                width: number;
                height: number;
                data: UploadFileResult[];
            } | undefined;
            const transaction = await prisma.$transaction(async (tx) => {

                try {
                    // if there no profile 
                    if (!findUser.profile?.id) {

                        let createProfile:
                            {
                                id: string;
                                phone: string | null;
                                dateOfBirth: Date | null;
                                bio: string | null;
                                createdAt: Date;
                                updatedAt: Date;
                                isProfileComplete: boolean;
                                userId: string;
                                avatarId: string | null;
                            }
                            = await tx.profile.create({

                                data: {
                                    bio,
                                    phone,
                                    dateOfBirth,
                                    isProfileComplete: true,
                                    userId: findUser.id
                                }
                            })

                        if (avatar) {

                            imageUpload = await UploadImage(avatar)
                            if (!imageUpload) throw new Error("Error processing Avatar")
                            const insert = await AssignImageToDBImage(
                                {
                                    blurhash: imageUpload?.blurhash,
                                    data: imageUpload?.data,
                                    height: imageUpload?.height,
                                    width: imageUpload?.width,
                                    type: "PROFILE_PICTURE"
                                })
                            if (insert) {
                                await tx.profile.update({
                                    where: {
                                        id: createProfile.id
                                    },
                                    data: {
                                        avatarId: insert.id
                                    }
                                })
                            }

                        }
                        return await tx.profile.findUnique({

                            where: {
                                id: createProfile.id
                            },
                            include: {
                                avatar: true
                            }
                        })
                    }
                    else {

                        const upData = {
                            bio,
                            phone,
                            dateOfBirth,
                        }
                        const {
                            avatar: avatarDB,
                            ...rest
                        } = {
                            ...findUser.profile
                        }
                        const update = await tx.profile.update({
                            where: {
                                id: findUser.profile.id
                            },
                            data: {
                                ...rest,
                                ...upData,
                                isProfileComplete: true,

                            }
                        })

                        if (RemoveAvatar && avatarDB?.key) {
                            utapi.deleteFiles(avatarDB.key)
                            await tx.image.delete({
                                where: {
                                    id: avatarDB.id
                                }
                            })

                            return await tx.profile.findUnique({
                                where: {
                                    id: findUser.profile.id
                                },
                                include: {
                                    avatar: true
                                }
                            })
                        } else {

                            if (avatar) {

                                imageUpload = await UploadImage(avatar)
                                const insert = await AssignImageToDBImage({
                                    ...imageUpload,
                                    type: "PROFILE_PICTURE"
                                })
                                await tx.profile.update({
                                    where: {
                                        id: update.id
                                    },
                                    data: {
                                        avatarId: insert.id

                                    }
                                })

                            }
                            if (findUser.profile.avatar?.id) {

                                await tx.image.delete({
                                    where: {
                                        id: findUser.profile.avatar.id
                                    }
                                })

                            }

                            return await tx.profile.findUnique({
                                where: {
                                    id: findUser.profile.id
                                },
                                include: {
                                    avatar: true
                                }
                            })
                        }

                    }

                } catch (error) {
                    console.log(error)

                    if (imageUpload?.data?.[0].data?.key) {
                        utapi.deleteFiles(imageUpload?.data?.[0].data?.key)
                    }
                    throw new Error("Error transiction")

                }

                // await tx.image.create

            }, {
                timeout: 60000
            })





            return transaction


        } catch (error) {
            console.log(error)
            throw new Error("Something went wrong")
        }

    }
    static async findOrCreateFromGoogle({
        name,
        email,
        googleId,
        image,
    }: {
        name: string,
        email: string,
        googleId: string,
        image: string
    }) {
        try {

            if (!name || !email || !googleId) {
                throw new Error("info incomplete")

            }
            const tx = await prisma.$transaction(async (tx) => {
                try {

                    const findUSer = await tx.user.findUnique({
                        where: {
                            email
                        },
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            role: true,
                        }
                    })

                    if (!findUSer) {

                        const user = await tx.user.create({
                            data: {

                                name,
                                email,
                                googleId,
                                role: "CUSTOMER",
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
                                                typeImage: "PROFILE_PICTURE"
                                            }
                                        }
                                    }
                                }
                            }
                        })
                        return {
                            ...user,
                            password: "_"
                        }
                    }

                    if (!!findUSer) {

                        return {
                            ...findUSer,
                            password: "_"
                        }
                    }
                } catch (err: any) {
                    console.log(err)
                    throw new Error(err)

                }


            })
            return tx



        } catch (error: any) {
            console.log(error)
            throw new Error(error)

        }
    }
    static async successGoogle({
        dateOfBirth,
        role,
        gender,
        phone,
        bio,
        userId,
        avatar

    }: {
        dateOfBirth?: string | null,
        role?: "ADMIN" | "CUSTOMER" | "GUEST",
        gender?: 'MALE' | "FEMALE",
        phone?: string,
        bio?: string,
        userId?: string,
        avatar: Buffer | null
    }) {

        try {


            const findAdmins = await prisma.user.count({
                where: {
                    role: "ADMIN"
                }
            })
            let imageUpload;
            let insert: {
                type: ImageType;
                id: string;
            };
            if (findAdmins >= 2 && role === "ADMIN") throw new Error("cannot add admin again")
            const tx = await prisma.$transaction(async (tx) => {
                try {

                    if (!userId) throw new Error("user not found")
                    const findUser = await tx.user.findUnique({
                        where: {
                            id: userId
                        },
                        select: {
                            role: true,
                            gender: true
                        }

                    })
                    if (!findUser) throw new Error("user not found")



                    if (avatar) {


                        imageUpload = await UploadImage(avatar)
                        insert = await AssignImageToDBImage({
                            ...imageUpload,
                            type: "PROFILE_PICTURE"
                        })
                    }

                    const profile = await tx.profile.findUnique({
                        where: {
                            userId
                        },
                        include: {
                            avatar: {
                                select: {
                                    key: true
                                }
                            }
                        }
                    })



                    if (!profile) {




                        await tx.profile.create({
                            data: {
                                userId,
                                bio: bio || "" || null,
                                dateOfBirth: dateOfBirth ? new Date(dateOfBirth) || null : null,
                                phone: phone || null,
                                isProfileComplete: true,
                                // avatarId: insert.id || null

                            }
                        })

                        await tx.user.update({

                            where: {
                                id: userId
                            },
                            data: {

                                role: role || findUser.role,
                                gender: gender || findUser.gender
                            }
                        })
                        if (insert?.id) {
                            await tx.profile.update({
                                where: {
                                    userId
                                },
                                data: {
                                    avatarId: insert?.id
                                }
                            })
                        }

                        return await tx.profile.findUnique({
                            where: {
                                userId
                            },
                            include: {
                                avatar: true,
                                user: true
                            }
                        })
                    }

                    else {



                        if (profile.avatar?.key) {
                            utapi.deleteFiles(profile.avatar?.key)
                        }
                        if (profile.avatarId) {

                            await tx.image.delete({
                                where: {
                                    id: profile.avatarId
                                }
                            })
                        }
                        console.log("isIn",
                            dateOfBirth,
                            role,
                            gender
                        )
                        await tx.profile.update({


                            where: {
                                userId,
                            }
                            ,
                            data: {
                                phone: phone || profile.phone || null,
                                bio: bio || profile.bio || null,
                                dateOfBirth: dateOfBirth ? new Date(dateOfBirth) || profile.dateOfBirth || null : profile.dateOfBirth || null,
                                isProfileComplete: true,




                            }
                        })
                        if (insert?.id) {
                            await tx.profile.update({
                                where: {
                                    userId
                                },
                                data: {
                                    avatarId: insert.id
                                }
                            })

                        }
                        await tx.user.update({

                            where: {
                                id: userId
                            },
                            data: {
                                role: role || findUser.role,
                                gender: gender || findUser.gender
                            }
                        })
                        return await tx.profile.findUnique({
                            where: {
                                userId
                            },
                            include: {
                                user: true,
                                avatar: true
                            }
                        })

                    }
                }
                catch (err: any) {
                    console.log(err)
                    throw new Error(err)
                }

            }, {
                timeout: 60000
            })
            console.log(tx)
            return tx

        } catch (error: any) {
            console.log(error)
            throw new Error(error)
        }
        // const  

    }
}


export const AssignImageToDBImage = async (data: {
    blurhash?: string;
    width?: number;
    height?: number;
    data?: UploadFileResult[];
    type: ImageType ,

} | undefined) => {
    if (!data) throw new Error("image Data error")
    try {
        if (!data.data?.[0].data) throw new Error("error upload Image")
        else {

            const imageUploaded = data.data?.[0].data
            const tx = await prisma.$transaction(async (tx) => {
                try {
                    const image = await prisma.image.create({
                        data: {
                            fileHash: imageUploaded.fileHash,
                            key: imageUploaded.key,
                            typeImage: imageUploaded.type,
                            alt: imageUploaded.name + "-alt",
                            customId: imageUploaded.customId,
                            filename: imageUploaded.name,
                            url: imageUploaded.ufsUrl,
                            blurHash: data.blurhash,
                            height: data.height,
                            width: data.width,
                            type: data.type,
                            size: imageUploaded.size
                        },
                        select: {
                            id: true,
                            type: true
                        }
                    })
                    return image

                } catch (error) {

                    if (data.data?.[0].data?.key) utapi.deleteFiles(data.data?.[0].data.key)
                    console.log(error)
                    throw new Error("transiction Error")
                }
            })

            return tx
        }
    } catch (error) {
        console.log(error)
        throw new Error("error insert to db")


    }
} 