import React from 'react';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import AdminUser from './components/AdminUser';
import './App.css';
const SERVER_URL = 'https://tk-to-do-app-server.herokuapp.com';

export default class App extends React.Component {
    constructor( props ) {
        super( props );
        this.state = {
            currentTask: '',
            error: null,
            isAdminUser: false,
            isLoading: true,
            isUserSignedin: false,
            isUserSigningIn: true,
            password: null,
            tasks: [],
            user: null,
            username: null,
            users: null
        };
        this.addUser = this.addUser.bind( this );
        this.createTask = this.createTask.bind( this );
        this.createUser = this.createUser.bind( this );
        this.deleteTask = this.deleteTask.bind( this );
        this.goHome = this.goHome.bind( this );
        this.logIn = this.logIn.bind( this );
        this.save = this.save.bind( this );
        this.setAdminUser = this.setAdminUser.bind( this );
        this.setCurrentTask = this.setCurrentTask.bind( this );
        this.setPassword = this.setPassword.bind( this );
        this.setTasks = this.setTasks.bind( this );
        this.setUser = this.setUser.bind( this );
        this.setUsername = this.setUsername.bind( this );
        this.shouldSignIn = this.shouldSignIn.bind( this );
        this.signInWithLocalPassport = this.signInWithLocalPassport.bind( this );
        this.signOut = this.signOut.bind( this );
        this.writeTasks = this.writeTasks.bind( this );
        this.updateUser = this.updateUser.bind( this );
    }

    // Gets all the users in the mongoDB
    componentDidMount() {
        fetch( SERVER_URL + '/user', { method: 'POST' } )
            .then( res => {
                if ( !res.ok ) throw res.statusText;
                return res.text();
            })
            .then( data => {
                console.log( 'data', data );
                if ( data !== '' ) {
                    const user = JSON.parse( data );
                    console.log( 'User signed in', user );
                    this.setUser( user );
                    this.setTasks( user.tasks );
                    this.setState({ 
                        isLoading: false,
                        user: user,
                        isUserSignedin: true
                    });
                } else {
                    this.setState({ 
                        isLoading: false,
                    });
                }
            })
            .catch( err => {
                console.log( 'err', err );
                this.setState({ 
                    isLoading: false,
                    error: 'An error occured. Please reload the page.'
                });
            })
    }

    /**
     * Creates a new task, creates an element for it and adds it to the state.
     */
    createTask() {
        let currentTask = this.state.currentTask;
        document.querySelector( 'input' ).value = null;

        // Add the new task to the state
        console.log( 'user', this.state.user );
        const tasks = this.state.tasks.slice();
        console.log( 'prevTasks', tasks );
        tasks.push( currentTask );
        this.setTasks( tasks );
        console.log( 'currentTasks', this.state.tasks );

        document.querySelector( 'ul' ).innerHTML +=
            `<li class="task-item" title='Double click to delete "${ currentTask }".'> ${ currentTask } </li>`;

        // Delets the task when it is double clicked
        window.ondblclick = ( event ) => {
            if ( event.target.tagName === 'LI' ) {
                const updatedTasks = this.state.tasks;
                for ( let task of updatedTasks ) {
                    if ( event.target.textContent.trim() === task ) {
                        let index = updatedTasks.indexOf( task );
                        updatedTasks.splice( index, 1 );
                        this.setTasks( updatedTasks );
                        event.target.remove();
                        break;
                    }
                }
            }
        }
    }

    /**
     * Creates a new users and saves them in the mongoDB
     */
    createUser() {
        fetch( SERVER_URL + '/addUser', { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: this.state.username,
                password: this.state.password,
            })
        })
        .then( res => {
            if ( !res.ok ) throw res.statusText;
            return res.text();
        })
        .then( msg => {
            alert( msg );
            window.location.reload();
        })
        .catch( err => {
            alert( err );
        })
    }

    /**
     * Adds a new user to the mognoDB via express
     */
    addUser() {
        fetch( SERVER_URL + '/addUser', { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify( this.state.user )
        })
        .then( res => {
            if ( !res.ok ) {
                throw res.statusText;
            }
            return res.text();
        })
        .then( message => {
            alert( message );
        })
        .catch( error => {
            this.setState({
                isUserSignedin: false,
                error: error
            });
        })
    }

    /**
     * 
     * @param { Event } event 
     */
    deleteTask( event ) {
        const taskToDelete = event.target.textContent.trim();
        let newTasks = [];
        for ( const task of this.state.tasks ) {
            if ( task === taskToDelete ) {
                event.target.remove();
            } else {
                newTasks.push( task );
            }
        }
        this.setTasks( newTasks );
    }

    /**
     * Goes to the homepage from the admin page
     */
    goHome() {
        this.setState({
            isAdminUser: false
        })
    }

    /**
     * @param { Event } event
     * 
     * Create a new account for the user or logs them in. Depending on what they want to do
     */
    logIn( event ) {
        if ( this.state.isUserSigningIn ) {
            this.signInWithLocalPassport();
        } else {
            this.createUser();
        }
    }

    save() {
        const user = this.state.user;
        user.tasks = this.state.tasks;
        
        fetch( SERVER_URL + '/saveUser', { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify( user )
        })
        .then( res => {
            if ( !res.ok ) {
                throw res.statusText;
            }
            return res.text();
        })
        .then( message => {
            alert( message );
        })
        .catch( error => {
            this.setState({
                isUserSignedin: false,
                error: error
            });
        })
    }

    /**
     * Goes to the Admin User apge
     */
    async setAdminUser() {
        const res = await fetch( SERVER_URL + '/users', { method: 'POST' } );
        if ( !res.ok ) throw res.statusText;
        const data = await res.json();
        this.setState({
            isAdminUser: true,
            users: data.users
        });
        this.forceUpdate();
    }

    /**
     * @param { Event } event 
     * 
     * Sets a new password for the user that will log in or sign up with us
     */
    setPassword( event ) {
        this.setState({
            password: event.target.value
        });
    }

    /**
     * @param { Array } newTasks 
     * Adds a new array of tasks in the state
     */
    setTasks( newTasks ) {
        this.setState({
            tasks: newTasks
        })
    }

    /**
     * @param { Event } event
     * 
     * Gets the text that the user entered in the input box and sets it as a current task.
     */
    setCurrentTask( event ) {
        this.setState({
            currentTask: event.target.value
        });
    }

    /**
     * @param { Object } newUser 
     * 
     * Sets a new user in the state as the one that is currently active
     */
    setUser( newUser ) {
        this.setState({ 
            user: newUser,
            isUserSignedin: true,
            isUserSigningIn: false
        });
        console.log( 'setUser', newUser )
    }

    /**
     * 
     * @param { Event } event 
     * 
     * Sets the username of a new user that will be created
     */
    setUsername( event ) {
        this.setState( { username: event.target.value } );
    }

    /**
     * @param { Boolean } choice 
     * 
     * Decides wether to sign in or create a new account for the user
     */
    shouldSignIn( choice ) {
        const btn = document.querySelector( '.action-button' );
        if ( choice ) btn.textContent = 'Sign In';
        else btn.textContent = 'Sign Up';
        this.setState( { isUserSigningIn: choice } );
    }

    /**
     * Sign's the user in with local passport
     */
    signInWithLocalPassport() {
        fetch( SERVER_URL + '/auth/local', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: this.state.username,
                password: this.state.password
            })
        })
        .then( res => {
            if ( !res.ok ) throw res.statusText;
            return res.json();
        })
        .then( data => {
            if ( data.shouldReload ) window.location.reload();
        })
        .catch( err => {
            throw err;
            
        })
    }

    /**
     * Signs out the user that is currently signed in
     */
    signOut() {
        fetch( SERVER_URL + '/logout', { method: 'POST' } )
        .then( res => {
            if ( !res.ok ) throw res.statusText;
            return res.json();
        })
        .then( data => {
            if ( data.shouldReload ) window.location.reload();
        })
        .catch( err => {
            this.setState({
                error: err
            });
            throw err;
        })
    }

    /**
     * @returns { tasksElem }
     * 
     * Creates and returns the elems for all the tasks of the user
     */
    writeTasks() {
        const tasks = this.state.user.tasks;
        if ( tasks.length > 0 ) {
            return tasks.map( task =>
                <li key={ task } className='task-item' title={ `Double click to delete "${ task }".` }
                    onDoubleClick={ this.deleteTask }> { task } </li>
            );
        }
        return '';
    }

    /**
     * @param { Object } newUser 
     * 
     * Updates the user in the state from the AdminUser
     */
    updateUser( newUser ) {
        this.setState( { user: newUser } );
        console.log( 'updateUser', newUser );
    }

    render() {
        let { isUserSignedin, isLoading, user, isAdminUser, error } = this.state;

        // The page is still loading
        if ( isLoading ) {
            return <div> Loading... </div>;
        }

        // If there is an error
        if ( error ) {
            return <div> { error } </div>
        }

        // The user is in Admin Mode
        if ( isAdminUser ) {
            return (
                <main>
                    <h1 className='layout mdc-elevation--z6'> To-Do App </h1>
                    <div className='sheet layout mdc-elevation--z6'>
                        <AdminUser 
                            goHome={ this.goHome }
                            SERVER_URL={ SERVER_URL }
                            users={ this.state.users } />
                    </div>
                </main>
            );
        }

        // The user has not signed in, show them a window to sign in with
        if ( !isUserSignedin ) {
            return (
                <main>
                    <h1 className='layout mdc-elevation--z6'> To-Do App </h1>
                    <div className='sheet layout mdc-elevation--z6'>
                        <Button onClick={ this.setAdminUser }
                                color="primary"
                                variant="contained"> Admin User </Button>
                        <div>
                            <TextField
                                label="Username"
                                type="text"
                                variant="outlined"
                                onInput={ this.setUsername }
                            />
                            <br />
                            <br />
                            <TextField
                                label="Password"
                                type="password"
                                variant="outlined"
                                onInput={ this.setPassword }
                            />
                            <br />
                            <br />
                            <div> I am: </div>
                            <input type='radio' name='account' onChange={ () => { this.shouldSignIn( false ) } } />
                            <label> Creating a new account. </label>
                            <br />
                            <input type='radio' name='account' onChange={ () => { this.shouldSignIn( true ) } } defaultChecked />
                            <label> Signing in </label>
                        </div>

                        <Button onClick={ this.logIn }
                                className='action-button'
                                color="primary"
                                variant="contained"> Sign In </Button>

                        <hr />
                        <p> Or you can sign up/login with: </p>
                        
                        <Button onClick={ () => { window.location.href = SERVER_URL + "/auth/facebook" } }
                                color="primary"
                                variant="contained"> Facebook </Button>

                        <Button onClick={ () => { window.location.href = SERVER_URL + "/login" } }
                                color="primary"
                                variant="contained"> Google </Button>
                    </div>
                </main>
            )
        }


        // The user is signed in
        return (
            <main>
                <h1 className='layout mdc-elevation--z6'> To-Do App </h1>
                <div className='sheet layout mdc-elevation--z6'>
                    <div className='margin'> 
                        Signed in as <b>{ user.username }</b>
                        <Button variant="contained"  color="primary" className='user-button' onClick={ this.signOut }> Sign Out </Button>
                    </div>
                    <hr />
                    <h3> What needs to be done? </h3>
                    <ul> { this.writeTasks() } </ul>
                    
                    <TextField
                        id="outlined-password-input"
                        label="Task"
                        type="text"
                        variant="outlined"
                        onInput={ this.setCurrentTask }
                    />
                    <br />
                    <Button variant="contained" color="primary" onClick={ this.save }> Save </Button>
                    <br />
                    <Button variant="contained" className='lastButton' color="primary" onClick={ this.createTask }> Add </Button>
                </div>
            </main>
        )
    }
}