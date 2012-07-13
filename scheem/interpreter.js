/**
 * The interpreter of parsed Scheem expressions
 */

/*
 * eval a Scheem expression
 */
var evalScheem = function (expr, env) {
    // init the environment
    if (!lookup(env, '+')) {
        var func_add = function () {
            if (arguments.length != 2) {
                throw new Error(
                    "Operator '+' expects 2 arguments , given " + (expr.length-1));
            }
            var x = arguments[0];
            var y = arguments[1];
            return x + y;
        };
        add_binding(env, '+', func_add);
    }
    if (!lookup(env, '-')) {
        var func_sub = function () {
            if (arguments.length != 2) {
                throw new Error(
                    "Operator '-' expects 2 arguments, given " + (expr.length-1));
            }
            var x = arguments[0];
            var y = arguments[1];
            return x - y;
        };
        add_binding(env, '-', func_sub);
    }
    if (!lookup(env, '*')) {
        var func_mul = function () {
            if (arguments.length != 2) {
                throw new Error(
                    "Operator '*' expects 2 arguments, given " + (expr.length-1));
            }
            var x = arguments[0];
            var y = arguments[1];
            return x * y;
        };
        add_binding(env, '*', func_mul);
    }
    if (!lookup(env, '/')) {
        var func_div = function () {
            if (arguments.length != 2) {
                throw new Error(
                    "Operator '/' expects 2 arguments, given " + (expr.length-1));
            }
            var x = arguments[0];
            var y = arguments[1];
            if (y === 0) {
                throw new Error(
                    "Operator '/' expects a non-zero second argument");
            }
            return x / y;
        };
        add_binding(env, '/', func_div);
    }
    if (!lookup(env, '=')) {
        var func_equal = function () {
            if (arguments.length != 2) {
                throw new Error(
                    "'=' expects 2 arguments, given " + (expr.length-1));
            }
            var x = arguments[0];
            var y = arguments[1];
            if (x === y) return '#t';
            return '#f';
        };
        add_binding(env, '=', func_equal);
    }
    if (!lookup(env, '<')) {
        var func_lt = function () {
            if (arguments.length != 2) {
                throw new Error(
                    "'<' expects 2 arguments, given " + (expr.length-1));
            }
            var x = arguments[0];
            var y = arguments[1];
            if (x < y) return '#t';
            return '#f';
        };
        add_binding(env, '<', func_lt);
    }
    if (!lookup(env, '>')) {
        var func_gt = function () {
            if (arguments.length != 2) {
                throw new Error(
                    "'>' expects 2 arguments, given " + (expr.length-1));
            }
            var x = arguments[0];
            var y = arguments[1];
            if (x > y) return '#t';
            return '#f';
        };
        add_binding(env, '>', func_gt);
    }
    if (!lookup(env, '<=')) {
        var func_le = function () {
            if (arguments.length != 2) {
                throw new Error(
                    "'<=' expects 2 arguments, given " + (expr.length-1));
            }
            var x = arguments[0];
            var y = arguments[1];
            if (x <= y) return '#t';
            return '#f';
        };
        add_binding(env, '<=', func_le);
    }
    if (!lookup(env, '>=')) {
        var func_ge = function () {
            if (arguments.length != 2) {
                throw new Error(
                    "'>=' expects 2 arguments, given " + (expr.length-1));
            }
            var x = arguments[0];
            var y = arguments[1];
            if (x >= y) return '#t';
            return '#f';
        };
        add_binding(env, '>=', func_ge);
    }
    if (!lookup(env, 'cons')) {
        var func_cons = function () {
            if (arguments.length != 2) {
                throw new Error(
                    "'cons' expects 2 arguments, given " + (expr.length-1));
            }
            var first = arguments[0];
            var second = arguments[1];
            if (typeof second != 'object') { // second is an atom
                return [first, second];
            }
            second.unshift(first);
            return second;
        };
        add_binding(env, 'cons', func_cons);
    }
    if (!lookup(env, 'car')) {
        var func_car = function () {
            if (arguments.length != 1) {
                throw new Error(
                    "'car' expects 1 argument, given " + (expr.length-1));
            }
            var list = arguments[0];
            if (typeof list != 'object') { // not a list
                throw new Error(
                    "'car' expects a list as argument"
                );
            }
            if (list.length === 0) { // empty list
                throw new Error(
                    "'car' expects a non empty list"
                );
            }
            return list[0];
        };
        add_binding(env, 'car', func_car);
    }
    if (!lookup(env, 'cdr')) {
        var func_cdr = function () {
            if (arguments.length != 1) {
                throw new Error(
                    "'cdr' expects 1 argument, given " + (expr.length-1));
            }
            var list = arguments[0];
            if (typeof list != 'object') { // not a list
                throw new Error(
                    "'cdr' expects a list as argument"
                );
            }
            if (list.length === 0) { // empty list
                throw new Error(
                    "'car' expects a non empty list"
                );
            }
            return list.slice(1);
        };
        add_binding(env, 'cdr', func_cdr);
    }
    // eval
    return evalScheem_help(expr, env);
};

/*
 * evalScheem help function
 */
var evalScheem_help = function (expr, env) {
    // Numbers evaluate to themselves
    if (typeof expr === 'number') {
        return expr;
    }

    // Strings are variable references
    if (typeof expr === 'string') {
        var res = lookup(env, expr);
        if (res === false) {
            throw new Error(expr + " not found");
        } else {
            return res;
        }
    }

    // Look at head of list for operation
    switch (expr[0]) {
    case 'quote':
        if (expr.length != 2) {
            throw new Error(
                "quote expected 1 expression, " + (expr.length-1) + " were given." );
        } else {
            return expr[1];
        }
        break;

    case 'define':              // create a new variable
        if (expr.length != 3) {
            throw new Error(
                "define expected 2 parameters, " + (expr.length-1) + " were given." );
        } else {
            add_binding(env, expr[1], evalScheem_help(expr[2], env));
            return 0;
        }
        break;

    case 'set!':                // update a variabl
        if (expr.length != 3) {
            throw new Error(
                "set! expected 2 parameters, " + (expr.length-1) + " were given." );
        } else {
            update(env, expr[1], evalScheem_help(expr[2], env));
            return 0;
        }
        break;

    case 'begin':
        if (expr.length < 2) {
            throw new Error(
                "begin expected at least 1 expression, 0 was given." );
        } else {
            var i = 0;
            var exprstack = expr.slice(1);
            for (i = 0; i < exprstack.length - 1; i++) {
                evalScheem_help(exprstack[i], env);
            }
            return evalScheem_help(exprstack[i], env);
        }
        break;

    case 'if':
        if (expr.length != 4) {
            throw new Error(
                "'if' expected 3 parameters, " + (expr.length-1) + " were given." );
        } else {
            var res = evalScheem_help(expr[1], env);
            if (res === '#t') {
                return evalScheem_help(expr[2], env);
            } else if (res === '#f') {
                return evalScheem_help(expr[3], env);
            } else {
                throw new Error(
                    "'if' expected the first parameter to be #t or #f, " /
                        + res + " was given." );
            }
        }
        break;

    case 'lambda-one':
        return function(arg) {
            var bnd = {};
            bnd[expr[1]] = arg;
            var new_env = {
                bindings: bnd,
                outer: env
            };
            return evalScheem_help(expr[2], new_env);
        };

    case 'lambda':
        return function() {
            var bnd = {};
            for (var i = 0; i < expr[1].length; i++) {
                bnd[expr[1][i]] = arguments[i];
            }
            var new_env = {
                bindings: bnd,
                outer: env
            };
            return evalScheem_help(expr[2], new_env);
        };

    default:                    // function call
        var func = evalScheem_help(expr[0], env);
        var args = [];
        for (var i = 1; i < expr.length; i++) {
            args.push(evalScheem_help(expr[i], env));
        }
        return func.apply(null, args);
    }
};

/*
 * Get the value of a variable
 */
var lookup = function (env, v) {
    // not found
    if (!(env.hasOwnProperty('bindings'))) {
        return false;
    }
    // base step
    if (env.bindings.hasOwnProperty(v)) {
        return env.bindings[v];
    }
    // recursive step
    return lookup(env.outer, v);
};

/*
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

/*
 * Add a new binding
 */
var add_binding = function (env, v, val) {
    if (!(env.hasOwnProperty('bindings'))) { // empty env
        env.bindings = {};
        env.outer = {};
    }
    env.bindings[v] = val;
};
