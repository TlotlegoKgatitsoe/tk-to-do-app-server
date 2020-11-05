const express = require('express');
const app = express();
const mongoose = require('mongoose');
const cookieSession = require( 'cookie-session' );
const passport = require('passport');
const UserModel = require( './models/user.model' );
const cors = require( 'cors' );
const bodyParser = require( 'body-parser' );
const fileSystem = require( 'fs' );
const path = require( 'path' );
const helmet = require( 'helmet' );
const USER_JSON_FILE = 'user.json';
const PORT = process.env.PORT || 3001;

// For development
if ( process.env.NODE_ENV !== 'production' ) {
    require( 'dotenv' ).config();
}

// Config all passport modules with one object
require( './passports/passportLocal' )( passport );
require( './passports/passportGoogle' )( passport );
require( './passports/passportFacebook' )( passport );

// Middleware
app.use( bodyParser.json() );
app.use( bodyParser.urlencoded( { extended: true } ) );
app.use( cookieSession( { maxAge: 86400000, keys: [ process.env.COOKIE_KEY ] } ) );
app.use( passport.initialize() );
app.use( passport.session() );
app.use( helmet() );
app.use( cors() );
app.use( express.static( path.join( __dirname, 'frontend/build' ) ) );

// Connect to the database
mongoose.connect( process.env.DB_URI, {
    useNewUrlParser: true
});
    
mongoose.connection.on( 'error', () => {
    console.log( 'Could not connect to the database. Exiting now...' );
    process.exit();
});
    
mongoose.connection.on( 'connected', () => {
    console.log( 'Successfully connected to the database' );
});



/******************************* ROUTING  *******************************/

// Google Authentication
app.get( '/login', passport.authenticate( 'google', { scope: [ 'profile' ] } ) );

app.get( '/login/redirect', passport.authenticate( 'google' ), async ( req, res ) => {
    fileSystem.writeFile( USER_JSON_FILE, JSON.stringify( req.user ), ( err ) => {
        if ( err ) throw err;
        res.redirect( process.env.REACT_APP_URL );
    })
});

// Authentication using local passport
app.post( '/auth/local', async ( req, res, next ) => {
    passport.authenticate( 'local', async ( error, user, info ) => {
        if ( error ) throw error;
        else if ( !user ) return res.redirect( '/auth/local' );

        fileSystem.writeFile( USER_JSON_FILE, JSON.stringify( user ), ( fsError ) => {
            if ( fsError ) throw fsError;
            res.send( { shouldReload: true } );
        })
    })( req, res, next );
})

// Authentication using facebook
app.get( '/auth/facebook', passport.authenticate( 'facebook' ) );

app.get( '/auth/facebook/callback', 
    passport.authenticate( 'facebook', { 
        successRedirect: '/fb', 
        failureRedirect: '/auth/facebook' 
    }
));


app.get( '/fb', async ( req, res ) => {
    fileSystem.writeFile( USER_JSON_FILE, JSON.stringify( req.user ), ( err ) => {
        if ( err ) throw err;
        res.redirect( process.env.REACT_APP_URL );
    })
});


/******************************* REACT ROUTING  *******************************/

// Sends the user that is currently logged in
app.post( '/user', ( req, res ) => {
    console.log( 'full url', req.url );
    fileSystem.readFile( USER_JSON_FILE, ( err, data ) => {
        if ( err ) throw err;
        res.send( data.toString() );
    })
})

// Gets the currently signed in user
app.post( '/', async ( req, res ) => {
    fileSystem.readFile( USER_JSON_FILE, ( err, data ) => {
        if ( err ) throw err;
        res.send( data.toString() );
    })
});

// When the user wants to logout
app.post( '/logout', async ( req, res ) => {
    req.logout();
    fileSystem.writeFile( USER_JSON_FILE, '', ( err ) => {
        if ( err ) throw err;
        res.json( { shouldReload: true } );
    });
});

// Gets all the users in the database
app.post( '/users', async ( req, res ) => {
    UserModel.find( {} ).then( docs => {
       res.json( { users: Array.from( docs ) } );
    })
});

// Adds the user to the database
app.post( '/addUser', async ( req, res ) => {
    const newUser = {
        username: req.body.username,
        password: req.body.password,
        tasks: []
    };
    new UserModel( newUser )
    .save()
    .then( doc => {
        fileSystem.writeFile( USER_JSON_FILE, JSON.stringify( doc ), ( err ) => {
            if ( err ) throw err;
            res.send( 'You have been successfully added.' );
        })
    })
    .catch( reason => {
        res.send(  'Failed to add a new user, please try again or reload the page.' );
    })
});

// Saves all the tasks of the user
app.post( '/saveUser', async ( req, res ) => {
    const user = req.body;
    await UserModel.updateOne( { _id: user._id }, user );
    res.send( 'Your tasks have been successfully saved.' );
})

// Saves the user that is going to be edited by the Admin mode
app.post( '/edit-user', async ( req, res ) => {
    fileSystem.writeFile( USER_JSON_FILE, JSON.stringify( req.body ), ( err ) => {
        if ( err ) throw err;
        res.json( { isSaved: true } );
    })
})

// SERVER

app.listen( PORT, () => {
    console.log( `Listening on port ${ PORT }` );
});