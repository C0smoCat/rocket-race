// https://flukeout.github.io/simple-sounds/

const sounds = {
    "explode": {
        url: "sounds/exploded.wav"
    },
    "userDestroy": {
        url: "sounds/userDestroy.ogg"
    },
    "upgrate": {
        url: "sounds/upgrate.ogg"
    },
    "waveUp": {
        url: "sounds/waveUp.ogg"
    },
    "s1": {
        url: "sounds/s1.ogg"
    }
};

export const soundContext = new AudioContext();

for (const key in sounds) {
    loadSound(key);
}

export function isLoaded(name) {
    return !!(sounds[name]?.buffer);
}

export function loadSound(name, fallbackUrl = undefined) {
    return new Promise(resolve => {
        if (!sounds[name])
            sounds[name] = { url: fallbackUrl };
        const sound = sounds[name];
        if (isLoaded(name)) {
            resolve(name);
            return;
        }
        const url = sound.url || fallbackUrl;

        const request = new XMLHttpRequest();
        request.open("GET", url, true);
        request.responseType = "arraybuffer";

        request.onload = () => {
            soundContext.decodeAudioData(request.response, (newBuffer) => {
                sound.buffer = newBuffer;
                resolve(name);
            });
        };

        request.send();
    });
}

export function playSound(name, options, cb) {
    const sound = sounds[name];
    const soundVolume = sounds[name].volume || debug?.musicVolume || 0.3;

    const buffer = sound.buffer;
    if (buffer) {
        const source = soundContext.createBufferSource();
        source.buffer = buffer;

        if (cb) {
            source.onended = (source, event) => {
                cb(name, event);
            };
        }

        const volume = soundContext.createGain();

        if (options) {
            if (options.volume) {
                volume.gain.value = soundVolume * options.volume;
            }
        } else {
            volume.gain.value = soundVolume;
        }

        volume.connect(soundContext.destination);
        source.connect(volume);
        source.start(0);

        return { volume, source };
    }
}
