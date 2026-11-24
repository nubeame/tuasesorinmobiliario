// Vercel Serverless Function: envía el formulario de contacto por SMTP
// Variables de entorno: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, MAIL_TO
const nodemailer = require("nodemailer");

const esc = (s = "") =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Método no permitido" });
  }

  let body = req.body || {};
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch { body = Object.fromEntries(new URLSearchParams(body)); }
  }

  const { nombre = "", email = "", telefono = "", mensaje = "", website = "", captcha = "", captcha_a, captcha_b } = body;

  // Honeypot anti-spam: si un bot rellena el campo oculto, se descarta en silencio
  if (website) return res.status(200).json({ ok: true });

  // Captcha matemático
  if (Number(captcha) !== Number(captcha_a) + Number(captcha_b)) {
    return res.status(400).json({ ok: false, error: "La respuesta a la suma no es correcta." });
  }

  if (!nombre.trim() || !email.trim() || !mensaje.trim() || !telefono.trim()) {
    return res.status(400).json({ ok: false, error: "Por favor, rellena todos los campos." });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ ok: false, error: "El email no es válido." });
  }

  const port = Number(process.env.SMTP_PORT || 465);
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "mail.nubeame.com",
    port,
    secure: port === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD },
  });

  const to = process.env.MAIL_TO || "info@tuasesorinmobiliario.barcelona";

  try {
    await transporter.sendMail({
      from: `"Web Tu Asesor Inmobiliario" <${process.env.SMTP_USER}>`,
      to,
      replyTo: `"${nombre.replace(/"/g, "")}" <${email}>`,
      subject: `Nuevo mensaje de ${nombre} desde tuasesorinmobiliario.barcelona`,
      text: `Nombre: ${nombre}\nEmail: ${email}\nTeléfono: ${telefono}\n\nMensaje:\n${mensaje}`,
      html: `<h2>Nuevo mensaje desde la web</h2>
        <p><strong>Nombre:</strong> ${esc(nombre)}</p>
        <p><strong>Email:</strong> ${esc(email)}</p>
        <p><strong>Teléfono:</strong> ${esc(telefono)}</p>
        <p><strong>Mensaje:</strong><br>${esc(mensaje).replace(/\n/g, "<br>")}</p>`,
    });
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Error SMTP:", err);
    return res.status(500).json({ ok: false, error: "No se ha podido enviar el mensaje. Inténtalo de nuevo más tarde." });
  }
};
