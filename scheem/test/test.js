var assert = chai.assert;

// interpreter tests
suite('quote', function() {
    test('a number', function() {
        assert.deepEqual(
            evalScheem(['quote', 3], {}),
            3
        );
    });
    test('an atom', function() {
        assert.deepEqual(
            evalScheem(['quote', 'dog'], {}),
            'dog'
        );
    });
    test('a list', function() {
        assert.deepEqual(
            evalScheem(['quote', [1, 2, 3]], {}),
            [1, 2, 3]
        );
    });
});

suite('arithmetic', function() {
    test('two numbers', function() {
        assert.deepEqual(
            evalScheem(['+', 3, 5], {}),
            8
        );
    });
    test('a number and an expression', function() {
        assert.deepEqual(
            evalScheem(['*', 3, ['+', 2, 2]], {}),
            12
        );
    });
    test('an expression and a number', function() {
        assert.deepEqual(
            evalScheem(['/', ['*', 2, ['+', 100, 1]], -2], {}),
            -101
        );
    });
});

suite('references', function() {
    test('read', function() {
        var env = {
            bindings: {a: 10, b: -5},
            outer: {}
        };
        assert.deepEqual(
            evalScheem(['*', 'a', ['+', 'b', -3]], env),
            -80
        );
    });
    test('update', function() {
        var env = {
            bindings: {a: 10, b: -5},
            outer: {}
        };

        evalScheem(['set!', 'a', ['/', 'a', 2]], env);
        assert.deepEqual(
            evalScheem(['*', 'a', -8], env),
            -40
        );
    });
    test('create', function() {
        var env = {
            bindings: {a: 10, b: -5},
            outer: {}
        };

        evalScheem(['define', 'c', 100], env);
        assert.deepEqual(lookup(env, 'c'), 100);
    });
});


suite('begin', function() {
    test('begin', function() {
        var prg = ['begin',
                   ['define', 'x', 5],
                   ['set!', 'x', ['+', 'x', 1]],
                   ['+', 'x', 'a']];

        var env = {
            bindings: {a:2, b:7},
            outer: {}
        };
        assert.deepEqual(
            evalScheem(prg, env),
            8
        );

    });
});


suite('= < > cons car cdr', function() {
    test('equal to', function() {
        assert.deepEqual(
            evalScheem(['=', 3, ['-', 4, 1]], {}),
            '#t'
        );
    });
    test('unequal to', function() {
        assert.deepEqual(
            evalScheem(['=', 3, ['*', 4, 1]], {}),
            '#f'
        );
    });
    test('less than', function() {
        assert.deepEqual(
            evalScheem(['<', 1024, ['/', 9069, 3]], {}),
            '#t'
        );
    });
    test('not less than', function() {
        assert.deepEqual(
            evalScheem(['<', ['*', 2, 4500], ['/', 9069, 3]], {}),
            '#f'
        );
    });
    test('larger than', function() {
        assert.deepEqual(
            evalScheem(['>', ['+', 1000, 3000], ['/', 9069, 3]], {}),
            '#t'
        );
    });
    test('not larger than', function() {
        assert.deepEqual(
            evalScheem(['>', ['*', 2, 1500], ['/', 9069, 3]], {}),
            '#f'
        );
    });

    test('cons', function() {
        assert.deepEqual(
            evalScheem(['cons', ['quote', ['hello', 2, 1500]], ['quote', ['hah', 'no worries']]], {}),
            [['hello', 2, 1500], 'hah', 'no worries']
        );
    });

    test('car', function() {
        assert.deepEqual(
            evalScheem(['car', ['quote', ['hello', 2, 1500]]], {}),
            'hello'
        );
    });

    test('cdr', function() {
        assert.deepEqual(
            evalScheem(['cdr', ['quote', ['hello', 'world', 'now']]], {}),
            ['world', 'now']
        );
    });
});

suite('if', function() {
    test('equal', function() {
        assert.deepEqual(
            evalScheem(['if', ['=', 2, 2], 9, 10], {}),
            9
        );
    });

    test('not equal', function() {
        assert.deepEqual(
            evalScheem(['if', ['=', 2, 3], 9, 10], {}),
            10
        );
    });
});

suite('exceptions', function() {
    test('unknown operation', function() {
        assert.throws(function () {
            evalScheem(['emacsPower', 1, 2, 3, 4], {});
        });
    });

    test('can find reference', function() {
        var env = {a: 9, b:10, c:'bazinga'};
        assert.throws(function () {
            evalScheem(['+', a, d], env);
        });
    });

    test('Not a number', function() {
        var env = {a: 9, b:10, c:'bazinga'};
        assert.throws(function () {
            evalScheem(['+', a, c], env);
        });
    });

    test('+ more than 2 operands', function() {
        assert.throws(function () {
            evalScheem(['+', 1, 2, 3], {});
        });
    });

    test('- only 1 operand', function() {
        assert.throws(function () {
            evalScheem(['-', 1], {});
        });
    });

    test('* only 1 operand', function() {
        assert.throws(function () {
            evalScheem(['*', 1], {});
        });
    });

    test('/ more than 2 operands', function() {
        assert.throws(function () {
            evalScheem(['/', 1, 2, 3], {});
        });
    });

    test('/ divide 0', function() {
        assert.throws(function () {
            evalScheem(['/', 1024, 0], {});
        })
    });

    test('quote more than one expression', function() {
        assert.throws(function () {
            evalScheem(['quote', [1, 2, 3], 9], {});
        });
    });

    test('define only 1 parameter', function() {
        var env = {a: 1, b:2};
        assert.throws(function () {
            evalScheem(['define', 'c'], env);
        });
    });

    test('set! more than 2 parameters', function() {
        var env = {a: 1, b:2};
        assert.throws(function () {
            evalScheem(['set!', 'a', 9, 10], env);
        });
    });

    test('begin 0 expression', function() {
        assert.throws(function () {
            evalScheem(['begin'], {});
        });
    });

    test('= more than 2 expressions', function() {
        assert.throws(function () {
            evalScheem(['=', 9, 10, 11], {});
        });
    });

    test('< only 1 expression', function() {
        assert.throws(function () {
            evalScheem(['=', 9], {});
        });
    });

    test('> more than 2 expressions', function() {
        assert.throws(function () {
            evalScheem(['>', 15, 10, 11], {});
        });
    });

    test('cons more than 2 lists', function() {
        assert.throws(function () {
            evalScheem(['cons', 1, [2,3,4], 5], {});
        });
    });

    test('car more than 1 list', function() {
        assert.throws(function () {
            evalScheem(['car', [1,2,3,4], 5], {});
        });
    });

    test('car an empty list', function() {
        assert.throws(function () {
            evalScheem(['car', []], {});
        });
    });

    test('cdr nothing', function() {
        assert.throws(function () {
            evalScheem(['cdr'], {});
        });
    });

    test('cdr an empty list', function() {
        assert.throws(function () {
            evalScheem(['cdr', []], {});
        });
    });

    test('if less than 3 parameters', function() {
        assert.throws(function () {
            evalScheem(['if', ['<', 2,3], 5], {});
        });
    });

    test('if with the first parameter is not #f nor #t', function() {
        assert.throws(function () {
            evalScheem(['if', 3, 5, 4], {});
        });
    });

});


// parser tests
suite('parse', function() {
    test('a number', function() {
        assert.deepEqual(
            SCHEEM.parse('42'),
            42
        );
    });
    test('a variable', function() {
        assert.deepEqual(
            SCHEEM.parse('x'),
            'x'
        );
    });
    test('a simple expression', function() {
        assert.deepEqual(
            SCHEEM.parse("(+ 2 3)"),
            ['+', 2, 3]
        );
    });
    test('an expression contains expressions', function() {
        assert.deepEqual(
            SCHEEM.parse('(* (+ 1 3) (/ 2 (- 8 9)))'),
            ['*', ['+', 1, 3], ['/', 2, ['-', 8, 9]]]
        );
    });
    test('an expression with cdr', function() {
        assert.deepEqual(
            SCHEEM.parse("(cdr '(1 2 3 4))"),
            ['cdr', ['quote', [1, 2, 3, 4]]]
        );
    });
    test('an expression contains whitespace', function() {
        assert.deepEqual(
            SCHEEM.parse("(   +   8      9)"),
                         ['+', 8, 9]
        );
    });
});

// function application tests
suite('function application', function() {
    test('one argument function', function() {
        var add_one = function(arg) {
            return arg + 1;
        };
        var env = {
            bindings: {
                'add_one': add_one
            },
            outer: {}
        };
        assert.deepEqual(
            evalScheem(['add_one', 9], env),
            10
        );
    });

    test('two arguments function', function() {
        var add_one = function(arg) {
            return arg + 1;
        };
        var multiple = function(x, y) {
            return x * y;
        };
        var env = {
            bindings: {
                'multiple': multiple,
                'add_one': add_one
            },
            outer: {}
        };
        assert.deepEqual(
            evalScheem(['multiple', ['add_one', 9], 5], env),
            50
        );
    });

    test('four arguments function', function() {
        var f = function (a, b, c, d) {
            return (a - b + c * d);
        };

        var env = {
            bindings: {
                'f': f
            },
            outer: {}
        };
        assert.deepEqual(
            evalScheem(['f', 9, 7, 3, 4, 9], env),
            14
        );
    });

    test('recursive function', function() {
        var fact = function (n) {
            if (n === 1 || n === 2) {
                return 1;
            }
            return n * fact(n-1);
        };
        var env = {
            bindings: {
                'fact': fact
            },
            outer: {}
        };
        assert.deepEqual(
            evalScheem(['fact', 5], env),
            60
        );
    });
});


// lambda tests
suite('lambda one', function() {
    test('simple return', function() {
        assert.deepEqual(
            evalScheem([['lambda-one', 'x', 'x'], 5], {}),
            5
        );
    });
    test('+1', function() {
        assert.deepEqual(
            evalScheem([['lambda-one', 'x', ['+', 'x', 1]], 5], {}),
            6
        );
    });
    test('addition', function() {
        assert.deepEqual(
            evalScheem([[['lambda-one', 'x',
                         ['lambda-one', 'y', ['+', 'x', 'y']]], 5], 3], {}),
            8
        );
    });
    test('complex lambda-one', function() {
        assert.deepEqual(
            evalScheem([[['lambda-one', 'x',
                          ['lambda-one', 'x', ['+', 'x', 'x']]], 5], 3], {}),
            6
        );
    });
});

// lambda tests
suite('lambda', function() {
    test('simple return', function() {
        assert.deepEqual(
            evalScheem([['lambda', ['x'], 'x'], 5], {}),
            5
        );
    });
    test('+1', function() {
        assert.deepEqual(
            evalScheem([['lambda', ['x'], ['+', 'x', 1]], 5], {}),
            6
        );
    });
    test('addition', function() {
        assert.deepEqual(
            evalScheem([['lambda', ['x', 'y'], ['+', 'x', 'y']], 3, 5], {}),
            8
        );
    });
    test('four arguments lambda', function() {
        assert.deepEqual(
            evalScheem([['lambda', ['x', 'y', 'z', 'h'],
                         ['+', 'x', ['*', ['-', 'y', 'z'], 'h']]], 1, 2, 3, 4], {}),
                -3
        );
    });
});

// function tests
suite('function', function() {
    test('define and call a simple function (addition)', function() {
        var parsed = SCHEEM.parse("(begin \n" +
                                  "(define add (lambda(x y) (+ x y)))    ;; define add function \n" +
                                  "(add 1021 3)                          ;; call the function \n" +
                                  ")");
        var res = evalScheem(parsed, {});
        assert.deepEqual(
            res,
            1024
        );
    });

    test('call an anonymous function', function() {
        var parsed = SCHEEM.parse("((lambda (x y) (* x y)) \n" +
                                  " 2 8 )");
        var res = evalScheem(parsed, {});
        assert.deepEqual(
            res,
            16
        );
    });

    test('pass a function as value to another function', function() {
        var parsed = SCHEEM.parse("(begin \n" +
                                  " (define mul (lambda (x y) (* x y)))    ;; define mul function \n" +
                                  " (define f (lambda (ff x y) (ff x y))) \n" +
                                  " (f mul 9 8) \n" +
                                  ")");

        var res = evalScheem(parsed, {});
        assert.deepEqual(
            res,
            72
        );
    });

    test('inner function uses values from enclosing function', function() {
        var parsed = SCHEEM.parse(
            "(begin \n" +
                "(define make-account \n" +
                "(lambda (balance) \n" +
                "      (lambda (amt) \n" +
                "        (begin (set! balance (+ balance amt)) \n" +
                "               balance)))) \n" +
                "  (define a (make-account 1024)) \n" +
                "  (a 20) \n" +
                ")"
        );

        var res = evalScheem(parsed, {});
        assert.deepEqual(
            res,
            1044
        );
    });

    test('argument to a function shadows a global variable', function() {
        var parsed = SCHEEM.parse(
            "(begin \n" +
                "  (define x 1024) \n" +
                "  (define f \n" +
                "    (lambda (x y) \n" +
                "      (+ x y) \n" +
                "      )) \n" +
                "  (f 1 2) \n" +
                ") \n"
        );

        var res = evalScheem(parsed, {});
        assert.deepEqual(
            res,
            3
        );
    });

    test('a function modifies a global variable', function() {
        var parsed = SCHEEM.parse(
            "(begin \n" +
                "  (define x 1024) \n" +
                "  (define f \n" +
                "    (set! x (/ x 2)) \n" +
                "    ) \n" +
                "  x \n" +
                ") \n"
        );

        var res = evalScheem(parsed, {});
        assert.deepEqual(
            res,
            512
        );
    });

    test('a function in a define that calls itself recursively', function() {
        var parsed = SCHEEM.parse(
            "(begin \n" +
                "  (define factorial \n" +
                "    (lambda (n) \n" +
                "      (if (= n 0) \n" +
                "          1 \n" +
                "          (* n (factorial (- n 1)))))) \n" +
                "  (factorial 5)) \n"
        );

        var res = evalScheem(parsed, {});
        assert.deepEqual(
            res,
            120
        );
    });
    test('an inner function modifies a variable in the outer function', function() {
        var parsed = SCHEEM.parse(
            "(begin \n" +
                "  (define fo \n" +
                "    (lambda (x) \n" +
                "      (begin \n" +
                "        (define var 100) \n" +
                "        (define fi \n" +
                "          (lambda (x) \n" +
                "            (set! var (/ var x)))) \n" +
                "        (fi x) \n" +
                "        var))) \n" +
                "  (fo 5)) \n"
        );

        var res = evalScheem(parsed, {});
        assert.deepEqual(
            res,
            20
        );
    });
});

