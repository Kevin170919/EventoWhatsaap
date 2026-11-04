
const axios = require("axios");
const FormData = require("form-data");
const { HttpsProxyAgent } = require("https-proxy-agent");
const { generateToken } = require("./id4face.service");

const EXTRA_DOCUMENT_PATH = "/api/extra-document";

// Configuración de reintentos
const MAX_ATTEMPTS = 3;
const RETRY_DELAY_MS = 2000;
const REQUEST_TIMEOUT_MS = 30000;

const proxyAgent = process.env.PROXY_URL
  ? new HttpsProxyAgent(process.env.PROXY_URL)
  : undefined;

// Función para esperar
const sleep = (ms) =>
  new Promise((resolve) => setTimeout(resolve, ms));

async function fetchExtraDocumentByCedula(cedula, options = {}) {

  if (!cedula) {
    throw new Error(
      "La cédula es requerida para obtener el extradocumento."
    );
  }

  const BASE_URL = (
    process.env.EXTRA_DOCUMENT_BASE_URL ||
    process.env.BASE_URL ||
    ""
  ).trim();

  if (!BASE_URL) {
    throw new Error(
      "EXTRA_DOCUMENT_BASE_URL no está configurada."
    );
  }

  const url =
    BASE_URL.replace(/\/+$/, "") + EXTRA_DOCUMENT_PATH;

  // Generar token
  const token = await generateToken();

  console.log("\n====================================");
  console.log("INICIO CONSULTA EXTRA DOCUMENT");
  console.log("CÉDULA ENVIADA:", cedula);
  console.log("URL:", url);
  console.log("MÁXIMO DE INTENTOS:", MAX_ATTEMPTS);
  console.log("====================================\n");

  let lastError;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {

    console.log("------------------------------------");
    console.log(`INTENTO ${attempt} DE ${MAX_ATTEMPTS}`);
    console.log("CÉDULA:", cedula);
    console.log("FECHA:", new Date().toISOString());
    console.log("------------------------------------");

    try {

      const form = new FormData();
      form.append("id", cedula);

      const response = await axios({
        method: "get",
        url,

        headers: {
          ...form.getHeaders(),
          Authorization: `Bearer ${token}`,
          ...(options.headers || {})
        },

        httpsAgent: proxyAgent,
        data: form,
        responseType: "arraybuffer",
        timeout: REQUEST_TIMEOUT_MS
      });

      const documento = Buffer.from(response.data || []);

      console.log("ESTADO HTTP:", response.status);
      console.log("TAMAÑO RESPUESTA:", documento.length, "bytes");

      if (documento.length === 0) {
        throw new Error(
          "El servicio respondió, pero no retornó contenido."
        );
      }

      console.log("RESULTADO: DOCUMENTO RECIBIDO CORRECTAMENTE");
      console.log("INTENTO EXITOSO:", attempt);
      console.log("====================================\n");

      return documento;

    } catch (error) {

      lastError = error;

      const status = error.response?.status;

      console.error("ERROR EN CONSULTA EXTRA DOCUMENT");
      console.error("CÉDULA:", cedula);
      console.error("INTENTO:", attempt);
      console.error("MENSAJE:", error.message);
      console.error("STATUS HTTP:", status || "SIN RESPUESTA");

      if (error.response?.data) {
        console.error(
          "RESPUESTA API:",
          Buffer.from(error.response.data).toString("utf8")
        );
      }

      const retryable =
        error.retryable === true ||
        !error.response ||
        status >= 500 ||
        status === 408 ||
        status === 429;

      if (!retryable || attempt === MAX_ATTEMPTS) {
        console.error("SE AGOTARON LOS INTENTOS O NO ES REINTENTABLE");
        console.error("====================================\n");
        throw lastError;
      }

      console.log(
        `ESPERANDO ${RETRY_DELAY_MS / 1000} SEGUNDOS PARA REINTENTAR...`
      );

      await sleep(RETRY_DELAY_MS);
    }
  }

  throw lastError;
}

module.exports = { fetchExtraDocumentByCedula };
