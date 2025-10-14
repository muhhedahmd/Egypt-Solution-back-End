import prisma from "../config/prisma"
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../lib/jwt"

export class TokenService {
  static async generateTokenPair(userId: string, userAgent?: string, ipAddress?: string , 
    needAvatar : boolean = false 
  )  {
    try {
      // Get user data for access token
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          profile: {
            select: {
              id: true,
              isProfileComplete: true,

            },
          },
        },
      })

      let avatarUrl : string  = ""
      if (!user) throw new Error("User not found")
        if(needAvatar){

          const avatar = await prisma.profile.findUnique({
            where:{
              userId : userId
            },
            select:{
              avatar : {
                select : {
                  url : true
                }
              }
            }
          })

          avatarUrl = avatar?.avatar?.url || ""
        }

      // Generate tokens
      const accessToken = generateAccessToken({
        userId: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        emailConfirmation: user.emailConfirmed,
        deviceVerification: true,
        profileId: user.profile?.id,
        profileComplete: user.profile?.isProfileComplete,
        avatarUrl : avatarUrl|| ""
      })


      const refreshToken = generateRefreshToken(userId)

      // Store refresh token in database
      const session = await prisma.session.create({
        data: {
          userId,
          token: accessToken,
          refreshToken,
          refreshTokenExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
          userAgent: userAgent || "",
          ipAddress: ipAddress || "",
          deviceVerification: true,
          expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
          isActive: true,
        },
      })

      return {
        accessToken,
        refreshToken,
        sessionId: session.id,
        expiresIn: 15 * 60, // 15 minutes in seconds
        refreshExpiresIn: 7 * 24 * 60 * 60, // 7 days in seconds
      }
    } catch (error) {
      console.error("Generate token pair error:", error)
      return null
    }
  }

  static async refreshAccessToken(refreshToken: string) {
    try {
      // Verify refresh token
      const decoded = verifyRefreshToken(refreshToken)
      if (!decoded) {
        return { error: "Invalid refresh token" }
      }

      // Check if refresh token exists and is active
      const session = await prisma.session.findFirst({



        where: {
          refreshToken,
          userId: decoded.userId,
          isActive: true,
          refreshTokenExpiresAt: {
            gt: new Date(), // Not expired
          },
        },
        include: {
          user: {
            include: {
              profile: {
                select: {
                  id: true,
                  isProfileComplete: true,
                },
              },
            },
          },
        },
      })
      console.log(session)

      if (!session) {
        throw new Error("Refresh token not found or expired")
      }

      // Generate new access token
      const newAccessToken = generateAccessToken({
        userId: session.user.id,
        name: session.user.name,
        email: session.user.email,
        role: session.user.role,
        emailConfirmation: session.user.emailConfirmed,
        deviceVerification: session.deviceVerification,
        profileId: session.user.profile?.id,
        profileComplete: session.user.profile?.isProfileComplete,
      })
      // const newRefreshToken = generateRefreshToken(session.user.id)

      // Update session with new access token
      await prisma.session.update({
        where: { id: session.id  , 
          refreshToken: session.refreshToken
        },

        data: {
          token: newAccessToken,
          // refreshToken : newRefreshToken, 
          refreshTokenExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
        },
      })

      return {
        accessToken: newAccessToken,
        refreshToken: refreshToken,
        expiresIn: 15 * 60, // 15 minutes in seconds
        user: {
          id: session.user.id,
          name: session.user.name,
          email: session.user.email,
          role: session.user.role,
        },
      }
    } catch (error) {
      console.error("Refresh token error:", error)
      return { error: "Failed to refresh token" }
    }
  }

  // 🚪 Logout (invalidate tokens)
  static async logout(refreshToken: string) {
    try {
      await prisma.session.updateMany({
        where: { refreshToken },
        data: { isActive: false },
      })
      return { success: true }
    } catch (error) {
      console.error("Logout error:", error)
      return { error: "Failed to logout" }
    }
  }

  // 🚪 Logout from all devices
  static async logoutAllDevices(userId: string) {
    try {
      await prisma.session.updateMany({
        where: { userId },
        data: { isActive: false },
      })
      return { success: true }
    } catch (error) {
      console.error("Logout all devices error:", error)
      return { error: "Failed to logout all devices" }
    }
  }

  // 🧹 Clean expired tokens (run this periodically)
  static async cleanExpiredTokens() {
    try {
      const result = await prisma.session.deleteMany({
        where: {
          OR: [{ refreshTokenExpiresAt: { lt: new Date() } }, { isActive: false }],
        },
      })
      console.log(`Cleaned ${result.count} expired sessions`)
      return result.count
    } catch (error) {
      console.error("Clean expired tokens error:", error)
      return 0
    }
  }
}
