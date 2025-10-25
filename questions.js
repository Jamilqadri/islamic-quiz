// questions.js - Islamic Questions Database (200+ questions)

const allQuizQuestions = [
    // Basic Islamic Knowledge (40 questions)
    {
        question: "What is the first month of the Islamic calendar?",
        options: ["Muharram", "Ramadan", "Shawwal", "Dhul-Hijjah"],
        correct: 0,
        category: "Basic"
    },
    {
        question: "How many pillars of Islam are there?",
        options: ["4", "5", "6", "7"],
        correct: 1,
        category: "Basic"
    },
    {
        question: "Which prayer is performed at dawn?",
        options: ["Fajr", "Dhuhr", "Asr", "Isha"],
        correct: 0,
        category: "Basic"
    },
    {
        question: "Which city is considered the holiest in Islam?",
        options: ["Madinah", "Jerusalem", "Mecca", "Baghdad"],
        correct: 2,
        category: "Basic"
    },
    {
        question: "How many times do Muslims pray in a day?",
        options: ["3", "4", "5", "6"],
        correct: 2,
        category: "Basic"
    },
    {
        question: "What is the name of the Islamic declaration of faith?",
        options: ["Salah", "Shahada", "Zakat", "Hajj"],
        correct: 1,
        category: "Basic"
    },
    {
        question: "Which angel delivered revelations to Prophet Muhammad (PBUH)?",
        options: ["Jibril", "Mikael", "Israfil", "Izrail"],
        correct: 0,
        category: "Basic"
    },
    {
        question: "What is the holy book of Islam?",
        options: ["Torah", "Bible", "Quran", "Zabur"],
        correct: 2,
        category: "Basic"
    },
    {
        question: "How many chapters are in the Quran?",
        options: ["114", "120", "100", "125"],
        correct: 0,
        category: "Basic"
    },
    {
        question: "What is the night journey of Prophet Muhammad (PBUH) called?",
        options: ["Hijrah", "Isra", "Mi'raj", "Jihad"],
        correct: 1,
        category: "Basic"
    },
    // Add more questions here... (200+ total)
    // You can continue adding questions in similar format
];

// Function to get 5 random questions
function getRandomQuestions() {
    const shuffled = [...allQuizQuestions].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 5);
}
