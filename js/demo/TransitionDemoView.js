// Copyright 2017-2018, University of Colorado Boulder

/**
 * TODO
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( function( require ) {
  'use strict';

  // modules
  var Bounds2 = require( 'DOT/Bounds2' );
  var Color = require( 'SCENERY/util/Color' );
  var ComboBox = require( 'SUN/ComboBox' );
  var Dimension2 = require( 'DOT/Dimension2' );
  var Easing = require( 'TWIXT/Easing' );
  var HBox = require( 'SCENERY/nodes/HBox' );
  var HSlider = require( 'SUN/HSlider' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Property = require( 'AXON/Property' );
  var Range = require( 'DOT/Range' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var RectangularPushButton = require( 'SUN/buttons/RectangularPushButton' );
  var ResetAllButton = require( 'SCENERY_PHET/buttons/ResetAllButton' );
  var ScreenView = require( 'JOIST/ScreenView' );
  var Text = require( 'SCENERY/nodes/Text' );
  var TransitionNode = require( 'TWIXT/TransitionNode' );
  var twixt = require( 'TWIXT/twixt' );
  var VBox = require( 'SCENERY/nodes/VBox' );

  /**
   * @constructor
   */
  function TransitionDemoView() {
    var self = this;

    ScreenView.call( this );

    var bounds = new Bounds2( 0, 0, 320, 240 );

    var easingProperty = new Property( Easing.QUADRATIC_IN_OUT );
    var durationProperty = new Property( 0.3 );

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

    var listParent = new Node();
    var comboTextOptions = { font: new PhetFont( 16 ) };
    var comboBox = new ComboBox( [
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
      centerX: this.layoutBounds.centerX,
      bottom: this.transitionNode.top - 10
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

    var durationSlider = sliderGroup( durationProperty, new Range( 0.1, 2 ), 'Duration', [ 0.1, 0.5, 1, 2 ], {
      left: 10,
      top: 10
    } );

    var buttons = [
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
    var resetAllButton = new ResetAllButton( {
      listener: function() {
        durationProperty.reset();
        easingProperty.reset();
      },
      right:  this.layoutBounds.maxX - 10,
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