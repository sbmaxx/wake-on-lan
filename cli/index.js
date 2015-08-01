var program = require('commander'),
    chalk = require('chalk'),
    wake = require('../'),
    isValid = require('../').isValid;

program
    .usage('<mac>')
    .option('--ip [ip]', 'IP Address [255.255.255.255]', '255.255.255.255')
    .option('--port [port]', 'Port [9]', 9)

program.parse(process.argv);

if (!program.args.length) {
    program.help();
}

var mac = program.args[0];

if (!isValid(mac)) {
    console.error('Malformed MAC address %s', chalk.red(mac));
    process.exit(1);
}

wake(mac, {
    ip: program.ip,
    port: program.port
});
