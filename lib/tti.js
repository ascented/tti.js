require('colors');
const fs = require('fs');
const _ = require('lodash');
const Jimp = require('jimp');


/**
 * Functions and variables.
 */
console.log(`${'i'.cyan} TTI by zephyr`);

const argumentsParser = argv => {
    let raw = argv.slice(2);
    if (!raw.length) return {};
    let argumentsMap = {};
    for (let i = 0; i < raw.length; i++) {
        let alias = raw[i];
        if (alias.startsWith('--')) {
            alias = alias.substring(2);
            let value = raw[i + 1];
            if (value) {
                if (value.startsWith('--')) {
                    argumentsMap[alias] = true;
                    continue;
                }
                argumentsMap[alias] = value;
                i += 1;
            } else {
                argumentsMap[alias] = true;
                continue;
            }
        } else {
            console.log(`❌ Please, use -- prefix for arguments.`);
            process.exit(1);
        }
    }
    return argumentsMap;
}

const config = argumentsParser(process.argv);

/**
 * Help guide.
 */
if (config.help || config.h) {
    console.log(
'Usage: tti [ options ]\n\n\
Options:\n\
\t--f|--file - Input text file directory. (required)\n\
\t--o|--output - Output image file name.\n\
\t--l|--long - Wraps to single line of pixels.\n'
    );
    process.exit(0);
}
 
/**
 * Input reading.
 */
if (!config.f && !config.file) {
    console.log('❌ No text file directory specified.');
    process.exit(1);
}

let text;

try {
    text = fs.readFileSync(config.f || config.file).toString('ascii');
} catch {
    console.log('❌ File not found.');
    process.exit(1);
}

if (!text.length) {
    console.log('❌ File is empty.');
    process.exit(1);
}
 
 
/**
 * Text processing.
 */
const symbols = text.split('').map(s => s.charCodeAt().toString(16));
const pixels = _.chunk(symbols, 3).map(p => p.length < 3 ? p.join('') + '00ff' : p.join('') + 'ff');
console.log('✔️ Text processed');
 
 
/**
 * Matrix configuration.
 */
const pixelsCount = pixels.length;
const width = config.l || config.long ? pixelsCount : Math.floor(Math.sqrt(pixelsCount));
const height = config.l || config.long ? 1 : Math.ceil(Math.sqrt(pixelsCount));
const matrix = _.chunk(pixels, width);
 
/**
 * Image creation.
 */
const image = new Jimp(width, height, '#000000ff');
matrix.forEach((row, y) => {
    row.forEach((pixel, x) => {
        image.setPixelColor(parseInt(pixel, 16), x, y);
    });
});
console.log('✔️ Matrix applied');
 
/**
 * Saving new image.
 */
image.write(config.o || config.output || 'output.png', () => {
    console.log(`✔️ Done! (${symbols.length} symbols, ${pixels.length} pixels)`);
});