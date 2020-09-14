// Copyright 2017-2020, University of Colorado Boulder

/**
 * WARNING: PROTOTYPE, see https://github.com/phetsims/twixt/issues/3 before using!
 * Not fully documented or stabilized. May be deleted.
 *
 * Handles a single dimension of damped harmonic-oscillator motion (like a damped spring pulling towards the target).
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Property from '../../axon/js/Property.js';
import DampedHarmonic from '../../dot/js/DampedHarmonic.js';
import merge from '../../phet-core/js/merge.js';
import twixt from './twixt.js';

class DampedAnimation {

  /**
   * @param {Object} [options]
   */
  constructor( options ) {
    options = merge( {

      // {Property.<number>} - The current value/position.
      valueProperty: new Property( 0 ),

      // {Property.<number>} - The current derivative of the value
      velocityProperty: new Property( 0 ),

      // {number} - Proportion of damping applied, relative to critical damping. Thus:
      // - damping = 1: Critically damped (fastest approach towards the target without overshooting)
      // - damping < 1: Underdamped (will overshoot the target with exponentially-decaying oscillation)
      // - damping > 1: Overdamped (will approach with an exponential curve)
      damping: 1,

      // {number} - Coefficient that determines the amount of force "pushing" towards the target (will be proportional
      // to the distance from the target).
      force: 1,

      // {number} - The target value that we are animating towards.
      targetValue: 0
    }, options );

    // @public {Property.<number>}
    this.valueProperty = options.valueProperty;
    this.velocityProperty = options.velocityProperty;

    // @private {number}
    this._damping = options.damping;
    this._force = options.force;

    // @public {number}
    this.timeElapsed = 0;

    // @private {number}
    this._targetValue = options.targetValue;
  }

  /**
   * Returns the target value
   * @public
   *
   * @returns {number}
   */
  get targetValue() {
    return this._targetValue;
  }

  /**
   * Change the target value that we are moving toward.
   * @public
   *
   * @param {number} value
   */
  set targetValue( value ) {
    this._targetValue = value;

    this.recompute();
  }

  /**
   * Returns the damping value
   * @public
   *
   * @returns {number}
   */
  get damping() {
    return this._damping;
  }

  /**
   * Sets the damping value.
   * @public
   *
   * @param {number} value
   */
  set damping( value ) {
    this._damping = value;

    this.recompute();
  }

  /**
   * Returns the force value
   * @public
   *
   * @returns {number}
   */
  get force() {
    return this._force;
  }

  /**
   * Sets the force value.
   * @public
   *
   * @param {number} value
   */
  set force( value ) {
    this._force = value;

    this.recompute();
  }

  /**
   * On a change, we need to recompute our harmonic (that plots out the motion to the target)
   * @private
   */
  recompute() {
    this.timeElapsed = 0;
    this.harmonic = new DampedHarmonic( 1, Math.sqrt( 4 * this._force ) * this._damping, this._force, this.valueProperty.value - this._targetValue, this.velocityProperty.value );
  }

  /**
   * Steps the animation forward in time.
   * @public
   *
   * @param {number} dt
   */
  step( dt ) {
    this.timeElapsed += dt;

    this.valueProperty.value = this._targetValue + this.harmonic.getValue( this.timeElapsed );
    this.velocityProperty.value = this.harmonic.getDerivative( this.timeElapsed );
  }
}

twixt.register( 'DampedAnimation', DampedAnimation );
export default DampedAnimation;