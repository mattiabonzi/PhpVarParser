import Mocha from 'mocha';
import assert from 'assert';
import PhpVarParser from '../index.js';


var php = `
$myVar = 1;
$foo = 'bar';
$bar = true;
$foo->bar = 'Hello "word"!';
$foo->baz = 'Hi, \'word\'';
$baz = $foo;
define('FOO', 123);
const BAR = 456;
$arr = [1,2,"3"];
$arr_assoc = ['1' => 1, \`2\` => 2, "3" => "3"];
$arr_assoc2 = ['a' => "hello", "b" => "wo:rd", 'xx' => "yy"];
if ($x = 1 && ($xyz = 123)) {}
`;


describe('Array', function () {
  describe('Parse', function () {
    it('Should parse all the value', function () {
      
      
      assert.equal( PhpVarParser.parse(php, {'myVar': 'number'}).myVar,  '1' );
      assert.equal(PhpVarParser.parse(php, {'foo': 'string'}).foo,   'bar' );
      assert.equal(PhpVarParser.parse(php, {'bar': 'boolean'}).bar ,  'true' )
      assert.equal(PhpVarParser.parse(php, {'foo->bar': 'string'})['foo->bar'] , 'Hello "word"!' )
      assert.equal(PhpVarParser.parse(php, {'bar': 'string', 'baz': 'string'}, '\\$foo->').bar,  'Hello "word"!' )
      assert.equal(PhpVarParser.parse(php, {'baz': 'variable', 'foo': 'string'}, '\\$', true).baz , 'bar' )
      assert.equal(PhpVarParser.parse(php, {'FOO': 'definedConstant'}, '').FOO ,  '123' )
      assert.equal(PhpVarParser.parse(php, {'BAR': 'number'}, 'const ').BAR, '456')
      assert.equal(PhpVarParser.parse(php, {'arr': 'array'}).arr[0] ,  1 )
      var arrayAssoc = PhpVarParser.parse(php, {'arr_assoc': 'array_assoc'}).arr_assoc;
      assert.equal(arrayAssoc['1'], 1)
      assert.equal(arrayAssoc['2'], 2)
      assert.equal(arrayAssoc['3'], '3')
      var arrayAssoc2 = PhpVarParser.parse(php, {'arr_assoc2': 'array_assoc'}).arr_assoc2;
      assert.equal(arrayAssoc2.a, 'hello')
      assert.equal(arrayAssoc2.b, 'wo:rd')
      assert.equal(arrayAssoc2.xx, 'yy')
      assert.equal(PhpVarParser.parse(php, {'xyz': 'number'}).xyz, undefined)
      

      
    });
  });
});