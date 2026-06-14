// =========================
// TASKFLOW PRO
// CONSOLIDATED SCRIPT
// =========================

let tasks = JSON.parse(localStorage.getItem("taskflow_tasks")) || [];

// ---------- DOM ----------
const taskTitle = document.getElementById("taskTitle");
const taskDescription = document.getElementById("taskDescription");
const taskCategory = document.getElementById("taskCategory");
const taskPriority = document.getElementById("taskPriority");
const taskDate = document.getElementById("taskDate");
const taskTime = document.getElementById("taskTime");
const addTaskBtn = document.getElementById("addTaskBtn");

const todoColumn = document.getElementById("todoColumn");
const progressColumn = document.getElementById("progressColumn");
const completedColumn = document.getElementById("completedColumn");

const searchTask = document.getElementById("searchTask");
const filterBtns = document.querySelectorAll(".filter-btn");

const totalTasks = document.getElementById("totalTasks");
const completedTasks = document.getElementById("completedTasks");
const pendingTasks = document.getElementById("pendingTasks");
const productivityScore = document.getElementById("productivityScore");

const achievementContainer =
document.getElementById("achievementContainer");

const aiSuggestion =
document.getElementById("aiSuggestion");

const themeToggle =
document.getElementById("themeToggle");

// ---------- STORAGE ----------
function saveTasks() {
    localStorage.setItem(
        "taskflow_tasks",
        JSON.stringify(tasks)
    );
}

// ---------- TASK ----------
addTaskBtn.addEventListener("click", addTask);

function addTask() {

    const title = taskTitle.value.trim();

    if (!title) {
        alert("Enter task title");
        return;
    }

    const task = {
        id: Date.now(),
        title,
        description: taskDescription.value.trim(),
        category: taskCategory.value,
        priority: taskPriority.value,
        date: taskDate.value,
        time: taskTime.value,
        status: "todo",
        completed: false
    };

    tasks.push(task);
    showToast("✅ Task Added Successfully");

    saveTasks();

    clearForm();

    renderTasks();
}

function clearForm() {
    taskTitle.value = "";
    taskDescription.value = "";
    taskDate.value = "";
    taskTime.value = "";
}

function editTask(id) {

    const task = tasks.find(
        t => t.id === id
    );

    if (!task) return;

    const newTitle =
    prompt("Edit Task", task.title);

    if (newTitle) {
        task.title = newTitle;
        saveTasks();
        renderTasks();
    }
}

function deleteTask(id) {

    if (!confirm("Delete task?"))
        return;

    tasks =
    tasks.filter(
        task => task.id !== id
    );

    saveTasks();

    renderTasks();
}

function moveTask(id, status) {

    const task =
    tasks.find(
        t => t.id === id
    );

    if (!task) return;

    task.status = status;

    if (status === "completed") {
        task.completed = true;
    }

    saveTasks();

    renderTasks();
}

// ---------- CARD ----------
function createTaskCard(task) {

    const card =
    document.createElement("div");

    card.className = "task-card";

    card.draggable = true;

    card.dataset.id = task.id;

    card.innerHTML = `
    <h4>${task.title}</h4>

    <p>${task.description || "No description"}</p>

    <small>
    📂 ${task.category}
    </small><br>

    <small>
    ⚡ ${task.priority}
    </small><br>

    <small>
    📅 ${task.date || "-"}
    </small>

    <div style="margin-top:10px;display:flex;gap:5px;flex-wrap:wrap;">

      <button onclick="moveTask(${task.id},'progress')">
      Progress
      </button>

      <button onclick="moveTask(${task.id},'completed')">
      Done
      </button>

      <button onclick="editTask(${task.id})">
      Edit
      </button>

      <button onclick="deleteTask(${task.id})">
      Delete
      </button>

    </div>
    `;

    card.addEventListener(
        "dragstart",
        dragStart
    );

    return card;
}

// ---------- RENDER ----------
function renderTasks(taskList = tasks) {

    todoColumn.innerHTML = "";
    progressColumn.innerHTML = "";
    completedColumn.innerHTML = "";

    taskList.forEach(task => {

        const card =
        createTaskCard(task);

        if(task.status === "todo")
            todoColumn.appendChild(card);

        else if(task.status === "progress")
            progressColumn.appendChild(card);

        else
            completedColumn.appendChild(card);
    });

    updateDashboard();
    updateAchievements();
    updateInsights();
    createChart();
}

// ---------- DASHBOARD ----------
function updateDashboard() {

    const total = tasks.length;

    const completed =
    tasks.filter(
        t => t.completed
    ).length;

    const pending =
    total - completed;

    totalTasks.textContent = total;
    completedTasks.textContent = completed;
    pendingTasks.textContent = pending;

    productivityScore.textContent =
    total
    ? Math.round(
        completed / total * 100
      ) + "%"
    : "0%";
}

// ---------- SEARCH ----------
searchTask.addEventListener(
"keyup",
function() {

    const keyword =
    this.value.toLowerCase();

    const filtered =
    tasks.filter(task =>

        task.title
        .toLowerCase()
        .includes(keyword)

        ||

        (task.description || "")
        .toLowerCase()
        .includes(keyword)

    );

    renderTasks(filtered);
});

// ---------- FILTER ----------
filterBtns.forEach(btn => {

    btn.addEventListener(
    "click",
    function() {

        filterBtns.forEach(
        b => b.classList.remove(
        "active"
        ));

        this.classList.add(
        "active"
        );

        const filter =
        this.textContent.trim();

        let filtered =
        [...tasks];

        if(filter === "Pending") {

            filtered =
            tasks.filter(
            t => !t.completed
            );
        }

        if(filter === "Completed") {

            filtered =
            tasks.filter(
            t => t.completed
            );
        }

        if(filter === "High Priority") {

            filtered =
            tasks.filter(
            t => t.priority === "High"
            );
        }

        renderTasks(filtered);
    });
});

// ---------- ACHIEVEMENTS ----------
function updateAchievements(){

    const completed =
    tasks.filter(
    t=>t.completed
    ).length;

    let html="";

    if(completed>=1){

        html += `
        <div class="achievement-card">
        🔥 First Task
        </div>`;
    }

    if(completed>=5){

        html += `
        <div class="achievement-card">
        ⭐ 5 Tasks Done
        </div>`;
    }

    if(completed>=10){

        html += `
        <div class="achievement-card">
        ⚡ 10 Tasks Done
        </div>`;
    }

    if(completed>=25){

        html += `
        <div class="achievement-card">
        👑 Productivity Master
        </div>`;
    }

    if(html===""){

        html=`
        <div class="achievement-card">
        No achievements unlocked yet
        </div>`;
    }

    achievementContainer.innerHTML=
    html;
}

// ---------- INSIGHTS ----------
function updateInsights() {

    const high =
    tasks.filter(
    t => t.priority === "High" &&
    !t.completed
    ).length;

    const pending =
    tasks.filter(
    t => !t.completed
    ).length;

    if(tasks.length === 0){

        aiSuggestion.textContent =
        "Add your first task.";
        return;
    }

    if(high > 0){

        aiSuggestion.textContent =
        `⚡ Focus on ${high} high priority task(s).`;
        return;
    }

    aiSuggestion.textContent =
    `You have ${pending} pending task(s).`;
}

// ---------- DARK MODE ----------
themeToggle.addEventListener(
"click",
function(){

    document.body.classList.toggle(
    "light-mode"
    );

    localStorage.setItem(
        "theme",
        document.body.classList.contains(
        "light-mode"
        )
    );
});

if(
localStorage.getItem("theme")
=== "true"
){
    document.body.classList.add(
    "light-mode"
    );
}

// ---------- DRAG DROP ----------
let draggedId = null;

function dragStart() {
    draggedId = this.dataset.id;
}

[todoColumn,
progressColumn,
completedColumn]

.forEach(column => {

    column.addEventListener(
    "dragover",
    e => e.preventDefault()
    );

    column.addEventListener(
    "drop",
    function(){

        const task =
        tasks.find(
        t => t.id == draggedId
        );

        if(!task) return;

        if(this.id==="todoColumn")
            task.status="todo";

        if(this.id==="progressColumn")
            task.status="progress";

        if(this.id==="completedColumn"){
            task.status="completed";
            task.completed=true;
        }

        saveTasks();
        renderTasks();
    });
});

// ---------- POMODORO ----------
let time = 25 * 60;
let timer;
let running = false;

const timerDisplay =
document.getElementById("timerDisplay");

function updateTimer(){

    const m =
    Math.floor(time / 60);

    const s =
    time % 60;

    timerDisplay.textContent =
    `${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
}

document
.getElementById("startTimer")
.addEventListener("click",()=>{

    if(running) return;

    running=true;

    timer=setInterval(()=>{

        if(time>0){
            time--;
            updateTimer();
        }

    },1000);
});

document
.getElementById("pauseTimer")
.addEventListener("click",()=>{

    clearInterval(timer);
    running=false;
});

document
.getElementById("resetTimer")
.addEventListener("click",()=>{

    clearInterval(timer);

    running=false;

    time=25*60;

    updateTimer();
});

updateTimer();

// ---------- CALENDAR ----------
const calendarGrid =
document.getElementById("calendarGrid");

const monthYear =
document.getElementById("monthYear");

let currentDate =
new Date();
function renderCalendar(){

    calendarGrid.innerHTML="";

    const year =
    currentDate.getFullYear();

    const month =
    currentDate.getMonth();

    monthYear.textContent =
    currentDate.toLocaleString(
    "default",
    {
        month:"long",
        year:"numeric"
    });

    const daysInMonth =
    new Date(
    year,
    month+1,
    0
    ).getDate();

    for(let day=1;day<=daysInMonth;day++){

        const box =
        document.createElement("div");

        box.className="day";

        const fullDate =
        `${year}-${String(month+1)
        .padStart(2,"0")}-${String(day)
        .padStart(2,"0")}`;

        const dayTasks =
        tasks.filter(
        task =>
        task.date === fullDate
        );

        let taskHtml="";

        dayTasks.forEach(task=>{

            taskHtml += `
            <div class="calendar-task">
            ${task.title}
            </div>
            `;
        });

        box.innerHTML=`
        <strong>${day}</strong>
        ${taskHtml}
        `;

        calendarGrid.appendChild(box);
    }
}
document
.getElementById("prevMonth")
.addEventListener("click",()=>{

    currentDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth()-1,
        1
    );

    renderCalendar();
});

document
.getElementById("nextMonth")
.addEventListener("click",()=>{

    currentDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth()+1,
        1
    );

    renderCalendar();
});

renderCalendar();
;
if(
document.getElementById(
"calendarGrid"
)
){
    renderCalendar();
}

// ---------- CHART ----------
let chart;
function createChart(){

    const canvas =
    document.getElementById(
    "taskChart"
    );

    if(!canvas){
        return;
    }

    const completed =
    tasks.filter(
    t=>t.completed
    ).length;

    const pending =
    tasks.length-completed;

    if(window.taskChartInstance){
        window.taskChartInstance.destroy();
    }

    window.taskChartInstance =
    new Chart(canvas,{

        type:"doughnut",

        data:{
            labels:[
            "Completed",
            "Pending"
            ],

            datasets:[{
                data:[
                completed,
                pending
                ]
            }]
        },

        options:{
            responsive:true,
            maintainAspectRatio:false
        }
    });
}

// ---------- INIT ----------
renderTasks();
// ---------- INIT ----------

window.moveTask = moveTask;
window.editTask = editTask;
window.deleteTask = deleteTask;

document.addEventListener("DOMContentLoaded", () => {

    renderTasks();
    updateDashboard();
    updateAchievements();
    updateInsights();
    renderCalendar();
    createChart();
    updateTimer();

    // TOP RIGHT NEW TASK BUTTON
    const topTaskBtn = document.getElementById("openTaskForm");

    if(topTaskBtn){
        topTaskBtn.addEventListener("click", () => {

            const form =
            document.querySelector(".task-form");

            if(form){
                form.scrollIntoView({
                    behavior:"smooth"
                });

                taskTitle.focus();
            }

        });
    }

    // SEARCH TASK
    if(searchTask){

        searchTask.addEventListener("input", function(){

            const keyword =
            this.value.toLowerCase();

            const filtered =
            tasks.filter(task =>

                task.title
                .toLowerCase()
                .includes(keyword)

                ||

                (task.description || "")
                .toLowerCase()
                .includes(keyword)

            );

            renderTasks(filtered);

        });

    }

});
document.querySelectorAll(".menu-item")
.forEach(item=>{

    item.addEventListener("click",function(){

        document
        .querySelectorAll(".menu-item")
        .forEach(btn=>
            btn.classList.remove("active")
        );

        this.classList.add("active");

        const target =
        document.getElementById(
        this.dataset.target
        );

        if(target){

            target.scrollIntoView({
                behavior:"smooth",
                block:"start"
            });

        }
    });

});
function showToast(message){

    let toast =
    document.getElementById("toast");

    if(!toast){

        toast =
        document.createElement("div");

        toast.id = "toast";

        document.body.appendChild(toast);
    }

    toast.textContent = message;

    toast.classList.add("show");

    setTimeout(() => {

        toast.classList.remove("show");

    },2500);
}