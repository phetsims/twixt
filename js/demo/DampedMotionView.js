// Copyright 2017, University of Colorado Boulder

/**
 * TODO
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( require => {
  'use strict';

  // modules
  const Circle = require( 'SCENERY/nodes/Circle' );
  const DampedAnimation = require( 'TWIXT/DampedAnimation' );
  const Dimension2 = require( 'DOT/Dimension2' );
  const HSlider = require( 'SUN/HSlider' );
  const inherit = require( 'PHET_CORE/inherit' );
  const PhetFont = require( 'SCENERY_PHET/PhetFont' );
  const Plane = require( 'SCENERY/nodes/Plane' );
  const Property = require( 'AXON/Property' );
  const Range = require( 'DOT/Range' );
  const ScreenView = require( 'JOIST/ScreenView' );
  const Text = require( 'SCENERY/nodes/Text' );
  const twixt = require( 'TWIXT/twixt' );
  const VBox = require( 'SCENERY/nodes/VBox' );

  /**
   * @constructor
   */
  function DampedMotionView() {
    var self = this;

    ScreenView.call( this );

    // TODO: better handling of vector properties, etc.
    var xProperty = new Property( this.layoutBounds.centerX );
    var yProperty = new Property( this.layoutBounds.centerY );
    var forceProperty = new Property( 40 );
    var dampingProperty = new Property( 1 );

    this.xAnimation = new DampedAnimation( {
      valueProperty: xProperty,
      force: forceProperty.value,
      damping: dampingProperty.value,
      targetValue: xProperty.value // TODO don't require this
    } );
    this.yAnimation = new DampedAnimation( {
      valueProperty: yProperty,
      force: forceProperty.value,
      damping: dampingProperty.value,
      targetValue: yProperty.value // TODO don't require this
    } );
    forceProperty.link( function( force ) {
      // TODO: have actual mutable calls (this is unclean)
      self.xAnimation.force = force;
      self.xAnimation.recompute();

      self.yAnimation.force = force;
      self.yAnimation.recompute();
    } );
    dampingProperty.link( function( damping ) {
      // TODO: have actual mutable calls (this is unclean)
      self.xAnimation.damping = damping;
      self.xAnimation.recompute();

      self.yAnimation.damping = damping;
      self.yAnimation.recompute();
    } );

    // to get the input events :(
    this.addChild( new Plane() );

    var animatedCircle = new Circle( 20, {
      fill: 'rgba(0,128,255,0.5)',
      stroke: 'black',
      children: [
        new Circle( 3, { fill: 'black' } )
      ]
    } );
    xProperty.linkAttribute( animatedCircle, 'x' );
    yProperty.linkAttribute( animatedCircle, 'y' );
    this.addChild( animatedCircle );

    var targetCircle = new Circle( 20, {
      stroke: 'red',
      x: xProperty.value,
      y: yProperty.value
    } );
    this.addChild( targetCircle );

    function moveToEvent( event ) {
      var localPoint = self.globalToLocalPoint( event.pointer.point );
      targetCircle.translation = localPoint;
      self.xAnimation.targetValue = localPoint.x;
      self.yAnimation.targetValue = localPoint.y;
    }

    this.addInputListener( {
      down: function( event ) {
        if ( !event.canStartPress() ) { return; }

        moveToEvent( event );
      },
      move: function( event ) {
        if ( event.pointer.isDown ) {
          moveToEvent( event );
        }
      }
    } );

    function sliderGroup( property, range, label, majorTicks, options ) {
      var labelNode = new Text( label, { font: new PhetFont( 20 ) } );
      var slider = new HSlider( property, range, {
        trackSize: new Dimension2( 300, 5 )
      } );
      majorTicks.forEach( function( tick ) {
        slider.addMajorTick( tick, new Text( tick, { font: new PhetFont( 20 ) } ) );
      } );
      return new VBox( _.extend( {
        children: [ labelNode, slider ],
        spacing: 10
      }, options ) );
    }

    this.addChild( sliderGroup( forceProperty, new Range( 5, 200 ), 'Force', [ 5, 200 ], {
      left: 10,
      top: 10
    } ) );

    this.addChild( sliderGroup( dampingProperty, new Range( 0.1, 3 ), 'Damping', [ 0.1, 1, 3 ], {
      right: this.layoutBounds.right - 10,
      top: 10
    } ) );

    this.addChild( new Text( 'Click or drag to move the animation target', {
      font: new PhetFont( 30 ),
      bottom: this.layoutBounds.bottom - 10,
      centerX: this.layoutBounds.centerX
    } ) );
  }

  twixt.register( 'DampedMotionView', DampedMotionView );

  return inherit( ScreenView, DampedMotionView, {
    step: function( dt ) {
      this.xAnimation.step( dt );
      this.yAnimation.step( dt );
    }
  } );
} );