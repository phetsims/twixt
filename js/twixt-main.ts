// Copyright 2017-2024, University of Colorado Boulder

/**
 * Main file for the Twixt demo.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Property from '../../axon/js/Property.js';
import Screen from '../../joist/js/Screen.js';
import Sim, { SimOptions } from '../../joist/js/Sim.js';
import simLauncher from '../../joist/js/simLauncher.js';
import TModel from '../../joist/js/TModel.js';
import Tandem from '../../tandem/js/Tandem.js';
import AnimationScreenView from './demo/AnimationScreenView.js';
import DampedMotionScreenView from './demo/DampedMotionScreenView.js';
import TransitionsScreenView from './demo/TransitionsScreenView.js';
import TwixtStrings from './TwixtStrings.js';

class EmptyModel implements TModel {
  public reset(): void {
    // do nothing
  }
}

simLauncher.launch( () => {

  const screens = [
    new Screen<EmptyModel, AnimationScreenView>(
      () => new EmptyModel(),
      model => new AnimationScreenView(),
      {
        name: TwixtStrings.screen.animationStringProperty,
        backgroundColorProperty: new Property( 'white' ),
        tandem: Tandem.OPT_OUT
      }
    ),
    new Screen(
      () => new EmptyModel(),
      model => new DampedMotionScreenView(),
      {
        name: TwixtStrings.screen.dampedMotionStringProperty,
        backgroundColorProperty: new Property( 'white' ),
        tandem: Tandem.OPT_OUT
      }
    ),
    new Screen(
      () => new EmptyModel(),
      model => new TransitionsScreenView(),
      {
        name: TwixtStrings.screen.transitionsStringProperty,
        backgroundColorProperty: new Property( 'white' ),
        tandem: Tandem.OPT_OUT
      }
    )
  ];

  const simOptions: SimOptions = {
    credits: {
      leadDesign: 'PhET'
    }
  };

  new Sim( TwixtStrings.twixt.titleStringProperty, screens, simOptions ).start();
} );