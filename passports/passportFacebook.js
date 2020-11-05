const FacebookStrategy = require( 'passport-facebook' ).Strategy;
const User = require( '../models/user.model' );

module.exports = ( passport ) => {
    passport.use( new FacebookStrategy({
            clientID: process.env.FACEBOOK_CLIENT_ID,
            clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
            callbackURL: 'https://tk-to-do-app-server.herokuapp.com/auth/facebook/callback'
        },
        function( accessToken, refreshToken, profile, done ) {
            User.findOne( { facebookID: profile.id } )
            .then( facebookUser => {
                if ( facebookUser ) {
                    return done( null, facebookUser );
                } else {
                    new User({
                        username: profile.displayName,
                        facebookID: profile.id,
                        tasks: []
                    }).save().then( ( newUser ) => {
                        return done( null, newUser );
                    });
                }
            });
        }
    ));
}