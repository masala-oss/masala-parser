/*
 * Parsec
 * https://github.com/d-plaindoux/parsec
 *
 * Copyright (c) 2016 Didier Plaindoux
 * Licensed under the LGPL2 license.
 */

import Parser, {eos} from './parser.js';
import response from './response.js';
import {NEUTRAL, Tuple} from "../data/tuple.js";

// (Stream 'c -> number -> Response 'a 'c) -> Parser 'a 'c
function parse(p) {
    return new Parser(p);
}

// (('b -> Parser 'a 'c) * 'b)-> Parser 'a 'c
function lazy(p, parameters, self = {}) {

    if (parameters && !Array.isArray(parameters)) {
        throw 'Lazy(parser, [params]) function expect parser parameters to be packed into an array';
    }

    // equivalent of p(...parameters), but would fail if parameters are undefined
    // In some case, p is a function that require a 'this' bound to the function
    // https://github.com/d-plaindoux/masala-parser/issues/9
    return new Parser((input, index = 0) =>
        p.apply(self, parameters).parse(input, index)
    );
}

// 'a -> Parser 'a 'c
function returns(v) {
    return new Parser((input, index = 0) =>
        response.accept(v, input, index, false)
    );
}

// unit -> Parser 'a 'c
function error() {
    return new Parser((input, index = 0) => {
            // TODO: add an optional logger parameter, and log
            return response.reject(input, index, false)
        }
    );
}


// ('a -> boolean) -> Parser a 'c
// index is forwarded at index +1
function satisfy(predicate) {
    return new Parser((input, index = 0) =>
        input
            .get(index)
            .filter(predicate)
            .map(value => response.accept(value, input, index + 1, true))
            .lazyRecoverWith(() =>
                response.reject(input, index, false)
            )
    );
}

// Parser 'a 'c -> Parser 'a 'c
function doTry(p) {
    return new Parser((input, index = 0) =>
        p
            .parse(input, index)
            .fold(
                accept => accept,
                // Compared to satisfy, we come back to initial offset
                reject =>  response.reject(input, reject.offset , false)

            )
    );
}

function layer(p) {
    return new Parser((input, index = 0) =>
        p
            .parse(input, index)
            .fold(
                accept => {
                    // TODO logger

                    return response.accept(new Tuple().append(accept.value), input, index, false)
                },
                        // Compared to satisfy, we come back to initial offset
                reject =>  reject
            )
    );
}


// unit -> Parser 'a 'c
function any() {
    return satisfy(() => true);
}

// unit -> Parser 'a 'c
function nop() {
    return new Parser((input, index = 0) =>
        response.accept(NEUTRAL, input, index, true)
    );
}

// Parser 'a ? -> Parser 'a 'a
function not(p) {
    return doTry(p).then(error()).or(any());
}

// int -> Parser (List 'a') a'
function subStream(length) {
    return any().occurrence(length);
}


function startWith(value) {
    return nop().returns(value);
}

function moveUntil(stop) {
    if (typeof stop === 'string') {
        return searchStringStart(stop);
    }

    if (Array.isArray(stop)) {
        return searchArrayStringStart(stop);
    }

    // TODO: change undefined by a Symbol
    // TODO: for better performance, maybe check in the map if the symbol is included, and remove the or
    const foundEos = Symbol('found-eos');
    return doTry(not(stop).rep().then(eos()).returns(foundEos))
        .or(not(stop).rep().map(chars => chars.join('')))
        .filter(v => v !== foundEos);
}

function dropTo(stop) {
    if (typeof stop === 'string') {
        return moveUntil(stop).then(string(stop)).drop();
    } else {
        return moveUntil(stop).then(stop).drop();
    }
}

export default {
    parse,
    nop,
    try: doTry,
    any,
    subStream,
    not: not,
    layer,
    lazy,
    returns,
    error,
    eos,
    satisfy,
    startWith,
    moveUntil,
    dropTo,
};

/**Optimization functions */

/**
 * Will work only if input.source is a String
 * @param string
 * @returns {Parser}
 */
function searchStringStart(string) {
    return new Parser((input, index = 0) => {
        if (typeof input.source !== 'string') {
            throw 'Input source must be a String';
        }

        const sourceIndex = input.source.indexOf(string, index);
        if (sourceIndex > 0) {
            return response.accept(
                input.source.substring(index, sourceIndex),
                input,
                sourceIndex,
                true
            );
        } else {
            return response.reject(input, index, false);
        }
    });
}

/**
 * Will work only if input.source is a String
 */
function searchArrayStringStart(array) {
    return new Parser((input, index = 0) => {
        if (typeof input.source !== 'string') {
            throw 'Input source must be a String';
        }

        let sourceIndex = -1;

        let i = 0;
        while (sourceIndex < 0 && i < array.length) {
            const needle = array[i];
            sourceIndex = input.source.indexOf(needle, index);
            i++;
            if (sourceIndex > 0) {
                break;
            }
        }

        //const sourceIndex = input.source.indexOf(string, index)

        if (sourceIndex > 0) {
            return response.accept(
                input.source.substring(index, sourceIndex),
                input,
                sourceIndex,
                true
            );
        } else {
            return response.reject(input, index, false);
        }
    });
}

// string -> Parser string char
// index is forwarded at the length of the string
export function string(s) {
    return new Parser((input, index = 0) => {
        if (input.subStreamAt(s.split(''), index)) {
            return response.accept(s, input, index + s.length, true);
        } else {
            return response.reject(input, index, false);
        }
    });
}
