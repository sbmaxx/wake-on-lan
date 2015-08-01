var dgram = require('dgram'),
    net = require('net'),
    Buffer = require('buffer').Buffer,
    chalk = require('chalk');

module.exports = function(mac, params) {

    var magicPacket = createMagicPacket(mac),
        socket = dgram.createSocket(net.isIPv6(params.ip) ? 'udp6' : 'udp4');

    if (params.ip === '255.255.255.255') {
        socket.once('listening', function() {
            socket.setBroadcast(true);
        });
    }

    if (params.ip) {
        console.log('Broadcasting magic packet to %s.', chalk.blue(mac));
    } else {
        console.log('Sending magic packet to %s with IP=%s.', chalk.blue(mac), chalk.magenta(params.ip));
    }

    socket.send(magicPacket, 0, magicPacket.length, params.port, params.ip, function(err) {
        if (err) {
            console.log(chalk.red('Sorry ;('));
            console.error(err);
        } else {
            console.log('%s. Your computer is awakening right now...', chalk.green('All\'s fine'));
        }
        socket.close();
    });

}

const MAC_BYTES = 6;
const MAC_REPETITIONS = 16;

/**
 * Magic packet is:
 * FF (repeat 6)
 * MAC Address (repat 16)
 */
function createMagicPacket(mac) {

    var macBuffer = new Buffer(MAC_BYTES);

    mac.split(':').forEach(function(value, i) {
        macBuffer[i] = parseInt(value, 16);
    });

    var buffer = new Buffer(MAC_BYTES + MAC_REPETITIONS * MAC_BYTES);

    // start the magic packet from 6 bytes of FF
    for (var i = 0; i < MAC_BYTES; i++) {
        buffer[i] = 0xFF;
    }

    // copy mac address 16 times
    for (var i = 0; i < MAC_REPETITIONS; i++) {
        macBuffer.copy(buffer, (i + 1) * MAC_BYTES, 0, macBuffer.length);
    }

    return buffer;

}

module.exports.isValid = function(mac) {
    if (mac.length == 2 * MAC_BYTES + (MAC_BYTES - 1)) {
        mac = mac.replace(new RegExp(mac[2], 'g'), '');
    }

    return !(mac.length != 2 * MAC_BYTES || mac.match(/[^a-fA-F0-9]/));
}
