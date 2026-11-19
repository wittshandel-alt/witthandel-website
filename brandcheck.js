/* Free brand check form (20.11.2026). The details go to Witt Handel's own server, where the request is checked and
   reviewed personally before the report is sent by email. Without a server address set (data-endpoint), the form
   opens the ready email instead, like before. No cookies, nothing stored in the browser. */
(function () {
  var form = document.querySelector(".bc-form");
  if (!form) return;
  var de = form.getAttribute("data-lang") !== "en";
  var T = de ? {
    need: "Bitte Marke und eine gültige E-Mail-Adresse angeben und die Einwilligung bestätigen.",
    sending: "Wird gesendet …",
    ok: "Vielen Dank! Ihre Anfrage ist bei uns. Wir prüfen sie persönlich und senden Ihnen den Marken-Check als PDF an Ihre E-Mail-Adresse.",
    limit: "Für diese E-Mail-Adresse liegt bereits eine Anfrage vor – wir melden uns. Bei Fragen: info@witthandel.de",
    error: "Das hat leider nicht geklappt. Bitte senden Sie uns Ihre Anfrage per E-Mail an info@witthandel.de.",
    subject: "Kostenloser Marken-Check", labels: ["Marke", "Website", "Produkt-Link oder EAN", "Ansprechpartner", "E-Mail"]
  } : {
    need: "Please enter the brand and a valid email address and tick the consent box.",
    sending: "Sending …",
    ok: "Thank you! We have your request. We review it personally and send the brand check as a PDF to your email address.",
    limit: "There is already a request for this email address – we'll be in touch. Questions: info@witthandel.de",
    error: "Sorry, that didn't work. Please send your request by email to info@witthandel.de.",
    subject: "Free brand check", labels: ["Brand", "Website", "Product link or EAN", "Contact person", "Email"]
  };
  var msg = form.querySelector(".bc-msg"), button = form.querySelector("button[type=submit]");
  function say(text, kind) { msg.textContent = text; msg.className = "bc-msg " + (kind || ""); msg.hidden = false; }
  function val(n) { var el = form.elements[n]; return el ? (el.type === "checkbox" ? (el.checked ? "1" : "") : el.value.trim()) : ""; }
  form.addEventListener("submit", function (ev) {
    ev.preventDefault();
    if (!val("brand") || !/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(val("email")) || !val("consent")) { say(T.need, "warn"); return; }
    var endpoint = form.getAttribute("data-endpoint");
    if (!endpoint) {  // no server address yet: the ready email, as before
      var body = [val("brand"), val("website"), val("product"), val("name"), val("email")]
        .map(function (v, i) { return T.labels[i] + ": " + v; }).join("\n");
      location.href = "mailto:info@witthandel.de?subject=" + encodeURIComponent(T.subject) + "&body=" + encodeURIComponent(body);
      return;
    }
    var data = new URLSearchParams();
    ["brand", "website", "product", "name", "email", "company_url", "consent"].forEach(function (n) { data.append(n, val(n)); });
    data.append("lang", de ? "de" : "en");
    button.disabled = true; say(T.sending);
    fetch(endpoint, { method: "POST", body: data, mode: "cors", credentials: "omit" })
      .then(function (r) {
        if (r.ok) { form.querySelector(".bc-grid").hidden = true; form.querySelector(".bc-consent").hidden = true;
                    form.querySelector(".gso-cta").hidden = true; say(T.ok, "ok"); return; }
        button.disabled = false; say(r.status === 429 ? T.limit : (r.status === 400 ? T.need : T.error), "warn");
      })
      .catch(function () { button.disabled = false; say(T.error, "warn"); });
  });
})();
