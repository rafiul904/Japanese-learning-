let roadmapData = [];
let userStats = { unlockedLessons: [0], completedLessons: [], currentActiveLesson: 0 };

if (localStorage.getItem('nihongo_quest_pro_stats')) {
    userStats = JSON.parse(localStorage.getItem('nihongo_quest_pro_stats'));
}

let selectedOptionIndex = null;
let isAnswerChecked = false;

async function loadDatabase() {
    try {
        const response = await fetch('data.json');
        roadmapData = await response.json();
        initApp();
    } catch (error) {
        console.error("ডাটাবেজ লোড হয়নি:", error);
        document.getElementById('lesson-title').innerText = "ডাটাবেজ ফাইল (data.json) পাওয়া যায়নি!";
    }
}

function saveStats() {
    localStorage.setItem('nihongo_quest_pro_stats', JSON.stringify(userStats));
}

function initApp() {
    renderRoadmap();
    updateStatsBar();
    loadLesson(userStats.currentActiveLesson);
}

function renderRoadmap() {
    const container = document.getElementById('lesson-roadmap');
    container.innerHTML = '';

    roadmapData.forEach((lesson, index) => {
        const li = document.createElement('li');
        const isUnlocked = userStats.unlockedLessons.includes(index);
        const isCompleted = userStats.completedLessons.includes(index);
        
        let icon = "🔒";
        if (isUnlocked) icon = "📖";
        if (isCompleted) icon = "✅";

        li.innerHTML = `<span>${lesson.title.split(':')[0]}</span> <span>${icon}</span>`;
        
        if (!isUnlocked) {
            li.className = 'locked';
        } else {
            if (index === userStats.currentActiveLesson) li.className = 'active';
            else if (isCompleted) li.className = 'completed';
            
            li.onclick = () => {
                userStats.currentActiveLesson = index;
                saveStats();
                initApp();
            };
        }
        container.appendChild(li);
    });
}

function updateStatsBar() {
    const total = roadmapData.length;
    const unlocked = userStats.unlockedLessons.length;
    const progress = total > 0 ? Math.round((userStats.completedLessons.length / total) * 100) : 0;

    document.getElementById('total-progress').innerText = progress + "%";
    document.getElementById('unlocked-count').innerText = unlocked + "/" + total;
}

function loadLesson(index) {
    if (roadmapData.length === 0) return;

    const activeBox = document.getElementById('active-lesson-box');
    const lockedScreen = document.getElementById('locked-screen');

    if (!userStats.unlockedLessons.includes(index)) {
        activeBox.style.display = 'none';
        lockedScreen.style.display = 'block';
        return;
    }

    activeBox.style.display = 'block';
    lockedScreen.style.display = 'none';

    // অ্যানিমেশন রি-ট্রিগার করার ট্রিক
    activeBox.classList.remove('fade-in');
    void activeBox.offsetWidth; 
    activeBox.classList.add('fade-in');

    const lesson = roadmapData[index];
    document.getElementById('lesson-title').innerText = lesson.title;
    document.getElementById('grammar-content').innerHTML = lesson.grammar;

    const vocabContainer = document.getElementById('vocab-content');
    vocabContainer.innerHTML = '';
    lesson.vocabulary.forEach(item => {
        const card = document.createElement('div');
        card.className = 'vocab-card';
        card.innerHTML = `<span class="vocab-jp">${item.jp}</span><span>= ${item.bn}</span>`;
        vocabContainer.appendChild(card);
    });

    loadQuiz(lesson);
}

function loadQuiz(lesson) {
    const quizContainer = document.getElementById('quiz-container');
    
    if (userStats.completedLessons.includes(lesson.id)) {
        quizContainer.innerHTML = `<h3 style="color:var(--secondary); text-align:center;">🎉 আপনি এই লেসনটি পাস করেছেন! পরবর্তী লেসনটি মেনু থেকে সিলেক্ট করুন।</h3>`;
        return;
    }

    quizContainer.innerHTML = `
        <p id="quiz-question">${lesson.quiz.q}</p>
        <div class="quiz-options" id="quiz-options"></div>
        <p id="quiz-feedback"></p>
        <button id="next-btn" onclick="submitOrNext()">যাচাই করুন</button>
    `;

    const optionsContainer = document.getElementById('quiz-options');
    lesson.quiz.options.forEach((option, idx) => {
        const btn = document.createElement('button');
        btn.innerText = option;
        btn.onclick = () => selectOption(idx);
        optionsContainer.appendChild(btn);
    });

    isAnswerChecked = false;
    selectedOptionIndex = null;
}

function selectOption(idx) {
    if (isAnswerChecked) return;
    selectedOptionIndex = idx;
    const buttons = document.querySelectorAll('#quiz-options button');
    buttons.forEach((btn, i) => {
        if (i === idx) btn.classList.add('selected');
        else btn.classList.remove('selected');
    });
}

function submitOrNext() {
    const lesson = roadmapData[userStats.currentActiveLesson];
    const feedback = document.getElementById('quiz-feedback');
    const nextBtn = document.getElementById('next-btn');
    const buttons = document.que
