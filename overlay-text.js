// Get the canvas element and its context
const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');
const OUTPUT_WIDTH = 1360;
const OUTPUT_HEIGHT = 765;

// grab the controls
const textX = document.getElementById('textX'),
    textY = document.getElementById('textY'),
    scale= document.getElementById('scale'),
    overlayOffsetX = document.getElementById('overlayOffsetX'),
    overlayOffsetY = document.getElementById('overlayOffsetY'),
    overlayScale = document.getElementById('overlayScale'),
    imageChoiceSelect = document.getElementById('imageChoice'),
    uploadInput = document.getElementById('imageUpload'),
    overlayToggle = document.getElementById('overlayToggle'),
    cropX = document.getElementById('cropX'),
    cropY = document.getElementById('cropY');

//support upload image and utilise cache to avoid constant reloads.
const imageCache = {};
let uploadedImage = null;

// Load custom fonts before we start rendering.
Promise.all([
    document.fonts.load('75px chalkboard'),
    document.fonts.load('75px Harmattan'),
    document.fonts.load('75px Racing Sans One'),
    document.fonts.load('75px Damion')
]).then(() => {
    //fonts are ready, we can render.
    updateFormValuesFromURLParams();
});

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

function drawPerspectiveText(ctx, text, style, perspective, y) {
    const {
        leftScale = 0.7,
        rightScale = 1,
        skewX = 0,
        skewY = 0
    } = perspective;

    const chars = [...text];
    const charCount = chars.length;

    // Measure each character once
    const baseWidths = chars.map(c =>
        ctx.measureText(c).width
    );

    let x = 0;

    chars.forEach((char, i) => {
        const t = charCount === 1 ? 0 : i / (charCount - 1);
        const scale = leftScale + t * (rightScale - leftScale);

        const charWidth = baseWidths[i] * scale;

        ctx.save();

        // Move to character origin
        ctx.translate(x, y);

        // Apply perspective
        ctx.transform(
            scale,      // scale X
            skewY,      // skew Y
            skewX,      // skew X
            scale,      // scale Y
            0,
            0
        );

        ctx.fillText(char, 0, 0);

        ctx.restore();

        // Amount of ADVANCE is SCALED
        x += charWidth;
    });
}
function renderTextBlock(ctx, block, userTextOverride) {
    const { transform, defaultStyle, lines } = block;
    const blockScale = transform.scale || 1;

    ctx.save();

    ctx.translate(transform.position.x, transform.position.y);
    ctx.rotate((transform.rotate || 0) * Math.PI / 180);
    ctx.scale(transform.scale || 1, transform.scale || 1);

    if (transform.skew) {
        ctx.transform(1, transform.skew.y || 0, transform.skew.x || 0, 1, 0, 0);
    }

    ctx.textAlign = defaultStyle.align;
    ctx.textBaseline = 'alphabetic'; //try to stabilise Y position on iOS/Safari

    const activeLines = resolveLinesWithInheritance(lines, userTextOverride);

    let y = 0;

    activeLines.forEach(line => {
        const style = { ...defaultStyle, ...line.style };
        const scale = line.transform?.scale ?? 1;

        ctx.save();
        ctx.scale(scale, scale);

        ctx.font = `${style.size}px ${style.font}`;
        ctx.fillStyle = style.color;

        if (style.shadow) {
            ctx.shadowColor = style.shadow.shadowColor;
            ctx.shadowOffsetX = (style.shadow.shadowOffsetX || 0) * blockScale;
            ctx.shadowOffsetY = (style.shadow.shadowOffsetY || 0) * blockScale;
            ctx.shadowBlur     = (style.shadow.shadowBlur || 0) * blockScale;
        } else {
            ctx.shadowColor = 'transparent';
        }

        const baselineAdjust = style.size * 0.35
        if (block.perspective?.enabled) {
            // fake perspective/fontsize renderer
            drawPerspectiveText(ctx, line.text, style, block.perspective, (y / scale) + baselineAdjust);
        } else {
            // normal renderer
            ctx.fillText(line.text, 0, (y / scale) + baselineAdjust);
        }
        ctx.restore();
        y += style.lineHeight * scale;
    });

    ctx.restore();
}

// Function to get URL parameters
function getUrlParams() {
    const params = new URLSearchParams(window.location.search);
    return {
        image: params.get('image'),
        text: params.get('text')
    };
}

// Function to update the select and textarea elements
function updateFormValuesFromURLParams(){
    const { image, text } = getUrlParams();

    if (image) {
        // Set the image selection
        const imageChoice = document.getElementById('imageChoice');
        const imageOption = [...imageChoice.options].find(option => option.value === image);
        if (imageOption) {
            imageChoice.value = imageOption.value;
        }
        imageChoice.dispatchEvent(new Event('change'));
    }

    if (text) {
        // Set the textarea value, preserving spaces and newlines
        const textarea = document.getElementById('userText');
        textarea.value = decodeURIComponent(text);
        textarea.dispatchEvent(new Event('input'));
    }

}

function renderImage(imageConfig, userText) {
    const baseImage = getBaseImage(imageConfig);
    if (!baseImage){
        console.log('baseImage is not ready yet');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    const draw = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // -------------------------
        // 1 Base image
        // -------------------------
        if (imageConfig.meta.sourceType === 'upload') {
            canvas.width = OUTPUT_WIDTH;
            canvas.height = OUTPUT_HEIGHT;

            if(baseImage) {
                drawUploadedImageCrop(
                    ctx,
                    baseImage,
                    canvas.width,
                    canvas.height,
                    uploadCrop
                );
            }else{
                //baseImage isn't set yet, so just draw a black box.
                ctx.fillStyle = 'black';
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                //and add instructions
                ctx.fillStyle = 'white';
                ctx.font = '40px Racing Sans One';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('{awaiting image selection}', canvas.width / 2, canvas.height / 2);
            }
        } else {
            canvas.width = baseImage.naturalWidth;
            canvas.height = baseImage.naturalHeight;
            ctx.drawImage(baseImage, 0, 0);
        }

        // -------------------------
        // 2 Overlay + bound text
        // -------------------------
        if (imageConfig.overlay?.enabled) {
            const overlay = imageConfig.overlay;

            if (!overlayCache[overlay.src]) {
                const img = new Image();
                img.src = overlay.src;
                overlayCache[overlay.src] = img;
            }

            const overlayImg = overlayCache[overlay.src];
            if (!overlayImg.complete || !overlayImg.naturalWidth) {
                overlayImg.onload = () => updateAll();
                return;
            }

            // ---- draw overlay ----
            const scale = imageConfig.overlay.scale || 1;

            const w = overlayImg.naturalWidth * scale;
            const h = overlayImg.naturalHeight * scale;

            // 🔑 Bottom-right–relative positioning
            const offset = overlay.offset || { x: 0, y: 0 };

            const x = canvas.width - w - offset.x;
            const y = canvas.height - h - offset.y;

            ctx.save();
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.drawImage(overlayImg, x, y, w, h);
            ctx.restore();

            // ---- draw text relative to overlay ----
            const textOffset = overlay.textOffset || { x: 0, y: 0 };

            const textBlock = imageConfig.textBlock;

            renderTextBlock(ctx, {
                ...textBlock,
                transform: {
                    ...textBlock.transform,
                    position: {
                        x: x + textOffset.x * scale,
                        y: y + textOffset.y * scale
                    },
                    scale
                }
            }, userText);

        } else {
            // -------------------------
            // 3 Text only (no overlay)
            // -------------------------
            renderTextBlock(ctx, imageConfig.textBlock, userText);
        }
    };

    if(baseImage) {
        if (baseImage.complete && baseImage.naturalWidth) {
            draw();
        } else {
            baseImage.onload = draw;
        }
    }else{
        //baseImage isn't set yet.
        draw();
    }
}


const overlayCache = {};

// UI Wiring

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

    overlayToggle.checked = img.overlay?.enabled || 0
    overlayOffsetX.value = img.overlay?.offset?.x || 0;
    overlayOffsetY.value = img.overlay?.offset?.y || 0;
    overlayScale.value = img.overlay?.scale || 1;

    if (useSample) {
        userText.value = img.textBlock.lines.map(l => l.text).join('\n');
    }
    userText.style.textAlign = img.textBlock.defaultStyle.align;

    document.getElementById('line-count-preference').textContent =
        img.meta.prompt ? `(${img.meta.prompt})` : '';

    overlayToggle.dispatchEvent(new Event('change'));

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
        cropH = imgH;
        cropW = cropH * canvasAspect;
    } else {
        cropW = imgW;
        cropH = cropW / canvasAspect;
    }

    //update controls as we go past
    cropX.disabled = !(imgAspect > canvasAspect);
    cropY.disabled = (imgAspect >= canvasAspect);


    const maxX = imgW - cropW;
    const maxY = imgH - cropH;

    const sx = maxX * crop.offsetX;
    const sy = maxY * crop.offsetY;

    ctx.drawImage(img, sx, sy, cropW, cropH, 0, 0, cw, ch);
}

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

function updateUX() {
    // show/hide upload-only elements based upon image selection
    const uploadOnlyElements = document.getElementsByClassName("upload-only");
    for (let element of uploadOnlyElements) {
        element.classList.toggle('visually-hidden', images[imageChoiceSelect.value].meta.sourceType !== 'upload');
    }
}

/* handle events */
['userText','rotate','skewX','skewY'].forEach(id => {
    document.getElementById(id).addEventListener('input', updateAll);
});

textX.addEventListener('input', () => {
    const img = images[imageChoiceSelect.value];
    img.textBlock.transform.position.x = parseFloat(textX.value);
    updateAll();
});

textY.addEventListener('input', () => {
    const img = images[imageChoiceSelect.value];
    img.textBlock.transform.position.y = parseFloat(textY.value);
    updateAll();
});
overlayOffsetX.addEventListener('input', () => {
    const img = images[imageChoiceSelect.value];
    img.overlay.offset.x = parseFloat(overlayOffsetX.value);
    console.log(img.overlay.offset);
    updateAll();
});
overlayOffsetY.addEventListener('input', () => {
    const img = images[imageChoiceSelect.value];
    img.overlay.offset.y = parseFloat(overlayOffsetY.value);
    console.log(img.overlay.offset);
    updateAll();
});
overlayScale.addEventListener('input', () => {
    const img = images[imageChoiceSelect.value];
    img.overlay.scale = parseFloat(overlayScale.value);
    updateAll();
})
scale.addEventListener('input', () => {
    const img = images[imageChoiceSelect.value];
    img.textBlock.transform.scale = parseFloat(scale.value);
    updateAll();
});

imageChoiceSelect.addEventListener('change', () => {
    updateUX();
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
uploadInput.addEventListener('change', () => {
    const file = uploadInput.files[0];
    if (!file){
        console.log('no file');
        return;
    }

    const img = new Image();

    img.onload = () => {
        uploadedImage = img;
        updateAll();
    };

    img.src = URL.createObjectURL(file);
});

overlayToggle.addEventListener('change', () => {
    const img = images[imageChoiceSelect.value];
    if (img.overlay) {
        img.overlay.enabled = overlayToggle.checked;
        updateAll();
    }

    //update the UI
    const overlayOnlyInputs = document.querySelectorAll(".overlay-only input"),
          nonOverlayInputs = document.querySelectorAll(".non-overlay input");

    for (let element of overlayOnlyInputs) {
        element.disabled = !overlayToggle.checked;
    }
    for (let element of nonOverlayInputs) {
        element.disabled = overlayToggle.checked;
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

