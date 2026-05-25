// 1. Declare variables
let quizData = []; 
let curIdx = 0;
let score = 0;
let answered = false;

// Default load Science Chapter 1 data on startup
// Startup load logic
let initialData = typeof HinSciCh1Data !== 'undefined' ? HinSciCh1Data : [];
quizData = initialData;

window.onload = () => {
    const savedIdx = localStorage.getItem('qp_idx');
    if (savedIdx !== null) {
        const idx = parseInt(savedIdx);
        if (idx >= 0 && idx < quizData.length) {
            document.getElementById('resume-box').classList.remove('hidden');
            return; 
        }
    }
    initQuiz(false);
};

function initQuiz(resume) {
    document.getElementById('resume-box').classList.add('hidden');
    if (resume) {
        curIdx = parseInt(localStorage.getItem('qp_idx')) || 0;
        score = parseInt(localStorage.getItem('qp_score')) || 0;
    } else {
        curIdx = 0;
        score = 0;
        localStorage.removeItem('qp_idx');
        localStorage.removeItem('qp_score');
    }
    renderQuestion();
}

// --- CHAPTER LOADING LOGIC (Updated for HinSci/Geo) ---
function loadChapter(num) {
    if(num === 1) { quizData = HinSciCh1Data; }
    else if(num === 2) { quizData = HinSciCh2Data; }
    else if(num === 3) { quizData = HinSciCh3Data; }
    else if(num === 4) { quizData = HinSciCh4Data; }
    else if(num === 5) { quizData = typeof HinGeoCh1Data !== 'undefined' ? HinGeoCh1Data : []; }
    else if(num === 6) { quizData = typeof HinGeoCh2Data !== 'undefined' ? HinGeoCh2Data : []; }
    
    curIdx = 0;
    score = 0;
    localStorage.removeItem('qp_idx');
    localStorage.removeItem('qp_score');
    initQuiz(false);
    
    const sidebar = document.getElementById('lSidebar');
    if (sidebar) sidebar.classList.add('closed');
}

function renderQuestion() {
    answered = false;
    const data = quizData[curIdx];
    const tile = document.getElementById('mainTile');
    if(!data) return;

    // Type check ko behtar banaya gaya hai
    const isTheory = data.type && (data.type.trim().toLowerCase() === 'long_answer' || data.type.trim().toLowerCase() === 'descriptive');

    tile.innerHTML = `
        <div class="content-controls">
            <div class="font-tools">
                <button onclick="fontSize(1.1)">A+</button>
                <button onclick="fontSize(0.9)">A-</button>
                <button onclick="fullScreen()"><i class="fas fa-expand"></i></button>
            </div>
            <button class="tts-btn" onclick="playQuestion()"><i class="fas fa-volume-up"></i> सुनिए</button>
        </div>
        <div class="tile-header">
            <span id="progress-text">प्रश्न: ${data.q_no || (curIdx + 1)}</span>
            <div class="score-chip" style="${isTheory ? 'display:none' : ''}">Score: <span id="liveScore">${score}</span></div>
        </div>
        <h2 id="qText">${data.q}</h2>
        <div id="options-grid" class="options-container"></div>
        <div class="footer-nav">
            <button id="prevBtn" onclick="move(-1)" class="nav-btn">Back</button>
            <button id="nextBtn" onclick="move(1)" class="nav-btn">${curIdx === quizData.length - 1 ? 'Finish' : 'Next'}</button>
        </div>
    `;

    const grid = document.getElementById('options-grid');
    grid.innerHTML = ""; // Pehle purane options saaf karein

    if (isTheory) {
        // Descriptive answer format
        grid.innerHTML = `
            <div class="desc-box" style="background:#f9f9f9; padding:20px; border-left:8px solid var(--accent); border-radius:15px; width:100%; box-shadow: inset 0 0 10px rgba(0,0,0,0.05);">
                <strong style="color:var(--accent); font-size: 20px; display: block; margin-bottom: 10px;">उत्तर:</strong>
                <p style="color:var(--text); font-size: 19px; line-height: 1.6; text-align: justify;">${data.ans}</p>
            </div>`;
        answered = true; 
    } else if (data.options) {
        data.options.forEach((opt, idx) => {
            const btn = document.createElement('div');
            btn.className = 'opt';
            btn.innerText = opt;
            btn.onclick = () => checkAns(idx, btn);
            grid.appendChild(btn);
        });
    }

    document.getElementById('prevBtn').style.visibility = curIdx === 0 ? "hidden" : "visible";
    localStorage.setItem('qp_idx', curIdx);
}

function checkAns(idx, el) {
    if (answered) return;
    answered = true;
    const correct = quizData[curIdx].correct;
    if (idx === correct) {
        el.classList.add('correct');
        score += 10;
    } else {
        el.classList.add('incorrect');
        document.querySelectorAll('.opt')[correct].classList.add('correct');
    }
    document.getElementById('liveScore').innerText = score;
    localStorage.setItem('qp_score', score);
}

function move(step) {
    if (curIdx + step >= 0 && curIdx + step < quizData.length) {
        curIdx += step;
        localStorage.setItem('qp_idx', curIdx);
        renderQuestion();
    } else if (curIdx + step === quizData.length) {
        showResults();
    }
}

function showResults() {
    const tile = document.getElementById('mainTile');
    const mcqCount = quizData.filter(d => d.options).length;
    const totalPossible = mcqCount * 10;
    
    tile.innerHTML = `
        <div class="result-screen" style="text-align: center; padding: 20px;">
            <i class="fas fa-trophy" style="font-size: 80px; color: #FFD700; margin-bottom: 20px;"></i>
            <h2 style="color: #FF4757; font-size: 32px;">अध्याय पूर्ण हुआ!</h2>
            <div style="background: #f1f2f6; padding: 20px; border-radius: 20px; display: inline-block; margin-bottom: 30px; border: 2px solid #ddd;">
                <h3 style="margin: 0; color: #2ED573; font-size: 24px;">Score: ${score} / ${totalPossible}</h3>
            </div>
            <button onclick="restartQuiz()" class="nav-btn" style="display: block; margin: 0 auto; background: #1E90FF; padding: 15px 40px; font-size: 18px;">Try Again</button>
        </div>
    `;
    localStorage.removeItem('qp_idx');
    localStorage.removeItem('qp_score');
}

function restartQuiz() {
    score = 0; curIdx = 0;
    initQuiz(false);
}

function playQuestion() {
    const msg = new SpeechSynthesisUtterance(quizData[curIdx].q);
    msg.lang = 'hi-IN'; // Better support for Hindi text
    window.speechSynthesis.speak(msg);
}

function fontSize(n) {
    const q = document.getElementById('qText');
    const curSize = parseFloat(window.getComputedStyle(q).fontSize);
    q.style.fontSize = (curSize * n) + "px";
}

function fullScreen() {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen();
    else document.exitFullscreen();
}

// Baki Voice/Search functions wahi hain...
function voiceSearch() {
    const searchInput = document.getElementById('gSearch');
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    const recognition = new SpeechRecognition();
    recognition.lang = 'hi-IN';
    searchInput.placeholder = "बोलिए...";
    recognition.onresult = (event) => {
        searchInput.value = event.results[0][0].transcript;
        doSearch();
    };
    recognition.start();
}

function doSearch() {
    const val = document.getElementById('gSearch').value;
    if(val) window.open(`https://www.google.com/search?q=${encodeURIComponent(val)}`, '_blank');
}

document.getElementById('menu-toggle').onclick = () => {
    document.getElementById('lSidebar').classList.toggle('closed');
};
