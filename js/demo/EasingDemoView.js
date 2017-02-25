// Copyright 2015, University of Colorado Boulder

/**
 * TODO
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var ScreenView = require( 'JOIST/ScreenView' );
  var Circle = require( 'SCENERY/nodes/Circle' );
  var Plane = require( 'SCENERY/nodes/Plane' );
  var Property = require( 'AXON/Property' );
  var twixt = require( 'TWIXT/twixt' );
  var EaseAnimation = require( 'TWIXT/EaseAnimation' );
  var Easing = require( 'TWIXT/Easing' );

  /**
   * @constructor
   */
  function EasingDemoView() {
    // TODO: remove duplication between screenviews
    var self = this;

    ScreenView.call( this );

    // TODO: better handling of vector properties, etc.
    var xProperty = new Property( this.layoutBounds.centerX );
    var yProperty = new Property( this.layoutBounds.centerY );
    var durationProperty = new Property( 1 );

    this.xAnimation = new EaseAnimation( Easing.QUADRATIC_IN_OUT, {
      valueProperty: xProperty,
      duration: durationProperty.value,
      targetValue: xProperty.value // TODO don't require this
    } );
    this.yAnimation = new EaseAnimation( Easing.QUADRATIC_IN_OUT, {
      valueProperty: yProperty,
      duration: durationProperty.value,
      targetValue: yProperty.value // TODO don't require this
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
      stroke: 'red'
    } );
    this.addChild( targetCircle );

    this.addInputListener( {
      down: function( event ) {
        if ( !event.canStartPress() ) { return; }

        var localPoint = self.globalToLocalPoint( event.pointer.point );
        targetCircle.translation = localPoint;
        self.xAnimation.retarget( localPoint.x, durationProperty.value );
        self.yAnimation.retarget( localPoint.y, durationProperty.value );
      }
    } );
  }

  twixt.register( 'EasingDemoView', EasingDemoView );

  return inherit( ScreenView, EasingDemoView, {
    step: function( dt ) {
      this.xAnimation.step( dt );
      this.yAnimation.step( dt );
    }
  } );
} );