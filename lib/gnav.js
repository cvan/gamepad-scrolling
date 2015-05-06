(function (exports) {

'use strict';

// Back/Forward history navigation via Gamepad.

var gnav = {};

gnav.mapping = {
  back: 9,
  forward: 10
};

gnav.onGamepadButtonDown = function (e) {
  switch (e.button) {
    case gnav.mapping.back:
      return exports.history.back();
    case gnav.mapping.forward:
      return exports.history.forward();
  }
};

exports.gnav = gnav;

})(window);
