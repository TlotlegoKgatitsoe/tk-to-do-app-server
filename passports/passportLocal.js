const LocalStrategy = require( 'passport-local' ).Strategy;
const User = require( '../models/user.model.js' );

/**
 * @param { Passport } passport
 * 
 * Creates a local passport
 */

module.exports = function( passport ) {

    passport.use( new LocalStrategy( 
        function( username, password, done ) {
            User.findOne( { username: username }, function ( err, user ) {
                if ( err ) throw err;
                if ( !user ) return done( null, false );
                if ( user.password === password ) return done( null, user ); 
                else return done( null, false );
            });
        }
    ));

    passport.serializeUser( function( user, done ) {
        done( null, user.id );
    });
      
    passport.deserializeUser( function( id, done ) {
        User.findOne( { _id: id }, function ( err, user ) {
            done( err, user);
        });
    });
}