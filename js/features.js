console.sleep = (ms) => {
    return new Promise((resolve, reject) =>
        setInterval(resolve, ms)
    );
};

Math.doublePI = Math.PI * 2;
Math.halfPI = Math.PI / 2;

Math.angleDiff = (angle1, angle2) => {
    let diff = (angle2 - angle1) % Math.doublePI;
    if (diff < 0)
        diff += Math.doublePI;
    if (diff > Math.PI)
        return -(Math.doublePI - diff);
    else
        return diff;
};

Math.randomInt = (min, max) =>
    Math.floor(min + Math.random() * (max - min));

Math.randomFloat = (min, max) =>
    min + Math.random() * (max - min);

Math.rad2deg = (rad) =>
    rad * 180 / Math.PI;

Math.deg2rad = (deg) =>
    deg * Math.PI / 180;

Math.lerp = (t, a, b) =>
    a + (b - a) * t;

Math.unLerp = (t, a = -1, b = 1) =>
    (t - a) / (b - a);

Math.clamp = (t, a = 0, b = 1) =>
    t < a ? a : t > b ? b : t;

Math.roundN = (a, n = 2) =>
    Math.round(a * (10 ** n)) / (10 ** n);

Math.easeInQuad = (t) => t ** 2;
Math.easeOutQuad = (t) => t * (2 - t);
Math.easeInOutQuad = (t) => t < .5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
Math.easeInCubic = (t) => t ** 3;
Math.easeOutCubic = (t) => (--t) * t * t + 1;
Math.easeInOutCubic = (t) => t < .5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
Math.easeInQuart = (t) => t ** 4;
Math.easeOutQuart = (t) => 1 - (--t) * t * t * t;
Math.easeInOutQuart = (t) => t < .5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t;
Math.easeInQuint = (t) => t ** 5;
Math.easeOutQuint = (t) => 1 + (--t) * t * t * t * t;
Math.easeInOutQuint = (t) => t < .5 ? 16 * t * t * t * t * t : 1 + 16 * (--t) * t * t * t * t;

Array.dedublicate = function () {
    return this.filter((a, b) => this.indexOf(a) === b);
};

Array.randomItem = function (array, count = 1) {
    if (count <= 0 || !array || !Array.isArray(array)) {
        return null;
    } else if (count === 1) {
        return array[Math.floor(Math.random() * array.length)];
    } else {
        const res = [];
        for (let i = 0; i < count; i++) {
            res.push(array[Math.floor(Math.random() * array.length)]);
        }
        return res;
    }
};

Array.prototype.randomItem = function (count = 1) {
    return Array.randomItem(this, count);
};

Array.count = function (array, expression) {
    if (!expression || !array || !Array.isArray(array)) {
        return 0;
    } else {
        let count = 0;
        for (let i = 0; i < array.length; i++) {
            if (expression(array[i], i, array))
                count++;
        }
        return count;
    }
};

Array.prototype.count = function (expression) {
    return Array.count(this, expression);
};
