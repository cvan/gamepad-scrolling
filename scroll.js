(function () {
  // This works only with Xbox controller mapping and Firefox with
  // nonstandard gamepad events flipped on
  // (`dom.gamepad.non_standard_events.enabled` in `about:config`).
  // Eventually, we'll use `gamepad-plus` for wider support.

  var mapping = {
    axisX: 0,
    axisY: 1,
    back: 9,
    forward: 10
  };

  var AXIS_THRESHOLD = 0.15;
  var SCROLLING_SMOOTHING_FACTOR = 0.4;
  var SCROLLING_VELOCITY_THRESHOLD = 0.05;

  var scrollLoop = {};
  scrollLoop[mapping.axisX] = function () {
    scroll(mapping.axisX);
  };
  scrollLoop[mapping.axisY] = function () {
    scroll(mapping.axisY);
  };

  var scrollActive = {};
  var scrollRealVelocity = {};
  var scrollTime = {};
  var scrollTimeSinceLastUpdate = {};
  var scrollTimeSinceScrollStart = {};
  var scrollTimeStart = {};
  var scrollOffset = {};
  var scrollVelocity = {};
  var scrollWarp = 1;

  function scroll(axis) {
    scrollTimeSinceLastUpdate[axis] = Date.now() - scrollTime[axis];

    scrollWarp = 1;

    // Trigger hyperscrolling when the stick is held down for a while.
    var sqrt = Math.sqrt(
      scrollRealVelocity[mapping.axisX] * scrollRealVelocity[mapping.axisX] +
      scrollRealVelocity[mapping.axisY] * scrollRealVelocity[mapping.axisY]
    );

    if (sqrt > 0.8) {
      scrollTimeSinceScrollStart[axis] = Date.now() - scrollTimeStart[axis];
      if (scrollTimeSinceScrollStart[axis] > 3000) {
        scrollWarp = 5;
      } else if (scrollTimeSinceScrollStart[axis] > 1500) {
        scrollWarp = 2;
      }
    }

    // We give it some smooth easing in and a subtle easing out.
    scrollRealVelocity[axis] = (
      scrollWarp * scrollVelocity[axis] * SCROLLING_SMOOTHING_FACTOR +
      scrollRealVelocity[axis] * (1 - SCROLLING_SMOOTHING_FACTOR)
    );

    scrollOffset[axis] += scrollRealVelocity[axis] * scrollTimeSinceLastUpdate[axis];

    if (axis === mapping.axisX) {
      document.documentElement.scrollLeft = Math.round(scrollOffset[axis]);
    } else {
      document.documentElement.scrollTop = Math.round(scrollOffset[axis]);
    }

    scrollTime[axis] = Date.now();

    if (scrollActive[axis] || Math.abs(scrollRealVelocity[axis]) > SCROLLING_VELOCITY_THRESHOLD) {
      requestAnimationFrame(scrollLoop[axis]);
    }
  }

  window.addEventListener('gamepadconnected', function (e) {
    console.log('Gamepad connected at index %d: %s. %d buttons, %d axes.',
      e.gamepad.index, e.gamepad.id, e.gamepad.buttons.length, e.gamepad.axes.length);
  });

  window.addEventListener('gamepaddisconnected', function (e) {
    console.log('Gamepad removed at index %d: %s.', e.gamepad.index, e.gamepad.id);
  });

  window.addEventListener('gamepadaxismove', function (e) {
    if (Math.abs(e.value) < AXIS_THRESHOLD) {
      if (e.axis === mapping.axisX || e.axis === mapping.axisY) {
        scrollActive[e.axis] = false;
        scrollVelocity[e.axis] = 0;
      }
      return;
    }

    console.log('Gamepad axis move at index %d: %s. Axis: %d. Value: %f.',
      e.gamepad.index, e.gamepad.id, e.axis, e.value);

    if (e.axis === mapping.axisX || e.axis === mapping.axisY) {
      scrollVelocity[e.axis] = e.value;

      if (!scrollActive[e.axis]) {
        scrollActive[e.axis] = true;
        scrollRealVelocity[e.axis] = 0.0;
        scrollOffset[e.axis] = e.axis === mapping.axisX ? document.documentElement.scrollLeft : document.documentElement.scrollTop;
        scrollTimeStart[e.axis] = Date.now();
        scrollTime[e.axis] = Date.now();

        scroll(e.axis);
      }
    }
  });

  window.addEventListener('gamepadbuttondown', function (e) {
    console.log('Gamepad button down at index %d: %s. Button: %d.',
      e.gamepad.index, e.gamepad.id, e.button);

    switch (e.button) {
      case mapping.back:
        return window.history.back();
      case mapping.forward:
        return window.history.forward();
    }
  });

  window.addEventListener('gamepadbuttonup', function (e) {
    console.log('Gamepad button up at index %d: %s. Button: %d.',
      e.gamepad.index, e.gamepad.id, e.button);
  });

})(window);
