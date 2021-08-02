"use strict";

import "./features.js";
import imgs from "./images.js";
import { simplex2 } from "./perlin.js";
import trackKeys from "./trackKeys.js";
import { Player } from "./player.js";
import { Boom } from "./boom.js";
import { ByteStream } from "./byteStream.js";
import * as Sounds from "./sounds.js";
import { Rocket } from "./rocket.js";

const REPLAY_VERSION = 0;

let replayStream = null;
let replayInfo = null;
let viewReplayMode = false;
const PLAYER_ID = getPlayerId();
const arrows = trackKeys({
    // Player 1
    left1: [ "KeyA" ],
    down1: [ "KeyS" ],
    up1: [ "KeyW" ],
    right1: [ "KeyD" ],

    // Player 2
    left2: [ "ArrowLeft" ],
    down2: [ "ArrowDown" ],
    up2: [ "ArrowUp" ],
    right2: [ "ArrowRight" ],

    // Player 3
    left3: [ "KeyJ" ],
    down3: [ "KeyK" ],
    up3: [ "KeyI" ],
    right3: [ "KeyL" ],

    // Player 4
    left4: [ "Numpad4" ],
    down4: [ "Numpad5" ],
    up4: [ "Numpad8" ],
    right4: [ "Numpad6" ],

    pause: [ "Escape" ],
    bossbattle: [ "Backquote" ]
});

let menuSelectLevel = undefined;
let elDownloadReplay = undefined;
let elWatchReplay = undefined;
let menu = undefined;
const levels = [
    {
        title: "Level 1",
        path: "./levels/level-1.js"
    },
    {
        title: "Level 2",
        path: "./levels/level-2.js"
    },
    {
        title: "Level 3",
        path: "./levels/level-3.js"
    },
    {
        title: "Level 4",
        path: "./levels/level-4.js"
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
let isPlay = false;
let isBossbattle = false;

let uniInput = [];

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
    scale: 16,
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
const gravityHoles = [];

let backgroundMusic = [
    "sounds/m1.mp3",
    "sounds/m2.mp3",
    "sounds/m3.mp3",
    "sounds/m4.mp3",
    "sounds/m5.mp3",
    "sounds/m6.mp3"
];

function main() {
    console.log("pid", PLAYER_ID);
    menuSelectLevel = document.getElementById("menu-levels");
    menu = document.getElementById("menu");
    elDownloadReplay = document.getElementById("downloadReplay");
    elWatchReplay = document.getElementById("watchReplay");
    document.getElementById("openReplay").addEventListener("change", openReplay, false);

    for (let i = 0; i < levels.length; i++) {
        const level = levels[i];
        const btn = document.createElement("button");
        btn.textContent = level.title;
        btn.addEventListener("click", () => loadLevel(i));
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

    let downloaded = 0;
    Promise.all(
        backgroundMusic.map((ms) =>
            Sounds.loadSound(ms, ms)
                .then(() => {
                    downloaded++;
                    console.log(`music downloaded: ${ downloaded } / ${ backgroundMusic.length }`);
                    nextMusic();
                })
        )
    )
        .then(() => console.log("music downloaded"));

    let userInteractiveStart = false;
    let musicStarted = false;
    const nextMusic = (force) => {
        if (force || userInteractiveStart && !musicStarted) {
            const downloaded = backgroundMusic.filter(ms => Sounds.isLoaded(ms));
            if (downloaded.length > 0) {
                const music = downloaded.randomItem();
                Sounds.playSound(music, null, () => nextMusic(true));
                document.removeEventListener("mouseup", nextMusic);
            }
            musicStarted = true;
        }
    };
    document.addEventListener("mouseup", () => {
        userInteractiveStart = true;
        nextMusic();
    });

    setInterval(update, 1000 / 60);
}

async function loadLevel(levelId = null) {
    isPlay = false;
    rockets.length = 0;
    booms.length = 0;
    players.length = 0;
    weapons.length = 0;
    checkpoints.length = 0;
    bosses.length = 0;
    gravityHoles.length = 0;
    rocketPrefabs.length = 0;
    mapW = 30;
    mapH = 30;

    if (levelId !== null) {
        try {
            const levelPath = levels[levelId].path;
            const level = (await import(levelPath)).default;

            if (level) {
                cam = Object.assign({}, level.cam);
                if (level.sounds)
                    level.sounds.map(sd => Sounds.loadSound(sd.name, sd.url));

                if (level.gravity) {
                    for (const gravityHole of level.gravity) {
                        gravityHoles.push({
                            x: gravityHole.x,
                            y: gravityHole.y,
                            radius: gravityHole.radius || 3,
                            force: gravityHole.force || 1
                        });
                    }
                }

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

                if (level.bosses) {
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
            replayStream = new ByteStream(5000);
            replayStream.pushUint16(REPLAY_VERSION); // replay version
            replayStream.pushUint32(Math.floor(Date.now() / 1000)); // user time
            replayStream.pushUint8(levelId); // level id
            replayStream.pushUint32(PLAYER_ID); // player id
            replayStream.pushUint32(0); // random seed
            replayInfo = {
                levelId: levelId
            };
            viewReplayMode = false;
        } catch (e) {
            console.error(`failed load level ${ levelId }`, e);
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
    Sounds.playSound("waveUp");

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
            w.reload,
            w.scale !== undefined ? w.scale : 1,
            w.sound
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

async function openReplay(e) {
    const file = e.target.files[0];
    if (!file)
        return;
    const reader = new FileReader();
    reader.onload = async (e) => {
        await watchReplay(new Uint8Array(e.target.result));
    };
    reader.readAsArrayBuffer(file);
}

async function watchReplay(replayBinary) {
    const replay = new ByteStream(replayBinary.buffer);

    const replayVersion = replay.shiftUint16();
    if (replayVersion === REPLAY_VERSION) {
        if (replay.getUint8(replayBinary.length - 1) !== 0xFF || replay.getUint8(replayBinary.length - 11) !== 0xFF)
            throw new Error(`Replay parse error: wrong magic`);

        const userTime = replay.shiftUint32();
        const levelId = replay.shiftUint8();
        const playerId = replay.shiftUint32();
        const randomSeed = replay.shiftUint32();
        const userTimeEnd = replay.getUint32(replayBinary.length - 10);
        const levelId2 = replay.getUint8(replayBinary.length - 6);
        const playerId2 = replay.getUint32(replayBinary.length - 5);

        if (levelId !== levelId2 || playerId !== playerId2 || userTime >= userTimeEnd)
            throw new Error(`Replay parse error: wrong meta`);

        isPlay = false;
        await loadLevel(levelId);
        viewReplayMode = true;
        replayStream = replay;
        isPlay = true;

        console.log(`Watching replay ${ playerId }-${ userTime }, levelId: ${ levelId }`);
    } else
        throw new Error(`Replay parse error: wrong version`);
}

function setLevelsMenu(enable) {
    menu.style.display = enable ? "block" : "none";
}

function draw(time) {
    let nTime = Date.now();
    let deltaTime = Math.clamp((nTime - lastUpd) / 1000, 0, 100);

    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    drawMap(nTime, deltaTime);
    drawMapGrid(nTime, deltaTime);
    drawGravityHoles(nTime, deltaTime);
    drawCheckpoints(nTime, deltaTime);
    drawWeapons(nTime, deltaTime);
    drawRockets(nTime, deltaTime);
    drawPlayers(nTime, deltaTime);
    drawBosses(nTime, deltaTime);
    drawBooms(nTime, deltaTime);
    drawUI(nTime, deltaTime);

    lastUpd = nTime;
    requestAnimationFrame(draw);
}

function getPlayerId() {
    let playerId = getCookie("pid");
    if (playerId)
        return +playerId;
    else {
        playerId = Math.randomInt(0, 2 ** 32);
        document.cookie = `pid=${ playerId }; max-age=315360000`;
        return playerId;
    }
}

function update(time) {
    let nTime = Date.now();
    let deltaTime = 1 / 60;

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
        uniInput.length = 0;

        if (!viewReplayMode && replayStream !== null && replayInfo !== null) {
            for (let i = 1; i <= 4; i++) {
                const pl = players[i - 1];
                if (!pl) {
                    uniInput.push({
                        left: false,
                        down: false,
                        up: false,
                        right: false
                    });
                    continue;
                }
                const input = {
                    left: arrows.isHold(`left${ i }`),
                    down: arrows.isHold(`down${ i }`),
                    up: arrows.isHold(`up${ i }`),
                    right: arrows.isHold(`right${ i }`)
                };
                if (debug.easyInputMode) {
                    const y = (input.up ? -1 : 0) + (input.down ? 1 : 0);
                    const x = (input.left ? -1 : 0) + (input.right ? 1 : 0);
                    const angle = (Math.doublePI + Math.atan2(y, x)) % Math.doublePI;
                    const thrust = input.up || input.down || input.left || input.right;

                    const diff = Math.angleDiff(pl.angle, angle);
                    const diffAbs = Math.abs(diff);
                    const rotate = diffAbs > Math.doublePI * 0.01 ? (diff > 0 ? 1 : -1) : 0;

                    uniInput.push({
                        left: thrust && rotate < 0,
                        down: false,
                        up: thrust && diffAbs < Math.PI,
                        right: thrust && rotate > 0
                    });
                } else
                    uniInput.push(input);
            }

            const inputToHalfByte = (input) => (
                (input.left ? 1 : 0) |
                (input.down ? 2 : 0) |
                (input.up ? 4 : 0) |
                (input.right ? 8 : 0)
            );
            replayStream.pushUint8(inputToHalfByte(uniInput[1]) << 4 | inputToHalfByte(uniInput[0]));
            if (players.length > 2)
                replayStream.pushUint8(inputToHalfByte(uniInput[3]) << 4 | inputToHalfByte(uniInput[2]));

        } else if (viewReplayMode && replayStream !== null) {
            if (players.length > 0) {
                const byte = replayStream.shiftUint8();
                uniInput.push({
                    left: byte & 1,
                    down: byte & 2,
                    up: byte & 4,
                    right: byte & 8
                }, {
                    left: byte & 16,
                    down: byte & 32,
                    up: byte & 64,
                    right: byte & 128
                });
            }
            if (players.length > 2) {
                const byte = replayStream.shiftUint8();
                uniInput.push({
                    left: byte & 1,
                    down: byte & 2,
                    up: byte & 4,
                    right: byte & 8
                }, {
                    left: byte & 16,
                    down: byte & 32,
                    up: byte & 64,
                    right: byte & 128
                });
            }
        }

        updateBooms(nTime, deltaTime);
        updatePlayers(nTime, deltaTime);
        updateRockets(nTime, deltaTime);
        updateGravityHoles(nTime, deltaTime);
        updateWeapons(nTime, deltaTime);
        updateBosses(nTime, deltaTime);
    }
    arrows.resetFrame();
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
        if (uniInput) {
            pl.rotate = uniInput[p].left ? -1 : (uniInput[p].right ? 1 : 0);
            pl.thrust = uniInput[p].up ? pl.maxTrust : 0;
        }
    }

    for (let pl of players) {
        if (pl.isDead)
            continue;
        pl.angle += pl.rotate * pl.turnSpeed * deltaTime;

        let rad = pl.angle;
        let vx = Math.cos(rad) * pl.thrust * deltaTime / 2;
        let vy = Math.sin(rad) * pl.thrust * deltaTime / 2;
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

        if (!debug.playerImmutable) {
            const boomCollision = booms.some((bm) => Math.hypot(bm.x - pl.x, bm.y - pl.y) < bm.radius);
            if (boomCollision) {
                killPlayer(p);
            }
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
        drawImage(imgs["player"], x, y, pl.angle + Math.halfPI, zz * pl.scale, null, 1);
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
            if (en.reload <= 0 && Math.abs(angleDiff) <= en.maxAngleDiff / 2) {
                const rocket = new Rocket(
                    en.x,
                    en.y,
                    en.angle,
                    en.rocketPrefab.maxSpeed,
                    en.rocketPrefab.lifetime,
                    en.rocketPrefab.radius,
                    en.rocketPrefab.maxTurnSpeed,
                    en.rocketPrefab.hue,
                    en.rocketPrefab.boomPrefab
                );
                rockets.push(rocket);
                en.reload += en.maxReload;
                Sounds.playSound(en.sound || "s1");
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
                ctx.arc(screenX(en.x), screenY(en.y), en.radius * zz, en.angle - en.maxAngleDiff / 2, en.angle + en.maxAngleDiff / 2);
                ctx.lineTo(screenX(en.x), screenY(en.y));
                ctx.stroke();
                ctx.fill();
            } else {
                drawArc(en.x, en.y, en.radius, "#ff000022", "#ff000088");
            }
        }

        if (debug.drawReload) {
            const reloadProgress = 1 - en.reload / en.maxReload;
            if (reloadProgress >= 0) {
                const sx = screenX(en.x + 0.7);
                const w = 0.2 * zz;
                const sy = screenY(en.y - 0.4);
                const h = 0.8 * zz;

                ctx.beginPath();
                ctx.fillStyle = "#000";
                ctx.strokeStyle = "#000";
                ctx.rect(sx, sy, w, h);
                ctx.fill();
                ctx.stroke();

                ctx.fillStyle = reloadProgress >= 1 ? (en.targetPlayer ? "#33a" : "#3a3") : "#a33";
                ctx.fillRect(sx, sy + h * (1 - reloadProgress), w, h * reloadProgress);
            }
        }

        drawImage(imgs["towerPlatform"], x, y, 0, zz * en.scale * 1.5);
        drawImage(imgs[en.texture || "towerGeneral"], x, y, en.angle + Math.halfPI, zz * en.scale * 1.2);
    }
}

function updateRockets(nTime, deltaTime) {
    for (let i = 0; i < rockets.length;) {
        const rk = rockets[i];
        if (rk.lifetime <= 0) {
            boomRocket(i);
        } else if (rk.x < -1 || mapW + 1 < rk.x || rk.y < -1 || mapH + 1 < rk.y) {
            boomRocket(i);
        } else {
            let isNeedBoom = false;
            if (rk.targetPlayer) {
                isNeedBoom = Math.hypot(rk.targetPlayer.x - rk.x, rk.targetPlayer.y - rk.y) < rk.targetPlayer.scale;
            } else if (!(rk.radius && rk.radius > 0 && rk.maxTurnSpeed && rk.maxTurnSpeed > 0)) {
                isNeedBoom = players.some(pl => !pl.isDead && Math.hypot(pl.x - rk.x, pl.y - rk.y) < pl.scale);
            }
            if (!isNeedBoom) {
                isNeedBoom = booms.some(bm => Math.hypot(bm.x - rk.x, bm.y - rk.y) < bm.radius);
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
        drawImage(imgs["rocket"], x, y, rk.angle + Math.halfPI, (alpha < 1) ? zz : (zz * 0.8), null, alpha);
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
                const wAngle = bs.angle + Math.atan2(wp.y, wp.x) + Math.halfPI;
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

        const bAngle = bs.noRotateTexture ? -Math.halfPI : bs.angle;
        drawImage(imgs[bs.texture], x, y, bAngle + Math.halfPI, zz * bs.w, zz * bs.h, 1);

        for (const wp of bs.weapons) {
            drawImage(imgs[wp.texture || "towerGeneral"], screenX(wp.mx), screenY(wp.my), bAngle - wp.angle + Math.halfPI, zz * wp.scale);
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

    if (debug.drawInput && uniInput.length > 0 && uniInput.length >= players.length) {
        const btnW = canv.width * 0.2 / 3;
        const btnH = canv.height / 8;
        const btnS = Math.min(btnW, btnH);
        const sx = canv.width * 0.8;
        for (let p = 0; p < players.length; p++) {
            const pl = players[p];
            ctx.fillStyle = `hsla(${ pl.hue },100%,50%,${ pl.isDead ? 0.2 : (uniInput[p].up ? 0.9 : 0.4) })`;
            ctx.fillRect(sx + btnS + 5, p * 2 * btnS + 5, btnS - 10, btnS - 10); // up
            ctx.fillStyle = `hsla(${ pl.hue },100%,50%,${ pl.isDead ? 0.2 : (uniInput[p].left ? 0.9 : 0.4) })`;
            ctx.fillRect(sx + 5, (p * 2 * btnS + btnS) + 5, btnS - 10, btnS - 10); // left
            ctx.fillStyle = `hsla(${ pl.hue },100%,50%,${ pl.isDead ? 0.2 : (uniInput[p].down ? 0.9 : 0.4) })`;
            ctx.fillRect(sx + btnS + 5, (p * 2 * btnS + btnS) + 5, btnS - 10, btnS - 10); // down
            ctx.fillStyle = `hsla(${ pl.hue },100%,50%,${ pl.isDead ? 0.2 : (uniInput[p].right ? 0.9 : 0.4) })`;
            ctx.fillRect(sx + btnS * 2 + 5, (p * 2 * btnS + btnS) + 5, btnS - 10, btnS - 10); // right
        }
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

function drawGravityHoles(nTime, deltaTime) {
    for (let gh of gravityHoles) {
        let x = screenX(gh.x);
        let y = screenY(gh.y);
        const radius = gh.radius * zz;

        const force = 2000 - Math.abs(Math.clamp(gh.force, -100, 50)) * 20;
        const bw = gh.force > 0 ? 0 : 255;
        drawArcScreen(x, y, radius * 0.5, `rgb(${ bw },${ bw },${ bw })`);
        const iterations = 3;
        for (let i = 0; i < iterations; i++) {
            let state = (nTime + force * (i / iterations)) % force / force;
            if (gh.force < 0)
                state = 1 - state;
            const cl = `rgba(${ bw },${ bw },${ bw },${ state })`;
            drawArcScreen(x, y, radius * Math.lerp(state, 1, 0.5), cl);
        }
    }
}

function updateGravityHoles(nTime, deltaTime) {
    for (let gh of gravityHoles) {
        for (let obj of [ ...players, ...rockets ]) {
            const dist = Math.hypot(gh.x - obj.x, gh.y - obj.y);
            if (dist < gh.radius) {
                const multiplier = Math.easeOutQuad(1 - dist / gh.radius) * gh.force * deltaTime;
                const angle = Math.atan2(gh.y - obj.y, gh.x - obj.x);
                obj.vx += Math.cos(angle) * multiplier;
                obj.vy += Math.sin(angle) * multiplier;
            }
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
        Sounds.playSound("explode");
    }
    rockets.splice(rocketId, 1);
}

function passCheckpoint(checkpointId, playerId, score = 20) {
    const cp = checkpoints[checkpointId];
    if (cp && !cp.checkedPlayers.includes(playerId)) {
        cp.checkedPlayers.push(playerId);
        players[playerId].score += score;
        if (score > 0)
            Sounds.playSound("upgrate");
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
    Sounds.playSound("userDestroy");

    for (let c = 0; c < checkpoints.length;) {
        if (!passCheckpoint(c, playerId, 0))
            c++;
    }

    if (players.every(pl => pl.isDead))
        gameOver("lose");
}

function gameOver(reason) {
    setLevelsMenu(true);
    if (!viewReplayMode && replayStream) {
        replayStream.pushUint8(0xFF);
        replayStream.pushUint32(Date.now() / 1000); // user time
        replayStream.pushUint8(replayInfo.levelId); // level id
        replayStream.pushUint32(PLAYER_ID); // player id
        replayStream.pushUint8(0xFF);
        const replayBinary = replayStream.pack();
        downloadBlob(replayBinary, `replay-${ levels[replayInfo.levelId].title }-${ Math.floor(Date.now() / 1000) }.bin`, "application/octet-stream");
        elWatchReplay.onclick = () => watchReplay(replayBinary);
        console.log(`replay size: ${ replayBinary.length }`);
    }
    replayStream = null;
    replayInfo = null;
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
    zz = Math.min(w, h) / (cam.scale * 2);
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

const downloadBlob = (data, fileName, mimeType) => {
    const blob = new Blob([ data ], {
        type: mimeType
    });

    elDownloadReplay.href = window.URL.createObjectURL(blob);
    elDownloadReplay.download = fileName;
};

addEventListener("load", main);

function RGG(seed = Date.now()) {
    return function random() {
        const x = Math.sin(seed++) * 10000;
        return x - Math.floor(x);
    };
}

function getCookie(name) {
    let matches = document.cookie.match(new RegExp(
        "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, "\\$1") + "=([^;]*)"
    ));
    return matches ? decodeURIComponent(matches[1]) : undefined;
}

export class Boss {
    x = 15;
    y = -5;
    angle = Math.halfPI;
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
    scale;
    sound;

    reload = 0;
    targetPlayer = undefined;

    constructor(x, y, angle, rocketPrefab, maxTurnSpeed, radius, maxReload, maxAngleDiff, texture, reload, scale, sound) {
        this.x = x;
        this.y = y;
        this.rocketPrefab = rocketPrefab;
        this.maxTurnSpeed = maxTurnSpeed;
        this.radius = radius;
        this.maxReload = maxReload;
        this.maxAngleDiff = maxAngleDiff;
        this.angle = angle;
        this.texture = texture;
        this.scale = scale;
        this.sound = sound;
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
