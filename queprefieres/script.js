document.addEventListener("DOMContentLoaded", () => {
  // Elementos del DOM
  const option1Element = document.getElementById("option1");
  const option2Element = document.getElementById("option2");
  const nextButton = document.getElementById("next-btn");
  const questionCounter = document.getElementById("question-counter");

  // Variables de estado
  let questions = [];
  let currentQuestionIndex = 0;
  let totalQuestions = 0;

  // Función para cargar preguntas desde el archivo JSON predeterminado
  function loadDefaultQuestions() {
    fetch("preguntas.json")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          questions = data;
          totalQuestions = questions.length;

          // Mezclar las preguntas
          shuffleArray(questions);

          // Mostrar la primera pregunta
          displayCurrentQuestion();

          console.log(
            `Cargadas ${questions.length} preguntas del archivo JSON predeterminado`
          );
        } else {
          throw new Error("El formato del archivo JSON no es válido");
        }
      })
      .catch((error) => {
        console.error("Error al cargar el archivo JSON predeterminado:", error);
        loadFallbackQuestions();
      });
  }

  // Función para cargar preguntas de respaldo en caso de error
  function loadFallbackQuestions() {
    console.log("Cargando preguntas de respaldo");
    questions = [
      {
        option1: "¿Tener la capacidad de volar?",
        option2: "¿Tener la capacidad de ser invisible?",
      },
      {
        option1: "¿Ser extremadamente rico pero trabajar todo el tiempo?",
        option2: "¿Tener tiempo libre pero un salario modesto?",
      },
      { option1: "¿Vivir en la playa?", option2: "¿Vivir en la montaña?" },
      {
        option1: "¿No poder mentir nunca?",
        option2: "¿No poder decir la verdad nunca?",
      },
      {
        option1: "¿Tener un trabajo que amas pero con poco salario?",
        option2: "¿Tener un trabajo que odias pero con un gran salario?",
      },
    ];

    totalQuestions = questions.length;
    shuffleArray(questions);
    displayCurrentQuestion();
  }

  // Función para mezclar un array (algoritmo Fisher-Yates)
  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  // Función para mostrar la pregunta actual
  function displayCurrentQuestion() {
    if (currentQuestionIndex < questions.length) {
      const currentQuestion = questions[currentQuestionIndex];

      // Agregar clase para animación de entrada
      option1Element.classList.add("fade-in");
      option2Element.classList.add("fade-in");

      // Actualizar el texto de las opciones
      option1Element.querySelector("p").textContent = currentQuestion.option1;
      option2Element.querySelector("p").textContent = currentQuestion.option2;

      // Eliminar la clase después de la animación
      setTimeout(() => {
        option1Element.classList.remove("fade-in");
        option2Element.classList.remove("fade-in");
      }, 500);

      // Actualizar el contador
      updateQuestionCounter();
    } else {
      // Si se han mostrado todas las preguntas, volver a empezar
      currentQuestionIndex = 0;
      shuffleArray(questions);
      displayCurrentQuestion();
    }
  }

  // Función para actualizar el contador de preguntas
  function updateQuestionCounter() {
    questionCounter.textContent = `Pregunta ${
      currentQuestionIndex + 1
    } de ${totalQuestions}`;
  }

  // Event Listeners

  // Botón siguiente
  nextButton.addEventListener("click", function () {
    currentQuestionIndex++;
    displayCurrentQuestion();
  });

  // Selección de opción (efecto visual)
  option1Element.addEventListener("click", function () {
    this.classList.add("selected");
    setTimeout(() => {
      this.classList.remove("selected");
    }, 500);
  });

  option2Element.addEventListener("click", function () {
    this.classList.add("selected");
    setTimeout(() => {
      this.classList.remove("selected");
    }, 500);
  });

  // Inicializar el juego cargando las preguntas del JSON
  loadDefaultQuestions();
});
