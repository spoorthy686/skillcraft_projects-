let startTime = 0;
let elapsedTime = 0;
let timerInterval = null;

let running = false;

let laps = [];

let lastLapTimestamp = 0;

const display =
document.getElementById("display");

function msToTime(ms){

    let hrs =
    Math.floor(ms / 3600000);

    let mins =
    Math.floor((ms % 3600000) / 60000);

    let secs =
    Math.floor((ms % 60000) / 1000);

    let milli =
    ms % 1000;

    return (
        String(hrs).padStart(2,"0") + ":" +
        String(mins).padStart(2,"0") + ":" +
        String(secs).padStart(2,"0") + "." +
        String(milli).padStart(3,"0")
    );
}

function updateDisplay(){

    display.textContent =
    msToTime(elapsedTime);

}

function showPopup(message){

    const popup =
    document.createElement("div");

    popup.className =
    "popup";

    popup.innerText =
    message;

    document.body.appendChild(popup);

    setTimeout(() => {

        popup.classList.add("show");

    },100);

    setTimeout(() => {

        popup.remove();

    },2000);
}

document
.getElementById("startBtn")
.addEventListener("click",()=>{

    if(running) return;

    running = true;

    startTime =
    Date.now() - elapsedTime;

    timerInterval =
    setInterval(()=>{

        elapsedTime =
        Date.now() - startTime;

        updateDisplay();

    },10);

    showPopup("Stopwatch Started");
});

document
.getElementById("pauseBtn")
.addEventListener("click",()=>{

    if(!running) return;

    running = false;

    clearInterval(timerInterval);

    showPopup("Stopwatch Paused");
});

document
.getElementById("lapBtn")
.addEventListener("click",()=>{

    if(!running){

        showPopup("Start stopwatch first");

        return;
    }

    let lapInterval;

    if(laps.length === 0){

        lapInterval =
        elapsedTime;

    }else{

        lapInterval =
        elapsedTime -
        lastLapTimestamp;

    }

    lastLapTimestamp =
    elapsedTime;

    const lapData = {

        lapNumber:
        laps.length + 1,

        interval:
        lapInterval,

        total:
        elapsedTime

    };

    laps.push(lapData);

    renderLaps();

    updateStats();

    showPopup(
        `Lap ${lapData.lapNumber} Recorded`
    );

});

document
.getElementById("resetBtn")
.addEventListener("click",()=>{

    clearInterval(timerInterval);

    running = false;

    elapsedTime = 0;

    laps = [];

    lastLapTimestamp = 0;

    updateDisplay();

    renderLaps();

    document.getElementById("fastest")
    .textContent = "--";

    document.getElementById("slowest")
    .textContent = "--";

    document.getElementById("average")
    .textContent = "--";

    showPopup("Stopwatch Reset");

});

function renderLaps(){

    const lapList =
    document.getElementById("laps");

    lapList.innerHTML = "";

    [...laps]
    .reverse()
    .forEach((lap)=>{

        const li =
        document.createElement("li");

        li.innerHTML = `

        <strong>
        Lap ${lap.lapNumber}
        </strong>

        <span>
        Interval:
        ${msToTime(lap.interval)}
        </span>

        <span>
        Total:
        ${msToTime(lap.total)}
        </span>

        `;

        lapList.appendChild(li);

    });

}

function updateStats(){

    if(laps.length === 0){

        return;
    }

    const values =
    laps.map(
        lap => lap.interval
    );

    const fastest =
    Math.min(...values);

    const slowest =
    Math.max(...values);

    const average =
    Math.floor(

        values.reduce(
            (a,b)=>a+b,0
        )
        /
        values.length

    );

    document
    .getElementById("fastest")
    .textContent =
    msToTime(fastest);

    document
    .getElementById("slowest")
    .textContent =
    msToTime(slowest);

    document
    .getElementById("average")
    .textContent =
    msToTime(average);

}

updateDisplay();