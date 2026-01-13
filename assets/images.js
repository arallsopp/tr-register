// Image options (refactored)
const images = {
    image1: {
        meta: {
            name: 'Pub Lunch Landscape',
            prompt: '2 lines',
            src: 'assets/artwork/pub-lunch-landscape-master.jpg'
        },
        textBlock: {
            transform: {
                position: { x: 82, y: 850 },
                rotate: 0,
                scale: 1,
                skew: { x: 0, y: 0 }
            },
            defaultStyle: {
                font: 'chalkboard',
                size: 75,
                color: 'rgba(255,255,255,0.8)',
                align: 'left',
                lineHeight: 101,
                shadow: null
            },
            lines: [
                { text: '22/02 - BOTANY BAY INNE    12:30' },
                { text: 'ORGANISED BY SANDRA AND STEVE                  DT11 9ET',
                    transform: { scale: 0.6 }
                }
            ]
        }
    },

    image2: {
        meta: {
            name: 'Pub Lunch Portrait',
            prompt: 'up to 5 lines',
            src: 'assets/artwork/pub-lunch-portrait-master.jpg'
        },
        textBlock: {
            transform: {
                position: { x: 85, y: 1100 },
                rotate: 0,
                scale: 1,
                skew: { x: 0, y: 0 }
            },
            defaultStyle: {
                font: 'chalkboard',
                size: 50,
                color: 'rgba(255,255,255,0.8)',
                align: 'left',
                lineHeight: 60,
                shadow: null
            },
            lines: [
                { text: 'STEVE and SANDRA\'S' },
                { text: 'FEBRUARY PUB LUNCH\n' +
                        '\n' +
                        '12:30 ON THE 22ND \n' +
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
                position: { x: 609, y: 293 },
                rotate: 0,
                scale: 1,
                skew: { x: 0.01, y: 0.075 }
            },
            defaultStyle: {
                font: 'Harmattan',
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
            perspective: {
                enabled: true,
                leftScale: 1,
                rightScale: 0.88
            },
            lines: [
                { text: "BRIAN AND LINDA'S" },
                { text: "DRIVE IT DAY,     APR.  26"}
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
                position: { x: 770, y: 375 },
                rotate: 0,
                scale: 1,
                skew: { x: 0, y: 0 }
            },
            defaultStyle: {
                font: 'Harmattan',
                size: 50,
                color: 'rgb(246,240,211)',
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
                position: { x: 755, y: 790 },
                rotate: 0,
                scale: 1,
                skew: { x: 0, y: 0 }
            },
            defaultStyle: {
                font: 'Harmattan',
                size: 55,
                color: 'rgb(246,226,205)',
                align: 'left',
                lineHeight: 49,
                shadow: {
                    shadowColor: 'rgba(0,0,0,1)',
                    shadowBlur: 2,
                    shadowOffsetX: 1,
                    shadowOffsetY: 1
                }
            },
            lines: [
                { text: 'LULWORTH MAY          17' },
                { text: 'BRESSUIRE JUNE         21' }
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
                position: { x: 1310, y: 62 },
                rotate: 0,
                scale: 1,
                skew: { x: 0, y: 0 }
            },
            defaultStyle: {
                font: 'Racing Sans One',
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
                position: { x: 716, y: 75 },
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
    image8: {
        meta: {
            name: 'Evening Road Run',
            prompt: '2 lines',
            src: 'assets/artwork/evening-road-run.jpg'
        },
        textBlock: {
            transform: {
                position: { x: 907, y: 260 },
                rotate: 0,
                scale: 1,
                skew: { x: -0.01, y: -0.09 }
            },
            perspective: {
                    enabled: true,
                    leftScale: 0.88,
                    rightScale: 1.0
            },
            defaultStyle: {
                font: 'Harmattan',
                size: 42,
                color: 'rgb(158,133,110)',
                align: 'left',
                lineHeight: 39,
                shadow: {
                    shadowColor: 'rgba(0,0,0,1)',
                    shadowBlur: 2,
                    shadowOffsetX: 2,
                    shadowOffsetY: 2
                }
            },
            lines: [
                { text: 'EVENING ROAD RUN      9/5' },
                { text: 'TIM + SAM                     5:45'}
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
            textOffset: { x: 80, y: 357 } // position of text relative to overlay's top-left
        },
        textBlock: {
            transform: {
                position: { x: 28, y: 58 },
                rotate: 0,
                scale: 1,
                skew: { x: 0, y: 0 }
            },
            defaultStyle: {
                font: 'Harmattan',
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
