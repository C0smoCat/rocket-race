export default {
    mapW: 40,
    mapH: 30,
    cam: {
        x: 20,
        y: 15,
        scale: 16,
        minScale: 5,
        maxScale: 35
    },
    players: [
        { x: 19, y: 14, hue: 0, angle: 225 },
        { x: 21, y: 16, hue: 240, angle: 45 },
        { x: 19, y: 16, hue: 140, angle: 135 },
        { x: 21, y: 14, hue: 190, angle: 315 }
    ],
    weapons: [
        { prefab: 0, x: 7, y: 5 },
        { prefab: 0, x: 15, y: 5 },
        { prefab: 0, x: 7, y: 10 },
        { prefab: 0, x: 15, y: 10 },

        { prefab: 0, x: 33, y: 25 },
        { prefab: 0, x: 25, y: 25 },
        { prefab: 0, x: 25, y: 20 },
        { prefab: 0, x: 33, y: 20 },

        { prefab: 0, x: 7, y: 25 },
        { prefab: 0, x: 15, y: 25 },
        { prefab: 0, x: 7, y: 20 },
        { prefab: 0, x: 15, y: 20 },

        { prefab: 0, x: 25, y: 5 },
        { prefab: 0, x: 33, y: 5 },
        { prefab: 0, x: 25, y: 10 },
        { prefab: 0, x: 33, y: 10 },

        { prefab: 1, x: 11, y: 15 },
        { prefab: 1, x: 20, y: 7.5 },
        { prefab: 1, x: 29, y: 15 },
        { prefab: 1, x: 20, y: 22.5 }
    ],
    weaponPrefabs: [
        {
            turnSpeed: 100,
            radius: 10,
            maxReload: 2,
            maxAngleDiff: 55,
            texture: "towerGeneral",
            rocketPrefab: 0
        },
        {
            turnSpeed: 75,
            radius: 20,
            maxReload: 4,
            maxAngleDiff: 4,
            texture: "towerSniper",
            rocketPrefab: 1
        },
        {
            turnSpeed: 0,
            radius: 20,
            maxReload: 0.5,
            maxAngleDiff: 360,
            texture: "towerGeneral",
            scale: 0,
            rocketPrefab: {
                speed: 0,
                lifetime: 0,
                radius: 0,
                turnSpeed: 0,
                hue: 340,
                boomPrefab: {
                    radius: 1,
                    lifetime: 3,
                    hideTime: 0.5
                }
            }
        }
    ],
    checkpoints: [
        { x: 29, y: 22.5 },
        { x: 11, y: 7.5 },
        { x: 11, y: 22.5 },
        { x: 29, y: 7.5 },
        { x: 20, y: 15 },
        { x: 25, y: 15 },
        { x: 15, y: 15 },
        { x: 20, y: 10 },
        { x: 20, y: 20 },

        { x: 20, y: 27 },
        { x: 20, y: 3 },
        { x: 37, y: 15 },
        { x: 3, y: 15 },

        { x: 2, y: 28 },
        { x: 38, y: 2 },
        { x: 38, y: 28 },
        { x: 2, y: 2 }
    ],
    bosses: [
        {
            x: 35,
            y: 15,
            w: 3,
            h: 1,
            angle: 180,
            trust: 100,
            speed: 4,
            turnSpeed: 180,
            texture: "ship5",
            weapons: [
                { prefab: 2, x: 0, y: 0, angle: 0 },
                { prefab: 0, x: 0, y: 0, angle: 0 }
            ]
        },
        {
            x: -5,
            y: 15,
            w: 3,
            h: 1,
            angle: 0,
            trust: 100,
            speed: 4,
            turnSpeed: 180,
            texture: "ship5",
            weapons: [
                { prefab: 2, x: 0, y: 0, angle: 0 },
                { prefab: 0, x: 0, y: 0, angle: 0 }
            ]
        },
        {
            x: 15,
            y: -5,
            w: 3,
            h: 1,
            angle: 90,
            trust: 100,
            speed: 4,
            turnSpeed: 180,
            texture: "ship5",
            weapons: [
                { prefab: 2, x: 0, y: 0, angle: 0 },
                { prefab: 0, x: 0, y: 0, angle: 0 }
            ]
        },
        {
            x: 15,
            y: 35,
            w: 3,
            h: 1,
            angle: 270,
            trust: 100,
            speed: 4,
            turnSpeed: 180,
            texture: "ship5",
            weapons: [
                { prefab: 2, x: 0, y: 0, angle: 0 },
                { prefab: 0, x: 0, y: 0, angle: 0 }
            ]
        },
        {
            x: 15,
            y: 45,
            w: 6,
            h: 2,
            angle: 270,
            trust: 10,
            speed: 2,
            turnSpeed: 180,
            texture: "ship6",
            weapons: [
                {
                    x: 0,
                    y: 0,
                    turnSpeed: 0,
                    radius: 30,
                    maxReload: 5,
                    maxAngleDiff: 360,
                    texture: "towerPulse",
                    rocketPrefab: {
                        speed: 0,
                        lifetime: 0,
                        radius: 0,
                        turnSpeed: 0,
                        hue: 340,
                        boomPrefab: {
                            radius: 7,
                            lifetime: 25,
                            hideTime: 1
                        }
                    }
                }
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
            speed: 25,
            lifetime: 5,
            radius: 0,
            turnSpeed: 0,
            hue: 240,
            boomPrefab: 2
        }
    ],
    boomPrefabs: [
        { radius: 2, lifetime: 3, hideTime: 1 },
        { radius: 2, lifetime: 1, hideTime: 0.5 },
        { radius: 3, lifetime: 1, hideTime: 0.2 }
    ]
};
