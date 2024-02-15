
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
            drawPixelGrid(simplifiedPixels);
            
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

        function drawPixelGrid(simplifiedPixels) {
            const pixelGrid = document.getElementById('pixel-grid');
            pixelGrid.innerHTML = '';

            for (let y = 0; y < 20; y++) {
                for (let x = 0; x < 20; x++) {
                    const pixel = document.createElement('div');
                    pixel.className = 'pixel';
                    const isActive = simplifiedPixels.some(p => p.x === x && p.y === y);
                    if (isActive) {
                        pixel.style.backgroundColor = 'black';
                    }
                    pixelGrid.appendChild(pixel);
                }
            }
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