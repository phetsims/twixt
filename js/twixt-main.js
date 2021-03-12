// Copyright 2017-2020, University of Colorado Boulder

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
import twixtStrings from './twixtStrings.js';

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
        name: 'Animation',
        backgroundColorProperty: new Property( 'white' )
      }
    ),
    new Screen(
      ( () => {
        return {};
      } ),
      ( model => new DampedMotionScreenView() ),
      {
        name: 'Damped Motion',
        backgroundColorProperty: new Property( 'white' )
      }
    ),
    new Screen(
      ( () => {
        return {};
      } ),
      ( model => new TransitionsScreenView() ),
      {
        name: 'Transitions',
        backgroundColorProperty: new Property( 'white' )
      }
    )
  ];

  new Sim( twixtStrings.twixt.title, screens, simOptions ).start();
} );