(function () {
  "use strict";

  /* Menú lateral */
  var body = document.body;
  function setMenu(open) {
    body.classList.toggle("menu-open", open);
    var t = document.querySelector(".menu-toggle");
    if (t) t.setAttribute("aria-expanded", open ? "true" : "false");
  }
  document.querySelectorAll(".menu-toggle").forEach(function (b) {
    b.addEventListener("click", function () { setMenu(!body.classList.contains("menu-open")); });
  });
  document.querySelectorAll(".menu-close, .menu-overlay").forEach(function (b) {
    b.addEventListener("click", function () { setMenu(false); });
  });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") setMenu(false); });

  /* Sliders automáticos (3,5 s, fundido) */
  document.querySelectorAll(".fullwidth-slider").forEach(function (slider) {
    var slides = slider.querySelectorAll(".slide");
    if (slides.length < 2) return;
    var i = 0;
    setInterval(function () {
      slides[i].classList.remove("active");
      i = (i + 1) % slides.length;
      slides[i].classList.add("active");
    }, 3500);
  });

  /* Formulario de contacto */
  var form = document.getElementById("contact-form");
  if (!form) return;
  var msg = form.querySelector(".form-message");
  var btn = form.querySelector(".btn-submit");
  var qa = form.querySelector("[name=captcha_a]");
  var qb = form.querySelector("[name=captcha_b]");
  var qText = form.querySelector(".captcha-question");

  function newCaptcha() {
    var a = 1 + Math.floor(Math.random() * 15);
    var b = 1 + Math.floor(Math.random() * 15);
    qa.value = a; qb.value = b; qText.textContent = a + " + " + b;
    form.querySelector("[name=captcha]").value = "";
  }
  newCaptcha();

  function show(text, isError) {
    msg.textContent = text;
    msg.classList.toggle("error", !!isError);
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var data = Object.fromEntries(new FormData(form).entries());

    if (!data.nombre.trim() || !data.email.trim() || !data.mensaje.trim() || !data.telefono.trim()) {
      return show("Por favor, rellena todos los campos.", true);
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      return show("Por favor, introduce una dirección de email válida.", true);
    }
    if (Number(data.captcha) !== Number(data.captcha_a) + Number(data.captcha_b)) {
      return show("Has introducido un número de captcha incorrecto.", true);
    }

    btn.disabled = true;
    show("Enviando…");
    fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    })
      .then(function (r) { return r.json().then(function (j) { return { ok: r.ok && j.ok, j: j }; }); })
      .then(function (res) {
        if (res.ok) {
          form.reset();
          show("¡Gracias por contactar con nosotros!");
        } else {
          show(res.j.error || "No se ha podido enviar el mensaje.", true);
        }
        newCaptcha();
      })
      .catch(function () {
        show("No se ha podido enviar el mensaje. Inténtalo de nuevo más tarde.", true);
        newCaptcha();
      })
      .finally(function () { btn.disabled = false; });
  });
})();
