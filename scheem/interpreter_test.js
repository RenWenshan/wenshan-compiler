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
