// First Compiler for a muscic language
// Author: Wenshan Ren (wenshan@wenshanren.org)

// convert pitch to MIDI number
var convertPitch = function(pitch) {
    var letter = pitch[0];
    var octave = pitch[1];
    var letterPitch;
    if (letter === 'c' || letter === 'C') {
        letterPitch = 0;
    } else if (letter === 'd' || letter === 'D') {
        letterPitch = 2;
    } else if (letter === 'e' || letter === 'E') {
        letterPitch = 4;
    } else if (letter === 'f' || letter === 'F') {
        letterPitch = 5;
    } else if (letter === 'g' || letter === 'G') {
        letterPitch = 7;
    } else if (letter === 'a' || letter === 'A') {
        letterPitch = 9;
    } else if (letter === 'b' || letter === 'b') {
        letterPitch = 11;
    }

    return 12 + 12 * octave + letterPitch;
};

// compile a piece of music to a list of notes
var compile = function(music) {
    var notes = [];
    compileT(music, 'seq', 0);
    return notes;

    function compileT(expr, parent, time) {        // help method
        if (expr.tag == 'note') { // base case: note
            notes.push({ tag: 'note', pitch: convertPitch(expr.pitch), start: time, dur: expr.dur});
            return time + expr.dur;
        }
        if (expr.tag == 'rest') { // base case: rest
            notes.push({ tag: 'rest', duration: expr.duration});
            return time + expr.duration;
        }
        if (expr.tag == 'repeat') { // base case: repeat note
            for (i = 0; i < expr.count; i++) {
                time = compileT(expr.section, 'seq', time);
            }
            return time;
        }

        if (expr.tag == 'par') { // recursive case: parallel
            var leftTime = compileT(expr.left, 'par', time);
            var rightTime = compileT(expr.right, 'par', time);

            if (leftTime < rightTime) {
                return rightTime;
            } else {
                return leftTime;
            }
        } else if (expr.tag == 'seq') { // recursive case: sequential
            time = compileT(expr.left, 'seq', time);
            time = compileT(expr.right, 'seq', time);
            return time;
        }
    }
};


// test
var melody_mus =
    { tag: 'par',
      left:
      { tag: 'repeat',
        section: {
          tag: 'seq',
            left: { tag: 'note', pitch: 'a4', dur: 250 },
            right: { tag: 'note', pitch: 'b4', dur: 250 } },
        count: 3 },
      right:
      { tag: 'seq',
        left: { tag: 'note', pitch: 'c4', dur: 500 },
        right: { tag: 'note', pitch: 'd4', dur: 500 } } };

console.log(melody_mus);
console.log(compile(melody_mus));