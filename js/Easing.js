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

  /**
   * @constructor
   */
  function Easing() {

  }

  twixt.register( 'Easing', Easing );

  inherit( Object, Easing, {
    value: function( t ) {
      throw new Error( 'Unimplemented easing value' );
    },

    derivative: function( t ) {
      throw new Error( 'Unimplemented easing derivative' );
    },

    secondDerivative: function( t ) {
      throw new Error( 'Unimplemented easing secondDerivative' );
    },

    estimateDerivative: function( t ) {
      return ( this.value( t + 1e-5 ) - this.value( t - 1e-5 ) ) / 2e-5;
    },

    estimateSecondDerivative: function( t ) {
      return ( this.value( t + 1e-5 ) + 2 * this.value( t ) + this.value( t - 1e-5 ) ) / (1e-5*1e-5);
    }
  } );

  Easing.polynomialEaseInValue = function( n, t ) {
    assert && assert( typeof t === 'number' && isFinite( t ) && t >= 0 && t <= 1 );

    return Math.pow( t, n );
  };

  Easing.polynomialEaseOutValue = function( n, t ) {
    assert && assert( typeof t === 'number' && isFinite( t ) && t >= 0 && t <= 1 );

    return 1 - Math.pow( 1 - t, n );
  };

  Easing.polynomialEaseInOutValue = function( n, t ) {
    assert && assert( typeof t === 'number' && isFinite( t ) && t >= 0 && t <= 1 );

    if ( t <= 0.5 ) {
      return 0.5 * Math.pow( 2 * t, n );
    }
    else {
      return 1 - Easing.polynomialEaseInOutValue( n, 1 - t );
    }
  };

  Easing.polynomialEaseInDerivative = function( n, t ) {
    assert && assert( typeof t === 'number' && isFinite( t ) && t >= 0 && t <= 1 );

    return n * Math.pow( t, n - 1 );
  };

  Easing.polynomialEaseOutDerivative = function( n, t ) {
    assert && assert( typeof t === 'number' && isFinite( t ) && t >= 0 && t <= 1 );

    return n * Math.pow( 1 - t, n - 1 );
  };

  Easing.polynomialEaseInOutDerivative = function( n, t ) {
    assert && assert( typeof t === 'number' && isFinite( t ) && t >= 0 && t <= 1 );

    if ( t <= 0.5 ) {
      return Math.pow( 2, n - 1 ) * n * Math.pow( t, n - 1 );
    } else {
      return Easing.polynomialEaseInOutDerivative( n, 1 - t );
    }
  };

  Easing.polynomialEaseInSecondDerivative = function( n, t ) {
    assert && assert( typeof t === 'number' && isFinite( t ) && t >= 0 && t <= 1 );

    return ( n - 1 ) * n * Math.pow( t, n - 2 );
  };

  Easing.polynomialEaseOutSecondDerivative = function( n, t ) {
    assert && assert( typeof t === 'number' && isFinite( t ) && t >= 0 && t <= 1 );

    return -( n - 1 ) * n * Math.pow( 1 - t, n - 2 );
  };

  Easing.polynomialEaseInOutSecondDerivative = function( n, t ) {
    assert && assert( typeof t === 'number' && isFinite( t ) && t >= 0 && t <= 1 );

    if ( t <= 0.5 ) {
      return Math.pow( 2, n - 1 ) * ( n - 1 ) * n * Math.pow( t, n - 2 );
    } else {
      return -Easing.polynomialEaseInOutSecondDerivative( n, 1 - t );
    }
  };

  Easing.polynomialEaseIn = function( n ) {
    var easing = new Easing();
    easing.value = Easing.polynomialEaseInValue.bind( easing, n );
    easing.derivative = Easing.polynomialEaseInDerivative.bind( easing, n );
    easing.secondDerivative = Easing.polynomialEaseInSecondDerivative.bind( easing, n );
    return easing;
  };

  Easing.polynomialEaseOut = function( n ) {
    var easing = new Easing();
    easing.value = Easing.polynomialEaseOutValue.bind( easing, n );
    easing.derivative = Easing.polynomialEaseOutDerivative.bind( easing, n );
    easing.secondDerivative = Easing.polynomialEaseOutSecondDerivative.bind( easing, n );
    return easing;
  };

  Easing.polynomialEaseInOut = function( n ) {
    var easing = new Easing();
    easing.value = Easing.polynomialEaseInOutValue.bind( easing, n );
    easing.derivative = Easing.polynomialEaseInOutDerivative.bind( easing, n );
    easing.secondDerivative = Easing.polynomialEaseInOutSecondDerivative.bind( easing, n );
    return easing;
  };

  Easing.LINEAR = Easing.polynomialEaseIn( 1 );

  Easing.QUADRATIC_IN = Easing.polynomialEaseIn( 2 );
  Easing.QUADRATIC_OUT = Easing.polynomialEaseOut( 2 );
  Easing.QUADRATIC_IN_OUT = Easing.polynomialEaseInOut( 2 );

  Easing.CUBIC_IN = Easing.polynomialEaseIn( 3 );
  Easing.CUBIC_OUT = Easing.polynomialEaseOut( 3 );
  Easing.CUBIC_IN_OUT = Easing.polynomialEaseInOut( 3 );

  Easing.QUARTIC_IN = Easing.polynomialEaseIn( 4 );
  Easing.QUARTIC_OUT = Easing.polynomialEaseOut( 4 );
  Easing.QUARTIC_IN_OUT = Easing.polynomialEaseInOut( 4 );

  Easing.QUINTIC_IN = Easing.polynomialEaseIn( 5 );
  Easing.QUINTIC_OUT = Easing.polynomialEaseOut( 5 );
  Easing.QUINTIC_IN_OUT = Easing.polynomialEaseInOut( 5 );

  return Easing;
} );
