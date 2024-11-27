// Copyright 2020-2024, University of Colorado Boulder

/* eslint-disable */
/* @formatter:off */

/**
 * Auto-generated from modulify, DO NOT manually modify.
 */

import getStringModule from '../../chipper/js/browser/getStringModule.js';
import type LocalizedStringProperty from '../../chipper/js/browser/LocalizedStringProperty.js';
import twixt from './twixt.js';

type StringsType = {
  'twixt': {
    'titleStringProperty': LocalizedStringProperty;
  };
  'screen': {
    'animationStringProperty': LocalizedStringProperty;
    'dampedMotionStringProperty': LocalizedStringProperty;
    'transitionsStringProperty': LocalizedStringProperty;
  }
};

const TwixtStrings = getStringModule( 'TWIXT' ) as StringsType;

twixt.register( 'TwixtStrings', TwixtStrings );

export default TwixtStrings;
