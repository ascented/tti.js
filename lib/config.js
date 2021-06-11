module.exports = {
    help:
'Usage:\n\n\
tti encode <input file> <output file> - encodes text to image.\n\
tti decode <input file> <output file> - decodes text from image.\n\n\
For more information use "tti -help"',
    extendedHelp:
'Encoding: tti encode <input text file> <output image file>\n\
Options:\n\
\t--l|--long - Wraps to single line of pixels.\n\n\
Decoding: tti decode <input image file> <output text file>\n\
Options:\n\
\t--hex - Decodes image to a hex bytes string.',
    parserConfig: {
        modules: {
            encode: {
                arguments: [
                    {
                        name: 'input',
                        required: true
                    },
                    { name: 'output' }
                ],
                flags: [
                    { name: ['l', 'long'] }
                ]
            },
            decode: {
                arguments: [
                    {
                        name: 'input',
                        required: true
                    },
                    { name: 'output' }
                ],
                flags: [
                    { name: 'hex' }
                ]
            }
        },
        flags: [
            { name: ['h', 'help'] }
        ]
    }
}