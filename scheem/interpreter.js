/**
 * The interpreter of parsed Scheem expressions
 */
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
        return lookup(env, expr);
    }

    // Look at head of list for operation
    switch (expr[0]) {

    case '+':
        if (expr.length != 3) {
            throw new Error(
                "Operator '+' expected 2 operands, " + (expr.length-1) + " were given." );
            break;
        } else {
            return evalScheem(expr[1], env) +
                evalScheem(expr[2], env);
        }

    case '-':
        if (expr.length != 3) {
            throw new Error(
                "Operator '-' expected 2 operands, " + (expr.length-1) + " were given." );
            break;
        } else {
            return evalScheem(expr[1], env) -
                evalScheem(expr[2], env);
        }

    case '*':
        if (expr.length != 3) {
            throw new Error(
                "Operator '*' expected 2 operands, " + (expr.length-1) + " were given." );
            break;
        } else {
            return evalScheem(expr[1], env) *
                evalScheem(expr[2], env);
        }

    case '/':
        if (expr.length != 3) {
            throw new Error(
                "Operator '/' expected 2 operands, " + (expr.length-1) + " were given." );
            break;
        } else {
            return evalScheem(expr[1], env) /
                evalScheem(expr[2], env);
        }

    case 'quote':
        if (expr.length != 2) {
            throw new Error(
                "quote expected 1 expression, " + (expr.length-1) + " were given." );
            break;
        } else {
            return expr[1];
        }

    case 'define':              // create a new variable
        if (expr.length != 3) {
            throw new Error(
                "define expected 2 parameters, " + (expr.length-1) + " were given." );
            break;
        } else {
            add_binding(env, expr[1], evalScheem(expr.slice(2), env));
            return 0;
        }

    case 'set!':                // update a variabl
        if (expr.length != 3) {
            throw new Error(
                "set! expected 2 parameters, " + (expr.length-1) + " were given." );
            break;
        } else {
            update(env, expr[1], evalScheem(expr.slice(2), env));
            return 0;
        }

    case 'begin':
        if (expr.length < 2) {
            throw new Error(
                "begin expected at least 1 expression, 0 was given." );
            break;
        } else {
            var i = 0;
            var exprstack = expr.slice(1);
            for (i = 0; i < exprstack.length - 1; i++) {
                evalScheem(exprstack[i], env);
            }
            return evalScheem(exprstack[i], env);
        }

    case '=':
        if (expr.length != 3) {
            throw new Error(
                "'=' expected 2 expressions, " + (expr.length-1) + " were given." );
            break;
        } else {
            var eq = (
                evalScheem(expr[1], env) ===
                    evalScheem(expr[2], env)
            );

            if (eq) return '#t';
            else return '#f';
        }

    case '<':
        if (expr.length != 3) {
            throw new Error(
                "'<' expected 2 expressions, " + (expr.length-1) + " were given." );
            break;
        } else {

            var lt = (
                evalScheem(expr[1], env) <
                    evalScheem(expr[2], env)
            );

            if (lt) return '#t';
            else return '#f';
        }

    case '>':
        if (expr.length != 3) {
            throw new Error(
                "'>' expected 2 expressions, " + (expr.length-1) + " were given." );
            break;
        } else {
            var gt = (
                evalScheem(expr[1], env) >
                    evalScheem(expr[2], env)
            );
            if (gt) return '#t';
            else return '#f';
        }

    case 'cons':
        if (expr.length != 3) {
            throw new Error(
                "'cons' expected 2 lists, " + (expr.length-1) + " were given." );
            break;
        } else {
            var second = evalScheem(expr[2]);
            var first = evalScheem(expr[1]);
            second.unshift(first);
            return second;
        }

    case  'car':
        if (expr.length != 2) {
            throw new Error(
                "'car' expected only 1 list, " + (expr.length-1) + " were given." );
            break;
        } else {
            var res = evalScheem(expr[1]);
            if (res.length === 0) { // empty res
                throw new Error(
                    "'car' expected a list with at least 1 element, a length "
                        + res.length + " list was given." );
                break;
            } else {
                return res[0];
            }
        }

    case 'cdr':
        if (expr.length != 2) {
            throw new Error(
                "'cdr' expected 1 list, " + (expr.length-1) + " were given." );
            break;
        } else {
            var res = evalScheem(expr[1]);
            if (res.length === 0) {
                throw new Error(
                    "'cdr' expected a list with at least 1 element, a length "
                        + res.length + " list was given." );
                break;
            } else {
                return evalScheem(expr[1]).slice(1);
            }
        }

    case 'if':
        if (expr.length != 4) {
            throw new Error(
                "'if' expected 3 parameters, " + (expr.length-1) + " were given." );
            break;
        } else {
            var res = evalScheem(expr[1]);
            if (res === '#t') {
                return evalScheem(expr[2]);
            } else if (res === '#f') {
                return evalScheem(expr[3]);
            } else {
                throw new Error(
                    "'if' expected the first parameter to be #t or #f, "
                        + res + " was given." );
                break;
            }
        }

    default:                    // function call
        var func = evalScheem(expr[0], env);
        var arg = evalScheem(expr[1], env);
        return func(arg);
    }
};

/**
 * Get the value of a variable
 */
var lookup = function (env, v) {
    // not found
    if (!(env.hasOwnProperty('bindings'))) {
        throw new Error(v + " not found");
    }
    // base step
    if (env.bindings.hasOwnProperty(v)) {
        return env.bindings[v];
    }
    // recursive step
    return lookup(env.outer, v);
};

/**
 * Update a variable
 */
var update = function (env, v, val) {
    if (!(env.hasOwnProperty('bindings'))) {
        // empty env
        env.bindings = {};
        env.outer = {};
        env.bindings[v] = val;
        return;
    }
    if (env.bindings.hasOwnProperty(v)) {
        env.bindings[v] = val;
        return;
    }
    update(env.outer, v, val);
};

/**
 * Add a new binding
 */
var add_binding = function (env, v, val) {
    env.bindings[v] = val;
}
