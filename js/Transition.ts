// Copyright 2023, University of Colorado Boulder

/**
 * An animation that will animate one object (usually a Node) out, and another in.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import { Shape } from '../../kite/js/imports.js';
import { Node } from '../../scenery/js/imports.js';
import merge from '../../phet-core/js/merge.js';
import required from '../../phet-core/js/required.js';
import Animation, { AnimationOptions } from './Animation.js';
import twixt from './twixt.js';
import { AnimationTargetOptions } from './AnimationTarget.js';
import optionize, { combineOptions, EmptySelfOptions } from '../../phet-core/js/optionize.js';
import KeysMatching from '../../phet-core/js/types/KeysMatching.js';
import WritableKeys from '../../phet-core/js/types/WritableKeys.js';
import StrictOmit from '../../phet-core/js/types/StrictOmit.js';
import Bounds2 from '../../dot/js/Bounds2.js';

type SelfOptions<TargetTypes> = {
  // A list of partial configurations that will individually be passed to the targets for an Animation (and thus to
  // AnimationTarget). They will be combined with `object: node` and options.targetOptions to create the Animation.
  // See Animation's targets parameter for more information
  fromTargets: { [K in keyof TargetTypes]: AnimationTargetOptions<TargetTypes[K], Node> };
  toTargets: { [K in keyof TargetTypes]: AnimationTargetOptions<TargetTypes[K], Node> };

  // resets the animated parameter(s) to their default values.
  resetNode: ( node: Node ) => void;

  targetOptions?: AnimationTargetOptions<unknown, Node>;
};

export type PartialTransitionOptions<T> = StrictOmit<SelfOptions<[T]>, 'fromTargets' | 'toTargets' | 'resetNode'> & AnimationOptions<unknown, unknown, [T], [Node]>;

export type SlideTransitionOptions = PartialTransitionOptions<number>;
export type WipeTransitionOptions = PartialTransitionOptions<Shape>;

export type DissolveTransitionSelfOptions = { gamma?: number };
export type DissolveTransitionOptions = PartialTransitionOptions<number> & DissolveTransitionSelfOptions;

export type TransitionOptions<SelfType = unknown, SelfObjectType = unknown, TargetTypes = unknown[], TargetObjectTypes extends { [K in keyof TargetTypes]: Node } = { [K in keyof TargetTypes]: Node }> = SelfOptions<TargetTypes> & AnimationOptions<SelfType, SelfObjectType, TargetTypes, TargetObjectTypes>;

class Transition<SelfType = unknown, SelfObjectType = unknown, TargetTypes = unknown[], TargetObjectTypes extends { [K in keyof TargetTypes]: Node } = { [K in keyof TargetTypes]: Node }> extends Animation<SelfType, SelfObjectType, TargetTypes, TargetObjectTypes> {

  /**
   * NOTE: The nodes' transform/pickability/visibility/opacity/clipArea/etc. can be modified, and will be reset to
   * the default value when the transition finishes.
   */
  public constructor( fromNode: Node | null, toNode: Node | null, config: TransitionOptions ) {
    const defaults = {
      fromTargets: required( config.fromTargets ),
      toTargets: required( config.toTargets ),
      resetNode: required( config.resetNode ),

      // {Object|null} (optional) - Passed as additional objects to every target
      targetOptions: null
    };
    config = merge( {}, defaults, config );

    assert && assert( typeof config.resetNode === 'function' );

    const targetOptions = merge( {
      // NOTE: no defaults, but we want it to be an object so we merge anyways
    }, config.targetOptions );

    let targets: AnimationTargetOptions<unknown, Node>[] = [];

    if ( fromNode ) {
      targets = targets.concat( config.fromTargets.map( target => {
        return combineOptions<AnimationTargetOptions<unknown, Node>>( target, {
          object: fromNode
        }, targetOptions );
      } ) );
    }
    if ( toNode ) {
      targets = targets.concat( config.toTargets.map( target => {
        return combineOptions<AnimationTargetOptions<unknown, Node>>( target, {
          object: toNode
        }, targetOptions );
      } ) );
    }

    super( combineOptions<AnimationOptions<SelfType, SelfObjectType, TargetTypes, TargetObjectTypes>>( {
      // @ts-expect-error - Because we can't unroll the types in the maps above.
      targets: targets
    }, _.omit( config, _.keys( defaults ) ) ) );

    // When this animation ends, reset the values for both nodes
    this.endedEmitter.addListener( () => {
      fromNode && config.resetNode( fromNode );
      toNode && config.resetNode( toNode );
    } );
  }

  /**
   * Creates an animation that slides the `fromNode` out to the left (and the `toNode` in from the right).
   *
   * @param bounds
   * @param fromNode
   * @param toNode
   * @param [options] - Usually specify duration, easing, or other Animation options.
   */
  public static slideLeft( bounds: Bounds2, fromNode: Node | null, toNode: Node | null, options?: SlideTransitionOptions ): Transition {
    return Transition.createSlide( fromNode, toNode, 'x', bounds.width, true, options );
  }

  /**
   * Creates an animation that slides the `fromNode` out to the right (and the `toNode` in from the left).
   *
   * @param bounds
   * @param fromNode
   * @param toNode
   * @param [options] - Usually specify duration, easing, or other Animation options.
   */
  public static slideRight( bounds: Bounds2, fromNode: Node | null, toNode: Node | null, options?: SlideTransitionOptions ): Transition {
    return Transition.createSlide( fromNode, toNode, 'x', bounds.width, false, options );
  }

  /**
   * Creates an animation that slides the `fromNode` out to the top (and the `toNode` in from the bottom).
   *
   * @param bounds
   * @param fromNode
   * @param toNode
   * @param [options] - Usually specify duration, easing, or other Animation options.
   */
  public static slideUp( bounds: Bounds2, fromNode: Node | null, toNode: Node | null, options?: SlideTransitionOptions ): Transition {
    return Transition.createSlide( fromNode, toNode, 'y', bounds.height, true, options );
  }

  /**
   * Creates an animation that slides the `fromNode` out to the bottom (and the `toNode` in from the top).
   *
   * @param bounds
   * @param fromNode
   * @param toNode
   * @param [options] - Usually specify duration, easing, or other Animation options.
   */
  public static slideDown( bounds: Bounds2, fromNode: Node | null, toNode: Node | null, options?: SlideTransitionOptions ): Transition {
    return Transition.createSlide( fromNode, toNode, 'y', bounds.height, false, options );
  }

  /**
   * Creates a transition that wipes across the screen, moving to the left.
   *
   * @param bounds
   * @param fromNode
   * @param toNode
   * @param [options] - Usually specify duration, easing, or other Animation options.
   */
  public static wipeLeft( bounds: Bounds2, fromNode: Node | null, toNode: Node | null, options?: WipeTransitionOptions ): Transition {
    return Transition.createWipe( bounds, fromNode, toNode, 'maxX', 'minX', options );
  }

  /**
   * Creates a transition that wipes across the screen, moving to the right.
   *
   * @param bounds
   * @param fromNode
   * @param toNode
   * @param [options] - Usually specify duration, easing, or other Animation options.
   */
  public static wipeRight( bounds: Bounds2, fromNode: Node | null, toNode: Node | null, options?: WipeTransitionOptions ): Transition {
    return Transition.createWipe( bounds, fromNode, toNode, 'minX', 'maxX', options );
  }

  /**
   * Creates a transition that wipes across the screen, moving up.
   *
   * @param bounds
   * @param fromNode
   * @param toNode
   * @param [options] - Usually specify duration, easing, or other Animation options.
   */
  public static wipeUp( bounds: Bounds2, fromNode: Node | null, toNode: Node | null, options?: WipeTransitionOptions ): Transition {
    return Transition.createWipe( bounds, fromNode, toNode, 'maxY', 'minY', options );
  }

  /**
   * Creates a transition that wipes across the screen, moving down.
   *
   * @param bounds
   * @param fromNode
   * @param toNode
   * @param [options] - Usually specify duration, easing, or other Animation options.
   */
  public static wipeDown( bounds: Bounds2, fromNode: Node | null, toNode: Node | null, options?: WipeTransitionOptions ): Transition {
    return Transition.createWipe( bounds, fromNode, toNode, 'minY', 'maxY', options );
  }

  /**
   * Creates a transition that fades from `fromNode` to `toNode` by varying the opacity of both.
   *
   * @param fromNode
   * @param toNode
   * @param [providedOptions] - Usually specify duration, easing, or other Animation options.
   */
  public static dissolve( fromNode: Node | null, toNode: Node | null, providedOptions?: DissolveTransitionOptions ): Transition {

    const gammaBlend = ( a: number, b: number, ratio: number ): number => {
      return Math.pow( ( 1 - ratio ) * a + ratio * b, options.gamma );
    };

    const options = optionize<DissolveTransitionOptions, DissolveTransitionSelfOptions, TransitionOptions<unknown, unknown, [number], [Node]>>()( {
      // Handles gamma correction for the opacity when required
      gamma: 1,

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
      resetNode: ( node: Node ) => {
        node.opacity = 1;
      }
    }, providedOptions );

    // @ts-expect-error WHY?
    return new Transition( fromNode, toNode, options );
  }

  /**
   * Creates a sliding transition within the bounds.
   *
   * @param fromNode
   * @param toNode
   * @param attribute - The positional attribute to animate
   * @param size - The size of the animation (for the positional attribute)
   * @param reversed - Whether to reverse the animation. By default it goes right/down.
   * @param [options]
   */
  private static createSlide( fromNode: Node | null, toNode: Node | null, attribute: KeysMatching<Node, number> & WritableKeys<Node>, size: number, reversed: boolean, options?: PartialTransitionOptions<number> ): Transition {
    const sign = reversed ? -1 : 1;
    return new Transition( fromNode, toNode, optionize<PartialTransitionOptions<number>, EmptySelfOptions, TransitionOptions>()( {
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
      resetNode: ( node: Node ) => {
        node[ attribute ] = 0;
      }
    }, options ) );
  }

  /**
   * Creates a wiping transition within the bounds.
   *
   * @param bounds
   * @param fromNode
   * @param toNode
   * @param minAttribute - One side of the bounds on the minimal side (where the animation starts)
   * @param maxAttribute - The other side of the bounds (where animation ends)
   * @param [options]
   */
  private static createWipe( bounds: Bounds2, fromNode: Node | null, toNode: Node | null, minAttribute: 'minX' | 'minY' | 'maxX' | 'maxY', maxAttribute: 'minX' | 'minY' | 'maxX' | 'maxY', options?: PartialTransitionOptions<Shape> ): Transition {
    const fromNodeBounds = bounds.copy();
    const toNodeBounds = bounds.copy();

    fromNodeBounds[ minAttribute ] = bounds[ maxAttribute ];
    toNodeBounds[ maxAttribute ] = bounds[ minAttribute ];

    // We need to apply custom clip area interpolation
    const clipBlend = ( boundsA: Bounds2, boundsB: Bounds2, ratio: number ) => {
      return Shape.bounds( boundsA.blend( boundsB, ratio ) );
    };

    return new Transition( fromNode, toNode, optionize<PartialTransitionOptions<Shape>, EmptySelfOptions, TransitionOptions>()( {
      fromTargets: [ {
        attribute: 'clipArea',
        from: bounds,
        to: fromNodeBounds,
        // @ts-expect-error EEEEK - we're relying on blend to convert a bounds to a shape...?
        blend: clipBlend
      } ],
      toTargets: [ {
        attribute: 'clipArea',
        from: toNodeBounds,
        to: bounds,
        // @ts-expect-error EEEEK - we're relying on blend to convert a bounds to a shape...?
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