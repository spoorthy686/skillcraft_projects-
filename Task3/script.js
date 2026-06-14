const classicQuestions = [
  { q: "What does HTML stand for?", options: ["Hyper Text Markup Language", "High Tech Modern Language", "Home Tool Markup Language", "Hyperlinks Text Mark Language"], answer: 0, type: "text", exp: "HTML stands for Hyper Text Markup Language" },
  { q: "Which planet is known as the Red Planet?", options: ["Earth", "Mars", "Jupiter", "Venus"], answer: 1, type: "image", media: "https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?w=600&h=300&fit=crop", exp: "Mars appears red due to iron oxide on its surface" },
  { q: "Name this coding language from the logo", options: ["React", "Vue", "Angular", "Svelte"], answer: 0, type: "image", media: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/React-icon.svg/200px-React-icon.svg.png", exp: "This is the React logo" },
  { q: "Watch this clip. What sorting algorithm is shown?", options: ["Bubble Sort", "Quick Sort", "Merge Sort", "Selection Sort"], answer: 0, type: "video", media: "https://www.youtube.com/embed/lyZQPjUT5B4", exp: "Bubble sort repeatedly swaps adjacent elements" },
  { q: "CSS is used for?", options: ["Database", "Styling", "Logic", "Server"], answer: 1, type: "text", exp: "CSS is Cascading Style Sheets for styling" },
  { q: "What year did JavaScript appear?", options: ["1993", "1995", "1997", "2000"], answer: 1, type: "text", exp: "JavaScript was created in 1995 by Brendan Eich" },
  { q: "Which is NOT a programming language?", options: ["Python", "Java", "HTML", "C++"], answer: 2, type: "text", exp: "HTML is a markup language, not programming language" },
  { q: "2 + 2 * 2 =?", options: ["6", "8", "4", "10"], answer: 0, type: "text", exp: "Order of operations: 2*2=4, then 2+4=6" },
  { q: "Git is used for?", options: ["Design", "Version Control", "Testing", "Hosting"], answer: 1, type: "text", exp: "Git is a version control system" },
  { q: "JSON stands for?", options: ["Java Source Open Network", "JavaScript Object Notation", "Java Standard Output Name", "None"], answer: 1, type: "text", exp: "JSON = JavaScript Object Notation" }
];

const dailyQuestions = [
  { q: "Today's date question: What is 5*5?", options: ["20", "25", "30", "15"], answer: 1, type: "text", exp: "5 times 5 equals 25" },
  { q: "Daily fact: Largest ocean?", options: ["Atlantic", "Indian", "Pacific", "Arctic"], answer: 2, type: "text", exp: "Pacific Ocean is the largest" },
  { q: "Daily tech: What does CPU stand for?", options: ["Central Processing Unit", "Computer Power Unit", "Core Processing Utility", "Central Program Unit"], answer: 0, type: "text", exp: "CPU = Central Processing Unit" },
  { q: "Daily math: 10 / 2 = ?", options: ["3", "4", "5", "6"], answer: 2, type: "text", exp: "10 divided by 2 is 5" },
  { q: "Daily: Sun rises in?", options: ["West", "North", "East", "South"], answer: 2, type: "text", exp: "Sun rises in the East" }
];

let questions = [], currentQ = 0, score = 0, streak = 0, bestStreak = 0, time = 15, timerId;
let soundOn = true, musicOn = false, fiftyUsed = false, skipUsed = false, hintUsed = false, answered = false;
let gameMode = 'classic', bgMusic, timerPaused = false, playerName = '';
let totalPlayed = 0, bestStreakGlobal = 0;
let leaderboard = [];

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function initAudio() {
  if (bgMusic) return;
  bgMusic = new Audio();
  bgMusic.loop = true;
  bgMusic.volume = 0.08;
  bgMusic.src = "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt66jlHhUfl9n0zGEmBihqz/LVi0ESGW/E8N2KQQ0TYrLn7qZnHwUme8n0yW0wBSV6ze3cjTQIF2G+8+OZRQ0PTYLO7aZ5HwUlgMrz0m0wBSh3z/DVjTIGJWy47+OVREwOTZDO7KZ7HQUlgMrz0m0wBSh3z/DVjTIGJWy47+OVREwOTZDO7KZ7HQUlgMrz0m0wBSh3z/DVjTIGJWy47+OVREwOTZDO7KZ7HQUlgMrz0m0wBSh3z/DVjTIGJWy47+OVREwOTZDO7KZ7HQUlgMrz0m0wBSh3z/DVjTIGJWy47+OVREwOTZDO7KZ7HQU=";
}

function playSound(freq, duration) {
  if (!soundOn) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
  osc.start();
  osc.stop(audioCtx.currentTime + duration);
}

function selectMode(mode) {
  gameMode = mode;
  document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
  event.target.classList.add('active');
  document.getElementById('aiTopic').style.display = mode === 'ai'? 'block' : 'none';
}

async function startGame() {
  playerName = document.getElementById('playerName').value.trim();
  if (!playerName) {
    alert('Please enter your name');
    return;
  }
  
  initAudio();
  
  if (gameMode === 'ai') {
    const topic = document.getElementById('aiTopic').value.trim();
    if (!topic) { alert('Enter a topic for AI Mode'); return; }
    document.querySelector('.start-btn').textContent = 'GENERATING...';
    questions = await generateAIQuestions(topic);
    if (questions.length === 0) {
      alert('Failed to generate questions. Using classic mode.');
      questions = [...classicQuestions];
    }
  } else if (gameMode === 'daily') {
    questions = [...dailyQuestions];
    time = 10;
  } else if (gameMode === 'power') {
    questions = [...classicQuestions].slice(0, 5);
    time = 3;
  } else {
    questions = [...classicQuestions];
  }

  currentQ = 0; score = 0; streak = 0; bestStreak = 0;
  fiftyUsed = false; skipUsed = false; hintUsed = false;
  
  document.getElementById('totalQ').textContent = questions.length;
  document.getElementById('startScreen').classList.remove('active');
  document.getElementById('endScreen').classList.remove('active');
  document.getElementById('gameScreen').classList.add('active');
  document.getElementById('fiftyBtn').disabled = false;
  document.getElementById('skipBtn').disabled = false;
  document.getElementById('hintBtn').disabled = false;
  
  loadQuestion();
  loadProfile();
}

async function generateAIQuestions(topic) {
  try {
    const res = await fetch(`https://opentdb.com/api.php?amount=5&category=18&type=multiple`);
    const data = await res.json();
    return data.results.map(r => ({
      q: decodeHTML(r.question),
      options: shuffleArray([...r.incorrect_answers.map(decodeHTML), decodeHTML(r.correct_answer)]),
      answer: 0,
      type: "text",
      correct: decodeHTML(r.correct_answer),
      exp: `The answer is ${decodeHTML(r.correct_answer)}`
    })).map(q => {
      q.answer = q.options.indexOf(q.correct);
      return q;
    });
  } catch(e) { return []; }
}

function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function decodeHTML(html) {
  const txt = document.createElement('textarea');
  txt.innerHTML = html;
  return txt.value;
}

function loadQuestion() {
  answered = false; timerPaused = false;
  const q = questions[currentQ];
  document.getElementById('questionNum').textContent = currentQ + 1;
  document.getElementById('question').textContent = q.q;
  document.getElementById('score').textContent = score;
  document.getElementById('streak').textContent = streak;
  document.getElementById('nextBtn').style.display = 'none';
  document.getElementById('hintBox').style.display = 'none';
  document.getElementById('explanation').style.display = 'none';

  const mediaWrap = document.getElementById('mediaWrap');
  const img = document.getElementById('questionImg');
  const video = document.getElementById('questionVideo');

  if (q.type === 'image') {
    mediaWrap.style.display = 'block';
    img.src = q.media;
    img.style.display = 'block';
    video.style.display = 'none';
  } else if (q.type === 'video') {
    mediaWrap.style.display = 'block';
    video.src = q.media + '?autoplay=1&mute=1';
    video.style.display = 'block';
    img.style.display = 'none';
    timerPaused = true;
    setTimeout(() => { timerPaused = false; }, 3000);
  } else {
    mediaWrap.style.display = 'none';
  }

  const optionsDiv = document.getElementById('options');
  optionsDiv.innerHTML = '';
  q.options.forEach((opt, i) => {
    const btn = document.createElement('button');
    btn.className = 'option';
    btn.textContent = opt;
    btn.onclick = () => selectAnswer(i);
    optionsDiv.appendChild(btn);
  });

  startTimer();
}

function startTimer() {
  const baseTime = gameMode === 'power' ? 3 : gameMode === 'daily' ? 10 : 15;
  time = baseTime;
  clearInterval(timerId);
  document.getElementById('timer').classList.remove('danger', 'paused');
  
  timerId = setInterval(() => {
    if (timerPaused) {
      document.getElementById('timer').classList.add('paused');
      return;
    }
    document.getElementById('timer').classList.remove('paused');
    time -= 0.1;
    document.getElementById('time').textContent = Math.ceil(time);
    document.getElementById('timer').style.width = (time / baseTime * 100) + '%';
    if (time <= 5) document.getElementById('timer').classList.add('danger');
    if (time <= 0) {
      clearInterval(timerId);
      selectAnswer(-1);
    }
  }, 100);
}

function selectAnswer(i) {
  if (answered) return;
  answered = true;
  clearInterval(timerId);

  const q = questions[currentQ];
  const options = document.querySelectorAll('.option');

  if (i === q.answer) {
    playSound(800, 0.1);
    options[i].classList.add('correct');
    streak++;
    if (streak > bestStreak) bestStreak = streak;
    let points = gameMode === 'power' ? 20 : 10;
    if (streak >= 3) {
      points *= 2;
      document.getElementById('streakBox').classList.add('active');
    }
    score += points;
    if (streak >= 3) createConfetti();
  } else {
    playSound(200, 0.3);
    if (i >= 0) options[i].classList.add('wrong');
    options[q.answer].classList.add('correct');
    streak = 0;
    document.getElementById('streakBox').classList.remove('active');
    if (gameMode === 'power') {
      setTimeout(() => endGame(), 1000);
      return;
    }
  }

  options.forEach(opt => opt.classList.add('disabled'));
  document.getElementById('score').textContent = score;
  document.getElementById('streak').textContent = streak;
  
  if (q.exp) {
    document.getElementById('explanation').textContent = q.exp;
    document.getElementById('explanation').style.display = 'block';
  }
  
  document.getElementById('nextBtn').style.display = 'block';
}

function useFiftyFifty() {
  if (fiftyUsed || answered) return;
  fiftyUsed = true;
  document.getElementById('fiftyBtn').disabled = true;
  playSound(600, 0.1);
  const q = questions[currentQ];
  const options = document.querySelectorAll('.option');
  let removed = 0;
  options.forEach((opt, i) => {
    if (i!== q.answer && removed < 2) {
      opt.classList.add('disabled');
      opt.style.visibility = 'hidden';
      removed++;
    }
  });
}

function skipQuestion() {
  if (skipUsed || answered) return;
  skipUsed = true;
  document.getElementById('skipBtn').disabled = true;
  playSound(500, 0.1);
  nextQuestion();
}

function useHint() {
  if (hintUsed || answered) return;
  hintUsed = true;
  document.getElementById('hintBtn').disabled = true;
  playSound(700, 0.1);
  const q = questions[currentQ];
  const correct = q.options[q.answer];
  const hint = `First letter: ${correct.charAt(0)}`;
  document.getElementById('hintBox').textContent = hint;
  document.getElementById('hintBox').style.display = 'block';
}

function nextQuestion() {
  currentQ++;
  if (currentQ >= questions.length) endGame();
  else loadQuestion();
}

function endGame() {
  clearInterval(timerId);
  document.getElementById('gameScreen').classList.remove('active');
  document.getElementById('endScreen').classList.add('active');
  document.getElementById('finalScore').textContent = score;
  document.getElementById('bestStreakEnd').textContent = bestStreak;
  const accuracy = Math.round((score / (questions.length * 10)) * 100);
  document.getElementById('accuracy').textContent = accuracy;

  let rank = "Quiz Novice";
  if (score >= 150) rank = "ARCADE LEGEND";
  else if (score >= 100) rank = "Quiz Master";
  else if (score >= 70) rank = "Code Ninja";
  document.getElementById('rankText').textContent = rank;

  saveScore();
  updateLeaderboard();
  updateProfile();
  if (score >= 100) createConfetti();
}

function createConfetti() {
  for (let i = 0; i < 50; i++) {
    const conf = document.createElement('div');
    conf.className = 'confetti';
    conf.style.left = Math.random() * 100 + '%';
    conf.style.background = `hsl(${Math.random() * 360}, 100%, 50%)`;
    conf.style.animationDelay = Math.random() * 0.5 + 's';
    document.body.appendChild(conf);
    setTimeout(() => conf.remove(), 3000);
  }
}
function saveScore() {

  let board = JSON.parse(
      localStorage.getItem('quizLeaderboard') || '[]'
  );

  board.push({
      name: playerName,
      score: score
  });

  // Remove invalid data
  board = board.filter(player =>
      player &&
      player.name &&
      typeof player.score === "number"
  );

  // Sort highest score first
  board.sort((a, b) => b.score - a.score);

  // Keep only Top 3
  board = board.slice(0, 3);

  localStorage.setItem(
      'quizLeaderboard',
      JSON.stringify(board)
  );

  leaderboard = board;

  totalPlayed++;
  if (bestStreak > bestStreakGlobal) {
      bestStreakGlobal = bestStreak;
  }

  localStorage.setItem('totalPlayed', totalPlayed);
  localStorage.setItem('bestStreakGlobal', bestStreakGlobal);
}

function updateLeaderboard() {

  let board = JSON.parse(
    localStorage.getItem('quizLeaderboard') || '[]'
  );

  // Remove invalid entries
  board = board.filter(player =>
    player &&
    player.name &&
    typeof player.score === "number"
  );

  // Sort highest first
  board.sort((a, b) => b.score - a.score);

  // TOP 3 ONLY
  board = board.slice(0, 3);

  const html = board.map((item, i) => `
      <div class="leaderboard-item">
          <span>${i + 1}. ${item.name}</span>
          <span>${item.score} pts</span>
      </div>
  `).join('');

  document.getElementById('leaderboardStart').innerHTML =
      html || '<p>No scores yet.</p>';

  document.getElementById('leaderboardEnd').innerHTML =
      html || '<p>No scores yet.</p>';
} 

function loadProfile() {
  totalPlayed = parseInt(localStorage.getItem('totalPlayed') || '0');
  bestStreakGlobal = parseInt(localStorage.getItem('bestStreakGlobal') || '0');
  document.getElementById('totalPlayed').textContent = totalPlayed;
  document.getElementById('bestStreak').textContent = bestStreakGlobal;
}

function updateProfile() {
  document.getElementById('totalPlayed').textContent = totalPlayed;
  document.getElementById('bestStreak').textContent = bestStreakGlobal;
}

function toggleSound() {
  soundOn = !soundOn;
  document.getElementById('soundBtn').textContent = soundOn ? '🔊' : '🔇';
}

function toggleMusic() {
  musicOn = !musicOn;
  document.getElementById('musicBtn').textContent = musicOn ? '🎵' : '🔇';
  if (musicOn) bgMusic.play().catch(e => {});
  else bgMusic.pause();
}

function shareScore() {
  const text = `I scored ${score} points in QuizPro Max! Can you beat me?`;
  const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank');
}

updateLeaderboard();
loadProfile();