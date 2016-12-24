/** service entry */
'use strict';

module.exports = {
    test: require('./test'),
    data: require('./data'),
    '404':require('./404'),
    '500':require('./500'),
    webrtc: require('./webrtc'),
    canvas: require('./canvas'),
}