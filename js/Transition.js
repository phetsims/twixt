// Copyright 2018, University of Colorado Boulder

/**
 * TODO: doc
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( function( require ) {
  'use strict';

  // modules
  var Animation = require( 'TWIXT/Animation' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Shape = require( 'KITE/Shape' );
  var twixt = require( 'TWIXT/twixt' );

  /**
   * @constructor
   * @extends {Animation}
   *
   * NOTE: The nodes' transform/pickability/visibility/opacity/clipArea/etc. can be modified, and will be reset to
   * the default value when the transition finishes.
   *
   * @param {Node|null} fromNode
   * @param {Node|null} toNode
   * @param {Object} config
   */
  function Transition( fromNode, toNode, config ) {
    config = _.extend( {
      // Required {Array.<Object>} TODO doc
      fromTargets: null,
      toTargets: null,

      // Required {function}
      resetNode: null,

      // Optional
      targetOptions: null
    }, config );
    assert && assert( config.fromTargets );
    assert && assert( config.toTargets );
    assert && assert( typeof config.resetNode === 'function' );

    var targetOptions = _.extend( {
      // TODO: any default target config?
    }, config.targetOptions );

    var targets = [];

    if ( fromNode ) {
      targets = targets.concat( config.fromTargets.map( function( target ) {
        return _.extend( target, {
          object: fromNode
        }, targetOptions );
      } ) );
    }
    if ( toNode ) {
      targets = targets.concat( config.toTargets.map( function( target ) {
        return _.extend( target, {
          object: toNode
        }, targetOptions );
      } ) );
    }

    Animation.call( this, _.extend( {
      targets: targets
    }, _.omit( config, [ 'targetOptions', 'fromTargets', 'toTargets', 'resetNode' ] ) ) );

    this.endedEmitter.addListener( function() {
      fromNode && config.resetNode( fromNode );
      toNode && config.resetNode( toNode );
    } );
  }

  twixt.register( 'Transition', Transition );

  inherit( Animation, Transition, {}, {
    slideLeft: function( bounds, fromNode, toNode, options ) {
      return Transition.createSlide( fromNode, toNode, 'x', bounds.width, true, options );
    },
    slideRight: function( bounds, fromNode, toNode, options ) {
      return Transition.createSlide( fromNode, toNode, 'x', bounds.width, false, options );
    },
    slideUp: function( bounds, fromNode, toNode, options ) {
      return Transition.createSlide( fromNode, toNode, 'y', bounds.height, true, options );
    },
    slideDown: function( bounds, fromNode, toNode, options ) {
      return Transition.createSlide( fromNode, toNode, 'y', bounds.height, false, options );
    },
    wipeLeft: function( bounds, fromNode, toNode, options ) {
      return Transition.createWipe( bounds, fromNode, toNode, 'maxX', 'minX', options );
    },
    wipeRight: function( bounds, fromNode, toNode, options ) {
      return Transition.createWipe( bounds, fromNode, toNode, 'minX', 'maxX', options );
    },
    wipeUp: function( bounds, fromNode, toNode, options ) {
      return Transition.createWipe( bounds, fromNode, toNode, 'maxY', 'minY', options );
    },
    wipeDown: function( bounds, fromNode, toNode, options ) {
      return Transition.createWipe( bounds, fromNode, toNode, 'minY', 'maxY', options );
    },
    dissolve: function( fromNode, toNode, options ) {
      return new Transition( fromNode, toNode, _.extend( {
        fromTargets: [ {
          attribute: 'opacity',
          from: 1,
          to: 0
        } ],
        toTargets: [ {
          attribute: 'opacity',
          from: 0,
          to: 1
        } ],
        resetNode: function( node ) {
          node.opacity = 1;
        }
      }, options ) );
    },

    createSlide: function( fromNode, toNode, attribute, size, reversed, options ) {
      var sign = reversed ? -1 : 1;
      return new Transition( fromNode, toNode, _.extend( {
        fromTargets: [ {
          attribute: attribute,
          from: 0,
          to: size * sign
        } ],
        toTargets: [ {
          attribute: attribute,
          from: -size * sign,
          to: 0
        } ],
        resetNode: function( node ) {
          node[ attribute ] = 0;
        }
      }, options ) );
    },

    createWipe: function( bounds, fromNode, toNode, minAttribute, maxAttribute, options ) {
      var fromNodeBounds = bounds.copy();
      var toNodeBounds = bounds.copy();

      fromNodeBounds[ minAttribute ] = bounds[ maxAttribute ];
      toNodeBounds[ maxAttribute ] = bounds[ minAttribute ];

      function clipBlend( boundsA, boundsB, ratio ) {
        return Shape.bounds( boundsA.blend( boundsB, ratio ) );
      }

      return new Transition( fromNode, toNode, _.extend( {
        fromTargets: [ {
          attribute: 'clipArea',
          from: bounds,
          to: fromNodeBounds,
          blend: clipBlend
        } ],
        toTargets: [ {
          attribute: 'clipArea',
          from: toNodeBounds,
          to: bounds,
          blend: clipBlend
        } ],
        resetNode: function( node ) {
          node.clipArea = null;
        }
      }, options ) );
    }
  } );

  return Transition;
} );
