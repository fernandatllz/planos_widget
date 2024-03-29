/**
 * Panzoom for panning and zooming elements using CSS transforms
 * Copyright Timmy Willison and other contributors
 * https://github.com/timmywil/panzoom/blob/main/MIT-License.txt
 */
!(function (t, e) {
  "object" == typeof exports && "undefined" != typeof module
    ? (module.exports = e())
    : "function" == typeof define && define.amd
    ? define(e)
    : ((t = "undefined" != typeof globalThis ? globalThis : t || self).Panzoom =
        e());
})(this, function () {
  "use strict";
  var Y = function () {
    return (Y =
      Object.assign ||
      function (t) {
        for (var e, n = 1, o = arguments.length; n < o; n++)
          for (var r in (e = arguments[n]))
            Object.prototype.hasOwnProperty.call(e, r) && (t[r] = e[r]);
        return t;
      }).apply(this, arguments);
  };
  function C(t, e) {
    for (var n = t.length; n--; ) if (t[n].pointerId === e.pointerId) return n;
    return -1;
  }
  function T(t, e) {
    if (e.touches)
      for (var n = 0, o = 0, r = e.touches; o < r.length; o++) {
        var a = r[o];
        (a.pointerId = n++), T(t, a);
      }
    else -1 < (n = C(t, e)) && t.splice(n, 1), t.push(e);
  }
  function N(t) {
    for (var e, n = (t = t.slice(0)).pop(); (e = t.pop()); )
      n = {
        clientX: (e.clientX - n.clientX) / 2 + n.clientX,
        clientY: (e.clientY - n.clientY) / 2 + n.clientY,
      };
    return n;
  }
  function L(t) {
    if (t.length < 2) return 0;
    var e = t[0],
      t = t[1];
    return Math.sqrt(
      Math.pow(Math.abs(t.clientX - e.clientX), 2) +
        Math.pow(Math.abs(t.clientY - e.clientY), 2)
    );
  }
  "undefined" != typeof window &&
    (window.NodeList &&
      !NodeList.prototype.forEach &&
      (NodeList.prototype.forEach = Array.prototype.forEach),
    "function" != typeof window.CustomEvent &&
      (window.CustomEvent = function (t, e) {
        e = e || { bubbles: !1, cancelable: !1, detail: null };
        var n = document.createEvent("CustomEvent");
        return n.initCustomEvent(t, e.bubbles, e.cancelable, e.detail), n;
      }));
  var V = { down: "mousedown", move: "mousemove", up: "mouseup mouseleave" };
  function G(t, e, n, o) {
    V[t].split(" ").forEach(function (t) {
      e.addEventListener(t, n, o);
    });
  }
  function I(t, e, n) {
    V[t].split(" ").forEach(function (t) {
      e.removeEventListener(t, n);
    });
  }
  "undefined" != typeof window &&
    ("function" == typeof window.PointerEvent
      ? (V = {
          down: "pointerdown",
          move: "pointermove",
          up: "pointerup pointerleave pointercancel",
        })
      : "function" == typeof window.TouchEvent &&
        (V = {
          down: "touchstart",
          move: "touchmove",
          up: "touchend touchcancel",
        }));
  var a,
    i = "undefined" != typeof document && !!document.documentMode;
  var l = ["webkit", "moz", "ms"],
    c = {};
  function W(t) {
    if (c[t]) return c[t];
    var e = (a = a || document.createElement("div").style);
    if (t in e) return (c[t] = t);
    for (var n = t[0].toUpperCase() + t.slice(1), o = l.length; o--; ) {
      var r = "" + l[o] + n;
      if (r in e) return (c[t] = r);
    }
  }
  function r(t, e) {
    return parseFloat(e[W(t)]) || 0;
  }
  function s(t, e, n) {
    var o = "border" === e ? "Width" : "";
    return {
      left: r(
        e + "Left" + o,
        (n = void 0 === n ? window.getComputedStyle(t) : n)
      ),
      right: r(e + "Right" + o, n),
      top: r(e + "Top" + o, n),
      bottom: r(e + "Bottom" + o, n),
    };
  }
  function Z(t, e, n) {
    t.style[W(e)] = n;
  }
  function q(t) {
    var e = t.parentNode,
      n = window.getComputedStyle(t),
      o = window.getComputedStyle(e),
      r = t.getBoundingClientRect(),
      a = e.getBoundingClientRect();
    return {
      elem: {
        style: n,
        width: r.width,
        height: r.height,
        top: r.top,
        bottom: r.bottom,
        left: r.left,
        right: r.right,
        margin: s(t, "margin", n),
        border: s(t, "border", n),
      },
      parent: {
        style: o,
        width: a.width,
        height: a.height,
        top: a.top,
        bottom: a.bottom,
        left: a.left,
        right: a.right,
        padding: s(e, "padding", o),
        border: s(e, "border", o),
      },
    };
  }
  var B = /^http:[\w\.\/]+svg$/;
  var D = {
    animate: !1,
    canvas: !1,
    cursor: "move",
    disablePan: !1,
    disableZoom: !1,
    disableXAxis: !1,
    disableYAxis: !1,
    duration: 200,
    easing: "ease-in-out",
    exclude: [],
    excludeClass: "panzoom-exclude",
    handleStartEvent: function (t) {
      t.preventDefault(), t.stopPropagation();
    },
    maxScale: 14,
    minScale: 0.125,
    overflow: "hidden",
    panOnlyWhenZoomed: !1,
    relative: !1,
    setTransform: function (t, e, n) {
      var o = e.x,
        r = e.y,
        a = e.scale,
        e = e.isSVG;
      Z(t, "transform", "scale(" + a + ") translate(" + o + "px, " + r + "px)"),
        e &&
          i &&
          ((e = window.getComputedStyle(t).getPropertyValue("transform")),
          t.setAttribute("transform", e));
    },
    startX: 0,
    startY: 0,
    startScale: 1,
    step: 0.3,
    touchAction: "none",
  };
  function t(d, f) {
    if (!d) throw new Error("Panzoom requires an element as an argument");
    if (1 !== d.nodeType)
      throw new Error("Panzoom requires an element with a nodeType of 1");
    if (
      ((t = (e = d).ownerDocument),
      (e = e.parentNode),
      !(
        t &&
        e &&
        9 === t.nodeType &&
        1 === e.nodeType &&
        t.documentElement.contains(e)
      ))
    )
      throw new Error(
        "Panzoom should be called on elements that have been attached to the DOM"
      );
    var t;
    f = Y(Y({}, D), f);
    var e,
      c =
        ((e = d), B.test(e.namespaceURI) && "svg" !== e.nodeName.toLowerCase()),
      n = d.parentNode;
    (n.style.overflow = f.overflow),
      (n.style.userSelect = "none"),
      (n.style.touchAction = f.touchAction),
      ((f.canvas ? n : d).style.cursor = f.cursor),
      (d.style.userSelect = "none"),
      (d.style.touchAction = f.touchAction),
      Z(
        d,
        "transformOrigin",
        "string" == typeof f.origin ? f.origin : c ? "0 0" : "50% 50%"
      );
    var o,
      r,
      a,
      i,
      l,
      s,
      m = 0,
      h = 0,
      v = 1,
      p = !1;
    function u(t, e, n) {
      n.silent || ((e = new CustomEvent(t, { detail: e })), d.dispatchEvent(e));
    }
    function g(e, n, t) {
      var o = { x: m, y: h, scale: v, isSVG: c, originalEvent: t };
      return (
        requestAnimationFrame(function () {
          var t;
          "boolean" == typeof n.animate &&
            (n.animate
              ? ((t = n),
                Z(
                  d,
                  "transition",
                  W("transform") + " " + t.duration + "ms " + t.easing
                ))
              : Z(d, "transition", "none")),
            n.setTransform(d, o, n),
            u(e, o, n),
            u("panzoomchange", o, n);
        }),
        o
      );
    }
    function y(t, e, n, o) {
      var r,
        a,
        i,
        l,
        c,
        s,
        p = Y(Y({}, f), o),
        u = { x: m, y: h, opts: p };
      return (
        (!p.force &&
          (p.disablePan || (p.panOnlyWhenZoomed && v === p.startScale))) ||
          ((t = parseFloat(t)),
          (e = parseFloat(e)),
          p.disableXAxis || (u.x = (p.relative ? m : 0) + t),
          p.disableYAxis || (u.y = (p.relative ? h : 0) + e),
          p.contain &&
            ((t = ((o = (a = (r = q(d)).elem.width / v) * n) - a) / 2),
            (e = ((a = (e = r.elem.height / v) * n) - e) / 2),
            "inside" === p.contain
              ? ((i = (-r.elem.margin.left - r.parent.padding.left + t) / n),
                (l =
                  (r.parent.width -
                    o -
                    r.parent.padding.left -
                    r.elem.margin.left -
                    r.parent.border.left -
                    r.parent.border.right +
                    t) /
                  n),
                (u.x = Math.max(Math.min(u.x, l), i)),
                (c = (-r.elem.margin.top - r.parent.padding.top + e) / n),
                (s =
                  (r.parent.height -
                    a -
                    r.parent.padding.top -
                    r.elem.margin.top -
                    r.parent.border.top -
                    r.parent.border.bottom +
                    e) /
                  n),
                (u.y = Math.max(Math.min(u.y, s), c)))
              : "outside" === p.contain &&
                ((i =
                  (-(o - r.parent.width) -
                    r.parent.padding.left -
                    r.parent.border.left -
                    r.parent.border.right +
                    t) /
                  n),
                (l = (t - r.parent.padding.left) / n),
                (u.x = Math.max(Math.min(u.x, l), i)),
                (c =
                  (-(a - r.parent.height) -
                    r.parent.padding.top -
                    r.parent.border.top -
                    r.parent.border.bottom +
                    e) /
                  n),
                (s = (e - r.parent.padding.top) / n),
                (u.y = Math.max(Math.min(u.y, s), c)))),
          p.roundPixels && ((u.x = Math.round(u.x)), (u.y = Math.round(u.y)))),
        u
      );
    }
    function w(t, e) {
      var n = Y(Y({}, f), e),
        o = { scale: v, opts: n };
      if (!n.force && n.disableZoom) return o;
      var r,
        a = f.minScale,
        i = f.maxScale;
      return (
        n.contain &&
          ((e = (r = q(d)).elem.width / v),
          (n = r.elem.height / v),
          1 < e &&
            1 < n &&
            ((e =
              (r.parent.width - r.parent.border.left - r.parent.border.right) /
              e),
            (n =
              (r.parent.height - r.parent.border.top - r.parent.border.bottom) /
              n),
            "inside" === f.contain
              ? (i = Math.min(i, e, n))
              : "outside" === f.contain && (a = Math.max(a, e, n)))),
        (o.scale = Math.min(Math.max(t, a), i)),
        o
      );
    }
    function b(t, e, n, o) {
      n = y(t, e, v, n);
      return m !== n.x || h !== n.y
        ? ((m = n.x), (h = n.y), g("panzoompan", n.opts, o))
        : { x: m, y: h, scale: v, isSVG: c, originalEvent: o };
    }
    function x(t, e, n) {
      var o = w(t, e),
        r = o.opts;
      if (r.force || !r.disableZoom) {
        t = o.scale;
        var a = m,
          e = h;
        r.focal &&
          ((a = ((o = r.focal).x / t - o.x / v + m * t) / t),
          (e = (o.y / t - o.y / v + h * t) / t));
        e = y(a, e, t, { relative: !1, force: !0 });
        return (m = e.x), (h = e.y), (v = t), g("panzoomzoom", r, n);
      }
    }
    function E(t, e) {
      e = Y(Y(Y({}, f), { animate: !0 }), e);
      return x(v * Math.exp((t ? 1 : -1) * e.step), e);
    }
    function S(t, e, n, o) {
      var r = q(d),
        a =
          r.parent.width -
          r.parent.padding.left -
          r.parent.padding.right -
          r.parent.border.left -
          r.parent.border.right,
        i =
          r.parent.height -
          r.parent.padding.top -
          r.parent.padding.bottom -
          r.parent.border.top -
          r.parent.border.bottom,
        l =
          e.clientX -
          r.parent.left -
          r.parent.padding.left -
          r.parent.border.left -
          r.elem.margin.left,
        e =
          e.clientY -
          r.parent.top -
          r.parent.padding.top -
          r.parent.border.top -
          r.elem.margin.top;
      c || ((l -= r.elem.width / v / 2), (e -= r.elem.height / v / 2));
      i = { x: (l / a) * (a * t), y: (e / i) * (i * t) };
      return x(t, Y(Y({ animate: !1 }, n), { focal: i }), o);
    }
    x(f.startScale, { animate: !1, force: !0 }),
      setTimeout(function () {
        b(f.startX, f.startY, { animate: !1, force: !0 });
      });
    var M = [];
    function A(t) {
      !(function (t, e) {
        for (var n, o, r = t; null != r; r = r.parentNode)
          if (
            ((n = r),
            (o = e.excludeClass),
            (1 === n.nodeType &&
              -1 <
                (" " + (n.getAttribute("class") || "").trim() + " ").indexOf(
                  " " + o + " "
                )) ||
              -1 < e.exclude.indexOf(r))
          )
            return 1;
      })(t.target, f) &&
        (T(M, t),
        (p = !0),
        f.handleStartEvent(t),
        u(
          "panzoomstart",
          { x: (o = m), y: (r = h), scale: v, isSVG: c, originalEvent: t },
          f
        ),
        (t = N(M)),
        (a = t.clientX),
        (i = t.clientY),
        (l = v),
        (s = L(M)));
    }
    function O(t) {
      var e;
      p &&
        void 0 !== o &&
        void 0 !== r &&
        void 0 !== a &&
        void 0 !== i &&
        (T(M, t),
        (e = N(M)),
        1 < M.length
          ? (0 === s && (s = L(M)),
            S(w(((L(M) - s) * f.step) / 80 + l).scale, e))
          : b(
              o + (e.clientX - a) / v,
              r + (e.clientY - i) / v,
              { animate: !1 },
              t
            ));
    }
    function P(t) {
      1 === M.length &&
        u(
          "panzoomend",
          { x: m, y: h, scale: v, isSVG: c, originalEvent: t },
          f
        ),
        (function (t, e) {
          if (e.touches) for (; t.length; ) t.pop();
          else {
            e = C(t, e);
            -1 < e && t.splice(e, 1);
          }
        })(M, t),
        p && ((p = !1), (o = r = a = i = void 0));
    }
    var z = !1;
    function X() {
      z ||
        ((z = !0),
        G("down", f.canvas ? n : d, A),
        G("move", document, O, { passive: !0 }),
        G("up", document, P, { passive: !0 }));
    }
    return (
      f.noBind || X(),
      {
        bind: X,
        destroy: function () {
          (z = !1),
            I("down", f.canvas ? n : d, A),
            I("move", document, O),
            I("up", document, P);
        },
        eventNames: V,
        getPan: function () {
          return { x: m, y: h };
        },
        getScale: function () {
          return v;
        },
        getOptions: function () {
          return (function (t) {
            var e,
              n = {};
            for (e in t) t.hasOwnProperty(e) && (n[e] = t[e]);
            return n;
          })(f);
        },
        pan: b,
        reset: function (t) {
          var e = Y(Y(Y({}, f), { animate: !0, force: !0 }), t);
          return (
            (v = w(e.startScale, e).scale),
            (t = y(e.startX, e.startY, v, e)),
            (m = t.x),
            (h = t.y),
            g("panzoomreset", e)
          );
        },
        resetStyle: function () {
          (n.style.overflow = ""),
            (n.style.userSelect = ""),
            (n.style.touchAction = ""),
            (n.style.cursor = ""),
            (d.style.cursor = ""),
            (d.style.userSelect = ""),
            (d.style.touchAction = ""),
            Z(d, "transformOrigin", "");
        },
        setOptions: function (t) {
          for (var e in (t = void 0 === t ? {} : t))
            t.hasOwnProperty(e) && (f[e] = t[e]);
          (t.hasOwnProperty("cursor") || t.hasOwnProperty("canvas")) &&
            ((n.style.cursor = d.style.cursor = ""),
            ((f.canvas ? n : d).style.cursor = f.cursor)),
            t.hasOwnProperty("overflow") && (n.style.overflow = t.overflow),
            t.hasOwnProperty("touchAction") &&
              ((n.style.touchAction = t.touchAction),
              (d.style.touchAction = t.touchAction));
        },
        setStyle: function (t, e) {
          return Z(d, t, e);
        },
        zoom: x,
        zoomIn: function (t) {
          return E(!0, t);
        },
        zoomOut: function (t) {
          return E(!1, t);
        },
        zoomToPoint: S,
        zoomWithWheel: function (t, e) {
          t.preventDefault();
          var n = Y(Y(Y({}, f), e), { animate: !1 }),
            e = 0 === t.deltaY && t.deltaX ? t.deltaX : t.deltaY;
          return S(
            w(v * Math.exp(((e < 0 ? 1 : -1) * n.step) / 3), n).scale,
            t,
            n
          );
        },
      }
    );
  }
  return (t.defaultOptions = D), t;
});
