// Copyright 2017-2020, University of Colorado Boulder

/**
 * An Easing represents a function from the range [0,1] => [0,1] where f(0)=0 and f(1)=1. It is helpful for animation,
 * to give a more 'natural' feeling.
 *
 * Contains an implementation of generalized polynomial easing functions (where the 'in' version simply takes the input
 * to a specific power, and other functions are generalized). These should be equivalent to the polynomial tweens that
 * TWEEN.js uses, where t is The linear ratio [0,1] of the animation.
 *
 * TODO #23 create unit tests
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import twixt from './twixt.js';

class Easing {

  /**
   * @protected
   */
  constructor() {}

  /**
   * Returns the result of applying our easing function to the input value.
   * @public
   * @abstract
   *
   * @param {number} t - The linear ratio [0,1] of the animation
   * @returns {number} - Should be in the range [0,1].
   */
  value( t ) {
    throw new Error( 'Unimplemented easing value' );
  }

  /**
   * Returns the first derivative of our easing function at the input value.
   * @public
   * @abstract
   *
   * @param {number} t - The linear ratio [0,1] of the animation
   * @returns {number}
   */
  derivative( t ) {
    throw new Error( 'Unimplemented easing derivative' );
  }

  /**
   * Returns the second derivative of our easing function at the input value.
   * @public
   * @abstract
   *
   * @param {number} t - The linear ratio [0,1] of the animation
   * @returns {number}
   */
  secondDerivative( t ) {
    throw new Error( 'Unimplemented easing secondDerivative' );
  }

  /**
   * The "polynomial ease in" function.
   * @public
   *
   * @param {number} n - The degree of the polynomial (does not have to be an integer!)
   * @param {number} t - The linear ratio [0,1] of the animation
   * @returns {number}
   */
  static polynomialEaseInValue( n, t ) {
    assert && assert( tIsValid( t ), `invalid t: ${t}` );

    return Math.pow( t, n );
  }

  /**
   * The "polynomial ease out" function.
   * @public
   *
   * @param {number} n - The degree of the polynomial (does not have to be an integer!)
   * @param {number} t - The linear ratio [0,1] of the animation
   * @returns {number}
   */
  static polynomialEaseOutValue( n, t ) {
    assert && assert( tIsValid( t ), `invalid t: ${t}` );

    return 1 - Math.pow( 1 - t, n );
  }

  /**
   * The "polynomial ease in-out" function.
   * @public
   *
   * @param {number} n - The degree of the polynomial (does not have to be an integer!)
   * @param {number} t - The linear ratio [0,1] of the animation
   * @returns {number}
   */
  static polynomialEaseInOutValue( n, t ) {
    assert && assert( tIsValid( t ), `invalid t: ${t}` );

    if ( t <= 0.5 ) {
      return 0.5 * Math.pow( 2 * t, n );
    }
    else {
      return 1 - Easing.polynomialEaseInOutValue( n, 1 - t );
    }
  }

  /**
   * The derivative of the "polynomial ease in" function.
   * @public
   *
   * @param {number} n - The degree of the polynomial (does not have to be an integer!)
   * @param {number} t - The linear ratio [0,1] of the animation
   * @returns {number}
   */
  static polynomialEaseInDerivative( n, t ) {
    assert && assert( tIsValid( t ), `invalid t: ${t}` );

    return n * Math.pow( t, n - 1 );
  }

  /**
   * The derivative of the "polynomial ease out" function.
   * @public
   *
   * @param {number} n - The degree of the polynomial (does not have to be an integer!)
   * @param {number} t - The linear ratio [0,1] of the animation
   * @returns {number}
   */
  static polynomialEaseOutDerivative( n, t ) {
    assert && assert( tIsValid( t ), `invalid t: ${t}` );

    return n * Math.pow( 1 - t, n - 1 );
  }

  /**
   * The derivative of the "polynomial ease in-out" function.
   * @public
   *
   * @param {number} n - The degree of the polynomial (does not have to be an integer!)
   * @param {number} t - The linear ratio [0,1] of the animation
   * @returns {number}
   */
  static polynomialEaseInOutDerivative( n, t ) {
    assert && assert( tIsValid( t ), `invalid t: ${t}` );

    if ( t <= 0.5 ) {
      return Math.pow( 2, n - 1 ) * n * Math.pow( t, n - 1 );
    }
    else {
      return Easing.polynomialEaseInOutDerivative( n, 1 - t );
    }
  }

  /**
   * The second derivative of the "polynomial ease in" function.
   * @public
   *
   * @param {number} n - The degree of the polynomial (does not have to be an integer!)
   * @param {number} t - The linear ratio [0,1] of the animation
   * @returns {number}
   */
  static polynomialEaseInSecondDerivative( n, t ) {
    assert && assert( tIsValid( t ), `invalid t: ${t}` );

    return ( n - 1 ) * n * Math.pow( t, n - 2 );
  }

  /**
   * The second derivative of the "polynomial ease out" function.
   * @public
   *
   * @param {number} n - The degree of the polynomial (does not have to be an integer!)
   * @param {number} t - The linear ratio [0,1] of the animation
   * @returns {number}
   */
  static polynomialEaseOutSecondDerivative( n, t ) {
    assert && assert( tIsValid( t ), `invalid t: ${t}` );

    return -( n - 1 ) * n * Math.pow( 1 - t, n - 2 );
  }

  /**
   * The second derivative of the "polynomial ease in-out" function.
   * @public
   *
   * @param {number} n - The degree of the polynomial (does not have to be an integer!)
   * @param {number} t - The linear ratio [0,1] of the animation
   * @returns {number}
   */
  static polynomialEaseInOutSecondDerivative( n, t ) {
    assert && assert( tIsValid( t ), `invalid t: ${t}` );

    if ( t <= 0.5 ) {
      return Math.pow( 2, n - 1 ) * ( n - 1 ) * n * Math.pow( t, n - 2 );
    }
    else {
      return -Easing.polynomialEaseInOutSecondDerivative( n, 1 - t );
    }
  }

  /**
   * Creates a polynomial "in" easing (smooth start)
   * @public
   *
   * @param {number} n - The degree of the polynomial (does not have to be an integer!)
   * @returns {Easing}
   */
  static polynomialEaseIn( n ) {
    const easing = new Easing();
    easing.value = Easing.polynomialEaseInValue.bind( easing, n );
    easing.derivative = Easing.polynomialEaseInDerivative.bind( easing, n );
    easing.secondDerivative = Easing.polynomialEaseInSecondDerivative.bind( easing, n );
    return easing;
  }

  /**
   * Creates a polynomial "out" easing (smooth end)
   * @public
   *
   * @param {number} n - The degree of the polynomial (does not have to be an integer!)
   * @returns {Easing}
   */
  static polynomialEaseOut( n ) {
    const easing = new Easing();
    easing.value = Easing.polynomialEaseOutValue.bind( easing, n );
    easing.derivative = Easing.polynomialEaseOutDerivative.bind( easing, n );
    easing.secondDerivative = Easing.polynomialEaseOutSecondDerivative.bind( easing, n );
    return easing;
  }

  /**
   * Creates a polynomial "in-out" easing (smooth start and end)
   * @public
   *
   * @param {number} n - The degree of the polynomial (does not have to be an integer!)
   * @returns {Easing}
   */
  static polynomialEaseInOut( n ) {
    const easing = new Easing();
    easing.value = Easing.polynomialEaseInOutValue.bind( easing, n );
    easing.derivative = Easing.polynomialEaseInOutDerivative.bind( easing, n );
    easing.secondDerivative = Easing.polynomialEaseInOutSecondDerivative.bind( easing, n );
    return easing;
  }
}

/**
 * Verifies that t is valid.
 * @param t - The linear ratio [0,1] of the animation
 * @returns {boolean}
 */
function tIsValid( t ) {
  return typeof t === 'number' && isFinite( t ) && t >= 0 && t <= 1;
}

// @public {Easing} - The identity easing
Easing.LINEAR = Easing.polynomialEaseIn( 1 );

// @public {Easing} - Quadratic-derived easings (t^2)
Easing.QUADRATIC_IN = Easing.polynomialEaseIn( 2 );
Easing.QUADRATIC_OUT = Easing.polynomialEaseOut( 2 );
Easing.QUADRATIC_IN_OUT = Easing.polynomialEaseInOut( 2 );

// @public {Easing} - Cubic-derived easings (t^3)
Easing.CUBIC_IN = Easing.polynomialEaseIn( 3 );
Easing.CUBIC_OUT = Easing.polynomialEaseOut( 3 );
Easing.CUBIC_IN_OUT = Easing.polynomialEaseInOut( 3 );

// @public {Easing} - Quartic-derived easings (t^4)
Easing.QUARTIC_IN = Easing.polynomialEaseIn( 4 );
Easing.QUARTIC_OUT = Easing.polynomialEaseOut( 4 );
Easing.QUARTIC_IN_OUT = Easing.polynomialEaseInOut( 4 );

// @public {Easing} - Quintic-derived easings (t^5)
Easing.QUINTIC_IN = Easing.polynomialEaseIn( 5 );
Easing.QUINTIC_OUT = Easing.polynomialEaseOut( 5 );
Easing.QUINTIC_IN_OUT = Easing.polynomialEaseInOut( 5 );

twixt.register( 'Easing', Easing );
export default Easing;