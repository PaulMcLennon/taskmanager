document.addEventListener("DOMContentLoaded", () => {
    // Elementos del DOM
    const taskInput = document.getElementById("taskInput");
    const addButton = document.getElementById("addButton");
    const taskList = document.getElementById("taskList");

    // Verificación de elementos
    // Asegúrate de que los elementos existen antes de continuar
    if (!taskInput || !addButton || !taskList) {
        console.error("Error: Elementos del DOM no encontrados");
        return;
    }

    const API_URL = "/api/tasks";

    // Función para mostrar errores
    function showError(message) {
        const errorDiv = document.createElement("div");
        errorDiv.className = "error";
        errorDiv.textContent = message;
        taskList.appendChild(errorDiv);
        setTimeout(() => errorDiv.remove(), 3000);
    }

    // Cargar tareas al iniciar
    loadTasks();

    async function loadTasks() {
        try {
            const response = await fetch(API_URL);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const tasks = await response.json();
            renderTasks(tasks);
        } catch (error) {
            console.error("Error loading tasks:", error);
            showError("Error loading tasks");
        }
    }

    function renderTasks(tasks) {
        taskList.innerHTML = "";
        tasks.forEach(task => {
            const taskElement = document.createElement("div");
            taskElement.className = "task";
            taskElement.innerHTML = `
                <input type="checkbox" ${task.completed ? "checked" : ""} 
                    data-id="${task.id}" class="task-checkbox">
                <span class="task-text ${task.completed ? "completed" : ""}">${task.title}</span>
                <button data-id="${task.id}" class="delete-btn">Delete</button>
            `;
            taskList.appendChild(taskElement);
        });

        // Event listeners dinámicos
        document.querySelectorAll(".task-checkbox").forEach(checkbox => {
            checkbox.addEventListener("change", (e) => {
                toggleTask(e.target.dataset.id, e.target.checked);
            });
        });

        document.querySelectorAll(".delete-btn").forEach(button => {
            button.addEventListener("click", (e) => {
                deleteTask(e.target.dataset.id);
            });
        });
    }

    // Añadir nueva tarea
    async function addTask() {
        const title = taskInput.value.trim();
        
        if (!title) {
            showError("Please enter a task title");
            return;
        }

        try {
            const response = await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title, completed: false })
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            
            taskInput.value = "";
            loadTasks(); // Recargar lista
            
        } catch (error) {
            console.error("Error adding task:", error);
            showError("Failed to add task");
        }
    }

    // Actualizar tarea asdasdasdasd
    async function toggleTask(id, completed) {
        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    completed: completed,
                    title: document.querySelector(`.task-checkbox[data-id="${id}"]`).nextElementSibling.textContent
                })
            });
            
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            
            // Actualizar UI
            const taskText = document.querySelector(`.task-checkbox[data-id="${id}"]`).nextElementSibling;
            if (taskText) {
                taskText.classList.toggle("completed", completed);
            }
        } catch (error) {
            console.error("Error updating task:", error);
            showError("Failed to update task");
            // Revertir cambios
            const checkbox = document.querySelector(`.task-checkbox[data-id="${id}"]`);
            if (checkbox) {
                checkbox.checked = !completed;
                checkbox.nextElementSibling.classList.toggle("completed", !completed);
            }
        }
    }

    // Eliminar tarea
    async function deleteTask(id) {
        try {
            await fetch(`${API_URL}/${id}`, { 
                method: "DELETE" 
            });
            loadTasks(); // Recargar lista
        } catch (error) {
            console.error("Error deleting task:", error);
            showError("Failed to delete task");
        }
    }

    // Event Listeners
    addButton.addEventListener("click", addTask);
    taskInput.addEventListener("keypress", (e) => {
        if (e.key === "Enter") addTask();
    });
});