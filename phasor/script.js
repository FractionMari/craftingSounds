const frequencySlider = document.getElementById('frequencySlider');
const frequencyDisplay = document.getElementById('frequencyDisplay');
const startStopBtn = document.getElementById('startStopBtn');

let oscillator;
let isPlaying = false;

function startStop() {
  if (isPlaying) {
    oscillator.stop();
    isPlaying = false;
    startStopBtn.textContent = 'Start';
  } else {
    const frequency = parseFloat(frequencySlider.value);
    oscillator = new PhasorOscillator(frequency);
    oscillator.start();
    isPlaying = true;
    startStopBtn.textContent = 'Stop';
  }
}

startStopBtn.addEventListener('click', startStop);

frequencySlider.addEventListener('input', () => {
  frequencyDisplay.textContent = frequencySlider.value;
  if (isPlaying) {
    const frequency = parseFloat(frequencySlider.value);
    oscillator.setFrequency(frequency);
  }
});

class PhasorOscillator {
  constructor(frequency) {
    this.frequency = frequency;
    this.phase = 0;
    this.sampleRate = 44100; // Hz
    this.context = new AudioContext();
    this.gainNode = this.context.createGain();
    this.gainNode.connect(this.context.destination);
  }

  setFrequency(frequency) {
    this.frequency = frequency;
  }

  start() {
    this.intervalId = setInterval(() => {
      const frequencyHz = this.frequency;
      const increment = (2 * Math.PI * frequencyHz) / this.sampleRate;
      this.phase += increment;
      const value = Math.sin(this.phase);
      this.gainNode.gain.value = value;
    }, 1000 / this.sampleRate);
  }

  stop() {
    clearInterval(this.intervalId);
    this.gainNode.gain.value = 0;
  }
}
