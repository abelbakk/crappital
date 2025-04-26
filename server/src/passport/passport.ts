import { PassportStatic } from 'passport';
import { Strategy } from 'passport-local';
import { User } from '../model/User';

export const configurePassport = (passport: PassportStatic): PassportStatic => {
    passport.serializeUser((user: Express.User, done) => {
        done(null, user);
    });

    passport.deserializeUser((user: Express.User, done) => {
        done(null, user);
    });

    passport.use(
        'local',
        new Strategy({ usernameField: 'email' }, (username, password, done) => {
            const query = User.findOne({ email: username });
            query
                .then((user) => {
                    if (user) {
                        user.comparePassword(password, (error, _) => {
                            if (error) {
                                done(null, false, { message: 'Invalid credentials' });
                            } else {
                                done(null, user);
                            }
                        });
                    } else {
                        done(null, false, { message: 'User not found' });
                    }
                })
                .catch((error) => {
                    done(error);
                });
        }),
    );

    return passport;
};
