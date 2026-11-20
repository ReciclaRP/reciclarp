const MESSAGES = require("../text/messages.json");

function res_error_text(kind) {
    let ks = String(kind).toUpperCase();

    if(MESSAGES[ks]) return {type: "error", description: MESSAGES[ks]};
    return {type: "error", description: "Unknown error."}
}

module.exports = {
    res_error_text
}