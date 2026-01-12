// Get the canvas element and its context
const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');
const OUTPUT_WIDTH = 1360;
const OUTPUT_HEIGHT = 765;

// Image options (refactored)
const images = {
    image1: {
        meta: {
            name: 'Pub Lunch Landscape',
            prompt: '1 line',
            src: 'assets/artwork/pub-lunch-landscape-master.jpg'
        },
        textBlock: {
            transform: {
                position: { x: 450, y: 850 },
                rotate: 0,
                scale: 1,
                skew: { x: 0, y: 0 }
            },
            defaultStyle: {
                font: 'chalkboard',
                size: 75,
                color: 'white',
                align: 'left',
                lineHeight: 90,
                shadow: null
            },
            lines: [
                { text: 'Steve and SaNdra' }
            ]
        }
    },

    image2: {
        meta: {
            name: 'Pub Lunch Portrait',
            prompt: 'up to 4 lines',
            src: 'assets/artwork/pub-lunch-portrait-master.jpg'
        },
        textBlock: {
            transform: {
                position: { x: 85, y: 1160 },
                rotate: 0,
                scale: 1,
                skew: { x: 0, y: 0 }
            },
            defaultStyle: {
                font: 'chalkboard',
                size: 50,
                color: 'white',
                align: 'left',
                lineHeight: 60,
                shadow: null
            },
            lines: [
                { text: 'Steve and SaNdra' },
                { text: '22ND FEBRUARY \'26\n\n' +
                        'The "BOTANY BAY INNE", DT11 9ET',
                    transform: { scale: 0.8 }}
            ]
        }
    },

    image3: {
        meta: {
            name: 'Road Run',
            prompt: '2 lines',
            src: 'assets/artwork/road-run.jpg'
        },
        textBlock: {
            transform: {
                position: { x: 609, y: 305 },
                rotate: 0,
                scale: 1.2,
                skew: { x: 0.01, y: 0.08 }
            },
            defaultStyle: {
                font: 'harmattan',
                size: 50,
                color: 'rgba(251,229,215,0.9)',
                align: 'left',
                lineHeight: 43,
                shadow: null
            },
            lines: [
                { text: "BRIAN AND LINDA'S" },
                { text: 'DRIVE IT DAY, APR.  26' }
            ]
        }
    },

    image4: {
        meta: {
            name: 'Monthly Meeting',
            prompt: '1 line',
            src: 'assets/artwork/monthly-meeting.jpg'
        },
        textBlock: {
            transform: {
                position: { x: 770, y: 385 },
                rotate: 0,
                scale: 1,
                skew: { x: 0, y: 0 }
            },
            defaultStyle: {
                font: 'harmattan',
                size: 50,
                color: 'rgb(244,235,194)',
                align: 'center',
                lineHeight: 43,
                shadow: {
                    shadowColor: 'rgba(0,0,0,1)',
                    shadowBlur: 6,
                    shadowOffsetX: 1,
                    shadowOffsetY: 1
                }
            },
            lines: [
                { text: 'FEBRUARY 12TH' }
            ]
        }
    },

    image5: {
        meta: {
            name: 'Generic Driving',
            prompt: '2 lines',
            src: 'assets/artwork/corfe-drive.jpg'
        },
        textBlock: {
            transform: {
                position: { x: 755, y: 801 },
                rotate: 0,
                scale: 1.1,
                skew: { x: 0, y: 0 }
            },
            defaultStyle: {
                font: 'harmattan',
                size: 50,
                color: 'rgba(255,255,255,0.95)',
                align: 'left',
                lineHeight: 43,
                shadow: null
            },
            lines: [
                { text: 'LULWORTH MAY        17' },
                { text: 'BRESSUIRE JUNE       21' }
            ]
        }
    },

    image6: {
        meta: {
            name: 'Racing',
            prompt: '2 lines',
            src: 'assets/artwork/racing-tr3.jpg'
        },
        textBlock: {
            transform: {
                position: { x: 1310, y: 82 },
                rotate: 0,
                scale: 1.5,
                skew: { x: 0, y: 0 }
            },
            defaultStyle: {
                font: 'racing',
                size: 50,
                color: 'rgb(38,62,47)',
                align: 'right',
                lineHeight: 43,
                shadow: null
            },
            lines: [
                { text: 'Thruxton Retro' },
                {
                    text: '3rd - 5th July 2026',
                    transform: { scale: 0.7 }
                }
            ]
        }
    },
    image7: {
        meta: {
            name: 'Dorset Postcard',
            prompt: '2 lines',
            src: 'assets/artwork/dorset-cliffs-pub-track.jpg'
        },
        textBlock: {
            transform: {
                position: { x: 716, y: 90 },
                rotate: 0,
                scale: 2.5,
                skew: { x: 0, y: 0 }
            },
            defaultStyle: {
                font: 'Damion',
                size: 50,
                color: 'rgb(28,41,25)',
                align: 'center',
                lineHeight: 43,
                shadow: null
            },
            lines: [
                { text: 'Thruxton Retro' },
                {
                    text: '3rd - 5th July 2026',
                    transform: { scale: 0.7 }
                }
            ]
        }
    },
    upload: {
        meta: {
            name: 'Uploaded Image',
            sourceType: 'upload'
        },
        overlay: {
            enabled: true,
            src: 'assets/overlays/redpost.png',
            scale: 1,
            padding: 0,           // only used if you want a margin from bottom-right
            textOffset: { x: 0, y: 0 } // position of text relative to overlay's top-left
        },
        textBlock: {
            transform: {
                position: { x: 200, y: 200 },
                rotate: 0,
                scale: 1,
                skew: { x: 0, y: 0 }
            },
            defaultStyle: {
                font: 'harmattan',
                size: 50,
                color: 'white',
                align: 'left',
                lineHeight: 50,
                shadow: null
            },
            lines: [
                { text: 'Your Text Here' }
            ]
        }
    }
};

// Load custom font
Promise.all([
    document.fonts.load('75px chalkboard'),
    document.fonts.load('75px harmattan'),
    document.fonts.load('75px racing'),
    document.fonts.load('75px Damion')
]);

function resolveLinesWithInheritance(configLines, userText) {
    if (!userText) return configLines;

    const textLines = userText.split('\n');

    return textLines.map((text, i) => {
        const baseLine =
            configLines[i] ??
            configLines[configLines.length - 1] ??
            {};

        return {
            ...baseLine,
            transform: baseLine.transform
                ? { ...baseLine.transform }
                : undefined,
            style: baseLine.style
                ? { ...baseLine.style }
                : undefined,
            text
        };
    });
}
function renderTextBlock(ctx, block, userTextOverride) {
    const { transform, defaultStyle, lines } = block;

    ctx.save();

    ctx.translate(transform.position.x, transform.position.y);
    ctx.rotate((transform.rotate || 0) * Math.PI / 180);
    ctx.scale(transform.scale || 1, transform.scale || 1);

    if (transform.skew) {
        ctx.transform(1, transform.skew.y || 0, transform.skew.x || 0, 1, 0, 0);
    }

    ctx.textAlign = defaultStyle.align;
    ctx.textBaseline = 'middle';

    const activeLines = resolveLinesWithInheritance(lines, userTextOverride);

    activeLines.forEach((line, index) => {
        const style = { ...defaultStyle, ...line.style };
        const lineTransform = line.transform || {};

        ctx.save();

        if (lineTransform.scale) {
            ctx.scale(lineTransform.scale, lineTransform.scale);
        }

        ctx.font = `${style.size}px ${style.font}`;
        ctx.fillStyle = style.color;

        if (style.shadow) {
            Object.assign(ctx, style.shadow);
        } else {
            ctx.shadowColor = 'transparent';
        }

        ctx.fillText(
            line.text,
            0,
            index * style.lineHeight
        );

        ctx.restore();
    });

    ctx.restore();
}


function renderImage(imageConfig, userText) {
    const baseImage = getBaseImage(imageConfig);
    if (!baseImage) return;

    const draw = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Set canvas size first
        if (imageConfig.meta.sourceType === 'upload') {
            canvas.width = OUTPUT_WIDTH;
            canvas.height = OUTPUT_HEIGHT;

            drawUploadedImageCrop(
                ctx,
                baseImage,
                canvas.width,
                canvas.height,
                uploadCrop
            );
        } else {
            canvas.width = baseImage.naturalWidth;
            canvas.height = baseImage.naturalHeight;
            ctx.drawImage(baseImage, 0, 0);
        }

        // Add the overlay
        if (imageConfig.overlay?.enabled) {
            drawOverlay(imageConfig);
        }

        // Apply the text
        renderTextBlock(ctx, imageConfig.textBlock, userText);
    };

    if (baseImage.complete && baseImage.naturalWidth) {
        draw();
    } else {
        baseImage.onload = draw;
    }
}

const overlayCache = {};

function drawOverlay(imageConfig) {
    const overlay = imageConfig.overlay;
    if (!overlay?.enabled || !overlay.src) return;

    if (!overlayCache[overlay.src]) {
        const img = new Image();
        img.src = overlay.src;
        overlayCache[overlay.src] = img;
    }

    const img = overlayCache[overlay.src];
    if (!img.complete || !img.naturalWidth) {
        img.onload = () => updateAll();
        return;
    }

    // 🔑 Use the SAME scale as the text block
    const scale = imageConfig.textBlock.transform.scale || 1;
    const padding = overlay.padding ?? 0;

    const w = img.naturalWidth * scale;
    const h = img.naturalHeight * scale;

    const x = canvas.width - w - padding;
    const y = canvas.height - h - padding;

    ctx.save();

    // 🔒 Reset all transforms so anchoring is absolute
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    ctx.drawImage(img, x, y, w, h);

    ctx.restore();
}









// UI Wiring
const imageChoiceSelect = document.getElementById('imageChoice');

Object.entries(images).forEach(([key, img]) => {
    const option = document.createElement('option');
    option.value = key;
    option.textContent = img.meta.name;
    imageChoiceSelect.appendChild(option);
});

function loadFromConfig(useSample = false) {
    const img = images[imageChoiceSelect.value];
    const t = img.textBlock.transform;

    textX.value = t.position.x;
    textY.value = t.position.y;
    scale.value = t.scale || 1;
    rotate.value = t.rotate || 0;
    skewX.value = t.skew?.x || 0;
    skewY.value = t.skew?.y || 0;

    if (useSample) {
        userText.value = img.textBlock.lines.map(l => l.text).join('\n');
    }
    userText.style.textAlign = img.textBlock.defaultStyle.align;


    document.getElementById('line-count-preference').textContent =
        img.meta.prompt ? `(${img.meta.prompt})` : '';

}

function updateAll() {
    const img = images[imageChoiceSelect.value];
    const t = img.textBlock.transform;

    t.position.x = parseFloat(textX.value);
    t.position.y = parseFloat(textY.value);
    t.scale = parseFloat(scale.value);
    t.rotate = parseFloat(rotate.value);
    t.skew.x = parseFloat(skewX.value);
    t.skew.y = parseFloat(skewY.value);

    renderImage(img, userText.value);
}

const uploadCrop = {
    offsetX: 0.5, // 0 = left, 0.5 = center, 1 = right
    offsetY: 0.5  // 0 = top,  0.5 = center, 1 = bottom
}

function drawUploadedImageCrop(ctx, img, cw, ch, crop) {
    const imgW = img.naturalWidth;
    const imgH = img.naturalHeight;

    const canvasAspect = cw / ch;
    const imgAspect = imgW / imgH;

    let cropW, cropH;

    if (imgAspect > canvasAspect) {
        // Image wider than 16:9 → crop width
        cropH = imgH;
        cropW = cropH * canvasAspect;
    } else {
        // Image taller than 16:9 → crop height
        cropW = imgW;
        cropH = cropW / canvasAspect;
    }

    // Max movement range
    const maxX = imgW - cropW;
    const maxY = imgH - cropH;

    // Apply normalized offsets
    const sx = maxX * crop.offsetX;
    const sy = maxY * crop.offsetY;

    ctx.drawImage(
        img,
        sx, sy, cropW, cropH, // source crop
        0, 0, cw, ch          // destination
    );
}


const imageCache = {};

//use imageCache to avoid reloading all the time.
function getBaseImage(imageConfig) {
    if (imageConfig.meta.sourceType === 'upload') {
        return uploadedImage;
    }

    if (!imageCache[imageConfig.meta.src]) {
        const img = new Image();
        img.src = imageConfig.meta.src;
        imageCache[imageConfig.meta.src] = img;
    }

    return imageCache[imageConfig.meta.src];
}

/* handle events */
['userText','textX','textY','rotate','scale','skewX','skewY'].forEach(id => {
    document.getElementById(id).addEventListener('input', updateAll);
});

imageChoiceSelect.addEventListener('change', () => {
    document.getElementById("imageUploadOptions").classList
        .toggle('visually-hidden', images[imageChoiceSelect.value].meta.sourceType !== 'upload');

    loadFromConfig(true);
    updateAll();
});

//save button
document.getElementById('saveBtn').onclick = () => {
    ctx.save();
    ctx.globalCompositeOperation = 'destination-over';
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();

    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = 'image_with_text.jpg';
    link.click();
};

//upload image
let uploadedImage = null;
const uploadInput = document.getElementById('imageUpload');

uploadInput.addEventListener('change', () => {
    const file = uploadInput.files[0];
    if (!file) return;

    const img = new Image();

    img.onload = () => {
        uploadedImage = img;
        updateAll();
    };

    img.src = URL.createObjectURL(file);
});

const overlayToggle = document.getElementById('overlayToggle');
overlayToggle.addEventListener('change', () => {
    const img = images[imageChoiceSelect.value];
    if (img.overlay) {
        img.overlay.enabled = overlayToggle.checked;
        updateAll();
    }
});

cropX.addEventListener('input', () => {
    uploadCrop.offsetX = parseFloat(cropX.value);
    updateAll();
});

cropY.addEventListener('input', () => {
    uploadCrop.offsetY = parseFloat(cropY.value);
    updateAll();
});

//handle initial load
imageChoiceSelect.dispatchEvent(new Event('change'));

