module.exports = {
    helpString:
'Usage: tti encode|decode\n\
Options:\n\
\t--h|--help - Show this help guide.\n\n\
Encoding: tti encode <input text> <output image>\n\
Options:\n\
\t--l|--long - Wraps to single line of pixels.\n\n\
Decoding: tti decode <input image> <output text>\n\
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