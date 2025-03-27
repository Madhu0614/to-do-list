// Supabase configuration
const SUPABASE_URL = "https://ufgtavicqxafflqviucf.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVmZ3RhdmljcXhhZmZscXZpdWNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4NDY0MzcsImV4cCI6MjA1ODQyMjQzN30.-zCF5IGYW5SOO16YC_5J-2X-tUWe7vTAzn83mmjeoDw";

// Initialize Supabase
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.addEventListener("DOMContentLoaded", function () {
    const taskInput = document.getElementById("task");
    const addButton = document.querySelector(".task-input button");
    const taskList = document.getElementById("taskList");

    if (!taskInput || !addButton || !taskList) {
        console.error("Required elements are missing from the DOM.");
        return;
    }

    // Fetch tasks from Supabase on page load
    fetchTasks();

    // Add event listeners for adding tasks
    addButton.addEventListener("click", addTask);
    taskInput.addEventListener("keypress", function (event) {
        if (event.key === "Enter") {
            addTask();
        }
    });

    // Fetch tasks from Supabase
    async function fetchTasks() {
        const { data: tasks, error } = await supabase.from("tasks").select("*").order("date", { ascending: true });
        if (error) {
            console.error("Error fetching tasks:", error);
            return;
        }

        console.log("Fetched tasks:", tasks); // Debugging
        taskList.innerHTML = ""; // Clear the list before rendering
        tasks.forEach((task) => {
            renderTask(task);
        });
    }

    // Add a new task to Supabase
    async function addTask() {
        const taskText = taskInput.value.trim();
        if (taskText === "") {
            alert("Please enter a task.");
            return;
        }

        const currentDate = new Date();
        const formattedDate = currentDate.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });

        const newTask = {
            text: taskText,
            date: formattedDate,
            completed: false,
        };

        const { data, error } = await supabase.from("tasks").insert([newTask]);
        if (error) {
            console.error("Error adding task:", error);
            return;
        }

        console.log("Task added:", data); // Debugging
        renderTask(data[0]);
        taskInput.value = "";
    }

    // Delete a task from Supabase
    async function deleteTask(taskId, taskElement) {
        const { error } = await supabase.from("tasks").delete().eq("id", taskId);
        if (error) {
            console.error("Error deleting task:", error);
            return;
        }

        taskElement.remove(); // Remove the task from the DOM
    }

    // Toggle task completion in Supabase
    async function toggleTaskCompletion(taskId, completed, taskElement) {
        const { error } = await supabase.from("tasks").update({ completed }).eq("id", taskId);
        if (error) {
            console.error("Error updating task:", error);
            return;
        }

        taskElement.classList.toggle("completed", completed); // Update the DOM
    }

    // Render a task in the DOM
    function renderTask(task) {
        const li = document.createElement("li");
        li.classList.toggle("completed", task.completed);
        li.innerHTML = `
            <div>
                <input type="checkbox" class="task-checkbox" ${
                    task.completed ? "checked" : ""
                }>
                <span>${task.text}</span>
                <span class="date">(${task.date})</span>
            </div>
            <button class="delete-btn">🗑</button>
        `;

        taskList.appendChild(li);

        const deleteButton = li.querySelector(".delete-btn");
        const checkbox = li.querySelector(".task-checkbox");

        if (deleteButton) {
            deleteButton.addEventListener("click", function () {
                deleteTask(task.id, li);
            });
        }

        if (checkbox) {
            checkbox.addEventListener("change", function () {
                toggleTaskCompletion(task.id, checkbox.checked, li);
            });
        }
    }
});
