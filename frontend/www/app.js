const API_URL = "http://34.175.38.61/tasks";

async function loadTasks() {
    try {
        console.log("Cargando tareas desde:", API_URL);
        const response = await fetch(API_URL);
        
        if (!response.ok) {
            throw new Error(`Error HTTP! Estado: ${response.status}`);
        }
        
        const tasks = await response.json();
        console.log("Tareas recibidas:", tasks);
        
        const taskList = document.getElementById("taskList");
        taskList.innerHTML = tasks.map(task => 
            `<div>${task.id}: ${task.title} (${task.completed ? '✓' : '✗'})</div>`
        ).join('');
        
    } catch (error) {
        console.error("Fallo en la conexión:", error);
        document.getElementById("taskList").innerHTML = 
            `<div style="color:red">Error: ${error.message}</div>`;
    }
}

// Cargar tareas al iniciar
loadTasks();