/*
 * Parsec
 * https://github.com/d-plaindoux/parsec
 *
 * Copyright (c) 2016 Didier Plaindoux
 * Licensed under the LGPL2 license.
 */

import {GenLex} from '../../genlex/genlex.js';

import {F,C,N} from '../../parsec/index.js';


//
// Facilities
//

let genlex = new GenLex();
genlex.keywords(['null', 'false', 'true', '{', '}', '[', ']', ':', ',']);
let number = genlex.tokenize(N.number(), 'number', 1100);
let string = genlex.tokenize(C.stringLiteral(), 'string', 800);

function tkKey(s) {
    return genlex.get(s);
}

// unit -> Parser ? Token
function arrayOrNothing() {
    // FIXME: ES2015 code not great
    var value = [],
        addValue = e => {
            value = value.concat(e);
        },
        getValue = () => value,
        item = F.lazy(expr).map(addValue);
    return item.then(tkKey(',').thenRight(item).optrep().array()).opt().map(getValue);
}

// unit -> Parser ? Token
function objectOrNothing() {
    // FIXME: ES2015 code not great
    var value = {},
        addValue = e => {
            value[e[0]] = e[1];
        },
        getValue = () => value,
        attribute = string
            .thenLeft(tkKey(':'))
            .then(F.lazy(expr))
            .array()
            .map(addValue);
    return attribute
        .thenLeft(tkKey(',').then(attribute).optrep())
        .array()
        .opt()
        .map(getValue);
}

// unit -> Parser ? Token
function expr() {
    return number
        .or(string)
        .or(tkKey('null').returns(null))
        .or(tkKey('true').returns(true))
        .or(tkKey('false').returns(false))
        .or(tkKey('[').thenRight(F.lazy(arrayOrNothing)).thenLeft(tkKey(']')).single())
        .or(tkKey('{').thenRight(F.lazy(objectOrNothing)).thenLeft(tkKey('}')).single());
}

//const parse =
export default {
    parse: function (source) {

        const parser = genlex.use(expr().thenLeft(F.eos()).single());

        return parser.parse(source, 0);
    },
};
