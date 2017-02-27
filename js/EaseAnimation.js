// Copyright 2016, University of Colorado Boulder

/**
 * WARNING: PROTOTYPE, see https://github.com/phetsims/twixt/issues/3 before using!
 * Not fully documented or stabilized. May be deleted.
 *
 * Allows animations with different easing/durations. Based on deltas, so that animations can be stacked.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var twixt = require( 'TWIXT/twixt' );
  var Easing = require( 'TWIXT/Easing' );

  /**
   * @constructor
   */
  function EaseAnimation( options ) {
    options = _.extend( {
      easing: Easing.CUBIC_IN_OUT,
      duration: 1,
      initialValue: 0,
      targetValue: 0,

      delta: null
    }, options );

    this.easing = options.easing;
    this.duration = options.duration;

    this.ratio = 0;
    this.totalDelta = options.targetValue - options.initialValue;
    this.deltaCallback = options.delta;
  }

  twixt.register( 'EaseAnimation', EaseAnimation );

  return inherit( Object, EaseAnimation, {
    step: function( dt ) {
      var oldRatio = this.ratio;

      if ( oldRatio < 1 ) {
        var newRatio = oldRatio + dt / this.duration;
        var overflowRatio = 0;
        if ( newRatio > 1 ) {
          overflowRatio = newRatio - 1;
          newRatio = 1;
        }

        this.ratio = newRatio;

        var ratioDelta = this.easing.value( newRatio ) - this.easing.value( oldRatio );

        this.deltaCallback && this.deltaCallback( ratioDelta * this.totalDelta );

        return overflowRatio;
      }
      else {
        return dt;
      }
    }
  } );
} );
