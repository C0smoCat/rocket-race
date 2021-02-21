const imgs = {};

downloadImg("towerGeneral");
downloadImg("towerSniper");
downloadImg("towerHeavy");
downloadImg("towerPlatform");
downloadImg("rocket");
downloadImg("player");
downloadImg("ship2");
downloadImg("ship3");
downloadImg("ship4");

function downloadImg(path) {
    let img = new Image();
    img.src = `img/${ path }.png`;
    imgs[path] = img;
}

export default imgs;
