class TestLab {
    constructor() {
        this.subjects = [];
        this.currentSubject = null;
        this.currentTestType = null;
        this.currentQuestions = [];
        this.currentQuestionIndex = 0;
        this.userAnswers = [];
        this.testStartTime = null;
        this.timer = null;
        this.timePerQuestion = 30; // seconds for timed tests
        this.timeLeft = 0;
        
        this.init();
    }

    async init() {
        await this.loadSubjects();
        this.setupEventListeners();
        this.showScreen('subject-screen', 'forward');
    }

    async loadSubjects() {
        try {
            // Load subjects from tests folder
            const subjectFiles = [
                'matematicas.json',
                'ciencias.json', 
                'historia.json',
                'ingles.json'
            ];

            for (const file of subjectFiles) {
                try {
                    const response = await fetch(`tests/${file}`);
                    if (response.ok) {
                        const data = await response.json();
                        this.subjects.push({
                            id: file.replace('.json', ''),
                            name: data.name || file.replace('.json', '').charAt(0).toUpperCase() + file.slice(1, -5),
                            icon: data.icon || '📚',
                            description: data.description || `Test de ${data.name || file.replace('.json', '')}`,
                            questions: data.questions || []
                        });
                    }
                } catch (error) {
                    console.warn(`Could not load ${file}:`, error);
                }
            }

            // If no subjects loaded, create sample data
            if (this.subjects.length === 0) {
                this.createSampleSubjects();
            }

            this.renderSubjects();
        } catch (error) {
            console.error('Error loading subjects:', error);
            this.createSampleSubjects();
            this.renderSubjects();
        }
    }

    createSampleSubjects() {
        this.subjects = [
            {
                id: 'matematicas',
                name: 'Matemáticas',
                icon: 'https://cdn.lordicon.com/veoexymv.json',
                description: 'Álgebra, geometría y cálculo básico',
                questions: [
                    {
                        question: '¿Cuál es el resultado de 2 + 2?',
                        options: ['3', '4', '5', '6'],
                        correctAnswer: 1,
                        explanation: 'La suma de 2 + 2 es igual a 4. Es una operación aritmética básica.'
                    },
                    {
                        question: '¿Cuál es el valor de π (pi) aproximadamente?',
                        options: ['3.14', '2.71', '4.20', '1.41'],
                        correctAnswer: 0,
                        explanation: 'Pi (π) es aproximadamente 3.14159... Es la relación entre la circunferencia de un círculo y su diámetro.'
                    },
                    {
                        question: '¿Cuánto es 5 × 7?',
                        options: ['30', '32', '35', '37'],
                        correctAnswer: 2,
                        explanation: '5 multiplicado por 7 es igual a 35.'
                    }
                ]
            },
            {
                id: 'ciencias',
                name: 'Ciencias',
                icon: 'https://cdn.lordicon.com/zpxybbhl.json',
                description: 'Física, química y biología',
                questions: [
                    {
                        question: '¿Cuál es el símbolo químico del agua?',
                        options: ['H2O', 'HO2', 'O2H', 'OH2'],
                        correctAnswer: 0,
                        explanation: 'El agua tiene la fórmula química H2O, que significa dos átomos de hidrógeno y uno de oxígeno.'
                    },
                    {
                        question: '¿A qué velocidad se propaga la luz en el vacío?',
                        options: ['300,000 km/h', '300,000 km/s', '30,000 km/s', '3,000,000 km/s'],
                        correctAnswer: 1,
                        explanation: 'La velocidad de la luz en el vacío es aproximadamente 300,000 kilómetros por segundo.'
                    }
                ]
            },
            {
                id: 'historia',
                name: 'Historia',
                icon: 'https://cdn.lordicon.com/wzwygmng.json',
                description: 'Historia universal y nacional',
                questions: [
                    {
                        question: '¿En qué año comenzó la Segunda Guerra Mundial?',
                        options: ['1938', '1939', '1940', '1941'],
                        correctAnswer: 1,
                        explanation: 'La Segunda Guerra Mundial comenzó el 1 de septiembre de 1939 con la invasión alemana de Polonia.'
                    },
                    {
                        question: '¿Quién fue el primer hombre en pisar la Luna?',
                        options: ['Buzz Aldrin', 'Neil Armstrong', 'John Glenn', 'Alan Shepard'],
                        correctAnswer: 1,
                        explanation: 'Neil Armstrong fue el primer ser humano en pisar la Luna el 20 de julio de 1969.'
                    }
                ]
            }
        ];
    }

    renderSubjects() {
        const subjectsGrid = document.getElementById('subjects-grid');
        subjectsGrid.innerHTML = '';

        this.subjects.forEach((subject, index) => {
            const subjectCard = document.createElement('div');
            subjectCard.className = 'subject-card animate__animated animate__bounceIn';
            subjectCard.style.animationDelay = `${index * 0.1}s`;
            subjectCard.dataset.subjectId = subject.id;
            
            subjectCard.innerHTML = `
                <div class="subject-icon">
                    <lord-icon
                        src="${subject.icon}"
                        trigger="hover"
                        style="width:100px;height:100px">
                    </lord-icon>
                </div>
                <h3>${subject.name}</h3>
                <p>${subject.description}</p>
            `;

            subjectCard.addEventListener('click', () => this.selectSubject(subject.id));
            subjectsGrid.appendChild(subjectCard);
        });
    }

    setupEventListeners() {
        // Navigation buttons
        document.getElementById('back-to-subjects').addEventListener('click', () => {
            this.showScreen('subject-screen', 'backward');
        });

        document.getElementById('back-to-test-types').addEventListener('click', () => {
            this.showScreen('test-type-screen', 'backward');
        });

        document.getElementById('back-to-subjects-final').addEventListener('click', () => {
            this.showScreen('subject-screen', 'backward');
        });

        // Test type selection
        document.querySelectorAll('.test-type-card').forEach(card => {
            card.addEventListener('click', () => {
                const testType = card.dataset.type;
                this.selectTestType(testType);
            });
        });

        // Test actions
        document.getElementById('show-explanation').addEventListener('click', () => {
            this.showExplanation();
        });

        document.getElementById('next-question').addEventListener('click', () => {
            this.nextQuestion();
        });

        document.getElementById('restart-test').addEventListener('click', () => {
            this.restartTest();
        });

        // Add button click animations
        document.querySelectorAll('button, .test-type-card, .subject-card').forEach(element => {
            element.addEventListener('click', () => {
                element.classList.add('animate__animated', 'animate__headShake');
                element.addEventListener('animationend', () => {
                    element.classList.remove('animate__animated', 'animate__headShake');
                }, { once: true });
            });
        });
    }

    showScreen(screenId, direction = 'forward') {
        const currentScreen = document.querySelector('.screen.active');
        const nextScreen = document.getElementById(screenId);

        if (currentScreen && currentScreen.id === screenId) return;

        const isInitialLoad = !currentScreen;

        let inAnimation, outAnimation;
        if (isInitialLoad) {
            inAnimation = 'animate__fadeIn';
            outAnimation = 'animate__fadeOut';
        } else {
            inAnimation = direction === 'forward' ? 'animate__slideInRight' : 'animate__slideInLeft';
            outAnimation = direction === 'forward' ? 'animate__slideOutLeft' : 'animate__slideOutRight';
        }
        
        if (currentScreen) {
            currentScreen.classList.add('animate__animated', outAnimation);
            currentScreen.addEventListener('animationend', () => {
                currentScreen.classList.remove('active');
                currentScreen.classList.remove('animate__animated', outAnimation);
            }, { once: true });
        }

        nextScreen.classList.add('active');
        nextScreen.classList.add('animate__animated', inAnimation);
        nextScreen.addEventListener('animationend', () => {
            nextScreen.classList.remove('animate__animated', inAnimation);
        }, { once: true });
    }

    selectSubject(subjectId) {
        this.currentSubject = this.subjects.find(s => s.id === subjectId);
        if (this.currentSubject) {
            document.getElementById('selected-subject-title').textContent = this.currentSubject.name;

            const testTypeCards = document.querySelectorAll('.test-type-card');
            testTypeCards.forEach((card, index) => {
                card.classList.add('animate__animated', 'animate__bounceIn');
                card.style.animationDelay = `${index * 0.1}s`;
            });

            this.showScreen('test-type-screen', 'forward');
        }
    }

    selectTestType(testType) {
        this.currentTestType = testType;
        this.prepareTest();
        this.showScreen('test-screen', 'forward');
        this.startTest();
    }

    prepareTest() {
        let questions = [...this.currentSubject.questions];

        switch (this.currentTestType) {
            case 'sequential':
                // Keep original order
                break;
            case 'random':
                questions = this.shuffleArray(questions);
                break;
            case 'errors':
                // For demo, we'll use all questions but could filter previously failed ones
                questions = this.shuffleArray(questions);
                break;
            case 'timed':
                questions = this.shuffleArray(questions);
                this.timePerQuestion = 30; // 30 seconds per question
                break;
        }

        this.currentQuestions = questions;
        this.currentQuestionIndex = 0;
        this.userAnswers = [];
    }

    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    startTest() {
        this.testStartTime = Date.now();
        
        // Setup timer for timed tests
        if (this.currentTestType === 'timed') {
            document.getElementById('test-timer').style.display = 'flex';
        } else {
            document.getElementById('test-timer').style.display = 'none';
        }

        this.displayQuestion();
    }

    displayQuestion() {
        if (this.currentQuestionIndex >= this.currentQuestions.length) {
            this.finishTest();
            return;
        }

        const question = this.currentQuestions[this.currentQuestionIndex];
        
        // Update progress
        document.getElementById('current-question').textContent = this.currentQuestionIndex + 1;
        document.getElementById('total-questions').textContent = this.currentQuestions.length;

        // Animate and display question
        const questionCard = document.querySelector('#test-screen .question-card');
        questionCard.classList.add('animate__animated', 'animate__slideInLeft');
        questionCard.addEventListener('animationend', () => {
            questionCard.classList.remove('animate__animated', 'animate__slideInLeft');
        }, { once: true });

        document.getElementById('question-text').textContent = question.question;
        
        // Handle question image if exists
        const questionImage = document.getElementById('question-image');
        const questionImg = document.getElementById('question-img');
        if (question.image) {
            questionImg.src = question.image;
            questionImg.alt = 'Imagen de la pregunta';
            questionImage.style.display = 'block';
        } else {
            questionImage.style.display = 'none';
        }

        // Display answers
        this.displayAnswers(question);

        // Hide elements that should not be visible initially
        document.getElementById('question-explanation').style.display = 'none';
        document.getElementById('show-explanation').style.display = 'none';
        document.getElementById('next-question').disabled = true;

        // Start timer for timed tests
        if (this.currentTestType === 'timed') {
            this.startQuestionTimer();
        }
    }

    displayAnswers(question) {
        const answersContainer = document.getElementById('answers-container');
        answersContainer.innerHTML = '';

        question.options.forEach((option, index) => {
            const answerOption = document.createElement('div');
            answerOption.className = 'answer-option';
            answerOption.dataset.answerIndex = index;

            answerOption.innerHTML = `
                <div class="option-letter">${String.fromCharCode(65 + index)}</div>
                <div class="option-text">${option}</div>
            `;

            answerOption.addEventListener('click', () => this.selectAnswer(index));
            answersContainer.appendChild(answerOption);
        });
    }

    selectAnswer(answerIndex) {
        // Remove previous selections
        document.querySelectorAll('.answer-option').forEach(option => {
            option.classList.remove('selected');
        });

        // Mark selected answer
        const selectedOption = document.querySelector(`.answer-option[data-answer-index="${answerIndex}"]`);
        selectedOption.classList.add('selected');

        // Store user answer
        this.userAnswers[this.currentQuestionIndex] = answerIndex;

        // Enable next button and show explanation button
        document.getElementById('next-question').disabled = false;
        document.getElementById('show-explanation').style.display = 'inline-block';

        // Show correct/incorrect feedback
        this.showAnswerFeedback();

        // Stop timer if timed test
        if (this.currentTestType === 'timed') {
            this.stopQuestionTimer();
        }
    }

    showAnswerFeedback() {
        const question = this.currentQuestions[this.currentQuestionIndex];
        const userAnswer = this.userAnswers[this.currentQuestionIndex];

        document.querySelectorAll('.answer-option').forEach((option, index) => {
            const isCorrect = index === question.correctAnswer;
            const isUserChoice = index === userAnswer;

            if (isCorrect) {
                option.classList.add('correct', 'animate__animated', 'animate__tada');
            } else if (isUserChoice && !isCorrect) {
                option.classList.add('incorrect', 'animate__animated', 'animate__wobble');
            }
            
            // Disable further clicking
            option.style.pointerEvents = 'none';

            // Clean up animation classes after they finish
            option.addEventListener('animationend', () => {
                option.classList.remove('animate__animated', 'animate__tada', 'animate__wobble');
            }, { once: true });
        });
    }

    showExplanation() {
        const question = this.currentQuestions[this.currentQuestionIndex];
        const explanationElement = document.getElementById('question-explanation');
        const explanationText = document.getElementById('explanation-text');

        if (question.explanation) {
            explanationText.textContent = question.explanation;
            explanationElement.style.display = 'block';
        }

        // Hide the explanation button after clicking
        document.getElementById('show-explanation').style.display = 'none';
    }

    startQuestionTimer() {
        this.timeLeft = this.timePerQuestion;
        this.updateTimerDisplay();

        this.timer = setInterval(() => {
            this.timeLeft--;
            this.updateTimerDisplay();

            if (this.timeLeft <= 0) {
                this.timeOut();
            }
        }, 1000);
    }

    stopQuestionTimer() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    updateTimerDisplay() {
        const minutes = Math.floor(this.timeLeft / 60);
        const seconds = this.timeLeft % 60;
        const display = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        document.getElementById('timer-display').textContent = display;

        // Change color when time is running out
        const timerElement = document.getElementById('test-timer');
        if (this.timeLeft <= 10) {
            timerElement.style.color = 'var(--error-color)';
        } else if (this.timeLeft <= 20) {
            timerElement.style.color = 'var(--warning-color)';
        }
    }

    timeOut() {
        this.stopQuestionTimer();
        
        // If no answer was selected, mark as incorrect
        if (this.userAnswers[this.currentQuestionIndex] === undefined) {
            this.userAnswers[this.currentQuestionIndex] = -1; // Mark as timeout
        }

        this.showAnswerFeedback();
        document.getElementById('next-question').disabled = false;
        document.getElementById('show-explanation').style.display = 'inline-block';
    }

    nextQuestion() {
        this.currentQuestionIndex++;
        
        // Re-enable answer options for next question
        document.querySelectorAll('.answer-option').forEach(option => {
            option.style.pointerEvents = 'auto';
        });

        this.displayQuestion();
    }

    finishTest() {
        this.stopQuestionTimer();
        this.showResults();
        this.showScreen('results-screen', 'forward');
    }

    showResults() {
        const totalQuestions = this.currentQuestions.length;
        const correctAnswers = this.userAnswers.reduce((count, answer, index) => {
            return count + (answer === this.currentQuestions[index].correctAnswer ? 1 : 0);
        }, 0);

        const percentage = Math.round((correctAnswers / totalQuestions) * 100);
        const testDuration = this.formatTime(Date.now() - this.testStartTime);

        // Update results display
        document.getElementById('score-percentage').textContent = `${percentage}%`;
        document.getElementById('correct-answers').textContent = `${correctAnswers}/${totalQuestions}`;
        document.getElementById('time-taken').textContent = testDuration;

        // Update results icon and title based on performance
        const resultsIconContainer = document.getElementById('results-icon');
        const resultsTitle = document.getElementById('results-title');
        const resultsContent = document.querySelector('.results-content');
        resultsContent.classList.remove('success-animation');

        let iconSrc = '';
        if (percentage >= 90) {
            iconSrc = 'https://cdn.lordicon.com/trovagwf.json';
            resultsTitle.textContent = '¡Excelente trabajo!';
            resultsContent.classList.add('success-animation');
        } else if (percentage >= 70) {
            iconSrc = 'https://cdn.lordicon.com/soseozvi.json';
            resultsTitle.textContent = '¡Bien hecho!';
        } else if (percentage >= 50) {
            iconSrc = 'https://cdn.lordicon.com/xyboiuok.json';
            resultsTitle.textContent = '¡Buen intento!';
        } else {
            iconSrc = 'https://cdn.lordicon.com/wxnxiano.json';
            resultsTitle.textContent = '¡Sigue practicando!';
        }

        resultsIconContainer.innerHTML = `
            <lord-icon
                src="${iconSrc}"
                trigger="loop"
                delay="1000"
                style="width:150px;height:150px">
            </lord-icon>
        `;
    }

    formatTime(milliseconds) {
        const totalSeconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    restartTest() {
        this.prepareTest();
        this.startTest();
        this.showScreen('test-screen', 'forward');
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TestLab();
});