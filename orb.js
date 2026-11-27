/* The Witt Handel sphere – "a network of brands" (hero visual, 27.11.2026).
   A slowly turning mesh of points; gold points are brands, small sparks travel along the lines like orders.
   It leans towards the mouse. Pauses when not visible; a still picture when the visitor prefers less motion.
   No libraries, nothing loaded from elsewhere. */
(function () {
  var c = document.querySelector("canvas.hero-orb"); if (!c || !c.getContext) return;
  var ctx = c.getContext("2d"), calm = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var small = innerWidth < 760, N = small ? 220 : 340, P = [], E = [], NB = [], i, j;
  for (i = 0; i < N; i++) { var y = 1 - (i / (N - 1)) * 2, r = Math.sqrt(1 - y * y), th = i * 2.39996323;
    P.push([Math.cos(th) * r, y, Math.sin(th) * r]); NB.push([]); }
  for (i = 0; i < N; i++) { var near = [];
    for (j = 0; j < N; j++) if (j !== i) { var dx = P[i][0] - P[j][0], dy = P[i][1] - P[j][1], dz = P[i][2] - P[j][2];
      near.push([dx * dx + dy * dy + dz * dz, j]); }
    near.sort(function (a, b) { return a[0] - b[0]; });
    for (j = 0; j < 3; j++) { var k = near[j][1]; if (k > i) E.push([i, k]); if (NB[i].indexOf(k) < 0) NB[i].push(k); if (NB[k].indexOf(i) < 0) NB[k].push(i); } }
  var BRAND = []; for (i = 0; i < N; i += Math.floor(N / 9)) BRAND.push(i);      // the brands: 9 gold points
  var sparks = [], W = 0, H = 0, D = 1, rot = 0, mx = 0, my = 0, tx = 0, ty = 0, raf = null, seen = true, t0 = performance.now();
  function size() { D = Math.min(devicePixelRatio || 1, 2); var b = c.getBoundingClientRect(); W = c.width = Math.round(b.width * D); H = c.height = Math.round(b.height * D); }
  function spark() { var from = BRAND[Math.floor(Math.random() * BRAND.length)], path = [from], at = from;
    for (var s = 0; s < 7; s++) { var nb = NB[at]; at = nb[Math.floor(Math.random() * nb.length)]; path.push(at); }
    sparks.push({path: path, t: 0, speed: 0.6 + Math.random() * 0.5}); }
  function draw(now) {
    var t = (now - t0) / 1000, R = Math.min(W, H) * 0.42, cx = W / 2, cy = H / 2;
    if (!calm) { rot += 0.0022; mx += (tx - mx) * 0.04; my += (ty - my) * 0.04; }
    var cs = Math.cos(rot + mx * 0.5), sn = Math.sin(rot + mx * 0.5), tl = 0.35 + my * 0.35, ct = Math.cos(tl), st = Math.sin(tl);
    ctx.clearRect(0, 0, W, H); ctx.globalCompositeOperation = "lighter";
    var g = ctx.createRadialGradient(cx, cy, R * 0.1, cx, cy, R * 1.5); g.addColorStop(0, "rgba(72,213,162,.16)"); g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    var S = new Array(N);
    for (i = 0; i < N; i++) { var p = P[i], b = 1 + 0.018 * Math.sin(t * 1.3 + p[1] * 4);
      var x = p[0] * b, yy = p[1] * b, z = p[2] * b, x2 = x * cs - z * sn, z2 = x * sn + z * cs, y2 = yy * ct - z2 * st, z3 = yy * st + z2 * ct, f = 2.8 / (2.8 + z3);
      S[i] = [cx + x2 * R * f, cy + y2 * R * f, z3]; }
    ctx.lineWidth = D * 0.7;
    for (i = 0; i < E.length; i++) { var A = S[E[i][0]], B = S[E[i][1]], d = (2 - (A[2] + B[2]) / 2) / 3;
      ctx.strokeStyle = "rgba(72,213,162," + (0.04 + d * 0.2).toFixed(3) + ")"; ctx.beginPath(); ctx.moveTo(A[0], A[1]); ctx.lineTo(B[0], B[1]); ctx.stroke(); }
    for (i = 0; i < N; i++) { var s = S[i], de = (1.2 - s[2]) / 2.2;
      ctx.fillStyle = "rgba(120,230,190," + (0.15 + de * 0.6).toFixed(3) + ")"; ctx.beginPath(); ctx.arc(s[0], s[1], D * (0.6 + de * 1.4), 0, 6.283); ctx.fill(); }
    for (i = 0; i < BRAND.length; i++) { var bp = S[BRAND[i]], dep = (1.2 - bp[2]) / 2.2, pul = 1 + 0.25 * Math.sin(t * 2 + i);
      ctx.fillStyle = "rgba(201,169,106," + (0.12 * dep).toFixed(3) + ")"; ctx.beginPath(); ctx.arc(bp[0], bp[1], D * 9 * pul * dep, 0, 6.283); ctx.fill();
      ctx.fillStyle = "rgba(232,200,130," + (0.4 + dep * 0.6).toFixed(3) + ")"; ctx.beginPath(); ctx.arc(bp[0], bp[1], D * (1.6 + dep * 2.2), 0, 6.283); ctx.fill(); }
    if (!calm && Math.random() < 0.05 && sparks.length < 14) spark();
    for (i = sparks.length - 1; i >= 0; i--) { var sp = sparks[i]; sp.t += 0.016 * sp.speed * 3; var seg = Math.floor(sp.t);
      if (seg >= sp.path.length - 1) { sparks.splice(i, 1); continue; }
      var a2 = S[sp.path[seg]], b2 = S[sp.path[seg + 1]], fr = sp.t - seg, px = a2[0] + (b2[0] - a2[0]) * fr, py = a2[1] + (b2[1] - a2[1]) * fr;
      ctx.fillStyle = "rgba(255,226,160,.9)"; ctx.beginPath(); ctx.arc(px, py, D * 1.8, 0, 6.283); ctx.fill();
      ctx.strokeStyle = "rgba(255,214,140,.35)"; ctx.lineWidth = D * 1.2; ctx.beginPath(); ctx.moveTo(a2[0], a2[1]); ctx.lineTo(px, py); ctx.stroke(); }
    ctx.globalCompositeOperation = "source-over";
  }
  function loop(now) { raf = null; if (!seen || document.hidden) return; draw(now); if (!calm) raf = requestAnimationFrame(loop); }
  function go() { if (!raf) raf = requestAnimationFrame(loop); }
  size(); go();
  addEventListener("resize", function () { size(); go(); });
  addEventListener("pointermove", function (e) { tx = (e.clientX / innerWidth - 0.5); ty = (e.clientY / innerHeight - 0.5); }, {passive: true});
  document.addEventListener("visibilitychange", go);
  if ("IntersectionObserver" in window) new IntersectionObserver(function (es) { seen = es[0].isIntersecting; go(); }).observe(c);
})();
