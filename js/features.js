console.sleep = (ms) => {
    return new Promise((resolve, reject) =>
        setInterval(resolve, ms)
    );
};

Math.doublePI = Math.PI * 2;
Math.PI2 = Math.PI / 2;

Math.angleDiff = (angle1, angle2) => {
    let diff = (angle2 - angle1) % Math.doublePI;
    if (diff < 0)
        diff += Math.doublePI;
    if (diff > Math.PI)
        return -(Math.doublePI - diff);
    else
        return diff;
};

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
