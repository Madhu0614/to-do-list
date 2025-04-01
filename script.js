import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.0.0/+esm";
const supabaseUrl = "https://ufgtavicqxafflqviucf.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVmZ3RhdmljcXhhZmZscXZpdWNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4NDY0MzcsImV4cCI6MjA1ODQyMjQzN30.-zCF5IGYW5SOO16YC_5J-2X-tUWe7vTAzn83mmjeoDw";
const supabase = createClient(supabaseUrl, supabaseKey);

console.log("Supabase initialized:", supabase);

document.addEventListener("DOMContentLoaded", function () {
    console.log("DOM fully loaded");

    // Get DOM elements
    const taskInput = document.getElementById("task");
    const addButton = document.getElementById("addTaskButton");
    const taskList = document.getElementById("taskList");

    if (!taskInput || !addButton || !taskList) {
        console.error("Missing DOM elements");
        return;
    }

    // Fetch tasks on page load
    fetchTasks();

    addButton.addEventListener("click", addTask);
    taskInput.addEventListener("keypress", function (event) {
        if (event.key === "Enter") {
            addTask();
        }
    });

    async function fetchTasks() {
        console.log("Fetching tasks...");
        const { data: tasks, error } = await supabase
            .from("tasks")
            .select("*")
            .order("created_at", { ascending: true });

        if (error) {
            console.error("Error fetching tasks:", error);
            return;
        }

        console.log("Fetched tasks:", tasks);
        taskList.innerHTML = "";
        tasks.forEach(renderTask);
    }

    async function addTask() {
        const taskText = taskInput.value.trim();
        if (taskText === "") {
            alert("Please enter a task.");
            return;
        }

        // Generate current date if not provided (format: YYYY-MM-DD)
        const currentDate = new Date().toISOString().split("T")[0];

        const newTask = {
            text: taskText,
            date: currentDate,  // Automatically add current date
            completed: false
        };

        console.log("Adding task...", newTask);

        const { data, error } = await supabase.from("tasks").insert([newTask]).select("*");

        if (error) {
            console.error("Error adding task:", error);
            alert(`Failed to add task: ${error.message}`);
            return;
        }

        console.log("Task added:", data);
        renderTask(data[0]);
        taskInput.value = "";
    }

    async function deleteTask(taskId, taskElement) {
        const { error } = await supabase.from("tasks").delete().eq("id", taskId);
        if (error) {
            console.error("Error deleting task:", error);
            return;
        }
        taskElement.remove();
    }

    async function toggleTaskCompletion(taskId, completed, taskElement) {
        const { error } = await supabase.from("tasks").update({ completed }).eq("id", taskId);
        if (error) {
            console.error("Error updating task:", error);
            return;
        }
        taskElement.classList.toggle("completed", completed);
    }

    function renderTask(task) {
        const li = document.createElement("li");
        li.classList.toggle("completed", task.completed);
        li.innerHTML = `
            <div>
                <input type="checkbox" class="task-checkbox" ${task.completed ? "checked" : ""}>
                <span>${task.text}</span>
                <span class="date">(${new Date(task.created_at).toLocaleDateString("en-US")})</span>
            </div>
            <button class="delete-btn">🗑</button>
        `;

        taskList.appendChild(li);

        li.querySelector(".delete-btn").addEventListener("click", function () {
            deleteTask(task.id, li);
        });

        li.querySelector(".task-checkbox").addEventListener("change", function () {
            toggleTaskCompletion(task.id, this.checked, li);
        });
    }
});
