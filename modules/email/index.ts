import {Streams, C, N} from '@masala/parser'
// accept simon@gmail.com, but also  simon"le gr@nd"@gmail.com
function inQuote(){
    return C.char('"')
        .then(C.notChar('"').rep())
        .then(C.char('"'))
}

export function email() {
    var illegalCharSet1 = ' @\u00A0\n\t';
    var illegalCharSet2 = ' @\u00A0\n\t.';
    return inQuote().debug("inQuote")
        .or(C.charNotIn(illegalCharSet1).debug("normalChar")).rep() // this mean:   repeat(inQuote or anyCharacter)
        .then(C.char('@'))
        .then(C.charNotIn(illegalCharSet2).rep())
        .then(C.char('.'))
        .then(C.charNotIn(illegalCharSet2).rep())
        .array().map(function (characters) { return ({ email: characters.join('') }); });
}
