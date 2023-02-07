import debug from "debug";
export default class PhpVarParser {
    /**
     * Parse the code content searching for the provided variables
     * Variables shold be in the form:
     * {
     *   var1: 'type',
     *   var2: 'type',
     * }
     * where type is one of:  'number', 'string', 'boolean', 'array', 'definedConstant', 'constant', 'variable'
     * Note that constant mean that at the variable searched is assigned a constant (Eg. $var = CONSTANT)
     * To search for a constant use 'assignedConstant' (Eg. define('CONSTANT', 'value'))
     * If no type is provied the parser will try to guess the type, but is slow and dangerous
     *
     * If provided the suffix will be added to the variable name, remember to double escape special characters (Eg. '\\$')
     * @date 2/6/2023 - 2:24:36 AM
     *
     * @public
     * @static
     * @param {string} code Php code to parse
     * @param {*} vars Variables to search for
     * @param {string} [suffix='\$'] Suffix to add to the variable name
     * @param {boolean} [resolve=true] If true the parser will try to resolve the variable value (Eg. {$x=1, $y=$x;} will return {$x:1, $y:1})
     * @returns {{[key:string]:any}}
     */
    static parse(code, vars, suffix = '\\$', resolve = false) {
        var output = {};
        for (var varr in vars) {
            this.debug('Parsing variable: ' + varr + ' of type: ' + vars[varr]);
            var o = null;
            switch (vars[varr]) {
                case 'number':
                    o = this.parseInt(code, suffix + varr);
                    break;
                case 'string':
                    o = this.parseString(code, suffix + varr);
                    break;
                case 'bool':
                case 'boolean':
                    o = this.parseBool(code, suffix + varr);
                    break;
                case 'array':
                    o = this.parseArray(code, suffix + varr);
                    break;
                case 'array_assoc':
                    o = this.parseArrayAssoc(code, suffix + varr);
                    break;
                case 'const':
                case 'constant':
                    o = this.parseConstant(code, suffix + varr);
                    break;
                case 'var':
                case 'variable':
                    o = this.parseVariable(code, suffix + varr);
                    break;
                case 'definedConstant':
                    o = this.parseDefinedConstant(code, suffix + varr);
                    break;
                default:
                    o = this.tryToGuess(code, suffix + varr);
                    break;
            }
            output[varr] = o;
        }
        if (resolve) {
            for (var varr in output) {
                var name = output[varr];
                if (name && (output[name] || output[name.substring(1)])) {
                    if (name.startsWith('$'))
                        name = name.substring(1);
                    output[varr] = output[name];
                }
            }
        }
        return output;
    }
    /**
     * Return the variable value if found
     * Try to guess the type of the variable by searching in order:
     * boolean, string, number, array, variable, constant
     * the first value found is returned
     * @date 2/6/2023 - 2:30:58 AM
     *
     * @public
     * @static
     * @param {string} code Php code to parse
     * @param {string} varr Variable to search for
     * @returns {string}
     */
    static tryToGuess(code, varr) {
        this.debug('Trying to guess the type of variable: ' + varr);
        var o = this.parseBool(code, varr);
        if (o)
            return o;
        o = this.parseString(code, varr);
        if (o)
            return o;
        o = this.parseInt(code, varr);
        if (o)
            return o;
        o = this.parseArray(code, varr);
        if (o)
            return o;
        o = this.parseArrayAssoc(code, varr);
        if (o)
            return o;
        o = this.parseVariable(code, varr);
        if (o)
            return o;
        o = this.parseConstant(code, varr);
        if (o)
            return o;
        o = this.parseDefinedConstant(code, varr);
        if (o)
            return o;
        return undefined;
    }
    /**
     * Return the numeric variable value if found
     * @date 2/6/2023 - 2:35:34 AM
     *
     * @public
     * @static
     * @param {string} code Php code to parse
     * @param {string} varr Variable to search for
     * @returns {(string|undefined)}
     */
    static parseInt(code, varr) {
        var _a;
        var regex = new RegExp(`${varr}[\\n\\s]*?=[\\n\\s]*(\\d+\\.*\\d*)[\\n\\s]*?;`, 'g');
        this.debug('Parsing int: ' + varr + ' with regex: ' + regex);
        return (_a = [...code.matchAll(regex)][0]) === null || _a === void 0 ? void 0 : _a[1].trim();
    }
    /**
     * Return the boolean variable value if found
     * @date 2/6/2023 - 2:35:58 AM
     *
     * @public
     * @static
     * @param {string} code Php code to parse
     * @param {string} varr Variable to search for
     * @returns {(string|undefined)}
     */
    static parseBool(code, varr) {
        var _a;
        var regex = new RegExp(`${varr}[\\n\\s]*?=[\\n\\s]*(true|false)[\\n\\s]*?;`, 'g');
        this.debug('Parsing bool: ' + varr + ' with regex: ' + regex);
        return (_a = [...code.matchAll(regex)][0]) === null || _a === void 0 ? void 0 : _a[1].trim();
    }
    /**
     * Return the string variable value if found
     * @date 2/6/2023 - 2:36:57 AM
     *
     * @public
     * @static
     * @param {string} code Php code to parse
     * @param {string} varr Variable to search for
     * @returns {(string|undefined)}
     */
    static parseString(code, varr) {
        var _a;
        var regex = new RegExp(`${varr}[\\n\\s]*?=[\\n\\s]*(?:(?:'(.*?)[\\n\\s]*?')|(?:"(.*?)[\\n\\s]*?")|(?:\`(.*?)[\\n\\s]*?\`))[\\n\\s]*?;`, 'g');
        this.debug('Parsing string: ' + varr + ' with regex: ' + regex);
        return (_a = [...code.matchAll(regex)][0]) === null || _a === void 0 ? void 0 : _a[1].trim();
    }
    /**
     * Return the associative array variable value if found
     * This work by finding the array value, then replacing php syntax to json syntax and parsing the json result, may fail if the array is too complex
     * Only work with square brackets arrays syntax, not with array() syntax
     * @date 2/6/2023 - 2:37:40 AM
     *
     * @public
     * @static
     * @param {string} code Php code to parse
     * @param {string} varr Variable to search for
     * @returns {(any|undefined)}
     */
    static parseArrayAssoc(code, varr) {
        var _a;
        var regex = new RegExp(`${varr}[\\n\\s]*?=[\\n\\s]*(\\[.*\\])[\\n\\s]*?;`, 'g');
        this.debug('Parsing array: ' + varr + ' with regex: ' + regex);
        var parsed = (_a = [...code.matchAll(regex)][0]) === null || _a === void 0 ? void 0 : _a[1].trim();
        parsed = parsed === null || parsed === void 0 ? void 0 : parsed.replaceAll(new RegExp(`${varr}[\\n\\s]*=[\\n\\s]*`, 'g'), ':').replaceAll('=>', ':').replaceAll('[', '{').replaceAll(']', '}').replaceAll(new RegExp('[\'|`](?=.*?:)', 'g'), '"').trim();
        console.log(parsed);
        if (parsed) {
            try {
                return JSON.parse(parsed);
            }
            catch (e) { }
        }
        return undefined;
    }
    /**
   * Return the associative array variable value if found
   * This work by finding the array value, then replacing php syntax to json syntax and parsing the json result, may fail if the array is too complex
   * Only work with square brackets arrays syntax, not with array() syntax
   * @date 2/6/2023 - 2:37:40 AM
   *
   * @public
   * @static
   * @param {string} code Php code to parse
   * @param {string} varr Variable to search for
   * @returns {(any|undefined)}
   */
    static parseArray(code, varr) {
        var _a;
        var regex = new RegExp(`${varr}[\\n\\s]*?=[\\n\\s]*(\\[.*\\])[\\n\\s]*?;`, 'g');
        this.debug('Parsing array: ' + varr + ' with regex: ' + regex);
        var parsed = (_a = [...code.matchAll(regex)][0]) === null || _a === void 0 ? void 0 : _a[1].trim();
        parsed = parsed === null || parsed === void 0 ? void 0 : parsed.replaceAll(new RegExp(`${varr}[\\n\\s]*=[\\n\\s]*`, 'g'), ':').replaceAll(new RegExp('[\'|`](?=.*?:)', 'g'), '"').trim();
        if (parsed) {
            try {
                return JSON.parse(parsed);
            }
            catch (e) { }
        }
        return undefined;
    }
    /**
     * Return the constant name assigned to the variable if found
     * @date 2/6/2023 - 2:40:53 AM
     *
     * @public
     * @static
     * @param {string} code Php code to parse
     * @param {string} varr Variable to search for
     * @returns {(string|undefined)}
     */
    static parseConstant(code, varr) {
        var _a;
        var regex = new RegExp(`${varr}[\\n\\s]*?=[\\n\\s]*([A-Za-z0-9_]+[\\.\\+\\-\\>\\[\\]\\$'"\`A-Za-z0-9_]*)[\\n\\s]*?;`, 'g');
        this.debug('Parsing varieble (constant): ' + varr + ' with regex: ' + regex);
        return (_a = [...code.matchAll(regex)][0]) === null || _a === void 0 ? void 0 : _a[1].trim();
    }
    /**
     * Return the variable name assigned to the variable if found
     * @date 2/6/2023 - 2:42:00 AM
     *
     * @public
     * @static
     * @param {string} code Php code to parse
     * @param {string} varr Variable to search for
     * @returns {(string|undefined)}
     */
    static parseVariable(code, varr) {
        var _a;
        var regex = new RegExp(`${varr}[\\n\\s]*?=[\\n\\s]*(\\$[A-Za-z0-9_]+[\\.\\+\\-\\>\\[\\]\\$'"\`A-Za-z0-9_]*)[\\n\\s]*?;`, 'g');
        this.debug('Parsing varieble (variable): ' + varr + ' with regex: ' + regex);
        return (_a = [...code.matchAll(regex)][0]) === null || _a === void 0 ? void 0 : _a[1].trim();
    }
    /**
     * Return the constant value if found
     * @date 2/6/2023 - 2:42:17 AM
     *
     * @public
     * @static
     * @param {string} code Php code to parse
     * @param {string} constant Variable to search for
     * @returns {(string|undefined)}
     */
    static parseDefinedConstant(code, constant) {
        var _a;
        var regex = new RegExp(`define\\([\\n\\s"'\`]*${constant}["'\`\\n\\s]*,[\\n\\s"'\`]*(.+?)["'\`\\n\\s]*\\)\\s*;`, 'g');
        this.debug('Parsing defined constant: ' + constant + ' with regex: ' + regex);
        return (_a = [...code.matchAll(regex)][0]) === null || _a === void 0 ? void 0 : _a[1].trim();
    }
}
PhpVarParser.debug = debug('phpvarparser');
