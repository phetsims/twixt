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
  var Node = require( 'SCENERY/nodes/Node' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Property = require( 'AXON/Property' );
  var Text = require( 'SCENERY/nodes/Text' );
  var VBox = require( 'SCENERY/nodes/VBox' );
  var twixt = require( 'TWIXT/twixt' );
  var Dimension2 = require( 'DOT/Dimension2' );
  var Range = require( 'DOT/Range' );
  var EaseAnimation = require( 'TWIXT/EaseAnimation' );
  var HSlider = require( 'SUN/HSlider' );
  var ComboBox = require( 'SUN/ComboBox' );
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
    var xTargetProperty = new Property( xProperty.value );
    var yTargetProperty = new Property( yProperty.value );
    var durationProperty = new Property( 1 );
    var easingProperty = new Property( Easing.QUADRATIC_IN_OUT );

    this.animations = [];

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

    this.addInputListener( {
      down: function( event ) {
        if ( !event.canStartPress() ) { return; }
        if ( !( event.target instanceof Plane ) ) { return; }

        var localPoint = self.globalToLocalPoint( event.pointer.point );
        targetCircle.translation = localPoint;

        self.animations.push( new EaseAnimation( {
          easing: easingProperty.value,
          initialValue: xTargetProperty.value,
          targetValue: localPoint.x,
          duration: durationProperty.value,
          delta: function( xDelta ) {
            xProperty.value += xDelta;
          }
        } ) );
        xTargetProperty.value = localPoint.x;

        self.animations.push( new EaseAnimation( {
          easing: easingProperty.value,
          initialValue: yTargetProperty.value,
          targetValue: localPoint.y,
          duration: durationProperty.value,
          delta: function( yDelta ) {
            yProperty.value += yDelta;
          }
        } ) );
        yTargetProperty.value = localPoint.y;
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

    this.addChild( sliderGroup( durationProperty, new Range( 0.1, 2 ), 'Duration', [ 0.1, 0.5, 1, 2 ], {
      left: 10,
      top: 10
    } ) );

    var listParent = new Node();

    var comboTextOptions = { font: new PhetFont( 16 ) };
    this.addChild( new ComboBox( [
      { node: new Text( 'Linear', comboTextOptions ), value: Easing.LINEAR },
      { node: new Text( 'Quadratic in-out', comboTextOptions ), value: Easing.QUADRATIC_IN_OUT },
      { node: new Text( 'Quadratic in', comboTextOptions ), value: Easing.QUADRATIC_IN },
      { node: new Text( 'Quadratic out', comboTextOptions ), value: Easing.QUADRATIC_OUT },
      { node: new Text( 'Cubic in-out', comboTextOptions ), value: Easing.CUBIC_IN_OUT },
      { node: new Text( 'Cubic in', comboTextOptions ), value: Easing.CUBIC_IN },
      { node: new Text( 'Cubic out', comboTextOptions ), value: Easing.CUBIC_OUT },
      { node: new Text( 'Quartic in-out', comboTextOptions ), value: Easing.QUARTIC_IN_OUT },
      { node: new Text( 'Quartic in', comboTextOptions ), value: Easing.QUARTIC_IN },
      { node: new Text( 'Quartic out', comboTextOptions ), value: Easing.QUARTIC_OUT },
      { node: new Text( 'Qunitic in-out', comboTextOptions ), value: Easing.QUNTIC_IN_OUT },
      { node: new Text( 'Qunitic in', comboTextOptions ), value: Easing.QUNTIC_IN },
      { node: new Text( 'Qunitic out', comboTextOptions ), value: Easing.QUNTIC_OUT },
    ], easingProperty, listParent, {
      right: this.layoutBounds.right - 10,
      top: 10
    } ) );

    this.addChild( new Text( 'Click to move the animation target', {
      font: new PhetFont( 30 ),
      bottom: this.layoutBounds.bottom - 10,
      centerX: this.layoutBounds.centerX
    } ) );

    this.addChild( listParent );
  }

  twixt.register( 'EasingDemoView', EasingDemoView );

  return inherit( ScreenView, EasingDemoView, {
    step: function( dt ) {
      for ( var i = this.animations.length - 1; i >= 0; i-- ) {
        var animation = this.animations[ i ];
        animation.step( dt );
        if ( animation.ratio === 1 ) {
          this.animations.splice( i, 1 );
        }
      }
    }
  } );
} );