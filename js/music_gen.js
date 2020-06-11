const ctx = new (window.AudioContext || window.webkitAudioContext)
const fft = new AnalyserNode(ctx, {fftsize : 2048})

// Vibe mode... make graphics cool!
energy = 0


const major = [0, 2, 4, 5, 7 , 9, 11, 12]
const minor = [0, 2, 3, 5, 7, 8, 10, 12]

const pentatonic = [0, 3, 5, 8, 10]

// Initialize video element to none; user has to accept for it to be created
var capture = null 

// Taken from Nick's videos and guides
// opts fields: (param, peak, hold, time, a, d, s, r)
function adsr (opts) {
    /* 0.8 second adsr, so ~120 bpm half note
                  peak
                  /\   hold  hold
                 /| \__|____|
                / |    |    |\
               /  |    |    | \
         init /a  |d   |s   |r \ init
  
         <----------time------------>
    */
    const param = opts.param
    const peak = opts.peak || 0.8
    const hold = opts.hold || 0.6
    const time = opts.time || ctx.currentTime
    const scaler = opts.scaler || 1.0
    const a = opts.attack || 0.2 * scaler
    const d = opts.decay || 0.1 * scaler
    const s = opts.sustain || 0.1 * scaler
    const r = opts.release || 0.1 * scaler

    const initVal = param.value
    param.setValueAtTime(initVal, time)
    param.linearRampToValueAtTime(peak, time+a)
    param.linearRampToValueAtTime(hold, time+a+d)
    param.linearRampToValueAtTime(hold, time+a+d+s)
    param.linearRampToValueAtTime(initVal, time+a+d+s+r)
}

// Erratic noisy sound thing. n_oscs for number of oscillations, duration for duration
// Good for wobbly bass noise
function spazVol (gainNode, n_oscs, duration, time = ctx.currentTime) {
    var intensities = []
    for(let i = 0; i < n_oscs; i++) {
        intensities.push(Math.random())
        gainNode.linearRampToValueAtTime(intensities[i], time + i*duration/n_oscs)
    }
}

// Random music generation based on the four input attributes! Modulate
//

function makeMusic(n) {

}

function playBoop(hz) {
    const synth1 = new OscillatorNode(ctx)
    const volume = new GainNode(ctx, {gain : 0.001})
    synth1.connect(volume)
    volume.connect(fft)
    volume.connect(ctx.destination)
    synth1.frequency.setValueAtTime(hz, ctx.currentTime)
    synth1.start(ctx.currentTime)
    adsr({"param": volume.gain, "scaler" : 0.2})
    synth1.stop(ctx.currentTime + 0.3)
    //document.removeEventListener('click', playMusic);
}

function vibe(freq) {
    const synth1 = new OscillatorNode(ctx)
    const volume = new GainNode(ctx, {gain : 0.001})
    synth1.connect(volume)
    volume.connect(fft)
    volume.connect(ctx.destination)
    synth1.frequency.setValueAtTime(freq, ctx.currentTime)
    synth1.start(ctx.currentTime)
    //adsr({"param": volume.gain})
    dur = 2
    freq = 30
    // weird wobbly sound
    spazVol(volume.gain, dur*freq, dur)
    synth1.stop(ctx.currentTime + dur)

    setTimeout(() => energy = 0, dur*1000)

    // create earthquake effect in p5...
}

// Modulates the frequency, like vibe but nonrandom
function modulate(hz, freq) {
    const synth = new OscillatorNode(ctx)
    const volume = new GainNode(ctx, {gain : 0.001})
    synth.connect(volume)
    volume.connect(fft)
    volume.connect(ctx.destination)
    synth.frequency.setValueAtTime(freq, ctx.currentTime)
    synth.start(ctx.currentTime)
    //adsr({"param": volume.gain})
    dur = 2
    freq = 30
    // weird wobbly sound
    spazVol(volume.gain, dur*freq, dur)
    synth1.stop(ctx.currentTime + dur)
    // create earthquake effect in p5...
}



// Stuff for p5
let pi = [3,1,4,1,5,9,2,6,5,3,5,8,9]
var minsize = 40
var cursize = 0
var maxsize = 200
var curBG = 0
var angle 
var dt = 0.01

// Renamed setup() which is a default p5 function to setup_p5 so we can hide it
function setupApp() {
    // Cancel speech if there's current speech going on
    window.speechSynthesis.cancel()
    user_typed = false
    inputs = document.querySelectorAll('input');
    for (let i = 0; i<inputs.length; i++) {
        if (inputs[i].value !== '') {
            user_typed = true
        }
    }
    if (document.querySelector('textarea').value !== '') {
        user_typed = true;
    }

    if (!user_typed) {
        console.log("user didn't type anything but wants to vibe... LOL NO");
        return;
    }
    if (document.querySelector("canvas") == null) {
        createWaveCanvas({ element: 'section', analyser: fft});
    }

    // Change p5 code later; reinitialize the music player everytime the user clicks the button!
    c = createCanvas(800, 600)
    c.parent("p5canvas")
    setInterval(changeBG, 1000);
    angle = PI
    tentacles = [] 

    capture = createCapture(VIDEO);
    capture.hide();

    // Say a welcome to the user and initialize music! msg will say the bio later...
    var greeting = "Hello, " + document.querySelector('#fname').value;

    
    msg = new SpeechSynthesisUtterance(greeting);
    window.speechSynthesis.speak(msg);

    var greeting2;

    age = parseInt(document.querySelector("#age").value)
    /*
        Algorithmicly generated mYOUsic:

        A first name says so much about a person and can be a reflection of their
        whole personality; just mentioned a person's first name can bring up so many
        aspects of their personality and positive/negative emotions; the melody 
        and some parts of the rhythm will be determined by the first name

        Last name signifies a person's heritage. The baseline of the piece which 
        serves as the harmony and gives it a distinctive underlying flavor is
        determined by the last name.

        Age parameter:
        Age will determine tempo of piece according to a piecewise linear interpolation between
        the points (0, 80), (20, 160), (80, 60); this is to roughly match your general 
        energy levels :) 

        The bio of a person describes extra elements of their personality and serve
        as additions to the harmony and ornamental features; they're the cherry on 
        top
        
        If you don't put an age, we'll just guess you have 12 year old energy levels.

        Volume:
        will be scaled slightly louder for older people to compensate for hearing loss!

        And of course, the mYOUsic would not be complete without YOU. We can't force
        you to participate though or guarantee that you have a webcam; you might just be a robot
    */

    if (age < 7) {
        greeting2 = "You are a little baby."
    } else if (age < 18) {
        greeting2 = "I heard you LOVE compulsory education"
    } else if (age < 40) {
        greeting2 = "You haven't hit your midlife crisis yet."
    } else if (age < 70) {
        greeting2 = "ok boomer"
    } else if (age < 123) {
        greeting2 = "wow you are OLD."
    } else if (age > 123) {
        greeting2 = "you are either a robot or the world's oldest person."
    } else {
        greeting2 = "I don't know your age. I'll just assume you're 12."
    }

    msg = new SpeechSynthesisUtterance(greeting2);
    window.speechSynthesis.speak(msg);

    msg2 = new SpeechSynthesisUtterance("Enjoy the music!")
    window.speechSynthesis.speak(msg2);

    setTimeout(initMusic, 4500);
}

function initMusic() {

}

function draw() {
    if (capture) {
        // Place video in center of screen
        let x = (width - capture.width)/2
        y = (height - capture.height)/2
        image(capture, x, y);
    }
    cursize = map(sin(angle), -1, 1, minsize, maxsize);
    ellipse(mouseX, mouseY, cursize, cursize);
    if (mouseIsPressed) {
        angle += 2*PI/frameRate(); 
    }
}

function changeBG() {
    curBG =[Math.random() * 255, Math.random() * 255, Math.random() * 255]
    background(curBG[0], curBG[1], curBG[2], 128)
}


// Stores a list of values, draws them
// TODO: probably gonna add tentacles to ragdolls for visualization purposes since
// Tentacles are pretty cool lmao
// Use push, pop!
function Tentacle(baseCoord) {
    this.base = baseCoord 
    this.offsets = [] // (dx, dy, )

}

function drawTentacles() {

}

// Initially because of chrome autoplay restrictions...
// Beep on every click adds to the computer-y terminal like theme though
document.addEventListener('mousedown', e => playBoop(220));