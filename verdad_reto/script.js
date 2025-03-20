document.addEventListener("DOMContentLoaded", () => {
  // DOM Elements
  const buttonsContainer = document.getElementById("buttons");
  const contentContainer = document.getElementById("content");
  const texto = document.getElementById("texto");

  const verdadBtn = document.getElementById("verdadBtn");
  const retoBtn = document.getElementById("retoBtn");
  const volverBtn = document.getElementById("volverBtn");

  // Variables para el tipo actual
  let currentType = "";

  // Data storage
  let verdades = [];
  let retos = [];

  // Cargar datos (usando datos de ejemplo si no se pueden cargar los JSON)
  try {
    // Intentar cargar desde JSON
    Promise.all([
      fetch("preguntas.json").then((response) => response.json()),
      fetch("retos.json").then((response) => response.json()),
    ])
      .then(([verdadesData, retosData]) => {
        verdades = verdadesData;
        retos = retosData;

        // Enable buttons once data is loaded
        verdadBtn.disabled = false;
        retoBtn.disabled = false;
      })
      .catch((error) => {
        console.error("Error loading JSON:", error);
        // Cargar datos de ejemplo si hay error
        loadSampleData();
      });
  } catch (error) {
    console.error("Error in fetch operation:", error);
    // Cargar datos de ejemplo si hay error
    loadSampleData();
  }

  // Función para cargar datos de ejemplo si no se pueden cargar los JSON
  function loadSampleData() {
    console.log("Loading sample data");
    verdades = [
      "¿Cuál es tu mayor miedo?",
      "¿Cuál ha sido la mentira más grande que has dicho?",
      "¿Qué es lo más vergonzoso que has hecho por amor?",
      "¿Cuál es tu mayor secreto?",
      "¿Alguna vez has robado algo?",
      "¿Cuál es tu mayor inseguridad?",
      "¿Qué es lo más loco que has hecho estando borracho/a?",
      "¿Alguna vez has espiado a alguien?",
      "¿Cuál es tu mayor arrepentimiento?",
      "¿Qué es lo más atrevido que has hecho en público?",
    ];

    retos = [
      "Haz 10 flexiones ahora mismo.",
      "Llama a un contacto aleatorio de tu teléfono y cántale una canción.",
      "Deja que la persona a tu derecha te haga un peinado loco.",
      "Imita a un animal durante 1 minuto.",
      "Baila sin música durante 30 segundos.",
      "Deja que alguien te maquille con los ojos vendados.",
      "Come una cucharada de salsa picante.",
      "Envía un mensaje vergonzoso a tu crush o ex.",
      "Habla con acento extranjero durante las próximas 3 rondas.",
      "Deja que alguien publique lo que quiera en tus redes sociales.",
    ];

    verdadBtn.disabled = false;
    retoBtn.disabled = false;
  }

  // Get random item from array
  function getRandomItem(array) {
    return array[Math.floor(Math.random() * array.length)];
  }

  // Show content and hide buttons
  function showContent() {
    buttonsContainer.classList.add("hidden");
    contentContainer.classList.remove("hidden");
    contentContainer.classList.add("visible");
  }

  // Show buttons and hide content
  function showButtons() {
    contentContainer.classList.remove("visible");
    contentContainer.classList.add("hidden");
    buttonsContainer.classList.remove("hidden");

    // Reset current type
    document.body.classList.remove("verdad-mode", "reto-mode");
    currentType = "";
  }

  // Event Listeners
  verdadBtn.addEventListener("click", () => {
    if (verdades.length > 0) {
      currentType = "verdad";
      texto.textContent = getRandomItem(verdades);

      // Change styles for truth
      document.body.classList.remove("reto-mode");
      document.body.classList.add("verdad-mode");

      showContent();
    }
  });

  retoBtn.addEventListener("click", () => {
    if (retos.length > 0) {
      currentType = "reto";
      texto.textContent = getRandomItem(retos);

      // Change styles for dare
      document.body.classList.remove("verdad-mode");
      document.body.classList.add("reto-mode");

      showContent();
    }
  });

  volverBtn.addEventListener("click", showButtons);
});
