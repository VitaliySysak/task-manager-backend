import { registerAs } from '@nestjs/config';

export default registerAs('googleOAuth', () => ({
  clientID: process.env.GOOGLE_ID,
  clientSecret: process.env.GOOGLE_SECRET,
  callbackURL: process.env.DOMAIN_NAME! + process.env.GOOGLE_CALLBACK_URL!,
}));
