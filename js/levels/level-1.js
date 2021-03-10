export default {
    mapW: 30,
    mapH: 30,
    cam: {
        x: 15,
        y: 15,
        scale: 20,
        minScale: 5,
        maxScale: 30
    },
    players: [
        { x: 10, y: 10, hue: 0, angle: 0 },
        { x: 20, y: 20, hue: 240, angle: 180 }
    ],
    weapons: [
        { prefab: 0, x: 10, y: 20 },
        { prefab: 0, x: 20, y: 10 },
        { prefab: 0, x: 8, y: 28 },
        { prefab: 0, x: 22, y: 2 },
        { prefab: 1, x: 5, y: 5 },
        { prefab: 1, x: 25, y: 25 },
        { prefab: 2, x: 5, y: 15 },
        { prefab: 2, x: 25, y: 15 }
    ],
    weaponPrefabs: [
        {
            turnSpeed: 100,
            radius: 7,
            maxReload: 2,
            maxAngleDiff: 75,
            texture: "towerGeneral",
            rocketPrefab: 0
        },
        {
            turnSpeed: 75,
            radius: 15,
            maxReload: 4,
            maxAngleDiff: 4,
            texture: "towerSniper",
            rocketPrefab: 1
        },
        {
            turnSpeed: 36,
            radius: 15,
            maxReload: 10,
            maxAngleDiff: 75,
            texture: "towerHeavy",
            rocketPrefab: 2
        },
        {
            turnSpeed: 108,
            radius: 10,
            maxReload: 1,
            maxAngleDiff: 36,
            texture: "towerSniper",
            rocketPrefab: {
                hue: 280,
                speed: 15,
                lifetime: 1,
                turnSpeed: 0,
                radius: 0,
                boomPrefab: {
                    radius: 1,
                    lifetime: 0.5,
                    hideTime: 0.2
                }
            }
        }
    ],
    checkpoints: [
        { x: 25, y: 5 },
        { x: 15, y: 2 },
        { x: 5, y: 25 },
        { x: 15, y: 28 },
        { x: 15, y: 15 },
        { x: 20, y: 15 },
        { x: 10, y: 15 },
        { x: 15, y: 10 },
        { x: 15, y: 20 },
        { x: 20, y: 25 },
        { x: 10, y: 5 },
        { x: 25, y: 20 },
        { x: 5, y: 10 },
        { x: 28, y: 28 },
        { x: 2, y: 2 }
    ],
    bosses: [
        {
            x: 15,
            y: -5,
            angle: 90,
            trust: 10,
            speed: 2,
            turnSpeed: 36,
            texture: "ship2",
            weapons: [
                { prefab: 1, x: 1, y: 0, angle: 270 },
                { prefab: 1, x: -1, y: 0, angle: 270 },
                { prefab: 0, x: 2, y: -1.8, angle: 270 },
                { prefab: 0, x: -2, y: -1.8, angle: 270 }
            ]
        },
        {
            x: 15,
            y: 35,
            trust: 10,
            speed: 2,
            angle: 270,
            turnSpeed: 36,
            noRotateTexture: true,
            texture: "ship3",
            weapons: [
                {
                    x: 0,
                    y: -0.6,
                    angle: 270,
                    turnSpeed: 0,
                    radius: 25,
                    maxReload: 7.5,
                    maxAngleDiff: 360,
                    scale: 1,
                    texture: "towerHeavy",
                    rocketPrefab: {
                        hue: 280,
                        trust: 0,
                        speed: 0,
                        lifetime: 0,
                        turnSpeed: 0,
                        radius: 0,
                        boomPrefab: {
                            radius: 6,
                            lifetime: 7,
                            hideTime: 1
                        }
                    }
                }
            ]
        },
        {
            x: -25,
            y: 15,
            trust: 10,
            speed: 2,
            angle: 90,
            turnSpeed: 36,
            texture: "ship4",
            w: 2,
            weapons: [
                { x: 0, y: 1, angle: 270, prefab: 3 },
                { x: 0, y: -1, angle: 0, prefab: 3 }
            ]
        }
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
            speed: 15,
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
    boomPrefabs: [
        { radius: 2, lifetime: 3, hideTime: 1 },
        { radius: 2, lifetime: 1, hideTime: 0.5 },
        { radius: 3, lifetime: 1, hideTime: 0.2 },
        { radius: 5, lifetime: 5, hideTime: 1 }
    ]
};
