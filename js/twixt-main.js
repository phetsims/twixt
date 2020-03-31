// Copyright 2017-2020, University of Colorado Boulder

/**
 * Main file for the Twixt demo.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Property from '../../axon/js/Property.js';
import Screen from '../../joist/js/Screen.js';
import Sim from '../../joist/js/Sim.js';
import SimLauncher from '../../joist/js/SimLauncher.js';
import AnimationView from './demo/AnimationView.js';
import DampedMotionView from './demo/DampedMotionView.js';
import TransitionDemoView from './demo/TransitionDemoView.js';
import twixtStrings from './twixtStrings.js';

const twixtTitleString = twixtStrings.twixt.title;

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