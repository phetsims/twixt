// Copyright 2018, University of Colorado Boulder

/**
 * Holds content, and can transition to other content with a variety of animations. During a transition, there is always
 * the "from" content that animates out, and the "to" content that animates in.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Shape = require( 'KITE/Shape' );
  var Transition = require( 'TWIXT/Transition' );
  var twixt = require( 'TWIXT/twixt' );

  /**
   * @constructor
   * @extends {Node}
   *
   * NOTE: The content's transform/pickability/visibility/opacity/clipArea/etc. can be modified, and will be reset to
   * the default value
   *
   * @param {Property.<Bounds2>} boundsProperty - Use visibleBoundsProperty (from the ScreenView) for full-screen
   *                                              transitions. Generally TransitionNode assumes all content, when it has
   *                                              no transform applied, is meant to by laid out within these bounds.
   * @param {Object} [options]
   */
  function TransitionNode( boundsProperty, options ) {
    options = _.extend( {
      // {Node|null} - Optionally may have initial content
      content: null,

      // {boolean} - If true, a clip area will set to the value of the boundsProperty so that outside content won't
      // be shown.
      useBoundsClip: true
    }, options );

    Node.call( this );

    // @private {Property.<Bounds2>}
    this.boundsProperty = boundsProperty;

    // @private {boolean}
    this.useBoundsClip = options.useBoundsClip;

    // @private {Node|null} - When animating, it is the content that we are animating away from. Otherwise, it holds the
    // main content node.
    this.fromContent = options.content;

    // @private {Node|null} - Holds the content that we are animating towards.
    this.toContent = null;

    if ( this.fromContent ) {
      this.addChild( this.fromContent );
    }

    // @private {Transition|null} - If we are animating, this will be non-null
    this.transition = null;

    // @private {function}
    this.boundsListener = this.onBoundsChange.bind( this );
    this.boundsProperty.link( this.boundsListener );

    this.mutate( options );
  }

  twixt.register( 'TransitionNode', TransitionNode );

  inherit( Node, TransitionNode, {
    /**
     * Steps forward in time, animating the transition.
     * @public
     *
     * @param {number} dt
     */
    step: function( dt ) {
      this.transition && this.transition.step( dt );
    },

    /**
     * Interrupts the transition, ending it and resetting the animated values.
     * @public
     */
    interrupt: function() {
      this.transition && this.transition.stop();
    },

    /**
     * Called on bounds changes.
     * @private
     *
     * @param {Bounds2} bounds
     */
    onBoundsChange: function( bounds ) {
      this.interrupt();

      if ( this.useBoundsClip ) {
        this.clipArea = Shape.bounds( bounds );
      }
    },

    /**
     * Start a transition to replace our content with the new content, using Transition.slideLeft.
     * @public
     *
     * @param {Node|null} content - If null, the current content will still animate out (with nothing replacing it).
     * @param {Object} options - Passed as options to the Animation. Usually a duration should be included.
     */
    slideLeftTo: function( content, options ) {
      this.startTransition( content, Transition.slideLeft( this.boundsProperty.value, this.fromContent, content, options ) );
    },

    /**
     * Start a transition to replace our content with the new content, using Transition.slideRight.
     * @public
     *
     * @param {Node|null} content - If null, the current content will still animate out (with nothing replacing it).
     * @param {Object} options - Passed as options to the Animation. Usually a duration should be included.
     */
    slideRightTo: function( content, options ) {
      this.startTransition( content, Transition.slideRight( this.boundsProperty.value, this.fromContent, content, options ) );
    },

    /**
     * Start a transition to replace our content with the new content, using Transition.slideUp.
     * @public
     *
     * @param {Node|null} content - If null, the current content will still animate out (with nothing replacing it).
     * @param {Object} options - Passed as options to the Animation. Usually a duration should be included.
     */
    slideUpTo: function( content, options ) {
      this.startTransition( content, Transition.slideUp( this.boundsProperty.value, this.fromContent, content, options ) );
    },

    /**
     * Start a transition to replace our content with the new content, using Transition.slideDown.
     * @public
     *
     * @param {Node|null} content - If null, the current content will still animate out (with nothing replacing it).
     * @param {Object} options - Passed as options to the Animation. Usually a duration should be included.
     */
    slideDownTo: function( content, options ) {
      this.startTransition( content, Transition.slideDown( this.boundsProperty.value, this.fromContent, content, options ) );
    },

    /**
     * Start a transition to replace our content with the new content, using Transition.wipeLeft.
     * @public
     *
     * @param {Node|null} content - If null, the current content will still animate out (with nothing replacing it).
     * @param {Object} options - Passed as options to the Animation. Usually a duration should be included.
     */
    wipeLeftTo: function( content, options ) {
      this.startTransition( content, Transition.wipeLeft( this.boundsProperty.value, this.fromContent, content, options ) );
    },

    /**
     * Start a transition to replace our content with the new content, using Transition.wipeRight.
     * @public
     *
     * @param {Node|null} content - If null, the current content will still animate out (with nothing replacing it).
     * @param {Object} options - Passed as options to the Animation. Usually a duration should be included.
     */
    wipeRightTo: function( content, options ) {
      this.startTransition( content, Transition.wipeRight( this.boundsProperty.value, this.fromContent, content, options ) );
    },

    /**
     * Start a transition to replace our content with the new content, using Transition.wipeUp.
     * @public
     *
     * @param {Node|null} content - If null, the current content will still animate out (with nothing replacing it).
     * @param {Object} options - Passed as options to the Animation. Usually a duration should be included.
     */
    wipeUpTo: function( content, options ) {
      this.startTransition( content, Transition.wipeUp( this.boundsProperty.value, this.fromContent, content, options ) );
    },

    /**
     * Start a transition to replace our content with the new content, using Transition.wipeDown.
     * @public
     *
     * @param {Node|null} content - If null, the current content will still animate out (with nothing replacing it).
     * @param {Object} options - Passed as options to the Animation. Usually a duration should be included.
     */
    wipeDownTo: function( content, options ) {
      this.startTransition( content, Transition.wipeDown( this.boundsProperty.value, this.fromContent, content, options ) );
    },

    /**
     * Start a transition to replace our content with the new content, using Transition.dissol.
     * @public
     *
     * @param {Node|null} content - If null, the current content will still animate out (with nothing replacing it).
     * @param {Object} options - Passed as options to the Animation. Usually a duration should be included.
     */
    dissolve: function( content, options ) {
      this.startTransition( content, Transition.dissolve( this.fromContent, content, options ) );
    },

    /**
     * Starts a transition, and hooks up a listener to handle state changes when it ends.
     * @private
     *
     * @param {Node|null} content
     * @param {Transition} transition
     */
    startTransition: function( content, transition ) {
      var self = this;

      // Stop animating if we were before
      this.interrupt();

      this.toContent = content;
      if ( content ) {
        this.addChild( content );
      }

      this.transition = transition;

      // Simplifies many things if the user can't mess with things while animating.
      this.fromContent.pickable = false;
      this.toContent.pickable = false;

      transition.endedEmitter.addListener( function() {
        self.fromContent.pickable = null;
        self.toContent.pickable = null;

        self.transition = null;

        self.removeChild( self.fromContent );
        self.fromContent = self.toContent;
        self.toContent = null;
      } );

      transition.start();
    },

    /**
     * Releases references.
     * @public
     * @override
     */
    dispose: function() {
      this.interrupt();
      this.boundsProperty.unlink( this.boundsListener );

      Node.prototype.dispose.call( this );
    }
  } );

  return TransitionNode;
} );
