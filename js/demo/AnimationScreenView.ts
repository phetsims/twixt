// Copyright 2020-2025, University of Colorado Boulder

/**
 * TODO #3
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Property from '../../../axon/js/Property.js';
import Dimension2 from '../../../dot/js/Dimension2.js';
import dotRandom from '../../../dot/js/dotRandom.js';
import Range from '../../../dot/js/Range.js';
import ScreenView from '../../../joist/js/ScreenView.js';
import merge from '../../../phet-core/js/merge.js';
import PhetFont from '../../../scenery-phet/js/PhetFont.js';
import VBox from '../../../scenery/js/layout/nodes/VBox.js';
import Circle from '../../../scenery/js/nodes/Circle.js';
import Node, { NodeTranslationOptions } from '../../../scenery/js/nodes/Node.js';
import Plane from '../../../scenery/js/nodes/Plane.js';
import Text from '../../../scenery/js/nodes/Text.js';
import Color from '../../../scenery/js/util/Color.js';
import HSlider from '../../../sun/js/HSlider.js';
import Tandem from '../../../tandem/js/Tandem.js';
import Animation from '../Animation.js';
import Easing from '../Easing.js';
import twixt from '../twixt.js';
import EasingComboBox from './EasingComboBox.js';

export default class AnimationScreenView extends ScreenView {
  public constructor() {

    super( {
      tandem: Tandem.OPT_OUT
    } );

    const positionProperty = new Property( this.layoutBounds.center );
    const colorProperty = new Property( new Color( 0, 128, 255, 0.5 ) );
    const durationProperty = new Property( 0.5 );
    const easingProperty = new Property( Easing.QUADRATIC_IN_OUT );

    // to get the input events :(
    this.addChild( new Plane() );

    const animatedCircle = new Circle( 20, {
      fill: colorProperty,
      stroke: 'black',
      children: [
        new Circle( 3, { fill: 'black' } )
      ]
    } );
    positionProperty.linkAttribute( animatedCircle, 'translation' );
    this.addChild( animatedCircle );

    const targetCircle = new Circle( 20, {
      stroke: 'red',
      translation: positionProperty.value
    } );
    this.addChild( targetCircle );

    const larger = new Animation( {
      setValue: function( value ) { animatedCircle.setScaleMagnitude( value ); },
      from: 0.7,
      to: 1,
      duration: 0.4,
      easing: Easing.QUADRATIC_IN_OUT
    } );
    const smaller = new Animation( {
      setValue: function( value ) { animatedCircle.setScaleMagnitude( value ); },
      from: 1,
      to: 0.7,
      duration: 0.4,
      easing: Easing.QUADRATIC_IN_OUT
    } );
    larger.then( smaller );
    smaller.then( larger );
    smaller.start();

    let animation: Animation;
    this.addInputListener( {
      down: event => {
        if ( !event.canStartPress() ) { return; }
        if ( !( event.target instanceof Plane ) ) { return; }

        const localPoint = this.globalToLocalPoint( event.pointer.point );
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
            to: new Color( dotRandom.nextInt( 256 ), dotRandom.nextInt( 256 ), dotRandom.nextInt( 256 ), 0.5 )
          } ],
          duration: durationProperty.value
        } ).start();
      }
    } );

    this.addChild( createSliderBox( durationProperty, new Range( 0.1, 2 ), 'Duration', [ 0.1, 0.5, 1, 2 ], {
      left: 10,
      top: 10
    } ) );

    const listParent = new Node();

    this.addChild( new EasingComboBox( easingProperty, listParent, {
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
}

function createSliderBox( property: Property<number>, range: Range, label: string, majorTicks: number[], options?: NodeTranslationOptions ): Node {
  const labelNode = new Text( label, { font: new PhetFont( 20 ) } );
  const slider = new HSlider( property, range, {
    trackSize: new Dimension2( 300, 5 )
  } );
  majorTicks.forEach( tick => {
    slider.addMajorTick( tick, new Text( tick, { font: new PhetFont( 20 ) } ) );
  } );
  return new VBox( merge( {
    children: [ labelNode, slider ],
    spacing: 10
  }, options ) );
}

twixt.register( 'AnimationScreenView', AnimationScreenView );