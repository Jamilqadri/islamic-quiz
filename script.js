// متغیرات
let currentQuestions = [];
let currentQuestionIndex = 0;
let score = 0;
let selectedOption = null;
let userData = {};

// ایپ انیشیلائز
function initApp() {
    // 5 رینڈم سوال منتخب کریں
    currentQuestions = getRandomQuestions(5);
    currentQuestionIndex = 0;
    score = 0;
    selectedOption = null;
    updateProgress();
    showQuestion();
}

// رینڈم سوال منتخب کریں
function getRandomQuestions(count) {
    const shuffled = [...allQuestions].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

// ترقی بار اپڈیٹ کریں
function updateProgress() {
    const progress = ((currentQuestionIndex + 1) / currentQuestions.length) * 100;
    document.getElementById('progress').style.width = `${progress}%`;
}

// سوال دکھائیں
function showQuestion() {
    if (currentQuestionIndex >= currentQuestions.length) {
        showScore();
        return;
    }

    const question = currentQuestions[currentQuestionIndex];
    
    // سوال نمبر اپڈیٹ کریں
    document.getElementById('question-number').textContent = 
        `سوال ${currentQuestionIndex + 1} / ${currentQuestions.length}`;
    
    document.getElementById('question').textContent = question.question;
    
    const optionsContainer = document.getElementById('options');
    optionsContainer.innerHTML = '';
    
    question.options.forEach((option, index) => {
        const button = document.createElement('button');
        button.className = 'option';
        button.textContent = option;
        button.onclick = () => selectOption(button, index);
        optionsContainer.appendChild(button);
    });
    
    document.getElementById('next-btn').style.display = 'block';
    selectedOption = null;
    updateProgress();
}

// آپشن منتخب کریں
function selectOption(button, index) {
    // پہلے سے منتخب آپشن کو ریسیٹ کریں
    document.querySelectorAll('.option').forEach(opt => {
        opt.classList.remove('selected');
    });
    
    button.classList.add('selected');
    selectedOption = index;
}

// اگلا سوال
function nextQuestion() {
    if (selectedOption === null) {
        alert('براہ کرم ایک آپشن منتخب کریں');
        return;
    }

    // اسکور کا حساب لگائیں
    const currentQuestion = currentQuestions[currentQuestionIndex];
    if (selectedOption === currentQuestion.correct) {
        score += 20;
    }

    currentQuestionIndex++;
    showQuestion();
}

// اسکور دکھائیں
function showScore() {
    document.getElementById('quiz-section').classList.remove('active');
    document.getElementById('score-section').classList.add('active');
    document.getElementById('score-display').textContent = `${score}/100`;
}

// فارم دکھائیں
function showForm() {
    document.getElementById('score-section').classList.remove('active');
    document.getElementById('form-section').classList.add('active');
}

// فارم سبمٹ
document.getElementById('user-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    userData = {
        name: document.getElementById('name').value,
        whatsapp: document.getElementById('whatsapp').value,
        address: document.getElementById('address').value,
        score: score,
        timestamp: new Date().toLocaleString('ur-PK')
    };
    
    // ڈیٹا سیو کریں
    saveToGoogleSheets(userData);
    
    // کانگریچولیشن دکھائیں
    showCongratulations();
});

// کانگریچولیشن دکھائیں
function showCongratulations() {
    document.getElementById('form-section').classList.remove('active');
    document.getElementById('congrats-section').classList.add('active');
    
    let message = "";
    if (score >= 80) {
        message = `
            <div style="text-align: center;">
                <h2 style="color: #27ae60;">🎉 بہت بہت مبارک ہو! 🎉</h2>
                <p style="font-size: 20px; margin: 10px 0;">عزیز <strong>${userData.name}</strong></p>
                <div style="font-size: 60px; color: #667eea; margin: 20px 0; font-weight: bold;">${score}/100</div>
                <p style="font-size: 18px; color: #666;">آپ نے شاندار کارکردگی کا مظاہرہ کیا! 🏆</p>
                <p style="color: #27ae60; margin-top: 10px;">انشاءاللہ آپ کو خصوصی انعام سے نوازا جائے گا!</p>
            </div>
        `;
    } else if (score >= 60) {
        message = `
            <div style="text-align: center;">
                <h2 style="color: #f39c12;">👍 مبارک ہو! 👍</h2>
                <p style="font-size: 20px; margin: 10px 0;">عزیز <strong>${userData.name}</strong></p>
                <div style="font-size: 60px; color: #667eea; margin: 20px 0; font-weight: bold;">${score}/100</div>
                <p style="font-size: 18px; color: #666;">آپ کی کارکردگی اچھی ہے! 💫</p>
            </div>
        `;
    } else {
        message = `
            <div style="text-align: center;">
                <h2 style="color: #e74c3c;">😊 شکریہ! 😊</h2>
                <p style="font-size: 20px; margin: 10px 0;">عزیز <strong>${userData.name}</strong></p>
                <div style="font-size: 60px; color: #667eea; margin: 20px 0; font-weight: bold;">${score}/100</div>
                <p style="font-size: 18px; color: #666;">مزید پڑھائی جاری رکھیں! 📚</p>
                <p style="color: #e74c3c; margin-top: 10px;">انشاءاللہ اگلی بار بہتر کریں گے!</p>
            </div>
        `;
    }
    
    document.getElementById('congrats-message').innerHTML = message;
}

// واٹس ایپ پر شیئر کریں
function shareOnWhatsApp() {
    const scoreText = score >= 80 ? "شاندار اسکور" : 
                     score >= 60 ? "اچھا اسکور" : "اسکور";
    
    const text = `🌙 *اسلامک کوئز مقابلہ* 🌙

🏆 میرا اسکور: ${score}/100
👤 نام: ${userData.name}
📅 تاریخ: ${new Date().toLocaleDateString('ur-PK')}

میں نے اسلامک کوئز میں ${scoreText} حاصل کیا! آپ بھی شرکت کریں اور اپنے اسلامی علم کا测验 کریں۔

🔗 لنک: ${window.location.href}

#اسلامک_کوئز #IslamicQuiz`;
    
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
}

// فیس بک پر شیئر کریں
function shareOnFacebook() {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
}

// تصویر کے طور پر ڈاؤنلوڈ کریں
function downloadAsImage() {
    alert('🖼️ یہ فیچر جلد ہی دستیاب ہوگا! فی الحال آپ اسکور کارڈ شیئر کر سکتے ہیں۔');
}

// Google Sheets میں ڈیٹا سیو کریں
function saveToGoogleSheets(data) {
    // یہاں آپ کا Google Apps Script URL آئے گا
    const scriptURL = 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE';
    
    fetch(scriptURL, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => console.log('ڈیٹا سیو ہو گیا!'))
    .catch(error => console.error('Error:', error));
    
    // عارضی طور پر کنسول میں ڈیٹا دکھائیں
    console.log('📊 ڈیٹا سیو ہو رہا ہے:', data);
}

// ایپ شروع کریں
window.onload = initApp;
