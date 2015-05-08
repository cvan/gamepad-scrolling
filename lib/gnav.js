(function (exports) {

'use strict';

// Back/Forward history navigation via Gamepad.

var gnav = {};

gnav.mapping = {
  'standard': {
    back: 9,
    forward: 10
  },
  '46d-c216-Logitech Dual Action': {
    back: 8,
    forward: 9
  }
};

gnav.getMapping = function (gamepad) {
  if (gamepad.id in gnav.mapping) {
    return gnav.mapping[gamepad.id];
  } else {
    return gnav.mapping.standard;
  }
};

gnav.onGamepadButtonDown = function (e) {
  var mapping = gnav.getMapping(e.gamepad);

  switch (e.button) {
    case mapping.back:
      return exports.history.back();
    case mapping.forward:
      return exports.history.forward();
  }
};

exports.gnav = gnav;

})(window);
