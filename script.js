// ১. এখানে আপনার ডাটা সরাসরি পেস্ট করুন (অ্যারে ফরম্যাটে)
let roadmapData = [
  {
    "id": 97,
    "title": "লেসন ৯৭: জাপানিজ কাজের পর অন্য কাজের অবস্থা (~ Te mimasu)",
    "grammar": "<h3>পরীক্ষামূলকভাবে কোনো কাজ করে দেখা (Try to do)</h3><p>কোনো কাজ আগে কখনো করা হয়নি, তাই কৌতুহলবশত বা টেস্ট করার জন্য 'একবার করে দেখা' বা চেষ্টা করা বোঝালে ক্রিয়ার Te-form এর সাথে <b>みます (~ mimasu)</b> যোগ করা হয়। যেমন: আমি জাপানি খাবার খেয়ে দেখব (Tabete mimasu)।</p>",
    "vocabulary": [
      {"jp": "みます (Mimasu)", "bn": "করে দেখা / চেষ্টা করা (Try)"},
      {"jp": "はきます (Hakimasu)", "bn": "প্যান্ট/জুতো পরা ➡️ はいてみます (পরে দেখা)"},
      {"jp": "きもの (Kimono)", "bn": "কিমোনো (জাপানি ঐতিহ্যবাহী পোশাক)"},
      {"jp": "もういちど (Mou ichido)", "bn": "আরেকবার / পুনরায়"},
      {"jp": "かん가えます (Kangaemasu)", "bn": "চিন্তা করা ➡️ かん가えてみます"}
    ],
    // লক্ষ্য করুন: JSON-এ "correct": 1 ছিল, এখানে সাবমিট ফাংশনের সাথে মিল রাখার জন্য "answer": 1 করে দেওয়া হয়েছে
    "quiz": {"q": "'আমি আরেকবার ভেবে দেখব' এর সঠিক রূপ কোনটি হবে?", "options": ["Mou ichido kangaemasu", "Mou ichido kangaete mimasu", "Mou ichido kangaete kudasai"], "answer": 1}
  }
  // আপনার অন্যান্য লেসনগুলো (যেমন লেসন ১, ২, ৩...) এভাবে কমা দিয়ে নিচে নিচে বসিয়ে দেবেন।
];

let userStats = { unlockedLessons: [0], completedLessons: [], currentActiveLesson: 0 };

if (localStorage.getItem('nihongo_quest_pro_stats')) {
    userStats = JSON.parse(localStorage.getItem('nihongo_quest_pro_stats'));
}

let selectedOptionIndex = null;
let isAnswerChecked = false;

// ২. পরিবর্তন: fetch করার ঝামেলা বাদ দিয়ে সরাসরি initApp() কল করা হয়েছে
function loadDatabase() {
    try {
        if (!roadmapData || roadmapData.length === 0) {
            throw new Error("রোডম্যাপে কোনো ডাটা পাওয়া যায়নি!");
        }
        initApp();
    } catch (error) {
        console.error("ডাটাবেজ লোড হয়নি:", error);
        document.getElementById('lesson-title').innerText = "কোনো লেসন ডাটা পাওয়া যায়নি!";
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

    loadQuiz(lesson, index);
}

function loadQuiz(lesson, index) {
    const quizContainer = document.getElementById('quiz-container');
    
    if (userStats.completedLessons.includes(index)) {
        quizContainer.innerHTML = `<h3 style="color:#2ecc71; text-align:center;">🎉 আপনি এই লেসনটি পাস করেছেন! পরবর্তী লেসনটি মেনু থেকে সিলেক্ট করুন।</h3>`;
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
    const currentIndex = userStats.currentActiveLesson;
    const lesson = roadmapData[currentIndex];
    const feedback = document.getElementById('quiz-feedback');
    const nextBtn = document.getElementById('next-btn');
    const buttons = document.querySelectorAll('#quiz-options button');

    if (selectedOptionIndex === null) {
        feedback.innerText = "⚠️ দয়া করে একটি উত্তর সিলেক্ট করুন!";
        feedback.style.color = "orange";
        return;
    }

    if (!isAnswerChecked) {
        isAnswerChecked = true;
        const correctAnswerIndex = lesson.quiz.answer; 

        if (selectedOptionIndex === correctAnswerIndex) {
            feedback.innerText = "🎉 সঠিক উত্তর হয়েছে!";
            feedback.style.color = "#2ecc71";
            buttons[selectedOptionIndex].classList.add('correct');
            
            if (!userStats.completedLessons.includes(currentIndex)) {
                userStats.completedLessons.push(currentIndex);
            }
            const nextLessonIndex = currentIndex + 1;
            if (nextLessonIndex < roadmapData.length && !userStats.unlockedLessons.includes(nextLessonIndex)) {
                userStats.unlockedLessons.push(nextLessonIndex);
            }
            saveStats();
            nextBtn.innerText = "পরবর্তী ধাপ";
        } else {
            feedback.innerText = "❌ ভুল উত্তর! আবার চেষ্টা করুন।";
            feedback.style.color = "#e74c3c";
            buttons[selectedOptionIndex].classList.add('wrong');
            buttons[correctAnswerIndex].classList.add('correct');
            nextBtn.innerText = "আবার চেষ্টা করুন";
        }
    } else {
        initApp();
    }
}

function resetProgress() {
    if(confirm("আপনি কি নিশ্চিত যে আপনার সমস্ত প্রোগ্রেস মুছে ফেলতে চান?")) {
        localStorage.removeItem('nihongo_quest_pro_stats');
        userStats = { unlockedLessons: [0], completedLessons: [], currentActiveLesson: 0 };
        initApp();
    }
}

// আপনার HTML ফাইলে যদি ডোম লোড হওয়ার পর loadDatabase() কল করা না থাকে, তবে নিচের লাইনটি আনকমেন্ট করতে পারেন:
// window.onload = loadDatabase;
