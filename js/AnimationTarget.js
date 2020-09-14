// Copyright 2018-2020, University of Colorado Boulder

/**
 * Controls a specific animated value for an Animation.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Property from '../../axon/js/Property.js';
import merge from '../../phet-core/js/merge.js';
import Easing from './Easing.js';
import twixt from './twixt.js';

class AnimationTarget {

  /**
   * NOTE: Generally don't use this directly. Instead use Animation, providing config for one or more targets.
   *
   * Every animation target needs two things:
   *
   * 1. A way of getting/setting the animated value (`setValue`/`getValue`, `property`, or `object`/`attribute`).
   * 2. A way of determining the value to animate toward (`to` or `delta`).
   *
   * @param {Object} config - See below in the constructor for documentation
   */
  constructor( config ) {

    config = merge( {
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
       * var someVectorProperty = new axon.Property( new dot.Vector2( 10, 5 ) );
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

      // {function|null} - If provided, it should be a `function( {*} value )` that acts as "setting" the value of
      // the animation. NOTE: do not provide this and property/object.
      setValue: null,
      // {function|null} - If provided, it should be a `function(): {*}` that returns the current value that will be
      // animated. NOTE: This can be omitted, even if setValue is provided, if the `from` option is set (as the
      // current value would just be ignored).
      getValue: null,

      // {Property.<*>|null} - If provided, it should be an axon Property with the current value. It will be modified
      // by the animation. NOTE: do not provide this and setValue/object
      property: null,

      // {*|null} - If provided, it should point to an object where `object[ attribute ]` is the value to be modified
      // by the animation. NOTE: do not provide this and setValue/property
      object: null,
      // {string|null} - If `object` is provided, it should be a string such that `object[ attribute ]` is the value to
      // be modified.
      attribute: null,

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

      // {*|null} - If provided, the animation will treat this as the end value (what it animates toward).
      to: null,

      // {*|null} - If provided, the animation will treat the ending value of the animation as the starting value plus
      // this delta value. To determine the exact value, the `add` option will be used (which by default handles
      // number/Vector2/Vector3/Vector4 as expected). The animation can be run multiple times, and each time it will use
      // the "starting" value from last time (unless the `from` option is used).
      delta: null, // {*|null}

      // {number|null} - If provided, the animation's length will be this value (seconds/unit) times the "distance"
      // between the start and end value of the animation. The `distance` option can be used to specify a way to
      // compute the distance, and works by default as expected for number/Vector2/Vector3/Vector4.
      speed: null,

      // {*|null} - If provided, the animation will start from this value (instead of getting the current value to start
      // from).
      from: null,

      // {Easing} - Controls the relative motion from the starting value to the ending value. See Easing.js for info.
      easing: Easing.CUBIC_IN_OUT,

      // {function} - Should be of the form `function( start: {*}, end: {*}, ratio: {number} ): {*}` where the ratio
      // will be between 0 and 1 (inclusive). If the ratio is 0, it should return the starting value, if the ratio is 1,
      // it should return the ending value, and otherwise it should return the best interpolation possible between the
      // two values. The default should work for number/Vector2/Vector3/Vector4/Color, but for other types either
      // `start.blend( end, ratio )` should be defined and work, or this function should be overridden.
      blend: AnimationTarget.DEFAULT_BLEND,

      // {function} - Should be of the form `function( start: {*}, end: {*} ): {number}`, and it should return a measure
      // of distance (a metric) between the two values. This is only used for if the `speed` option is provided (so it
      // can determine the length of the animation). The default should work for number/Vector2/Vector3/Vector4.
      distance: AnimationTarget.DEFAULT_DISTANCE,

      // {function} - Should be of the form `function( start: {*}, delta: {*} ): {*}` where it adds together a value
      // and a "delta" (usually just a value of the same type) and returns the result. This is used for the `delta`
      // option. The default should work for number/Vector2/Vector3/Vector4.
      add: AnimationTarget.DEFAULT_ADD

    }, config );

    assert && assert( +( config.property !== null ) + +( config.object !== null ) + +( config.setValue !== null ) === 1,
      'Should have one (and only one) way of defining how to set the animated value. Use one of property/object/setValue' );

    assert && assert( config.setValue === null || typeof config.setValue === 'function',
      'If setValue is provided, it should be a function.' );

    assert && assert( config.setValue === null || config.from !== null || typeof config.getValue === 'function',
      'If setValue is provided and no "from" value is specified, then getValue needs to be a function.' );

    assert && assert( config.to !== null || config.delta !== null,
      'Need something to animate to, use to/delta' );

    assert && assert( config.property === null || config.property instanceof Property );

    assert && assert( config.object === null || ( typeof config.object === 'object' && typeof config.attribute === 'string' ),
      'If object is provided, then object should be an object, and attribute should be a string.' );

    assert && assert( config.easing instanceof Easing, 'The easing should be of type Easing' );
    assert && assert( typeof config.blend === 'function', 'The blend option should be a function' );
    assert && assert( typeof config.distance === 'function', 'The distance option should be a function' );
    assert && assert( typeof config.add === 'function', 'The add option should be a function' );

    // If `object` is provided, create the associated getter/setter
    if ( config.object ) {
      config.setValue = AnimationTarget.OBJECT_SET( config.object, config.attribute );
      config.getValue = AnimationTarget.OBJECT_GET( config.object, config.attribute );
    }

    // If `property` is provided, create the associated getter/setter
    if ( config.property ) {
      config.setValue = AnimationTarget.PROPERTY_SET( config.property );
      config.getValue = AnimationTarget.PROPERTY_GET( config.property );
    }

    // @private {function} - Our functions to get and set the animated value.
    this.getValue = config.getValue;
    this.setValue = config.setValue;

    // @private {Easing}
    this.easing = config.easing;

    // @private {*|null} - Saved config to help determine the starting/ending values
    this.from = config.from;
    this.to = config.to;
    this.delta = config.delta;

    // @private {number|null} - Saved config to help determine the length of the animation
    this.speed = config.speed;

    // @private {function}
    this.blend = config.blend;
    this.distance = config.distance;
    this.add = config.add;

    // @private {*} - Computed start/end values for the animation (once the animation finishes the delay and begins)
    this.startingValue = null;
    this.endingValue = null;
  }

  /**
   * Default blending function for the `blend` function.
   * @public
   *
   * @param {*} a
   * @param {*} b
   * @param {number} ratio
   * @returns {*}
   */
  static DEFAULT_BLEND( a, b, ratio ) {
    assert && assert( typeof ratio === 'number' && isFinite( ratio ) && ratio >= 0 && ratio <= 1, 'Invalid ratio: ' + ratio );

    if ( ratio === 0 ) { return a; }
    if ( ratio === 1 ) { return b; }

    if ( typeof a === 'number' && typeof b === 'number' ) {
      return a + ( b - a ) * ratio;
    }
    if ( typeof a === 'object' && typeof b === 'object' && typeof a.blend === 'function' ) {
      return a.blend( b, ratio );
    }

    throw new Error( 'Blending not supported for: ' + a + ', ' + b + ', pass in a blend option' );
  }

  /**
   * Default distance function for the `distance` option (used for the `speed` option)
   * @public
   *
   * @param {*} a
   * @param {*} b
   * @returns {*}
   */
  static DEFAULT_DISTANCE( a, b ) {
    if ( typeof a === 'number' && typeof b === 'number' ) {
      return Math.abs( a - b );
    }
    if ( typeof a === 'object' && typeof b === 'object' && typeof a.distance === 'function' ) {
      return a.distance( b );
    }

    throw new Error( 'Distance (required for speed) by default not supported for: ' + a + ', ' + b + ', pass in a distance option' );
  }

  /**
   * Default addition function for the `add` option (used for the `delta` option)
   * @public
   *
   * @param {*} a
   * @param {*} b
   * @returns {*}
   */
  static DEFAULT_ADD( a, b ) {
    if ( typeof a === 'number' && typeof b === 'number' ) {
      return a + b;
    }
    if ( typeof a === 'object' && typeof b === 'object' && typeof a.plus === 'function' ) {
      return a.plus( b );
    }

    throw new Error( 'Addition (required for delta) by default not supported for: ' + a + ', ' + b + ', pass in an add option' );
  }

  /**
   * Helper function for creating a setter closure for object[ attribute ].
   * @private
   *
   * @param {Object} object
   * @param {string} attribute
   * @returns {function}
   */
  static OBJECT_SET( object, attribute ) {
    return function( value ) {
      object[ attribute ] = value;
    };
  }

  /**
   * Helper function for creating a getter closure for object[ attribute ].
   * @private
   *
   * @param {Object} object
   * @param {string} attribute
   * @returns {function}
   */
  static OBJECT_GET( object, attribute ) {
    return function() {
      return object[ attribute ];
    };
  }

  /**
   * Helper function for creating a setter closure for Properties
   * @private
   *
   * @param {Property} property
   * @returns {function}
   */
  static PROPERTY_SET( property ) {
    return function( value ) {
      property.value = value;
    };
  }

  /**
   * Helper function for creating a getter closure for Properties
   * @private
   *
   * @param {Property} property
   * @returns {function}
   */
  static PROPERTY_GET( property ) {
    return function() {
      return property.value;
    };
  }

  /**
   * Computes the starting and ending values of this target.
   * @public
   *
   * Generally called when the animation is just about to begin, so it can look up the current value if necessary.
   */
  computeStartEnd() {
    this.startingValue = ( this.from !== null ) ? this.from : this.getValue();
    this.endingValue = ( this.to !== null ) ? this.to : this.add( this.startingValue, this.delta );
  }

  /**
   * Updates the value of this target.
   * @public
   *
   * @param {number} ratio - How far along (from 0 to 1) in the animation.
   */
  update( ratio ) {
    this.setValue( this.blend( this.startingValue, this.endingValue, this.easing.value( ratio ) ) );
  }

  /**
   * Whether this target can define the duration of an animation.
   * @public
   *
   * @returns {boolean}
   */
  hasPreferredDuration() {
    return this.speed !== null;
  }

  /**
   * Returns the preferred duration of this target (or null if not defined).
   * @public
   *
   * @returns {number|null}
   */
  getPreferredDuration() {
    return this.speed === null ? null : this.speed * this.distance( this.startingValue, this.delta );
  }
}

twixt.register( 'AnimationTarget', AnimationTarget );
export default AnimationTarget;