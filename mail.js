/* Contact subjects (07.11.2026): a click shows the ready-made email on the page, with "copy" and "open in email app".
   Works without an email app (desktop browsers, in-app browsers). Nothing is sent or stored by this site. */
(function () {
  var de = (document.documentElement.lang || "de").indexOf("de") === 0;
  var L = de ? { to: "An", subject: "Betreff", copy: "Text kopieren", copied: "Kopiert ✓", open: "Im E-Mail-Programm öffnen",
                 addr: "Adresse kopieren", hint: "Text kopieren, in Ihre E-Mail einfügen und an info@witthandel.de senden." }
             : { to: "To", subject: "Subject", copy: "Copy text", copied: "Copied ✓", open: "Open in email app",
                 addr: "Copy address", hint: "Copy the text, paste it into your email and send it to info@witthandel.de." };
  function parse(href) {
    var m = href.replace(/^mailto:/, "").split("?"), q = {}, to = decodeURIComponent(m[0]);
    (m[1] || "").split("&").forEach(function (kv) { var p = kv.split("="); if (p[0]) q[p[0]] = decodeURIComponent(p[1] || ""); });
    return { to: to, subject: q.subject || "", body: q.body || "" };
  }
  function copy(text, btn) {
    var done = function () { var t = btn.textContent; btn.textContent = L.copied; setTimeout(function () { btn.textContent = t; }, 1600); };
    if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(text).then(done, function () {}); return; }
    var ta = document.createElement("textarea"); ta.value = text; document.body.appendChild(ta); ta.select();
    try { document.execCommand("copy"); done(); } catch (e) {} document.body.removeChild(ta);
  }
  document.querySelectorAll(".subjects").forEach(function (box) {
    var panel = document.createElement("div"); panel.className = "mail-draft"; panel.hidden = true;
    panel.setAttribute("aria-live", "polite"); box.appendChild(panel);
    box.querySelectorAll(".chips a").forEach(function (a) {
      a.setAttribute("role", "button");
      a.addEventListener("click", function (ev) {
        ev.preventDefault();
        box.querySelectorAll(".chips a").forEach(function (x) { x.classList.toggle("on", x === a); x.setAttribute("aria-pressed", x === a); });
        var m = parse(a.getAttribute("href")), text = m.body;
        panel.innerHTML = "";
        var head = document.createElement("dl");
        [[L.to, m.to], [L.subject, m.subject]].forEach(function (r) {
          var dt = document.createElement("dt"), dd = document.createElement("dd"); dt.textContent = r[0]; dd.textContent = r[1];
          head.appendChild(dt); head.appendChild(dd);
        });
        panel.appendChild(head);
        if (text) { var pre = document.createElement("pre"); pre.textContent = text; panel.appendChild(pre); }
        var row = document.createElement("div"); row.className = "mail-actions";
        var b1 = document.createElement("button"); b1.type = "button"; b1.textContent = L.copy;
        b1.addEventListener("click", function () { copy(L.subject + ": " + m.subject + "\n\n" + text, b1); });
        var b2 = document.createElement("button"); b2.type = "button"; b2.textContent = L.addr;
        b2.addEventListener("click", function () { copy(m.to, b2); });
        var b3 = document.createElement("a"); b3.href = a.getAttribute("href"); b3.textContent = L.open + " →";
        row.appendChild(b1); row.appendChild(b2); row.appendChild(b3); panel.appendChild(row);
        var p = document.createElement("p"); p.className = "mail-hint"; p.textContent = L.hint; panel.appendChild(p);
        panel.hidden = false;
      });
    });
  });
})();
