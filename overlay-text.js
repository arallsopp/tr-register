// Get the canvas element and its context
const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');

// Image options (refactored)
const images = {
    image1: {
        meta: {
            name: 'Pub Lunch Landscape',
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
            src: 'assets/artwork/road-run.jpg'
        },
        textBlock: {
            transform: {
                position: { x: 609, y: 305 },
                rotate: 0,
                scale: 1.3,
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
    }
};

// Load custom font
Promise.all([
    document.fonts.load('75px chalkboard'),
    document.fonts.load('75px harmattan'),
    document.fonts.load('75px racing')
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
    const img = new Image();
    img.src = imageConfig.meta.src;

    img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;

        ctx.drawImage(img, 0, 0);
        renderTextBlock(ctx, imageConfig.textBlock, userText);
    };
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

['userText','textX','textY','rotate','scale','skewX','skewY'].forEach(id => {
    document.getElementById(id).addEventListener('input', updateAll);
});

imageChoiceSelect.addEventListener('change', () => {
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

//initial load
imageChoiceSelect.dispatchEvent(new Event('change'));

