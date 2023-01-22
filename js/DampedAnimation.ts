// Copyright 2017-2023, University of Colorado Boulder

/**
 * WARNING: PROTOTYPE, see https://github.com/phetsims/twixt/issues/3 before using!
 * Not fully documented or stabilized. May be deleted.
 *
 * Handles a single dimension of damped harmonic-oscillator motion (like a damped spring pulling towards the target).
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import TinyProperty from '../../axon/js/TinyProperty.js';
import TProperty from '../../axon/js/TProperty.js';
import DampedHarmonic from '../../dot/js/DampedHarmonic.js';
import optionize from '../../phet-core/js/optionize.js';
import twixt from './twixt.js';

export type DampedAnimationOptions = {
  // The current value/position.
  valueProperty?: TProperty<number>;

  // The current derivative of the value
  velocityProperty?: TProperty<number>;

  // Proportion of damping applied, relative to critical damping. Thus:
  // - damping = 1: Critically damped (fastest approach towards the target without overshooting)
  // - damping < 1: Underdamped (will overshoot the target with exponentially-decaying oscillation)
  // - damping > 1: Overdamped (will approach with an exponential curve)
  damping?: number;

  // Coefficient that determines the amount of force "pushing" towards the target (will be proportional
  // to the distance from the target).
  force?: number;

  // The target value that we are animating towards.
  targetValue?: number;
};

class DampedAnimation {

  public readonly valueProperty: TProperty<number>;
  public readonly velocityProperty: TProperty<number>;

  private _damping: number;
  private _force: number;
  private _targetValue: number;
  private harmonic!: DampedHarmonic;

  public timeElapsed = 0;

  public constructor( providedOptions?: DampedAnimationOptions ) {
    const options = optionize<DampedAnimationOptions, DampedAnimationOptions>()( {
      valueProperty: new TinyProperty( 0 ),
      velocityProperty: new TinyProperty( 0 ),
      damping: 1,
      force: 1,
      targetValue: 0
    }, providedOptions );

    this.valueProperty = options.valueProperty;
    this.velocityProperty = options.velocityProperty;

    this._damping = options.damping;
    this._force = options.force;
    this._targetValue = options.targetValue;

    this.recompute();
  }

  /**
   * Returns the target value
   */
  public get targetValue(): number {
    return this._targetValue;
  }

  /**
   * Change the target value that we are moving toward.
   */
  public set targetValue( value: number ) {
    this._targetValue = value;

    this.recompute();
  }

  /**
   * Returns the damping value
   */
  public get damping(): number {
    return this._damping;
  }

  /**
   * Sets the damping value.
   */
  public set damping( value: number ) {
    this._damping = value;

    this.recompute();
  }

  /**
   * Returns the force value
   */
  public get force(): number {
    return this._force;
  }

  /**
   * Sets the force value.
   */
  public set force( value: number ) {
    this._force = value;

    this.recompute();
  }

  /**
   * On a change, we need to recompute our harmonic (that plots out the motion to the target)
   */
  private recompute(): void {
    this.timeElapsed = 0;
    this.harmonic = new DampedHarmonic( 1, Math.sqrt( 4 * this._force ) * this._damping, this._force, this.valueProperty.value - this._targetValue, this.velocityProperty.value );
  }

  /**
   * Steps the animation forward in time.
   */
  public step( dt: number ): void {
    this.timeElapsed += dt;

    this.valueProperty.value = this._targetValue + this.harmonic.getValue( this.timeElapsed );
    this.velocityProperty.value = this.harmonic.getDerivative( this.timeElapsed );
  }
}

twixt.register( 'DampedAnimation', DampedAnimation );
export default DampedAnimation;