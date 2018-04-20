// Copyright 2017, University of Colorado Boulder

/**
 * An easing-based controllable animation.
 *
 * We use some terminology to describe points and regions in time for an animation:
 *
 *             starts                            begins                                finishes
 *               |             delay               |             animation                |
 * time-->       |           (waiting)             |     (animated values changing)       |
 * ---------------------------------------------------------------------------------------------------------------------
 *               |------------------------------running-----------------------------------|
 *                                                 |-------------animating----------------|
 *
 * TODO: pause/cancel (and stop->cancel renaming)
 * TODO: function for blending with angular/rotational values
 * TODO: consider keyframed animation helper?
 * TODO: Hooks for attaching/detaching stepping via screens/nodes
 * TODO: Add documentation examples (contingent on how screen/node hooks work)
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( function( require ) {
  'use strict';

  // modules
  var AnimationTarget = require( 'TWIXT/AnimationTarget' );
  var BooleanProperty = require( 'AXON/BooleanProperty' );
  var Emitter = require( 'AXON/Emitter' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Timer = require( 'PHET_CORE/Timer' );
  var twixt = require( 'TWIXT/twixt' );
  var Util = require( 'DOT/Util' );

  /**
   * @constructor
   *
   * The constructor options will define one or more animation "targets" (specific values to be animated). The options
   * available for targets is documented in AnimationTarget.
   *
   * If there is only one target, it is recommended to pass in those options in the top-level Animation options, e.g.:
   * | var someNumberProperty = new NumberProperty( 0 );
   * | new Animation( {
   * |   // Options for the Animation as a whole
   * |   duration: 2,
   * |
   * |   // Options for the one target to change
   * |   property: someNumberProperty,
   * |   to: 5
   * | } );
   *
   * However multiple different targets are supported, and should be specified in the `targets` option:
   * | var someNumberProperty = new NumberProperty( 100 );
   * | var someObject = { someAttribute: new Vector2( 100, 5 ) };
   * | new Animation( {
   * |   // Options for the Animation as a whole
   * |   duration: 2,
   * |
   * |   targets: [ {
   * |     // First target
   * |     property: someNumberProperty,
   * |     to: 5
   * |   }, {
   * |     // Second target
   * |     object: someObject,
   * |     attribute: 'someAttribute',
   * |     to: new Vector2( 50, 10 )
   * |   } ]
   * | } );
   *
   * NOTE: The length of the animation needs to be specified in exactly one place. This can usually be done by
   * specifying the `duration` in the options, but `speed` can also be used in any of the targets.
   *
   * EXAMPLE: It's possible to create continuous animation loops, where animations cycle back and forth, e.g.:
   * | var moreOpaque = new Animation( {
   * |   stepper: 'timer',
   * |   object: animatedCircle,
   * |   attribute: 'opacity',
   * |   from: 0.5,
   * |   to: 1,
   * |   duration: 0.5,
   * |   easing: Easing.QUADRATIC_IN_OUT
   * | } );
   * | var lessOpaque = new Animation( {
   * |   stepper: 'timer',
   * |   object: animatedCircle,
   * |   attribute: 'opacity',
   * |   from: 1,
   * |   to: 0.5,
   * |   duration: 0.5,
   * |   easing: Easing.QUADRATIC_IN_OUT
   * | } );
   * | moreOpaque.then( lessOpaque );
   * | lessOpaque.then( moreOpaque );
   * | lessOpaque.start();
   *
   * @param {Object} options - See below in the constructor for documentation.
   */
  function Animation( options ) {

    options = _.extend( {
      // IMPORTANT: See AnimationTarget's options documentation, as those options can be passed in either here, or in
      // the targets array.

      // {Array.<Object>|null} - Can be provided instead of setValue/property/object, and it contains an array of
      // options-style objects that allows animating multiple different things at the same time. See AnimationTarget for
      // details about all of the supported options.
      // NOTE: speed, if provided, should be only specified on exactly one of the targets' options if multiple targets
      // are specified.
      targets: null,

      // {number|null} - If provided, the animation's length will be this value (in seconds). If omitted, one of the
      // targets' `speed` option should be set (the length of the animation will be based on that).
      duration: null,

      // {number} - The amount of time (in seconds) between when the animation is "started" and when the actual
      // animation of the value begins. Negative delays are not supported.
      delay: 0,

      // {string} - One of the following options:
      // 'manual' - `step( dt )` should be called manually to advance the animation
      // 'timer' - When this animation is running, it will listen to the global phet-core Timer.
      // TODO: {ScreenView} - animates only when the ScreenView is the active one.
      // TODO: {Node} - animates only when the node's trail is visible on a Display
      stepper: 'manual'
    }, options );

    assert && assert( +( options.property !== undefined ) + +( options.object !== undefined ) + +( options.setValue !== undefined ) + +( options.targets !== null ) === 1,
      'Should have one (and only one) way of defining how to set the animated value. Use one of property/object/setValue/targets' );

    assert && assert( typeof options.delay === 'number' && isFinite( options.delay ) && options.delay >= 0,
      'The delay should be a non-negative number.' );

    assert && assert( options.stepper === 'manual' || options.stepper === 'timer',
      'If provided, stepper should be "manual", "timer", or (TODO)' );

    // @private {Array.<AnimationTarget>} - All of the different values that will be animated by this animation.
    this.targets = _.map( options.targets === null ? [ options ] : options.targets, function( options ) {
      return new AnimationTarget( options );
    } );

    assert && assert( +( options.duration !== null ) + _.sum( _.map( this.targets, function( target ) {
      return target.hasPreferredDuration() ? 1 : 0;
    } ) ) === 1, 'Exactly one duration/speed option should be used.' );

    // @private {number|null} - Saved options to help determine the length of the animation
    this.duration = options.duration;

    // @private {number} - In seconds
    this.delay = options.delay;

    // @private {number} - Computed length for the animation (in seconds)
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
    this.startEmitter = new Emitter();

    // @public {Emitter} - Fired when the actual animation of the value begins (i.e. when the delay finishes and the
    // actual animation begins).
    this.beginEmitter = new Emitter();

    // @public {Emitter} - Fired when the animation finishes naturally (was not abnormally stopped).
    // A {number} is provided as a single argument to the emit callback, and represents how much "extra" time occurred
    // after the end of the animation. For example, if you have a 1-second animation and stepped it by 3 seconds, this
    // finished emitter would be called with 2 seconds.
    this.finishEmitter = new Emitter();

    // @public {Emitter} - Fired when the animation is manually stopped (with stop()). Does NOT fire when it finishes
    // normally.
    this.stopEmitter = new Emitter();

    // @public {Emitter} - Fired when the animation ends, regardless of whether it fully finished, or was stopped
    // prematurely.
    this.endedEmitter = new Emitter();

    // @public {Emitter} - Fired when (just after) the animation has changed animated values/targets.
    this.updateEmitter = new Emitter();

    if ( options.stepper === 'timer' ) {
      this.attachTimer();
    }
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
      this.startEmitter.emit();

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
      this.stopEmitter.emit();
      this.endedEmitter.emit();

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

        // Compute the start/end for each target, and determine the length of our animation
        this.length = this.duration;
        for ( var i = 0; i < this.targets.length; i++ ) {
          var target = this.targets[ i ];
          target.computeStartEnd();

          // If we don't have a computed length yet, check all of our targets
          if ( this.length === null ) {
            this.length = target.getPreferredDuration();
          }
        }
        assert && assert( this.length !== null, 'After going through the targets, we should have a length by now' );
        this.remainingAnimation = this.length;

        // Notify about the animation starting
        this.animatingProperty.value = true;
        this.beginEmitter.emit();
      }

      // Take our dt off of our remaining time
      this.remainingAnimation -= dt;
      dt = -this.remainingAnimation; // record how far past the animation we go

      var ratio = Util.clamp( ( this.length - this.remainingAnimation ) / this.length, 0, 1 );
      for ( var j = 0; j < this.targets.length; j++ ) {
        this.targets[ j ].update( ratio );
      }

      // Notification
      this.updateEmitter.emit();

      // Handle finishing the animation if it is over.
      if ( ratio === 1 ) {
        this.animatingProperty.value = false;
        this.runningProperty.value = false;
        this.finishEmitter.emit( dt );
        this.endedEmitter.emit();
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
      this.finishEmitter.addListener( function( dt ) {
        animation.start( dt );
      } );
      return animation;
    },

    /**
     * Attaches this animation to the global phet-core Timer.
     * @private
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
          isAttached = running;

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
  } );

  return Animation;
} );
