export interface RegisterRequest {
  name: string
  email: string
  password: string
  role?: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface AuthResponse {
  message: string
  user: {
    id: string
    name: string
    email: string
    role: string
    profileId: string
  }
  token: string
}

export interface TokenPayload {
  userId: string
  name: string
  email: string
  role: string
  profileId: string

}
