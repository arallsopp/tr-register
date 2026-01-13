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
                scale: 1,
                skew: { x: 0.01, y: 0.08 }
            },
            defaultStyle: {
                font: 'harmattan',
                size: 60,
                color: 'rgb(243,222,194)',
                align: 'left',
                lineHeight: 52,
                shadow: {
                    shadowColor: 'rgba(0,0,0,0.8)',
                    shadowBlur: 1,
                    shadowOffsetX: 1,
                    shadowOffsetY: 1}
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
                scale: 1,
                skew: { x: 0, y: 0 }
            },
            defaultStyle: {
                font: 'harmattan',
                size: 55,
                color: 'rgba(255,255,255,0.95)',
                align: 'left',
                lineHeight: 49,
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
                scale: 1,
                skew: { x: 0, y: 0 }
            },
            defaultStyle: {
                font: 'racing',
                size: 75,
                color: 'rgb(38,62,47)',
                align: 'right',
                lineHeight: 65,
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
                scale: 1,
                skew: { x: 0, y: 0 }
            },
            defaultStyle: {
                font: 'Damion',
                size: 125,
                color: 'rgb(28,41,25)',
                align: 'center',
                lineHeight: 107,
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
            scale: 0.4,
            offset: {x:30, y:0}, // pixels from bottom right
            textOffset: { x: 80, y: 376 } // position of text relative to overlay's top-left
        },
        textBlock: {
            transform: {
                position: { x: 0, y: 0 }, //not really text, just that overlay uses this.
                rotate: 0,
                scale: 1,
                skew: { x: 0, y: 0 }
            },
            defaultStyle: {
                font: 'harmattan',
                size: 82,
                color: '#faf0d7',
                align: 'left',
                lineHeight: 67,
                shadow: {
                    shadowColor: 'rgba(0,0,0,1)',
                    shadowBlur: 3,
                    shadowOffsetX: 2,
                    shadowOffsetY: 2
                }
            },
            lines: [
                { text: 'SIGN PRIMARY LINE   1\n' +
                        'SIGN NEXT LINE          2' }
            ]
        }
    }
};
