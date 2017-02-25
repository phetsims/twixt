// Copyright 2016, University of Colorado Boulder

/**
 * TODO: doc
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
      valueProperty: new Property( 0 ),
      velocityProperty: new Property( 0 ),
      damping: 1, // 1: critically damped
      force: 1,
      targetValue: 0
    }, options );

    this.valueProperty = options.valueProperty;
    this.velocityProperty = options.velocityProperty;

    // TODO: support mutation?
    this.damping = options.damping;
    this.force = options.force;

    this.timeElapsed = 0;

    this.targetValue = null; // set in retarget

    this.retarget( options.targetValue );
  }

  twixt.register( 'DampedAnimation', DampedAnimation );

  return inherit( Object, DampedAnimation, {
    retarget: function( targetValue ) {
      this.targetValue = targetValue;
      this.recompute();
    },

    recompute: function() {
      this.timeElapsed = 0;
      this.harmonic = new DampedHarmonic( 1, Math.sqrt( 4 * this.force ) * this.damping, this.force, this.valueProperty.value - this.targetValue, this.velocityProperty.value );
    },

    step: function( dt ) {
      this.timeElapsed += dt;

      this.valueProperty.value = this.targetValue + this.harmonic.getValue( this.timeElapsed );
      this.velocityProperty.value = this.harmonic.getDerivative( this.timeElapsed );
    }
  } );
} );
