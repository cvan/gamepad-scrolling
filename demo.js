/* globals gnav, gscroll */

(function (exports) {

'use strict';

// Demo of navigation and scrolling via Gamepad.

exports.addEventListener('gamepadconnected', function (e) {
  console.log('Gamepad connected at index %d: %s. %d buttons, %d axes.',
    e.gamepad.index, e.gamepad.id, e.gamepad.buttons.length, e.gamepad.axes.length);
});

exports.addEventListener('gamepaddisconnected', function (e) {
  console.log('Gamepad removed at index %d: %s.', e.gamepad.index, e.gamepad.id);
});

exports.addEventListener('gamepadaxismove', function (e) {
  gscroll.onGamepadAxisMove(e);

  console.log('Gamepad axis move at index %d: %s. Axis: %d. Value: %f.',
    e.gamepad.index, e.gamepad.id, e.axis, e.value);
});

exports.addEventListener('gamepadbuttondown', function (e) {
  console.log('Gamepad button down at index %d: %s. Button: %d.',
    e.gamepad.index, e.gamepad.id, e.button);

  gnav.onGamepadButtonDown(e);
});

exports.addEventListener('gamepadbuttonup', function (e) {
  console.log('Gamepad button up at index %d: %s. Button: %d.',
    e.gamepad.index, e.gamepad.id, e.button);
});

})(window);
