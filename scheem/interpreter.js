// evalScheem(), which is a interpreter of parsed Scheem expressions

var evalScheem = function (expr, env) {
    // Length 1 array
    if (typeof expr === 'object' &&
        expr.length === 1) {
        return evalScheem(expr[0], env);
    }

    // Numbers evaluate to themselves
    if (typeof expr === 'number') {
        return expr;
    }

    // Strings are variable references
    if (typeof expr === 'string') {
        return env[expr];
    }

    // Look at head of list for operation
    switch (expr[0]) {

    case '+':
        return evalScheem(expr[1], env) +
            evalScheem(expr[2], env);
    case '-':
        return evalScheem(expr[1], env) -
            evalScheem(expr[2], env);
    case '*':
        return evalScheem(expr[1], env) *
            evalScheem(expr[2], env);
    case '/':
        return evalScheem(expr[1], env) /
            evalScheem(expr[2], env);

    case 'quote':
        return expr[1];

    case 'define':              // create a new variable
        env[expr[1]] = evalScheem(expr.slice(2), env);
        return 0;

    case 'set!':                // update a variabl
        env[expr[1]] = evalScheem(expr.slice(2), env);
        return 0;

    case 'begin':
        var i = 0;
        var exprstack = expr.slice(1);
        for (i = 0; i < exprstack.length - 1; i++) {
            evalScheem(exprstack[i], env);
        }
        return evalScheem(exprstack[i], env);

    case '=':
        var eq = (
            evalScheem(expr[1], env) ===
                evalScheem(expr[2], env)
        );

        if (eq) return '#t';
        else return '#f';

    case '<':
        var lt = (
            evalScheem(expr[1], env) <
                evalScheem(expr[2], env)
        );

        if (lt) return '#t';
        else return '#f';

    case '>':
        var gt = (
            evalScheem(expr[1], env) >
                evalScheem(expr[2], env)
        );

        if (gt) return '#t';
        else return '#f';

    case 'cons':
        var second = evalScheem(expr[2]);
        var first = evalScheem(expr[1]);
        second.unshift(first);
        return second;

    case  'car':
        return evalScheem(expr[1])[0];

    case 'cdr':
        return evalScheem(expr[1]).slice(1);

    case 'if':
        if (evalScheem(expr[1]) === '#t') {
            return evalScheem(expr[2]);
        }
        return evalScheem(expr[3]);

    }
};
