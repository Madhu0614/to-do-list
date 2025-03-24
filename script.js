document.addEventListener("DOMContentLoaded", function () {
    const taskInput = document.getElementById("task");
    const addButton = document.querySelector(".task-input button");
    const taskList = document.getElementById("taskList");

    if (!taskInput || !addButton || !taskList) {
        console.error("Required elements are missing from the DOM.");
        return;
    }

    // Load tasks from local storage on page load
    fetchTasks();

    addButton.addEventListener("click", addTask);
    taskInput.addEventListener("keypress", function (event) {
        if (event.key === "Enter") {
            addTask();
        }
    });

    function fetchTasks() {
        const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
        tasks.forEach((task) => {
            renderTask(task);
        });
    }

    function saveTasks(tasks) {
        localStorage.setItem("tasks", JSON.stringify(tasks));
    }

    function addTask() {
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
            id: Date.now(), // Unique ID for the task
            text: taskText,
            date: formattedDate,
            completed: false,
        };

        const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
        tasks.push(newTask);
        saveTasks(tasks);

        renderTask(newTask);
        taskInput.value = "";
    }

    function deleteTask(taskId, taskElement) {
        const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
        const updatedTasks = tasks.filter((task) => task.id !== taskId);
        saveTasks(updatedTasks);

        taskElement.remove();
    }

    function toggleTaskCompletion(taskId, completed, taskElement) {
        const tasks = JSON.parse(localStorage.getItem("tasks")) || [];
        const updatedTasks = tasks.map((task) => {
            if (task.id === taskId) {
                return { ...task, completed };
            }
            return task;
        });
        saveTasks(updatedTasks);

        taskElement.classList.toggle("completed", completed);
    }

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
