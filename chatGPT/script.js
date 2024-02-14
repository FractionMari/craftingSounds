// Oppretter en Tone.js polysynth
const polySynth = new Tone.PolySynth().toDestination();

// Definerer parametere for Game of Life
const rows = 20;
const cols = 20;
const interval = 500; // Tidsintervall i millisekunder
let isPlaying = false;
let timerId;

// Initialiserer Game of Life grid
let grid = new Array(rows).fill(null).map(() => new Array(cols).fill(0));

// Opprettet et array for å holde styr på alle aktive polysynter
let activeSynths = [];

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
                playNote(i, j);
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

// Definerer funksjon for å spille en note
function playNote(i, j) {
    // Konverterer vertikale posisjonen til frekvens (basert på C-dur skala)
    const freq = Tone.Frequency('C4').transpose(i);
    // Konverterer horisontale posisjonen til gain (basert på 0-1 området)
    const gain = j / cols;

    // Opprett en ny synth
    const synth = new Tone.Synth().toDestination();
    // Spill tonen med den spesifikke frekvensen og gain-verdien
    synth.triggerAttackRelease(freq, '8n', undefined, gain);
    
    // Legger den nye polysynten til i listen over aktive polysynter
    activeSynths.push(synth);
    
    // Sletter polysyntene som er ferdige med å spille
    activeSynths = activeSynths.filter(s => !s._synced);
}
