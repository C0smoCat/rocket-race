"use strict";

import "./features.js";
import imgs from "./images.js";
import { simplex2 } from "./perlin.js";
import trackKeys from "./trackKeys.js";
import { Player } from "./player.js";
import { Boom } from "./boom.js";
import { Rocket } from "./rocket.js";

const arrows = trackKeys({
    // Player 1
    left1: [ "KeyA" ],
    right1: [ "KeyD" ],
    up1: [ "KeyW" ],

    // Player 2
    left2: [ "ArrowLeft" ],
    right2: [ "ArrowRight" ],
    up2: [ "ArrowUp" ],

    // Player 3
    left3: [ "KeyJ" ],
    right3: [ "KeyL" ],
    up3: [ "KeyI" ],

    pause: [ "Escape" ],
    bossbattle: [ "Backquote" ]
});

let graphicScale = 1.00;
let allowLowFps = false;
let backgroundColor = "#333";
let lastUpd;
let canv;
let wScale = 1;
let hScale = 1;
let zz = 0;
let mapW = 30;
let mapH = 30;
const map = {};
let ctx;
let isPlay = true;
let isBossbattle = false;
const cam = {
    x: 0,
    y: 0,
    scale: 20,
    minScale: 5,
    maxScale: 30
};
const animations = [];
const mouse = {
    mapX: 0,
    mapY: 0,
    screenX: 0,
    screenY: 0,
    lastMapX: 0,
    lastMapY: 0,
    lastScreenX: 0,
    lastScreenY: 0,
    mode: null
};
const players = [
    new Player(10, 10, 0, 0), // Player 1, default WASD
    new Player(20, 20, 240, Math.PI), // Player 2, default Arrows
    new Player(15, 15, 140, -Math.PI2) // Player 3, default IJKL
];
const playerBoomPrefab = new Boom(0, 0, 2, 3, 1, 200);
const enemies = [
    // general
    {
        x: 10,
        y: 20,
        angle: 0,
        maxTurnSpeed: 0.3 * Math.doublePI,
        radius: 7,
        reload: 0,
        maxReload: 4,
        maxAngleDiff: 0.1 * Math.doublePI,
        targetPlayer: undefined,
        rocketPrefab: 0
    },
    {
        x: 20,
        y: 10,
        angle: 0,
        maxTurnSpeed: 0.3 * Math.doublePI,
        radius: 7,
        reload: 0,
        maxReload: 4,
        maxAngleDiff: 0.1 * Math.doublePI,
        targetPlayer: undefined,
        rocketPrefab: 0
    },
    {
        x: 8,
        y: 28,
        angle: 0,
        maxTurnSpeed: 0.3 * Math.doublePI,
        radius: 7,
        reload: 0,
        maxReload: 4,
        maxAngleDiff: 0.1 * Math.doublePI,
        targetPlayer: undefined,
        rocketPrefab: 0
    },
    {
        x: 22,
        y: 2,
        angle: 0,
        maxTurnSpeed: 0.3 * Math.doublePI,
        radius: 7,
        reload: 0,
        maxReload: 4,
        maxAngleDiff: 0.1 * Math.doublePI,
        targetPlayer: undefined,
        rocketPrefab: 0
    },

    // snipers
    {
        x: 5,
        y: 5,
        angle: 0,
        maxTurnSpeed: 0.2 * Math.doublePI,
        radius: 15,
        reload: 4,
        maxReload: 6,
        maxAngleDiff: 0.01 * Math.doublePI,
        targetPlayer: undefined,
        rocketPrefab: 1,
        texture: "towerSniper"
    },
    {
        x: 25,
        y: 25,
        angle: 0,
        maxTurnSpeed: 0.2 * Math.doublePI,
        radius: 15,
        reload: 4,
        maxReload: 6,
        maxAngleDiff: 0.01 * Math.doublePI,
        targetPlayer: undefined,
        rocketPrefab: 1,
        texture: "towerSniper"
    },

    // heavy
    {
        x: 5,
        y: 15,
        angle: 0,
        maxTurnSpeed: 0.02 * Math.doublePI,
        radius: 15,
        reload: 10,
        maxReload: 10,
        maxAngleDiff: 0.2 * Math.doublePI,
        targetPlayer: undefined,
        rocketPrefab: 2,
        texture: "towerHeavy"
    },
    {
        x: 25,
        y: 15,
        angle: 0,
        maxTurnSpeed: 0.1 * Math.doublePI,
        radius: 15,
        reload: 10,
        maxReload: 10,
        maxAngleDiff: 0.2 * Math.doublePI,
        targetPlayer: undefined,
        rocketPrefab: 2,
        texture: "towerHeavy"
    }
];
const rocketPrefabs = [
    new Rocket(0, 0, 0, 6, 10, 5, 0.5 * Math.doublePI, 340, new Boom(0, 0, 2, 2, 0.5)),
    new Rocket(0, 0, 0, 15, 5, 0, 0, 240, new Boom(0, 0, 3, 1, 0.2)),
    new Rocket(0, 0, 0, 4, 90, 15, 0.3 * Math.doublePI, 140, new Boom(0, 0, 5, 5, 1))
];
const rockets = [];
const booms = [];
const checkpoints = [
    {
        x: 25,
        y: 5,
        radius: 0.75,
        checkedPlayers: []
    },
    {
        x: 15,
        y: 2,
        radius: 0.75,
        checkedPlayers: []
    },
    {
        x: 5,
        y: 25,
        radius: 0.75,
        checkedPlayers: []
    },
    {
        x: 15,
        y: 28,
        radius: 0.75,
        checkedPlayers: []
    },
    {
        x: 15,
        y: 15,
        radius: 0.75,
        checkedPlayers: []
    },
    {
        x: 20,
        y: 15,
        radius: 0.75,
        checkedPlayers: []
    },
    {
        x: 10,
        y: 15,
        radius: 0.75,
        checkedPlayers: []
    },
    {
        x: 15,
        y: 10,
        radius: 0.75,
        checkedPlayers: []
    },
    {
        x: 15,
        y: 20,
        radius: 0.75,
        checkedPlayers: []
    },
    {
        x: 20,
        y: 25,
        radius: 0.75,
        checkedPlayers: []
    },
    {
        x: 10,
        y: 5,
        radius: 0.75,
        checkedPlayers: []
    },
    {
        x: 25,
        y: 20,
        radius: 0.75,
        checkedPlayers: []
    },
    {
        x: 5,
        y: 10,
        radius: 0.75,
        checkedPlayers: []
    },
    {
        x: 28,
        y: 28,
        radius: 0.75,
        checkedPlayers: []
    },
    {
        x: 2,
        y: 2,
        radius: 0.75,
        checkedPlayers: []
    }
];
const bosses = [
    {
        x: 15,
        y: -5,
        vx: 0,
        vy: 0,
        trust: 0,
        maxTrust: 10,
        rotate: 0,
        maxSpeed: 2,
        target: null,
        angle: Math.PI2,
        turnSpeed: 0.1 * Math.doublePI,
        weapons: [
            {
                ox: 1,
                oy: 0,
                angle: Math.PI2 * 3,
                maxTurnSpeed: 0.3 * Math.doublePI,
                radius: 20,
                reload: 7.5,
                maxReload: 5,
                maxAngleDiff: 0.1 * Math.doublePI,
                targetPlayer: undefined,
                rocketPrefab: 1,
                scale: 1,
                texture: "towerSniper"
            },
            {
                ox: -1,
                oy: 0,
                angle: Math.PI2 * 3,
                maxTurnSpeed: 0.3 * Math.doublePI,
                radius: 20,
                reload: 5,
                maxReload: 5,
                maxAngleDiff: 0.1 * Math.doublePI,
                targetPlayer: undefined,
                rocketPrefab: 1,
                scale: 1,
                texture: "towerSniper"
            },
            {
                ox: 2,
                oy: -1.8,
                angle: Math.PI2 * 3,
                maxTurnSpeed: 0.3 * Math.doublePI,
                radius: 15,
                reload: 5,
                maxReload: 1,
                maxAngleDiff: 0.1 * Math.doublePI,
                targetPlayer: undefined,
                rocketPrefab: 0,
                scale: 1,
                texture: "towerGeneral"
            },
            {
                ox: -2,
                oy: -1.8,
                angle: Math.PI2 * 3,
                maxTurnSpeed: 0.3 * Math.doublePI,
                radius: 15,
                reload: 5,
                maxReload: 1,
                maxAngleDiff: 0.1 * Math.doublePI,
                targetPlayer: undefined,
                rocketPrefab: 0,
                scale: 1,
                texture: "towerGeneral"
            }
        ],
        texture: "ship2",
        scale: 5
    },
    {
        x: 15,
        y: 35,
        vx: 0,
        vy: 0,
        trust: 0,
        maxTrust: 10,
        rotate: 0,
        maxSpeed: 2,
        target: null,
        angle: -Math.PI2,
        turnSpeed: 0.1 * Math.doublePI,
        noRotateTexture: true,
        weapons: [
            {
                ox: 0,
                oy: -0.6,
                angle: Math.PI2 * 3,
                maxTurnSpeed: 0,
                radius: 25,
                reload: 7.5,
                maxReload: 5,
                maxAngleDiff: Math.doublePI,
                targetPlayer: undefined,
                rocketPrefab: {
                    hue: 280,
                    x: 0,
                    y: 0,
                    vx: 0,
                    vy: 0,
                    trust: 0,
                    maxSpeed: 0,
                    lifetime: 0,
                    angle: 0,
                    maxTurnSpeed: 0,
                    radius: 0,
                    line: [],
                    boomPrefab: {
                        x: 0,
                        y: 0,
                        ax: 0,
                        ay: 0,
                        maxRadius: 6,
                        radius: 0,
                        lifetime: 7,
                        maxLifetime: 7,
                        hideTime: 1,
                        maxHideTime: 1
                    }
                },
                scale: 1,
                texture: "towerHeavy"
            }
        ],
        texture: "ship3",
        scale: 5
    },
    {
        x: -25,
        y: 15,
        vx: 0,
        vy: 0,
        trust: 0,
        maxTrust: 10,
        rotate: 0,
        maxSpeed: 2,
        target: null,
        angle: Math.PI2,
        turnSpeed: 0.1 * Math.doublePI,
        weapons: [
            {
                ox: 0,
                oy: 1,
                angle: Math.PI2 * 3,
                maxTurnSpeed: 0.3 * Math.doublePI,
                radius: 10,
                reload: 3.25,
                maxReload: 0.5,
                maxAngleDiff: 0.1 * Math.doublePI,
                targetPlayer: undefined,
                rocketPrefab: {
                    hue: 280,
                    x: 0,
                    y: 0,
                    vx: 0,
                    vy: 0,
                    trust: 0,
                    maxSpeed: 15,
                    lifetime: 1,
                    angle: 0,
                    maxTurnSpeed: 0,
                    radius: 0,
                    line: [],
                    boomPrefab: {
                        x: 0,
                        y: 0,
                        ax: 0,
                        ay: 0,
                        maxRadius: 1,
                        radius: 0,
                        lifetime: 0.5,
                        maxLifetime: 0.5,
                        hideTime: 0.2,
                        maxHideTime: 0.2
                    }
                },
                scale: 1,
                texture: "towerSniper"
            },
            {
                ox: 0,
                oy: -1,
                angle: 0,
                maxTurnSpeed: 0.3 * Math.doublePI,
                radius: 10,
                reload: 3,
                maxReload: 0.5,
                maxAngleDiff: 0.1 * Math.doublePI,
                targetPlayer: undefined,
                rocketPrefab: {
                    hue: 280,
                    x: 0,
                    y: 0,
                    vx: 0,
                    vy: 0,
                    trust: 0,
                    maxSpeed: 15,
                    lifetime: 1,
                    angle: 0,
                    maxTurnSpeed: 0,
                    radius: 0,
                    line: [],
                    boomPrefab: {
                        x: 0,
                        y: 0,
                        ax: 0,
                        ay: 0,
                        maxRadius: 1,
                        radius: 0,
                        lifetime: 0.5,
                        maxLifetime: 0.5,
                        hideTime: 0.2,
                        maxHideTime: 0.2
                    }
                },
                scale: 1,
                texture: "towerSniper"
            }
        ],
        texture: "ship4",
        scale: 5
    }
];

function main() {
    lastUpd = new Date().getTime();
    canv = document.getElementById("canvas");
    document.body.style.backgroundColor = backgroundColor;
    cam.x = mapW / 2;
    cam.y = mapH / 2;
    addEventListener("resize", updateZZ);
    ctx = canv.getContext("2d");
    updateZZ();

    for (const en of enemies) {
        en.angle = Math.atan2(en.y - mapH / 2, en.x - mapW / 2);
    }

    if (debug.extraPlayers && debug.extraPlayers > 0) {
        for (let i = 0; i < debug.extraPlayers; i++) {
            const angle = i * Math.doublePI / debug.extraPlayers;
            const pl = new Player(15 + Math.cos(angle) * 14, 15 + Math.sin(angle) * 14, i / debug.extraPlayers * 360, angle + Math.PI);
            players.push(pl);
        }
    }

    for (let x = 0; x < mapW; x++) {
        map[x] = {};
        for (let y = 0; y < mapH; y++) {
            const value = Math.unLerp(simplex2(x / 10, y / 10));
            let type = null;
            if (value <= 0.2) {
                type = "water";
            } else if (value >= 0.6) {
                type = "grass";
            }
            if (type) {
                map[x][y] = { value, type };
            }
        }
    }

    canv.addEventListener("contextmenu", (event) => {
        event.preventDefault();
        return false;
    });
    canv.addEventListener("mousedown", onMouseDown);
    canv.addEventListener("mousemove", onMouseMove);
    canv.addEventListener("mouseup", onMouseUp);
    if ("onwheel" in document) {
        canv.addEventListener("wheel", onMouseWheel);
    } else if ("onmousewheel" in document) {
        canv.addEventListener("mousewheel", onMouseWheel);
    } else {
        canv.addEventListener("MozMousePixelScroll", onMouseWheel);
    }

    requestAnimationFrame(draw);
}

function draw(time) {
    let nTime = Date.now();
    let deltaTime = (nTime - lastUpd) / 1000;

    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    if (arrows.isUp("bossbattle")) {
        for (let p = 0; p < players.length; p++) {
            for (let c = 0; c < checkpoints.length;) {
                if (!passCheckpoint(c, p, 0))
                    c++;
            }
        }
    }
    if (arrows.isUp("pause")) {
        isPlay = !isPlay;
    }

    if (isPlay) {
        updateBooms(nTime, deltaTime);
        updatePlayers(nTime, deltaTime);
        updateRockets(nTime, deltaTime);
        updateEnemies(nTime, deltaTime);
        updateBosses(nTime, deltaTime);
    }

    drawMap(nTime, deltaTime);
    drawMapGrid(nTime, deltaTime);
    drawCheckpoints(nTime, deltaTime);
    drawRockets(nTime, deltaTime);
    drawEnemies(nTime, deltaTime);
    drawPlayers(nTime, deltaTime);
    drawBosses(nTime, deltaTime);
    drawBooms(nTime, deltaTime);
    drawAnimations(nTime, deltaTime);
    drawUI(nTime, deltaTime);

    if (!allowLowFps && deltaTime > 1 / 25) {
        if (confirm(`Низкий FPS: ${ Math.round(1 / deltaTime) }. Снизить разрешение?`)) {
            graphicScale *= 0.6;
            updateZZ();
        }
        allowLowFps = true;
    }

    arrows.resetFrame();
    lastUpd = nTime;
    requestAnimationFrame(draw);
}

function drawAnimations(nTime, deltaTime) {
    for (let i = 0; i < animations.length; i++) {
        const anim = animations[i];
        anim.progress += deltaTime / anim.duration;
        const x = Math.lerp(anim.progress, anim.from_x, anim.to_x);
        const y = Math.lerp(anim.progress, anim.from_y, anim.to_y);
        const a = Math.atan2(anim.to_x - anim.from_x, anim.from_y - anim.to_y);
        drawImage(imgs["shotLarge"], screenX(x), screenY(y), a, zz * 0.3);
        if (anim.progress >= 1) {
            animations.splice(i, 1);
        }
    }
}

function drawMap(nTime, deltaTime) {
    const mapMinX = screenX(0);
    const mapMinY = screenY(0);
    const mapMaxX = screenX(mapW);
    const mapMaxY = screenY(mapH);

    ctx.fillStyle = "#1e222f";
    ctx.fillRect(0, 0, canv.width, canv.height);

    ctx.fillStyle = "#333";
    ctx.fillRect(
        mapMinX,
        mapMinY,
        mapMaxX - mapMinX,
        mapMaxY - mapMinY
    );

    for (let x = 0; x < mapW; x++) {
        for (let y = 0; y < mapH; y++) {
            const cell = map[x][y];
            if (!cell)
                continue;

            switch (cell.type) {
                case "grass":
                    ctx.fillStyle = `#40774e95`;
                    break;
                case "water":
                    ctx.fillStyle = `#296ec395`;
                    break;
                default:
                    continue;
            }

            ctx.fillRect(screenX(x), screenY(y), zz, zz);
        }
    }
}

function drawMapGrid(nTime, deltaTime) {
    if (cam.scale > 30) {
        return;
    } else if (cam.scale < 20) {
        ctx.strokeStyle = "#888888";
    } else {
        const alpha = Math.unLerp(cam.scale, 30, 20);
        ctx.strokeStyle = `rgb(136,136,136,${ alpha })`;
    }
    const mapMinX = screenX(0);
    const mapMinY = screenY(0);
    const mapMaxX = screenX(mapW);
    const mapMaxY = screenY(mapH);
    const borderL = Math.max(mapMinX, 0);
    const borderR = Math.min(mapMaxX, canv.width);
    const borderU = Math.max(mapMinY, 0);
    const borderD = Math.min(mapMaxY, canv.height);

    ctx.beginPath();
    ctx.lineWidth = 1;
    for (let x = 0; x <= mapW; x += 1) {
        let lx = screenX(x);
        if (0 <= lx && lx < canv.width) {
            ctx.moveTo(lx, borderU);
            ctx.lineTo(lx, borderD);
        }
    }
    for (let y = 0; y <= mapH; y += 1) {
        let ly = screenY(y);
        if (0 <= ly && ly < canv.height) {
            ctx.moveTo(borderL, ly);
            ctx.lineTo(borderR, ly);
        }
    }
    ctx.stroke();
}

function updatePlayers(nTime, deltaTime) {
    for (let p = 0; p < players.length; p++) {
        const pl = players[p];
        if (pl.isDead)
            continue;
        if (debug.playerMouseControl) {
            if (mouse.mode === "second") {
                const pl = pl;
                pl.trust = pl.maxTrust;
                const tAngle = Math.atan2(mouse.mapY - pl.y, mouse.mapX - pl.x);
                pl.rotate = Math.angleDiff(pl.angle, tAngle);
            } else {
                pl.trust = 0;
            }
        } else if (debug.playerBots) {
            const target = checkpoints
                .reduce((prev, cp) => {
                    if (cp.checkedPlayers.includes(p))
                        return prev;
                    const distance = Math.hypot(cp.x - pl.x, cp.y - pl.y);
                    if (!prev || prev.distance > distance) {
                        prev = {
                            cp,
                            distance
                        };
                    }
                    return prev;
                }, undefined)
                ?.cp;
            const tAngle = Math.atan2(target.y - pl.y, target.x - pl.x);
            pl.rotate = Math.angleDiff(pl.angle, tAngle);
            pl.trust = pl.maxTrust;
        } else {
            const pn = p + 1;
            let rotate = 0;
            if (arrows.isHold(`left${ pn }`))
                rotate = -1;
            else if (arrows.isHold(`right${ pn }`))
                rotate = 1;
            if (arrows.isDown(`up${ pn }`))
                pl.trust = pl.maxTrust;
            if (arrows.isUp(`up${ pn }`))
                pl.trust = 0;

            pl.rotate = rotate;
        }
    }

    for (let pl of players) {
        if (pl.isDead)
            continue;
        pl.angle += pl.rotate * pl.turnSpeed * deltaTime;

        let rad = pl.angle;
        let vx = Math.cos(rad) * pl.trust * deltaTime / 2;
        let vy = Math.sin(rad) * pl.trust * deltaTime / 2;
        pl.vx = (pl.vx + vx);
        pl.vy = (pl.vy + vy);

        if (pl.vx !== 0 || pl.vy !== 0) {
            const speed = Math.hypot(pl.vx, pl.vy) / pl.maxSpeed;
            if (speed > 1) {
                pl.vx /= speed;
                pl.vy /= speed;
            }
            pl.x += pl.vx * deltaTime;
            pl.y += pl.vy * deltaTime;
        }


        if (pl.x < 0 || mapW < pl.x) {
            pl.x = Math.clamp(pl.x, 0, mapW);
            pl.vx = -pl.vx * 0.5;
        }

        if (pl.y < 0 || mapH < pl.y) {
            pl.y = Math.clamp(pl.y, 0, mapH);
            pl.vy = -pl.vy * 0.5;
        }


        if (pl.line.length <= 0 || (nTime - pl.line[pl.line.length - 1].t >= 20))
            pl.line.push({ t: nTime, x: pl.x, y: pl.y, vx: -pl.vx, vy: -pl.vy });
        while (nTime - pl.line[0].t >= 1000) {
            pl.line.shift();
        }
        for (let l = 0; l < pl.line.length; l++) {
            pl.line[l].x += pl.line[l].vx * deltaTime;
            pl.line[l].y += pl.line[l].vy * deltaTime;
        }
    }

    for (let p = 0; p < players.length; p++) {
        const pl = players[p];
        if (pl.isDead)
            continue;

        const deadBoom = booms.findIndex((bm) => {
            const distance = Math.hypot(bm.x - pl.x, bm.y - pl.y);
            return (distance < bm.radius);
        });

        if (deadBoom >= 0) {
            killPlayer(p);
        }

        for (let c = 0; c < checkpoints.length; c++) {
            const cp = checkpoints[c];
            if (Math.hypot(cp.x - pl.x, cp.y - pl.y) < cp.radius) {
                passCheckpoint(c, p);
            }
        }

        pl.score += deltaTime;
    }
}

function drawPlayers(nTime, deltaTime) {
    ctx.shadowBlur = 0;
    for (let pl of players) {
        let x = screenX(pl.x);
        let y = screenY(pl.y);

        if (pl.line.length > 1 && !pl.isDead) {
            for (let t = 1; t < pl.line.length; t++) {
                ctx.beginPath();
                ctx.moveTo(screenX(pl.line[t - 1].x), screenY(pl.line[t - 1].y));
                let per = t / pl.line.length;
                ctx.lineWidth = Math.max(1, (zz * 0.05) * (per * 5));
                ctx.strokeStyle = `hsla(${ pl.hue },100%,50%,${ per * 0.6 })`;
                ctx.lineTo(screenX(pl.line[t].x), screenY(pl.line[t].y));
                ctx.stroke();
            }
        }

        ctx.lineWidth = Math.max(1, zz * 0.05);

        if (!pl.isDead) {
            let ax = pl.x + Math.cos(pl.angle);
            let ay = pl.y + Math.sin(pl.angle);
            drawLine(pl.x, pl.y, ax, ay);
        }
        drawArcScreen(x, y, zz * pl.scale * 0.7, `hsla(${ pl.hue },100%,50%,${ pl.isDead ? 0.2 : 0.5 })`);
        drawImage(imgs["player"], x, y, pl.angle + Math.PI2, zz * pl.scale, null, 1);
    }
}

function updateEnemies(nTime, deltaTime) {
    for (const en of enemies) {
        const targetPlayer = players
            .reduce((prev, pl, pi) => {
                if (pl.isDead)
                    return prev;
                const distance = Math.hypot(pl.x - en.x, pl.y - en.y);
                if (distance < en.radius && (!prev || prev.distance > distance)) {
                    prev = {
                        pl,
                        distance
                    };
                }
                return prev;
            }, undefined)
            ?.pl;
        if (targetPlayer) {
            const tAngle = Math.atan2(targetPlayer.y - en.y, targetPlayer.x - en.x);
            const angleDiff = Math.angleDiff(en.angle, tAngle);
            en.angle += Math.clamp(angleDiff, -deltaTime * en.maxTurnSpeed, deltaTime * en.maxTurnSpeed);

            if (en.reload <= 0 && Math.abs(angleDiff) <= en.maxAngleDiff) {
                const rocketPrefab = Number.isInteger(en.rocketPrefab) ? rocketPrefabs[en.rocketPrefab] : en.rocketPrefab;
                let vx = Math.cos(en.angle) * rocketPrefab.maxSpeed;
                let vy = Math.sin(en.angle) * rocketPrefab.maxSpeed;
                rockets.push(Object.assign({}, rocketPrefab, {
                    x: en.x,
                    y: en.y,
                    vx,
                    vy,
                    angle: en.angle,
                    line: []
                }));
                en.reload += en.maxReload;
            }
        }
        if (en.reload > 0)
            en.reload -= deltaTime;
        en.targetPlayer = targetPlayer;
    }
}

function drawEnemies(nTime, deltaTime) {
    ctx.lineWidth = Math.max(1, zz * 0.05);
    ctx.shadowBlur = 0;
    for (let en of enemies) {
        let x = screenX(en.x);
        let y = screenY(en.y);
        if (debug.enemies) {
            if (en.targetPlayer) {
                ctx.strokeStyle = "#00ff0088";
                ctx.fillStyle = "#00ff0022";
                ctx.beginPath();
                ctx.moveTo(screenX(en.x), screenY(en.y));
                ctx.arc(screenX(en.x), screenY(en.y), en.radius * zz, en.angle - en.maxAngleDiff, en.angle + en.maxAngleDiff);
                ctx.lineTo(screenX(en.x), screenY(en.y));
                ctx.stroke();
                ctx.fill();
            } else {
                drawArc(en.x, en.y, en.radius, "#ff000022", "#ff000088");
            }
        }

        drawImage(imgs["towerPlatform"], x, y, 0, zz * 1.5);
        drawImage(imgs[en.texture || "towerGeneral"], x, y, en.angle + Math.PI2, zz * 1.2);
    }
}

function updateRockets(nTime, deltaTime) {
    for (let i = 0; i < rockets.length;) {
        const rk = rockets[i];
        if (rk.lifetime <= 0) {
            boomRocket(i);
        } else if (rk.x < 0 || mapW < rk.x || rk.y < 0 || mapH < rk.y) {
            boomRocket(i);
        } else {
            let isNeedBoom = false;
            if (rk.targetPlayer) {
                isNeedBoom = Math.hypot(rk.targetPlayer.x - rk.x, rk.targetPlayer.y - rk.y) < rk.targetPlayer.scale;
            } else if (!(rk.radius && rk.radius > 0 && rk.maxTurnSpeed && rk.maxTurnSpeed > 0)) {
                isNeedBoom = players.findIndex(pl => {
                    if (pl.isDead)
                        return false;
                    const distance = Math.hypot(pl.x - rk.x, pl.y - rk.y);
                    return (distance < pl.scale);
                }) >= 0;
            }
            if (!isNeedBoom) {
                isNeedBoom = booms.findIndex(bm => {
                    const distance = Math.hypot(bm.x - rk.x, bm.y - rk.y);
                    return (distance < bm.radius);
                }) >= 0;
            }
            if (isNeedBoom) {
                boomRocket(i);
            } else {
                rk.lifetime -= deltaTime;
                i++;
            }
        }
    }
    for (const rk of rockets) {
        if (rk.radius && rk.radius > 0 && rk.maxTurnSpeed && rk.maxTurnSpeed > 0) {
            const targetPlayer = players
                .reduce((prev, pl, pi) => {
                    if (pl.isDead)
                        return prev;
                    const distance = Math.hypot(pl.x - rk.x, pl.y - rk.y);
                    if (distance < rk.radius && (!prev || prev.distance > distance)) {
                        prev = {
                            pl,
                            distance
                        };
                    }
                    return prev;
                }, undefined)
                ?.pl;
            if (targetPlayer) {
                const tAngle = Math.atan2(targetPlayer.y - rk.y, targetPlayer.x - rk.x);
                rk.angle += Math.clamp(Math.angleDiff(rk.angle, tAngle), -deltaTime * rk.maxTurnSpeed, deltaTime * rk.maxTurnSpeed);
            }
            rk.targetPlayer = targetPlayer;
        }

        let vx = Math.cos(rk.angle) * rk.trust * deltaTime / 2;
        let vy = Math.sin(rk.angle) * rk.trust * deltaTime / 2;
        rk.vx = (rk.vx + vx);
        rk.vy = (rk.vy + vy);

        if (rk.vx !== 0 || rk.vy !== 0) {
            const speed = Math.hypot(rk.vx, rk.vy) / rk.maxSpeed;
            if (speed > 1) {
                rk.vx /= speed;
                rk.vy /= speed;
            }
            rk.x += rk.vx * deltaTime;
            rk.y += rk.vy * deltaTime;
        }

        if (rk.line.length <= 0 || (nTime - rk.line[rk.line.length - 1].t >= 20))
            rk.line.push({ t: nTime, x: rk.x, y: rk.y, vx: -rk.vx, vy: -rk.vy });
        while (nTime - rk.line[0].t >= 1000) {
            rk.line.shift();
        }
        for (let l = 0; l < rk.line.length; l++) {
            rk.line[l].x += rk.line[l].vx * deltaTime;
            rk.line[l].y += rk.line[l].vy * deltaTime;
        }
    }
}

function drawRockets(nTime, deltaTime) {
    ctx.lineWidth = Math.max(1, zz * 0.05);
    ctx.shadowBlur = 0;
    for (let rk of rockets) {
        let x = screenX(rk.x);
        let y = screenY(rk.y);

        if (debug.rockets) {
            ctx.lineWidth = 2;
            drawDirection(rk.x, rk.y, rk.angle, "#ff0000");
            drawDirection(rk.x, rk.y, Math.atan2(rk.vy, rk.vx), "#0000ff");
            if (rk.targetPlayer) {
                const tAngle = Math.atan2(rk.targetPlayer.y - rk.y, rk.targetPlayer.x - rk.x);
                drawDirection(rk.x, rk.y, tAngle, "#00ff00");
            }
            if (rk.radius > 0)
                drawArcScreen(x, y, rk.radius * zz, null, "#ffffff88");
        }
        if (rk.line.length > 1) {
            for (let t = 1; t < rk.line.length; t++) {
                ctx.beginPath();
                ctx.moveTo(screenX(rk.line[t - 1].x), screenY(rk.line[t - 1].y));
                let per = t / rk.line.length;
                ctx.lineWidth = Math.max(1, (zz * 0.1) * per);
                ctx.strokeStyle = `hsla(${ rk.hue },100%,50%,${ per * 0.6 })`;
                ctx.lineTo(screenX(rk.line[t].x), screenY(rk.line[t].y));
                ctx.stroke();
            }
        }
        const alpha = ((rk.lifetime >= 1.5) || (nTime % 400 > 200)) ? 1 : 0.2;
        drawImage(imgs["rocket"], x, y, rk.angle + Math.PI2, (alpha < 1) ? zz : (zz * 0.8), null, alpha);
    }
}

function updateBosses(nTime, deltaTime) {
    if (!isBossbattle)
        return;
    if (debug.player3Boss) {
        let rotate = 0;
        if (arrows.isHold(`left3`))
            rotate = -1;
        else if (arrows.isHold(`right3`))
            rotate = 1;
        if (arrows.isDown(`up3`))
            bosses[0].trust = bosses[0].maxTrust;
        if (arrows.isUp(`up3`))
            bosses[0].trust = 0;

        bosses[0].rotate = rotate;
    }

    for (const bs of bosses) {
        if (debug.player3Boss && bs === bosses[0]) {
            bs.angle += bs.rotate * bs.turnSpeed * deltaTime;
            let vx = Math.cos(bs.angle) * bs.trust * deltaTime / 2;
            let vy = Math.sin(bs.angle) * bs.trust * deltaTime / 2;
            bs.vx = (bs.vx + vx);
            bs.vy = (bs.vy + vy);
        } else {
            while (!bs.target || Math.hypot(bs.target.x - bs.x, bs.target.y - bs.y) < bs.scale)
                bs.target = {
                    x: Math.random() * mapW,
                    y: Math.random() * mapH
                };
            const tAngle = Math.atan2(bs.target.y - bs.y, bs.target.x - bs.x);
            bs.angle += Math.clamp(Math.angleDiff(bs.angle, tAngle), -deltaTime * bs.turnSpeed, deltaTime * bs.turnSpeed);
            let vx = Math.cos(bs.angle) * bs.maxTrust * deltaTime;
            let vy = Math.sin(bs.angle) * bs.maxTrust * deltaTime;
            bs.vx = bs.vx + vx;
            bs.vy = bs.vy + vy;
        }

        if (bs.vx !== 0 || bs.vy !== 0) {
            const speed = Math.hypot(bs.vx, bs.vy) / bs.maxSpeed;
            if (speed > 1) {
                bs.vx /= speed;
                bs.vy /= speed;
            }
            bs.x += bs.vx * deltaTime;
            bs.y += bs.vy * deltaTime;
        }

        for (const wp of bs.weapons) {
            if (bs.noRotateTexture) {
                wp.x = bs.x + wp.ox;
                wp.y = bs.y + wp.oy;
            } else {
                const wDist = Math.hypot(wp.ox, wp.oy);
                const wAngle = bs.angle + Math.atan2(wp.oy, wp.ox) + Math.PI2;
                wp.x = bs.x + Math.cos(wAngle) * wDist;
                wp.y = bs.y + Math.sin(wAngle) * wDist;
            }
            let targetPlayer;
            if (debug.player3Boss && bs === bosses[0]) {
                if (mouse.mode === "second") {
                    targetPlayer = {
                        x: mouse.mapX,
                        y: mouse.mapY
                    };
                }
            } else {
                targetPlayer = players
                    .reduce((prev, pl, pi) => {
                        if (pl.isDead)
                            return prev;
                        const distance = Math.hypot(pl.x - wp.x, pl.y - wp.y);
                        if (distance < wp.radius && (!prev || prev.distance > distance)) {
                            prev = {
                                pl,
                                distance
                            };
                        }
                        return prev;
                    }, undefined)
                    ?.pl;
            }
            if (targetPlayer) {
                const tAngle = Math.atan2(targetPlayer.y - wp.y, targetPlayer.x - wp.x);
                const angleDiff = Math.angleDiff(tAngle, bs.noRotateTexture ? wp.angle : (bs.angle - wp.angle));
                wp.angle += Math.clamp(angleDiff, -deltaTime * wp.maxTurnSpeed, deltaTime * wp.maxTurnSpeed);
                const mapAngle = bs.angle - wp.angle;

                if (wp.reload <= 0 && Math.abs(angleDiff) <= wp.maxAngleDiff) {
                    const rocketPrefab = Number.isInteger(wp.rocketPrefab) ? rocketPrefabs[wp.rocketPrefab] : wp.rocketPrefab;
                    let vx = Math.cos(mapAngle) * rocketPrefab.maxSpeed;
                    let vy = Math.sin(mapAngle) * rocketPrefab.maxSpeed;
                    rockets.push(Object.assign({}, rocketPrefab, {
                        x: wp.x,
                        y: wp.y,
                        vx,
                        vy,
                        angle: mapAngle,
                        line: []
                    }));
                    wp.reload += wp.maxReload;
                }
            } else if (wp.angle !== 0) {
                const angleDiff = Math.angleDiff(wp.angle, 0);
                wp.angle += Math.clamp(angleDiff, -deltaTime * wp.maxTurnSpeed, deltaTime * wp.maxTurnSpeed);
            }
            if (wp.reload > 0)
                wp.reload -= deltaTime;
            wp.targetPlayer = targetPlayer;
        }
    }
}

function drawBosses(nTime, deltaTime) {
    if (!isBossbattle)
        return;
    for (let bs of bosses) {
        let x = screenX(bs.x);
        let y = screenY(bs.y);

        const bAngle = bs.noRotateTexture ? -Math.PI2 : bs.angle;
        drawImage(imgs[bs.texture], x, y, bAngle + Math.PI2, zz * bs.scale, null, 1);

        for (const wp of bs.weapons) {
            drawImage(imgs[wp.texture || "towerGeneral"], screenX(wp.x), screenY(wp.y), bAngle - wp.angle + Math.PI2, zz * wp.scale);
        }
    }
}

function updateBooms(nTime, deltaTime) {
    for (let i = 0; i < booms.length;) {
        const bm = booms[i];
        if (bm.lifetime > 0) {
            bm.lifetime -= deltaTime;
            bm.radius = bm.maxRadius * Math.easeOutQuint(1 - bm.lifetime / bm.maxLifetime);
            i++;
        } else if (bm.hideTime > 0) {
            bm.hideTime -= deltaTime;
            bm.radius = 0;
            i++;
        } else {
            booms.splice(i, 1);
        }
    }
}

function drawBooms(nTime, deltaTime) {
    ctx.shadowBlur = 0;
    for (let bm of booms) {
        let x = screenX(bm.x);
        let y = screenY(bm.y);

        if (bm.lifetime > 0) {
            const size1 = bm.maxRadius * Math.easeOutQuad(1 - bm.lifetime / bm.maxLifetime);
            const size2 = bm.maxRadius * Math.easeOutQuint(1 - bm.lifetime / bm.maxLifetime);
            const color = `hsla(${ bm.hue || 0 }, 100%, 67%, 0.7)`;
            drawArcScreen(x, y, size1 * zz, color);
            drawArcScreen(x, y, size2 * zz, color);
            if (debug.booms)
                drawArcScreen(x, y, bm.radius * zz, null, "#ff00аа");
        } else {
            const alpha = Math.easeInQuint(bm.hideTime / bm.maxHideTime) * 0.7;
            const color = `hsl(${ bm.hue || 0 }, 100%, 67%, ${ alpha })`;
            drawArcScreen(x, y, bm.maxRadius * zz, color);
            drawArcScreen(x, y, bm.maxRadius * zz, color);
        }
    }
}

function drawUI(nTime, deltaTime) {
    ctx.lineWidth = 1;
    ctx.strokeStyle = "black";

    const values = [];

    if (debug.fps) {
        values.push({ k: "fps", v: Math.roundN(1 / deltaTime, 2) });
    }

    if (debug.info) {
        values.push(
            { k: "nTime", v: Math.roundN(nTime / 1000, 2) },
            { k: "camX", v: Math.roundN(cam.x, 2) },
            { k: "camY", v: Math.roundN(cam.y, 2) },
            { k: "camScale", v: Math.roundN(cam.scale, 2) },
            {
                k: "mouseX",
                v: `${ Math.roundN(mouse.screenX, 2) } / ${ Math.roundN(mouse.mapX, 2) } / ${ Math.round(mouse.mapX) }`
            },
            {
                k: "mouseY",
                v: `${ Math.roundN(mouse.screenY, 2) } / ${ Math.roundN(mouse.mapY, 2) } / ${ Math.round(mouse.mapY) }`
            },
            { k: "mouseMode", v: mouse.mode }
        );
    }

    if (values.length > 0) {
        ctx.textBaseline = "top";
        ctx.textAlign = "start";
        ctx.font = `${ 2 * graphicScale }vmin Arial`;
        ctx.fillStyle = "#eee";

        let str = 1;
        let h = 15;

        for (let i = 0; i < values.length; i++) {
            let txt = `${ values[i].k }: ${ values[i].v }`;
            ctx.strokeText(txt, 20, h * str);
            ctx.fillText(txt, 20, h * str);
            str++;
        }
    }

    ctx.textBaseline = "center";
    ctx.textAlign = "center";
    ctx.font = `${ 4 * graphicScale }vmin Arial`;

    const step = canv.width / (players.length + 1);
    let total = 0;
    for (let p = 0; p < players.length; p++) {
        const pl = players[p];
        const txt = Math.round(pl.score).toString();
        total += pl.score;
        const x = step * (0.5 + p);
        ctx.fillStyle = `hsla(${ pl.hue },100%,50%,${ pl.isDead ? 0.4 : 0.9 })`;
        ctx.strokeText(txt, x, 40);
        ctx.fillText(txt, x, 40);
    }
    const txt = Math.round(total).toString();
    const x = step * (0.5 + players.length);
    ctx.fillStyle = `rgba(240, 240, 240, 0.9)`;
    ctx.strokeText(txt, x, 40);
    ctx.fillText(txt, x, 40);

    if (!isPlay) {
        ctx.font = `${ 10 * graphicScale }vmin Arial`;
        const txt = "PAUSE";
        ctx.fillStyle = `#ffaa00`;
        ctx.strokeText(txt, canv.width / 2, canv.height / 2);
        ctx.fillText(txt, canv.width / 2, canv.height / 2);
    }
}

function drawCheckpoints(nTime, deltaTime) {
    for (let cp of checkpoints) {
        let x = screenX(cp.x);
        let y = screenY(cp.y);
        const radius = cp.radius * zz;

        const step = Math.doublePI / (players.length * 2);

        for (let p = 0; p < players.length; p++) {
            if (!cp.checkedPlayers.includes(p))
                drawArcScreen(x, y, radius, `hsla(${ players[p].hue },100%,50%,0.33)`);
        }
        for (let p = 0; p < players.length; p++) {
            if (!cp.checkedPlayers.includes(p))
                highlight(`hsla(${ players[p].hue },100%,50%,0.8)`, p);
        }

        function highlight(color, p) {
            ctx.fillStyle = color;
            const angle = (nTime / 1000) % Math.doublePI;
            ctx.beginPath();
            ctx.arc(x, y, radius * 1.1, (p * step) + angle, ((p + 1) * step) + angle);
            ctx.arc(x, y, radius * 0.9, ((p + 1) * step) + angle, (p * step) + angle, true);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(x, y, radius * 1.1, ((p + players.length) * step) + angle, ((p + players.length + 1) * step) + angle);
            ctx.arc(x, y, radius * 0.9, ((p + players.length + 1) * step) + angle, ((p + players.length) * step) + angle, true);
            ctx.fill();
        }
    }
}

function drawArcScreen(sx, sy, sr, fillStyle, strokeStyle) {
    ctx.beginPath();
    ctx.arc(sx, sy, sr, 0, Math.PI * 2);
    if (fillStyle) {
        ctx.fillStyle = fillStyle;
        ctx.fill();
    }
    if (strokeStyle) {
        ctx.strokeStyle = strokeStyle;
        ctx.stroke();
    }
}

function drawArc(x, y, r, fillStyle, strokeStyle) {
    return drawArcScreen(screenX(x), screenY(y), r * zz, fillStyle, strokeStyle);
}

function drawLineScreen(sx1, sy1, sx2, sy2, color, width) {
    if (color)
        ctx.strokeStyle = color;
    if (width)
        ctx.lineWidth = width;
    ctx.beginPath();
    ctx.moveTo(sx1, sy1);
    ctx.lineTo(sx2, sy2);
    ctx.stroke();
}

function drawLine(x1, y1, x2, y2, color, width) {
    return drawLineScreen(screenX(x1), screenY(y1), screenX(x2), screenY(y2), color, width);
}

function drawDirection(x, y, angle, color, scale = 1) {
    ctx.strokeStyle = color;
    let ax = x + Math.cos(angle) * scale;
    let ay = y + Math.sin(angle) * scale;
    drawLine(x, y, ax, ay);
}

function drawImage(image, x, y, angleInRadians = 0, w = 1, h = null, alpha = 1) {
    ctx.globalAlpha = alpha;
    if (!h) h = w;
    if (angleInRadians !== 0) {
        ctx.translate(x, y);
        ctx.rotate(angleInRadians);
        ctx.drawImage(image, -w / 2, -h / 2, w, h);
        ctx.rotate(-angleInRadians);
        ctx.translate(-x, -y);
    } else
        ctx.drawImage(image, x - w / 2, y - h / 2, w, h);
    ctx.globalAlpha = 1;
}

function boomRocket(rocketId) {
    const rk = rockets[rocketId];
    if (rk.boomPrefab) {
        booms.push(Object.assign({}, rk.boomPrefab, {
            x: rk.x,
            y: rk.y,
            ax: rk.vx,
            ay: rk.vy
        }));
    }
    rockets.splice(rocketId, 1);
}

function passCheckpoint(checkpointId, playerId, score = 20) {
    const cp = checkpoints[checkpointId];
    if (cp && !cp.checkedPlayers.includes(playerId)) {
        cp.checkedPlayers.push(playerId);
        players[playerId].score += score;
        if (cp.checkedPlayers.length >= players.length) {
            checkpoints.splice(checkpointId, 1);
            if (checkpoints.length <= 0 && players.findIndex((pl) => !pl.isDead) >= 0) {
                bossBattle();
            }
            return true;
        } else
            return false;
    }
}

function killPlayer(playerId) {
    const pl = players[playerId];
    pl.vx = 0;
    pl.vy = 0;
    pl.rotate = 0;
    pl.trust = 0;
    pl.isDead = true;

    booms.push(Object.assign({}, playerBoomPrefab, {
        x: pl.x,
        y: pl.y,
        ax: pl.vx,
        ay: pl.vy
    }));

    for (let c = 0; c < checkpoints.length;) {
        if (!passCheckpoint(c, playerId, 0))
            c++;
    }
}

function bossBattle() {
    isBossbattle = true;
    enemies.length = 0;
    checkpoints.length = 0;
    for (let p = 0; p < players.length; p++) {
        players[p].isDead = false;
    }
}

function screenX(mapX) {
    return canv.width / 2 + zz * (mapX - cam.x);
}

function screenY(mapY) {
    return canv.height / 2 + zz * (mapY - cam.y);
}

function mapX(mapX) {
    return (mapX * graphicScale - canv.width / 2) / zz + cam.x;
}

function mapY(mapY) {
    return (mapY * graphicScale - canv.height / 2) / zz + cam.y;
}

function updateZZ() {
    let box = canv.getBoundingClientRect();
    let w = box.left + box.right * graphicScale;
    let h = box.top + box.bottom * graphicScale;
    canv.width = w;
    canv.height = h;
    zz = Math.max(w, h) / (cam.scale * 2);
    wScale = w / zz;
    hScale = h / zz;
}

function onMouseDown(e) {
    const x = e.offsetX || e.layerX;
    const y = e.offsetY || e.layerY;
    mouse.screenX = mouse.lastScreenX = x;
    mouse.screenY = mouse.lastScreenY = y;
    mouse.mapX = mouse.lastMapX = mapX(x);
    mouse.mapY = mouse.lastMapY = mapY(y);
    mouse.mode = e.button === 0 ? "wait" : "second";
}

function onMouseMove(e) {
    const x = e.offsetX || e.layerX;
    const y = e.offsetY || e.layerY;

    mouse.lastScreenX = mouse.screenX;
    mouse.lastScreenY = mouse.screenY;
    mouse.screenX = x;
    mouse.screenY = y;

    mouse.lastMapX = mouse.mapX;
    mouse.lastMapY = mouse.mapY;
    mouse.mapX = mapX(x);
    mouse.mapY = mapY(y);

    if (mouse.mode && (mouse.mode === "wait" || mouse.mode === "move")) {
        mouse.mode = "move";
        cam.x = Math.clamp(cam.x + (mouse.lastScreenX - mouse.screenX) / canv.width * wScale, 0, mapW);
        cam.y = Math.clamp(cam.y + (mouse.lastScreenY - mouse.screenY) / canv.height * hScale, 0, mapH);
    }
}

function onMouseUp(e) {
    const x = e.offsetX || e.layerX;
    const y = e.offsetY || e.layerY;

    mouse.screenX = mouse.lastScreenX = x;
    mouse.screenY = mouse.lastScreenY = y;
    mouse.mapX = mouse.lastMapX = mapX(x);
    mouse.mapY = mouse.lastMapY = mapY(y);

    mouse.mode = null;
}

function onMouseWheel(e) {
    e = e || window.event;
    const delta = e.deltaY || e.detail || e.wheelDelta;
    cam.scale = Math.clamp(cam.scale + delta / zz, cam.minScale, cam.maxScale);
    updateZZ();

    e.preventDefault ? e.preventDefault() : (e.returnValue = false);
}

addEventListener("load", main);
