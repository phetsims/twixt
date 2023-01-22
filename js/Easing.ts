// Copyright 2023, University of Colorado Boulder

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

type NumberFunction = ( t: number ) => number;

class Easing {

  /**
   * Input to the functions should be in the range [0,1], where 0 is the start of an animation, and 1 is the end.
   *
   * @param value - Our easing function (from [0,1] => [0,1])
   * @param derivative - Our easing function's derivative (from [0,1] => *)
   * @param secondDerivative - Our easing function's second derivative (from [0,1] => *)
   */
  public constructor( public readonly value: NumberFunction,
                      public readonly derivative: NumberFunction,
                      public readonly secondDerivative: NumberFunction ) {
  }

  /**
   * The "polynomial ease in" function.
   *
   * @param n - The degree of the polynomial (does not have to be an integer!)
   * @param t - The linear ratio [0,1] of the animation
   */
  public static polynomialEaseInValue( n: number, t: number ): number {
    assert && assert( tIsValid( t ), `invalid t: ${t}` );

    return Math.pow( t, n );
  }

  /**
   * The "polynomial ease out" function.
   *
   * @param n - The degree of the polynomial (does not have to be an integer!)
   * @param t - The linear ratio [0,1] of the animation
   */
  public static polynomialEaseOutValue( n: number, t: number ): number {
    assert && assert( tIsValid( t ), `invalid t: ${t}` );

    return 1 - Math.pow( 1 - t, n );
  }

  /**
   * The "polynomial ease in-out" function.
   *
   * @param n - The degree of the polynomial (does not have to be an integer!)
   * @param t - The linear ratio [0,1] of the animation
   */
  public static polynomialEaseInOutValue( n: number, t: number ): number {
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
   *
   * @param n - The degree of the polynomial (does not have to be an integer!)
   * @param t - The linear ratio [0,1] of the animation
   */
  public static polynomialEaseInDerivative( n: number, t: number ): number {
    assert && assert( tIsValid( t ), `invalid t: ${t}` );

    return n * Math.pow( t, n - 1 );
  }

  /**
   * The derivative of the "polynomial ease out" function.
   *
   * @param n - The degree of the polynomial (does not have to be an integer!)
   * @param t - The linear ratio [0,1] of the animation
   */
  public static polynomialEaseOutDerivative( n: number, t: number ): number {
    assert && assert( tIsValid( t ), `invalid t: ${t}` );

    return n * Math.pow( 1 - t, n - 1 );
  }

  /**
   * The derivative of the "polynomial ease in-out" function.
   *
   * @param n - The degree of the polynomial (does not have to be an integer!)
   * @param t - The linear ratio [0,1] of the animation
   */
  public static polynomialEaseInOutDerivative( n: number, t: number ): number {
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
   *
   * @param n - The degree of the polynomial (does not have to be an integer!)
   * @param t - The linear ratio [0,1] of the animation
   */
  public static polynomialEaseInSecondDerivative( n: number, t: number ): number {
    assert && assert( tIsValid( t ), `invalid t: ${t}` );

    return ( n - 1 ) * n * Math.pow( t, n - 2 );
  }

  /**
   * The second derivative of the "polynomial ease out" function.
   *
   * @param n - The degree of the polynomial (does not have to be an integer!)
   * @param t - The linear ratio [0,1] of the animation
   */
  public static polynomialEaseOutSecondDerivative( n: number, t: number ): number {
    assert && assert( tIsValid( t ), `invalid t: ${t}` );

    return -( n - 1 ) * n * Math.pow( 1 - t, n - 2 );
  }

  /**
   * The second derivative of the "polynomial ease in-out" function.
   *
   * @param n - The degree of the polynomial (does not have to be an integer!)
   * @param t - The linear ratio [0,1] of the animation
   */
  public static polynomialEaseInOutSecondDerivative( n: number, t: number ): number {
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
   *
   * @param n - The degree of the polynomial (does not have to be an integer!)
   */
  public static polynomialEaseIn( n: number ): Easing {
    return new Easing(
      Easing.polynomialEaseInValue.bind( null, n ),
      Easing.polynomialEaseInDerivative.bind( null, n ),
      Easing.polynomialEaseInSecondDerivative.bind( null, n )
    );
  }

  /**
   * Creates a polynomial "out" easing (smooth end)
   *
   * @param n - The degree of the polynomial (does not have to be an integer!)
   */
  public static polynomialEaseOut( n: number ): Easing {
    return new Easing(
      Easing.polynomialEaseOutValue.bind( null, n ),
      Easing.polynomialEaseOutDerivative.bind( null, n ),
      Easing.polynomialEaseOutSecondDerivative.bind( null, n )
    );
  }

  /**
   * Creates a polynomial "in-out" easing (smooth start and end)
   *
   * @param n - The degree of the polynomial (does not have to be an integer!)
   */
  public static polynomialEaseInOut( n: number ): Easing {
    return new Easing(
      Easing.polynomialEaseInOutValue.bind( null, n ),
      Easing.polynomialEaseInOutDerivative.bind( null, n ),
      Easing.polynomialEaseInOutSecondDerivative.bind( null, n )
    );
  }

  // The identity easing
  public static readonly LINEAR = Easing.polynomialEaseIn( 1 );

  // Quadratic-derived easings (t^2)
  public static readonly QUADRATIC_IN = Easing.polynomialEaseIn( 2 );
  public static readonly QUADRATIC_OUT = Easing.polynomialEaseOut( 2 );
  public static readonly QUADRATIC_IN_OUT = Easing.polynomialEaseInOut( 2 );

  // Cubic-derived easings (t^3)
  public static readonly CUBIC_IN = Easing.polynomialEaseIn( 3 );
  public static readonly CUBIC_OUT = Easing.polynomialEaseOut( 3 );
  public static readonly CUBIC_IN_OUT = Easing.polynomialEaseInOut( 3 );

  // Quartic-derived easings (t^4)
  public static readonly QUARTIC_IN = Easing.polynomialEaseIn( 4 );
  public static readonly QUARTIC_OUT = Easing.polynomialEaseOut( 4 );
  public static readonly QUARTIC_IN_OUT = Easing.polynomialEaseInOut( 4 );

  // Quintic-derived easings (t^5)
  public static readonly QUINTIC_IN = Easing.polynomialEaseIn( 5 );
  public static readonly QUINTIC_OUT = Easing.polynomialEaseOut( 5 );
  public static readonly QUINTIC_IN_OUT = Easing.polynomialEaseInOut( 5 );
}

/**
 * Verifies that t is valid.
 * @param t - The linear ratio [0,1] of the animation
 */
function tIsValid( t: number ): boolean {
  return typeof t === 'number' && isFinite( t ) && t >= 0 && t <= 1;
}

twixt.register( 'Easing', Easing );
export default Easing;