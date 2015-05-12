(function (exports) {

'use strict';

// Cursor via Gamepad.

var gcursor = {};

gcursor.axis2key = function (gamepad, axis) {
  if (axis === gamepad.indices.cursorX) {
    return 'x';
  } else if (axis === gamepad.indices.cursorY) {
    return 'y';
  }
};

gcursor.SMOOTHING_FACTOR = 0.5;

gcursor.active = false;
gcursor.real = {x: 0.0, y: 0.0};
gcursor.dest = {x: 0.0, y: 0.0};

gcursor.style = `
.cursor-active {
  cursor: none;
  user-select: none;
}

.cursor {
  background: rgba(0,255,255,.25);
  border: 5px solid rgba(0,0,0,.25);
  border-radius: 25px;
  -moz-box-sizing: border-box;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
  height: 50px;
  position: fixed;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 50px;
  z-index: 99999;
}
`;

gcursor.init = function () {
  var style = document.createElement('style');
  style.innerHTML = gcursor.style;
  document.head.appendChild(style);

  var div = document.createElement('div');
  div.id = 'cursor';
  div.className = 'cursor';
  document.body.appendChild(div);

  gcursor.cursor = div;

  gcursor.reset();
};

gcursor.reset = function () {
  gcursor.putCursor(0, 0);
};

gcursor.stop = function () {
  gcursor.active = false;

  document.documentElement.classList.remove('cursor-active');
  gcursor.real.x = gcursor.dest.x;
  gcursor.real.y = gcursor.dest.y;

  gcursor.putCursor(gcursor.real.x, gcursor.real.y);
};

gcursor.start = function (gamepad, axis, value) {
  gcursor.dest[gcursor.axis2key(gamepad, axis)] = value;

  if (!gcursor.active) {
    document.documentElement.classList.add('cursor-active');

    gcursor.loop();
  }
};

gcursor.putCursor = function (x, y) {
  // Map to 0..1 range.
  x = (x + 1) / 2;
  y = (y + 1) / 2;

  gcursor.cursor.style.top = (y * 100) + '%';
  gcursor.cursor.style.left = (x * 100) + '%';
};

gcursor.loop = function () {
  gcursor.active = true;

  gcursor.real.x = (
    gcursor.dest.x * gcursor.SMOOTHING_FACTOR +
    gcursor.real.x * (1 - gcursor.SMOOTHING_FACTOR)
  );

  gcursor.real.y = (
    gcursor.dest.y * gcursor.SMOOTHING_FACTOR +
    gcursor.real.y * (1 - gcursor.SMOOTHING_FACTOR)
  );

  gcursor.putCursor(gcursor.real.x, gcursor.real.y);

  var dx = gcursor.dest.x - gcursor.real.x;
  var dy = gcursor.dest.y - gcursor.real.y;

  gcursor.distance = Math.sqrt(dx * dx + dy * dy);

  if (gcursor.distance > 0.0005) {
    exports.requestAnimationFrame(gcursor.loop);
  } else {
    gcursor.stop();
  }
};

gcursor.onGamepadAxisMove = function (e) {
  e = gamepads.buttonEvent2axisEvent(e);

  var gamepad = gamepads.state[e.gamepad.index];

  if (e.axis !== gamepad.indices.cursorX &&
      e.axis !== gamepad.indices.cursorY) {
    return;
  }

  gcursor.start(gamepad, e.axis, e.value);
};

exports.gcursor = gcursor;

})(window);
