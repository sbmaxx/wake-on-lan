var program = require('commander'),
    chalk = require('chalk'),
    wake = require('../'),
    isMACValid = require('../').isMACValid;


program
    .usage('<mac>')
    .option('--ip [ip]', 'IP Address [255.255.255.255] of target computer', '255.255.255.255')
    .option('--host [host]', 'Hostname of the target computer')
    .option('--port [port]', 'Port [9]', 9)
    .option('--relay', 'Listen for packet and then broadcast it', 0)
    .option('--relayport [port]', 'Listen for relay packet on this port', 7576)

program.parse(process.argv);

if (!program.args.length) {
    program.help();
}

var mac = program.args[0];

if (!isMACValid(mac)) {
    console.error('Malformed MAC address %s', chalk.red(mac));
    process.exit(1);
}

wake(mac, {
    ip: program.ip,
    host: program.host,
    port: program.port,
    relay: program.relay,
    relayport: program.relayport
});
