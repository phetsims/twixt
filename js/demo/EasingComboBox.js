// Copyright 2019, University of Colorado Boulder

/**
 * ComboBox for selecting one of twixt's Easing functions.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */
define( require => {
  'use strict';

  // modules
  const ComboBox = require( 'SUN/ComboBox' );
  const Easing = require( 'TWIXT/Easing' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  const Text = require( 'SCENERY/nodes/Text' );
  const twixt = require( 'TWIXT/twixt' );

  class EasingComboBox extends ComboBox {

    /**
     * @param {Property.<function>} easingProperty - see Easing for values
     * @param {Node} listParent - node that will be used as the list's parent
     * @param {Object} [options]
     */
    constructor( easingProperty, listParent, options ) {

      var comboTextOptions = { font: new PhetFont( 16 ) };
      const items = [
        ComboBox.createItem( new Text( 'Linear', comboTextOptions ), Easing.LINEAR ),
        ComboBox.createItem( new Text( 'Quadratic in-out', comboTextOptions ), Easing.QUADRATIC_IN_OUT ),
        ComboBox.createItem( new Text( 'Quadratic in', comboTextOptions ), Easing.QUADRATIC_IN ),
        ComboBox.createItem( new Text( 'Quadratic out', comboTextOptions ), Easing.QUADRATIC_OUT ),
        ComboBox.createItem( new Text( 'Cubic in-out', comboTextOptions ), Easing.CUBIC_IN_OUT ),
        ComboBox.createItem( new Text( 'Cubic in', comboTextOptions ), Easing.CUBIC_IN ),
        ComboBox.createItem( new Text( 'Cubic out', comboTextOptions ), Easing.CUBIC_OUT ),
        ComboBox.createItem( new Text( 'Quartic in-out', comboTextOptions ), Easing.QUARTIC_IN_OUT ),
        ComboBox.createItem( new Text( 'Quartic in', comboTextOptions ), Easing.QUARTIC_IN ),
        ComboBox.createItem( new Text( 'Quartic out', comboTextOptions ), Easing.QUARTIC_OUT ),
        ComboBox.createItem( new Text( 'Quintic in-out', comboTextOptions ), Easing.QUINTIC_IN_OUT ),
        ComboBox.createItem( new Text( 'Quintic in', comboTextOptions ), Easing.QUINTIC_IN ),
        ComboBox.createItem( new Text( 'Quintic out', comboTextOptions ), Easing.QUINTIC_OUT )
      ];

      super( items, easingProperty, listParent, options );
    }
  }

  return twixt.register( 'EasingComboBox', EasingComboBox );
} );