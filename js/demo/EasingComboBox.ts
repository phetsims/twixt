// Copyright 2019-2025, University of Colorado Boulder

/**
 * ComboBox for selecting one of twixt's Easing functions.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import Property from '../../../axon/js/Property.js';
import { EmptySelfOptions } from '../../../phet-core/js/optionize.js';
import PhetFont from '../../../scenery-phet/js/PhetFont.js';
import Node, { NodeTranslationOptions } from '../../../scenery/js/nodes/Node.js';
import Text from '../../../scenery/js/nodes/Text.js';
import ComboBox, { ComboBoxItem } from '../../../sun/js/ComboBox.js';
import Easing from '../Easing.js';
import twixt from '../twixt.js';

type SelfOptions = EmptySelfOptions;
type EasingComboBoxOptions = SelfOptions & NodeTranslationOptions;

export default class EasingComboBox extends ComboBox<Easing> {

  /**
   * @param easingProperty - see Easing for values
   * @param listParent - Node that will be used as the list's parent
   * @param [providedOptions]
   */
  public constructor( easingProperty: Property<Easing>, listParent: Node, providedOptions: EasingComboBoxOptions ) {

    const comboTextOptions = { font: new PhetFont( 16 ) };

    const items: ComboBoxItem<Easing>[] = [
      { value: Easing.LINEAR, createNode: () => new Text( 'Linear', comboTextOptions ) },
      { value: Easing.QUADRATIC_IN_OUT, createNode: () => new Text( 'Quadratic in-out', comboTextOptions ) },
      { value: Easing.QUADRATIC_IN, createNode: () => new Text( 'Quadratic in', comboTextOptions ) },
      { value: Easing.QUADRATIC_OUT, createNode: () => new Text( 'Quadratic out', comboTextOptions ) },
      { value: Easing.CUBIC_IN_OUT, createNode: () => new Text( 'Cubic in-out', comboTextOptions ) },
      { value: Easing.CUBIC_IN, createNode: () => new Text( 'Cubic in', comboTextOptions ) },
      { value: Easing.CUBIC_OUT, createNode: () => new Text( 'Cubic out', comboTextOptions ) },
      { value: Easing.QUARTIC_IN_OUT, createNode: () => new Text( 'Quartic in-out', comboTextOptions ) },
      { value: Easing.QUARTIC_IN, createNode: () => new Text( 'Quartic in', comboTextOptions ) },
      { value: Easing.QUARTIC_OUT, createNode: () => new Text( 'Quartic out', comboTextOptions ) },
      { value: Easing.QUINTIC_IN_OUT, createNode: () => new Text( 'Quintic in-out', comboTextOptions ) },
      { value: Easing.QUINTIC_IN, createNode: () => new Text( 'Quintic in', comboTextOptions ) },
      { value: Easing.QUINTIC_OUT, createNode: () => new Text( 'Quintic out', comboTextOptions ) }
    ];

    super( easingProperty, items, listParent, providedOptions );
  }
}

twixt.register( 'EasingComboBox', EasingComboBox );