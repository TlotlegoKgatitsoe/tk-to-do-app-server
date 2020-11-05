describe( 'Express Text', () => {
  it( 'Calculates French number format.', async done => {
    const EXPECTED_RESULT = '123,456,789';
    const numberToTest = 123456789;
    const res = new Intl.NumberFormat( 'fr' ).format( numberToTest );

    if ( res === EXPECTED_RESULT ) {
      done();
    } else {
      done( new Error( "An error occured!" ) );
    }
  })
}) 