



import jwt from "jsonwebtoken"

export const generateAccessToken = ({

  userId,
  email,
  role,
  name,
  emailConfirmation,
  deviceVerification,
  profileId,
  profileComplete,
  avatarUrl ,
}: {
  userId: string
  email: string
  role: string
  name: string
  emailConfirmation?: boolean
  deviceVerification?: boolean
  profileId?: string
  profileComplete?: boolean
  avatarUrl ?: string
}) => {
  return jwt.sign(
    {
      userId,
      email,
      role,
      name,
      emailConfirmation,
      deviceVerification,
      profileId,
      profileComplete,
      avatarUrl,
      type: "access", 
    },
    process.env.JWT_SECRET as string,
    { expiresIn: "30D" }, 
  )
}

export const generateRefreshToken = (userId: string) => {
  return jwt.sign(
    {
      userId,
      type: "refresh", 
    },
    process.env.JWT_REFRESH_SECRET as string, 
    { expiresIn: "3d" }, 
  )
}

export const verifyAccessToken = (token: string) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string)
    if (typeof decoded === "string") return null
    if (decoded.type !== "access") return null
    return decoded
  } catch (error) {
    return null
  }
}

export const verifyRefreshToken = (token: string) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET as string)
    if (typeof decoded === "string") return null
    if (decoded.type !== "refresh") return null
    return decoded
  } catch (error) {
    return null
  }
}


export const generateToken = generateAccessToken
