import { JwtSignOptions } from '@nestjs/jwt';
import { registerAs } from '@nestjs/config';

export const refreshJwtConfig = registerAs(
  'refresh-jwt',
  (): JwtSignOptions => ({
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_REFRESH_EXPIRE_IN,
  }),
);

export const refreshJwtConfigKey = refreshJwtConfig.KEY;
