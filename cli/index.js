var program = require('commander'),
    chalk = require('chalk'),
    wake = require('../'),
    relay = require('../').relay,
    isMACValid = require('../').isMACValid;

program
    .usage('<mac>')
    .option('--ip [ip]', 'IP Address [255.255.255.255] of target computer', '255.255.255.255')
    .option('--host [host]', 'Hostname of the target computer')
    .option('--port [port]', 'Port [9]', 9)
    .option('--relay', 'Listen for packet and then broadcast it')
    .option('--relayport [port]', 'Listen for relay packet on this port')

program.parse(process.argv);

if (!program.args.length) {
    program.help();
}

var mac = program.args[0];

if (!isMACValid(mac)) {
    console.error('Malformed MAC address %s', chalk.red(mac));
    process.exit(1);
}

if (program.relay) {
    relay(mac, {
        ip: program.ip,
        host: program.host,
        port: program.port,
        relayport: program.relayport
    });
} else {
    wake(mac, {
        ip: program.ip,
        host: program.host,
        port: program.port
    });
}


