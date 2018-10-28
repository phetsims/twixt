// Copyright 2017, University of Colorado Boulder

/**
 * TODO #3
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( function( require ) {
  'use strict';

  // modules
  var Animation = require( 'TWIXT/Animation' );
  var Circle = require( 'SCENERY/nodes/Circle' );
  var Color = require( 'SCENERY/util/Color' );
  var ComboBox = require( 'SUN/ComboBox' );
  var Dimension2 = require( 'DOT/Dimension2' );
  var Easing = require( 'TWIXT/Easing' );
  var HSlider = require( 'SUN/HSlider' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Plane = require( 'SCENERY/nodes/Plane' );
  var Property = require( 'AXON/Property' );
  var Range = require( 'DOT/Range' );
  var ScreenView = require( 'JOIST/ScreenView' );
  var Text = require( 'SCENERY/nodes/Text' );
  var twixt = require( 'TWIXT/twixt' );
  var VBox = require( 'SCENERY/nodes/VBox' );

  /**
   * @constructor
   */
  function AnimationView() {
    // TODO: remove duplication between screenviews
    var self = this;

    ScreenView.call( this );

    var positionProperty = new Property( this.layoutBounds.center );
    var colorProperty = new Property( new Color( 0, 128, 255, 0.5 ) );
    var durationProperty = new Property( 0.5 );
    var easingProperty = new Property( Easing.QUADRATIC_IN_OUT );

    // to get the input events :(
    this.addChild( new Plane() );

    var animatedCircle = new Circle( 20, {
      fill: colorProperty,
      stroke: 'black',
      children: [
        new Circle( 3, { fill: 'black' } )
      ]
    } );
    positionProperty.linkAttribute( animatedCircle, 'translation' );
    this.addChild( animatedCircle );

    var targetCircle = new Circle( 20, {
      stroke: 'red',
      translation: positionProperty.value
    } );
    this.addChild( targetCircle );

    var larger = new Animation( {
      setValue: function( value ) { animatedCircle.setScaleMagnitude( value ); },
      from: 0.7,
      to: 1,
      duration: 0.4,
      easing: Easing.QUADRATIC_IN_OUT
    } );
    var smaller = new Animation( {
      setValue: function( value ) { animatedCircle.setScaleMagnitude( value ); },
      from: 1,
      to: 0.7,
      duration: 0.4,
      easing: Easing.QUADRATIC_IN_OUT
    } );
    larger.then( smaller );
    smaller.then( larger );
    smaller.start();

    var animation = null;
    this.addInputListener( {
      down: function( event ) {
        if ( !event.canStartPress() ) { return; }
        if ( !( event.target instanceof Plane ) ) { return; }

        var localPoint = self.globalToLocalPoint( event.pointer.point );
        targetCircle.translation = localPoint;

        animation && animation.stop();
        animation = new Animation( {
          targets: [ {
            property: positionProperty,
            easing: easingProperty.value,
            to: localPoint
          }, {
            property: colorProperty,
            easing: easingProperty.value,
            to: new Color( phet.joist.random.nextInt( 256 ), phet.joist.random.nextInt( 256 ), phet.joist.random.nextInt( 256 ), 0.5 )
          } ],
          duration: durationProperty.value
        } ).start();
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
      { node: new Text( 'Quintic in-out', comboTextOptions ), value: Easing.QUINTIC_IN_OUT },
      { node: new Text( 'Quintic in', comboTextOptions ), value: Easing.QUINTIC_IN },
      { node: new Text( 'Quintic out', comboTextOptions ), value: Easing.QUINTIC_OUT }
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

  twixt.register( 'AnimationView', AnimationView );

  return inherit( ScreenView, AnimationView );
} );