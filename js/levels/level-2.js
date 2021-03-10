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
        { x: 1, y: 14, hue: 0, angle: 0 },
        { x: 29, y: 16, hue: 240, angle: 180 },
        { x: 29, y: 14, hue: 140, angle: 180 },
        { x: 1, y: 16, hue: 190, angle: 0 }
    ],
    weapons: [
        { prefab: 0, x: 4.5, y: 4.5 },
        { prefab: 0, x: 25.5, y: 4.5 },
        { prefab: 0, x: 25.5, y: 25.5 },
        { prefab: 0, x: 4.5, y: 25.5 },
        { prefab: 1, x: 15, y: 9.4 },
        { prefab: 1, x: 15, y: 20.5 },
        { prefab: 2, x: 15, y: 27 },
        { prefab: 2, x: 15, y: 3 },
        { prefab: 2, x: 15, y: 15 }
    ],
    weaponPrefabs: [
        {
            turnSpeed: 100,
            radius: 7,
            maxReload: 2,
            maxAngleDiff: 75,
            rocketPrefab: 0,
            texture: "towerGeneral"
        },
        {
            turnSpeed: 75,
            radius: 15,
            maxReload: 4,
            maxAngleDiff: 4,
            rocketPrefab: 1,
            texture: "towerSniper"
        },
        {
            turnSpeed: 36,
            radius: 15,
            maxReload: 10,
            maxAngleDiff: 75,
            rocketPrefab: 2,
            texture: "towerHeavy"
        },
        {
            turnSpeed: 36,
            radius: 20,
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
            },
        }
    ],
    checkpoints: [
        { x: 4, y: 15 },
        { x: 26, y: 15 },
        { x: 1, y: 29 },
        { x: 29, y: 29 },
        { x: 1, y: 1 },
        { x: 29, y: 1 },
        { x: 15, y: 6 },
        { x: 15, y: 24 },
        {
            x: 15,
            y: 15,
            radius: 1.5
        }
    ],
    bosses: [
        {
            x: 35,
            y: 35,
            angle: 270,
            trust: 10,
            speed: 3,
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
                    maxReload: 0.2,
                    maxAngleDiff: 360,
                    texture: "towerHeavy",
                    rocketPrefab: {
                        hue: 280,
                        speed: 0,
                        lifetime: 3,
                        turnSpeed: 0,
                        radius: 0,
                        boomPrefab: { radius: 2, lifetime: 7, hideTime: 1, }
                    },
                }
            ],
        },
        {
            x: -5,
            y: -5,
            angle: 90,
            speed: 2,
            trust: 10,
            turnSpeed: 36,
            weapons: [
                {
                    x: 0,
                    y: 1,
                    angle: 270,
                    prefab: 3
                },
                {
                    x: 0,
                    y: -1,
                    angle: 270,
                    reload: 1.5,
                    prefab: 3
                }
            ],
            texture: "ship4",
            scale: 5
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
        {
            radius: 2,
            lifetime: 3,
            hideTime: 1
        },
        {
            radius: 2,
            lifetime: 1,
            hideTime: 0.5
        },
        {
            radius: 3,
            lifetime: 1,
            hideTime: 0.2
        },
        {
            radius: 5,
            lifetime: 5,
            hideTime: 1
        }
    ]
};
