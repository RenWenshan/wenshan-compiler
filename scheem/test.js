// Unit Tests for scheem

var PEG = require("pegjs");
var assert = require("assert");
var fs = require("fs");         // for loading files

// read file contents
var data = fs.readFileSync("scheem.peg", "utf-8");

// create scheem parser
var parse = PEG.buildParser(data).parse;

// basic functionality test cases
assert.deepEqual( parse("(a b c)"), ["a", "b", "c"] );
assert.deepEqual( parse("(+ a b (* (/ 10 2)))"), ["+", "a", "b", ["*", ["/", "10", "2"]]]);
assert.deepEqual( parse("((+ 9 4))"), ['+', '9', '4'] );
assert.deepEqual( parse("(* (+ 9 4) (+ 2 3))"), ['*', ['+', '9', '4'], ['+', '2', '3']] );
assert.deepEqual(
    parse("(+ 1 (- 10 9) (* 2 1) 3 4)"),
    ["+", "1", ["-", "10", "9"], ["*", "2", "1"], "3", "4"]
);

// white space handling test cases
assert.deepEqual( parse(" ( a  b  c    )  "), ["a", "b", "c"]);
assert.deepEqual( parse("(+ (- 10 9) (* 2 6) 9 7)"),
                  ["+", ["-", "10", "9"], ["*", "2", "6"], "9", "7"]
                );
