// script.js - Complete Solution

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
        this.isSecondPhase = false;
        this.questionTimes = [];
        this.questionScores = [];
        this.selectedAnswers = [];
        this.quizQuestions = [];
        this.hasPlayedToday = this.checkDailyPlay();
        console.log("Quiz class initialized");
    }

    // Check if user already played today
    checkDailyPlay() {
        const lastPlay = localStorage.getItem('lastQuizPlay');
        if (lastPlay) {
            const lastPlayDate = new Date(lastPlay);
            const today = new Date();
            const diffTime = Math.abs(today - lastPlayDate);
            const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
            return diffHours < 23;
        }
        return false;
    }

    // Initialize the quiz
    init() {
        console.log("Initializing quiz...");
        this.showScreen('welcomeScreen');
        this.setupEventListeners();
        
        if (this.hasPlayedToday) {
            document.getElementById('startQuiz').disabled = true;
            document.querySelector('.daily-notice p').textContent = 
                "📅 You can play again after 23 hours!";
        }
    }

    // Show specific screen
    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        document.getElementById(screenId).classList.add('active');
    }

    // Setup event listeners
    setupEventListeners() {
        // Welcome screen buttons
        document.getElementById('startQuiz').addEventListener('click', () => {
            if (!this.hasPlayedToday) {
                this.startQuiz();
            }
        });

        document.getElementById('viewLeaderboard').addEventListener('click', () => {
            this.showLeaderboard();
        });

        document.getElementById('viewScoreboard').addEventListener('click', () => {
            this.showScoreboard();
        });

        // Back to home buttons
        document.querySelectorAll('.back-to-home').forEach(btn => {
            btn.addEventListener('click', () => {
                this.showScreen('welcomeScreen');
            });
        });

        // Quiz buttons
        document.getElementById('nextQuestion').addEventListener('click', () => {
            this.nextQuestion();
        });

        // Form submission
        document.getElementById('userInfoForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.collectUserInfo();
        });

        // Share buttons
        document.getElementById('shareWhatsApp').addEventListener('click', () => {
            this.shareOnWhatsApp();
        });

        document.getElementById('shareFacebook').addEventListener('click', () => {
            this.shareOnFacebook();
        });

        // Play again
        document.getElementById('playAgain').addEventListener('click', () => {
            this.showScreen('welcomeScreen');
        });
    }

    // Start the quiz
    startQuiz() {
        this.quizQuestions = getRandomQuestions();
        this.showScreen('quizScreen');
        this.currentQuestion = 0;
        this.score = 0;
        this.isSecondPhase = false;
        this.questionTimes = [];
        this.questionScores = [];
        this.selectedAnswers = [];
        this.displayQuestion();
    }

    // Display current question
    displayQuestion() {
        const question = this.quizQuestions[this.currentQuestion];
        document.getElementById('questionText').textContent = question.question;

        // Update progress
        const progress = ((this.currentQuestion) / 5) * 100;
        document.getElementById('progress').style.width = progress + '%';
        document.getElementById('questionCount').textContent = `Question ${this.currentQuestion + 1}/5`;

        // Clear and create options
        const optionsContainer = document.getElementById('optionsContainer');
        optionsContainer.innerHTML = '';

        question.options.forEach((option, index) => {
            const button = document.createElement('button');
            button.textContent = option;
            button.className = 'option-btn';
            button.addEventListener('click', () => {
                this.selectOption(index);
            });
            optionsContainer.appendChild(button);
        });

        // Start timer
        this.startTimer();
        document.getElementById('nextQuestion').disabled = true;
    }

    // Start timer for current question
    startTimer() {
        this.timeLeft = 10;
        this.isSecondPhase = false;
        document.getElementById('timer').textContent = this.timeLeft;
        document.getElementById('timer').style.background = '#25D366'; // Green
        
        if (this.timer) clearInterval(this.timer);

        this.timer = setInterval(() => {
            this.timeLeft--;
            document.getElementById('timer').textContent = this.timeLeft;
            
            if (this.timeLeft === 0 && !this.isSecondPhase) {
                // Switch to second phase
                this.isSecondPhase = true;
                this.timeLeft = 1;
                document.getElementById('timer').style.background = '#ff4444'; // Red
            } else if (this.isSecondPhase) {
                this.timeLeft++;
                if (this.timeLeft > 10) {
                    clearInterval(this.timer);
                    this.nextQuestion();
                }
            }
            
            if (this.timeLeft <= 3 && !this.isSecondPhase) {
                document.getElementById('timer').style.background = '#ffaa00'; // Orange
            }
        }, 1000);
    }

    // Handle option selection
    selectOption(selectedIndex) {
        clearInterval(this.timer);
        
        const question = this.quizQuestions[this.currentQuestion];
        const options = document.querySelectorAll('.option-btn');
        
        // Deselect all options and select current
        options.forEach((option, index) => {
            option.classList.remove('selected');
            if (index === selectedIndex) {
                option.classList.add('selected');
            }
        });

        // Calculate score
        let questionScore = 20;
        if (this.isSecondPhase) {
            questionScore = Math.max(0, 20 - ((this.timeLeft - 1) * 2));
        }

        // Store question data
        this.questionTimes.push(this.timeLeft);
        this.selectedAnswers.push(selectedIndex);
        
        const isCorrect = selectedIndex === question.correct;
        if (isCorrect) {
            this.score += questionScore;
            this.questionScores.push(questionScore);
        } else {
            this.questionScores.push(0);
        }

        console.log(`Question ${this.currentQuestion + 1}: Time: ${this.timeLeft}s, Score: +${isCorrect ? questionScore : 0}, Total: ${this.score}`);

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
        localStorage.setItem('lastQuizPlay', new Date().toISOString());
        this.showScreen('resultScreen');
        this.displayResults();
    }

    // Display results
    displayResults() {
        document.getElementById('finalScore').textContent = this.score;
        
        let message = '';
        if (this.score >= 80) {
            message = 'Excellent! You have great Islamic knowledge. 🎉';
        } else if (this.score >= 60) {
            message = 'Good job! Your Islamic knowledge is impressive. 👍';
        } else if (this.score >= 40) {
            message = 'Fair! Keep learning more about Islam. 📚';
        } else {
            message = 'Keep studying! Islam has vast knowledge to explore. 🌟';
        }

        document.getElementById('resultMessage').innerHTML = `
            <h3>Congratulations!</h3>
            <p>${message}</p>
            <p><strong>Your Score: ${this.score}/100</strong></p>
        `;
    }

    // Collect user information
    collectUserInfo() {
        this.userInfo.name = document.getElementById('fullName').value;
        this.userInfo.contact = document.getElementById('contactNumber').value;
        this.userInfo.address = document.getElementById('address').value;
        this.userInfo.state = document.getElementById('state').value;

        if (this.validateUserInfo()) {
            this.saveQuizData();
            this.showFullScore();
        }
    }

    // Validate user information
    validateUserInfo() {
        if (!this.userInfo.name || !this.userInfo.contact || !this.userInfo.address || !this.userInfo.state) {
            alert('Please fill all fields');
            return false;
        }
        return true;
    }

    // Show full detailed score
    showFullScore() {
        this.showScreen('fullScoreScreen');
        document.getElementById('detailedFinalScore').textContent = this.score;
        
        let message = '';
        if (this.score >= 80) {
            message = 'Masha Allah! You have excellent Islamic knowledge. You are among the top performers!';
        } else if (this.score >= 60) {
            message = 'Congratulations! You have good Islamic knowledge. Keep learning and improving!';
        } else if (this.score >= 40) {
            message = 'Good effort! Your Islamic knowledge is developing. Try again to improve your score!';
        } else {
            message = 'Nice try! Islamic knowledge is vast. Study more and try again tomorrow!';
        }

        document.getElementById('detailedResultMessage').innerHTML = `
            <h3>${this.score >= 60 ? '🎉 Excellent Work!' : '💪 Keep Learning!'}</h3>
            <p>${message}</p>
            <p><strong>Final Score: ${this.score}/100</strong></p>
        `;

        // Display question breakdown
        this.displayQuestionBreakdown();
    }

    // Display question-wise breakdown
    displayQuestionBreakdown() {
        const breakdownContainer = document.getElementById('questionBreakdown');
        breakdownContainer.innerHTML = '';

        this.quizQuestions.forEach((question, index) => {
            const isCorrect = this.selectedAnswers[index] === question.correct;
            const timeTaken = this.questionTimes[index];
            const scoreEarned = this.questionScores[index];
            const maxScore = 20;

            const breakdownItem = document.createElement('div');
            breakdownItem.className = `question-breakdown-item ${isCorrect ? 'correct' : 'incorrect'}`;
            breakdownItem.innerHTML = `
                <h4>Question ${index + 1}: ${question.question}</h4>
                <p><strong>Your Answer:</strong> ${question.options[this.selectedAnswers[index]]}</p>
                <p><strong>Correct Answer:</strong> ${question.options[question.correct]}</p>
                <p><strong>Time Taken:</strong> ${timeTaken} seconds</p>
                <p><strong>Score:</strong> ${scoreEarned}/${maxScore} points</p>
                ${!isCorrect ? '<p style="color: #ff4444;">Incorrect answer: 0 points</p>' : 
                  timeTaken > 10 ? `<p style="color: #ff4444;">Time penalty: -${maxScore - scoreEarned} points</p>` : 
                  '<p style="color: #25D366;">Perfect timing: Full points!</p>'}
            `;
            breakdownContainer.appendChild(breakdownItem);
        });
    }

    // Show leaderboard
    showLeaderboard() {
        this.showScreen('leaderboardScreen');
        this.updateLeaderboard();
    }

    // Show user scoreboard
    showScoreboard() {
        this.showScreen('scoreboardScreen');
        this.updateUserScoreboard();
    }

    // Update leaderboard
    updateLeaderboard() {
        const leaderboard = JSON.parse(localStorage.getItem('quizLeaderboard') || '[]');
        const leaderboardContainer = document.getElementById('globalLeaderboard');
        
        if (leaderboard.length === 0) {
            leaderboardContainer.innerHTML = '<p>No scores yet. Be the first to play!</p>';
            return;
        }

        const top10 = leaderboard.sort((a, b) => b.score - a.score).slice(0, 10);
        leaderboardContainer.innerHTML = top10.map((entry, index) => `
            <div class="leaderboard-item">
                <span>${index + 1}. ${entry.name || 'Anonymous'}</span>
                <span>${entry.score} points</span>
            </div>
        `).join('');
    }

    // Update user scoreboard
    updateUserScoreboard() {
        const userScores = JSON.parse(localStorage.getItem('userScores') || '[]');
        const scoreboardContainer = document.getElementById('userScoreboard');
        
        if (userScores.length === 0) {
            scoreboardContainer.innerHTML = '<p>No previous scores found.</p>';
            return;
        }

        scoreboardContainer.innerHTML = userScores.map((entry, index) => `
            <div class="leaderboard-item">
                <span>${new Date(entry.timestamp).toLocaleDateString()}</span>
                <span>${entry.score} points</span>
            </div>
        `).join('');
    }

    // Share on WhatsApp
    shareOnWhatsApp() {
        const message = `🌙 *Islamic Quiz Challenge* 🌙

I scored ${this.score}/100 in Islamic Quiz! 🏆

${this.score >= 80 ? "Masha Allah! I have excellent Islamic knowledge!" : 
  this.score >= 60 ? "Alhamdulillah! I have good Islamic knowledge!" :
  this.score >= 40 ? "Alhamdulillah! I'm learning more about Islam!" :
  "Insha Allah I will improve my Islamic knowledge!"}

Can you beat my score? Test your Islamic knowledge!

🔗 Take the quiz here: ${window.location.href}`;

        const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    }

    // Share on Facebook
    shareOnFacebook() {
        const message = `🌙 Islamic Quiz Challenge 🌙\n\nI scored ${this.score}/100 in Islamic Quiz! 🏆\n\nCan you beat my score? Test your Islamic knowledge!`;
        const url = `https://www.facebook.com/sharer/sharer.php?quote=${encodeURIComponent(message)}&u=${encodeURIComponent(window.location.href)}`;
        window.open(url, '_blank');
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

        // Save to Google Sheets
        this.sendToGoogleSheets(quizData);
        
        // Save to local storage for leaderboard
        this.saveToLocalStorage(quizData);
    }

    // Send data to Google Sheets
    sendToGoogleSheets(quizData) {
        const scriptURL = 'https://script.google.com/macros/s/AKfycbykadcKkBOa8CP6CmPcffQqZ4qu1K5j0h2hZKJ8qFm7lJ0DrC3jEw5tfY_EFY0m81Rw/exec';
        
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
        .then(response => response.text())
        .then(data => {
            console.log('Success:', data);
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    }

    // Save to local storage
    saveToLocalStorage(quizData) {
        // Save to leaderboard
        let leaderboard = JSON.parse(localStorage.getItem('quizLeaderboard') || '[]');
        leaderboard.push({
            name: quizData.name,
            score: quizData.score,
            timestamp: quizData.timestamp
        });
        localStorage.setItem('quizLeaderboard', JSON.stringify(leaderboard));

        // Save to user scores
        let userScores = JSON.parse(localStorage.getItem('userScores') || '[]');
        userScores.push({
            score: quizData.score,
            timestamp: quizData.timestamp
        });
        localStorage.setItem('userScores', JSON.stringify(userScores));
    }
}

// Initialize quiz when page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM fully loaded");
    const quiz = new Quiz();
    quiz.init();
});