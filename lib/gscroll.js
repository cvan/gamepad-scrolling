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
  axisX: 0,
  axisY: 1
};

gscroll.axis2key = function (axis) {
  if (axis === gscroll.mapping.axisX) {
    return 'x';
  } else if (axis === gscroll.mapping.axisY) {
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
  gscroll.velocity[gscroll.axis2key(e.axis)] = 0;
};

gscroll.start = function (e) {
  if (Math.abs(e.value) < gscroll.AXIS_THRESHOLD) {
    return;
  }

  gscroll.velocity[gscroll.axis2key(e.axis)] = e.value;

  if (!gscroll.active) {
    gscroll.activeElement = gscroll.getActiveScrollElement();

    gscroll.active = true;
    gscroll.realVelocity[gscroll.axis2key(e.axis)] = 0.0;
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
  if (e.axis !== gscroll.mapping.axisX && e.axis !== gscroll.mapping.axisY) {
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
