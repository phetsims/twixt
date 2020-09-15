// Copyright 2020, University of Colorado Boulder

/**
 * Demos how TransitionNode works
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Property from '../../../axon/js/Property.js';
import Bounds2 from '../../../dot/js/Bounds2.js';
import Dimension2 from '../../../dot/js/Dimension2.js';
import Range from '../../../dot/js/Range.js';
import ScreenView from '../../../joist/js/ScreenView.js';
import merge from '../../../phet-core/js/merge.js';
import ResetAllButton from '../../../scenery-phet/js/buttons/ResetAllButton.js';
import PhetFont from '../../../scenery-phet/js/PhetFont.js';
import HBox from '../../../scenery/js/nodes/HBox.js';
import Node from '../../../scenery/js/nodes/Node.js';
import Rectangle from '../../../scenery/js/nodes/Rectangle.js';
import Text from '../../../scenery/js/nodes/Text.js';
import VBox from '../../../scenery/js/nodes/VBox.js';
import Color from '../../../scenery/js/util/Color.js';
import RectangularPushButton from '../../../sun/js/buttons/RectangularPushButton.js';
import HSlider from '../../../sun/js/HSlider.js';
import Easing from '../Easing.js';
import TransitionNode from '../TransitionNode.js';
import twixt from '../twixt.js';
import EasingComboBox from './EasingComboBox.js';

class TransitionsScreenView extends ScreenView {
  constructor() {

    super();

    const bounds = new Bounds2( 0, 0, 320, 240 );

    const easingProperty = new Property( Easing.QUADRATIC_IN_OUT );
    const durationProperty = new Property( 0.3 );

    // @private {TransitionNode}
    this.transitionNode = new TransitionNode( new Property( bounds ), {
      content: createSomething( bounds )
    } );

    const listParent = new Node();

    const comboBox = new EasingComboBox( easingProperty, listParent, {
      centerX: this.layoutBounds.centerX,
      bottom: this.transitionNode.top - 10
    } );

    const durationSlider = createSliderGroup( durationProperty, new Range( 0.1, 2 ), 'Duration', [ 0.1, 0.5, 1, 2 ], {
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
    ].map( name => {
      return new RectangularPushButton( {
        content: new Text( name, { font: new PhetFont( 20 ) } ),
        listener: () => {
          this.transitionNode[ name ]( createSomething( bounds ), {
            duration: durationProperty.value,
            targetOptions: {
              easing: easingProperty.value
            }
          } );
        }
      } );
    } );

    this.addChild( new VBox( {
      children: [ durationSlider, comboBox, this.transitionNode ].concat( _.chunk( buttons, 4 ).map( children => {
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
      listener: () => {
        durationProperty.reset();
        easingProperty.reset();
      },
      right: this.layoutBounds.maxX - 10,
      bottom: this.layoutBounds.maxY - 10
    } );
    this.addChild( resetAllButton );

    this.addChild( listParent );
  }

  // @public
  step( dt ) {
    this.transitionNode.step( dt );
  }
}

function createSomething( bounds ) {

  function randomColor() {
    return new Color( phet.joist.random.nextInt( 256 ), phet.joist.random.nextInt( 256 ), phet.joist.random.nextInt( 256 ) );
  }

  function randomString() {
    return _.range( 0, 7 )
      .map( () => String.fromCharCode( phet.joist.random.nextIntBetween( 65, 122 ) ) )
      .join( '' );
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

function createSliderGroup( property, range, label, majorTicks, options ) {
  const labelNode = new Text( label, { font: new PhetFont( 20 ) } );
  const slider = new HSlider( property, range, {
    trackSize: new Dimension2( 300, 5 )
  } );
  majorTicks.forEach(
    tick => slider.addMajorTick( tick, new Text( tick, { font: new PhetFont( 20 ) } ) )
  );
  return new VBox( merge( {
    children: [ labelNode, slider ],
    spacing: 10
  }, options ) );
}

twixt.register( 'TransitionsScreenView', TransitionsScreenView );
export default TransitionsScreenView;