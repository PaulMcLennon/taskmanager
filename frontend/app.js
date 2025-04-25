document.addEventListener("DOMContentLoaded", () => {
    // Elementos del DOM
    const taskInput = document.getElementById("taskInput");
    const addButton = document.getElementById("addButton");
    const taskList = document.getElementById("taskList");
    const loginForm = document.getElementById("loginForm");
    const registerForm = document.getElementById("registerForm");
    const authSection = document.getElementById("authSection");
    const tasksSection = document.getElementById("tasksSection");
    const logoutButton = document.getElementById("logoutButton");
    const usernameDisplay = document.getElementById("usernameDisplay");

    // Configuración
    const API_URL = "/api/tasks"; // Ajusta según tu configuración
    let authToken = localStorage.getItem('authToken');

    // Verificación de elementos
    if (!taskInput || !addButton || !taskList) {
        console.error("Error: Elementos del DOM no encontrados");
        return;
    }

    // Inicialización
    checkAuthStatus();

    // Función para mostrar errores
    function showError(message) {
        const errorDiv = document.createElement("div");
        errorDiv.className = "alert alert-danger";
        errorDiv.textContent = message;
        document.body.prepend(errorDiv);
        setTimeout(() => errorDiv.remove(), 3000);
    }

    // Función para mostrar éxito
    function showSuccess(message) {
        const successDiv = document.createElement("div");
        successDiv.className = "alert alert-success";
        successDiv.textContent = message;
        document.body.prepend(successDiv);
        setTimeout(() => successDiv.remove(), 3000);
    }

    // Manejo de autenticación
    function checkAuthStatus() {
        if (authToken) {
            showTasksSection();
            loadTasks();
        } else {
            showAuthSection();
        }
    }

    function showAuthSection() {
        if (authSection) authSection.style.display = 'block';
        if (tasksSection) tasksSection.style.display = 'none';
    }

    function showTasksSection() {
        if (authSection) authSection.style.display = 'none';
        if (tasksSection) tasksSection.style.display = 'block';
        
        // Obtener nombre de usuario del token (simplificado)
        const tokenData = authToken ? JSON.parse(atob(authToken.split('.')[1])) : null;
        if (tokenData && usernameDisplay) {
            usernameDisplay.textContent = tokenData.sub;
        }
    }

    // Login
    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const username = loginForm.querySelector('input[name="username"]').value;
            const password = loginForm.querySelector('input[name="password"]').value;

            try {
                const response = await fetch(`${API_URL}/auth/login`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ username, password })
                });

                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                
                const data = await response.json();
                authToken = data.token;
                localStorage.setItem('authToken', authToken);
                showSuccess("Login successful!");
                checkAuthStatus();
                
            } catch (error) {
                console.error("Login error:", error);
                showError("Login failed. Please check your credentials.");
            }
        });
    }

    // Registro
    if (registerForm) {
        registerForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const username = registerForm.querySelector('input[name="username"]').value;
            const password = registerForm.querySelector('input[name="password"]').value;
            const email = registerForm.querySelector('input[name="email"]').value;

            try {
                const response = await fetch(`${API_URL}/users/register`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ username, password, email })
                });

                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                
                showSuccess("Registration successful! Please login.");
                registerForm.reset();
                
            } catch (error) {
                console.error("Registration error:", error);
                showError("Registration failed. Username may be taken.");
            }
        });
    }

    // Logout
    if (logoutButton) {
        logoutButton.addEventListener("click", () => {
            localStorage.removeItem('authToken');
            authToken = null;
            showAuthSection();
            showSuccess("Logged out successfully");
        });
    }

    // Cargar tareas
    async function loadTasks() {
        try {
            const response = await fetch(`${API_URL}/tasks`, {
                headers: {
                    "Authorization": `Bearer ${authToken}`
                }
            });
            
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            
            const tasks = await response.json();
            renderTasks(tasks);
        } catch (error) {
            console.error("Error loading tasks:", error);
            showError("Error loading tasks");
            // Si es error de autenticación, forzar logout
            if (error.message.includes("401")) {
                localStorage.removeItem('authToken');
                authToken = null;
                checkAuthStatus();
            }
        }
    }

    // Renderizar tareas
    function renderTasks(tasks) {
        taskList.innerHTML = "";
        
        if (tasks.length === 0) {
            taskList.innerHTML = "<p>No tasks found. Add your first task!</p>";
            return;
        }

        tasks.forEach(task => {
            const taskElement = document.createElement("div");
            taskElement.className = `task ${task.completed ? "completed" : ""}`;
            taskElement.innerHTML = `
                <input type="checkbox" ${task.completed ? "checked" : ""} 
                    data-id="${task.id}" class="task-checkbox">
                <span class="task-title">${task.title}</span>
                ${task.description ? `<p class="task-description">${task.description}</p>` : ''}
                <button data-id="${task.id}" class="delete-btn">Delete</button>
            `;
            taskList.appendChild(taskElement);
        });

        // Event listeners dinámicos
        document.querySelectorAll(".task-checkbox").forEach(checkbox => {
            checkbox.addEventListener("change", (e) => {
                updateTask(e.target.dataset.id, { completed: e.target.checked });
            });
        });

        document.querySelectorAll(".delete-btn").forEach(button => {
            button.addEventListener("click", (e) => {
                if (confirm("Are you sure you want to delete this task?")) {
                    deleteTask(e.target.dataset.id);
                }
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
            const response = await fetch(`${API_URL}/tasks`, {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${authToken}`
                },
                body: JSON.stringify({ 
                    title, 
                    description: "", // Puedes añadir campo de descripción si lo deseas
                    completed: false 
                })
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            
            taskInput.value = "";
            loadTasks(); // Recargar lista
            showSuccess("Task added successfully!");
            
        } catch (error) {
            console.error("Error adding task:", error);
            showError("Failed to add task");
        }
    }

    // Actualizar tarea
    async function updateTask(id, updates) {
        try {
            const response = await fetch(`${API_URL}/tasks/${id}`, {
                method: "PUT",
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${authToken}`
                },
                body: JSON.stringify(updates)
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            
            loadTasks(); // Recargar lista para reflejar cambios
        } catch (error) {
            console.error("Error updating task:", error);
            showError("Failed to update task");
        }
    }

    // Eliminar tarea
    async function deleteTask(id) {
        try {
            const response = await fetch(`${API_URL}/tasks/${id}`, { 
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${authToken}`
                }
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            
            loadTasks(); // Recargar lista
            showSuccess("Task deleted successfully!");
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