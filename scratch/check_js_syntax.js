const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT_DIR = "C:\\Users\\ADMIN\\Documents\\Zaid Asim";
const JS_DIR = path.join(ROOT_DIR, "js");

const customJsFiles = [
    "app.bundle.js",
    "atm.js",
    "command-palette.js",
    "cursor.js",
    "easter-eggs.js",
    "hud.js",
    "loader.js",
    "main.js",
    "modals.js",
    "nav.js",
    "parallax.js",
    "radar.js",
    "scroll-animations.js",
    "sound.js",
    "terminal.js",
    "theme.js",
    "three-bg.js",
    "tilt.js",
    "v2-upgrades.js",
    "visionary.js"
];

let totalErrors = 0;

customJsFiles.forEach(file => {
    const filePath = path.join(JS_DIR, file);
    if (!fs.existsSync(filePath)) {
        console.log(`[WARNING] File not found: ${file}`);
        return;
    }
    
    try {
        const code = fs.readFileSync(filePath, 'utf-8');
        // Compile code using Node's vm module (checks syntax without executing)
        new vm.Script(code, { filename: file });
        // console.log(`[OK] ${file} compiles successfully.`);
    } catch (err) {
        totalErrors++;
        console.log(`\n[SYNTAX ERROR] in ${file}:`);
        console.log(err.stack);
    }
});

console.log(`\nJavaScript syntax validation complete. Total syntax errors found: ${totalErrors}`);
process.exit(totalErrors > 0 ? 1 : 0);
