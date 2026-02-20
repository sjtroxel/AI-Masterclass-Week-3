export interface AuthUser {
  id: string;
  email: string;
  username?: string;
}

export interface LoginBody {
  email: string;
  password: string;
}

export interface RegisterBody {
  email: string;
  password: string;
  username?: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export interface JwtPayload {
  id: string;
  email: string;
  username?: string;
}
