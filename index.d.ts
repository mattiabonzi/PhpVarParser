import debug from "debug";
export default class PhpVarParser {
    static debug: debug.Debugger;
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
    static parse(code: string, vars: {
        [key: string]: string;
    }, suffix?: string, resolve?: boolean): any;
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
    static tryToGuess(code: string, varr: string): string | undefined;
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
    static parseInt(code: string, varr: string): string | undefined;
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
    static parseBool(code: string, varr: string): string | undefined;
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
    static parseString(code: string, varr: string): string | undefined;
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
    static parseArrayAssoc(code: string, varr: string): any | undefined;
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
    static parseArray(code: string, varr: string): any | undefined;
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
    static parseConstant(code: string, varr: string): string | undefined;
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
    static parseVariable(code: string, varr: string): string | undefined;
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
    static parseDefinedConstant(code: string, constant: string): string | undefined;
}
