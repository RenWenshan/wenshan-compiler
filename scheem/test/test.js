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
        )
    });
});

suite('references', function() {
    test('read', function() {
        var env = {a: 10, b: -5}
        assert.deepEqual(
            evalScheem(['*', 'a', ['+', 'b', -3]], env),
            -80
        );
    });
    test('update', function() {
        var env = {a: 10, b: -5}
        evalScheem(['set!', 'a', ['/', 'a', 2]], env);
        assert.deepEqual(
            evalScheem(['*', 'a', -8], env),
            -40
        );
    });
    test('create', function() {
        var env = {a: 10, b: -5}
        evalScheem(['define', 'c', 100], env);
        assert.deepEqual(env.c, 100);
    });
});


suite('begin', function() {
    test('begin', function() {
        var prg = ['begin',
                   ['define', 'x', 5],
                   ['set!', 'x', ['+', 'x', 1]],
                   ['+', 'x', 'a']];

        var env = {a:2, b:7};
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
        )
    });
    test('unequal to', function() {
        assert.deepEqual(
            evalScheem(['=', 3, ['*', 4, 1]], {}),
            '#f'
        )
    });
    test('less than', function() {
        assert.deepEqual(
            evalScheem(['<', 1024, ['/', 9069, 3]], {}),
            '#t'
        )
    });
    test('not less than', function() {
        assert.deepEqual(
            evalScheem(['<', ['*', 2, 4500], ['/', 9069, 3]], {}),
            '#f'
        )
    });
    test('larger than', function() {
        assert.deepEqual(
            evalScheem(['>', ['+', 1000, 3000], ['/', 9069, 3]], {}),
            '#t'
        )
    });
    test('not larger than', function() {
        assert.deepEqual(
            evalScheem(['>', ['*', 2, 1500], ['/', 9069, 3]], {}),
            '#f'
        )
    });

    test('cons', function() {
        assert.deepEqual(
            evalScheem(['cons', ['quote', ['hello', 2, 1500]], ['quote', ['hah', 'no worries']]], {}),
            [['hello', 2, 1500], 'hah', 'no worries']
        )
    });

    test('car', function() {
        assert.deepEqual(
            evalScheem(['car', ['quote', ['hello', 2, 1500]]], {}),
            'hello'
        )
    });

    test('cdr', function() {
        assert.deepEqual(
            evalScheem(['cdr', ['quote', ['hello', 'world', 'now']]], {}),
            ['world', 'now']
        )
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
    })
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

