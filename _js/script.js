/*jslint browser: true, devel: true, eqeq: true, plusplus: true, sloppy: true, vars: true, white: true*/
/*eslint-env browser*/
/*eslint 'no-console':0*/

const rippleSettings = {
    maxSize: 100,
    animationSpeed: 5,
    strokeColor: [66, 91, 181],
};

const canvasSettings = {
    blur: 8,
    ratio: 1,
};

function Coords(x, y) {
    this.x = x || null;
    this.y = y || null;
}

const Ripple = function Ripple(x, y, circleSize, ctx) {
    this.position = new Coords(x, y);
    this.circleSize = circleSize;
    this.maxSize = rippleSettings.maxSize;
    this.opacity = 1;
    this.ctx = ctx;
    this.strokeColor = `rgba(${Math.floor(rippleSettings.strokeColor[0])},
    ${Math.floor(rippleSettings.strokeColor[1])},
    ${Math.floor(rippleSettings.strokeColor[2])},
    ${this.opacity})`;

    this.animationSpeed = rippleSettings.animationSpeed;
    this.opacityStep = (this.animationSpeed / (this.maxSize - circleSize)) / 2;
};

Ripple.prototype = {
    update: function update() {
        this.circleSize = this.circleSize + this.animationSpeed;
        this.opacity = this.opacity - this.opacityStep;
        this.strokeColor = `rgba(${Math.floor(rippleSettings.strokeColor[0])},
      ${Math.floor(rippleSettings.strokeColor[1])},
      ${Math.floor(rippleSettings.strokeColor[2])},
      ${this.opacity})`;
    },
    draw: function draw() {
        this.ctx.beginPath();
        this.ctx.strokeStyle = this.strokeColor;
        this.ctx.arc(this.position.x, this.position.y, this.circleSize, 0,
            2 * Math.PI);
        this.ctx.stroke();
    },
    setStatus: function setStatus(status) {
        this.status = status;
    },
};

const canvas = document.querySelector('#canvas');
const ctx = canvas.getContext('2d');
const ripples = [];

const height = document.body.clientHeight;
const width = document.body.clientWidth;

const rippleStartStatus = 'start';

const isIE11 = !!window.MSInputMethodContext && !!document.documentMode;

canvas.style.filter = `blur(${canvasSettings.blur}px)`;

canvas.width = width * canvasSettings.ratio;
canvas.height = height * canvasSettings.ratio;

canvas.style.width = `${width}px`;
canvas.style.height = `${height}px`;

let animationFrame;

// Add GUI settings
const addGuiSettings = () => {
    const gui = new dat.GUI();
    gui.add(rippleSettings, 'maxSize', 0, 1000).step(1);
    gui.add(rippleSettings, 'animationSpeed', 1, 30).step(1);
    gui.addColor(rippleSettings, 'strokeColor');

    const blur = gui.add(canvasSettings, 'blur', 0, 20).step(1);
    blur.onChange((value) => {
        canvas.style.filter = `blur(${value}px)`;
    });
};

addGuiSettings();

// Function which is executed on mouse hover on canvas
const canvasMouseOver = (e) => {
    const x = e.clientX * canvasSettings.ratio;
    const y = e.clientY * canvasSettings.ratio;
    ripples.unshift(new Ripple(x, y, 2, ctx));
};

const animation = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const length = ripples.length;
    for (let i = length - 1; i >= 0; i -= 1) {
        const r = ripples[i];

        r.update();
        r.draw();

        if (r.opacity <= 0) {
            ripples[i] = null;
            delete ripples[i];
            ripples.pop();
        }
    }
    animationFrame = window.requestAnimationFrame(animation);
};

animation();
canvas.addEventListener('mousemove', canvasMouseOver);
