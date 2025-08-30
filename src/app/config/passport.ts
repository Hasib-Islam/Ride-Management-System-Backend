import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { envVars } from './env';
import { User } from '../modules/user/user.model';
import { AppError } from '../errorHelpers/AppError';

const configureGoogleStrategy = () => {
  passport.use(
    new GoogleStrategy(
      {
        clientID: envVars.GOOGLE_CLIENT_ID,
        clientSecret: envVars.GOOGLE_CLIENT_SECRET,
        callbackURL: envVars.GOOGLE_CALLBACK_URL,
        passReqToCallback: true,
      },
      async (req, accessToken, refreshToken, profile, done) => {
        try {
          let user = await User.findOne({
            'auths.provider': 'google',
            'auths.providerId': profile.id,
          });

          if (user) {
            return done(null, user);
          }

          user = await User.findOne({ email: profile.emails?.[0].value });

          if (user) {
            user.auths.push({
              provider: 'google',
              providerId: profile.id,
            });
            await user.save();
            return done(null, user);
          }

          const newUser = await User.create({
            name: profile.displayName,
            email: profile.emails?.[0].value,
            auths: [
              {
                provider: 'google',
                providerId: profile.id,
              },
            ],
            isVerified: true,
          });

          return done(null, newUser);
        } catch {
          return done(new AppError('Google authentication failed', 500), false);
        }
      }
    )
  );
};

export default configureGoogleStrategy;
