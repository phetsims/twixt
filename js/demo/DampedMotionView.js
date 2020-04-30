// Copyright 2017-2020, University of Colorado Boulder

/**
 * Displays a demo for showing how damped motion (with DampedAnimation) works.
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Property from '../../../axon/js/Property.js';
import Dimension2 from '../../../dot/js/Dimension2.js';
import Range from '../../../dot/js/Range.js';
import ScreenView from '../../../joist/js/ScreenView.js';
import inherit from '../../../phet-core/js/inherit.js';
import merge from '../../../phet-core/js/merge.js';
import PhetFont from '../../../scenery-phet/js/PhetFont.js';
import Circle from '../../../scenery/js/nodes/Circle.js';
import Plane from '../../../scenery/js/nodes/Plane.js';
import Text from '../../../scenery/js/nodes/Text.js';
import VBox from '../../../scenery/js/nodes/VBox.js';
import HSlider from '../../../sun/js/HSlider.js';
import DampedAnimation from '../DampedAnimation.js';
import twixt from '../twixt.js';

/**
 * @constructor
 */
function DampedMotionView() {
  const self = this;

  ScreenView.call( this );

  const xProperty = new Property( this.layoutBounds.centerX );
  const yProperty = new Property( this.layoutBounds.centerY );
  const forceProperty = new Property( 40 );
  const dampingProperty = new Property( 1 );

  this.xAnimation = new DampedAnimation( {
    valueProperty: xProperty,
    force: forceProperty.value,
    damping: dampingProperty.value,
    targetValue: xProperty.value
  } );
  this.yAnimation = new DampedAnimation( {
    valueProperty: yProperty,
    force: forceProperty.value,
    damping: dampingProperty.value,
    targetValue: yProperty.value
  } );
  forceProperty.link( function( force ) {
    self.xAnimation.force = force;
    self.yAnimation.force = force;
  } );
  dampingProperty.link( function( damping ) {
    self.xAnimation.damping = damping;
    self.yAnimation.damping = damping;
  } );

  // to get the input events :(
  this.addChild( new Plane() );

  const animatedCircle = new Circle( 20, {
    fill: 'rgba(0,128,255,0.5)',
    stroke: 'black',
    children: [
      new Circle( 3, { fill: 'black' } )
    ]
  } );
  xProperty.linkAttribute( animatedCircle, 'x' );
  yProperty.linkAttribute( animatedCircle, 'y' );
  this.addChild( animatedCircle );

  const targetCircle = new Circle( 20, {
    stroke: 'red',
    x: xProperty.value,
    y: yProperty.value
  } );
  this.addChild( targetCircle );

  function moveToEvent( event ) {
    const localPoint = self.globalToLocalPoint( event.pointer.point );
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

inherit( ScreenView, DampedMotionView, {
  step: function( dt ) {
    this.xAnimation.step( dt );
    this.yAnimation.step( dt );
  }
} );

export default DampedMotionView;