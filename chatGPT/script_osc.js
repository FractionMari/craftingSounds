// Denne versjonen bruker kromatisk skala og tester en annen type synthese. fm-synthese
// slider to change interval

var slider = document.getElementById("myRange");
var output = document.getElementById("demo");


// Update the current slider value (each time you drag the slider handle)


// Oppretter en Tone.js polysynth
const polySynth = new Tone.PolySynth().toMaster();

// Definerer parametere for Game of Life
let intervalrange;
slider.oninput = function() {
    output.innerHTML = this.value;
  }

const rows = 20;
const cols = 20;
const interval = intervalrange; // Tidsintervall i millisekunder
let isPlaying = false;
let timerId;
// Definerer pentatonisk skala (C pentatonisk)
const pentatonicScale = ['C4', 'C#4', 'D4', 'D#4', 'E4', 'F4', 'F#4', 'G4', 'G#4', 'A4', 'A#4', 'B4', 'C5'];
// Initialiserer Game of Life grid
let grid = new Array(rows).fill(null).map(() => new Array(cols).fill(0));

// Oppretter grid-elementer i HTML
const gridContainer = document.getElementById('grid');
for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.addEventListener('click', () => toggleCell(i, j));
        gridContainer.appendChild(cell);
    }
}

// Opprett event listener for play/pause-knappen
const playPauseButton = document.getElementById('playPause');
playPauseButton.addEventListener('click', togglePlay);

// Opprett event listener for clear-knappen
const clearButton = document.getElementById('clear');
clearButton.addEventListener('click', clearGrid);

// Definerer funksjon for å bytte tilstanden til en celle
function toggleCell(i, j) {
    grid[i][j] = grid[i][j] ? 0 : 1;
    const cell = gridContainer.children[i * cols + j];
    cell.classList.toggle('alive');
}

// Definerer funksjon for å klargjøre gridet
function clearGrid() {
    grid = new Array(rows).fill(null).map(() => new Array(cols).fill(0));
    const cells = document.querySelectorAll('.cell');
    cells.forEach(cell => cell.classList.remove('alive'));
}

// Definerer funksjon for å starte eller pause spill-loopen
function togglePlay() {
    isPlaying = !isPlaying;
    if (isPlaying) {
        playPauseButton.textContent = 'Pause';
        timerId = setInterval(updateGrid, interval);
    } else {
        playPauseButton.textContent = 'Play';
        clearInterval(timerId);
    }
}

// Definerer funksjon for å oppdatere tilstanden til gridet
function updateGrid() {
    let newGrid = new Array(rows).fill(null).map(() => new Array(cols).fill(0));

    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            let neighbors = 0;
            for (let x = -1; x <= 1; x++) {
                for (let y = -1; y <= 1; y++) {
                    if (i + x >= 0 && i + x < rows && j + y >= 0 && j + y < cols) {
                        neighbors += grid[i + x][j + y];
                    }
                }
            }
            neighbors -= grid[i][j];

            if (grid[i][j] === 1 && (neighbors < 2 || neighbors > 3)) {
                newGrid[i][j] = 0;
            } else if (grid[i][j] === 0 && neighbors === 3) {
                newGrid[i][j] = 1;
                // Konverterer vertikale posisjonen til frekvens (basert på C-dur skala)
                const freq = Tone.Frequency('C4').transpose(i);
                const noteIndex = (i + j) % pentatonicScale.length;
                const note = pentatonicScale[noteIndex];
                // Konverterer horisontale posisjonen til reverb-tid (basert på 0-1 området)
                // const reverbTime = Tone.Time(j / cols).toSeconds();
                // Spill tonen med den spesifikke frekvensen og reverb-tiden
                polySynth.triggerAttackRelease(((i + j)*4), '8n');
                console.log("i: ", i);
                console.log("j: ", j);
                console.log("i + j * 4: ", ((i + j)*4));
            } else {
                newGrid[i][j] = grid[i][j];
            }
        }
    }

    // Oppdaterer HTML-grid med ny tilstand
    const cells = document.querySelectorAll('.cell');
    newGrid.forEach((row, i) => {
        row.forEach((cell, j) => {
            if (cell === 1) {
                cells[i * cols + j].classList.add('alive');
            } else {
                cells[i * cols + j].classList.remove('alive');
            }
        });
    });

    grid = newGrid;
}
