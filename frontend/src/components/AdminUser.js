import React from 'react';
import Button from '@material-ui/core/Button';
import './AdminUser.css';

export default ( props ) => {
  let num = 1;

  async function editTasks( user ) {
    // Saves the user in user.json
    const res = await fetch(  props.SERVER_URL + '/edit-user', { 
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify( user )
    });
    if ( !res.ok ) throw res.statusText;
    const data = await res.json();
    if ( data.isSaved ) window.location.reload();
    else throw new Error( 'The user to edit was not saved in the json file' );
  }

  return (
    <div>
      <div>
        <Button color="primary" onClick={ () => { props.goHome() } }> Back </Button>
      </div>
      <p> Click on any user to edit their tasks </p>
      <table className='table' border='1'><tbody>
        <tr className='first-row'>
          <td className='tr-number'> No. </td>
          <td className='tr-name'> Username </td>
          <td className='tr-tasks'> Tasks </td>
        </tr>
        {
          props.users.map( user => 
            <tr key={ user.username } className='row-data' onClick={ () => { editTasks( user ) } }>
              <td className='tr-number td-data'> { num++ } </td>
              <td className='tr-name td-data'> { user.username } </td>
              <td className='tr-tasks td-data'> { new Intl.ListFormat( 'en' ).format( user.tasks ) } </td>
            </tr>
          )
        }
      </tbody></table>
    </div>
  )
}