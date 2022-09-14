// Copyright 2017-2022, University of Colorado Boulder

/**
 * Main file for the Twixt demo.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Property from '../../axon/js/Property.js';
import Screen from '../../joist/js/Screen.js';
import Sim from '../../joist/js/Sim.js';
import simLauncher from '../../joist/js/simLauncher.js';
import AnimationScreenView from './demo/AnimationScreenView.js';
import DampedMotionScreenView from './demo/DampedMotionScreenView.js';
import TransitionsScreenView from './demo/TransitionsScreenView.js';
import TwixtStrings from './TwixtStrings.js';

const simOptions = {
  credits: {
    leadDesign: 'PhET'
  }
};

simLauncher.launch( () => {

  const screens = [
    new Screen(
      ( () => {
        return {};
      } ),
      ( model => new AnimationScreenView() ),
      {
        name: new Property( 'Animation' ),
        backgroundColorProperty: new Property( 'white' )
      }
    ),
    new Screen(
      ( () => {
        return {};
      } ),
      ( model => new DampedMotionScreenView() ),
      {
        name: new Property( 'Damped Motion' ),
        backgroundColorProperty: new Property( 'white' )
      }
    ),
    new Screen(
      ( () => {
        return {};
      } ),
      ( model => new TransitionsScreenView() ),
      {
        name: new Property( 'Transitions' ),
        backgroundColorProperty: new Property( 'white' )
      }
    )
  ];

  new Sim( TwixtStrings.twixt.titleStringProperty, screens, simOptions ).start();
} );