var dgram = require('dgram'),
    net = require('net'),
    Buffer = require('buffer').Buffer;

module.exports = function(mac, params) {

    var magicPacket = createMagicPacket(mac),
        socket = dgram.createSocket(net.isIPv6(params.ip) ? 'udp6' : 'udp4');

    if (params.ip !== '255.255.255.255') {
        socket.once('listening', function() {
            socket.setBroadcast(true);
        });
    }

    socket.send(magicPacket, 0, magicPacket.length, params.port, params.ip, function() {
        socket.close();
    });

}

const MAC_BYTES = 6;

function createMagicPacket(mac) {

    var macBuffer = new Buffer(MAC_BYTES);

    if (mac.length == 2 * MAC_BYTES + (MAC_BYTES - 1)) {
        mac = mac.replace(new RegExp(mac[2], 'g'), '');
    }

    if (mac.length != 2 * MAC_BYTES || mac.match(/[^a-fA-F0-9]/)) {
        throw new Error("malformed MAC address '" + mac + "'");
    }

    for (var i = 0; i < MAC_BYTES; ++i) {
        macBuffer[i] = parseInt(mac.substr(2 * i, 2), 16);
    }

    var num = 16,
        buffer = new Buffer((1 + num) * MAC_BYTES);

    for (var i = 0; i < MAC_BYTES; ++i) {
        buffer[i] = 0xff;
    }

    for (var i = 0; i < num; ++i) {
        macBuffer.copy(buffer, (i + 1) * MAC_BYTES, 0, macBuffer.length)
    }

    return buffer;

};
