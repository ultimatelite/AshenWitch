const axios = require("axios").default;
// const FormData = require("form-data");
const fs = require("node:fs");
require("dotenv").config();

function fetchAndParse(query){
    return new Promise(async(resolve, reject)=>{
	    // I'm afraid that I wasn't allowed to implement my own
	    // image processing here, sorry! :(
	    resolve("Todo: Your image processing here");
    })
}

module.exports = async function(query, fname){
    const urlData = await fetchAndParse(query);
    try{
        const fileBuffer = await axios({url: urlData, responseType: "stream"});
        const writer = fs.createWriteStream(fname);
        fileBuffer.data.pipe(writer);
        return "success200";
    }catch(e){
        return e.toString();
    }
}
