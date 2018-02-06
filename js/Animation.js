// Copyright 2017, University of Colorado Boulder

/**
 * An easing-based controllable animation.
 *
 * TODO: timeline terminology
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( function( require ) {
  'use strict';

  // modules
  var BooleanProperty = require( 'AXON/BooleanProperty' );
  var Easing = require( 'TWIXT/Easing' );
  var Emitter = require( 'AXON/Emitter' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Property = require( 'AXON/Property' );
  var Timer = require( 'PHET_CORE/Timer' );
  var twixt = require( 'TWIXT/twixt' );
  var Util = require( 'DOT/Util' );

  /**
   * @constructor
   *
   * NOTE: There are essentially three required "parameters" that can be specified in different ways:
   *
   * 1. A way of getting/setting the animated value (`setValue`/`getValue`, `property`, or `target`/`attribute`).
   * 2. A way of determining the value to animate toward (`to` or `delta`).
   * 3. A way of determining the length of the animation (`duration` or `speed`).
   *
   * TODO: add examples
   *
   * @param {Object} [options] - See below in the constructor for documentation
   */
  function Animation( options ) {

    options = _.extend( {
      /*
       * NOTE: One of `setValue`/`property`/`target` is REQUIRED.
       *
       * The animation needs to be able to set (and sometimes get) the value being animated. In the most general case,
       * a getter/setter pair (getValue and setValue) can be provided.
       *
       * For convenience, Animation also supports passing in an axon Property (property:), or setting up for an
       * assignment to an object with target/attribute (accesses as `target[ attribute ]`).
       *
       * E.g.:
       *
       * new Animation( {
       *   setValue: function( value ) { window.value = value * 10; },
       *   getValue: function() { return window.value / 10; },
       *   // other options
       * } )
       *
       * var someVectorProperty = new axon.Property( new dot.Vector2( 10, 5 ) );
       * new Animation( {
       *   property: someVectorProperty,
       *   // other options
       * } )
       *
       * var obj = { x: 5 };
       * new Animation( {
       *   target: obj,
       *   attribute: 'x',
       *   // other options
       * } )
       *
       * NOTE: null values are not supported, as it is used as the "no value" value, and animating towards "null"
       * usually wouldn't make sense (even if you define the proper interpolation function).
       */

      // {function|null} - If provided, it should be a `function( {*} value )` that acts as "setting" the value of
      // the animation. NOTE: do not provide this and property/target.
      setValue: null,
      // {function|null} - If provided, it should be a `function(): {*}` that returns the current value that will be
      // animated. NOTE: This can be omitted, even if setValue is provided, if the `from` option is set (as the
      // current value would just be ignored).
      getValue: null,

      // {Property.<*>|null} - If provided, it should be an axon Property with the current value. It will be modified
      // by the animation. NOTE: do not provide this and setValue/target
      property: null, 

      // {*|null} - If provided, it should point to an object where `target[ attribute ]` is the value to be modified
      // by the animation. NOTE: do not provide this and setValue/property
      target: null, 
      // {string|null} - If `target` is provided, it should be a string such that `target[ attribute ]` is the value to
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

      // {number|null} - If provided, the animation's length will be this value (in seconds).
      duration: null, 

      // {number|null} - If provided, the animation's length will be this value (seconds/unit) times the "distance" 
      // between the start and end value of the animation. The `distance` option can be used to specify a way to
      // compute the distance, and works by default as expected for number/Vector2/Vector3/Vector4.
      speed: null, 

      // {*|null} - If provided, the animation will start from this value (instead of getting the current value to start
      // from).
      from: null,

      // {number} - The amount of time (in seconds) between when the animation is "started" and when the actual
      // animation of the value begins. Negative delays are not supported.
      delay: 0, 

      // {Easing} - Controls the relative motion from the starting value to the ending value. See Easing.js for info.
      easing: Easing.CUBIC_IN_OUT,

      // {function} - Should be of the form `function( start: {*}, end: {*}, ratio: {number} ): {*}` where the ratio
      // will be between 0 and 1 (inclusive). If the ratio is 0, it should return the starting value, if the ratio is 1,
      // it should return the ending value, and otherwise it should return the best interpolation possible between the
      // two values. The default should work for number/Vector2/Vector3/Vector4/Color, but for other types either
      // `start.blend( end, ratio )` should be defined and work, or this function should be overridden.
      blend: Animation.DEFAULT_BLEND,

      // {function} - Should be of the form `function( start: {*}, end: {*} ): {number}`, and it should return a measure
      // of distance (a metric) between the two values. This is only used for if the `speed` option is provided (so it
      // can determine the length of the animation). The default should work for number/Vector2/Vector3/Vector4.
      distance: Animation.DEFAULT_DISTANCE,

      // {function} - Should be of the form `function( start: {*}, delta: {*} ): {*}` where it adds together a value
      // and a "delta" (usually just a value of the same type) and returns the result. This is used for the `delta`
      // option. The default should work for number/Vector2/Vector3/Vector4.
      add: Animation.DEFAULT_ADD 

    }, options );

    assert && assert( +( options.property !== null ) + +( options.target !== null ) + +( options.setValue !== null ) === 1,
      'Should have one (and only one) way of defining how to set the animated value. Use one of property/target/setValue' );

    assert && assert( options.setValue === null || typeof options.setValue === 'function',
      'If setValue is provided, it should be a function.' );

    assert && assert( options.setValue === null || options.from === null || typeof options.getValue === 'function',
      'If setValue is provided and no "from" value is specified, then getValue needs to be a function.' );

    assert && assert( options.to !== null || options.delta !== null,
      'Need something to animate to, use to/delta' );

    assert && assert( options.duration !== null || options.speed !== null,
      'Need a duration or speed to determine the length of the animation' );

    assert && assert( options.property === null || options.property instanceof Property );

    assert && assert( options.target === null || ( typeof options.target === 'object' && typeof options.attribute === 'string' ),
      'If target is provided, then target should be an object, and attribute should be a string.' );

    assert && assert( typeof options.delay === 'number' && isFinite( options.delay ) && options.delay >= 0,
      'The delay should be a non-negative number.' );

    assert && assert( options.easing instanceof Easing, 'The easing should be of type Easing' );
    assert && assert( typeof options.blend === 'function', 'The blend option should be a function' );
    assert && assert( typeof options.distance === 'function', 'The distance option should be a function' );
    assert && assert( typeof options.add === 'function', 'The add option should be a function' );

    // If `target` is provided, create the associated getter/setter
    if ( options.target ) {
      options.setValue = Animation.TARGET_SET( options.target, options.attribute );
      options.getValue = Animation.TARGET_GET( options.target, options.attribute );
    }

    // If `property` is provided, create the associated getter/setter
    if ( options.property ) {
      options.setValue = Animation.PROPERTY_SET( options.property );
      options.getValue = Animation.PROPERTY_GET( options.property );
    }

    // @private {function} - Our functions to get and set the animated value.
    this.getValue = options.getValue;
    this.setValue = options.setValue;

    // @private {Easing}
    this.easing = options.easing;

    // @private {*|null} - Saved options to help determine the starting/ending values
    this.from = options.from;
    this.to = options.to;
    this.delta = options.delta;

    // @private {number|null} - Saved options to help determine the length of the animation
    this.duration = options.duration;
    this.speed = options.speed;

    // @private {number}
    this.delay = options.delay;

    // @private {function}
    this.blend = options.blend;
    this.distance = options.distance;
    this.add = options.add;

    // @private {*} - Computed start/end values for the animation (once the animation finishes the delay and begins)
    this.startingValue = null;
    this.endingValue = null;

    // @private {number} - Computed length for the animation
    this.length = 0;

    // @private {number} - Length of time remaining in the "delay" portion. Computed after the animation is started,
    // and only used until the animation "begins".
    this.remainingDelay = 0;

    // @private {number} - Length of time remaining in the actual animation (after the delay) portion. Computed after
    // the delay has passed, and only used until the animation "ends".
    this.remainingAnimation = 0;

    // @public {Property.<boolean>} - True while the animation is being stepped through (both the delay portion AND the
    // actual animation portion).
    this.runningProperty = new BooleanProperty( false );

    // @public {Property.<boolean>} - True while the animation is actually changing the value (false while waiting for
    // the delay, or while the animation is not running at all).
    this.animatingProperty = new BooleanProperty( false );

    // @public {Emitter} - Fired when the animation is "started" (i.e. when start() is called and the delay, if
    // one is there, starts).
    this.startedEmitter = new Emitter();

    // @public {Emitter} - Fired when the actual animation of the value begins (i.e. when the delay finishes and the
    // actual animation begins).
    this.beganEmitter = new Emitter();
    
    // @public {Emitter} - Fired when the animation finishes naturally (was not abnormally stopped).
    // A {number} is provided as a single argument to the emit callback, and represents how much "extra" time occurred
    // after the end of the animation. For example, if you have a 1-second animation and stepped it by 3 seconds, this
    // finished emitter would be called with 2 seconds.
    this.finishedEmitter = new Emitter();

    // @public {Emitter} - Fired when the animation is manually stopped (with stop()). Does NOT fire when it finishes
    // normally.
    this.stoppedEmitter = new Emitter();

    // @public {Emitter} - Fired when (just after) the animation has changed the animated value.
    this.updateEmitter = new Emitter();
  }

  twixt.register( 'Animation', Animation );

  inherit( Object, Animation, {
    /**
     * Starts the animation (or if it has a delay, sets the animation to start after that delay).
     * @public
     *
     * @param {number} [dt] - If provided, step this far into the animation initially.
     * @returns {Animation} - Returns the this reference, to support chaining.
     */
    start: function( dt ) {
      // If we are already animating, do nothing
      if ( this.runningProperty.value ) {
        return;
      }

      // The remaining delay needs to be valid immediately after start is called.
      this.remainingDelay = this.delay;

      // Notifications
      this.runningProperty.value = true;
      this.startedEmitter.emit();

      // Set up initial state and value
      this.step( dt !== undefined ? dt : 0 );

      return this;
    },

    /**
     * Stops the animation (or if waiting for the delay, will not "start" the animation).
     * @public
     *
     * @returns {Animation} - Returns the this reference, to support chaining.
     */
    stop: function() {
      // If we are not already animating, do nothing
      if ( !this.runningProperty.value ) {
        return;
      }

      // Notifications
      this.runningProperty.value = false;
      this.stoppedEmitter.emit();

      return this;
    },

    /**
     * Steps the animation forward by a certain amount of time.
     * @public
     *
     * @param {number} dt - In seconds
     * @returns {Animation} - Returns the this reference, to support chaining.
     */
    step: function( dt ) {
      // Ignore the step if our animation is not running
      if ( !this.runningProperty.value ) {
        return;
      }

      // First, burn through the delay if animation hasn't started yet.
      if ( !this.animatingProperty.value ) {
        this.remainingDelay -= dt;
        dt = -this.remainingDelay; // record how far past the delay we go

        // Bail if we are not ready to start the animation
        if ( this.remainingDelay > 0 ) {
          return;
        }

        // Compute how we will animate things
        this.startingValue = ( this.from !== null ) ? this.from : this.getValue();
        this.endingValue = ( this.to !== null ) ? this.to : this.add( this.startingValue, this.delta );
        this.length = ( this.duration !== null ) ? this.duration : this.speed * this.distance( this.startingValue, this.delta );
        this.remainingAnimation = this.length;

        // Notify about the animation starting
        this.animatingProperty.value = true;
        this.beganEmitter.emit();
      }

      // Take our dt off of our remaining time
      this.remainingAnimation -= dt;
      dt = -this.remainingAnimation; // record how far past the animation we go

      var ratio = Util.clamp( ( this.length - this.remainingAnimation ) / this.length, 0, 1 );
      this.setValue( this.blend( this.startingValue, this.endingValue, this.easing.value( ratio ) ) );

      // Notification
      this.updateEmitter.emit();

      // Handle finishing the animation if it is over.
      if ( ratio === 1 ) {
        this.animatingProperty.value = false;
        this.runningProperty.value = false;
        this.finishedEmitter.emit( dt );
      }

      return this;
    },

    /**
     * After this animation is complete, the given animation will be started.
     * @public
     *
     * @param {Animation} animation
     * @returns {Animation} - Returns the passed-in animation so things can be chained nicely.
     */
    then: function( animation ) {
      this.finishedEmitter.addListener( function( dt ) {
        animation.start( dt );
      } );
      return animation;
    },

    /**
     * Attaches this animation to the global phet-core Timer.
     * @public
     *
     * Whenever this animation is started, it will add a listener to the Timer (and conversely, will be removed when
     * stopped). This means it will animate with the timer, but will not leak memory as long as the animation doesn't
     * last forever.
     *
     * @returns {Animation} - Returns the this reference, to support chaining.
     */
    attachTimer: function() {
      var isAttached = false;
      var stepListener = this.step.bind( this );

      this.runningProperty.link( function( running ) {
        if ( running !== isAttached ) {
          if ( running ) {
            Timer.addStepListener( stepListener );
          }
          else {
            Timer.removeStepListener( stepListener );
          }
        }
      } );

      return this;
    }
  }, {
    // TODO: add a function for blending with angular/rotational values.

    /**
     * Default blending function for the `blend` function.
     * @public
     *
     * @param {*} a
     * @param {*} b
     * @param {number} ratio
     * @returns {*}
     */
    DEFAULT_BLEND: function( a, b, ratio ) {
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
    },

    /**
     * Default distance function for the `distance` option (used for the `speed` option)
     * @public
     *
     * @param {*} a
     * @param {*} b
     * @returns {*}
     */
    DEFAULT_DISTANCE: function( a, b ) {
      if ( typeof a === 'number' && typeof b === 'number' ) {
        return Math.abs( a - b );
      }
      if ( typeof a === 'object' && typeof b === 'object' && typeof a.distance === 'function' ) {
        return a.distance( b );
      }

      throw new Error( 'Distance (required for speed) by default not supported for: ' + a + ', ' + b + ', pass in a distance option' );
    },

    /**
     * Default addition function for the `add` option (used for the `delta` option)
     * @public
     *
     * @param {*} a
     * @param {*} b
     * @returns {*}
     */
    DEFAULT_ADD: function( a, b ) {
      if ( typeof a === 'number' && typeof b === 'number' ) {
        return a + b;
      }
      if ( typeof a === 'object' && typeof b === 'object' && typeof a.plus === 'function' ) {
        return a.plus( b );
      }

      throw new Error( 'Addition (required for delta) by default not supported for: ' + a + ', ' + b + ', pass in an add option' );
    },

    /**
     * Helper function for creating a setter closure for target[ attribute ].
     * @private
     *
     * @param {Object} target
     * @param {string} attribute
     * @returns {function}
     */
    TARGET_SET: function( target, attribute ) {
      return function( value ) {
        target[ attribute ] = value;
      };
    },

    /**
     * Helper function for creating a getter closure for target[ attribute ].
     * @private
     *
     * @param {Object} target
     * @param {string} attribute
     * @returns {function}
     */
    TARGET_GET: function( target, attribute ) {
      return function() {
        return target[ attribute ];
      };
    },

    /**
     * Helper function for creating a setter closure for Properties
     * @private
     *
     * @param {Property} property
     * @returns {function}
     */
    PROPERTY_SET: function( property ) {
      return function( value ) {
        property.value = value;
      };
    },

    /**
     * Helper function for creating a getter closure for Properties
     * @private
     *
     * @param {Property} property
     * @returns {function}
     */
    PROPERTY_GET: function( property ) {
      return function() {
        return property.value;
      };
    }

    // TODO: keyframed animation helper?
    // TODO: Hooks for attaching/detaching stepping via screens/Timer/manual/etc.
  } );

  return Animation;
} );
