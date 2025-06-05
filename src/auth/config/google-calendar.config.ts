import { registerAs } from '@nestjs/config';

export default registerAs('googleCalendar', () => ({
  clientId: process.env.GOOGLE_ID,
  clientSecret: process.env.GOOGLE_SECRET,
  callBackURL: process.env.GOOGLE_CALENDAR_CALLBACK_URL!,
}));
