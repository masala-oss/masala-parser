/*
 * Parsec
 * https://github.com/d-plaindoux/parsec
 *
 * Copyright (c) 2016 Didier Plaindoux
 * Licensed under the LGPL2 license.
 */

import parser from './parser.js';
import response from './response.js';
import flow from './flow-bundle.js';
import chars from './chars-bundle.js';
import numbers from './numbers-bundle.js';

export const C = chars;
export const F = flow;
export const N = numbers;

export default {parser, response};
