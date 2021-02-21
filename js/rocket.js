import { Boom } from "./boom.js";

export class Rocket {
    hue = 340;
    x = 0;
    y = 0;
    vx = 0;
    vy = 0;
    trust = 20;
    maxSpeed = 6;
    lifetime = 10;
    angle = 0;
    maxTurnSpeed = 0.5 * Math.doublePI;
    radius = 5;
    line = [];
    boomPrefab;

    constructor(x, y, angle, maxSpeed, lifetime, radius, maxTurnSpeed, hue, boomPrefab) {
        this.hue = hue;
        this.x = x;
        this.y = y;
        this.vx = Math.cos(angle) * maxSpeed;
        this.vy = Math.sin(angle) * maxSpeed;
        this.maxSpeed = maxSpeed;
        this.lifetime = lifetime;
        this.angle = angle;
        this.maxTurnSpeed = maxTurnSpeed;
        this.radius = radius;
        this.boomPrefab = boomPrefab;
    }
}
