// Copyright 2016, University of Colorado Boulder

/**
 * Animates a node's location.
 *
 * @author Chris Malley (PixelZoom, Inc)
 * @deprecated - Please use Animation.js
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var twixt = require( 'TWIXT/twixt' );

  /**
   * @param {Node} node
   * @param {Vector2} destination
   * @param {Object} options
   * @constructor
   * @deprecated - Please use Animation.js
   */
  function MoveTo( node, destination, options ) {

    options = _.extend( {

      // {number} if constantSpeed:false, this is the total time of the animation, in ms.
      //          if constantSpeed:true, this is the time in ms to move 1 unit of distance
      duration: 1,
      constantSpeed: true,// {boolean} keeps speed constant, regardless of distance
      delay: 0, // {number} delay after calling start, in ms
      easing: TWEEN.Easing.Quadratic.InOut, // {function} see Tween.Easing
      onStart: null, // {function|null} called when the animation starts
      onUpdate: null, // {function|null} called on each animation update
      onComplete: null, // {function|null} called when the animation completes
      onStop: null // {function|null} called if the animation is stopped
    }, options );

    assert && assert( options.duration >= 0 );

    this.onStop = options.onStop; // @private

    // normalize duration
    var duration = options.constantSpeed
      ? ( node.translation.distance( destination ) * options.duration )
      : options.duration;

    var parameters = { x: node.x, y: node.y };

    // @private
    this.tween = new TWEEN.Tween( parameters )
      .to( { x: destination.x, y: destination.y }, duration )
      .easing( options.easing )
      .delay( options.delay )
      .onStart( function() {
        options.onStart && options.onStart();
      } )
      .onUpdate( function() {
        node.x = parameters.x;
        node.y = parameters.y;
        options.onUpdate && options.onUpdate();
      } )
      .onComplete( function() {
        options.onComplete && options.onComplete();
      } );
  }

  twixt.register( 'MoveTo', MoveTo );

  return inherit( Object, MoveTo, {

    // @public starts the animation
    start: function() {
      this.tween.start( phet.joist.elapsedTime );
    },

    // @public stops the animation, onComplete is not called
    stop: function() {
      this.tween.stop();
      this.onStop && this.onStop(); //TODO move this to tween instance when we upgrade to a version that supports onStop
    }
  } );
} );
