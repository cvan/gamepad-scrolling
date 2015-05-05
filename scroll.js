(function (window) {
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

  var axis2key = function (axis) {
    if (axis === mapping.axisX) {
      return 'x';
    } else if (axis === mapping.axisY) {
      return 'y';
    }
  };

  var getActiveScrollElement = function (doc) {
    doc = doc || document;
    var el = doc.activeElement;
    return el === doc.body ? doc.documentElement : el;
  };

  var AXIS_THRESHOLD = 0.15;
  var SCROLLING_SMOOTHING_FACTOR = 0.4;
  var SCROLLING_VELOCITY_THRESHOLD = 0.05;

  var scrollActive = false;
  var scrollOffset = {};
  var scrollRealVelocity = {x: 0.0, y: 0.0};
  var scrollTime = null;
  var scrollTimeSinceLastUpdate = null;
  var scrollTimeSinceScrollStart = null;
  var scrollTimeStart = null;
  var scrollVelocity = {x: 0.0, y: 0.0};
  var scrollVelocitySpeed = null;
  var scrollWarp = 1;

  var scroll = function () {
    scrollTimeSinceLastUpdate = Date.now() - scrollTime;

    // Trigger hyperscrolling when the stick is held down for a while.
    scrollVelocitySpeed = Math.sqrt(
      scrollRealVelocity.x * scrollRealVelocity.x +
      scrollRealVelocity.y * scrollRealVelocity.y
    );

    scrollWarp = 1;

    if (scrollVelocitySpeed > 0.8) {
      scrollTimeSinceScrollStart = Date.now() - scrollTimeStart;
      if (scrollTimeSinceScrollStart > 3000) {
        scrollWarp = 5;
      } else if (scrollTimeSinceScrollStart > 1500) {
        scrollWarp = 2;
      }
    }

    // We give it some smooth easing in and a subtle easing out.
    scrollRealVelocity.x = (
      scrollWarp * scrollVelocity.x * SCROLLING_SMOOTHING_FACTOR +
      scrollRealVelocity.x * (1 - SCROLLING_SMOOTHING_FACTOR)
    );
    scrollRealVelocity.y = (
      scrollWarp * scrollVelocity.y * SCROLLING_SMOOTHING_FACTOR +
      scrollRealVelocity.y * (1 - SCROLLING_SMOOTHING_FACTOR)
    );

    scrollOffset.x += scrollRealVelocity.x * scrollTimeSinceLastUpdate;
    scrollOffset.y += scrollRealVelocity.y * scrollTimeSinceLastUpdate;

    var activeElement = getActiveScrollElement();

    activeElement.scrollLeft = Math.round(scrollOffset.x);
    activeElement.scrollTop = Math.round(scrollOffset.y);

    scrollTime = Date.now();

    if (scrollActive || scrollVelocitySpeed > SCROLLING_VELOCITY_THRESHOLD) {
      requestAnimationFrame(scroll);
    }
  };

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
        scrollActive = false;
        scrollVelocity[axis2key(e.axis)] = 0;
      }
      return;
    }

    console.log('Gamepad axis move at index %d: %s. Axis: %d. Value: %f.',
      e.gamepad.index, e.gamepad.id, e.axis, e.value);

    if (e.axis === mapping.axisX || e.axis === mapping.axisY) {
      scrollVelocity[axis2key(e.axis)] = e.value;

      var activeElement = getActiveScrollElement();

      document.title = activeElement.tagName;

      if (!scrollActive) {
        scrollActive = true;
        scrollRealVelocity[axis2key(e.axis)] = 0.0;
        scrollOffset.x = activeElement.scrollLeft;
        scrollOffset.y = activeElement.scrollTop;
        scrollTimeStart = Date.now();
        scrollTime = Date.now();

        scroll();
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
