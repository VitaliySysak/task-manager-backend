export interface cookieOptions {
  httpOnly: boolean;
  secure: boolean;
  sameSite: boolean | 'lax' | 'strict' | 'none' | undefined;
  maxAge: number;
  path?: string;
  domain?: string;
}
