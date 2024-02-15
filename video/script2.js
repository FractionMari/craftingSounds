// variabler fra video

let lastFrame = null;
let lastMovementTime = Date.now();

function processFrame() {
    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');
    const context = canvas.getContext('2d');

    canvas.width = 20;
    canvas.height = 20;

    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

    // Convert image to grayscale and increase contrast
    const grayImageData = grayscale(imageData);
    const contrastImageData = increaseContrast(grayImageData);

    // Simplify image to 20x20 pixels
    const simplifiedPixels = simplifyImage(contrastImageData);

    // Draw pixel grid
    updateGrid(simplifiedPixels);
    
    // Check for movement
    const currentFrame = JSON.stringify(simplifiedPixels);
    const now = Date.now();
    const timeDiff = now - lastMovementTime;

    if (currentFrame !== lastFrame) {
        lastMovementTime = now;
        lastFrame = currentFrame;
    } else if (timeDiff >= 500) { // If no movement for half a second
        resetPixelGrid();
    }

    requestAnimationFrame(processFrame);
}

function grayscale(imageData) {
    const grayImageData = new Uint8ClampedArray(imageData.width * imageData.height);

    for (let i = 0; i < imageData.data.length; i += 4) {
        const r = imageData.data[i];
        const g = imageData.data[i + 1];
        const b = imageData.data[i + 2];
        const gray = 0.2126 * r + 0.7152 * g + 0.0722 * b;
        grayImageData[i / 4] = gray;
    }

    return grayImageData;
}

function increaseContrast(imageData) {
    const contrastImageData = new Uint8ClampedArray(imageData.length);

    const min = Math.min(...imageData);
    const max = Math.max(...imageData);

    for (let i = 0; i < imageData.length; i++) {
        contrastImageData[i] = (255 / (max - min)) * (imageData[i] - min);
    }

    return contrastImageData;
}

function simplifyImage(imageData) {
    const threshold = 128;
    const simplifiedPixels = [];

    for (let y = 0; y < 20; y++) {
        for (let x = 0; x < 20; x++) {
            const index = y * 20 + x;
            if (imageData[index] < threshold) {
                simplifiedPixels.push({x, y});
            }
        }
    }

    return simplifiedPixels;
}


function resetPixelGrid() {
    const pixelGrid = document.getElementById('pixel-grid');
    pixelGrid.innerHTML = '';
}

async function startCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        const video = document.getElementById('video');
        video.srcObject = stream;
        video.play();
        processFrame();
    } catch (err) {
        console.error('Error accessing camera: ', err);
    }
}

window.onload = function() {
    startCamera();
};

// Definerer parametere for Game of Life
var slider = document.getElementById("myRange");

const rows = 20;
const cols = 20;
let interval = 500 // Tidsintervall i millisekunder
let isPlaying = false;
let timerId;


//const interval2 = 500;
slider.oninput = function() {
    interval = this.value;
    console.log(this.value);

    }
    console.log(interval);
// Initialiserer Game of Life grid
let grid = new Array(rows).fill(null).map(() => new Array(cols).fill(0));

// Opprettet et array for å holde styr på alle aktive synther
let activeSynths = [];
let availableSynths = [];

// Definerer pentatonisk skala (C pentatonisk)
const pentatonicScale = ['D2', 'E2', 'G2', 'A2', 'C3', 'D3', 'E3', 'G3', 'A3', 'C4', 'D4', 'E4', 'G4', 'A4', 'C5', 'D5', 'E5', 'G5', 'A5', 'C6', ];

// Oppretter grid-elementer i HTML
const gridContainer = document.getElementById('pixel-grid');
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

// Opprett en event listener for glider-knappen
const gliderButton = document.getElementById('glider');
gliderButton.addEventListener('click', drawGlider);

// Tegn inn en glider

function drawGlider(i, j) {

    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {

            //var isLive = Math.round(Math.random());
            //console.log(isLive);
           
            if ((i == 0 && j == 0) || (i == 1 && j == 1) || (i == 1 && j == 2) || (i == 2 && j == 0) || (i == 2 && j == 1)){

                const cell = gridContainer.children[i * cols + j];
                cell.classList.toggle('alive');
                grid[i][j] = 1;
                
            }     
 
        }
    }
}
// Opprett event listener for clear-knappen
const clearButton = document.getElementById('clear');
clearButton.addEventListener('click', clearGrid);

// Definerer funksjon for å bytte tilstanden til en celle
function toggleCell(i, j) {
    grid[i][j] = grid[i][j] ? 0 : 1;
    const cell = gridContainer.children[i * cols + j];
    cell.classList.toggle('alive');
    console.log(i);
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

/*
function drawPixelGrid(simplifiedPixels) {
    const pixelGrid = document.getElementById('pixel-grid');
    pixelGrid.innerHTML = '';

    for (let y = 0; y < 20; y++) {
        for (let x = 0; x < 20; x++) {
            const pixel = document.createElement('div');
            pixel.classList.remove('alive');
            const isActive = simplifiedPixels.some(p => p.x === x && p.y === y);
            if (isActive) {
                pixel.classList.add('alive');
            }
            pixelGrid.appendChild(pixel);
        }
    }
} */

// Definerer funksjon for å oppdatere tilstanden til gridet
function updateGrid(simplifiedPixels) {
    const pixelGrid = document.getElementById('pixel-grid');
    pixelGrid.innerHTML = '';
    let newGrid = new Array(rows).fill(null).map(() => new Array(cols).fill(0));

    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            let neighbors = 0;
            const pixel = document.createElement('div');
            pixel.classList.remove('alive');
            const isActive = simplifiedPixels.some(p => p.i === i && p.j === j);
            if (isActive) {
                pixel.classList.add('alive');
            }
            pixelGrid.appendChild(pixel);
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
                // Finn synth for denne cellen og frigjør den for gjenbruk
                const synthIndex = activeSynths.findIndex(s => s.cellX === i && s.cellY === j);
                if (synthIndex !== -1) {
                    const synth = activeSynths.splice(synthIndex, 1)[0];
                    availableSynths.push(synth);
                }
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
    let synth;
    if (availableSynths.length > 0) {
        // Bruk en tilgjengelig synth hvis tilgjengelig
        synth = availableSynths.pop();
    } else {
        // Opprett en ny synth hvis ingen tilgjengelige synther
        synth = new Tone.Synth().toDestination();
    }

    // Konverterer vertikale posisjonen til noten i pentatonisk skala
    const noteIndex = (i + j) % pentatonicScale.length;
    const note = pentatonicScale[noteIndex];
    // Konverterer horisontale posisjonen til gain (basert på 0-1 området)
    const gain = j / cols;

    // Spill tonen med den spesifikke noten og gain-verdien
    synth.triggerAttackRelease(note, '8n', undefined, gain);

    // Lagre synth-informasjon for senere gjenbruk
    synth.cellX = i;
    synth.cellY = j;
    activeSynths.push(synth);
}
