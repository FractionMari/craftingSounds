const frequencySlider = document.getElementById('frequencySlider');
const frequencyDisplay = document.getElementById('frequencyDisplay');
const startStopBtn = document.getElementById('startStopBtn');

let oscillator;
let isPlaying = false;
let audioContext;

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
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    this.oscillatorNode = this.audioContext.createOscillator();
    this.oscillatorNode.connect(this.audioContext.destination);
  }

  setFrequency(frequency) {
    this.frequency = frequency;
    this.oscillatorNode.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
  }

  start() {
    this.oscillatorNode.start();
    this.oscillatorNode.frequency.setValueAtTime(this.frequency, this.audioContext.currentTime);
  }

  stop() {
    this.oscillatorNode.stop();
  }
}
