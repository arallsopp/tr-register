
// Get the canvas element and its context
const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');

// Image options
const images = {
    image1: {
        src: 'assets/artwork/pub-lunch-landscape-master.png',
        textPosition: {x: 450, y: 850} // X/Y coordinates for Image 1
    },
    image2: {
        src: 'assets/artwork/pub-lunch-portrait-master.png',
        textPosition: {x: 85, y: 1160} // X/Y coordinates for Image 2
    }
};

// Load custom font
document.fonts.load('75px chalkboard').then(function () {
    // Wait for font to load before enabling the Generate button
    document.getElementById('generateBtn').disabled = false;
});

// Handle Image Choice and Text Generation
document.getElementById('generateBtn').onclick = () => {
    const selectedImage = document.getElementById('imageChoice').value;
    const userText = document.getElementById('userText').value;

    const image = new Image();
    image.src = images[selectedImage].src;

    image.onload = () => {
        // Resize canvas to image size
        canvas.width = image.width;
        canvas.height = image.height;

        // Draw the image on the canvas
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

        // Set the custom font for the text
        ctx.font = '75px chalkboard'; // Use custom font
        ctx.fillStyle = 'white'; // Text color
        ctx.textAlign = 'left'; // Align text horizontally
        ctx.textBaseline = 'middle'; // Center text vertically

        // Get X/Y for the selected image and place text
        const textPosition = images[selectedImage].textPosition;
        ctx.fillText(userText, textPosition.x, textPosition.y);
    };
};

// Save the image with the overlay text
document.getElementById('saveBtn').onclick = () => {
    const dataUrl = canvas.toDataURL('image/png');

    // Create a temporary link to trigger the download
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = 'image_with_text.png'; // Name of the downloaded file
    link.click();
};
