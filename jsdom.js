const { JSDOM } = require("jsdom");
const { computeAccessibleName } = require("dom-accessibility-api");

const dom = new JSDOM(`<h1><span>Hello </span><strong>World!</strong></h1>`);
const h1 = dom.window.document.querySelector("h1");

console.log(`"${computeAccessibleName(h1)}"`);
