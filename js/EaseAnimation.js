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

  /**
   * @constructor
   */
  function EaseAnimation( easing, options ) {
    options = _.extend( {
      valueProperty: new Property( 0 ),
      velocityProperty: new Property( 0 ),
      ratioProperty: new Property( 0 ),
      duration: 1,
      targetValue: 0
    }, options );

    this.easing = easing;
    this.valueProperty = options.valueProperty;
    this.velocityProperty = options.velocityProperty;
    this.ratioProperty = options.ratioProperty;

    this.duration = null; // set in retarget
    this.targetValue = null; // set in retarget
    this.initialValue = null; // set in retarget
    this.initialVelocity = null; // set in retarget
    this.difference = null; // set in retarget

    this.retarget( options.targetValue, options.duration );
  }

  twixt.register( 'EaseAnimation', EaseAnimation );

  return inherit( Object, EaseAnimation, {
    retarget: function( targetValue, duration ) {
      this.targetValue = targetValue;
      this.ratioProperty.value = 0;
      this.duration = duration;

      this.initialValue = this.valueProperty.value;
      this.initialVelocity = this.velocityProperty.value;
      this.difference = this.targetValue - ( this.initialValue + this.initialVelocity * this.duration );
    },

    setRatio: function( ratio ) {
      var elapsedTime = this.duration * ratio;
      this.ratioProperty.value = ratio;
      this.valueProperty.value = this.initialValue + this.initialVelocity * elapsedTime + this.difference * this.easing.value( ratio );
      this.velocityProperty.value = this.initialVelocity + this.difference * this.easing.derivative( ratio );
    },

    step: function( dt ) {
      if ( this.ratioProperty.value < 1 ) {
        var newRatio = this.ratioProperty.value + dt / this.duration;
        var overflowRatio = 0;
        if ( newRatio > 1 ) {
          overflowRatio = newRatio - 1;
          newRatio = 1;
        }

        this.setRatio( newRatio );

        if ( newRatio === 1 ) {
          this.velocityProperty.value = 0;
        }

        // TODO: chain?
        return overflowRatio;
      }
      else {
        return dt;
      }
    }
  } );
} );
