// Copyright 2020-2023, University of Colorado Boulder

/**
 * Auto-generated from modulify, DO NOT manually modify.
 */
/* eslint-disable */
import getStringModule from '../../chipper/js/getStringModule.js';
import type LocalizedStringProperty from '../../chipper/js/LocalizedStringProperty.js';
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
