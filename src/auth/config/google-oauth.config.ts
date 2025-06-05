import { registerAs } from '@nestjs/config';

export default registerAs('googleOAuth', () => ({
  clientId: process.env.GOOGLE_ID,
  clientSecret: process.env.GOOGLE_SECRET,
  callBackURL: process.env.GOOGLE_AUTH_CALLBACK_URL!,
}));
