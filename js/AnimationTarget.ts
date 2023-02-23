// Copyright 2023, University of Colorado Boulder

/**
 * Controls a specific animated value for an Animation.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Property from '../../axon/js/Property.js';
import TinyProperty from '../../axon/js/TinyProperty.js';
import TProperty from '../../axon/js/TProperty.js';
import Vector2 from '../../dot/js/Vector2.js';
import Vector3 from '../../dot/js/Vector3.js';
import Vector4 from '../../dot/js/Vector4.js';
import optionize from '../../phet-core/js/optionize.js';
import KeysMatching from '../../phet-core/js/types/KeysMatching.js';
import { Color } from '../../scenery/js/imports.js';
import Easing from './Easing.js';
import twixt from './twixt.js';

type BlendFunction<T> = ( a: T, b: T, fraction: number ) => T;
type DistanceFunction<T> = ( a: T, b: T ) => number;
type AddFunction<T> = ( a: T, b: T ) => T;

type InternalAnimationTargetOptions<T, Obj = unknown> = {
  /*
   * NOTE: One of `setValue`/`property`/`object` is REQUIRED.
   *
   * The animation needs to be able to set (and sometimes get) the value being animated. In the most general case,
   * a getter/setter pair (getValue and setValue) can be provided.
   *
   * For convenience, AnimationTarget also supports passing in an axon Property (property:), or setting up for an
   * assignment to an object with object/attribute (accesses as `object[ attribute ]`).
   *
   * E.g.:
   *
   * new Animation( {
   *   setValue: function( value ) { window.value = value * 10; },
   *   getValue: function() { return window.value / 10; },
   *   // other config
   * } )
   *
   * var someVectorProperty = new phet.axon.Property( new phet.dot.Vector2( 10, 5 ) );
   * new Animation( {
   *   property: someVectorProperty,
   *   // other config
   * } )
   *
   * var obj = { x: 5 };
   * new Animation( {
   *   object: obj,
   *   attribute: 'x',
   *   // other config
   * } )
   *
   * NOTE: null values are not supported, as it is used as the "no value" value, and animating towards "null"
   * usually wouldn't make sense (even if you define the proper interpolation function).
   */

  // If provided, it should be a function that acts as "setting" the value of the animation.
  // NOTE: do not provide this and property/object.
  setValue?: ( ( value: T ) => void ) | null;

  // If provided, it should be a function that returns the current value that will be animated.
  // NOTE: This can be omitted, even if setValue is provided, if the `from` option is set (as the current value would
  // just be ignored).
  getValue?: ( () => T ) | null;

  // If provided, it should be an axon Property with the current value. It will be modified by the animation.
  // NOTE: do not provide this and setValue/object
  property?: TProperty<T> | null;

  // If provided, it should point to an object where `object[ attribute ]` is the value to be modified
  // by the animation. NOTE: do not provide this and setValue/property
  object?: Obj | null;

  // If `object` is provided, it should be a string such that `object[ attribute ]` is the value to be modified.
  attribute?: KeysMatching<Obj, T> | null;

  /*
   * NOTE: one of `to`/`delta` is REQUIRED.
   *
   * The end value of the animation needs to be specified, but there are multiple ways to do so. If you know the
   * exact end value, it can be provided with `to: value`. Then every time the animation is run, it will go to that
   * value.
   *
   * It is also possible to provide `delta: value` which will apply a relative animation by that amount (e.g. for
   * numbers, `delta: 5` would indicate that the animation will increase the value by 5 every time it is run).
   */

  // If provided, the animation will treat this as the end value (what it animates toward).
  to?: T | null;

  // If provided, the animation will treat the ending value of the animation as the starting value plus this delta
  // value. To determine the exact value, the `add` option will be used (which by default handles
  // number/Vector2/Vector3/Vector4 as expected). The animation can be run multiple times, and each time it will use
  // the "starting" value from last time (unless the `from` option is used).
  delta?: T | null;

  // If provided, the animation's length will be this value (seconds/unit) times the "distance" between the start and
  // end value of the animation. The `distance` option can be used to specify a way to compute the distance, and works
  // by default as expected for number/Vector2/Vector3/Vector4.
  speed?: number | null;

  // If provided, the animation will start from this value (instead of getting the current value to start from).
  from?: T | null;

  // Controls the relative motion from the starting value to the ending value. See Easing.js for info.
  easing?: Easing;

  // Should be of the form `function( start: {*}, end: {*}, ratio: {number} ): {*}` where the ratio will be between 0
  // and 1 (inclusive). If the ratio is 0, it should return the starting value, if the ratio is 1, it should return the
  // ending value, and otherwise it should return the best interpolation possible between the two values. The default
  // should work for number/Vector2/Vector3/Vector4/Color, but for other types either `start.blend( end, ratio )` should
  // be defined and work, or this function should be overridden.
  blend?: BlendFunction<T>;

  // Should be of the form `function( start: {*}, end: {*} ): {number}`, and it should return a measure
  // of distance (a metric) between the two values. This is only used for if the `speed` option is provided (so it
  // can determine the length of the animation). The default should work for number/Vector2/Vector3/Vector4.
  distance?: DistanceFunction<T>;

  // Should be of the form `function( start: {*}, delta: {*} ): {*}` where it adds together a value
  // and a "delta" (usually just a value of the same type) and returns the result. This is used for the `delta`
  // option. The default should work for number/Vector2/Vector3/Vector4.
  add?: AddFunction<T>;
};

// Types of things where the default blend/distance/add options will work
type DefaultBlendableType<T> = number | { blend: ( b: T, ratio: number ) => T };
type DefaultDistanceableType<T> = number | { distance: ( b: T ) => number };
type DefaultAddableType<T> = number | { plus: ( b: T ) => T };

export type AnimationTargetOptions<T = unknown, Obj = unknown> = InternalAnimationTargetOptions<T, Obj>;

class AnimationTarget<T, Obj = unknown> {

  private readonly setValue: ( ( value: T ) => void );
  private readonly getValue: ( () => T ) | null;
  private readonly easing: Easing;
  private readonly to: T | null;
  private readonly from: T | null;
  private readonly delta: T | null;
  private readonly speed: number | null;
  private readonly blend: BlendFunction<T>;
  private readonly distance: DistanceFunction<T>;
  private readonly add: AddFunction<T>;

  // Computed start/end values for the animation (once the animation finishes the delay and begins)
  private startingValue: T | null = null;
  private endingValue: T | null = null;

  /**
   * NOTE: Generally don't use this directly. Instead, use Animation, providing config for one or more targets.
   *
   * Every animation target needs two things:
   *
   * 1. A way of getting/setting the animated value (`setValue`/`getValue`, `property`, or `object`/`attribute`).
   * 2. A way of determining the value to animate toward (`to` or `delta`).
   */
  public constructor( providedConfig: AnimationTargetOptions<T, Obj> ) {

    const config = optionize<InternalAnimationTargetOptions<T, Obj>, InternalAnimationTargetOptions<T, Obj>>()( {
      setValue: null,
      getValue: null,
      property: null,
      object: null,
      attribute: null,
      to: null,
      delta: null,
      speed: null,
      from: null,
      easing: Easing.CUBIC_IN_OUT,

      // @ts-expect-error - Not sure how to tell it that the default doesn't work for some types, since we can't use the trickier object
      blend: AnimationTarget.DEFAULT_BLEND,
      // @ts-expect-error - Not sure how to tell it that the default doesn't work for some types, since we can't use the trickier object
      distance: AnimationTarget.DEFAULT_DISTANCE,
      // @ts-expect-error - Not sure how to tell it that the default doesn't work for some types, since we can't use the trickier object
      add: AnimationTarget.DEFAULT_ADD
    }, providedConfig );

    assert && assert( +( config.property !== null ) + +( config.object !== null ) + +( config.setValue !== null ) === 1,
      'Should have one (and only one) way of defining how to set the animated value. Use one of property/object/setValue' );

    assert && assert( config.setValue === null || typeof config.setValue === 'function',
      'If setValue is provided, it should be a function.' );

    assert && assert( config.setValue === null || config.from !== null || typeof config.getValue === 'function',
      'If setValue is provided and no "from" value is specified, then getValue needs to be a function.' );

    assert && assert( config.to !== null || config.delta !== null,
      'Need something to animate to, use to/delta' );

    assert && assert(
      config.property === null ||
      ( ( config.property instanceof Property || config.property instanceof TinyProperty ) && config.property.isSettable() ),
      'If property is provided, it should be a settable Property or TinyProperty' );

    assert && assert( config.object === null || ( typeof config.object === 'object' && typeof config.attribute === 'string' ),
      'If object is provided, then object should be an object, and attribute should be a string.' );

    assert && assert( config.easing instanceof Easing, 'The easing should be of type Easing' );
    assert && assert( typeof config.blend === 'function', 'The blend option should be a function' );
    assert && assert( typeof config.distance === 'function', 'The distance option should be a function' );
    assert && assert( typeof config.add === 'function', 'The add option should be a function' );

    // If `object` is provided, create the associated getter/setter
    if ( config.object ) {
      assert && assert( config.attribute !== null );

      // @ts-expect-error - We know that config.object is an object, but TS doesn't
      config.setValue = AnimationTarget.OBJECT_SET( config.object, config.attribute! );
      // @ts-expect-error - We know that config.object is an object, but TS doesn't
      config.getValue = AnimationTarget.OBJECT_GET( config.object, config.attribute! );
    }

    // If `property` is provided, create the associated getter/setter
    if ( config.property ) {
      config.setValue = AnimationTarget.PROPERTY_SET( config.property );
      config.getValue = AnimationTarget.PROPERTY_GET( config.property );
    }

    assert && assert( config.setValue !== null );

    this.getValue = config.getValue;
    this.setValue = config.setValue!;
    this.easing = config.easing;
    this.from = config.from;
    this.to = config.to;
    this.delta = config.delta;
    this.speed = config.speed; // Saved config to help determine the length of the animation
    this.blend = config.blend;
    this.distance = config.distance;
    this.add = config.add;
  }

  /**
   * Default blending function for the `blend` function.
   */
  public static DEFAULT_BLEND( a: number, b: number, ratio: number ): number;
  public static DEFAULT_BLEND( a: Color, b: Color, ratio: number ): Color;
  public static DEFAULT_BLEND( a: Vector2, b: Vector2, ratio: number ): Vector2;
  public static DEFAULT_BLEND( a: Vector3, b: Vector3, ratio: number ): Vector3;
  public static DEFAULT_BLEND( a: Vector4, b: Vector4, ratio: number ): Vector4;
  public static DEFAULT_BLEND<T extends DefaultBlendableType<T>>( a: T, b: T, ratio: number ): T {
    assert && assert( isFinite( ratio ) && ratio >= 0 && ratio <= 1, `Invalid ratio: ${ratio}` );

    if ( ratio === 0 ) { return a; }
    if ( ratio === 1 ) { return b; }

    if ( typeof a === 'number' && typeof b === 'number' ) {
      // @ts-expect-error - It can't detect we're in the T === number case.
      return a + ( b - a ) * ratio;
    }
    if ( typeof a === 'object' && typeof b === 'object' && typeof a.blend === 'function' ) {
      return a.blend( b, ratio );
    }

    throw new Error( `Blending not supported for: ${JSON.stringify( a )}, ${JSON.stringify( b )}, pass in a blend option` );
  }

  /**
   * Default distance function for the `distance` option (used for the `speed` option)
   */
  public static DEFAULT_DISTANCE( a: number, b: number ): number;
  public static DEFAULT_DISTANCE( a: Vector2, b: Vector2 ): number;
  public static DEFAULT_DISTANCE( a: Vector3, b: Vector3 ): number;
  public static DEFAULT_DISTANCE( a: Vector4, b: Vector4 ): number;
  public static DEFAULT_DISTANCE<T extends DefaultDistanceableType<T>>( a: T, b: T ): number {
    if ( typeof a === 'number' && typeof b === 'number' ) {
      return Math.abs( a - b );
    }
    if ( typeof a === 'object' && typeof b === 'object' && typeof a.distance === 'function' ) {
      return a.distance( b );
    }

    throw new Error( `Distance (required for speed) by default not supported for: ${JSON.stringify( a )}, ${JSON.stringify( b )}, pass in a distance option` );
  }

  /**
   * Default addition function for the `add` option (used for the `delta` option)
   */
  public static DEFAULT_ADD( a: number, b: number ): number;
  public static DEFAULT_ADD( a: Vector2, b: Vector2 ): Vector2;
  public static DEFAULT_ADD( a: Vector3, b: Vector3 ): Vector3;
  public static DEFAULT_ADD( a: Vector4, b: Vector4 ): Vector4;
  public static DEFAULT_ADD<T extends DefaultAddableType<T>>( a: T, b: T ): T {
    if ( typeof a === 'number' && typeof b === 'number' ) {
      // @ts-expect-error - It can't detect we're in the T === number case.
      return a + b;
    }
    if ( typeof a === 'object' && typeof b === 'object' && typeof a.plus === 'function' ) {
      return a.plus( b );
    }

    throw new Error( `Addition (required for delta) by default not supported for: ${JSON.stringify( a )}, ${JSON.stringify( b )}, pass in an add option` );
  }

  /**
   * Helper function for creating a setter closure for object[ attribute ].
   */
  private static OBJECT_SET<Obj, Attr extends keyof Obj>( object: Obj, attribute: Attr ): ( value: Obj[ Attr ] ) => void {
    return function( value ) {
      object[ attribute ] = value;
    };
  }

  /**
   * Helper function for creating a getter closure for object[ attribute ].
   */
  private static OBJECT_GET<Obj, Attr extends keyof Obj>( object: Obj, attribute: Attr ): () => Obj[ Attr ] {
    return function() {
      return object[ attribute ];
    };
  }

  /**
   * Helper function for creating a setter closure for Properties
   */
  private static PROPERTY_SET<T>( property: TProperty<T> ): ( value: T ) => void {
    return function( value ) {
      property.value = value;
    };
  }

  /**
   * Helper function for creating a getter closure for Properties
   */
  private static PROPERTY_GET<T>( property: TProperty<T> ): () => T {
    return function() {
      return property.value;
    };
  }

  /**
   * Computes the starting and ending values of this target.
   *
   * Generally called when the animation is just about to begin, so it can look up the current value if necessary.
   */
  public computeStartEnd(): void {
    assert && assert( this.to !== null || this.delta !== null );
    assert && assert( this.from !== null || this.getValue !== null );

    this.startingValue = ( this.from !== null ) ? this.from : this.getValue!();
    this.endingValue = ( this.to !== null ) ? this.to : this.add( this.startingValue, this.delta! );
  }

  /**
   * Updates the value of this target.
   *
   * @param ratio - How far along (from 0 to 1) in the animation.
   */
  public update( ratio: number ): void {
    // These should be non-null by this point
    assert && assert( this.setValue !== null );
    assert && assert( this.startingValue !== null );
    assert && assert( this.endingValue !== null );

    this.setValue( this.blend( this.startingValue!, this.endingValue!, this.easing.value( ratio ) ) );
  }

  /**
   * Whether this target can define the duration of an animation.
   */
  public hasPreferredDuration(): boolean {
    return this.speed !== null;
  }

  /**
   * Returns the preferred duration of this target (or null if not defined).
   */
  public getPreferredDuration(): number | null {
    assert && assert( this.startingValue !== null );
    assert && assert( this.delta !== null );

    return this.speed === null ? null : this.speed * this.distance( this.startingValue!, this.delta! );
  }
}

twixt.register( 'AnimationTarget', AnimationTarget );
export default AnimationTarget;