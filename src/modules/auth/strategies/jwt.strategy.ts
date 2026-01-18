import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

/**
 * JWT payload interface
 */
export interface JwtPayload {
  sub: string;
  email: string;
  name: string;
}

/**
 * Passport JWT Strategy for validating JWT tokens.
 * Extracts token from Authorization header and validates against secret.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET', 'dealhunter-secret-key'),
    });
  }

  /**
   * Validate the JWT payload and return user data.
   * This method is called after token verification.
   */
  async validate(payload: JwtPayload) {
    return {
      userId: payload.sub,
      email: payload.email,
      name: payload.name,
    };
  }
}
