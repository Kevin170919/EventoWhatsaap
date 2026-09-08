const express = require("express")
const router = express.Router()
const { v4: uuid } = require("uuid")
const sessions = require("../utils/sessions")
const { generateToken } = require("../services/id4face.service")

const LOGO_BASE64 = "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"

// ─── Crear sesión y generar link biométrico ───────────────────────────────
router.post("/start-verification", async (req, res) => {
  try {
    const { cedula, dactilar } = req.body

    if (!cedula || !dactilar) {
      return res.status(400).json({
        success: false,
        message: "cedula y dactilar son requeridos"
      })
    }

    const token = await generateToken()
    const sessionId = uuid()

    sessions[sessionId] = {
      cedula,
      dactilar,
      token,
      createdAt: new Date()
    }

    const verificationUrl = `${process.env.SELF_URL}/verify/${sessionId}`

    return res.json({
      success: true,
      sessionId,
      url: verificationUrl
    })
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message })
  }
})

// ─── Servir página HTML con componente id4face ───────────────────────────
router.get("/verify/:sessionId", async (req, res) => {
  try {
    const { sessionId } = req.params
    const session = sessions[sessionId]

    if (!session) {
      return res.status(404).send("Sesión no encontrada")
    }

    const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Validación Biométrica</title>
  <script src="https://id4face.eclipsoft.com/dist/id4face@latest.js" crossorigin="anonymous" defer></script>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: Arial, sans-serif;
      background: #f5f5f5;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .container {
      max-width: 500px;
      width: 100%;
      background: white;
      padding: 32px 24px;
      border-radius: 16px;
      box-shadow: 0 4px 24px rgba(0,0,0,0.1);
      text-align: center;
    }
    h2 { color: #111827; margin-bottom: 8px; font-size: 1.4rem; }
    #status { color: #6b7280; font-size: 0.9rem; margin-bottom: 24px; }
    eclipsoft-id4face { display: block; }
  </style>
</head>
<body>
  <div class="container">
    <img src="data:image/png;base64,${LOGO_BASE64}" style="width: 60px; margin-bottom: 16px;" alt="Logo" />
    <h2>Validación Biométrica</h2>
    <p id="status">Inicializando...</p>
    <eclipsoft-id4face dismissable oval limits></eclipsoft-id4face>
  </div>

  <script>
    const WHATSAPP_RETURN_URL = "https://wa.me/${process.env.WHATSAPP_NUMBER}"
    const LOGO_SRC = "data:image/png;base64,${LOGO_BASE64}"

    window.addEventListener("load", async () => {
      const id4face = document.querySelector("eclipsoft-id4face")
      const status = document.getElementById("status")

      id4face.token = "${session.token}"

      const config = {
        camera: "front",
        minMatch: "98",
        blink: true,
        env: "${process.env.ID4FACE_ENV || "dev"}",
        faceRecognition: true,
        callbackUrl: "${process.env.SELF_URL}/callback",
        checkId: {
          id: "${session.cedula}",
          dactilar: "${session.dactilar}"
        }
      }

      try {
        status.textContent = "Inicializando biometría..."
        await id4face.load(config)
        status.textContent = "Por favor mire a la cámara"

        try {
          await id4face.start()
        } catch (e) {
          console.warn("start() directo falló, esperando ready:", e)
        }

        id4face.addEventListener("ready", () => {
          status.textContent = "Por favor mire a la cámara"
          try { id4face.start() } catch (e) { console.error(e) }
        })

      } catch (error) {
        console.error(error)
        status.textContent = "Error iniciando biometría: " + error.message
      }

      id4face.addEventListener("result", async (event) => {
        status.textContent = "Procesando resultado..."
        try {
          const response = await fetch("${process.env.SELF_URL}/callback", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-callback-token": "${process.env.CALLBACK_TOKEN}"
            },
            body: JSON.stringify({
              sessionId: "${sessionId}",
              result: event.detail
            })
          })

          if (response.ok) {
            document.querySelector("eclipsoft-id4face").style.display = "none"
            document.querySelector(".container").innerHTML =
              '<img src="' + LOGO_SRC + '" style="width: 60px; margin-bottom: 16px;" alt="Logo" />' +
              '<div style="font-size: 3.5rem; margin-bottom: 12px">✅</div>' +
              '<h2 style="color: #f59e0b; margin-bottom: 12px">¡Validación exitosa!</h2>' +
              '<p style="color: #6b7280; margin-bottom: 24px; font-size: 0.95rem">Tu identidad ha sido verificada correctamente.</p>' +
              '<p style="color: #9ca3af; font-size: 0.85rem; margin-bottom: 20px">Regresando a WhatsApp en unos segundos...</p>' +
              '<a href="' + WHATSAPP_RETURN_URL + '" style="display: inline-block; background: #f59e0b; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 0.95rem;">Volver a WhatsApp</a>'
            setTimeout(() => {
              window.location.href = WHATSAPP_RETURN_URL
            }, 3000)
          } else {
            status.textContent = "Error procesando resultado."
          }
        } catch (err) {
          console.error(err)
          status.textContent = "Error enviando resultado."
        }
      })

      id4face.addEventListener("failed", (event) => {
        status.textContent = "❌ Validación fallida: " + (event.detail?.message || "intente de nuevo")
      })
    })
  </script>
</body>
</html>`

    res.send(html)
  } catch (error) {
    return res.status(500).send("Error interno: " + error.message)
  }
})

module.exports = router