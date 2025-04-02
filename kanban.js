import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.0.0/+esm";

const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_KEY);

if (!supabase) {
    console.error("Failed to initialize Supabase client.");
}

console.log("Supabase URL:", import.meta.env.VITE_SUPABASE_URL);
console.log("Supabase Key:", import.meta.env.VITE_SUPABASE_KEY);

console.log("Supabase initialized:", supabase);

async function testDatabaseConnection() {
    const { data, error } = await supabase.from("tasks").select("*");

    if (error) {
        console.error("Error fetching data from Supabase:", error);
    } else {
        console.log("Fetched data:", data);
    }
}

testDatabaseConnection();

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

        document.getElementById("todoTasks").innerHTML = '';
        document.getElementById("inProgressTasks").innerHTML = '';
        document.getElementById("completedTasks").innerHTML = '';

        tasks.forEach((task) => renderTask(task));
        updateTaskCount(tasks);
    }

    function renderTask(task) {
        const taskElement = document.createElement("div");
        taskElement.classList.add(
            "bg-white", "text-gray-800", "p-3", "rounded-lg", 
            "shadow-md", "border", "border-gray-300",
            "hover:shadow-lg", "transition-shadow", "duration-200",
            "flex", "justify-between", "items-center", "gap-2"
        );
        taskElement.setAttribute("draggable", true);
        taskElement.dataset.id = task.id;
        taskElement.innerHTML = `
            <span class="flex-1">${task.text}</span>
            <button class="text-red-500 hover:text-red-700" onclick="deleteTask('${task.id}')">✖</button>
        `;

        let columnId = task.status === "inProgress" ? "inProgressTasks" :
                       task.status === "completed" ? "completedTasks" : "todoTasks";

        document.getElementById(columnId).appendChild(taskElement);

        taskElement.addEventListener("dragstart", (event) => {
            event.dataTransfer.setData("taskId", task.id);
        });
    }

    function updateTaskCount(tasks) {
        document.getElementById("todoCount").textContent = `(${tasks.filter(task => task.status === "todo").length})`;
        document.getElementById("inProgressCount").textContent = `(${tasks.filter(task => task.status === "inProgress").length})`;
        document.getElementById("completedCount").textContent = `(${tasks.filter(task => task.status === "completed").length})`;
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

    window.addTask = async function (status) {
        const taskText = prompt("Enter task description:");
        if (!taskText) return;

        const newTask = { text: taskText, status: status, date: new Date().toISOString().split("T")[0] };

        const { data, error } = await supabase.from("tasks").insert([newTask]).select();

        if (error) {
            console.error("Error adding task:", error);
            alert(`Failed to add task: ${error.message}`);
            return;
        }

        fetchTasks();
    };

    window.deleteTask = async function (taskId) {
        const { error } = await supabase.from("tasks").delete().eq("id", taskId);

        if (error) {
            console.error("Error deleting task:", error);
        } else {
            fetchTasks(); // Refresh the task list after deletion
        }
    };
});