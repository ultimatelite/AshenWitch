const {unlinkSync} = require("node:fs");
const path = require("node:path");
const BACKEND_LOCATION = __dirname.replace(/\/functions/gi, "/backends");
const DRIPIN_LOCATION = path.join(BACKEND_LOCATION, "dripin.js");
const downloadImage = require(DRIPIN_LOCATION);
async function saveImage(prompt, output){
    const outputPath = path.join(BACKEND_LOCATION.replace("/backends", "/img_output"), output);
    try{
        const msgPath = await downloadImage(prompt, outputPath);
        return {imagePath: outputPath, errorMessage: msgPath, status: 0};
    }catch(e){
        return {imagePath: null, errorMessage: e.tostring(), status: 1};
    }
}
module.exports = {saveImage, unlinkSync};