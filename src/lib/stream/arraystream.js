/*
 * Parsec
 * https://github.com/d-plaindoux/parsec
 *
 * Copyright (c) 2016 Didier Plaindoux
 * Licensed under the LGPL2 license.
 */
import Stream from './stream.js';

/**
 * Array stream class
 */
class ArrayStream extends Stream {
    constructor(source) {
        super();
        this.source = source;
    }

    // ArrayStream 'a => unit -> boolean
    endOfStream(index) {
        return index >= this.source.length;
    }

    // ArrayStream 'a => number -> 'a <+> error
    unsafeGet(index) {
        return this.source[index];
    }
}

function factory(source) {
    return new ArrayStream(source);
}

export default factory;
