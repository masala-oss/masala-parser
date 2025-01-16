/*
 * Parsec
 * https://github.com/d-plaindoux/parsec
 *
 * Copyright (c) 2016 Didier Plaindoux
 * Licensed under the LGPL2 license.
 */

import data from './data/index.js';
import {GenLex,getMathGenLex} from './genlex/genlex.js';
import parsec from './parsec/index.js';
import Parser from './parsec/parser.js';
import {F, C, N} from './parsec/index.js';
import standard from './standard/index.js';
import Streams from './stream/index.js';

import {accept, reject} from "./parsec/response.js";
import {Tuple, isTuple, NEUTRAL, tuple} from "./data/tuple.js";


const JSON = standard.jsonParser;
const MD = standard.markdownBundle;


export {
    data,
    accept,reject,
    GenLex,
    getMathGenLex,
    parsec,
    standard,
    Streams,
    Parser,
    F,
    C,
    N,
    JSON,
    MD,
    tuple, Tuple, isTuple, NEUTRAL
};
