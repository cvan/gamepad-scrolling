(function (exports) {

'use strict';

// Scrolling via Gamepad.
//
// This works only with Xbox controller mapping and Firefox with
// nonstandard gamepad events flipped on
// (`dom.gamepad.non_standard_events.enabled` in `about:config`).
// Eventually, we'll use `gamepad-plus` for wider support.

var gscroll = {};

gscroll.mapping = {
  'standard': {
    scrollX: 0,
    scrollY: 1
  },
  '46d-c216-Logitech Dual Action': {
    scrollX: 1,
    scrollY: 2
  },
  '79-6-Generic   USB  Joystick': {
    scrollX: 3,
    scrollY: 2
  }
};

gscroll.getMapping = function (gamepad) {
  if (gamepad.id in gscroll.mapping) {
    return gscroll.mapping[gamepad.id];
  } else {
    return gscroll.mapping.standard;
  }
};

gscroll.axis2key = function (gamepad, axis) {
  var mapping = gscroll.getMapping(gamepad);
  if (axis === mapping.scrollX) {
    return 'x';
  } else if (axis === mapping.scrollY) {
    return 'y';
  }
};

gscroll.getActiveScrollElement = function (doc) {
  doc = doc || document;
  var el = doc.activeElement;
  return el === doc.body ? doc.documentElement : el;
};

gscroll.AXIS_THRESHOLD = 0.15;
gscroll.SMOOTHING_FACTOR = 0.4;
gscroll.VELOCITY_THRESHOLD = 0.05;

gscroll.activeElement = null;
gscroll.active = false;
gscroll.offset = {};
gscroll.realVelocity = {x: 0.0, y: 0.0};
gscroll.time = null;
gscroll.timeSinceLastUpdate = null;
gscroll.timeSinceScrollStart = null;
gscroll.timeStart = null;
gscroll.velocity = {x: 0.0, y: 0.0};
gscroll.velocitySpeed = null;
gscroll.warp = 1;

gscroll.stop = function (e) {
  gscroll.active = false;
  gscroll.velocity[gscroll.axis2key(e.gamepad, e.axis)] = 0;
};

gscroll.start = function (e) {
  if (Math.abs(e.value) < gscroll.AXIS_THRESHOLD) {
    return;
  }

  var axisKey = gscroll.axis2key(e.gamepad, e.axis);

  gscroll.velocity[axisKey] = e.value;

  if (!gscroll.active) {
    gscroll.activeElement = gscroll.getActiveScrollElement();

    gscroll.active = true;
    gscroll.realVelocity[axisKey] = 0.0;
    gscroll.offset.x = gscroll.activeElement.scrollLeft;
    gscroll.offset.y = gscroll.activeElement.scrollTop;
    gscroll.timeStart = Date.now();
    gscroll.time = Date.now();

    gscroll.loop();
  }
};

gscroll.loop = function () {
  gscroll.timeSinceLastUpdate = Date.now() - gscroll.time;

  // Trigger hyperscrolling when the stick is held down for a while.
  gscroll.velocitySpeed = Math.sqrt(
    gscroll.realVelocity.x * gscroll.realVelocity.x +
    gscroll.realVelocity.y * gscroll.realVelocity.y
  );

  gscroll.warp = 1;

  if (gscroll.velocitySpeed > 0.8) {
    gscroll.timeSinceScrollStart = Date.now() - gscroll.timeStart;
    if (gscroll.timeSinceScrollStart > 3000) {
      gscroll.warp = 5;
    } else if (gscroll.timeSinceScrollStart > 1500) {
      gscroll.warp = 2;
    }
  }

  // We give it some smooth easing in and a subtle easing out.
  gscroll.realVelocity.x = (
    gscroll.warp * gscroll.velocity.x * gscroll.SMOOTHING_FACTOR +
    gscroll.realVelocity.x * (1 - gscroll.SMOOTHING_FACTOR)
  );
  gscroll.realVelocity.y = (
    gscroll.warp * gscroll.velocity.y * gscroll.SMOOTHING_FACTOR +
    gscroll.realVelocity.y * (1 - gscroll.SMOOTHING_FACTOR)
  );

  gscroll.offset.x += gscroll.realVelocity.x * gscroll.timeSinceLastUpdate;
  gscroll.offset.y += gscroll.realVelocity.y * gscroll.timeSinceLastUpdate;

  gscroll.activeElement = gscroll.getActiveScrollElement();

  gscroll.activeElement.scrollLeft = Math.round(gscroll.offset.x);
  gscroll.activeElement.scrollTop = Math.round(gscroll.offset.y);

  gscroll.time = Date.now();

  if (gscroll.active || gscroll.velocitySpeed > gscroll.VELOCITY_THRESHOLD) {
    exports.requestAnimationFrame(gscroll.loop);
  }
};

gscroll.onGamepadAxisMove = function (e) {
  var mapping = gscroll.getMapping(e.gamepad);
  if (e.axis !== mapping.scrollX && e.axis !== mapping.scrollY) {
    return;
  }

  if (Math.abs(e.value) < gscroll.AXIS_THRESHOLD) {
    gscroll.stop(e);
  } else {
    gscroll.start(e);
  }
};

exports.gscroll = gscroll;

})(window);
