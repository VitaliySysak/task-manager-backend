import { Inject, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-google-oauth20';
import { ConfigType } from '@nestjs/config';
import { VerifiedCallback } from 'passport-jwt';
import googleCalendarConfig from '../config/google-calendar.config';
import { CalendarDto } from '../dto/calendar.dto';

@Injectable()
export class GoogleCalendarStrategy extends PassportStrategy(Strategy, 'google-calendar') {
  constructor(
    @Inject(googleCalendarConfig.KEY) googleConfiguration: ConfigType<typeof googleCalendarConfig>,
  ) {
    super({
      clientID: googleConfiguration.clientId!,
      clientSecret: googleConfiguration.clientSecret!,
      callbackURL: googleConfiguration.callBackURL!,
      scope: ['email', 'profile', 'https://www.googleapis.com/auth/calendar'],
    });
  }

  authorizationParams() {
    return {
      access_type: 'offline',
      prompt: 'consent',
    };
  }

  async validate(accessToken: string, refreshToken: string, profile: Profile, done: VerifiedCallback) {
    if (!profile.name || !profile.emails?.[0]) {
      throw new Error('Incomplete Google profile data');
    }

    const data: CalendarDto = {
      email: profile.emails[0].value,
      googleCalendarRefreshToken: refreshToken,
      googleCalendarAccessToken: accessToken,
    };

    done(null, data);
  }
}
