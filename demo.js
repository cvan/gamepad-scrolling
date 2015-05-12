/* globals gcursor, gnav, gscroll */

(function (exports) {

'use strict';

// Demo of cursor, navigation, and scrolling via Gamepad.

[gcursor, gnav, gscroll].forEach(function (func) {
  if (func.init) {
    func.init();
  }
});


var raf = window.requestAnimationFrame ||
  window.mozRequestAnimationFrame ||
  window.webkitRequestAnimationFrame;

if (!raf) {
  throw 'requestAnimationFrame is required!';
}

var caf = window.cancelRequestAnimationFrame ||
  window.mozCancelRequestAnimationFrame ||
  window.webkitCancelRequestAnimationFrame;


var gamepads = new window.Gamepads({
  axisThreshold: 0,
  indices: {
    'standard': {
      cursorX: 2,
      cursorY: 3,
      scrollX: 0,
      scrollY: 1,
      back: 9,
      forward: 10,
      zoomIn: 5,
      zoomOut: 1
    },
    '46d-c216-Logitech Dual Action': {
      cursorX: 3,
      cursorY: 4,
      scrollX: 1,
      scrollY: 2,
      back: 8,
      forward: 9,
      zoomIn: 7,
      zoomOut: 6
    },
    '79-6-Generic   USB  Joystick': {
      cursorX: null,
      cursorY: null,
      scrollX: 3,
      scrollY: 2,
      back: 6,
      forward: 7,
      zoomIn: 9,
      zoomOut: 8
    }
  }
});

gamepads.polling = false;

if (gamepads.gamepadsSupported) {
  gamepads.updateStatus = function () {
    gamepads.polling = true;
    gamepads.update();
    raf(gamepads.updateStatus);
  };

  gamepads.cancelLoop = function () {
    gamepads.polling = false;

    if (gamepads.nonFirefoxInterval) {
      window.clearInterval(gamepads.nonFirefoxInterval);
    }

    caf(gamepads.updateStatus);
  };


  exports.addEventListener('gamepadconnected', function (e) {
    console.log('Gamepad connected at index %d: %s. %d buttons, %d axes.',
      e.gamepad.index, e.gamepad.id, e.gamepad.buttons.length, e.gamepad.axes.length);

    gamepads.updateStatus();
  });

  exports.addEventListener('gamepaddisconnected', function (e) {
    console.log('Gamepad removed at index %d: %s.', e.gamepad.index, e.gamepad.id);
  });

  if (gamepads.nonstandardEventsEnabled) {
    exports.addEventListener('gamepadaxismove', function (e) {
      gcursor.onGamepadAxisMove(e);
      gscroll.onGamepadAxisMove(e);

      if (Math.abs(e.value) >= gscroll.AXIS_THRESHOLD) {
        console.log('Gamepad axis move at index %d: %s. Axis: %d. Value: %f.',
          e.gamepad.index, e.gamepad.id, e.axis, e.value);
      }
    });

    exports.addEventListener('gamepadbuttondown', function (e) {
      console.log('Gamepad button down at index %d: %s. Button: %d.',
        e.gamepad.index, e.gamepad.id, e.button);

      gcursor.onGamepadAxisMove(e);
      gnav.onGamepadButtonDown(e);
    });

    exports.addEventListener('gamepadbuttonup', function (e) {
      console.log('Gamepad button up at index %d: %s. Button: %d.',
        e.gamepad.index, e.gamepad.id, e.button);
    });
  }

  // At the time of this writing, Firefox is the only browser that correctly
  // fires the `gamepadconnected` event. For the other browsers
  // <https://crbug.com/344556>, we start polling every 100ms until the
  // first gamepad is connected.
  if (window.Gamepads.utils.browser !== 'firefox') {
    gamepads.nonFirefoxInterval = window.setInterval(function () {
      if (gamepads.poll().length) {
        gamepads.updateStatus();
        window.clearInterval(gamepads.nonFirefoxInterval);
      }
    }, 100);
  }
}

exports.gamepads = gamepads;

})(window);
