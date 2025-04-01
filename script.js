require('dotenv').config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Ensure Supabase is loaded before using it
document.addEventListener("DOMContentLoaded", function () {
    console.log("Supabase initialized:", supabase);
    console.log("DOM fully loaded"); // Debugging

    // Get DOM Elements
    const taskInput = document.getElementById("task");
    const addButton = document.getElementById("addTaskButton");
    const taskList = document.getElementById("taskList");

    if (!taskInput || !addButton || !taskList) {
        console.error("Missing DOM elements");
        return;
    }

    // Fetch tasks on page load
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
        console.log("Fetching tasks..."); // Debugging
        const { data: tasks, error } = await supabase
            .from("tasks")
            .select("*")
            .order("created_at", { ascending: true });

        if (error) {
            console.error("Error fetching tasks:", error);
            return;
        }

        taskList.innerHTML = ""; // Clear task list
        tasks.forEach(renderTask);
    }

    // Add a new task to Supabase
    async function addTask() {
        const taskText = taskInput.value.trim();
        if (taskText === "") {
            alert("Please enter a task.");
            return;
        }

        // Generate current date
        const currentDate = new Date().toISOString().split("T")[0]; // Format as YYYY-MM-DD

        const newTask = {
            text: taskText,  // Ensure this matches your Supabase column name
            date: currentDate,  // Include a valid date
            completed: false
        };

        console.log("Adding task...", newTask); // Debugging

        const { data, error } = await supabase.from("tasks").insert([newTask]).select("*");

        if (error) {
            console.error("Error adding task:", error);
            alert(`Failed to add task: ${error.message}`); // Show error to the user
            return;
        }

        console.log("Task added:", data); // Debugging
        renderTask(data[0]); // Add the new task to the list
        taskInput.value = "";
    }

    // Delete a task from Supabase
    async function deleteTask(taskId, taskElement) {
        const { error } = await supabase.from("tasks").delete().eq("id", taskId);
        if (error) {
            console.error("Error deleting task:", error);
            return;
        }
        taskElement.remove();
    }

    // Toggle task completion status in Supabase
    async function toggleTaskCompletion(taskId, completed, taskElement) {
        const { error } = await supabase.from("tasks").update({ completed }).eq("id", taskId);
        if (error) {
            console.error("Error updating task:", error);
            return;
        }
        taskElement.classList.toggle("completed", completed);
    }

    // Render a task in the UI
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

        // Delete button event
        li.querySelector(".delete-btn").addEventListener("click", function () {
            deleteTask(task.id, li);
        });

        // Checkbox event for completion toggle
        li.querySelector(".task-checkbox").addEventListener("change", function () {
            toggleTaskCompletion(task.id, this.checked, li);
        });
    }
});
