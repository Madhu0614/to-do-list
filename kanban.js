import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.0.0/+esm";
const supabaseUrl = "https://ufgtavicqxafflqviucf.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVmZ3RhdmljcXhhZmZscXZpdWNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI4NDY0MzcsImV4cCI6MjA1ODQyMjQzN30.-zCF5IGYW5SOO16YC_5J-2X-tUWe7vTAzn83mmjeoDw";
const supabase = createClient(supabaseUrl, supabaseKey);

console.log("Supabase initialized:", supabase);

document.addEventListener("DOMContentLoaded", function () {
    fetchTasks();

    async function fetchTasks() {
        const { data: tasks, error } = await supabase
            .from("tasks")
            .select("*")
            .order("created_at", { ascending: true });

        if (error) {
            console.error("Error fetching tasks:", error);
            return;
        }

        // Clear previous tasks
        document.getElementById("todoTasks").innerHTML = '';
        document.getElementById("inProgressTasks").innerHTML = '';
        document.getElementById("completedTasks").innerHTML = '';

        tasks.forEach((task) => renderTask(task));
        updateTaskCount(tasks);
    }

    function renderTask(task) {
        const taskElement = document.createElement("div");
        taskElement.classList.add("task");
        taskElement.setAttribute("draggable", true);
        taskElement.dataset.id = task.id;
        taskElement.innerHTML = `<span>${task.text}</span>`;

        let columnId = task.status === "inProgress" ? "inProgressTasks" :
                       task.status === "completed" ? "completedTasks" : "todoTasks";

        document.getElementById(columnId).appendChild(taskElement);

        taskElement.addEventListener("dragstart", (event) => {
            event.dataTransfer.setData("taskId", task.id);
        });
    }

    function updateTaskCount(tasks) {
        const todoCountElement = document.querySelector(".todo h2 span");
        const inProgressCountElement = document.querySelector(".in-progress h2 span");
        const completedCountElement = document.querySelector(".completed h2 span");

        if (todoCountElement) {
            todoCountElement.textContent = `(${tasks.filter(task => task.status === "todo").length})`;
        }
        if (inProgressCountElement) {
            inProgressCountElement.textContent = `(${tasks.filter(task => task.status === "inProgress").length})`;
        }
        if (completedCountElement) {
            completedCountElement.textContent = `(${tasks.filter(task => task.status === "completed").length})`;
        }
    }

    document.querySelectorAll(".kanban-column-content").forEach((column) => {
        column.addEventListener("dragover", (event) => event.preventDefault());

        column.addEventListener("drop", async (event) => {
            event.preventDefault();
            const taskId = event.dataTransfer.getData("taskId");
            const columnId = event.target.id;

            let newStatus = columnId === "todoTasks" ? "todo" :
                            columnId === "inProgressTasks" ? "inProgress" : "completed";

            await updateTaskStatus(taskId, newStatus);
        });
    });

    async function updateTaskStatus(taskId, status) {
        const { error } = await supabase
            .from("tasks")
            .update({ status: status })
            .eq("id", taskId);

        if (error) {
            console.error("Error updating task status:", error);
        } else {
            fetchTasks();
        }
    }

    async function addTask(status, inputId) {
        const taskInput = document.getElementById(inputId);
        const taskText = taskInput.value.trim();
        if (!taskText) {
            alert("Please enter a task description.");
            return;
        }

        // Generate the current date in YYYY-MM-DD format
        const currentDate = new Date().toISOString().split("T")[0];

        const newTask = {
            text: taskText,
            status: status,
            date: currentDate, // Include the date field
        };

        console.log("Adding task:", newTask); // Debugging

        const { data, error } = await supabase
            .from("tasks")
            .insert([newTask])
            .select();

        if (error) {
            console.error("Error adding task:", error);
            alert(`Failed to add task: ${error.message}`);
            return;
        }

        console.log("Task added:", data);
        taskInput.value = ""; // Clear the input field
        fetchTasks();
    }

    document.querySelectorAll(".add-task-btn").forEach((button) => {
        button.addEventListener("click", (event) => {
            const column = event.target.dataset.column;
            const inputId = column === "todo" ? "todoInput" :
                            column === "inProgress" ? "inProgressInput" : "completedInput";
            addTask(column, inputId);
        });
    });
});
