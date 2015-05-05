(function (exports) {

'use strict';

// Zooming via Gamepad.

var gzoom = {};

gzoom.mapping = {
  'standard': {
    zoomIn: null,
    zoomOut: null
  },
  '46d-c216-Logitech Dual Action': {
    zoomIn: 7,
    zoomOut: 6
  }
};

gzoom.getMapping = function (gamepad) {
  if (gamepad.id in gzoom.mapping) {
    return gzoom.mapping[gamepad.id];
  } else {
    return gzoom.mapping.standard;
  }
};

gzoom.buttonEvent2axisEvent = function (e) {
  if (e.type === 'gamepadbuttondown') {
    e.axis = e.button;
    e.value = 1.0;
  } else if (e.type === 'gamepadbuttonup') {
    e.axis = e.button;
    e.value = 0.0;
  }
  return e;
};

gzoom.axis2key = function (gamepad, axis) {
  var mapping = gzoom.getMapping(gamepad);
  if (axis === mapping.zoomIn) {
    return 'zoomIn';
  } else if (axis === mapping.zoomOut) {
    return 'zoomOut';
  }
};

gzoom.AXIS_THRESHOLD = 0.15;
gzoom.SMOOTHING_FACTOR = 0.4;
gzoom.VELOCITY_THRESHOLD = 0.05;
gzoom.SCALE_MAX = 1000;

gzoom.activeElement = null;
gzoom.active = false;
gzoom.offset = {zoomIn: 0.0, zoomOut: 0.0};
gzoom.scale = {zoomIn: 0.0, zoomOut: 0.0};
gzoom.realVelocity = {zoomIn: 0.0, zoomOut: 0.0};
gzoom.time = null;
gzoom.timeSinceLastUpdate = null;
gzoom.timeSinceScrollStart = null;
gzoom.timeStart = null;
gzoom.velocity = {zoomIn: 0.0, zoomOut: 0.0};
gzoom.velocitySpeed = null;
gzoom.warp = 1;

gzoom.stop = function (e) {
  gzoom.active = false;
  gzoom.velocity[gzoom.axis2key(e.gamepad, e.axis)] = 0;
};

gzoom.start = function (e) {
  if (Math.abs(e.value) < gzoom.AXIS_THRESHOLD) {
    return;
  }

  var axisKey = gzoom.axis2key(e.gamepad, e.axis);

  gzoom.velocity[axisKey] = e.value;

  if (!gzoom.active) {
    // gzoom.activeElement = gzoom.getActiveScrollElement();

    gzoom.active = true;
    gzoom.realVelocity[axisKey] = 0.0;
    // gzoom.offset.zoomIn = gzoom.activeElement.scrollLeft;
    // gzoom.offset.zoomOut = gzoom.activeElement.scrollTop;
    gzoom.timeStart = Date.now();
    gzoom.time = Date.now();

    gzoom.loop();
  }
};

gzoom.loop = function () {
  if (gzoom.scale.zoomIn >= gzoom.SCALE_MAX) {
    return;
  }

  gzoom.timeSinceLastUpdate = Date.now() - gzoom.time;

  // Trigger hyperscrolling when the stick is held down for a while.
  gzoom.velocitySpeed = Math.abs(gzoom.realVelocity.zoomIn);

  // We give it some smooth easing in and a subtle easing out.
  gzoom.realVelocity.zoomIn = (
    gzoom.velocity.zoomIn * gzoom.SMOOTHING_FACTOR +
    gzoom.realVelocity.zoomIn * (1 - gzoom.SMOOTHING_FACTOR)
  );

  gzoom.offset.zoomIn += gzoom.realVelocity.zoomIn * gzoom.timeSinceLastUpdate;

  gzoom.scale.zoomIn = Math.min(gzoom.offset.zoomIn, 1000);
  console.log(gzoom.scale.zoomIn);

  gzoom.time = Date.now();

  if (gzoom.active || gzoom.velocitySpeed > gzoom.VELOCITY_THRESHOLD) {
    exports.requestAnimationFrame(gzoom.loop);
  }
};

gzoom.onGamepadAxisMove =function (e) {
  e = gzoom.buttonEvent2axisEvent(e);

  var mapping = gzoom.getMapping(e.gamepad);
  if (e.axis !== mapping.zoomIn && e.axis !== mapping.zoomOut) {
    return;
  }

  if (Math.abs(e.value) < gzoom.AXIS_THRESHOLD) {
    gzoom.stop(e);
  } else {
    gzoom.start(e);
  }
};

exports.gzoom = gzoom;

})(window);