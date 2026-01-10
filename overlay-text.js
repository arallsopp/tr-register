// Get the canvas element and its context
const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');

// Image options (same as before)
const images = {
    image1: {
        name: 'Pub Lunch Landscape',
        src: 'assets/artwork/pub-lunch-landscape-master.png',
        textPosition: {x: 450, y: 850},
        fontSize: '75px',
        lineCount: 1,
        sampleText: "Steve and SaNdra"
    },
    image2: {
        name: 'Pub Lunch Portrait',
        src: 'assets/artwork/pub-lunch-portrait-master.png',
        textPosition: {x: 85, y: 1160},
        fontSize: '50px',
        lineCount: 3,
        sampleText: "Steve and SaNdra\n" +
            "The \"BOTANY BAY INNE\"\n" +
            "12:30 - 22ND FEBRUARY '26"
    },
    image3: {
        name: 'Road Run',
        src: 'assets/artwork/road-run.png',
        textPosition: {x: 609, y: 305},
        fontSize: '50px',
        scale:1.3,
        skewX:0.01,
        skewY:0.08,
        lineHeight: 43,
        font: 'harmattan',
        lineCount: 2,
        sampleText: "BRIAN & LINDA'S\n" +
            "DRIVE IT DAY, APR.  26\n",
        colour: "rgba(255, 255, 255, 0.95)"
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
Promise.all([
    document.fonts.load('75px chalkboard'),
    document.fonts.load('75px harmattan')
]).then(() => {
    document.getElementById('generateBtn').disabled = false;
});

function drawMultilineText(ctx, text, lineHeight) {
    const lines = text.split('\n');
    lines.forEach((line, index) => {
        ctx.fillText(line, 0, index * lineHeight);
    });
    ctx.opacity = 1;
}
// Helper function to redraw with transform
function redrawCanvas(selectedImage, userText, x, y, rotation, scale, skewX, skewY) {
    const image = new Image();
    image.src = images[selectedImage].src;

    image.onload = () => {
        // Resize to the image
        canvas.width = image.width;
        canvas.height = image.height;

        // Draw base image
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

        // Text setup
        const fontSize = images[selectedImage].fontSize || '75px';
        const fontName = images[selectedImage].font || 'chalkboard';
        ctx.font = `${fontSize} ${fontName}`;
        ctx.fillStyle = images[selectedImage].colour || 'white';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';

        ctx.save();

        // Apply all transformations:
        // 1) move to text base location
        // 2) rotate
        // 3) scale
        // 4) skew (shear)
        ctx.translate(x, y);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.scale(scale, scale);

        // Skew: change 2×2 matrix entries to shear the text
        // ctx.transform(a, b, c, d, e, f)
        // Here a=1, d=1 (normal scale),
        // b=skewY, c=skewX (shear factors), e/f = 0
        ctx.transform(1, skewY, skewX, 1, 0, 0);

        // Draw multiline text
        const fontPx = parseInt(fontSize, 10);
        const lineHeight = images[selectedImage].lineHeight || fontPx * 1.2;
        drawMultilineText(ctx, userText, lineHeight);

        ctx.restore();
    };
}

// Call redraw on all slider changes
function loadFromConfig(useSample = false) {
    const selectedImage = imageChoiceSelect.value;
    document.getElementById('textX').value = images[selectedImage].textPosition.x;
    document.getElementById('textY').value = images[selectedImage].textPosition.y;
    document.getElementById('scale').value = images[selectedImage].scale || 1;
    document.getElementById('rotate').value = images[selectedImage].rotate || 0;
    document.getElementById('skewX').value = images[selectedImage].skewX || 0;
    document.getElementById('skewY').value = images[selectedImage].skewY || 0;
    document.getElementById('line-count-preference').textContent =
        images[selectedImage].lineCount
            ? `(prefers ${images[selectedImage].lineCount} line${(images[selectedImage].lineCount > 1 ? 's' : '')})`
            : ''
    if(useSample) {
        document.getElementById('userText').value = images[selectedImage].sampleText || "Your Text Here"
    }
}

function updateAll() {
    const selectedImage = imageChoiceSelect.value;
    const userText = document.getElementById('userText').value;
    const x = parseFloat(document.getElementById('textX').value);
    const y = parseFloat(document.getElementById('textY').value);
    const rotation = parseFloat(document.getElementById('rotate').value);
    const scale = parseFloat(document.getElementById('scale').value);
    const skewX = parseFloat(document.getElementById('skewX').value);
    const skewY = parseFloat(document.getElementById('skewY').value);

    redrawCanvas(selectedImage, userText, x, y, rotation, scale, skewX, skewY);
}

// Attach updateAll to all sliders and buttons
['userText','textX','textY','rotate','scale','skewX','skewY'].forEach(id => {
    document.getElementById(id).addEventListener('input', updateAll);
});

document.getElementById('generateBtn').addEventListener('click', function() {
    updateAll();
});
document.getElementById('imageChoice').addEventListener('click', function() {
    loadFromConfig();
    updateAll();
});
document.getElementById('sampleBtn').addEventListener('click', function() {
    loadFromConfig(true);
    updateAll();
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

// Load the initial image
document.getElementById('imageChoice').click();