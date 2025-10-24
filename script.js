// script.js

console.log("Script loaded successfully!");

class Quiz {
    constructor() {
        this.currentQuestion = 0;
        this.score = 0;
        this.userInfo = {
            name: '',
            contact: '',
            address: '',
            state: ''
        };
        this.timer = null;
        this.timeLeft = 10;
        this.hasPlayedToday = this.checkDailyPlay();
        console.log("Quiz class initialized");
    }

    // Check if user already played today
    checkDailyPlay() {
        const lastPlay = localStorage.getItem('lastQuizPlay');
        if (lastPlay) {
            const lastPlayDate = new Date(lastPlay);
            const today = new Date();
            return lastPlayDate.toDateString() === today.toDateString();
        }
        return false;
    }

    // Initialize the quiz
    init() {
        console.log("Initializing quiz...");
        this.showScreen('welcomeScreen');
        this.setupEventListeners();
        
        // If already played today, show message
        if (this.hasPlayedToday) {
            document.getElementById('startQuiz').disabled = true;
            document.querySelector('.daily-notice p').textContent = 
                "📅 You have already played today. Come back tomorrow!";
        }
    }

    // Show specific screen
    showScreen(screenId) {
        console.log("Showing screen:", screenId);
        // Hide all screens
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        // Show target screen
        document.getElementById(screenId).classList.add('active');
    }

    // Setup event listeners
    setupEventListeners() {
        console.log("Setting up event listeners");

        // Welcome screen start button
        const startQuizBtn = document.getElementById('startQuiz');
        if (startQuizBtn) {
            startQuizBtn.addEventListener('click', () => {
                if (!this.hasPlayedToday) {
                    console.log("Start quiz button clicked");
                    this.startQuiz();
                }
            });
        }

        // Next question button
        const nextQuestionBtn = document.getElementById('nextQuestion');
        if (nextQuestionBtn) {
            nextQuestionBtn.addEventListener('click', () => {
                console.log("Next question button clicked");
                this.nextQuestion();
            });
        }

        // Play again button
        const playAgainBtn = document.getElementById('playAgain');
        if (playAgainBtn) {
            playAgainBtn.addEventListener('click', () => {
                console.log("Play again button clicked");
                this.showScreen('welcomeScreen');
            });
        }

        // User info form submission
        const userInfoForm = document.getElementById('userInfoForm');
        if (userInfoForm) {
            userInfoForm.addEventListener('submit', (e) => {
                e.preventDefault();
                console.log("User info form submitted");
                this.collectUserInfo();
            });
        }

        // Share buttons
        const shareWhatsApp = document.getElementById('shareWhatsApp');
        if (shareWhatsApp) {
            shareWhatsApp.addEventListener('click', () => {
                this.shareOnWhatsApp();
            });
        }

        const shareFacebook = document.getElementById('shareFacebook');
        if (shareFacebook) {
            shareFacebook.addEventListener('click', () => {
                this.shareOnFacebook();
            });
        }

        // Download Image button
        const downloadImage = document.getElementById('downloadImage');
        if (downloadImage) {
            downloadImage.addEventListener('click', () => {
                this.downloadScoreImage();
            });
        }
    }

    // Start the quiz (direct without form)
    startQuiz() {
        console.log("Starting quiz");
        this.showScreen('quizScreen');
        this.currentQuestion = 0;
        this.score = 0;
        this.displayQuestion();
    }

    // Display current question
    displayQuestion() {
        console.log("Displaying question:", this.currentQuestion);

        const question = quizQuestions[this.currentQuestion];
        document.getElementById('questionText').textContent = question.question;

        // Update progress (5 questions fixed)
        const progress = ((this.currentQuestion) / 5) * 100;
        document.getElementById('progress').style.width = progress + '%';
        document.getElementById('questionCount').textContent = `Question ${this.currentQuestion + 1}/5`;

        const optionsContainer = document.getElementById('optionsContainer');
        optionsContainer.innerHTML = '';

        question.options.forEach((option, index) => {
            const button = document.createElement('button');
            button.textContent = option;
            button.className = 'option-btn';
            button.addEventListener('click', () => {
                console.log("Option clicked:", index);
                this.selectOption(index);
            });
            optionsContainer.appendChild(button);
        });

        // Start timer
        this.startTimer();

        // Disable next button initially
        document.getElementById('nextQuestion').disabled = true;
    }

    // Start timer for current question
    startTimer() {
        this.timeLeft = 10;
        document.getElementById('timer').textContent = this.timeLeft;
        document.getElementById('timer').style.background = '#25D366'; // Green
        
        if (this.timer) {
            clearInterval(this.timer);
        }

        this.timer = setInterval(() => {
            this.timeLeft--;
            document.getElementById('timer').textContent = this.timeLeft;
            
            // Timer color change - Green to Red
            if (this.timeLeft <= 3) {
                document.getElementById('timer').style.background = '#ff4444'; // Red
            } else if (this.timeLeft <= 7) {
                document.getElementById('timer').style.background = '#ffaa00'; // Orange
            }
            
            if (this.timeLeft <= 0) {
                clearInterval(this.timer);
                this.nextQuestion();
            }
        }, 1000);
    }

    // Handle option selection with time-based scoring
    selectOption(selectedIndex) {
        console.log("Selected option:", selectedIndex);
        
        // Calculate score based on time (20 - (10-time)*2)
        let questionScore = 20;
        if (this.timeLeft < 10) {
            questionScore = Math.max(0, 20 - ((10 - this.timeLeft) * 2));
        }
        
        // Clear timer
        if (this.timer) {
            clearInterval(this.timer);
        }

        const question = quizQuestions[this.currentQuestion];
        const options = document.querySelectorAll('.option-btn');

        // Mark selected option
        options.forEach((option, index) => {
            if (index === selectedIndex) {
                option.classList.add('selected');
                if (index === question.correct) {
                    this.score += questionScore;
                    console.log(`Correct! Time: ${this.timeLeft}s, Score: +${questionScore}, Total: ${this.score}`);
                }
            }
        });

        // Enable next button
        document.getElementById('nextQuestion').disabled = false;
    }

    // Move to next question
    nextQuestion() {
        this.currentQuestion++;

        if (this.currentQuestion < 5) {
            this.displayQuestion();
        } else {
            this.endQuiz();
        }
    }

    // End quiz and show results
    endQuiz() {
        console.log("Ending quiz. Final score:", this.score);

        // Save play date
        localStorage.setItem('lastQuizPlay', new Date().toISOString());
        
        this.showScreen('resultScreen');
        this.displayResults();
    }

    // Display results
    displayResults() {
        document.getElementById('finalScore').textContent = this.score;
        
        // Result message based on score
        let message = '';
        let congrats = '';

        if (this.score >= 80) {
            message = 'ماشاءاللہ! آپ کا اسلامی علم بہت عمدہ ہے۔ 🎉';
            congrats = 'بہت مبارک ہو! آپ نے شاندار کارکردگی دکھائی۔';
        } else if (this.score >= 60) {
            message = 'بہت خوب! آپ کا اسلامی علم قابل تعریف ہے۔ 👍';
            congrats = 'مبارک ہو! آپ کی کارکردگی بہت اچھی ہے۔';
        } else if (this.score >= 40) {
            message = 'اچھا ہے! اسلامی علم میں مزید اضافہ کریں۔ 📚';
            congrats = 'کوشش جاری رکھیں، آپ بہتر کر سکتے ہیں۔';
        } else {
            message = 'مطالعہ جاری رکھیں! اسلام میں علم کا سمندر ہے۔ 🌟';
            congrats = 'کوشش کرتے رہیں، انشاءاللہ آپ بہتر کریں گے۔';
        }

        document.getElementById('resultMessage').innerHTML = `
            <h3>${congrats}</h3>
            <p>${message}</p>
            <p><strong>آپ کا اسکور: ${this.score}/100</strong></p>
        `;

        // Update leaderboard
        this.updateLeaderboard();
    }

    // Update leaderboard
    updateLeaderboard() {
        // Get existing leaderboard or create new
        let leaderboard = JSON.parse(localStorage.getItem('quizLeaderboard') || '[]');
        
        // Add current score (without name for now)
        leaderboard.push({
            score: this.score,
            timestamp: new Date().toISOString()
        });
        
        // Sort by score (descending) and keep top 10
        leaderboard.sort((a, b) => b.score - a.score);
        leaderboard = leaderboard.slice(0, 10);
        
        // Save back to localStorage
        localStorage.setItem('quizLeaderboard', JSON.stringify(leaderboard));
        
        // Display leaderboard
        const leaderboardHTML = leaderboard.map((entry, index) => `
            <div class="leaderboard-item">
                <span>${index + 1}. ${entry.name || 'User'}</span>
                <span>${entry.score} points</span>
            </div>
        `).join('');
        
        document.getElementById('leaderboard').innerHTML = leaderboardHTML;
    }

    // Collect user information after quiz
    collectUserInfo() {
        console.log("Collecting user info");

        this.userInfo.name = document.getElementById('fullName').value;
        this.userInfo.contact = document.getElementById('contactNumber').value;
        this.userInfo.address = document.getElementById('address').value;
        this.userInfo.state = document.getElementById('state').value;

        console.log("User info:", this.userInfo);

        if (this.validateUserInfo()) {
            this.saveQuizData();
        }
    }

    // Validate user information
    validateUserInfo() {
        if (!this.userInfo.name || !this.userInfo.contact || !this.userInfo.address || !this.userInfo.state) {
            alert('براہ کرم تمام فیلڈز پُر کریں');
            return false;
        }
        return true;
    }

    // Share on WhatsApp with custom message
    shareOnWhatsApp() {
        const message = `🌙 *Islamic Quiz Challenge* 🌙

I scored ${this.score}/100 in Islamic Quiz! Can you beat me? 🏆

I challenge you to test your Islamic knowledge! 
Can you beat my score? 

🔗 Take the quiz here: ${window.location.href}`;

        const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    }

    // Share on Facebook
    shareOnFacebook() {
        const message = `🌙 Islamic Quiz Challenge 🌙\n\nI scored ${this.score}/100 in Islamic Quiz! Can you beat me? 🏆`;
        const url = `https://www.facebook.com/sharer/sharer.php?quote=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    }

    // Download Score as Image
    downloadScoreImage() {
        // This requires html2canvas library
        alert("تصویر ڈاؤن لوڈ کرنے کے لیے html2canvas لائبریری شامل کریں");
    }

    // Save quiz data to Google Sheets
    saveQuizData() {
        const quizData = {
            name: this.userInfo.name,
            contact: this.userInfo.contact,
            address: this.userInfo.address,
            state: this.userInfo.state,
            score: this.score,
            totalQuestions: 5,
            timestamp: new Date().toISOString(),
            shareLink: `https://wa.me/?text=🌙 Islamic Quiz - I scored ${this.score}/100! 🏆 Test your knowledge: ${window.location.href}`
        };

        console.log('Quiz Data:', quizData);
        this.sendToGoogleSheets(quizData);
    }

    // Send data to Google Sheets
    sendToGoogleSheets(quizData) {
        const scriptURL = 'https://script.google.com/macros/s/AKfycbykadcKkBOa8CP6CmPcffQqZ4qu1K5j0h2hZKJ8qFm7lJ0DrC3jEw5tfY_EFY0m81Rw/exec';
        
        // Show loading
        const submitBtn = document.querySelector('#userInfoForm button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Saving...';
        submitBtn.disabled = true;

        // Create form data
        const formData = new FormData();
        formData.append('name', quizData.name);
        formData.append('contact', quizData.contact);
        formData.append('address', quizData.address);
        formData.append('state', quizData.state);
        formData.append('score', quizData.score);
        formData.append('timestamp', quizData.timestamp);
        formData.append('shareLink', quizData.shareLink);

        fetch(scriptURL, {
            method: 'POST',
            body: formData
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.text();
        })
        .then(data => {
            console.log('Success:', data);
            alert('آپ کی معلومات کامیابی سے محفوظ ہو گئی ہیں! شکریہ۔');
            
            // Update leaderboard with name
            this.updateLeaderboardWithName();
            
            // Reset button
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        })
        .catch((error) => {
            console.error('Error:', error);
            alert('ڈیٹا محفوظ کرنے میں مسئلہ ہوا۔ براہ کرم دوبارہ کوشش کریں۔');
            
            // Reset button
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        });
    }

    // Update leaderboard with user name
    updateLeaderboardWithName() {
        let leaderboard = JSON.parse(localStorage.getItem('quizLeaderboard') || '[]');
        if (leaderboard.length > 0) {
            // Find the latest entry and add name
            const latestEntry = leaderboard[leaderboard.length - 1];
            latestEntry.name = this.userInfo.name;
            localStorage.setItem('quizLeaderboard', JSON.stringify(leaderboard));
            
            // Refresh leaderboard display
            this.updateLeaderboard();
        }
    }
}

// Initialize quiz when page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM fully loaded");
    const quiz = new Quiz();
    quiz.init();
});