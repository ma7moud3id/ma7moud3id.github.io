/* ============================================================
   Mahmoud Eid — Digital Contact Card
   card-script.js
   ------------------------------------------------------------
   Sections:
     1. Circuit background particles
     2. Animated border trace (SVG outline draw effect)
   ============================================================ */

(() => {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ============================================================
     1. Circuit background particles
     Spawns a handful of glowing dots that float up from the
     bottom of the screen at randomized sizes/speeds.
     ============================================================ */
  function initCircuitBackground() {
    const bg = document.getElementById('circuitBg');
    if (!bg || reduceMotion) return;

    const NODE_COUNT = 26;
    for (let i = 0; i < NODE_COUNT; i++) {
      const node = document.createElement('div');
      node.className = 'circuit-node' + (Math.random() > 0.55 ? ' magenta' : '');

      const size = 2 + Math.random() * 3;
      node.style.width = `${size}px`;
      node.style.height = `${size}px`;
      node.style.left = `${Math.random() * 100}vw`;
      node.style.bottom = '-10px';
      node.style.animationDuration = `${7 + Math.random() * 9}s`;
      node.style.animationDelay = `${Math.random() * 10}s`;

      bg.appendChild(node);
    }
  }

  /* ============================================================
     2. Animated border trace
     Sizes the SVG outline to match the card, then animates a
     dashed segment traveling continuously around the perimeter.
     ============================================================ */
  function setupTrace() {
    const wrap = document.querySelector('.card-wrap');
    const svg = document.getElementById('traceSvg');
    const rect = document.getElementById('traceRect');
    if (!wrap || !svg || !rect) return;

    const width = wrap.offsetWidth;
    const height = wrap.offsetHeight;
    const strokeWidth = 2;

    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    rect.setAttribute('x', strokeWidth / 2);
    rect.setAttribute('y', strokeWidth / 2);
    rect.setAttribute('width', width - strokeWidth);
    rect.setAttribute('height', height - strokeWidth);

    const perimeter = 2 * ((width - strokeWidth) + (height - strokeWidth));
    const dashLength = perimeter * 0.16;
    rect.style.strokeDasharray = `${dashLength} ${perimeter - dashLength}`;

    if (!reduceMotion) {
      rect.animate(
        [{ strokeDashoffset: 0 }, { strokeDashoffset: -perimeter }],
        { duration: 4500, iterations: Infinity, easing: 'linear' }
      );
    }
  }

  /* ============================================================
     Init
     ============================================================ */
  initCircuitBackground();
  window.addEventListener('load', setupTrace);
  window.addEventListener('resize', setupTrace);
})();
