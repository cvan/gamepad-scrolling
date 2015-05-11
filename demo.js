/* globals gcursor, gnav, gscroll, gzoom */

(function (exports) {

'use strict';

// Demo of cursor, navigation, and scrolling via Gamepad.

[gcursor, gnav, gscroll, gzoom].forEach(function (func) {
  if (func.init) {
    func.init();
  }
});

exports.addEventListener('gamepadconnected', function (e) {
  console.log('Gamepad connected at index %d: %s. %d buttons, %d axes.',
    e.gamepad.index, e.gamepad.id, e.gamepad.buttons.length, e.gamepad.axes.length);
});

exports.addEventListener('gamepaddisconnected', function (e) {
  console.log('Gamepad removed at index %d: %s.', e.gamepad.index, e.gamepad.id);
});

exports.addEventListener('gamepadaxismove', function (e) {
  gcursor.onGamepadAxisMove(e);
  gscroll.onGamepadAxisMove(e);
  gzoom.onGamepadAxisMove(e);

  // if (Math.abs(e.value) >= gscroll.AXIS_THRESHOLD) {
  //   console.log('Gamepad axis move at index %d: %s. Axis: %d. Value: %f.',
  //     e.gamepad.index, e.gamepad.id, e.axis, e.value);
  // }
});

exports.addEventListener('gamepadbuttondown', function (e) {
  console.log('Gamepad button down at index %d: %s. Button: %d.',
    e.gamepad.index, e.gamepad.id, e.button);

  gcursor.onGamepadAxisMove(e);
  gnav.onGamepadButtonDown(e);
  gzoom.onGamepadAxisMove(e);
});

exports.addEventListener('gamepadbuttonup', function (e) {
  console.log('Gamepad button up at index %d: %s. Button: %d.',
    e.gamepad.index, e.gamepad.id, e.button);

  gzoom.onGamepadAxisMove(e);
});

})(window);
