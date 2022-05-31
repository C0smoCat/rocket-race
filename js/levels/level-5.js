export default {
    mapW: 30,
    mapH: 30,
    cam: {
        x: 15,
        y: 15,
        scale: 16,
        minScale: 5,
        maxScale: 30
    },
    players: [
        { x: 1, y: 14, hue: 0, angle: 0 },
        { x: 29, y: 1, hue: 240, angle: 180 }
    ],
    weapons: [
        { prefab: 0, x: 5, y: 25 },
        { prefab: 0, x: 25, y: 5 },
        { prefab: 0, x: 15, y: 15 },
        { prefab: 1, x: 20, y: 15 },
        { prefab: 2, x: 15, y: 20 },
        { prefab: 2, x: 15, y: 10 }
    ],
    weaponPrefabs: [
        {
            turnSpeed: 36,
            radius: 15,
            minRadius: 7,
            maxReload: 3,
            maxAngleDiff: 180,
            texture: "towerSniper",
            rocketPrefab: {
                hue: 280,
                speed: 35,
                lifetime: 1,
                turnSpeed: 0,
                radius: 0,
                boomPrefab: { radius: 1, lifetime: 0.4, hideTime: 0.2 }
            }
        },
        {
            turnSpeed: 100,
            radius: 5,
            maxReload: 2,
            maxAngleDiff: 75,
            texture: "towerGeneral",
            sound: "s1",
            rocketPrefab: 0
        },
        {
            type: "lazer",
            turnSpeed: 30,
            turnSpeedOnCharge: 15,
            turnSpeedOnFire: 3,
            radius: 20,
            minRadius: 3,
            length: 30,
            width: 7,
            maxReload: 2,
            maxAngleDiff: 15,
            texture: "towerLazer",
            sound: "s1"
        }
    ],
    checkpoints: [
        { x: 4, y: 4 },
        { x: 26, y: 26 },
        { x: 26, y: 4 },
        { x: 4, y: 26 },
        { x: 4, y: 15 },
        { x: 8, y: 15 },
        { x: 26, y: 15 },
        { x: 22, y: 15 },
        { x: 15, y: 4 },
        { x: 15, y: 8 },
        { x: 15, y: 26 },
        { x: 15, y: 22 }
    ],
    rocketPrefabs: [
        {
            speed: 6,
            lifetime: 10,
            radius: 5,
            turnSpeed: 180,
            hue: 340,
            boomPrefab: 1
        },
        {
            speed: 25,
            lifetime: 5,
            radius: 0,
            turnSpeed: 0,
            hue: 240,
            boomPrefab: 2
        },
        {
            speed: 4,
            lifetime: 90,
            radius: 15,
            turnSpeed: 70,
            hue: 140,
            boomPrefab: 3
        }
    ],
    gravity: [
        { x: 5, y: 25, radius: 5, force: 15 },
        { x: 25, y: 5, radius: 5, force: -15 }
    ],
    boomPrefabs: [
        { radius: 2, lifetime: 3, hideTime: 1 },
        { radius: 2, lifetime: 1, hideTime: 0.5 },
        { radius: 3, lifetime: 1, hideTime: 0.2 },
        { radius: 5, lifetime: 5, hideTime: 1 }
    ]
};
