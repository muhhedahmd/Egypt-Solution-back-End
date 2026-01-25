import prisma from "../config/prisma"
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../lib/jwt"

export class TokenService {
  // Use 24 hours for access tokens, 30 days for refresh tokens
  static ACCESS_TOKEN_TTL_MS = 24 * 60 * 60 * 1000 // 24 hours
  static REFRESH_TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000 // 30 days

  static async generateTokenPair(
    userId: string,
    userAgent?: string,
    ipAddress?: string,
    needAvatar: boolean = false
  ) {
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

      if (!user) throw new Error("User not found")

      let avatarUrl: string = ""
      if (needAvatar) {
        const avatar = await prisma.profile.findUnique({
          where: {
            userId: userId, // assuming userId is unique in profile model
          },
          select: {
            avatar: {
              select: {
                url: true,
              },
            },
          },
        })
        avatarUrl = avatar?.avatar?.url || ""
      }

      // Generate tokens (assumes these functions create tokens but don't persist expiration themselves)
      const accessToken = generateAccessToken({
        userId: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        emailConfirmation: user.emailConfirmed,
        deviceVerification: true,
        profileId: user.profile?.id,
        profileComplete: user.profile?.isProfileComplete,
        avatarUrl: avatarUrl || ""
      })

      const refreshToken = generateRefreshToken(userId)

      const session = await prisma.session.create({
        data: {
          userId,
          token: accessToken,
          refreshToken,
          refreshTokenExpiresAt: new Date(Date.now() + TokenService.REFRESH_TOKEN_TTL_MS), // 30 days
          userAgent: userAgent || "",
          ipAddress: ipAddress || "",
          deviceVerification: true,
          expiresAt: new Date(Date.now() + TokenService.ACCESS_TOKEN_TTL_MS), // access token expires at (24 hours)
          isActive: true,
        },
      })

      return {
        accessToken,
        refreshToken,
        sessionId: session.id,
        expiresIn: Math.floor(TokenService.ACCESS_TOKEN_TTL_MS / 1000), // in seconds
        refreshExpiresIn: Math.floor(TokenService.REFRESH_TOKEN_TTL_MS / 1000), // in seconds
      }
    } catch (error) {
      console.error("Generate token pair error:", error)
      return null
    }
  }

  static async refreshAccessToken(refreshToken: string) {
    try {
      // Verify refresh token (your verifyRefreshToken should return payload with userId or null on fail)
      const decoded = verifyRefreshToken(refreshToken)
      if (!decoded) {
        return { error: "Invalid refresh token" }
      }

      // Find active session for this refresh token
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

      // If you want to rotate refresh tokens uncomment this and use generateRefreshToken:
      // const newRefreshToken = generateRefreshToken(session.user.id)

      // Update session with new access token and (optionally) new refresh token expiry
      await prisma.session.update({
        where: { id: session.id }, // only id is required & correct for Prisma
        data: {
          token: newAccessToken,
          // If rotating refresh tokens, set refreshToken: newRefreshToken
          // refreshToken: newRefreshToken,
          // extend refresh token expiry only if you want sliding expiration (optional)
          refreshTokenExpiresAt: new Date(Date.now() + TokenService.REFRESH_TOKEN_TTL_MS), // extend 30 days from now (optional)
          expiresAt: new Date(Date.now() + TokenService.ACCESS_TOKEN_TTL_MS), // new access token expiry (24 hours)
        },
      })

      return {
        accessToken: newAccessToken,
        refreshToken: refreshToken, // or newRefreshToken if you rotate
        expiresIn: Math.floor(TokenService.ACCESS_TOKEN_TTL_MS / 1000),
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

  static async logout(refreshToken: string) {
    try {
      await prisma.session.updateMany({
        where: { refreshToken },
        data: { isActive: false },
      })
      return { success: true }
    } catch (error) {
      console.error("Logout error:", error)
      throw new Error("Failed to logout")
    }
  }

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

  static async cleanExpiredTokens() {
    try {
      const result = await prisma.session.deleteMany({
        where: {
          OR: [
            { refreshTokenExpiresAt: { lt: new Date() } },
            { isActive: false },
          ],
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
