/* globals gamepads */

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
    case gamepad.indices.vendor:
      // This is already handled because by `fireKeyEvent` because we defined
      // it in the `keyEvents` option when constructing a `Gamepads` instance.
      return;
  }
};

gnav.onGamepadButtonUp = function (e) {
  var gamepad = gamepads.state[e.gamepad.index];

  switch (e.button) {
    case gamepad.indices.vendor:
      return;
  }
};

exports.gnav = gnav;

})(window);
