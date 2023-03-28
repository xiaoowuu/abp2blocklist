/*
 * This file is part of Adblock Plus <https://adblockplus.org/>,
 * Copyright (C) 2006-present eyeo GmbH
 *
 * Adblock Plus is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License version 3 as
 * published by the Free Software Foundation.
 *
 * Adblock Plus is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Adblock Plus.  If not, see <http://www.gnu.org/licenses/>.
 */

"use strict";

let readline = require("readline");
let fs = require('fs');
let { Filter } = require("./adblockpluscore/lib/filterClasses");
let { ContentBlockerList } = require("./lib/abp2blocklist.js");
let inputFile = process.argv[2];
let outputFile = process.argv[3];
var rl = readline.createInterface({ input: fs.createReadStream(inputFile), terminal: false });
var blockerList = new ContentBlockerList({ merge: "all" });
console.log('readInputFile');
rl.on("line", line => {
  if (/^\s*[^\[\s]/.test(line))
    blockerList.addFilter(Filter.fromText(Filter.normalize(line)));
});
rl.on("close", () => {
  console.log('generateRules begin');
  blockerList.generateRules().then(rules => {
    // If the rule set is too huge, JSON.stringify throws
    // "RangeError: Invalid string length" on Node.js. As a workaround, print
    // each rule individually.
    console.log('generateRules end');
    let content = '';
    content += "[";
    if (rules.length > 0) {
      let stringifyRule = rule => JSON.stringify(rule, null, "\t");
      for (let i = 0; i < rules.length - 1; i++)
        content += stringifyRule(rules[i]) + ",";
      content += stringifyRule(rules[rules.length - 1]);
    }
    content += "]";
    console.log('createWriteStream');
    fs.createWriteStream(outputFile).write(content, ((res) => {
      console.log(res);
    }));
    console.log('complete');
  });
});
