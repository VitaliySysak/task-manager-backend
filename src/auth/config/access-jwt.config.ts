import { JwtSignOptions } from '@nestjs/jwt';
import { registerAs } from '@nestjs/config';

export const accessJwtConfig = registerAs(
  'access-jwt',
  (): JwtSignOptions => ({
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_ACCESS_EXPIRE_IN,
  }),
);

export const accessJwtConfigKey = accessJwtConfig.KEY;
