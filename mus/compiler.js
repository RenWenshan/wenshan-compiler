// First Compiler for a muscic language
// Author: Wenshan Ren (wenshan@wenshanren.org)


// compile a piece of music to a list of notes
var compile = function(music) {
    var notes = [];
    rec(music, 'seq', 0);
    return notes;

    function rec(expr, parent, time) {        // help method
        if (expr.tag == 'note') { // base case
            notes.push({ tag: 'note', pitch: expr.pitch, start: time, dur: expr.dur});
            return time + expr.dur;
        } else if (expr.tag == 'par') { // recursive case: parallel
            var leftTime = rec(expr.left, 'par', time);
            var rightTime = rec(expr.right, 'par', time);

            if (leftTime < rightTime) {
                return rightTime;
            } else {
                return leftTime;
            }
        } else if (expr.tag == 'seq') { // recursive case: sequential
            time = rec(expr.left, 'seq', time);
            time = rec(expr.right, 'seq', time);
            return time;
        }
    }
};


// test
var melody_mus =
    { tag: 'seq',
      left:
      { tag: 'seq',
        left: { tag: 'note', pitch: 'a4', dur: 250 },
        right: { tag: 'note', pitch: 'b4', dur: 250 } },
      right:
      { tag: 'seq',
        left: { tag: 'note', pitch: 'c4', dur: 500 },
        right: { tag: 'note', pitch: 'd4', dur: 500 } } };

console.log(melody_mus);
console.log(compile(melody_mus));