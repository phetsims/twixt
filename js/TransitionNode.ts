// Copyright 2023, University of Colorado Boulder

/**
 * Holds content, and can transition to other content with a variety of animations. During a transition, there is always
 * the "from" content that animates out, and the "to" content that animates in.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import TReadOnlyProperty from '../../axon/js/TReadOnlyProperty.js';
import Bounds2 from '../../dot/js/Bounds2.js';
import { Shape } from '../../kite/js/imports.js';
import optionize from '../../phet-core/js/optionize.js';
import StrictOmit from '../../phet-core/js/types/StrictOmit.js';
import { Node, NodeOptions } from '../../scenery/js/imports.js';
import Transition, { DissolveTransitionOptions, SlideTransitionOptions, WipeTransitionOptions } from './Transition.js';
import twixt from './twixt.js';

type SelfOptions = {
  // Optionally may have initial content
  content?: Node | null;

  // If true, a clip area will be set to the value of the transitionBoundsProperty so that outside content won't be
  // shown.
  useBoundsClip?: boolean;

  // Any node specified in this array will be added as a permanent child internally, so that transitions to/from it
  // doesn't incur higher performance penalties. It will instead just be invisible when not involved in a transition.
  // Performance issues were initially noted in
  // https://github.com/phetsims/equality-explorer/issues/75. Additional notes in
  // https://github.com/phetsims/twixt/issues/17.
  cachedNodes?: Node[];
};

export type TransitionNodeOptions = SelfOptions & StrictOmit<NodeOptions, 'children'>;

class TransitionNode extends Node {

  private readonly transitionBoundsProperty: TReadOnlyProperty<Bounds2>;
  private readonly useBoundsClip: boolean;
  private readonly cachedNodes: Node[];

  // When animating, it is the content that we are animating away from. Otherwise, it holds the main content node.
  private fromContent: Node | null;

  // Holds the content that we are animating towards.
  private toContent: Node | null = null;

  // If we are animating, this will be non-null
  private transition: Transition | null;

  private paddingNode: Node;
  private boundsListener: ( bounds: Bounds2 ) => void;

  /**
   * NOTE: The content's transform/pickability/visibility/opacity/clipArea/etc. can be modified, and will be reset to
   * the default value
   *
   * @param transitionBoundsProperty - Use visibleBoundsProperty (from the ScreenView) for full-screen transitions.
   *                                   Generally TransitionNode assumes all content, when it has no transform applied,
   *                                   is meant to by laid out within these bounds.
   * @param [options]
   */
  public constructor( transitionBoundsProperty: TReadOnlyProperty<Bounds2>, providedOptions?: TransitionNodeOptions ) {

    const options = optionize<TransitionNodeOptions, SelfOptions, NodeOptions>()( {
      content: null,
      useBoundsClip: true,
      cachedNodes: []
    }, providedOptions );

    assert && assert( !options.children, 'Children should not be specified, since cachedNodes will be applied' );

    super();

    this.transitionBoundsProperty = transitionBoundsProperty;
    this.useBoundsClip = options.useBoundsClip;
    this.cachedNodes = options.cachedNodes;
    this.fromContent = options.content;

    this.children = this.cachedNodes;
    for ( let i = 0; i < this.cachedNodes.length; i++ ) {
      const cachedNode = this.cachedNodes[ i ];
      cachedNode.visible = cachedNode === this.fromContent;
    }

    if ( this.fromContent && !_.includes( this.cachedNodes, this.fromContent ) ) {
      this.addChild( this.fromContent );
    }

    this.transition = null;

    this.paddingNode = new Node();
    this.addChild( this.paddingNode );

    this.boundsListener = this.onBoundsChange.bind( this );
    this.transitionBoundsProperty.link( this.boundsListener );

    this.mutate( options );
  }

  /**
   * Steps forward in time, animating the transition.
   */
  public step( dt: number ): void {
    this.transition && this.transition.step( dt );
  }

  /**
   * Interrupts the transition, ending it and resetting the animated values.
   */
  public interrupt(): void {
    this.transition && this.transition.stop();
  }

  /**
   * Called on bounds changes.
   */
  private onBoundsChange( bounds: Bounds2 ): void {
    this.interrupt();

    if ( this.useBoundsClip ) {
      this.clipArea = Shape.bounds( bounds );
    }

    // Provide a localBounds override so that we take up at least the provided bounds. This makes layout easier so
    // that the TransitionNode always provides consistent bounds with clipping. See
    // https://github.com/phetsims/twixt/issues/15.
    this.paddingNode.localBounds = bounds;
  }

  /**
   * Start a transition to replace our content with the new content, using Transition.slideLeft.
   *
   * @param content - If null, the current content will still animate out (with nothing replacing it).
   * @param config - Passed as config to the Animation. Usually a duration should be included.
   * @returns - Available to add end listeners, etc.
   */
  public slideLeftTo( content: Node | null, config?: SlideTransitionOptions ): Transition {
    this.interrupt();
    return this.startTransition( content, Transition.slideLeft( this.transitionBoundsProperty.value, this.fromContent, content, config ) );
  }

  /**
   * Start a transition to replace our content with the new content, using Transition.slideRight.
   *
   * @param content - If null, the current content will still animate out (with nothing replacing it).
   * @param config - Passed as config to the Animation. Usually a duration should be included.
   * @returns - Available to add end listeners, etc.
   */
  public slideRightTo( content: Node | null, config?: SlideTransitionOptions ): Transition {
    this.interrupt();
    return this.startTransition( content, Transition.slideRight( this.transitionBoundsProperty.value, this.fromContent, content, config ) );
  }

  /**
   * Start a transition to replace our content with the new content, using Transition.slideUp.
   *
   * @param content - If null, the current content will still animate out (with nothing replacing it).
   * @param config - Passed as config to the Animation. Usually a duration should be included.
   * @returns - Available to add end listeners, etc.
   */
  public slideUpTo( content: Node | null, config?: SlideTransitionOptions ): Transition {
    this.interrupt();
    return this.startTransition( content, Transition.slideUp( this.transitionBoundsProperty.value, this.fromContent, content, config ) );
  }

  /**
   * Start a transition to replace our content with the new content, using Transition.slideDown.
   *
   * @param content - If null, the current content will still animate out (with nothing replacing it).
   * @param config - Passed as config to the Animation. Usually a duration should be included.
   * @returns - Available to add end listeners, etc.
   */
  public slideDownTo( content: Node | null, config?: SlideTransitionOptions ): Transition {
    this.interrupt();
    return this.startTransition( content, Transition.slideDown( this.transitionBoundsProperty.value, this.fromContent, content, config ) );
  }

  /**
   * Start a transition to replace our content with the new content, using Transition.wipeLeft.
   *
   * @param content - If null, the current content will still animate out (with nothing replacing it).
   * @param config - Passed as config to the Animation. Usually a duration should be included.
   * @returns - Available to add end listeners, etc.
   */
  public wipeLeftTo( content: Node | null, config?: WipeTransitionOptions ): Transition {
    this.interrupt();
    return this.startTransition( content, Transition.wipeLeft( this.transitionBoundsProperty.value, this.fromContent, content, config ) );
  }

  /**
   * Start a transition to replace our content with the new content, using Transition.wipeRight.
   *
   * @param content - If null, the current content will still animate out (with nothing replacing it).
   * @param config - Passed as config to the Animation. Usually a duration should be included.
   * @returns - Available to add end listeners, etc.
   */
  public wipeRightTo( content: Node | null, config?: WipeTransitionOptions ): Transition {
    this.interrupt();
    return this.startTransition( content, Transition.wipeRight( this.transitionBoundsProperty.value, this.fromContent, content, config ) );
  }

  /**
   * Start a transition to replace our content with the new content, using Transition.wipeUp.
   *
   * @param content - If null, the current content will still animate out (with nothing replacing it).
   * @param config - Passed as config to the Animation. Usually a duration should be included.
   * @returns - Available to add end listeners, etc.
   */
  public wipeUpTo( content: Node | null, config?: WipeTransitionOptions ): Transition {
    this.interrupt();
    return this.startTransition( content, Transition.wipeUp( this.transitionBoundsProperty.value, this.fromContent, content, config ) );
  }

  /**
   * Start a transition to replace our content with the new content, using Transition.wipeDown.
   *
   * @param content - If null, the current content will still animate out (with nothing replacing it).
   * @param config - Passed as config to the Animation. Usually a duration should be included.
   * @returns - Available to add end listeners, etc.
   */
  public wipeDownTo( content: Node | null, config?: WipeTransitionOptions ): Transition {
    this.interrupt();
    return this.startTransition( content, Transition.wipeDown( this.transitionBoundsProperty.value, this.fromContent, content, config ) );
  }

  /**
   * Start a transition to replace our content with the new content, using Transition.dissolve.
   *
   * @param content - If null, the current content will still animate out (with nothing replacing it).
   * @param config - Passed as config to the Animation. Usually a duration should be included.
   * @returns - Available to add end listeners, etc.
   */
  public dissolveTo( content: Node | null, config?: DissolveTransitionOptions ): Transition {
    this.interrupt();
    return this.startTransition( content, Transition.dissolve( this.fromContent, content, config ) );
  }

  /**
   * Starts a transition, and hooks up a listener to handle state changes when it ends.
   *
   * @returns - Available to add end listeners, etc. (chained)
   */
  private startTransition( content: Node | null, transition: Transition ): Transition {

    // Stop animating if we were before
    this.interrupt();

    this.toContent = content;

    if ( content ) {
      if ( _.includes( this.cachedNodes, content ) ) {
        content.visible = true;
      }
      else {
        this.addChild( content );
      }
      assert && assert( this.hasChild( content ),
        'Should always have the content as a child at the start of a transition' );
    }

    this.transition = transition;

    // Simplifies many things if the user can't mess with things while animating.
    if ( this.fromContent ) {
      this.fromContent.pickable = false;
    }
    if ( this.toContent ) {
      this.toContent.pickable = false;
    }

    transition.endedEmitter.addListener( () => {
      if ( this.fromContent ) {
        this.fromContent.pickable = null;
      }
      if ( this.toContent ) {
        this.toContent.pickable = null;
      }

      this.transition = null;

      if ( this.fromContent ) {
        if ( _.includes( this.cachedNodes, this.fromContent ) ) {
          this.fromContent.visible = false;
        }
        else {
          this.removeChild( this.fromContent );
        }
        assert && assert( this.hasChild( this.fromContent ) === _.includes( this.cachedNodes, this.fromContent ),
          'Should have removed the child if it is not included in our cachedNodes' );
      }

      this.fromContent = this.toContent;
      this.toContent = null;
    } );

    transition.start();

    return transition;
  }

  public override dispose(): void {
    this.interrupt();
    this.transitionBoundsProperty.unlink( this.boundsListener );
    super.dispose();
  }
}

twixt.register( 'TransitionNode', TransitionNode );
export default TransitionNode;