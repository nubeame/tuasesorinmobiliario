# Tu Asesor Inmobiliario

Réplica estática de https://tuasesorinmobiliario.barcelona (antes WordPress + Divi), alojada en Vercel.

- `index.html` – portada (slider de escritorio y slider móvil, como el original)
- `contacto/` – página de contacto con formulario
- `api/contact.js` – Vercel Serverless Function que envía el formulario por SMTP con Nodemailer
- `images/` – imágenes originales de la web

## Variables de entorno (Vercel)

| Variable | Valor |
|---|---|
| `SMTP_HOST` | `mail.nubeame.com` |
| `SMTP_PORT` | `465` |
| `SMTP_USER` | `tuasesorinmobiliario@nubeame.com` |
| `SMTP_PASSWORD` | contraseña de la cuenta |
| `MAIL_TO` | `info@tuasesorinmobiliario.barcelona` |

## Limpieza de la infección

En la web original había dos páginas de spam inyectadas el 16/11/2026 con el usuario `admin`
(«Being Active in Personal Healthcare Decisions» y «Signs You Should See a Doctor Instead of Self-Diagnosing»,
con enlaces a mydoc.org.ua, advogadors.com.br, okclinic.net.ua y spiritstrong.com). No se han copiado:
en esta versión esas URL devuelven 404.
