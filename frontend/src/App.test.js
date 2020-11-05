import packageJSON from './../package.json';

test( 'Loads package.json correctly', () => {
  console.log( 'Package.json is loaded with version', packageJSON.version );
})