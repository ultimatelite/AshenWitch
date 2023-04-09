const axios = require("axios").default;

module.exports = async function(term){
    const clean = term.replace(/ +/, "+");
    const result = await axios({
        method: "GET",
        url: `https://api.urbandictionary.com/v0/define?term=${clean}`,
        headers: {
            "Accept": "application/json"
        }
    });
    return result.data.list;
}