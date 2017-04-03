// Copyright 2017, University of Colorado Boulder

/**
 * WARNING: PROTOTYPE, see https://github.com/phetsims/twixt/issues/3 before using!
 * Not fully documented or stabilized. May be deleted.
 *
 * Handles a single dimension of damped harmonic-oscillator motion (like a damped spring pulling towards the target).
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var twixt = require( 'TWIXT/twixt' );
  var Property = require( 'AXON/Property' );
  var DampedHarmonic = require( 'DOT/DampedHarmonic' );

  /**
   * @constructor
   */
  function DampedAnimation( options ) {
    options = _.extend( {
      // {Property.<number>} - The current value/location.
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

    // TODO: decide on visibility annotations
    this.valueProperty = options.valueProperty;
    this.velocityProperty = options.velocityProperty;

    // TODO: support mutation?
    this.damping = options.damping;
    this.force = options.force;

    this.timeElapsed = 0;

    this.targetValue = options.targetValue; // Sets this._targetValue
  }

  twixt.register( 'DampedAnimation', DampedAnimation );

  return inherit( Object, DampedAnimation, {
    // Change the target value that we are moving towards.
    set targetValue( value ) {
      this._targetValue = value;
      this.recompute();
    },

    // On a change, we need to recompute our harmonic (that plots out the motion to the target)
    recompute: function() {
      this.timeElapsed = 0;
      this.harmonic = new DampedHarmonic( 1, Math.sqrt( 4 * this.force ) * this.damping, this.force, this.valueProperty.value - this._targetValue, this.velocityProperty.value );
    },

    step: function( dt ) {
      this.timeElapsed += dt;

      this.valueProperty.value = this._targetValue + this.harmonic.getValue( this.timeElapsed );
      this.velocityProperty.value = this.harmonic.getDerivative( this.timeElapsed );
    }
  } );
} );
