export default function trackKeys(arrowsMap) {
    let input = Object.create(null);
    let inputFrame = Object.create(null);
    let kkeys = Object.keys(arrowsMap);
    let reInput = Object.create(null);
    let keysMap = Object.create(null);
    for (let k of kkeys) {
        for (let b of arrowsMap[k]) {
            keysMap[k] = {
                name: k,
                onDown: [],
                onUp: []
            };
            reInput[b] = k;
        }
    }

    function handler(event) {
        let keyMap = keysMap[reInput[event.code]];
        if (keyMap) {
            if (event.type === "keydown") {
                if (!inputManager.isMultiDownProtect || !input[keyMap.name]) {
                    input[keyMap.name] = true;
                    inputFrame[keyMap.name] = true;
                    CheckActions(keyMap.onDown);
                }
            } else {
                input[keyMap.name] = false;
                inputFrame[keyMap.name] = false;
                CheckActions(keyMap.onUp);
            }
            event.preventDefault();
        }
    }

    function CheckActions(actionsArray) {
        for (let m = 0; m < actionsArray.length;) {
            let act = actionsArray[m];
            act.callback();
            if (act.once)
                actionsArray.splice(m, 1);
            else
                m++;
        }
    }

    addEventListener("keydown", handler);
    addEventListener("keyup", handler);

    function addKey(actionsArray, key, callback, once) {
        let keyMap = keysMap[key];
        if (!keyMap)
            throw new Error("Key not implemented");
        actionsArray = keyMap[actionsArray];
        if (callback && typeof callback === "function") {
            let oldCallback = actionsArray.find(v => !v.once && v.callback === callback);
            if (!oldCallback)
                actionsArray.push({
                    once: !!once,
                    callback
                });
        } else
            throw new Error("Callback is not function");
    }

    function removeKey(actionsArray, key, callback) {
        let keyMap = keysMap[key];
        if (!keyMap)
            throw new Error("Key not implemented");
        actionsArray = keyMap[actionsArray];
        if (callback && typeof callback === "function") {
            for (let m = 0; m < actionsArray.length;) {
                let act = actionsArray[m];
                if (act.callback === callback)
                    actionsArray.splice(m, 1);
                else
                    m++;
            }
        } else
            throw new Error("Callback is not function");
    }

    let inputManager = {};
    inputManager.isMultiDownProtect = true;
    inputManager.isHold = (key) =>
        input[key] === true;
    inputManager.isUp = (key) =>
        inputFrame[key] === false;
    inputManager.onUp = {};
    inputManager.onUp.add = (key, callback, once = false) =>
        addKey("onUp", key, callback, once);
    inputManager.onUp.once = (key, callback) =>
        addKey("onUp", key, callback, true);
    inputManager.onUp.remove = (key, callback) =>
        removeKey("onUp", key, callback);
    inputManager.isDown = (key) =>
        inputFrame[key] === true;
    inputManager.onDown = {};
    inputManager.onDown.add = (key, callback, once = false) =>
        addKey("onDown", key, callback, once);
    inputManager.onDown.once = (key, callback) =>
        addKey("onDown", key, callback, true);
    inputManager.onDown.remove = (key, callback) =>
        removeKey("onDown", key, callback);
    inputManager.resetFrame = () =>
        inputFrame = Object.create(null);
    return inputManager;
}