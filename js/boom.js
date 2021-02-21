export class Boom {
    x = 0;
    y = 0;
    maxRadius = 2;
    radius = 0;
    lifetime = 3;
    maxLifetime = 3;
    hideTime = 1;
    maxHideTime = 1;
    hue;

    constructor(x, y, maxRadius, maxLifetime, maxHideTime, hue = 0) {
        this.x = x;
        this.y = y;
        this.maxRadius = maxRadius;
        this.radius = 0;
        this.lifetime = maxLifetime;
        this.maxLifetime = maxLifetime;
        this.hideTime = maxHideTime;
        this.maxHideTime = maxHideTime;
        this.hue = hue;
    }

}
