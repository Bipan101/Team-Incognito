const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let drawing = false;

// Canvas drawing
canvas.addEventListener('mousedown', () => drawing = true);
canvas.addEventListener('mouseup', () => {
    drawing = false;
    ctx.beginPath();
});
canvas.addEventListener('mousemove', draw);

function draw(event) {
    if (!drawing) return;
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.strokeStyle = 'black';

    ctx.lineTo(event.clientX - canvas.offsetLeft, event.clientY - canvas.offsetTop);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(event.clientX - canvas.offsetLeft, event.clientY - canvas.offsetTop);
}

document.getElementById('clear').addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();  // Reset the path to avoid drawing issues
    document.getElementById('result').textContent = '';
});

document.getElementById('predict').addEventListener('click', () => {
    // Capture the canvas content as a data URL
    const dataURL = canvas.toDataURL('image/png');
    console.log('Captured Data URL:', dataURL);  // Log the Data URL

    // Convert the data URL to a Blob
    fetch(dataURL)
        .then(res => res.blob())
        .then(blob => {
            console.log('Blob Info:', blob);  // Log the Blob information

            // Prepare the form data
            const formData = new FormData();
            formData.append('file', blob, 'canvas_image.png');

            // Send the image to the backend for prediction
            fetch('http://localhost:5000/predict', {
                method: 'POST',
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                console.log('Backend Response:', data);  // Log the response from the backend
                document.getElementById('result').textContent = `Prediction: ${data.predicted_class}`;
            })
            .catch(error => {
                console.error('Error:', error);
                document.getElementById('result').textContent = 'Error: Could not get prediction';
            });
        });
});

// Tab switching
const tabButtons = document.querySelectorAll('.tab-button');
const tabContents = document.querySelectorAll('.tab-content');

tabButtons.forEach(button => {
    button.addEventListener('click', () => {
        const target = button.getAttribute('data-tab');
        tabContents.forEach(content => {
            content.style.display = content.id === target ? 'block' : 'none';
        });
    });
});

// Show the "Practice" tab by default
document.querySelector('.tab-button[data-tab="practice"]').click();
