"use strict";
exports.__esModule = true;
var index_1 = require("../index");
index_1.getGraph([
    { ms: Date.now() - 1000 * 60 * 60 * 0, val: 10 },
    { ms: Date.now() - 1000 * 60 * 60 * 24, val: 100 },
], __dirname + "/two24h.png");
index_1.getGraph([
    { ms: Date.now() - 1000 * 60 * 60 * 0, val: 10 },
    { ms: Date.now() - 1000 * 60 * 60 * 2, val: 100 },
], __dirname + "/2h.png");
index_1.getGraph([
    { ms: Date.now() - 1000 * 60 * 60 * 0, val: -10 },
    { ms: Date.now() - 1000 * 60 * 60 * 12, val: 20 },
], __dirname + "/negativeValues.png");
