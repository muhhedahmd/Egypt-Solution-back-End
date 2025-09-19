import { Request, Response } from "express";
import { userService } from "../services/userServics";
import prisma from "../config/prisma";
import { TokenService } from "../services/tokenService";
import axios from "axios";
import * as jwt from "jsonwebtoken"








export class AuthController {

    static async register(req: Request, res: Response) {




        try {



            const { name, email, password, role, gender } = req.body;

            // const user = new User(name, email, role, isActive, createdAt, updatedAt, is2FA, isVerfiyForEachDevice)
            const userCreated = await userService.create({ name, email, password, role, gender })
            if (typeof userCreated === 'string') return res.status(500).json({ error: userCreated });
            if (!userCreated) return res.status(500).json({ error: 'Internal server error' });
            // return res.json(user);

            // console.log("admin-send-otp")
            // if (userCreated.role === "ADMIN") {


            //     await userService.sendOTP({
            //         Method: "email",
            //         userId: userCreated.id
            //     })
            //     // console.log("admin-send-otp")
            // }
            // else {

            //     const findStore = await prisma.storeSettings.findFirst({
            //     })
            //     if (findStore?.requireEmailVerification) {
            //         await userService.sendOTP({
            //             Method: "email",
            //             userId: userCreated.id
            //         })
            //     }
            //     // else {
            //     //     // return;
            //     // }
            // }


            const tokens = await TokenService.generateTokenPair(userCreated.id, req.headers['user-agent'] || "", req.ip || req.socket.remoteAddress || "")

            if (!tokens) return res.status(500).json({ error: 'Internal server error' });

            // console.log({
            //     tokens , 
            //     // userCreated
            // })
            return res.cookie(
                'refreshToken', tokens.refreshToken
                , {
                    httpOnly: true
                    , secure: true
                    , sameSite: 'lax'
                    , path: "/",

                    maxAge: 30 * 24 * 60 * 60 * 1000,
                }
            ).cookie("accessToken", tokens.accessToken, {
                secure: false,
                sameSite: "lax",
                path: "/",
                maxAge: 15 * 60 * 1000, // 
            }).status(201).json(
                { success: true, user: userCreated, }
                // refreshToken :tokens?.refreshToken,
            );


        } catch (error : any) {
            console.log(error)
            return res.status(500).json( error.message ? {message :error.message } : { message: 'Internal server error' });
        }
    }
    static async Login(req: Request, res: Response) {

        try {
            const { email, password } = req.body;
            const user = await userService.login({ email, password });
            if (!user) return res.status(500).json({ error: 'Internal server error' });
            if (typeof user === 'string') return res.status(500).json({ error: user });

            // get the session if not cretaed  
            const tokens = await TokenService.generateTokenPair(user.id, req.headers['user-agent'] || "", req.ip || req.socket.remoteAddress || "")

            if (!tokens) return res.status(500).json({ error: 'Internal server error' });


            return res.cookie(
                'refreshToken', tokens.refreshToken
                , {
                    httpOnly: true
                    , secure: true
                    , sameSite: 'lax', path: "/",

                    maxAge: tokens.refreshExpiresIn * 1000, // ⏱️ أسبوع
                }
            ).cookie("accessToken", tokens.accessToken, {
                secure: false,
                sameSite: "lax",
                path: "/",
                expires: new Date(Date.now() + tokens.expiresIn),
                maxAge: tokens.expiresIn * 1000,     // ⏱️ 15 دقيقة
            }).status(201).json(
                { success: true, user, }
                // refreshToken :tokens?.refreshToken,
            );
        } catch (error) {
            console.log(error)
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
    static async sendOTP(req: Request, res: Response) {

        try {

            const { userId, method } = req.body;

            if (!userId || !method) {
                return res.status(400).json({
                    error: "User ID and method are required"
                });
            }

            const result = await userService.sendOTP({
                Method: method,
                userId
            });

            console.log("Service result:", result);

            // Handle string error responses
            if (typeof result === 'string') {
                return res.status(400).json({ error: result });
            }

            // Handle null responses
            if (!result) {
                return res.status(500).json({ error: 'Internal server error' });
            }

            // ✅ SUCCESS CASE - This was missing!
            if (result.data?.error) {

                return res.status(500).json({
                    success: false,
                    message: "something went worng",
                    data: result
                });
            }

            return res.status(200).json({
                success: true,
                message: "OTP sent successfully",
                data: result
            });

        } catch (error) {
            console.error("SendOTP Controller Error:", error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
    static async refreshToken(req: Request, res: Response) {


        try {

            const refreshToken = req.cookies.refreshToken
            console.log(refreshToken)
            if (!refreshToken) {
                return res.status(400).json({ error: "Refresh token is required" })
            }

            const {
                accessToken,
                error,
                expiresIn,
                user
            } = await TokenService.refreshAccessToken(refreshToken)

            if (error) {
                return res.status(401).json({ error: error })
            }

            return res.cookie(
                'refreshToken', refreshToken
                , {
                    httpOnly: true
                    , secure: true
                    , sameSite: 'lax', path: "/",

                    maxAge: 30 * 24 * 60 * 60 * 1000,
                }
            ).cookie("accessToken", accessToken, {
                secure: false,
                sameSite: "lax",
                path: "/",
                maxAge: 15 * 60 * 1000, // 
            }).status(200).json(user)
        } catch (error) {
            console.error("Refresh token controller error:", error)
            return res.status(500).json({ error: "Internal server error" })
        }
    }

    static async callbackGoogle(req: Request, res: Response) {


        const code = req.query.code;
        const redirectUri = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/google/callback`;

        if (!code) {
            return res.status(400).json({ error: "Missing code from Google" });
        }

        try {
            // 1. تبادل الكود مقابل access_token + id_token
            const tokenRes = await axios.post("https://oauth2.googleapis.com/token", {
                code,
                client_id: process.env.GOOGLE_CLIENT_ID,
                client_secret: process.env.GOOGLE_CLIENT_SECRET,
                redirect_uri: redirectUri,
                grant_type: "authorization_code",
            });

            const { access_token, id_token } = tokenRes.data;

            if (!id_token) {
                return res.status(400).json({ error: "Failed to get ID token from Google" });
            }

            console.log({ access_token })
            // 2. فك الـ id_token للحصول على معلومات المستخدم
            const decoded: any = jwt.decode(id_token);


            const { email, name, picture, sub: googleId } = decoded;

            if (!email) {
                return res.status(400).json({ error: "Missing email in Google response" });
            }

            // 3. ابحث أو أنشئ المستخدم في قاعدة البيانات
            const user = await userService.findOrCreateFromGoogle({
                email,
                name,
                image: picture,
                googleId,
            });

            console.log({ user })
            if (!user) { res.redirect(`${process.env.FRONTEND_URL}/auth/error`); return }
            // 4. إنشاء access/refresh tokens من عندك (نظام التوثيق الخاص بك)
            const tokens = await TokenService.generateTokenPair(
                user.id,
                req.headers["user-agent"] || "unknown",
                req.ip || req.socket.remoteAddress || "unknown",
                true
            );

            if (!tokens) { res.redirect(`${process.env.FRONTEND_URL}/auth/error`); return }

            // 5. حفظ refreshToken في كوكي HttpOnly
            res.cookie("refreshToken", tokens.refreshToken, {
                httpOnly: true,
                secure: true,
                sameSite: "lax",
                path: "/",
                maxAge: 30 * 24 * 60 * 60 * 1000,
            });

            res.cookie("accessToken", tokens.accessToken, {
                secure: false,
                sameSite: "lax",
                path: "/",
                maxAge: 15 * 60 * 1000, // 
            });

            // 6. إعادة التوجيه للفرونت اند مع accessToken
            res.redirect(`${process.env.FRONTEND_URL}/auth/success-google?token=${tokens.accessToken}`);
        } catch (err) {
            console.error("Google Auth Error:", err);
            res.redirect(`${process.env.FRONTEND_URL}/auth/error`);
        }
    }
    static async successGoogle(req: Request, res: Response) {

        try {
            console.log(req.user?.id)
            const userId = req.user?.id


            if (!userId) res.status(404).json({ message: "user not found" });
            const contentType = req.headers["content-type"] || ""
            let formData: any;
            if (contentType.includes('multipart/form-data')) {
                formData = req.body;
            }
            if (!formData) res.status(500).json({
                message: "innvalid Data"
            })
            const avatar = req.file?.buffer

            console.log("before", formData, {

                avatar: avatar || null,
                userId,
                bio: formData?.bio,
                role: formData?.role,
                dateOfBirth: formData?.dateOfBirth,
                gender: formData?.gender,
                phone: formData?.phone
            })
            const response = await userService.successGoogle({
                avatar: avatar || null,
                userId,
                bio: formData?.bio,
                role: formData?.role,
                dateOfBirth: formData?.dateOfBirth,
                gender: formData?.gender,
                phone: formData?.phone
            })



            // console.log({
            //     response , 
            //     message: "success"
            // })
            // if(response.role)
            // res.redirect(`${process.env.FRONTEND_URL}/`);
            res.status(200).json({
                response,
                message: "success"
            })

        } catch (error) {
            console.log(error)
            res.status(500).json({ error: 'Internal server error' });
        }

    }

    static async syncUser(req: Request, res: Response) {
        try {
            console.log({ body: req.body })
            const { supabaseUserId, email, emailVerficatiion, provider } = req.body;
            if (!supabaseUserId) return res.status(500).json({ error: 'Internal server error' });
            const user = await userService.syncUser({
                supabaseUserId, email, emailVerficatiion, provider
            });
            if (!user) return res.status(500).json({ error: 'Internal server error' });

            const tokens = await TokenService.generateTokenPair(user.id, req.headers['user-agent'] || "", req.ip || req.socket.remoteAddress || "", false)

            res.cookie("refreshToken", tokens?.refreshToken, {
                httpOnly: true,
                secure: true,
                sameSite: "lax",
                path: "/",
                maxAge: 30 * 24 * 60 * 60 * 1000,
            });

            res.cookie("accessToken", tokens?.accessToken, {
                secure: false,
                sameSite: "lax",
                path: "/",
                maxAge: 15 * 60 * 1000, // 
            });
            return res.status(201).json(user);
        } catch (error) {
            console.log(error)
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
    static async verifyOTP(req: Request, res: Response) {
        try {
            const { userId, Method, otp } = req.body;
            if (!userId || !Method || !otp) return res.status(500).json({ error: 'Internal server error' });

            const user = await userService.verifyOtp(otp, Method, userId);

            if (typeof user === 'string') return res.status(500).json({ error: user });
            if (!user) return res.status(500).json({ error: 'Internal server error' });

        } catch (error) {
            return res.status(500).json({ error: 'Internal server error' });

        }




    }

}