const parse = (argv, config) => {
    config.arguments = config.arguments || [];
    config.flags = config.flags || [];
    let args = {};
    let flags = {};
    let errors = [];
    let argsListPosition = 0;
    for (let i = 0; i < argv.length; i++) {
        let el = argv[i];
        if (el.startsWith('-')) {
            let name = el.substring(el.lastIndexOf('-') + 1);
            let value;
            if (name.includes('=')) {
                name = name.substring(0, name.indexOf('='));
                value = name.substring(name.indexOf('=') - 1);
            }
            let flagsMap = {};
            for (let flag of config.flags) {
                if (flag.name instanceof Array) {
                    flag.name.forEach(name => {
                        flagsMap[name] = flag;
                    });
                } else {
                    flagsMap[flag.name] = flag;
                }
            } 
            if (name in flagsMap) {
                if (flagsMap[name].value) {
                    if (value) {
                        flags[name] = value;
                    } else {
                        errors.push({ missingValue: name });
                    }
                } else {
                    if (value) {
                        errors.push({ valueIn: name });
                    }
                    flags[name] = true;
                }
            } else {
                errors.push({ unknownFlag: name });
            }
        } else {
            if (argsListPosition >= config.arguments.length) {
                errors.push({ unknownArgument: el });
            } else {
                args[config.arguments[argsListPosition].name] = el;
            }
            argsListPosition++;
        }
    }
    let requiredArguments = config.arguments.filter(arg => arg.required);
    if (argsListPosition < requiredArguments.length) {
        requiredArguments.slice(argsListPosition).forEach(arg => {
            errors.push({ missingArgument: arg.name });
        });
    }
    return {
        ...config.module && { module: config.module },
        arguments: args,
        flags: flags,
        errors: errors
    }
}

const clp = config => {
    let argv = process.argv.slice(2);
    if (argv[0] in config.modules) {
        return parse(argv.slice(1), Object.assign(config.modules[argv[0]], { module: argv[0] }));
    } else {
        return parse(argv, config);
    }
}

module.exports = clp;