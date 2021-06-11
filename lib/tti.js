const fs = require('fs');
const _ = require('lodash');
const Jimp = require('jimp');
const config = require('./config');
const clp = require('./clp');


/**
 * Functions and variables.
 */
const perfectWidth = pixelsCount => {
    let width = Math.ceil(Math.sqrt(pixelsCount));
    while (1) {
        if (!(pixelsCount % width)) {
            return width;
        }
        width--;
    }  
}

const cl = clp(config.parserConfig);

const encode = (text, output) => {
    /**
     * Text processing.
     */
    const symbols = text.split('').map(s => {
        let code = s.charCodeAt();
        return code < 20 ? '00' : code.toString(16);
    });
    const pixels = _.chunk(symbols, 3).map(p => {
        if (p.length === 1) {
            return p.join('') + '0000ff';
        } else if (p.length === 2) {
            return p.join('') + '00ff';
        } else {
            return p.join('') + 'ff';
        }
    });
    console.log('✔️ Text processed');
    
    /**
     * Matrix configuration.
     */
    const pixelsCount = pixels.length;
    const areaRoot = Math.sqrt(pixelsCount);
    let width, height;
    if (pixelsCount != 3) {
        width = cl.flags.l || cl.flags.long ? pixelsCount : perfectWidth(pixelsCount);
        height = cl.flags.l || cl.flags.long ? 1 : pixelsCount / width;
    } else {
        width = cl.flags.l || cl.flags.long ? 3 : 2;
        height = cl.flags.l || cl.flags.long ? 1 : 2;
    }
    const matrix = _.chunk(pixels, width);
    
    /**
     * Image creation.
     */
    const image = new Jimp(width, height, '#00000000');
    matrix.forEach((row, y) => {
        row.forEach((pixel, x) => {
            image.setPixelColor(parseInt(pixel, 16), x, y);
        });
    });
    console.log('✔️ Matrix applied');
    
    /**
     * Saving new image.
     */
    image.write(output, () => {
        console.log(`✔️ Done! (${pixels.length} pixels from ${symbols.length} symbols)`);
    });
}

const decode = async (image, output) => {
    let symbols = [];

    /**
     * Image scan.
     */
    for (const { x, y } of image.scanIterator(0, 0, image.bitmap.width, image.bitmap.height)) {
        let color = image.getPixelColor(x, y).toString(16).substring(0, 6);
        let bytes = [
            color.slice(0, 2),
            color.slice(2, 4),
            color.slice(4, 6)
        ];
        symbols = symbols.concat(bytes);
    }
    console.log('✔️ Image scanned');

    if (!cl.flags.hex) {
        symbols = symbols.filter(e => parseInt(e)).map(byte => String.fromCharCode(parseInt(byte, 16)));
        console.log('✔️ Converted to text');
    }
    await fs.writeFileSync(output, symbols.join(''));
    console.log(`✔️ Done! (${symbols.length} symbols from ${image.bitmap.width * image.bitmap.height} pixels)`);
}

/**
 * Errors log.
 */
if (cl.errors.length) {
    cl.errors.forEach(error => {
        let errorMessage = '❌ ';
        if (error.missingValue) {
            errorMessage += `Missing value at flag "${error.missingValue}".`;
        } else if (error.valueIn) {
            errorMessage += `Flag "${error.valueIn}" does not takes values.`;
        } else if (error.unknownFlag) {
            errorMessage += `Unknown flag "${error.unknownFlag}".`;
        } else if (error.unknownArgument) {
            errorMessage += `Unknown argument "${error.unknownArgument}".`;
        } else if (error.missingArgument) {
            errorMessage += `Missing argument "${error.missingArgument}".`;
        }
        console.log(errorMessage);
    });
    process.exit(1);
}

/**
 * Help string.
 */
if (cl.flags.h || cl.flags.help) {
    console.log(config.extendedHelp);
    process.exit(1);
}

if (cl.module === 'encode') {
    if (fs.existsSync(cl.arguments.input)) {
        let text = fs.readFileSync(cl.arguments.input).toString();
        if (!text.length) {
            console.log('❌ File is empty.');
        } else {
            encode(text, cl.arguments.output || `${cl.arguments.input.split(/\./)[0]}.png`);
        }
    } else {
        console.log('❌ Input file not found.');
    }
} else if (cl.module === 'decode') {
    if (fs.existsSync(cl.arguments.input)) {
        (async () => {
            let image = await Jimp.read(cl.arguments.input);
            console.log('✔️ Image loaded');
            decode(image, cl.arguments.output || `${cl.arguments.input.split(/\./)[0]}.txt`);
        })();
    } else {
        console.log('❌ Input file not found.');
    }
} else {
    console.log(config.help);
}