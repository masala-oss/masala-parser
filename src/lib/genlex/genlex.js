import response from "../parsec/response.js";
import {F, C, N} from "../parsec/index.js";
import unit from "../data/unit.js";
import option from "../data/option.js";


export class TokenDefinition {
    // value will be determined at runtime while parsing
    constructor(parser, name, precedence) {
        this.parser = parser;
        this.name = name;
        this.precedence = precedence;
    }
}

// a Token object is instantiated at runtime, with a value given by the parsed text
export class Token {
    constructor(name, value) {
        this.name = name;
        this.value = value;
    }

    accept(name) {
        // TODO logger console.log('accepting', name, this.name===name, this.value);
        return this.name === name ? option.some(this.value) : option.none();
    }
}

export class GenLex {

    constructor() {

        this.spaces = defaultSpaces();
        // definitions keep trace of all: parser, precedence and name
        this.definitions = [];
        // get a token, but not directly its precedence
        this.tokensMap = {}
    }



    tokenize(parser, name, precedence = 1000) {

        if (typeof parser === 'string') {
            if (name === undefined) {
                name = parser;
            }
            return this.tokenize(C.string(parser), name, precedence);
        }


        const definition = new TokenDefinition(parser, name, precedence)
        this.definitions.push(definition);

        // probably a bad name
        const token = literal(token => token.accept(name), name);
        this.tokensMap[name] = token;
        return token;
    }

    keywords(keys, precedence = 1000) {
        return keys.reduce((acc, key) =>
                acc.concat(this.tokenize(key, key, precedence))
            , []);
    }


    setSeparators(spacesCharacters) {
        if (typeof spacesCharacters !== 'string') {
            throw "setSeparators needs a string as separators, such as ' \r\n\f\t' ;" +
            " use  setSeparatorsParser to declare a parser";
        }
        this.spaces = C.charIn(spacesCharacters).map(() => unit);
    }

    /**
     * Set separator Parser. It's up to the parser to accept or not
     * optional repetition
     * @param spacesParser
     */
    setSeparatorsParser(spacesParser) {
        this.spaces = spacesParser.map(() => unit);
    }

    updatePrecedence(tokenName, precedence) {
        this.definitions.find(def => def.name === tokenName)
            .precedence = precedence;
    }

    buildTokenizer() {
        const token = this.findTokenByPrecedence();
        return this.spaces.optrep().drop()
            .then(token)
            .then(this.spaces.optrep().drop())
            .single();
    }

    use(grammar) {
        return this.buildTokenizer().chain(grammar);
    }

    findTokenByPrecedence() {

        const sortedDefinitions = this.definitions
            .sort((d1, d2) => d2.precedence - d1.precedence);

        return sortedDefinitions.reduce(
            (combinator, definition) =>
                F.try(getTokenParser(definition))
                //    .or (F.error('no match for '+definition.name))
                    .or(combinator),
            F.error()
        );

    }

    remove(tokenName) {
        // find definitions
        this.definitions = this.definitions
            .filter(d => d.name !== tokenName);
        delete this.tokensMap[tokenName];
    }

    // type: { [key: string]: Parser }
    tokens() {
        return this.tokensMap;
    }

    get(tokenName) {
        return this.tokensMap[tokenName];
    }


}


function getTokenParser(def) {
    return def.parser.map(value => new Token(def.name, value));
}


// name is for easier debugging
// eslint-disable-next-line
function literal(tokenize, name) {

    return F.parse((input, index) => {
            // TODO logger console.log('testing ', {name, input:input.get(index), index});
            // console.log('trying ', {index, name});

            return input
                .get(index)
                // FIXME= value is the token, token is the value
                .map(value => {

                    /* TODO: keep for logger
                    let token = value;

                    try {
                        console.log('in map', {value, name, index});
                        console.log('tokenizing', tokenize(token));
                    } catch (e) {
                        console.error('failed', e)
                    }*/

                    return tokenize(value)
                            .map(token => {
                                    // TODO logger console.log('accept with ', name, index);
                                    //console.log('accept:', token,index, input.location(index));
                                    return response.accept(token, input, index + 1, true)
                                }
                            )
                            .orLazyElse(() => {
                                    // TODO logger console.log('lazyElse failed with ', name, index);
                                    // console.log('reject:',index, input.source.offsets[index],input,'>>>', value,
                                    //  input.location(index));
                                    return response.reject(input, index, false)
                                }
                            )
                    }
                )
                .lazyRecoverWith(() => {
                        // TODO logger console.log('failed with ', name, index);
                        //console.log('lazyRecover with offset:', input.location(index));
                        return response.reject(input, index, false)
                    }
                )
        }
    );
}


function defaultSpaces() {
    return C.charIn(' \r\n\f\t').map(() => unit);
}


export function getMathGenLex() {
    const basicGenlex = new GenLex();

    // We try first to have digits
    basicGenlex.tokenize(N.number(), 'number', 1100);
    basicGenlex.tokenize(C.char('+'), 'plus', 1000);
    basicGenlex.tokenize(C.char('-'), 'minus', 1000);
    basicGenlex.tokenize(C.char('*'), 'mult', 800);
    basicGenlex.tokenize(C.char('/'), 'div', 800);
    basicGenlex.tokenize(C.char('('), 'open', 1000);
    basicGenlex.tokenize(C.char(')'), 'close', 1000);

    return basicGenlex;
}






