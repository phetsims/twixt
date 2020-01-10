// Copyright 2017-2020, University of Colorado Boulder

/**
 * Demos how TransitionNode works
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( require => {
  'use strict';

  // modules
  const Bounds2 = require( 'DOT/Bounds2' );
  const Color = require( 'SCENERY/util/Color' );
  const Dimension2 = require( 'DOT/Dimension2' );
  const Easing = require( 'TWIXT/Easing' );
  const EasingComboBox = require( 'TWIXT/demo/EasingComboBox' );
  const HBox = require( 'SCENERY/nodes/HBox' );
  const HSlider = require( 'SUN/HSlider' );
  const inherit = require( 'PHET_CORE/inherit' );
  const merge = require( 'PHET_CORE/merge' );
  const Node = require( 'SCENERY/nodes/Node' );
  const PhetFont = require( 'SCENERY_PHET/PhetFont' );
  const Property = require( 'AXON/Property' );
  const Range = require( 'DOT/Range' );
  const Rectangle = require( 'SCENERY/nodes/Rectangle' );
  const RectangularPushButton = require( 'SUN/buttons/RectangularPushButton' );
  const ResetAllButton = require( 'SCENERY_PHET/buttons/ResetAllButton' );
  const ScreenView = require( 'JOIST/ScreenView' );
  const Text = require( 'SCENERY/nodes/Text' );
  const TransitionNode = require( 'TWIXT/TransitionNode' );
  const twixt = require( 'TWIXT/twixt' );
  const VBox = require( 'SCENERY/nodes/VBox' );

  /**
   * @constructor
   */
  function TransitionDemoView() {
    const self = this;

    ScreenView.call( this );

    const bounds = new Bounds2( 0, 0, 320, 240 );

    const easingProperty = new Property( Easing.QUADRATIC_IN_OUT );
    const durationProperty = new Property( 0.3 );

    function createSomething() {
      function randomColor() {
        return new Color( phet.joist.random.nextInt( 256 ), phet.joist.random.nextInt( 256 ), phet.joist.random.nextInt( 256 ) );
      }

      function randomString() {
        return _.range( 0, 7 ).map( function() {
          return String.fromCharCode( phet.joist.random.nextIntBetween( 65, 122 ) );
        } ).join( '' );
      }

      return Rectangle.bounds( bounds, {
        fill: randomColor(),
        children: [
          new Text( randomString(), {
            font: new PhetFont( 60 ),
            center: bounds.center
          } )
        ]
      } );
    }

    // @private {TransitionNode}
    this.transitionNode = new TransitionNode( new Property( bounds ), {
      content: createSomething()
    } );

    const listParent = new Node();

    const comboBox = new EasingComboBox( easingProperty, listParent, {
      centerX: this.layoutBounds.centerX,
      bottom: this.transitionNode.top - 10
    } );

    function sliderGroup( property, range, label, majorTicks, options ) {
      const labelNode = new Text( label, { font: new PhetFont( 20 ) } );
      const slider = new HSlider( property, range, {
        trackSize: new Dimension2( 300, 5 )
      } );
      majorTicks.forEach( function( tick ) {
        slider.addMajorTick( tick, new Text( tick, { font: new PhetFont( 20 ) } ) );
      } );
      return new VBox( merge( {
        children: [ labelNode, slider ],
        spacing: 10
      }, options ) );
    }

    const durationSlider = sliderGroup( durationProperty, new Range( 0.1, 2 ), 'Duration', [ 0.1, 0.5, 1, 2 ], {
      left: 10,
      top: 10
    } );

    const buttons = [
      'slideLeftTo',
      'slideRightTo',
      'slideUpTo',
      'slideDownTo',
      'wipeLeftTo',
      'wipeRightTo',
      'wipeUpTo',
      'wipeDownTo',
      'dissolveTo'
    ].map( function( name ) {
      return new RectangularPushButton( {
        content: new Text( name, { font: new PhetFont( 20 ) } ),
        listener: function() {
          self.transitionNode[ name ]( createSomething(), {
            duration: durationProperty.value,
            targetOptions: {
              easing: easingProperty.value
            }
          } );
        }
      } );
    } );

    this.addChild( new VBox( {
      children: [ durationSlider, comboBox, this.transitionNode ].concat( _.chunk( buttons, 4 ).map( function( children ) {
        return new HBox( {
          children: children,
          spacing: 10
        } );
      } ) ),
      spacing: 10,
      center: this.layoutBounds.center
    } ) );

    // Reset All button
    const resetAllButton = new ResetAllButton( {
      listener: function() {
        durationProperty.reset();
        easingProperty.reset();
      },
      right: this.layoutBounds.maxX - 10,
      bottom: this.layoutBounds.maxY - 10
    } );
    this.addChild( resetAllButton );

    this.addChild( listParent );
  }

  twixt.register( 'TransitionDemoView', TransitionDemoView );

  return inherit( ScreenView, TransitionDemoView, {
    step: function( dt ) {
      this.transitionNode.step( dt );
    }
  } );
} );