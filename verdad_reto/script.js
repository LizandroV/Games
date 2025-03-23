document.addEventListener("DOMContentLoaded", () => {
  // DOM Elements
  const categorySelection = document.getElementById("category-selection");
  const buttonsContainer = document.getElementById("buttons");
  const contentContainer = document.getElementById("content");
  const texto = document.getElementById("texto");
  const categoryIndicator = document.getElementById("categoryIndicator");

  const clasicoBtn = document.getElementById("clasicoBtn");
  const parejasBtn = document.getElementById("parejasBtn");
  const amigosBtn = document.getElementById("amigosBtn");
  const verdadBtn = document.getElementById("verdadBtn");
  const retoBtn = document.getElementById("retoBtn");
  const volverBtn = document.getElementById("volverBtn");
  const volverCategoriaBtn = document.getElementById("volverCategoriaBtn");

  // Variables para el tipo actual y categoría
  let currentType = "";
  let currentCategory = "";

  // Data storage
  let verdades = [];
  let retos = [];

  // Función para cargar los JSON según la categoría seleccionada
  function loadJSONByCategory(category) {
    // Definir los archivos JSON según la categoría
    let preguntasFile, retosFile;

    if (category === "clasico") {
      preguntasFile = "preguntasClasico.json";
      retosFile = "retosClasico.json";
    } else if (category === "parejas") {
      preguntasFile = "preguntasParejas.json";
      retosFile = "retosParejas.json";
    } else {
      // amigos
      preguntasFile = "preguntasAmigos.json";
      retosFile = "retosAmigos.json";
    }

    // Deshabilitar botones mientras se cargan los datos
    verdadBtn.disabled = true;
    retoBtn.disabled = true;

    // Mostrar mensaje de carga
    verdadBtn.textContent = "Cargando...";
    retoBtn.textContent = "Cargando...";

    // Intentar cargar desde JSON
    Promise.all([
      fetch(preguntasFile)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          return response.json();
        })
        .catch((error) => {
          console.error(`Error loading ${preguntasFile}:`, error);
          // Si hay error, intentar cargar el archivo original
          if (category !== "clasico") {
            console.log("Trying to load default preguntas.json as fallback");
            return fetch("preguntas.json")
              .then((response) => {
                if (!response.ok) {
                  throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
              })
              .catch((fallbackError) => {
                console.error(
                  "Error loading fallback preguntas.json:",
                  fallbackError
                );
                return null;
              });
          }
          return null;
        }),
      fetch(retosFile)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          return response.json();
        })
        .catch((error) => {
          console.error(`Error loading ${retosFile}:`, error);
          // Si hay error, intentar cargar el archivo original
          if (category !== "clasico") {
            console.log("Trying to load default retos.json as fallback");
            return fetch("retos.json")
              .then((response) => {
                if (!response.ok) {
                  throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
              })
              .catch((fallbackError) => {
                console.error(
                  "Error loading fallback retos.json:",
                  fallbackError
                );
                return null;
              });
          }
          return null;
        }),
    ])
      .then(([verdadesData, retosData]) => {
        // Restaurar texto de los botones
        verdadBtn.textContent = "Verdad";
        retoBtn.textContent = "Reto";

        if (verdadesData) {
          verdades = verdadesData;
        } else {
          // Si no se pudo cargar, usar datos de ejemplo
          loadSampleVerdades(category);
        }

        if (retosData) {
          retos = retosData;
        } else {
          // Si no se pudo cargar, usar datos de ejemplo
          loadSampleRetos(category);
        }

        // Habilitar botones una vez que se cargan los datos
        verdadBtn.disabled = false;
        retoBtn.disabled = false;

        console.log(
          `Loaded ${verdades.length} verdades and ${retos.length} retos for ${category}`
        );
      })
      .catch((error) => {
        console.error("Error in Promise.all:", error);
        // Restaurar texto de los botones
        verdadBtn.textContent = "Verdad";
        retoBtn.textContent = "Reto";

        // Cargar datos de ejemplo si hay error
        loadSampleVerdades(category);
        loadSampleRetos(category);

        // Habilitar botones
        verdadBtn.disabled = false;
        retoBtn.disabled = false;
      });
  }

  // Función para cargar datos de ejemplo de verdades según la categoría
  function loadSampleVerdades(category) {
    console.log(`Loading sample verdades for ${category}`);

    if (category === "clasico") {
      verdades = [
        "¿Cuál es tu mayor miedo?",
        "¿Qué es lo más atrevido que has hecho?",
        "¿Cuál es tu mayor secreto?",
        "¿Alguna vez has mentido a alguien importante para ti?",
        "¿Cuál ha sido el momento más vergonzoso de tu vida?",
      ];
    } else if (category === "parejas") {
      verdades = [
        "¿Qué es lo que más te gusta de tu pareja?",
        "¿Cuál fue el momento en que supiste que estabas enamorado/a?",
        "¿Qué es lo que más te atrae físicamente de tu pareja?",
        "¿Hay algo que te gustaría cambiar de nuestra relación?",
        "¿Cuál ha sido el momento más romántico que hemos vivido juntos?",
      ];
    } else {
      // amigos
      verdades = [
        "¿Quién es tu mejor amigo/a del grupo y por qué?",
        "¿Qué es lo más atrevido que has hecho en público?",
        "¿Cuál es el secreto más grande que nunca le has contado a nadie?",
        "¿Alguna vez has mentido a alguien de los presentes? ¿Por qué?",
        "¿Cuál es tu mayor sueño en la vida?",
      ];
    }
  }

  // Función para cargar datos de ejemplo de retos según la categoría
  function loadSampleRetos(category) {
    console.log(`Loading sample retos for ${category}`);

    if (category === "clasico") {
      retos = [
        "Haz 10 flexiones ahora mismo.",
        "Imita a un animal durante 30 segundos.",
        "Canta el estribillo de tu canción favorita.",
        "Baila sin música durante 1 minuto.",
        "Cuenta un chiste malo.",
      ];
    } else if (category === "parejas") {
      retos = [
        "Dale un masaje a tu pareja durante 2 minutos.",
        "Haz una declaración de amor improvisada.",
        "Baila una canción lenta con tu pareja.",
        "Escribe un poema corto para tu pareja en menos de 1 minuto.",
        "Describe a tu pareja usando solo 3 palabras positivas.",
      ];
    } else {
      // amigos
      retos = [
        "Haz 10 flexiones ahora mismo.",
        "Imita a alguien del grupo y los demás deben adivinar quién es.",
        "Canta el estribillo de tu canción favorita.",
        "Deja que alguien del grupo te haga un peinado loco.",
        "Cuenta un chiste y si nadie se ríe, debes hacer 5 sentadillas.",
      ];
    }
  }

  // Get random item from array
  function getRandomItem(array) {
    return array[Math.floor(Math.random() * array.length)];
  }

  // Show category selection and hide other sections
  function showCategorySelection() {
    categorySelection.classList.remove("hidden");
    buttonsContainer.classList.add("hidden");
    contentContainer.classList.add("hidden");

    // Reset current category
    document.body.classList.remove(
      "clasico-mode",
      "parejas-mode",
      "amigos-mode"
    );
    currentCategory = "";
  }

  // Show buttons and hide other sections
  function showButtons() {
    categorySelection.classList.add("hidden");
    buttonsContainer.classList.remove("hidden");
    contentContainer.classList.add("hidden");
  }

  // Show content and hide other sections
  function showContent() {
    categorySelection.classList.add("hidden");
    buttonsContainer.classList.add("hidden");
    contentContainer.classList.remove("hidden");
  }

  // Event Listeners for category selection
  clasicoBtn.addEventListener("click", () => {
    currentCategory = "clasico";

    // Update UI for clasico
    document.body.classList.remove("parejas-mode", "amigos-mode");
    document.body.classList.add("clasico-mode");

    // Set category indicator
    categoryIndicator.textContent = "Categoría: Clásico";
    categoryIndicator.className = "category-indicator clasico-indicator";

    // Load JSON for clasico
    loadJSONByCategory("clasico");

    // Show buttons
    showButtons();
  });

  parejasBtn.addEventListener("click", () => {
    currentCategory = "parejas";

    // Update UI for parejas
    document.body.classList.remove("clasico-mode", "amigos-mode");
    document.body.classList.add("parejas-mode");

    // Set category indicator
    categoryIndicator.textContent = "Categoría: Parejas";
    categoryIndicator.className = "category-indicator parejas-indicator";

    // Load JSON for parejas
    loadJSONByCategory("parejas");

    // Show buttons
    showButtons();
  });

  amigosBtn.addEventListener("click", () => {
    currentCategory = "amigos";

    // Update UI for amigos
    document.body.classList.remove("clasico-mode", "parejas-mode");
    document.body.classList.add("amigos-mode");

    // Set category indicator
    categoryIndicator.textContent = "Categoría: Amigos";
    categoryIndicator.className = "category-indicator amigos-indicator";

    // Load JSON for amigos
    loadJSONByCategory("amigos");

    // Show buttons
    showButtons();
  });

  // Event Listeners for truth or dare
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

  // Event Listeners for navigation
  volverBtn.addEventListener("click", () => {
    // Reset current type
    document.body.classList.remove("verdad-mode", "reto-mode");
    currentType = "";

    showButtons();
  });

  volverCategoriaBtn.addEventListener("click", () => {
    showCategorySelection();
  });

  // Initialize with category selection
  showCategorySelection();
});
