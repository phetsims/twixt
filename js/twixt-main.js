// Copyright 2017-2018, University of Colorado Boulder

/**
 * Main file for the Twixt demo.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( require => {
  'use strict';

  // modules
  const AnimationView = require( 'TWIXT/demo/AnimationView' );
  const DampedMotionView = require( 'TWIXT/demo/DampedMotionView' );
  const Property = require( 'AXON/Property' );
  const Screen = require( 'JOIST/Screen' );
  const Sim = require( 'JOIST/Sim' );
  const SimLauncher = require( 'JOIST/SimLauncher' );
  const TransitionDemoView = require( 'TWIXT/demo/TransitionDemoView' );

  // strings
  const twixtTitleString = require( 'string!TWIXT/twixt.title' );

  const simOptions = {
    credits: {
      leadDesign: 'PhET'
    }
  };

  SimLauncher.launch( function() {

    const screens = [
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
