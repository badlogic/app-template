import * as fs from "fs";

const pkg = JSON.parse(fs.readFileSync("package.json"));
console.log(pkg.app);
