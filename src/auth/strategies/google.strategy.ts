import { Inject, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-google-oauth20';
import googleOauthConfig from '../config/google-oauth-config';
import { ConfigType } from '@nestjs/config';
import { VerifiedCallback } from 'passport-jwt';
import { AuthService } from '../auth.service';
import { User } from '@prisma/client';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    @Inject(googleOauthConfig.KEY) googleConfiguration: ConfigType<typeof googleOauthConfig>,
    private readonly authService: AuthService,
  ) {
    super({
      clientID: googleConfiguration.clientId!,
      clientSecret: googleConfiguration.clientSecret!,
      callbackURL: googleConfiguration.callBackURL!,
      scope: ['email', 'profile'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any, done: VerifiedCallback) {
    const { name, emails, photos } = profile;

    const userInfo = {
      email: emails[0].value,
      fullName: name.givenName + name.familyName,
      password: '',
      verified: new Date(),
    };

    const user = await this.authService.validateGoogleUser(userInfo);

    done(null, user);
  }
}
