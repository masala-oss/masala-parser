/*
 * Parsec
 * https://github.com/d-plaindoux/parsec
 *
 * Copyright (c) 2016 Didier Plaindoux
 * Licensed under the LGPL2 license.
 */

import C from './chars-bundle.js';
import F from './flow-bundle.js';

// unit -> Parser number char
function number() {
    // [-+]?\d+([.]\d+)?([eE][+-]?\d+)?
    var join = r => r.join(''),
        joinOrEmpty = r => r.map(join).orElse(''),
        digits = digit().rep().map(join),
        integer = C.charIn('+-')
            .opt()
            .then(digits)
            .array()
            .map(r => r[0].orElse('') + r[1]),
        float = integer
            .then(C.char('.').then(digits).opt().map(joinOrEmpty))
            .then(C.charIn('eE').then(integer).opt().map(joinOrEmpty))
            .array()
            .map(r => r[0] + r[1] + r[2]);

    return float.map(r => parseFloat(r, 10));
}

// unit -> Parser char int
function digit() {
    return F.satisfy(v => '0' <= v && v <= '9').map(c=>parseInt(c));
}


function digits() {
    return digit().rep().map(v => parseInt(v.join('')));
}


function integer() {
    // [-+]?\d+
    var join = r => r.join(''),
        digits = digit().rep().map(join),
        integer = C.charIn('+-')
            .opt()
            .then(digits)
            .array()
            .map(r => r[0].orElse('') + r[1]);

    return integer.map(i => parseInt(i, 10));
}

export default {
    number,
    digit,
    digits,
    integer
};
