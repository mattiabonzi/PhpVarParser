# Php Var Parser
![Version](https://img.shields.io/badge/version-1.0.6-blue.svg?cacheSeconds=2592000)
[![Documentation](https://img.shields.io/badge/documentation-yes-brightgreen.svg)](github.com/mattiabonzi/phpvarparser)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](#)

Get the value of PHP variable and constant

> Only regex are used to parse the data, so it can give false result (excpecialy with complex string)

Parse the code content, searching for the provided variables, using regex.<br>
Variables should be in the form: `{ var1: 'type', var2: 'type'}` <br>
Where type is one of:  '`number`', '`string`', '`boolean`', '`array`', '`array_assoc`', '`definedConstant`', '`constant`', '`variable`'.<br>
Note that constant means that t the variable searched is assigned a constant (Eg. `$var = CONSTANT`)<br>
To search for a constant, use '`definedConstant`' (Eg. `define('CONSTANT', 'value')`) <br>
If no type is provided the parser will try to guess the type, but is slow and dangerous <br>
If provided the `suffix` will be added to the variable name, remember to double escape special characters (Eg. "`\\$`")<br>
For arrays, only work with square brackets arrays syntax, not with array() syntax. <br>
The intended use is only for parsing simple configuration file, where you now how the code you are parsing should look like. No check are done on the ouput!<br>

> Do not use this library in a production environment!


Given this code:
```php
$myVar = 1;
$foo = 'bar';
$bar = true;
$foo->bar = 'Hello "word"!';
$foo->baz = 'Hi, \'word\'';
$baz = $foo;
define('FOO', 123);
const BAR = 456;
$arr = [1,2,"3"];
$arr_assoc = [1 => 1, 2 => 2, 3 => "3"];
```

will output like this:
```js
import PhpVarParser from 'PhpVarParser';
PhpVarParser.parse(php, {'myVar': 'number'})
// { myVar: '1' }
PhpVarParser.parse(php, {'foo': 'string'})
// { foo: 'bar' }
PhpVarParser.parse(php, {'bar': 'boolean'})
// { bar: 'true' }
PhpVarParser.parse(php, {'FOO': 'definedConstant'}, '')
// { FOO: '123' }
PhpVarParser.parse(php, {'BAR': 'number'}, 'const ')
// { BAR: '456' }
PhpVarParser.parse(php, {'foo->bar': 'string'})
// { 'foo->bar': 'Hello "word"!' }
PhpVarParser.parse(php, {'bar':'string', 'baz':'string'}, '\\$foo->')
// { bar: 'Hello "word"!', baz: "Hi, \\'word\\'" }
PhpVarParser.parse(php, {'baz':'variable', 'foo':'string'}, '\\$', true)
// { baz: 'bar', foo: 'bar' }
PhpVarParser.parse(php, {'arr': 'array'})
// { arr: [1,2,"3"] }
PhpVarParser.parse(php, {'arr_assoc': 'array_assoc'})
// { arr_assoc: {"1": 1, "2": 2, "3": "3"} }

```

lse result in many 

## Install

```sh
npm i phpvarparser
```

## Run tests

```sh
npm run test
```

## Author

👤 **Mattia Bonzi <mattia@mattiabonzi.it>**

* Website: [mattiabonzi.it](https://mattiabonzi.it)
* Github: [@mattiabonzi](https://github.com/mattiabonzi)

## 🤝 Contributing

Contributions, issues and feature requests are welcome!

Feel free to check [issues page](github.com/mattiabonzi/phpvarparser/issues). 

## Show your support

Give a ⭐️ if this project helped you!


***
_This README was generated with ❤️ by [readme-md-generator](https://github.com/kefranabg/readme-md-generator)_
