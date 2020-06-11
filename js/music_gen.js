const ctx = new (window.AudioContext || window.webkitAudioContext)
const fft = new AnalyserNode(ctx, {fftsize : 2048})
createWaveCanvas({ element: 'section', analyser: fft})

// Vibe mode... make graphics cool!
energy = 0


const major = [0, 2, 4, 5, 7 , 9, 11, 12]
const minor = [0, 2, 3, 5, 7, 8, 10, 12]

const pentatonic = [0, 3, 5, 8, 10]

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
    const a = opts.attack || 0.2
    const d = opts.decay || 0.1
    const s = opts.sustain || 0.1
    const r = opts.release || 0.1

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

function makeMusic(n) {

}

// Because of chrome autoplay restrictions...
document.addEventListener('mousedown', playMusic);
function playMusic() {
    const synth1 = new OscillatorNode(ctx)
    const volume = new GainNode(ctx, {gain : 0.001})
    synth1.connect(volume)
    volume.connect(fft)
    volume.connect(ctx.destination)
    synth1.frequency.setValueAtTime(440, ctx.currentTime)
    synth1.start(ctx.currentTime)
    adsr({"param": volume.gain})
    synth1.stop(ctx.currentTime + 1)
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

function setup() {
    c = createCanvas(800, 800)
    setInterval(changeBG, 1000);
    angle = PI
    tentacles = [] 
}

function draw() {
    cursize = map(sin(angle), -1, 1, minsize, maxsize);
    ellipse(mouseX, mouseY, cursize, cursize);
    if (mouseIsPressed) {
        angle += 2*PI/frameRate() 
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