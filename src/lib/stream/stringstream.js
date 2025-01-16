/*
 * Parsec
 * https://github.com/d-plaindoux/parsec
 *
 * Copyright (c) 2016 Didier Plaindoux
 * Licensed under the LGPL2 license.
 */
import Stream from './stream.js';

/**
 * String stream class
 */
class StringStream extends Stream {
    constructor(source) {
        super();
        this.source = source;
    }

    // StringStream 'a => unit -> boolean
    endOfStream(index) {
        return this.source.length <= index;
    }

    // StringStream 'a => number -> 'a <+> error
    unsafeGet(index) {
        return this.source.charAt(index);
    }
}

function factory(source) {
    return new StringStream(source);
}

export default factory;
