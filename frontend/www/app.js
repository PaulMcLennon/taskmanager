// Conexión a tu backend en Kubernetes (cambia la URL)
const API_URL = "http://[TU_IP_BACKEND]:8080/tasks";

// Elementos del DOM
const taskInput = document.getElementById("taskInput");
const addButton = document.getElementById("addButton");
const taskList = document.getElementById("taskList");

// Cargar tareas al iniciar
document.addEventListener("DOMContentLoaded", loadTasks);

// Función para cargar tareas desde el backend
async function loadTasks() {
    try {
        const response = await fetch(API_URL);
        const tasks = await response.json();
        taskList.innerHTML = "";
        tasks.forEach(task => addTaskToDOM(task));
    } catch (error) {
        console.error("Error cargando tareas:", error);
    }
}

// Función para agregar una tarea
addButton.addEventListener("click", async () => {
    const description = taskInput.value.trim();
    if (description) {
        try {
            const response = await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ description, completed: false })
            });
            const newTask = await response.json();
            addTaskToDOM(newTask);
            taskInput.value = "";
        } catch (error) {
            console.error("Error agregando tarea:", error);
        }
    }
});

// Mostrar tareas en el DOM
function addTaskToDOM(task) {
    const taskElement = document.createElement("div");
    taskElement.className = "task";
    taskElement.innerHTML = `
        <input type="checkbox" ${task.completed ? "checked" : ""}>
        <span>${task.description}</span>
    `;
    taskList.appendChild(taskElement);
}