// Copyright 2020-2025, University of Colorado Boulder

/**
 * Demos how TransitionNode works
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Property from '../../../axon/js/Property.js';
import Bounds2 from '../../../dot/js/Bounds2.js';
import Dimension2 from '../../../dot/js/Dimension2.js';
import dotRandom from '../../../dot/js/dotRandom.js';
import Range from '../../../dot/js/Range.js';
import ScreenView from '../../../joist/js/ScreenView.js';
import merge from '../../../phet-core/js/merge.js';
import ResetAllButton from '../../../scenery-phet/js/buttons/ResetAllButton.js';
import PhetFont from '../../../scenery-phet/js/PhetFont.js';
import HBox from '../../../scenery/js/layout/nodes/HBox.js';
import VBox from '../../../scenery/js/layout/nodes/VBox.js';
import Node, { NodeTranslationOptions } from '../../../scenery/js/nodes/Node.js';
import Rectangle from '../../../scenery/js/nodes/Rectangle.js';
import Text from '../../../scenery/js/nodes/Text.js';
import Color from '../../../scenery/js/util/Color.js';
import RectangularPushButton from '../../../sun/js/buttons/RectangularPushButton.js';
import HSlider from '../../../sun/js/HSlider.js';
import Tandem from '../../../tandem/js/Tandem.js';
import Easing from '../Easing.js';
import TransitionNode from '../TransitionNode.js';
import twixt from '../twixt.js';
import EasingComboBox from './EasingComboBox.js';

export default class TransitionsScreenView extends ScreenView {

  private readonly transitionNode: TransitionNode;

  public constructor() {

    super( {
      tandem: Tandem.OPT_OUT
    } );

    const bounds = new Bounds2( 0, 0, 320, 240 );

    const easingProperty = new Property( Easing.QUADRATIC_IN_OUT );
    const durationProperty = new Property( 0.3 );

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

    // Function of TransitionNode that we want to demonstrate
    const transitionFunctions = [
      this.transitionNode.slideLeftTo.bind( this.transitionNode ),
      this.transitionNode.slideRightTo.bind( this.transitionNode ),
      this.transitionNode.slideUpTo.bind( this.transitionNode ),
      this.transitionNode.slideDownTo.bind( this.transitionNode ),
      this.transitionNode.wipeLeftTo.bind( this.transitionNode ),
      this.transitionNode.wipeRightTo.bind( this.transitionNode ),
      this.transitionNode.wipeUpTo.bind( this.transitionNode ),
      this.transitionNode.wipeDownTo.bind( this.transitionNode ),
      this.transitionNode.dissolveTo.bind( this.transitionNode )
    ];

    // Create a button to demonstrate each transition function.
    const transitionButtons = transitionFunctions.map( transitionFunction => {
      return new RectangularPushButton( {
        content: new Text( transitionFunction.name, { font: new PhetFont( 20 ) } ),
        listener: () => transitionFunction( createSomething( bounds ), {
          duration: durationProperty.value,
          targetOptions: {
            easing: easingProperty.value
          }
        } )
      } );
    } );

    // Create rows of buttons.
    const transitionButtonRows = _.chunk( transitionButtons, 4 ).map( children => {
      return new HBox( {
        children: children,
        spacing: 10
      } );
    } );

    this.addChild( new VBox( {
      children: [ durationSlider, comboBox, this.transitionNode, ...transitionButtonRows ],
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

  public override step( dt: number ): void {
    this.transitionNode.step( dt );
  }
}

function createSomething( bounds: Bounds2 ): Node {

  function randomColor(): Color {
    return new Color( dotRandom.nextInt( 256 ), dotRandom.nextInt( 256 ), dotRandom.nextInt( 256 ) );
  }

  function randomString(): string {
    return _.range( 0, 7 )
      .map( () => String.fromCharCode( dotRandom.nextIntBetween( 65, 122 ) ) )
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

function createSliderGroup( property: Property<number>, range: Range, label: string, majorTicks: number[], options?: NodeTranslationOptions ): Node {
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