const GoogleStratClass = require( 'passport-google-oauth20' ).Strategy;
const User = require( '../models/user.model.js' );

/** GOOGLE PASSPORT  */

module.exports = ( passport ) => {
    passport.use(
        new GoogleStratClass({
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: 'https://tk-to-do-app-server.herokuapp.com/login/redirect',
        }, 
        ( accessToken, refreshToken, profile, done ) => {
            User.findOne( { googleID: profile.id } ).then( ( currentUser ) => {
                if ( currentUser ) {
                    return done( null, currentUser );
                } else { 
                    new User({
                        username: profile.displayName,
                        googleID: profile.id,
                        tasks: []
                    }).save().then( ( newUser ) => {
                        return done( null, newUser );
                    });
                }
            });
        
            passport.serializeUser((user, done) => {
                done( null, user._id );
            });
        
            passport.deserializeUser( ( id, done ) => {
                User.findById( id ).then( ( user ) => {
                    done( null, user );
                });
            });
        })
    );
}

