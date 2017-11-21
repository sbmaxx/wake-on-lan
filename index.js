var dgram = require('dgram'),
    dns = require('dns'),
    net = require('net'),
    Buffer = require('buffer').Buffer,
    chalk = require('chalk'),
    vow = require('vow');

const BROADCAST = '255.255.255.255';

module.exports = function(mac, params) {
    getIP(params).then(function(ip) {
        var magicPacket = createMagicPacket(mac);

        if (params.relay) {
            relay(mac, ip, magicPacket, params);
        } else {
            send(mac, ip, magicPacket, params);
        }
    });
}

function send(mac, ip, magicPacket, params) {
    var socket = dgram.createSocket(net.isIPv6(ip) ? 'udp6' : 'udp4');
    
    socket.once('listening', function() {
        socket.setBroadcast(ip === BROADCAST)
    });

    if (ip === BROADCAST) {
        console.log('Broadcasting magic packet to %s.', chalk.blue(mac));
    } else {
        console.log('Sending magic packet to %s with IP=%s.', chalk.blue(mac), chalk.magenta(ip));
    }

    socket.send(magicPacket, 0, magicPacket.length, params.port, ip, function(err) {
        if (err) {
            console.log(chalk.red('Sorry ;('));
            console.error(err);
        } else {
            console.log('%s. Your computer is awakening right now...', chalk.green('All\'s fine'));
        }
        socket.close();
    });
}

function relay(mac, ip, magicPacket, params) {
    socket = dgram.createSocket('udp4');
    
    socket.on('error', (err) => {
        console.log(`Server error:\n${err.stack}`);
        socket.close();
    });
    
    socket.on('message', (msg, rinfo) => {
        if (msg.equals(magicPacket)) {
            send(mac, ip, magicPacket, params);
        }
    });
    
    socket.on('listening', () => {
        const address = socket.address();
        console.log(`Server listening ${address.address}:${address.port}`);
    });
    
    socket.bind(params.relayport);
}

const MAC_BYTES = 6;
const MAC_REPETITIONS = 16;

/**
 * Magic packet is:
 * FF (repeat 6)
 * MAC Address (repeat 16)
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

function getIP(params) {
    var defer = vow.defer();

    if (!params.host) {
        defer.resolve(params.ip);
    } else {
        dns.resolve(params.host, function(err, addresses) {
            if (err) {
                console.error(err);
                defer.resolve(BROADCAST)
            } else {
                defer.resolve(addresses[0]);
            }
        });
    }

    return defer.promise();
}

module.exports.isMACValid = function(mac) {
    if (mac.length == 2 * MAC_BYTES + (MAC_BYTES - 1)) {
        mac = mac.replace(new RegExp(mac[2], 'g'), '');
    }

    return !(mac.length != 2 * MAC_BYTES || mac.match(/[^a-fA-F0-9]/));
}
