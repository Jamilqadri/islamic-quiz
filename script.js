// script.js - Complete Solution with Google Sheets Leaderboard

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
        this.countdownInterval = null;
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
            return diffHours < 15;
        }
        return false;
    }

    // Update countdown timer
    updateCountdown() {
        const lastPlay = localStorage.getItem('lastQuizPlay');
        if (lastPlay) {
            const lastPlayDate = new Date(lastPlay);
            const now = new Date();
            const nextPlayTime = new Date(lastPlayDate.getTime() + (15 * 60 * 60 * 1000));
            const timeLeft = nextPlayTime - now;

            if (timeLeft > 0) {
                const hours = Math.floor(timeLeft / (1000 * 60 * 60));
                const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
                document.querySelector('.daily-notice p').textContent = 
                    `⏳ You can play again in ${hours}h ${minutes}m`;
            } else {
                document.querySelector('.daily-notice p').textContent = 
                    "✅ You can play now!";
                this.hasPlayedToday = false;
                document.getElementById('startQuiz').disabled = false;
            }
        }
    }

    // Initialize the quiz
    init() {
        console.log("Initializing quiz...");
        this.showScreen('welcomeScreen');
        this.setupEventListeners();
        
        this.updateCountdown();
        this.countdownInterval = setInterval(() => {
            this.updateCountdown();
        }, 60000);

        if (this.hasPlayedToday) {
            document.getElementById('startQuiz').disabled = true;
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

        document.querySelectorAll('.back-to-home').forEach(btn => {
            btn.addEventListener('click', () => {
                this.showScreen('welcomeScreen');
            });
        });

        document.getElementById('nextQuestion').addEventListener('click', () => {
            this.nextQuestion();
        });

        document.getElementById('userInfoForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.collectUserInfo();
        });

        document.getElementById('shareWhatsApp').addEventListener('click', () => {
            this.shareOnWhatsApp();
        });

        document.getElementById('shareFacebook').addEventListener('click', () => {
            this.shareOnFacebook();
        });

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
                this.selectOption(index);
            });
            optionsContainer.appendChild(button);
        });

        this.startTimer();
        document.getElementById('nextQuestion').disabled = true;
    }

    // Start timer for current question
    startTimer() {
        this.timeLeft = 10;
        this.isSecondPhase = false;
        document.getElementById('timer').textContent = this.timeLeft;
        document.getElementById('timer').style.background = '#25D366';
        
        if (this.timer) clearInterval(this.timer);

        this.timer = setInterval(() => {
            if (!this.isSecondPhase) {
                this.timeLeft--;
                document.getElementById('timer').textContent = this.timeLeft;
                
                if (this.timeLeft <= 3) {
                    document.getElementById('timer').style.background = '#ff4444';
                } else if (this.timeLeft <= 7) {
                    document.getElementById('timer').style.background = '#ffaa00';
                }
                
                if (this.timeLeft === 0) {
                    this.isSecondPhase = true;
                    this.timeLeft = 1;
                    document.getElementById('timer').style.background = '#ff4444';
                }
            } else {
                this.timeLeft++;
                document.getElementById('timer').textContent = this.timeLeft;
                
                if (this.timeLeft > 10) {
                    clearInterval(this.timer);
                    this.nextQuestion();
                }
            }
        }, 1000);
    }

    // Handle option selection
    selectOption(selectedIndex) {
        const question = this.quizQuestions[this.currentQuestion];
        const options = document.querySelectorAll('.option-btn');
        
        options.forEach((option, index) => {
            option.classList.remove('selected');
            if (index === selectedIndex) {
                option.classList.add('selected');
            }
        });

        this.selectedAnswers[this.currentQuestion] = selectedIndex;
        document.getElementById('nextQuestion').disabled = false;
    }

    // Move to next question
    nextQuestion() {
        this.calculateCurrentQuestionScore();
        
        this.currentQuestion++;
        if (this.currentQuestion < 5) {
            this.displayQuestion();
        } else {
            this.endQuiz();
        }
    }

    // Calculate score for current question
    calculateCurrentQuestionScore() {
        const question = this.quizQuestions[this.currentQuestion];
        const selectedIndex = this.selectedAnswers[this.currentQuestion];
        
        if (selectedIndex !== undefined) {
            let questionScore = 20;
            if (this.isSecondPhase) {
                questionScore = Math.max(0, 20 - ((this.timeLeft - 1) * 2));
            }

            this.questionTimes[this.currentQuestion] = this.timeLeft;
            
            const isCorrect = selectedIndex === question.correct;
            if (isCorrect) {
                this.score += questionScore;
                this.questionScores[this.currentQuestion] = questionScore;
            } else {
                this.questionScores[this.currentQuestion] = 0;
            }
        } else {
            this.questionTimes[this.currentQuestion] = this.timeLeft;
            this.questionScores[this.currentQuestion] = 0;
        }

        if (this.timer) {
            clearInterval(this.timer);
        }
    }

    // End quiz and show results
    endQuiz() {
        if (this.countdownInterval) {
            clearInterval(this.countdownInterval);
        }

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

        this.displayQuestionBreakdown();
    }

    // Display question-wise breakdown
    displayQuestionBreakdown() {
        const breakdownContainer = document.getElementById('questionBreakdown');
        breakdownContainer.innerHTML = '';

        this.quizQuestions.forEach((question, index) => {
            const isCorrect = this.selectedAnswers[index] === question.correct;
            const timeTaken = this.questionTimes[index];
            const scoreEarned = this.questionScores[index] || 0;
            const maxScore = 20;

            const breakdownItem = document.createElement('div');
            breakdownItem.className = `question-breakdown-item ${isCorrect ? 'correct' : 'incorrect'}`;
            
            let timeInfo = '';
            if (timeTaken <= 10) {
                timeInfo = `<p style="color: #25D366;">Answered in ${timeTaken}s: Full points!</p>`;
            } else {
                timeInfo = `<p style="color: #ff4444;">Time penalty: Answered in ${timeTaken}s (-${maxScore - scoreEarned} points)</p>`;
            }

            breakdownItem.innerHTML = `
                <h4>Question ${index + 1}: ${question.question}</h4>
                <p><strong>Your Answer:</strong> ${this.selectedAnswers[index] !== undefined ? question.options[this.selectedAnswers[index]] : 'Not answered'}</p>
                <p><strong>Correct Answer:</strong> ${question.options[question.correct]}</p>
                <p><strong>Time Taken:</strong> ${timeTaken} seconds</p>
                <p><strong>Score:</strong> ${scoreEarned}/${maxScore} points</p>
                ${timeInfo}
                ${!isCorrect ? '<p style="color: #ff4444;">Incorrect answer: 0 points</p>' : ''}
            `;
            breakdownContainer.appendChild(breakdownItem);
        });
    }

    // Show leaderboard - FROM GOOGLE SHEETS
    showLeaderboard() {
        this.showScreen('leaderboardScreen');
        this.updateLeaderboardFromSheets();
    }

    // Update leaderboard from Google Sheets
    updateLeaderboardFromSheets() {
        const scriptURL = 'https://script.google.com/macros/s/AKfycbykadcKkBOa8CP6CmPcffQqZ4qu1K5j0h2hZKJ8qFm7lJ0DrC3jEw5tfY_EFY0m81Rw/exec';
        
        // Show loading
        const leaderboardContainer = document.getElementById('globalLeaderboard');
        leaderboardContainer.innerHTML = '<p>Loading leaderboard...</p>';

        fetch(scriptURL + '?function=getLeaderboard')
        .then(response => response.json())
        .then(data => {
            if (data.success && data.leaderboard) {
                this.displayLeaderboard(data.leaderboard);
            } else {
                this.displayLeaderboard([]);
            }
        })
        .catch(error => {
            console.error('Leaderboard fetch error:', error);
            this.displayLeaderboard([]);
        });
    }

    // Display leaderboard
    displayLeaderboard(leaderboardData) {
        const leaderboardContainer = document.getElementById('globalLeaderboard');
        
        if (!leaderboardData || leaderboardData.length === 0) {
            leaderboardContainer.innerHTML = '<p>No scores yet. Be the first to play!</p>';
            return;
        }

        const leaderboardHTML = leaderboardData.map(entry => `
            <div class="leaderboard-item">
                <div>
                    <strong>${entry.rank}. ${entry.name}</strong>
                    <br>
                    <small>${entry.state}</small>
                </div>
                <span>${entry.score} points</span>
            </div>
        `).join('');
        
        leaderboardContainer.innerHTML = leaderboardHTML;
    }

    // Show user scoreboard
    showScoreboard() {
        this.showScreen('scoreboardScreen');
        this.updateUserScoreboard();
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

I got a PERFECT SCORE! Can you beat me? 🏆

🏆 My Score: ${this.score}/100
👤 Name: ${this.userInfo.name || 'Quiz Player'}

I challenge you to test your Islamic knowledge! 
Can you beat my score? 

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
            shareLink: `https://wa.me/?text=🌙 Islamic Quiz - I scored ${this.score}/100! 🏆`
        };

        console.log('Saving quiz data:', quizData);

        // Save to Google Sheets (silent)
        this.sendToGoogleSheets(quizData);
        
        // Save to local storage
        this.saveToLocalStorage(quizData);
        
        // Show full score immediately
        this.showFullScore();
    }

    // Send data to Google Sheets - SILENT VERSION
    sendToGoogleSheets(quizData) {
        const scriptURL = 'https://script.google.com/macros/s/AKfycbykadcKkBOa8CP6CmPcffQqZ4qu1K5j0h2hZKJ8qFm7lJ0DrC3jEw5tfY_EFY0m81Rw/exec';
        
        const params = new URLSearchParams({
            'name': quizData.name,
            'contact': quizData.contact,
            'address': quizData.address,
            'state': quizData.state,
            'score': quizData.score.toString(),
            'timestamp': quizData.timestamp,
            'shareLink': quizData.shareLink
        });

        const fullURL = `${scriptURL}?${params.toString()}`;
        
        // Send data silently
        fetch(fullURL, { mode: 'no-cors' })
        .then(() => console.log('✅ Data sent to Google Sheets'))
        .catch(() => console.log('✅ Data sent silently'));
    }

    // Save to local storage
    saveToLocalStorage(quizData) {
        let leaderboard = JSON.parse(localStorage.getItem('quizLeaderboard') || '[]');
        leaderboard.push({
            name: quizData.name,
            score: quizData.score,
            timestamp: quizData.timestamp
        });
        localStorage.setItem('quizLeaderboard', JSON.stringify(leaderboard));

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
