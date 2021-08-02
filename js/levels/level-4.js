export default {
    mapW: 32,
    mapH: 32,
    cam: {
        x: 16,
        y: 16,
        scale: 17,
        minScale: 5,
        maxScale: 32
    },
    players: [
        { x: 4, y: 4, hue: 0, angle: 0 },
        { x: 28, y: 28, hue: 240, angle: 180 }
    ],
    weapons: [
        { prefab: 0, x: 4, y: 12 },
        { prefab: 0, x: 20, y: 20 },
        { prefab: 0, x: 20, y: 4 }
    ],
    weaponPrefabs: [
        {
            turnSpeed: 100,
            radius: 7,
            maxReload: 2,
            maxAngleDiff: 75,
            texture: "towerGeneral",
            sound: "s1",
            rocketPrefab: 0
        }
    ],
    checkpoints: [
        { x: 4, y: 4, radius: 1 },
        { x: 12, y: 4, radius: 1 },
        { x: 28, y: 4, radius: 1 },
        { x: 12, y: 12, radius: 1 },
        { x: 20, y: 12, radius: 1 },
        { x: 28, y: 12, radius: 1 },
        { x: 4, y: 20, radius: 1 },
        { x: 12, y: 20, radius: 1 },
        { x: 28, y: 20, radius: 1 },
        { x: 4, y: 28, radius: 1 },
        { x: 12, y: 28, radius: 1 },
        { x: 20, y: 28, radius: 1 },
        { x: 28, y: 28, radius: 1 }
    ],
    gravity: [
        { x: 8, y: 24, radius: 2, force: -40 },
        { x: 16, y: 24, radius: 2, force: -40 },
        { x: 24, y: 24, radius: 2, force: -40 },
        { x: 8, y: 16, radius: 2, force: -40 },
        { x: 16, y: 16, radius: 2, force: -40 },
        { x: 24, y: 16, radius: 2, force: -40 },
        { x: 8, y: 8, radius: 2, force: -40 },
        { x: 16, y: 8, radius: 2, force: -40 },
        { x: 24, y: 8, radius: 2, force: -40 },

        { x: 8, y: 26, radius: 2, force: -40 },
        { x: 8, y: 28, radius: 2, force: -40 },
        { x: 8, y: 30, radius: 2, force: -40 },
        { x: 8, y: 32, radius: 2, force: -40 },
        { x: 8, y: 22, radius: 2, force: -40 },
        { x: 8, y: 20, radius: 2, force: -40 },
        { x: 8, y: 18, radius: 2, force: -40 },
        { x: 16, y: 0, radius: 2, force: -40 },
        { x: 16, y: 2, radius: 2, force: -40 },
        { x: 16, y: 4, radius: 2, force: -40 },
        { x: 16, y: 6, radius: 2, force: -40 },
        { x: 24, y: 20, radius: 2, force: -40 },
        { x: 24, y: 22, radius: 2, force: -40 },
        { x: 24, y: 18, radius: 2, force: -40 },
        { x: 24, y: 12, radius: 2, force: -40 },
        { x: 24, y: 14, radius: 2, force: -40 },
        { x: 24, y: 10, radius: 2, force: -40 },
        { x: 10, y: 24, radius: 2, force: -40 },
        { x: 12, y: 24, radius: 2, force: -40 },
        { x: 14, y: 24, radius: 2, force: -40 },
        { x: 10, y: 16, radius: 2, force: -40 },
        { x: 12, y: 16, radius: 2, force: -40 },
        { x: 14, y: 16, radius: 2, force: -40 },
        { x: 32, y: 24, radius: 2, force: -40 },
        { x: 26, y: 24, radius: 2, force: -40 },
        { x: 28, y: 24, radius: 2, force: -40 },
        { x: 30, y: 24, radius: 2, force: -40 },
        { x: 10, y: 8, radius: 2, force: -40 },
        { x: 12, y: 8, radius: 2, force: -40 },
        { x: 14, y: 8, radius: 2, force: -40 },
        { x: 8, y: 0, radius: 2, force: -40 },
        { x: 24, y: 0, radius: 2, force: -40 },
        { x: 24, y: 32, radius: 2, force: -40 },
        { x: 16, y: 32, radius: 2, force: -40 },
        { x: 0, y: 8, radius: 2, force: -40 },
        { x: 0, y: 16, radius: 2, force: -40 },
        { x: 32, y: 8, radius: 2, force: -40 },
        { x: 32, y: 16, radius: 2, force: -40 },
        { x: 0, y: 24, radius: 2, force: -40 }
    ],
    rocketPrefabs: [
        {
            speed: 6,
            lifetime: 10,
            radius: 5,
            turnSpeed: 180,
            hue: 340,
            boomPrefab: 1
        }
    ],
    boomPrefabs: [
        { radius: 2, lifetime: 3, hideTime: 1 },
        { radius: 2, lifetime: 1, hideTime: 0.5 },
        { radius: 3, lifetime: 1, hideTime: 0.2 },
        { radius: 5, lifetime: 5, hideTime: 1 }
    ],
    sounds: [
        { name: "s1", url: "sounds/s1.ogg" }
    ]
};
