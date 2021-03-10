console.cdir = (...objs) =>
    console.dir(...objs, { colors: true });

console.sleep = (ms) => {
    return new Promise((resolve, reject) =>
        setInterval(resolve, ms)
    );
};

Date.prototype.addDays = function (days) {
    let date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
};

Date.prototype.formatDate = function () {
    let diff = new Date() - this; // разница в миллисекундах

    if (diff < 1000) { // меньше 1 секунды
        return "прямо сейчас";
    }

    let sec = Math.floor(diff / 1000); // преобразовать разницу в секунды

    if (sec < 60) {
        return sec + " сек. назад";
    }

    let min = Math.floor(diff / 60 * 1000); // преобразовать разницу в минуты
    if (min < 60) {
        return min + " мин. назад";
    }

    let hours = Math.floor(diff / 60 * 60 * 1000); // преобразовать разницу в минуты
    if (hours < 24) {
        return hours + " час назад";
    }

    // отформатировать дату
    // добавить ведущие нули к единственной цифре дню/месяцу/часам/минутам
    let d = this;
    d = [
        "0" + d.getDate(),
        "0" + (d.getMonth() + 1),
        "" + d.getFullYear(),
        "0" + d.getHours(),
        "0" + d.getMinutes()
    ]
        .map(component => component.slice(-2)); // взять последние 2 цифры из каждой компоненты

    // соединить компоненты в дату
    return d.slice(0, 3).join(".") + " " + d.slice(3).join(":");
};

Date.prototype.toDateString = function () {
    let d = this.getDate();
    let m = this.getMonth() + 1;
    return `${ (d > 9 ? "" : "0") }${ d }.${ (m > 9 ? "" : "0") }${ m }.${ this.getFullYear() }`;
};

Date.prototype.to_YYYY_MM_DD = function () {
    let d = this.getDate();
    let m = this.getMonth() + 1;
    return `${ this.getFullYear() }-${ (m > 9 ? "" : "0") }${ m }-${ (d > 9 ? "" : "0") }${ d }`;
};

Date.prototype.isValid = function () {
    return !isNaN(this);
};

Date.prototype.getWeekNumber = function () {
    let d = new Date(Date.UTC(this.getFullYear(), this.getMonth(), this.getDate()));
    let dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    let yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
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

Math.randomizeArray = (array) =>
    array[Math.floor(Math.random() * (array.length))];

Math.randomInt = (min, max) =>
    Math.floor(min + Math.random() * (max - min));

Math.randomFloat = (min, max) =>
    min + Math.random() * (max - min);

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
