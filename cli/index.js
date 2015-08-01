var program = require('commander'),
    wake = require('../');

program
    .usage('<mac>')
    .option('--ip [ip]', 'IP Address [255.255.255.255]', '255.255.255.255')
    .option('--port [port]', 'Port [9]', 9)

program.parse(process.argv);

if (!program.args.length) {
    program.help();
}

wake(program.args[0], {
    ip: program.ip,
    port: program.port
});
