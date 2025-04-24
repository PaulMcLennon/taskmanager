const API_URL = "http://34.175.108.172/tasks";


// DOM Elements
const taskInput = document.getElementById("taskInput");
const addButton = document.getElementById("addButton");
const taskList = document.getElementById("taskList");

// Load tasks on startup
document.addEventListener("DOMContentLoaded", loadTasks);

async function loadTasks() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const tasks = await response.json();
        taskList.innerHTML = "";
        tasks.forEach(task => addTaskToDOM(task));
    } catch (error) {
        console.error("Error loading tasks:", error);
        taskList.innerHTML = `<div class="error">Error loading tasks. Check console.</div>`;
    }
}

addButton.addEventListener("click", async () => {
    const title = taskInput.value.trim();  // Changed from description to title
    if (title) {
        try {
            const response = await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    title,          // Changed to match backend expectation
                    completed: false 
                })
            });
            
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            
            const newTask = await response.json();
            addTaskToDOM(newTask);
            taskInput.value = "";
        } catch (error) {
            console.error("Error adding task:", error);
            alert("Failed to add task. See console for details.");
        }
    }
});

function addTaskToDOM(task) {
    const taskElement = document.createElement("div");
    taskElement.className = "task";
    taskElement.innerHTML = `
        <input type="checkbox" ${task.completed ? "checked" : ""} 
               onchange="toggleTask(${task.id}, this.checked)">
        <span>${task.title}</span>  <!-- Changed from description to title -->
        <button onclick="deleteTask(${task.id})">Delete</button>
    `;
    taskList.appendChild(taskElement);
}

// Additional functions for full CRUD
async function toggleTask(id, completed) {
    try {
        await fetch(`${API_URL}/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ completed })
        });
    } catch (error) {
        console.error("Error updating task:", error);
    }
}

async function deleteTask(id) {
    try {
        await fetch(`${API_URL}/${id}`, { method: "DELETE" });
        loadTasks(); // Refresh the list
    } catch (error) {
        console.error("Error deleting task:", error);
    }
}