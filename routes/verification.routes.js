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
    const LOGO_SRC = "data:image/png;base64,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"

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