// Copyright 2016, University of Colorado Boulder

/**
 * TODO: doc
 *
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var twixt = require( 'TWIXT/twixt' );

  /**
   * @constructor
   *
   * TODO: support Animation( {Property.<X>} )
   * TODO: support Animation( object: {Object}, propName: {string} )
   * TODO: support Animation( [ animSpec, animSpec ] ) --- only if this makes sense?
   */
  function Animation() {

  }

  twixt.register( 'Animation', Animation );

  return inherit( Object, Animation, {

  } );
} );
