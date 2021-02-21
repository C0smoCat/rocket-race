export class Player {
    scale = 0.6;
    hue = 140;
    x = 15;
    y = 15;
    vx = 0;
    vy = 0;
    maxSpeed = 5;
    turnSpeed = 5;
    maxTrust = 15;
    trust = 0;
    angle = -Math.PI2;
    rotate = 0;
    line = [];
    isDead = false;
    score = 0;

    constructor(x, y, hue, angle) {
        this.x = x;
        this.y = y;
        this.hue = hue;
        this.angle = angle;
    }
}
