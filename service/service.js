/**
 * The purpose of this module is to get service calls
 */
const fetch = require("node-fetch");

const get = async url => {
    return await (await(fetch(url))).json();
};

module.exports.get = get;