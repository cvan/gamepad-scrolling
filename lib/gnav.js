(function (exports) {

'use strict';

// Back/Forward history navigation via Gamepad.

var gnav = {};

gnav.onGamepadButtonDown = function (e) {
  var gamepad = gamepads.state[e.gamepad.index];

  switch (e.button) {
    case gamepad.indices.back:
      return exports.history.back();
    case gamepad.indices.forward:
      return exports.history.forward();
  }
};

exports.gnav = gnav;

})(window);
