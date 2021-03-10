"use strict";

import "./features.js";
import imgs from "./images.js";
import { simplex2 } from "./perlin.js";
import trackKeys from "./trackKeys.js";
import { Player } from "./player.js";
import { Boom } from "./boom.js";

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

    // Player 4
    left4: [ "Numpad4" ],
    right4: [ "Numpad6" ],
    up4: [ "Numpad8" ],

    pause: [ "Escape" ],
    bossbattle: [ "Backquote" ]
});

let menuSelectLevel = undefined;
const levels = [
    {
        title: "Level 1",
        path: "./levels/level-1.js"
    },
    {
        title: "Level 2",
        path: "./levels/level-2.js"
    }
];
let graphicScale = 1.00;
let backgroundColor = "#333";
let lastUpd;
let canv;
let wScale = 1;
let hScale = 1;
let zz = 0;
let ctx;
let isPlay = true;
let isBossbattle = false;

let mapW = 30;
let mapH = 30;
const map = [];
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
let cam = {
    x: 15,
    y: 15,
    scale: 20,
    minScale: 5,
    maxScale: 30
};
const players = [];
let playerBoomPrefab = undefined;
let weapons = [];
let rocketPrefabs = [];
let checkpoints = [];
let bosses = [];
const rockets = [];
const booms = [];

function main() {
    menuSelectLevel = document.getElementById("menu-levels");
    for (const level of levels) {
        const btn = document.createElement("button");
        btn.textContent = level.title;
        btn.addEventListener("click", () => loadLevel(level.path));
        menuSelectLevel.appendChild(btn);
    }

    canv = document.getElementById("canvas");
    document.body.style.backgroundColor = backgroundColor;
    addEventListener("resize", updateZZ);
    ctx = canv.getContext("2d");

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

    lastUpd = Date.now();

    loadLevel(null)
        .then(() => requestAnimationFrame(draw))
        .catch(e => console.error(e));
}

async function loadLevel(levelPath) {
    isPlay = false;
    rockets.length = 0;
    booms.length = 0;
    players.length = 0;
    weapons.length = 0;
    checkpoints.length = 0;
    bosses.length = 0;
    rocketPrefabs.length = 0;
    mapW = 30;
    mapH = 30;

    if (levelPath) {
        try {
            const level = (await import(levelPath)).default;

            if (level) {
                cam = Object.assign({}, level.cam);
                for (const pl of level.players) {
                    const player = new Player(
                        pl.x,
                        pl.y,
                        pl.hue,
                        Math.deg2rad(pl.angle || 0)
                    );
                    players.push(player);
                }
                playerBoomPrefab = getBoomPrefab(level, level.boomPrefabs[0], 200);

                for (const wp of level.weapons) {
                    weapons.push(getWeapon(level, wp));
                }

                for (const cp of level.checkpoints) {
                    const checkpoint = new Checkpoint(
                        cp.x,
                        cp.y,
                        cp.radius || 0.75
                    );
                    checkpoints.push(checkpoint);
                }

                for (const bs of level.bosses) {
                    const boss = new Boss(
                        bs.x,
                        bs.y,
                        Math.deg2rad(bs.angle || 0),
                        bs.trust || 10,
                        bs.speed || 2,
                        Math.deg2rad(bs.turnSpeed || 36),
                        bs.texture,
                        bs.w || bs.scale || 5,
                        bs.h || bs.scale || 5,
                        bs.noRotateTexture || false,
                        bs.weapons.map(w => getWeapon(level, w))
                    );
                    bosses.push(boss);
                }

                rocketPrefabs = level.rocketPrefabs.slice();

                mapW = level.mapW;
                mapH = level.mapH;

                if (debug.extraPlayers && debug.extraPlayers > 0) {
                    for (let i = 0; i < debug.extraPlayers; i++) {
                        const angle = i * Math.doublePI / debug.extraPlayers;
                        const pl = new Player(15 + Math.cos(angle) * 14, 15 + Math.sin(angle) * 14, i / debug.extraPlayers * 360, angle + Math.PI);
                        players.push(pl);
                    }
                }
            }
            setLevelsMenu(false);
        } catch (e) {
            console.error(`failed load level "${ levelPath }"`, e);
        }
    }

    map.length = 0;
    for (let x = 0; x < mapW; x++) {
        map[x] = [];
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

    updateZZ();
    lastUpd = Date.now();
    isBossbattle = false;
    isPlay = true;

    function getWeapon(level, w) {
        if (w.prefab !== undefined) {
            w = Object.assign(level.weaponPrefabs[w.prefab], w);
        }

        return new Weapon(
            w.x,
            w.y,
            w.angle !== undefined ? Math.deg2rad(w.angle) : Math.atan2(w.y - mapH / 2, w.x - mapW / 2),
            getRocketPrefab(level, w.rocketPrefab),
            Math.deg2rad(w.turnSpeed >= 0 ? w.turnSpeed : 100),
            w.radius || 7,
            w.maxReload || 4,
            Math.deg2rad(w.maxAngleDiff || 45),
            w.texture,
            w.reload
        );
    }

    function getRocketPrefab(level, r) {
        if (Number.isInteger(r)) {
            r = level.rocketPrefabs[r];
        } else if (r.prefab !== undefined) {
            r = Object.assign(level.rocketPrefabs[r.prefab], r.prefab);
            delete r.prefab;
        }
        return {
            maxSpeed: r.speed,
            lifetime: r.lifetime,
            radius: r.radius,
            maxTurnSpeed: r.turnSpeed,
            hue: r.hue || 0,
            trust: r.trust || 20,
            boomPrefab: getBoomPrefab(level, r.boomPrefab)
        };
    }

    function getBoomPrefab(level, b, hue = 0) {
        if (Number.isInteger(b)) {
            b = level.boomPrefabs[b];
        } else if (b.prefab !== undefined) {
            b = Object.assign(level.boomPrefabs[b.prefab], b.prefab);
            delete b.prefab;
        }
        return {
            radius: b.radius || 2,
            lifetime: b.lifetime || 1,
            hideTime: b.hideTime || 0.5,
            hue: hue
        };
    }
}

function setLevelsMenu(enable) {
    menuSelectLevel.style.display = enable ? "block" : "none";
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
        setLevelsMenu(!isPlay);
    }

    if (isPlay) {
        updateBooms(nTime, deltaTime);
        updatePlayers(nTime, deltaTime);
        updateRockets(nTime, deltaTime);
        updateWeapons(nTime, deltaTime);
        updateBosses(nTime, deltaTime);
    }

    drawMap(nTime, deltaTime);
    drawMapGrid(nTime, deltaTime);
    drawCheckpoints(nTime, deltaTime);
    drawRockets(nTime, deltaTime);
    drawWeapons(nTime, deltaTime);
    drawPlayers(nTime, deltaTime);
    drawBosses(nTime, deltaTime);
    drawBooms(nTime, deltaTime);
    drawUI(nTime, deltaTime);

    arrows.resetFrame();
    lastUpd = nTime;
    requestAnimationFrame(draw);
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
            pl.line.push({
                t: nTime,
                x: pl.x,
                y: pl.y,
                vx: -pl.vx,
                vy: -pl.vy
            });
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
            for (let t = 1; t <= pl.line.length; t++) {
                ctx.beginPath();
                ctx.moveTo(screenX(pl.line[t - 1].x), screenY(pl.line[t - 1].y));
                let per = t / pl.line.length;
                ctx.lineWidth = Math.max(1, (zz * 0.05) * (per * 5));
                ctx.strokeStyle = `hsla(${ pl.hue },100%,50%,${ per * 0.6 })`;
                if (t === pl.line.length)
                    ctx.lineTo(screenX(pl.x), screenY(pl.y));
                else
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

function updateWeapons(nTime, deltaTime) {
    for (const en of weapons) {
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

function drawWeapons(nTime, deltaTime) {
    ctx.lineWidth = Math.max(1, zz * 0.05);
    ctx.shadowBlur = 0;
    for (let en of weapons) {
        let x = screenX(en.x);
        let y = screenY(en.y);
        if (debug.drawWeapons) {
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

        drawImage(imgs["towerPlatform"], x, y, 0, zz * en.scale * 1.5);
        drawImage(imgs[en.texture || "towerGeneral"], x, y, en.angle + Math.PI2, zz * en.scale * 1.2);
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
            while (!bs.target || Math.hypot(bs.target.x - bs.x, bs.target.y - bs.y) < (bs.w + bs.h) / 2)
                bs.target = {
                    x: Math.random() * mapW,
                    y: Math.random() * mapH
                };
            const tAngle = Math.atan2(bs.target.y - bs.y, bs.target.x - bs.x);
            bs.angle += Math.clamp(Math.angleDiff(bs.angle, tAngle), -deltaTime * bs.turnSpeed, deltaTime * bs.turnSpeed);
            let vx = Math.cos(bs.angle) * bs.maxTrust * deltaTime;
            let vy = Math.sin(bs.angle) * bs.maxTrust * deltaTime;
            bs.vx += vx;
            bs.vy += vy;
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
                wp.mx = bs.x + wp.x;
                wp.my = bs.y + wp.y;
            } else {
                const wDist = Math.hypot(wp.x, wp.y);
                const wAngle = bs.angle + Math.atan2(wp.y, wp.x) + Math.PI2;
                wp.mx = bs.x + Math.cos(wAngle) * wDist;
                wp.my = bs.y + Math.sin(wAngle) * wDist;
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
                        const distance = Math.hypot(pl.x - wp.mx, pl.y - wp.my);
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
                const tAngle = Math.atan2(targetPlayer.y - wp.my, targetPlayer.x - wp.mx);
                const angleDiff = Math.angleDiff(tAngle, bs.noRotateTexture ? wp.angle : (bs.angle - wp.angle));
                wp.angle += Math.clamp(angleDiff, -deltaTime * wp.maxTurnSpeed, deltaTime * wp.maxTurnSpeed);
                const mapAngle = bs.angle - wp.angle;

                if (wp.reload <= 0 && Math.abs(angleDiff) <= wp.maxAngleDiff) {
                    const rocketPrefab = Number.isInteger(wp.rocketPrefab) ? rocketPrefabs[wp.rocketPrefab] : wp.rocketPrefab;
                    let vx = Math.cos(mapAngle) * rocketPrefab.maxSpeed;
                    let vy = Math.sin(mapAngle) * rocketPrefab.maxSpeed;
                    rockets.push(Object.assign({}, rocketPrefab, {
                        x: wp.mx,
                        y: wp.my,
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
        drawImage(imgs[bs.texture], x, y, bAngle + Math.PI2, zz * bs.w, zz * bs.h, 1);

        for (const wp of bs.weapons) {
            drawImage(imgs[wp.texture || "towerGeneral"], screenX(wp.mx), screenY(wp.my), bAngle - wp.angle + Math.PI2, zz * wp.scale);
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
            const halfWeight = zz * 0.07;
            ctx.beginPath();
            ctx.arc(x, y, radius + halfWeight, (p * step) + angle, ((p + 1) * step) + angle);
            ctx.arc(x, y, radius - halfWeight, ((p + 1) * step) + angle, (p * step) + angle, true);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(x, y, radius + halfWeight, ((p + players.length) * step) + angle, ((p + players.length + 1) * step) + angle);
            ctx.arc(x, y, radius - halfWeight, ((p + players.length + 1) * step) + angle, ((p + players.length) * step) + angle, true);
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
        const boom = new Boom(
            rk.x,
            rk.y,
            rk.boomPrefab.radius,
            rk.boomPrefab.lifetime,
            rk.boomPrefab.hideTime,
            rk.boomPrefab.hue
        );
        booms.push(boom);
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

    const boom = new Boom(
        pl.x,
        pl.y,
        playerBoomPrefab.radius,
        playerBoomPrefab.lifetime,
        playerBoomPrefab.hideTime,
        playerBoomPrefab.hue
    );
    booms.push(boom);

    for (let c = 0; c < checkpoints.length;) {
        if (!passCheckpoint(c, playerId, 0))
            c++;
    }

    if (players.every(pl => pl.isDead)) {
        setLevelsMenu(true);
    }
}

function bossBattle() {
    isBossbattle = true;
    weapons.length = 0;
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

export class Boss {
    x = 15;
    y = -5;
    angle = Math.PI2;
    maxTrust = 10;
    maxSpeed = 2;
    turnSpeed = 0.1 * Math.doublePI;
    noRotateTexture = false;
    texture = "ship2";
    w = 5;
    h = 5;
    weapons = [];

    vx = 0;
    vy = 0;
    trust = 0;
    rotate = 0;
    target = null;

    constructor(x, y, angle, maxTrust, maxSpeed, turnSpeed, texture, w, h, noRotateTexture, weapons) {
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.maxTrust = maxTrust;
        this.maxSpeed = maxSpeed;
        this.turnSpeed = turnSpeed;
        this.texture = texture;
        this.w = w;
        this.h = h;
        this.noRotateTexture = noRotateTexture;
        this.weapons = weapons;
    }
}

export class Weapon {
    x;
    y;
    angle;
    maxTurnSpeed;
    radius;
    maxReload;
    maxAngleDiff;
    rocketPrefab;
    texture;

    scale = 1;
    reload = 0;
    targetPlayer = undefined;

    constructor(x, y, angle, rocketPrefab, maxTurnSpeed, radius, maxReload, maxAngleDiff, texture, reload) {
        this.x = x;
        this.y = y;
        this.rocketPrefab = rocketPrefab;
        this.maxTurnSpeed = maxTurnSpeed;
        this.radius = radius;
        this.maxReload = maxReload;
        this.maxAngleDiff = maxAngleDiff;
        this.angle = angle;
        this.texture = texture;
        this.reload = reload !== undefined ? reload : maxReload / 2 + 5;
    }
}

export class Checkpoint {
    radius = 0.75;
    x;
    y;
    checkedPlayers = [];

    constructor(x, y, radius) {
        this.x = x;
        this.y = y;
        this.radius = radius;
    }
}
