// Get the canvas element and its context
const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');
const OUTPUT_WIDTH = 1360;
const OUTPUT_HEIGHT = 765;

// grab the controls
const textX = document.getElementById('textX'),
    textY = document.getElementById('textY'),
    scale = document.getElementById('scale'),
    overlayOffsetX = document.getElementById('overlayOffsetX'),
    overlayOffsetY = document.getElementById('overlayOffsetY'),
    overlayScale = document.getElementById('overlayScale'),
    imageChoiceSelect = document.getElementById('imageChoice'),
    uploadInput = document.getElementById('imageUpload'),
    overlayToggle = document.getElementById('overlayToggle'),
    cropX = document.getElementById('cropX'),
    cropY = document.getElementById('cropY'),
    shadowToggle = document.getElementById('shadowToggle');


// NEW: Perspective controls
const perspectiveToggle = document.getElementById('perspectiveToggle'),
    perspectiveEditMode = document.getElementById('perspectiveEditMode'),
    cornerTLX = document.getElementById('cornerTLX'),
    cornerTLY = document.getElementById('cornerTLY'),
    cornerTRX = document.getElementById('cornerTRX'),
    cornerTRY = document.getElementById('cornerTRY'),
    cornerBRX = document.getElementById('cornerBRX'),
    cornerBRY = document.getElementById('cornerBRY'),
    cornerBLX = document.getElementById('cornerBLX'),
    cornerBLY = document.getElementById('cornerBLY');

// NEW: Perspective state
const distortionMode = document.getElementById('distortionMode');
let editMode = false;
let draggingCorner = null;
const handleRadius = 8;

//support upload image and utilise cache to avoid constant reloads.
const imageCache = {};
let uploadedImage = null;

// NEW: Store original image configurations for reset
const originalImages = JSON.parse(JSON.stringify(images));

// Load custom fonts before we start rendering.
Promise.all([
    document.fonts.load('75px chalkboard'),
    document.fonts.load('75px Harmattan'),
    document.fonts.load('75px Racing Sans One'),
    document.fonts.load('75px Damion')
]).then(() => {
    console.log('All fonts loaded');
    //fonts are ready, we can render.
    updateFormValuesFromURLParams();
}).catch(err => {
    console.error('Error loading fonts:', err);
    // Still try to render even if fonts fail
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

// NEW: Perspective transformation functions
function lerp2D(p1, p2, t) {
    return {
        x: p1.x + (p2.x - p1.x) * t,
        y: p1.y + (p2.y - p1.y) * t
    };
}

function drawAffineQuad(sourceCanvas, src, dst) {
    const x0 = src[0].x, y0 = src[0].y;
    const x1 = src[1].x, y2 = src[3].y;

    const dx0 = dst[0].x, dy0 = dst[0].y;
    const dx1 = dst[1].x, dy1 = dst[1].y;
    const dx2 = dst[3].x, dy2 = dst[3].y;

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(dst[0].x, dst[0].y);
    ctx.lineTo(dst[1].x, dst[1].y);
    ctx.lineTo(dst[2].x, dst[2].y);
    ctx.lineTo(dst[3].x, dst[3].y);
    ctx.closePath();
    ctx.clip();

    const a = (dx1 - dx0) / (x1 - x0);
    const b = (dy1 - dy0) / (x1 - x0);
    const c = (dx2 - dx0) / (y2 - y0);
    const d = (dy2 - dy0) / (y2 - y0);
    const e = dx0 - a * x0 - c * y0;
    const f = dy0 - b * x0 - d * y0;

    ctx.transform(a, b, c, d, e, f);
    ctx.drawImage(sourceCanvas, 0, 0);
    ctx.restore();
}

function subdivideAndDraw(sourceCanvas, src, dst, subdivisions) {
    for (let i = 0; i < subdivisions; i++) {
        for (let j = 0; j < subdivisions; j++) {
            const u0 = i / subdivisions;
            const u1 = (i + 1) / subdivisions;
            const v0 = j / subdivisions;
            const v1 = (j + 1) / subdivisions;

            const srcQuad = [
                lerp2D(lerp2D(src[0], src[1], u0), lerp2D(src[3], src[2], u0), v0),
                lerp2D(lerp2D(src[0], src[1], u1), lerp2D(src[3], src[2], u1), v0),
                lerp2D(lerp2D(src[0], src[1], u1), lerp2D(src[3], src[2], u1), v1),
                lerp2D(lerp2D(src[0], src[1], u0), lerp2D(src[3], src[2], u0), v1)
            ];

            const dstQuad = [
                lerp2D(lerp2D(dst[0], dst[1], u0), lerp2D(dst[3], dst[2], u0), v0),
                lerp2D(lerp2D(dst[0], dst[1], u1), lerp2D(dst[3], dst[2], u1), v0),
                lerp2D(lerp2D(dst[0], dst[1], u1), lerp2D(dst[3], dst[2], u1), v1),
                lerp2D(lerp2D(dst[0], dst[1], u0), lerp2D(dst[3], dst[2], u0), v1)
            ];

            drawAffineQuad(sourceCanvas, srcQuad, dstQuad);
        }
    }
}

function drawPerspectiveTextBlock(ctx, textBlock, userText, corners) {
    const { defaultStyle, lines, perspective } = textBlock;
    const activeLines = resolveLinesWithInheritance(lines, userText);

    // Create temporary canvas for the text
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');

    // Measure total text dimensions
    let maxWidth = 0;
    let totalHeight = 0;
    const lineMetrics = [];

    activeLines.forEach(line => {
        const style = { ...defaultStyle, ...line.style };
        const scale = line.transform?.scale ?? 1;

        tempCtx.font = `${style.size}px ${style.font}`;
        const metrics = tempCtx.measureText(line.text);
        const width = metrics.width * scale;
        const height = style.lineHeight * scale;

        lineMetrics.push({ width, height, style, scale, text: line.text });
        maxWidth = Math.max(maxWidth, width);
        totalHeight += height;
    });

    // Use fixed maxWidth if specified in perspective config
    if (perspective?.maxWidth) {
        maxWidth = perspective.maxWidth;
    }

    // Use fixed maxLines if specified - add extra height for missing lines
    if (perspective?.maxLines && activeLines.length < perspective.maxLines) {
        const missingLines = perspective.maxLines - activeLines.length;
        const lastLineHeight = lineMetrics.length > 0
            ? lineMetrics[lineMetrics.length - 1].height
            : defaultStyle.size * 1.2;
        totalHeight += missingLines * lastLineHeight;
    }

    // Add padding to prevent clipping
    const padding = 20;

    // Set temp canvas size with padding
    tempCanvas.width = maxWidth + padding * 2;
    tempCanvas.height = totalHeight + padding * 2;

    // Draw text to temp canvas - using alphabetic baseline for iOS consistency
    tempCtx.textAlign = defaultStyle.align;
    tempCtx.textBaseline = 'alphabetic';  // Changed back to alphabetic for iOS

    const shadowEnabled = defaultStyle.shadow.enabled;

    let y = padding;
    lineMetrics.forEach(line => {
        tempCtx.save();
        tempCtx.scale(line.scale, line.scale);
        tempCtx.font = `${line.style.size}px ${line.style.font}`;
        tempCtx.fillStyle = line.style.color;

        if (line.style.shadow && shadowEnabled) {
            tempCtx.shadowColor = line.style.shadow.shadowColor;
            tempCtx.shadowOffsetX = line.style.shadow.shadowOffsetX || 0;
            tempCtx.shadowOffsetY = line.style.shadow.shadowOffsetY || 0;
            tempCtx.shadowBlur = line.style.shadow.shadowBlur || 0;
        }

        // iOS baseline adjustment
        const baselineAdjust = line.style.size * 0.35;

        let textX = padding / line.scale;

        if (defaultStyle.align === 'center') {
            textX = tempCanvas.width / 2 / line.scale;
        } else if (defaultStyle.align === 'right') {
            textX = (tempCanvas.width - padding) / line.scale;
        }

        tempCtx.fillText(line.text, textX, (y / line.scale) + baselineAdjust);
        tempCtx.restore();

        y += line.height;
    });

    // Source rectangle
    const src = [
        {x: 0, y: 0},
        {x: tempCanvas.width, y: 0},
        {x: tempCanvas.width, y: tempCanvas.height},
        {x: 0, y: tempCanvas.height}
    ];

    // Apply perspective transformation
    subdivideAndDraw(tempCanvas, src, corners, 10);
}

function drawPerspectiveText(ctx, text, style, perspective, y) {
    const {
        increment = 1.1,
        skewX = 0,
        skewY = 0
    } = perspective;

    const chars = [...text];
    const baseWidths = chars.map(c => ctx.measureText(c).width);

    let x = 0,
        increment_at_position = 1;

    chars.forEach((char, i) => {
        const scale = increment_at_position;
        const charWidth = baseWidths[i] * scale;

        ctx.save();
        ctx.translate(x, y);
        ctx.transform(0.9 * scale, skewY, skewX, scale, 0, 0);
        ctx.fillText(char, 0, 0);
        ctx.restore();

        x += charWidth;
        increment_at_position += increment;
    });
}

function renderTextBlock(ctx, block, userTextOverride) {
    const { transform, defaultStyle, lines, perspective } = block;
    const blockScale = transform.scale || 1;

    // NEW: Check if perspective quad mode is enabled
    if (perspective?.enabled && perspective?.corners) {
        ctx.save();
        ctx.translate(transform.position.x, transform.position.y);
        ctx.scale(blockScale, blockScale);

        drawPerspectiveTextBlock(ctx, block, userTextOverride, perspective.corners);

        ctx.restore();
        return;
    }

    // Original rendering code
    ctx.save();

    ctx.translate(transform.position.x, transform.position.y);
    ctx.rotate((transform.rotate || 0) * Math.PI / 180);
    ctx.scale(transform.scale || 1, transform.scale || 1);

    if (transform.skew) {
        ctx.transform(1, transform.skew.y || 0, transform.skew.x || 0, 1, 0, 0);
    }

    ctx.textAlign = defaultStyle.align;
    ctx.textBaseline = 'alphabetic';

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

        const baselineAdjust = style.size * 0.35;
        if (block.perspective?.enabled && block.perspective?.increment) {
            // Old fake perspective/fontsize renderer
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

// NEW: Draw perspective control handles
function drawPerspectiveHandles(ctx, corners, transform, blockScale) {
    const baseX = transform.position.x;
    const baseY = transform.position.y;

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    // Draw quad outline
    ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    corners.forEach((corner, i) => {
        const x = baseX + corner.x * blockScale;
        const y = baseY + corner.y * blockScale;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.stroke();

    // Draw corner handles
    ctx.fillStyle = 'rgba(255, 0, 0, 0.7)';
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;

    corners.forEach(corner => {
        const x = baseX + corner.x * blockScale;
        const y = baseY + corner.y * blockScale;
        ctx.beginPath();
        ctx.arc(x, y, handleRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
    });

    ctx.restore();
}

function getUrlParams() {
    const params = new URLSearchParams(window.location.search);
    return {
        image: params.get('image'),
        text: params.get('text')
    };
}

function updateFormValuesFromURLParams(){
    const { image, text } = getUrlParams();

    if (image) {
        const imageChoice = document.getElementById('imageChoice');
        const imageOption = [...imageChoice.options].find(option => option.value === image);
        if (imageOption) {
            imageChoice.value = imageOption.value;
        }
        imageChoice.dispatchEvent(new Event('change'));
    }

    if (text) {
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

        // 1 Base image
        if (imageConfig.meta.sourceType === 'upload') {
            canvas.width = OUTPUT_WIDTH;
            canvas.height = OUTPUT_HEIGHT;

            if(baseImage) {
                drawUploadedImageCrop(ctx, baseImage, canvas.width, canvas.height, uploadCrop);
            }else{
                ctx.fillStyle = 'black';
                ctx.fillRect(0, 0, canvas.width, canvas.height);

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

        // 2 Overlay + bound text
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

            const scale = imageConfig.overlay.scale || 1;
            const w = overlayImg.naturalWidth * scale;
            const h = overlayImg.naturalHeight * scale;
            const offset = overlay.offset || { x: 0, y: 0 };
            const x = canvas.width - w - offset.x;
            const y = canvas.height - h - offset.y;

            ctx.save();
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.drawImage(overlayImg, x, y, w, h);
            ctx.restore();

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
            // 3 Text only (no overlay)
            renderTextBlock(ctx, imageConfig.textBlock, userText);
        }

        // NEW: Draw perspective handles in edit mode
        if (editMode && imageConfig.textBlock.perspective?.enabled && imageConfig.textBlock.perspective?.corners) {
            const transform = imageConfig.textBlock.transform;
            const blockScale = imageConfig.overlay?.enabled ? imageConfig.overlay.scale || 1 : transform.scale || 1;

            console.log('Drawing handles - editMode:', editMode, 'corners:', imageConfig.textBlock.perspective.corners);
            drawPerspectiveHandles(ctx, imageConfig.textBlock.perspective.corners, transform, blockScale);
        }
    };

    if(baseImage) {
        if (baseImage.complete && baseImage.naturalWidth) {
            draw();
        } else {
            baseImage.onload = draw;
        }
    }else{
        draw();
    }
}

const overlayCache = {};

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

    //work out distortios
    distortionMode.value = img.textBlock.transform.distortionMode || 'Simple';
    rotate.value = t.rotate || 0;
    skewX.value = t.skew?.x || 0;
    skewY.value = t.skew?.y || 0;

    overlayToggle.checked = img.overlay?.enabled || 0;
    overlayOffsetX.value = img.overlay?.offset?.x || 0;
    overlayOffsetY.value = img.overlay?.offset?.y || 0;
    overlayScale.value = img.overlay?.scale || 1;

    // NEW: Load perspective settings
    const persp = img.textBlock.perspective;
    if (persp && persp.enabled) {
        perspectiveToggle.checked = true;

        if (persp.corners) {
            cornerTLX.value = Math.round(persp.corners[0].x);
            cornerTLY.value = Math.round(persp.corners[0].y);
            cornerTRX.value = Math.round(persp.corners[1].x);
            cornerTRY.value = Math.round(persp.corners[1].y);
            cornerBRX.value = Math.round(persp.corners[2].x);
            cornerBRY.value = Math.round(persp.corners[2].y);
            cornerBLX.value = Math.round(persp.corners[3].x);
            cornerBLY.value = Math.round(persp.corners[3].y);
        }

        // Load maxWidth and maxLines
        const maxWidthInput = document.getElementById('perspectiveMaxWidth');
        const maxLinesInput = document.getElementById('perspectiveMaxLines');
        if (maxWidthInput) maxWidthInput.value = persp.maxWidth || '';
        if (maxLinesInput) maxLinesInput.value = persp.maxLines || '';
    } else {
        // No perspective or disabled - uncheck and clear values
        perspectiveToggle.checked = false;
        cornerTLX.value = 0;
        cornerTLY.value = 0;
        cornerTRX.value = 400;
        cornerTRY.value = 0;
        cornerBRX.value = 400;
        cornerBRY.value = 200;
        cornerBLX.value = 0;
        cornerBLY.value = 200;

        const maxWidthInput = document.getElementById('perspectiveMaxWidth');
        const maxLinesInput = document.getElementById('perspectiveMaxLines');
        if (maxWidthInput) maxWidthInput.value = '';
        if (maxLinesInput) maxLinesInput.value = '';
    }

    if (useSample) {
        userText.value = img.textBlock.lines.map(l => l.text).join('\n');
    }
    userText.style.textAlign = img.textBlock.defaultStyle.align;

    document.getElementById('line-count-preference').textContent =
        img.meta.prompt ? `(${img.meta.prompt})` : '';

    // Set font selector
    const fontChoice = document.getElementById('fontChoice');
    if (fontChoice) {
        fontChoice.value = img.textBlock.defaultStyle.font || 'chalkboard';
    }

    // Load shadow settings
    shadowToggle.checked = img.textBlock.defaultStyle.shadow.enabled || false;

    shadowToggle.dispatchEvent(new Event('change'));
    overlayToggle.dispatchEvent(new Event('change'));
    perspectiveToggle.dispatchEvent(new Event('change'));
    distortionMode.dispatchEvent(new Event('change')); //this will update all


}

// Text color handler
document.getElementById('textColor').addEventListener('input', () => {
    const img = images[imageChoiceSelect.value];
    const color = document.getElementById('textColor').value;

    img.textBlock.defaultStyle.color = color;

    // Update all line-specific colors if they exist
    img.textBlock.lines.forEach(line => {
        if (line.style) {
            line.style.color = color;
        }
    });

    updateAll();
});

// Shadow toggle handler
document.getElementById('shadowToggle').addEventListener('change', () => {
    const img = images[imageChoiceSelect.value];
    img.textBlock.defaultStyle.shadow.enabled = shadowToggle.checked;

    updateAll();
});

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
    updateUX(); // Update reset button state
}

const uploadCrop = {
    offsetX: 0.5,
    offsetY: 0.5
};

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
    const uploadOnlyElements = document.getElementsByClassName("upload-only");
    for (let element of uploadOnlyElements) {
        element.classList.toggle('visually-hidden', images[imageChoiceSelect.value].meta.sourceType !== 'upload');
    }

    //set the perspective mode display
    const perspectiveControls = document.querySelectorAll('.perspective-control input, .perspective-control button');
    perspectiveControls.forEach(el => el.disabled = !perspectiveToggle.checked);


    // NEW: Show/hide reset button based on whether config has been modified
    const resetBtn = document.getElementById('resetTemplateBtn');
    if (resetBtn) {
        const currentConfig = JSON.stringify(images[imageChoiceSelect.value]);
        const originalConfig = JSON.stringify(originalImages[imageChoiceSelect.value]);
        resetBtn.disabled = currentConfig === originalConfig;
    }
}

// NEW: Canvas mouse events for dragging corners
canvas.addEventListener('mousedown', (e) => {
    if (!editMode) {
        console.log('Not in edit mode');
        return;
    }

    const img = images[imageChoiceSelect.value];
    if (!img.textBlock.perspective?.enabled || !img.textBlock.perspective?.corners) {
        console.log('Perspective not enabled or no corners');
        return;
    }

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;

    const transform = img.textBlock.transform;
    const blockScale = img.overlay?.enabled ? img.overlay.scale || 1 : transform.scale || 1;
    const baseX = transform.position.x;
    const baseY = transform.position.y;

    console.log('Mouse click at:', mouseX, mouseY);
    console.log('Base position:', baseX, baseY);

    img.textBlock.perspective.corners.forEach((corner, i) => {
        const x = baseX + corner.x * blockScale;
        const y = baseY + corner.y * blockScale;
        const dist = Math.sqrt((mouseX - x) ** 2 + (mouseY - y) ** 2);
        console.log(`Corner ${i} at (${x}, ${y}), distance: ${dist}`);
        if (dist < handleRadius * 2) {
            draggingCorner = i;
            console.log('Started dragging corner', i);
        }
    });
});

canvas.addEventListener('mousemove', (e) => {
    if (draggingCorner === null) return;

    const img = images[imageChoiceSelect.value];
    if (!img.textBlock.perspective?.corners) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;

    const transform = img.textBlock.transform;
    const blockScale = img.overlay?.enabled ? img.overlay.scale || 1 : transform.scale || 1;
    const baseX = transform.position.x;
    const baseY = transform.position.y;

    img.textBlock.perspective.corners[draggingCorner].x = (mouseX - baseX) / blockScale;
    img.textBlock.perspective.corners[draggingCorner].y = (mouseY - baseY) / blockScale;

    updateCornerInputs();
    updateAll();
});

canvas.addEventListener('mouseup', () => {
    if (draggingCorner !== null) {
        console.log('Stopped dragging corner', draggingCorner);
    }
    draggingCorner = null;
});

// NEW: Update corner inputs from current values
function updateCornerInputs() {
    const img = images[imageChoiceSelect.value];
    if (!img.textBlock.perspective?.corners) return;

    const corners = img.textBlock.perspective.corners;
    cornerTLX.value = Math.round(corners[0].x);
    cornerTLY.value = Math.round(corners[0].y);
    cornerTRX.value = Math.round(corners[1].x);
    cornerTRY.value = Math.round(corners[1].y);
    cornerBRX.value = Math.round(corners[2].x);
    cornerBRY.value = Math.round(corners[2].y);
    cornerBLX.value = Math.round(corners[3].x);
    cornerBLY.value = Math.round(corners[3].y);
}

// NEW: Perspective event handlers
perspectiveToggle.addEventListener('change', () => {
    const img = images[imageChoiceSelect.value];

    if (!img.textBlock.perspective) {
        img.textBlock.perspective = {
            enabled: false,
            corners: [
                {x: 0, y: 0},
                {x: 400, y: 0},
                {x: 400, y: 200},
                {x: 0, y: 200}
            ]
        };
    }

    img.textBlock.perspective.enabled = perspectiveToggle.checked;

    const perspectiveControls = document.querySelectorAll('.perspective-control input, .perspective-control button');
    perspectiveControls.forEach(el => el.disabled = !perspectiveToggle.checked);

    console.log('Perspective toggled:', img.textBlock.perspective.enabled);
    updateAll();
});

distortionMode.addEventListener('change', () => {
    const img = images[imageChoiceSelect.value];
    img.textBlock.perspective.mode = distortionMode.value;

    console.log('Distortion mode has been set');

    const showWhenPerspective = document.querySelectorAll('.show-when-perspective');
    showWhenPerspective.forEach(el => el.classList.toggle('d-none', distortionMode.value === 'Simple'));

    const hideWhenPerspective = document.querySelectorAll('.hide-when-perspective');
    hideWhenPerspective.forEach(el => el.classList.toggle('d-none', distortionMode.value === 'Perspective'));

    updateAll();
})
perspectiveEditMode.addEventListener('change', () => {
    editMode = perspectiveEditMode.checked;
    console.log('Edit mode:', editMode);
    updateAll();
});

// Corner input handlers
[cornerTLX, cornerTLY, cornerTRX, cornerTRY, cornerBRX, cornerBRY, cornerBLX, cornerBLY].forEach((input, i) => {
    input.addEventListener('input', () => {
        const img = images[imageChoiceSelect.value];
        if (!img.textBlock.perspective?.corners) return;

        const cornerIndex = Math.floor(i / 2);
        const isX = i % 2 === 0;

        if (isX) {
            img.textBlock.perspective.corners[cornerIndex].x = parseFloat(input.value);
        } else {
            img.textBlock.perspective.corners[cornerIndex].y = parseFloat(input.value);
        }

        updateAll();
    });
});

// NEW: Max Width and Max Lines input handlers
const maxWidthInput = document.getElementById('perspectiveMaxWidth');
const maxLinesInput = document.getElementById('perspectiveMaxLines');

if (maxWidthInput) {
    maxWidthInput.addEventListener('input', () => {
        const img = images[imageChoiceSelect.value];
        if (!img.textBlock.perspective) return;

        const value = parseFloat(maxWidthInput.value);
        img.textBlock.perspective.maxWidth = value || undefined;
        updateAll();
    });
}

if (maxLinesInput) {
    maxLinesInput.addEventListener('input', () => {
        const img = images[imageChoiceSelect.value];
        if (!img.textBlock.perspective) return;

        const value = parseInt(maxLinesInput.value);
        img.textBlock.perspective.maxLines = value || undefined;
        updateAll();
    });
}

/* handle events */
// Font selector handler
document.getElementById('fontChoice').addEventListener('change', () => {
    const img = images[imageChoiceSelect.value];
    const selectedFont = document.getElementById('fontChoice').value;

    // Update the default font for the text block
    img.textBlock.defaultStyle.font = selectedFont;

    // Also update all line-specific fonts if they exist
    img.textBlock.lines.forEach(line => {
        if (line.style && line.style.font) {
            line.style.font = selectedFont;
        }
    });

    updateAll();
});
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
    updateAll();
});

overlayOffsetY.addEventListener('input', () => {
    const img = images[imageChoiceSelect.value];
    img.overlay.offset.y = parseFloat(overlayOffsetY.value);
    updateAll();
});

overlayScale.addEventListener('input', () => {
    const img = images[imageChoiceSelect.value];
    img.overlay.scale = parseFloat(overlayScale.value);
    updateAll();
});

scale.addEventListener('input', () => {
    const img = images[imageChoiceSelect.value];
    img.textBlock.transform.scale = parseFloat(scale.value);
    updateAll();
});

imageChoiceSelect.addEventListener('change', () => {
    updateUX();
    loadFromConfig(true);

    // Wait a brief moment for UI to update before rendering
    setTimeout(() => {
        updateAll();
    }, 0);
});

document.getElementById('saveBtn').onclick = () => {
    const editingPerspective = perspectiveToggle.checked;

    //work out the best filename to use
    const selectedOption = imageChoiceSelect.options[imageChoiceSelect.selectedIndex];
    const imageDisplayName = selectedOption.textContent;

    const cleanImageName = imageDisplayName
        .replace(/[^a-zA-Z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
        .toLowerCase();
    const cleanUserText = userText.value
        .replace(/[^a-zA-Z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
        .toLowerCase();
    const idealFilename = cleanImageName + '-' + cleanUserText + '.jpg';

    if(editingPerspective) {
        //turn it off before saving
        perspectiveEditMode.checked = false;
        perspectiveEditMode.dispatchEvent(new Event('change'));
    }

    ctx.save();
    ctx.globalCompositeOperation = 'destination-over';
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();

    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = idealFilename;
    link.click();

    if(editingPerspective) {
        //restore edit mode
        perspectiveEditMode.checked = true;
        perspectiveEditMode.dispatchEvent(new Event('change'));
    }
};

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

overlayToggle.addEventListener('change', () => {
    const img = images[imageChoiceSelect.value];
    if (img.overlay) {
        img.overlay.enabled = overlayToggle.checked;
        updateAll();
    }

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

// NEW: Reset template button
const resetTemplateBtn = document.getElementById('resetTemplateBtn');
if (resetTemplateBtn) {
    resetTemplateBtn.addEventListener('click', () => {
        const key = imageChoiceSelect.value;

        // Deep clone the original config back
        images[key] = JSON.parse(JSON.stringify(originalImages[key]));

        // Reload the form with the reset values
        loadFromConfig(false); // Don't change user text
        updateAll();

        console.log('Template reset to original configuration');
    });
}

imageChoiceSelect.dispatchEvent(new Event('change'));