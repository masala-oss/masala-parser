// Plain old ES
import {Streams, F, C, N} from '@robusta/trash'
import {assertEquals, assertArrayEquals, assertTrue} from '../../assert';

// The goal is check that we have Hello 'something', then to grab that something

const helloParser = C.string("Hello")
                    .then(C.char(' ').rep())
                    .then(C.char("'")).drop()
                    .then(C.letter.rep()) // keeping repeated ascii letters
                    .then(C.char("'").drop());    // keeping previous letters

const parsing = helloParser.parse(Streams.ofString("Hello 'World'"));
// C.letter.rep() will giv a array of letters

let x = parsing.value.array();

assertArrayEquals(['W','o','r','l','d'], parsing.value.array(), "Hello World joined");


// Note that helloParser will not reach the end of the stream; it will stop at the space after People
const peopleParsing = helloParser.parse(Streams.ofString("Hello 'People' in 2017"));

assertEquals("People", peopleParsing.value.join(''), "Hello People joined");
assertTrue(peopleParsing.offset < "Hello People in 2017".length, "Bad Offset for Hello People");

