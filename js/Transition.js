// Copyright 2018-2020, University of Colorado Boulder

/**
 * An animation that will animate one object (usually a Node) out, and another in.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Shape from '../../kite/js/Shape.js';
import merge from '../../phet-core/js/merge.js';
import required from '../../phet-core/js/required.js';
import Animation from './Animation.js';
import twixt from './twixt.js';

class Transition extends Animation {

  /**
   * @extends {Animation}
   *
   * NOTE: The nodes' transform/pickability/visibility/opacity/clipArea/etc. can be modified, and will be reset to
   * the default value when the transition finishes.
   *
   * @param {Node|null} fromNode
   * @param {Node|null} toNode
   * @param {Object} config
   */
  constructor( fromNode, toNode, config ) {
    const defaults = {

      // {Array.<Object>} - A list of partial configurations that will individually be passed to
      // the targets for an Animation (and thus to AnimationTarget). They will be combined with `object: node` and
      // options.targetOptions to create the Animation. See Animation's targets parameter for more information
      fromTargets: required( config.fromTargets ),
      toTargets: required( config.toTargets ),

      // {function} - function( {Node} ), resets the animated parameter(s) to their default values.
      resetNode: required( config.resetNode ),

      // {Object|null} (optional) - Passed as additional objects to every target
      targetOptions: null
    };
    config = merge( {}, defaults, config );

    assert && assert( typeof config.resetNode === 'function' );

    const targetOptions = merge( {
      // NOTE: no defaults, but we want it to be an object so we merge anyways
    }, config.targetOptions );

    let targets = [];

    if ( fromNode ) {
      targets = targets.concat( config.fromTargets.map( function( target ) {
        return merge( target, {
          object: fromNode
        }, targetOptions );
      } ) );
    }
    if ( toNode ) {
      targets = targets.concat( config.toTargets.map( function( target ) {
        return merge( target, {
          object: toNode
        }, targetOptions );
      } ) );
    }

    super( merge( {
      targets: targets
    }, _.omit( config, _.keys( defaults ) ) ) );

    // When this animation ends, reset the values for both nodes
    this.endedEmitter.addListener( function() {
      fromNode && config.resetNode( fromNode );
      toNode && config.resetNode( toNode );
    } );
  }

  /**
   * Creates an animation that slides the `fromNode` out to the left (and the `toNode` in from the right).
   * @public
   *
   * @param {Bounds2} bounds
   * @param {Node|null} fromNode
   * @param {Node|null} toNode
   * @param {Object} [options] - Usually specify duration, easing, or other Animation options.
   * @returns {Transition}
   */
  static slideLeft( bounds, fromNode, toNode, options ) {
    return Transition.createSlide( fromNode, toNode, 'x', bounds.width, true, options );
  }

  /**
   * Creates an animation that slides the `fromNode` out to the right (and the `toNode` in from the left).
   * @public
   *
   * @param {Bounds2} bounds
   * @param {Node|null} fromNode
   * @param {Node|null} toNode
   * @param {Object} [options] - Usually specify duration, easing, or other Animation options.
   * @returns {Transition}
   */
  static slideRight( bounds, fromNode, toNode, options ) {
    return Transition.createSlide( fromNode, toNode, 'x', bounds.width, false, options );
  }

  /**
   * Creates an animation that slides the `fromNode` out to the top (and the `toNode` in from the bottom).
   * @public
   *
   * @param {Bounds2} bounds
   * @param {Node|null} fromNode
   * @param {Node|null} toNode
   * @param {Object} [options] - Usually specify duration, easing, or other Animation options.
   * @returns {Transition}
   */
  static slideUp( bounds, fromNode, toNode, options ) {
    return Transition.createSlide( fromNode, toNode, 'y', bounds.height, true, options );
  }

  /**
   * Creates an animation that slides the `fromNode` out to the bottom (and the `toNode` in from the top).
   * @public
   *
   * @param {Bounds2} bounds
   * @param {Node|null} fromNode
   * @param {Node|null} toNode
   * @param {Object} [options] - Usually specify duration, easing, or other Animation options.
   * @returns {Transition}
   */
  static slideDown( bounds, fromNode, toNode, options ) {
    return Transition.createSlide( fromNode, toNode, 'y', bounds.height, false, options );
  }

  /**
   * Creates a transition that wipes across the screen, moving to the left.
   * @public
   *
   * @param {Bounds2} bounds
   * @param {Node|null} fromNode
   * @param {Node|null} toNode
   * @param {Object} [options] - Usually specify duration, easing, or other Animation options.
   * @returns {Transition}
   */
  static wipeLeft( bounds, fromNode, toNode, options ) {
    return Transition.createWipe( bounds, fromNode, toNode, 'maxX', 'minX', options );
  }

  /**
   * Creates a transition that wipes across the screen, moving to the right.
   * @public
   *
   * @param {Bounds2} bounds
   * @param {Node|null} fromNode
   * @param {Node|null} toNode
   * @param {Object} [options] - Usually specify duration, easing, or other Animation options.
   * @returns {Transition}
   */
  static wipeRight( bounds, fromNode, toNode, options ) {
    return Transition.createWipe( bounds, fromNode, toNode, 'minX', 'maxX', options );
  }

  /**
   * Creates a transition that wipes across the screen, moving up.
   * @public
   *
   * @param {Bounds2} bounds
   * @param {Node|null} fromNode
   * @param {Node|null} toNode
   * @param {Object} [options] - Usually specify duration, easing, or other Animation options.
   * @returns {Transition}
   */
  static wipeUp( bounds, fromNode, toNode, options ) {
    return Transition.createWipe( bounds, fromNode, toNode, 'maxY', 'minY', options );
  }

  /**
   * Creates a transition that wipes across the screen, moving down.
   * @public
   *
   * @param {Bounds2} bounds
   * @param {Node|null} fromNode
   * @param {Node|null} toNode
   * @param {Object} [options] - Usually specify duration, easing, or other Animation options.
   * @returns {Transition}
   */
  static wipeDown( bounds, fromNode, toNode, options ) {
    return Transition.createWipe( bounds, fromNode, toNode, 'minY', 'maxY', options );
  }

  /**
   * Creates a transition that fades from `fromNode` to `toNode` by varying the opacity of both.
   * @public
   *
   * @param {Node|null} fromNode
   * @param {Node|null} toNode
   * @param {Object} [options] - Usually specify duration, easing, or other Animation options.
   * @returns {Transition}
   */
  static dissolve( fromNode, toNode, options ) {
    options = merge( {
      // {number} - Handles gamma correction for the opacity when required
      gamma: 1
    }, options );

    function gammaBlend( a, b, ratio ) {
      return Math.pow( ( 1 - ratio ) * a + ratio * b, options.gamma );
    }

    return new Transition( fromNode, toNode, merge( {
      fromTargets: [ {
        attribute: 'opacity',
        from: 1,
        to: 0,
        blend: gammaBlend
      } ],
      toTargets: [ {
        attribute: 'opacity',
        from: 0,
        to: 1,
        blend: gammaBlend
      } ],
      resetNode: function( node ) {
        node.opacity = 1;
      }
    }, options ) );
  }

  /**
   * Creates a sliding transition within the bounds.
   * @private
   *
   * @param {Node|null} fromNode
   * @param {Node|null} toNode
   * @param {string} attribute - The positional attribute to animate
   * @param {number} size - The size of the animation (for the positional attribute)
   * @param {boolean} reversed - Whether to reverse the animation. By default it goes right/down.
   * @param {Object} [options]
   * @returns {Transition}
   */
  static createSlide( fromNode, toNode, attribute, size, reversed, options ) {
    const sign = reversed ? -1 : 1;
    return new Transition( fromNode, toNode, merge( {
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
  }

  /**
   * Creates a wiping transition within the bounds.
   * @private
   *
   * @param {Bounds2} bounds
   * @param {Node|null} fromNode
   * @param {Node|null} toNode
   * @param {string} minAttribute - One side of the bounds on the minimal side (where the animation starts)
   * @param {string} maxAttribute - The other side of the bounds (where animation ends)
   * @param {Object} [options]
   * @returns {Transition}
   */
  static createWipe( bounds, fromNode, toNode, minAttribute, maxAttribute, options ) {
    const fromNodeBounds = bounds.copy();
    const toNodeBounds = bounds.copy();

    fromNodeBounds[ minAttribute ] = bounds[ maxAttribute ];
    toNodeBounds[ maxAttribute ] = bounds[ minAttribute ];

    // We need to apply custom clip area interpolation
    function clipBlend( boundsA, boundsB, ratio ) {
      return Shape.bounds( boundsA.blend( boundsB, ratio ) );
    }

    return new Transition( fromNode, toNode, merge( {
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
}

twixt.register( 'Transition', Transition );
export default Transition;