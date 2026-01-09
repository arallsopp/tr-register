// Get the canvas element and its context
const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');

// Image options (same as before)
const images = {
    image1: {
        name: 'Pub Lunch Landscape',
        src: 'assets/artwork/pub-lunch-landscape-master.png',
        textPosition: {x: 450, y: 850},
        fontSize: '75px'
    },
    image2: {
        name: 'Pub Lunch Portrait',
        src: 'assets/artwork/pub-lunch-portrait-master.png',
        textPosition: {x: 85, y: 1160},
        fontSize: '50px'
    },
    image3: {
        name: 'Road Run',
        src: 'assets/artwork/road-run.png',
        textPosition: {x: 450, y: 850},
        fontSize: '50px'
    }
};

// Dynamically populate the select dropdown with image names
const imageChoiceSelect = document.getElementById('imageChoice');
Object.keys(images).forEach((key) => {
    const option = document.createElement('option');
    option.value = key;
    option.textContent = images[key].name;
    imageChoiceSelect.appendChild(option);
});

// Load custom font
document.fonts.load('75px chalkboard').then(function () {
    document.getElementById('generateBtn').disabled = false;
});

// Helper function to reset the canvas and redraw everything
function redrawCanvas(selectedImage, userText, x, y, rotation, scale) {
    const image = new Image();
    image.src = images[selectedImage].src;

    image.onload = () => {
        // Resize canvas to image size
        canvas.width = image.width;
        canvas.height = image.height;

        // Draw the image
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

        // Set the custom font and text properties
        const fontSize = images[selectedImage].fontSize || '75px';
        ctx.font = `${fontSize} chalkboard`;
        ctx.fillStyle = 'white';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';

        // Apply transformation (scaling, rotation, position)
        ctx.save(); // Save the current state of the context

        // Apply scale and rotation based on slider values
        ctx.translate(x, y); // Move to the text position
        ctx.rotate((rotation * Math.PI) / 180); // Rotate (convert degrees to radians)
        ctx.scale(scale, scale); // Apply scale

        // Draw the text at the transformed position
        ctx.fillText(userText, 0, 0);

        ctx.restore(); // Restore the original context state
    };
}

// Handle Image Choice and Text Generation
document.getElementById('generateBtn').onclick = () => {
    const selectedImage = document.getElementById('imageChoice').value;
    const userText = document.getElementById('userText').value;

    // Get current slider values
    const x = parseFloat(document.getElementById('textX').value);
    const y = parseFloat(document.getElementById('textY').value);
    const rotation = parseFloat(document.getElementById('rotate').value);
    const scale = parseFloat(document.getElementById('scale').value);

    // Redraw the canvas with the selected image, user text, and transformations
    redrawCanvas(selectedImage, userText, x, y, rotation, scale);
};

// Update canvas when slider values change
document.getElementById('textX').addEventListener('input', () => {
    const selectedImage = document.getElementById('imageChoice').value;
    const userText = document.getElementById('userText').value;
    const x = parseFloat(document.getElementById('textX').value);
    const y = parseFloat(document.getElementById('textY').value);
    const rotation = parseFloat(document.getElementById('rotate').value);
    const scale = parseFloat(document.getElementById('scale').value);

    redrawCanvas(selectedImage, userText, x, y, rotation, scale);
});

document.getElementById('textY').addEventListener('input', () => {
    const selectedImage = document.getElementById('imageChoice').value;
    const userText = document.getElementById('userText').value;
    const x = parseFloat(document.getElementById('textX').value);
    const y = parseFloat(document.getElementById('textY').value);
    const rotation = parseFloat(document.getElementById('rotate').value);
    const scale = parseFloat(document.getElementById('scale').value);

    redrawCanvas(selectedImage, userText, x, y, rotation, scale);
});

document.getElementById('rotate').addEventListener('input', () => {
    const selectedImage = document.getElementById('imageChoice').value;
    const userText = document.getElementById('userText').value;
    const x = parseFloat(document.getElementById('textX').value);
    const y = parseFloat(document.getElementById('textY').value);
    const rotation = parseFloat(document.getElementById('rotate').value);
    const scale = parseFloat(document.getElementById('scale').value);

    redrawCanvas(selectedImage, userText, x, y, rotation, scale);
});

document.getElementById('scale').addEventListener('input', () => {
    const selectedImage = document.getElementById('imageChoice').value;
    const userText = document.getElementById('userText').value;
    const x = parseFloat(document.getElementById('textX').value);
    const y = parseFloat(document.getElementById('textY').value);
    const rotation = parseFloat(document.getElementById('rotate').value);
    const scale = parseFloat(document.getElementById('scale').value);

    redrawCanvas(selectedImage, userText, x, y, rotation, scale);
});

// Save the image with the overlay text
document.getElementById('saveBtn').onclick = () => {
    const dataUrl = canvas.toDataURL('image/png');

    // Create a temporary link to trigger the download
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = 'image_with_text.png'; // Name of the downloaded file
    link.click();
};
