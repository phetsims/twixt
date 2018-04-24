// Copyright 2017, University of Colorado Boulder

/**
 * Main file for the Twixt demo.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( function( require ) {
  'use strict';

  // modules
  var AnimationView = require( 'TWIXT/demo/AnimationView' );
  var DampedMotionView = require( 'TWIXT/demo/DampedMotionView' );
  var Property = require( 'AXON/Property' );
  var Screen = require( 'JOIST/Screen' );
  var Sim = require( 'JOIST/Sim' );
  var SimLauncher = require( 'JOIST/SimLauncher' );
  var TransitionDemoView = require( 'TWIXT/demo/TransitionDemoView' );

  // strings
  var twixtTitleString = require( 'string!TWIXT/twixt.title' );

  var simOptions = {
    credits: {
      leadDesign: 'PhET'
    }
  };

  SimLauncher.launch( function() {

    var screens = [
      new Screen(
        function() { return {}; },
        function( model ) { return new AnimationView(); },
        {
          name: 'Animation',
          backgroundColorProperty: new Property( 'white' )
        }
      ),
      new Screen(
        function() { return {}; },
        function( model ) { return new DampedMotionView(); },
        {
          name: 'Damped Motion',
          backgroundColorProperty: new Property( 'white' )
        }
      ),
      new Screen(
        function() { return {}; },
        function( model ) { return new TransitionDemoView(); },
        {
          name: 'Transitions',
          backgroundColorProperty: new Property( 'white' )
        }
      )
    ];

    new Sim( twixtTitleString, screens, simOptions ).start();
  } );
} );
