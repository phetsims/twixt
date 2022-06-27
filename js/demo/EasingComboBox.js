// Copyright 2019-2022, University of Colorado Boulder

/**
 * ComboBox for selecting one of twixt's Easing functions.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */

import PhetFont from '../../../scenery-phet/js/PhetFont.js';
import { Text } from '../../../scenery/js/imports.js';
import ComboBox from '../../../sun/js/ComboBox.js';
import Easing from '../Easing.js';
import twixt from '../twixt.js';

class EasingComboBox extends ComboBox {

  /**
   * @param {Property.<function>} easingProperty - see Easing for values
   * @param {Node} listParent - node that will be used as the list's parent
   * @param {Object} [options]
   */
  constructor( easingProperty, listParent, options ) {

    const comboTextOptions = { font: new PhetFont( 16 ) };
    const items = [
      { value: Easing.LINEAR, node: new Text( 'Linear', comboTextOptions ) },
      { value: Easing.QUADRATIC_IN_OUT, node: new Text( 'Quadratic in-out', comboTextOptions ) },
      { value: Easing.QUADRATIC_IN, node: new Text( 'Quadratic in', comboTextOptions ) },
      { value: Easing.QUADRATIC_OUT, node: new Text( 'Quadratic out', comboTextOptions ) },
      { value: Easing.CUBIC_IN_OUT, node: new Text( 'Cubic in-out', comboTextOptions ) },
      { value: Easing.CUBIC_IN, node: new Text( 'Cubic in', comboTextOptions ) },
      { value: Easing.CUBIC_OUT, node: new Text( 'Cubic out', comboTextOptions ) },
      { value: Easing.QUARTIC_IN_OUT, node: new Text( 'Quartic in-out', comboTextOptions ) },
      { value: Easing.QUARTIC_IN, node: new Text( 'Quartic in', comboTextOptions ) },
      { value: Easing.QUARTIC_OUT, node: new Text( 'Quartic out', comboTextOptions ) },
      { value: Easing.QUINTIC_IN_OUT, node: new Text( 'Quintic in-out', comboTextOptions ) },
      { value: Easing.QUINTIC_IN, node: new Text( 'Quintic in', comboTextOptions ) },
      { value: Easing.QUINTIC_OUT, node: new Text( 'Quintic out', comboTextOptions ) }
    ];

    super( easingProperty, items, listParent, options );
  }
}

twixt.register( 'EasingComboBox', EasingComboBox );
export default EasingComboBox;