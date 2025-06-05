import { Inject, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-google-oauth20';
import googleOauthConfig from '../config/google-oauth.config';
import { ConfigType } from '@nestjs/config';
import { VerifiedCallback } from 'passport-jwt';
import { AuthService } from '../auth.service';
import { GoogleLoginDto } from '../dto/login.dto';

@Injectable()
export class GoogleAuthStrategy extends PassportStrategy(Strategy, 'google') {
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

  async validate(accessToken: string, refreshToken: string, profile: Profile, done: VerifiedCallback) {
    if (!profile.name || !profile.emails?.[0]) {
      throw new Error('Incomplete Google profile data');
    }

    const userInfo: GoogleLoginDto = {
      fullName: profile.name.givenName + profile.name.familyName,
      email: profile.emails[0].value,
      password: '',
      provider: profile.provider,
      providerId: profile.id,
      googleAccessToken: accessToken,
    };

    const user = await this.authService.validateGoogleUser(userInfo);

    done(null, user);
  }
}
