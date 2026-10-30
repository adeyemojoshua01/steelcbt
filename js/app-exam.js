// ============================================================
// APP EXAM — state persistence, timer, question rendering, answers
// ============================================================

Object.assign(window.app, {

    // ============================================================
    // EXAM STATE PERSISTENCE
    // ============================================================

    saveExamState: function () {
        if (this.data.mode !== 'test') return;
        try {
            localStorage.setItem('cbt_exam_state', JSON.stringify({
                questions:        this.data.questions,
                userAnswers:      this.data.userAnswers,
                answerRevealed:   this.data.answerRevealed,
                currentIndex:     this.data.currentQuestionIndex,
                endTime:          this.data.endTime || null,
                examMode:         this.data.examMode,
                candidateName:    this.data.candidateName,
                currentSubjectId: this.data.currentSubjectId,
                examDuration:     this.data.examDuration,
                timeLeft:         this.data.timeLeft
            }));
        } catch (e) {
            console.warn('saveExamState failed:', e);
        }
    },

    clearExamState: function () {
        localStorage.removeItem('cbt_exam_state');
    },

    checkForSavedExam: function () {
        const raw = localStorage.getItem('cbt_exam_state');
        if (!raw) return false;

        let state;
        try { state = JSON.parse(raw); } catch { this.clearExamState(); return false; }

        if (state.examMode === 'practice' && state.endTime) {
            const remaining = Math.round((state.endTime - Date.now()) / 1000);
            if (remaining <= 0) { this.clearExamState(); return false; }
            state.timeLeft = remaining;
        }

        this._savedExamState = state;
        this.showResumePrompt(state);
        return true;
    },

    showResumePrompt: function (state) {
        this.data.mode = 'resume-prompt';
        this.updateHeader();

        const subjectName = this.data.subjects[state.currentSubjectId]?.name || 'Unknown';
        const answered = Object.keys(state.userAnswers || {}).filter(k =>
            state.userAnswers[k] !== undefined && state.userAnswers[k] !== ''
        ).length;

        document.getElementById('app-container').innerHTML = `
            <div class="flex items-center justify-center h-full">
                <div class="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
                    <div class="text-center mb-6">
                        <i class="fas fa-clock-rotate-left text-5xl text-blue-600 mb-3"></i>
                        <h2 class="text-2xl font-bold text-gray-800">Unfinished Exam Found</h2>
                        <p class="text-gray-500 mt-1">Would you like to resume?</p>
                    </div>

                    <div class="bg-gray-50 p-4 rounded mb-6 space-y-1 text-sm">
                        <p><span class="text-gray-500">Candidate:</span> <strong>${state.candidateName || '—'}</strong></p>
                        <p><span class="text-gray-500">Subject:</span> <strong>${subjectName}</strong></p>
                        <p><span class="text-gray-500">Mode:</span> <strong>${state.examMode}</strong></p>
                        <p><span class="text-gray-500">Progress:</span> <strong>${answered} / ${state.questions.length} answered</strong></p>
                    </div>

                    <div class="space-y-3">
                        <button onclick="event.preventDefault(); app.resumeSavedExam()"
                                class="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg">
                            <i class="fas fa-play mr-2"></i>Resume Exam
                        </button>
                        <button onclick="event.preventDefault(); app.discardSavedExam()"
                                class="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg">
                            <i class="fas fa-trash mr-2"></i>Discard & Start Fresh
                        </button>
                    </div>
                </div>
            </div>`;
    },

    resumeSavedExam: function () {
        const state = this._savedExamState;
        if (!state) { this.showLanding(); return; }

        this.data.questions            = state.questions;
        this.data.userAnswers          = state.userAnswers || {};
        this.data.answerRevealed       = state.answerRevealed || {};
        this.data.currentQuestionIndex = state.currentIndex || 0;
        this.data.examMode             = state.examMode;
        this.data.candidateName        = state.candidateName || '';
        this.data.currentSubjectId     = state.currentSubjectId;
        this.data.examDuration         = state.examDuration || 30;
        this.data.mode                 = 'test';
        this.data.answerRevealed       = state.answerRevealed || {};

        if (state.examMode === 'practice' && state.endTime) {
            this.data.timeLeft = Math.max(0, Math.round((state.endTime - Date.now()) / 1000));
            if (this.data.timeLeft <= 0) {
                this.clearExamState();
                this.submitTest();
                return;
            }
            this.startTimer();
        } else {
            this.data.timeLeft = 0;
        }

        this._savedExamState = null;
        this.showTestInterface();
    },

    discardSavedExam: function () {
        this.clearExamState();
        this._savedExamState = null;
        this.showLanding();
    },

    // ============================================================
    // START EXAM
    // ============================================================

    startTestPrep: function () {
        const nameInput = document.getElementById('candidate-name');
        const subjectInput = document.getElementById('exam-subject');

        if (nameInput) this.data.candidateName = nameInput.value;
        if (!subjectInput) { this.showNotification('No subject selected.', 'error'); return; }

        const subject = this.data.subjects[subjectInput.value];
        this.data.currentSubjectId = subjectInput.value;

        let customDurationMinutes = null;
        if (this.data.examMode === 'practice') {
            const customDurationInput = document.getElementById('custom-duration-input');
            if (customDurationInput && customDurationInput.value) {
                const parsed = parseInt(customDurationInput.value, 10);
                if (!isNaN(parsed) && parsed > 0 && parsed <= 999) {
                    customDurationMinutes = parsed;
                }
            }
        }

        const selectedTopics = [];
        const topicQuantityMap = {};

        document.querySelectorAll('input[name="exam-topic"]:checked').forEach(cb => {
            const topicId = cb.value;
            const qtyInput = document.querySelector(`.topic-quantity[data-topic-id="${topicId}"]`);
            let qty = qtyInput ? parseInt(qtyInput.value) : 0;
            if (isNaN(qty) || qty < 0) qty = 0;
            if (qty > 0) {
                selectedTopics.push(topicId);
                topicQuantityMap[topicId] = qty;
            }
        });

        let questionsToUse = [];

        if (selectedTopics.length === 0) {
            questionsToUse = [...subject.questions];
        } else {
            for (let topicId of selectedTopics) {
                const topicQuestions = subject.questions.filter(q => q.topicId === topicId);
                const requested = topicQuantityMap[topicId];
                if (topicQuestions.length === 0) continue;
                let numberOfQuestions = Math.min(requested, topicQuestions.length);
                if (numberOfQuestions <= 0) continue;
                const shuffled = [...topicQuestions];
                for (let i = shuffled.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
                }
                const selected = shuffled.slice(0, numberOfQuestions);
                questionsToUse.push(...selected);
            }
        }

        if (questionsToUse.length === 0) {
            this.showNotification("No questions available.", "error");
            return;
        }

        for (let i = questionsToUse.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [questionsToUse[i], questionsToUse[j]] = [questionsToUse[j], questionsToUse[i]];
        }

        this.data.questions = questionsToUse;

        if (this.data.examMode === 'practice') {
            if (customDurationMinutes !== null) {
                this.data.examDuration = customDurationMinutes;
            } else {
                this.data.examDuration = subject.duration;
            }
        }

        if (this.data.questions.length === 0) {
            this.showNotification("No questions set.", "error");
            return;
        }

        this.data.currentQuestionIndex = 0;
        this.data.userAnswers = {};
        this.data.answerRevealed = {};
        this.clearExamState();
        this.data.endTime = null;

        if (this.data.examMode === 'practice') {
            this.data.timeLeft = this.data.examDuration * 60;
            this.startTimer();
        } else {
            this.data.timeLeft = 0;
        }

        this.data.refreshLocked = true;
        document.body.style.overflow = 'hidden';
        document.documentElement.style.overflow = 'hidden';

        this.showTestInterface();
    },

    // ============================================================
    // TIMER
    // ============================================================

    startTimer: function () {
        if (this.data.timer) clearInterval(this.data.timer);

        if (!this.data.endTime) {
            this.data.endTime = Date.now() + this.data.timeLeft * 1000;
        }

        this.data.timer = setInterval(() => {
            const remaining = Math.max(0, Math.round((this.data.endTime - Date.now()) / 1000));

            if (remaining === this.data.timeLeft) return;

            this.data.timeLeft = remaining;
            this.updateTimerDisplay();
            this.saveExamState();

            if (remaining <= 0) {
                clearInterval(this.data.timer);
                this.data.timer = null;
                this.submitTest();
            }
        }, 250);
    },

    stopTimer: function () {
        if (this.data.timer) clearInterval(this.data.timer);
        this.data.timer = null;
        this.data.endTime = null;
    },

    updateTimerDisplay: function () {
        const el = document.getElementById('timer-display');
        if (el) {
            const m = Math.floor(this.data.timeLeft / 60);
            const s = this.data.timeLeft % 60;
            el.textContent = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
            if (this.data.timeLeft < 60) el.classList.add('text-red-500', 'animate-pulse');
        }
    },

    // ============================================================
    // TEST INTERFACE
    // ============================================================

    showTestInterface: function () {
        this.data.mode = 'test';
        this.updateHeader();
        this.renderQuestion();
    },

    toggleMobileGrid: function () {
        const modal = document.getElementById('mobile-grid-modal');
        let html = '<div class="flex flex-wrap gap-2 justify-center">';
        this.data.questions.forEach((_q, idx) => {
            const isAnswered = this.data.userAnswers[_q.id] !== undefined && this.data.userAnswers[_q.id] !== '';
            const isActive = idx === this.data.currentQuestionIndex;
            let cls = "w-10 h-10 flex items-center justify-center text-sm font-bold rounded border cursor-pointer ";
            if (isActive) cls += "bg-blue-600 text-white border-blue-600";
            else if (isAnswered) cls += "bg-green-100 text-green-700 border-green-300 hover:bg-green-200";
            else cls += "bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200";
            html += `<div onclick="event.preventDefault(); app.jumpToQuestion(${idx}); document.getElementById('mobile-grid-modal').classList.add('hidden')" class="${cls}">${idx + 1}</div>`;
        });
        html += '</div>';
        document.getElementById('mobile-grid-container').innerHTML = html;
        modal.classList.remove('hidden');
    },

    // ============================================================
    // RENDER QUESTION
    // ============================================================

    renderQuestion: function () {
        const q = this.data.questions[this.data.currentQuestionIndex];
        const total = this.data.questions.length;
        const userAnswer = this.data.userAnswers[q.id];
        const isStudyMode = this.data.examMode === 'study';

        let isCorrect = false;
        let showExplanation = false;

        if (isStudyMode && this.data.answerRevealed[q.id]) {
            if (typeof this.data.answerRevealed[q.id] === 'object') {
                isCorrect = this.data.answerRevealed[q.id].isCorrect;
            } else {
                isCorrect = this.checkAnswer(q.id, userAnswer);
            }
            showExplanation = true;
        }

        let gridHtml = '';
        this.data.questions.forEach((_q, idx) => {
            const isAnswered = this.data.userAnswers[_q.id] !== undefined && this.data.userAnswers[_q.id] !== '';
            const isActive = idx === this.data.currentQuestionIndex;
            let cls = "w-8 h-8 flex items-center justify-center text-xs font-bold rounded border cursor-pointer ";
            if (isActive) cls += "bg-blue-600 text-white border-blue-600";
            else if (isAnswered) cls += "bg-green-100 text-green-700 border-green-300 hover:bg-green-200";
            else cls += "bg-gray-100 text-gray-600 border-gray-300 hover:bg-gray-200";
            gridHtml += `<div onclick="event.preventDefault(); app.jumpToQuestion(${idx})" class="${cls}">${idx + 1}</div>`;
        });

        const subject = this.data.subjects[this.data.currentSubjectId];
        const hasTopicNotes = subject && subject.notes && subject.notes[q.topicId] && subject.notes[q.topicId].trim() !== '';
        const hasTopicImages = subject && subject.topicImages && subject.topicImages[q.topicId] && subject.topicImages[q.topicId].length > 0;

        let answerArea = '';

        if (q.type === 'theory') {
            const alreadyGraded = this.data.answerRevealed[q.id];
            let theoryFeedback = '';
            if (alreadyGraded && typeof alreadyGraded === 'object' && alreadyGraded.score !== undefined) {
                theoryFeedback = `
                    <div class="mt-4 p-4 bg-green-100 border border-green-300 rounded-lg">
                        <p class="font-bold text-green-800">Marks Awarded: ${alreadyGraded.score} / ${q.maxMarks}</p>
                        <div class="mt-3 pt-3 border-t border-green-200">
                            <p class="text-xs text-green-600 font-bold mb-1">Your Submitted Answer:</p>
                            <p class="text-sm text-gray-700 bg-white p-2 rounded mb-3">${userAnswer || 'No text provided.'}</p>
                        </div>
                        <div class="p-3 bg-white rounded border border-green-200">
                            <p class="text-xs text-green-600 font-bold mb-1">Explanation / Model Answer:</p>
                            <p class="text-sm text-gray-800 whitespace-pre-wrap">${alreadyGraded.explanation}</p>
                        </div>
                    </div>`;
            }

            answerArea = `
                <div class="max-w-2xl">
                    <div class="flex gap-2 mb-4" id="theory-tabs-${q.id}">
                        <button type="button" onclick="app.toggleTheoryTab('${q.id}', 'text')" class="flex-1 py-2 rounded-lg font-bold border-2 bg-green-50 border-green-500 text-green-700" id="tab-text-${q.id}">
                            <i class="fas fa-keyboard mr-1"></i> Type Answer
                        </button>
                        <button type="button" onclick="app.toggleTheoryTab('${q.id}', 'image')" class="flex-1 py-2 rounded-lg font-bold border-2 bg-gray-50 border-gray-300 text-gray-500" id="tab-image-${q.id}">
                            <i class="fas fa-camera mr-1"></i> Upload Photo
                        </button>
                    </div>

                    <div id="theory-text-container-${q.id}" class="${alreadyGraded ? 'hidden' : ''}">
                        <textarea id="theory-text-input-${q.id}" rows="5" class="w-full p-4 border-2 border-gray-300 rounded-lg focus:border-blue-500 text-lg" placeholder="Type your theory answer here..." ${alreadyGraded ? 'disabled' : ''}>${userAnswer || ''}</textarea>

                        <button onclick="app.submitTheoryText('${q.id}')" id="submit-text-btn-${q.id}"
                                class="mt-2 w-full ${this.data.examMode === 'practice' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'} text-white px-6 py-3 rounded-lg font-bold transition">
                            <i class="fas ${this.data.examMode === 'practice' ? 'fa-save' : 'fa-magic'} mr-2"></i>
                            ${this.data.examMode === 'practice' ? 'Save Answer' : 'Submit for AI Grading'}
                        </button>
                    </div>

                    <div id="theory-image-container-${q.id}" class="hidden">
                        <input type="file" id="theory-image-input-${q.id}" accept="image/*"
                               class="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 mb-2"
                               ${alreadyGraded ? 'disabled' : ''}>
                        <div id="image-preview-container-${q.id}" class="mt-2 hidden">
                            <img id="theory-image-preview-${q.id}" src="" class="max-h-60 rounded-lg border shadow-md mb-2 w-full object-contain" />
                            <button onclick="app.submitTheoryImage('${q.id}')" id="submit-image-btn-${q.id}"
                                    class="w-full bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-bold transition">
                                <i class="fas fa-magic mr-2"></i>Submit for AI Grading
                            </button>
                        </div>
                    </div>

                    ${theoryFeedback}
                </div>`;

            setTimeout(() => {
                const input = document.getElementById(`theory-image-input-${q.id}`);
                if (input) {
                    input.addEventListener('change', (e) => {
                        const file = e.target.files[0];
                        if (file) {
                            const reader = new FileReader();
                            reader.onload = (event) => {
                                document.getElementById(`theory-image-preview-${q.id}`).src = event.target.result;
                                document.getElementById(`image-preview-container-${q.id}`).classList.remove('hidden');
                            };
                            reader.readAsDataURL(file);
                        }
                    });
                }
            }, 100);
        } else if (q.type === 'objective') {
            if (isStudyMode) {
                if (showExplanation) {
                    answerArea = `
                        <div class="space-y-3 max-w-2xl">
                            ${['A', 'B', 'C', 'D'].map(opt => {
                                let optionClass = "block p-4 border-2 rounded-lg flex items-center gap-3 relative";
                                let isSelected = userAnswer === opt;
                                let isCorrectOpt = q.correct === opt;

                                if (isCorrectOpt) {
                                    optionClass += " correct-option-highlight";
                                } else if (isSelected) {
                                    optionClass += " wrong-answer-selected";
                                } else {
                                    optionClass += " border-gray-200 bg-gray-50";
                                }

                                let badge = '';
                                if (isCorrectOpt) {
                                    badge = '<span class="correct-badge"><i class="fas fa-check-circle mr-1"></i>Correct Answer</span>';
                                }

                                return `
                                    <div class="${optionClass}">
                                        <span class="w-8 h-8 rounded-full bg-white flex items-center justify-center font-bold text-sm border ${isCorrectOpt ? 'border-white' : 'border-gray-300'}">${opt}</span>
                                        <span class="flex-grow">${q.options?.[opt] || ''}</span>
                                        ${badge}
                                    </div>
                                `;
                            }).join('')}
                        </div>`;
                } else {
                    answerArea = `
                        <div class="space-y-3 max-w-2xl">
                            <p class="text-sm text-gray-500 mb-2"><i class="fas fa-hand-pointer mr-1"></i> Click on your answer to reveal correct answer and explanation:</p>
                            ${['A', 'B', 'C', 'D'].map(opt => {
                                let isSelected = userAnswer === opt;
                                let selectedClass = isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50';
                                return `
                                    <div onclick="event.preventDefault(); app.handleStudyAnswerClick('${q.id}', '${opt}')"
                                         class="block p-4 border-2 rounded-lg flex items-center gap-3 relative cursor-pointer study-option ${selectedClass}">
                                        <span class="w-8 h-8 rounded-full bg-white flex items-center justify-center font-bold text-sm border border-gray-300">${opt}</span>
                                        <span class="flex-grow">${q.options?.[opt] || ''}</span>
                                        ${isSelected ? '<span class="text-blue-600 text-xs font-bold ml-2"><i class="fas fa-check-circle"></i> Selected</span>' : ''}
                                    </div>
                                `;
                            }).join('')}
                        </div>`;
                }
            } else {
                answerArea = `
                    <div class="space-y-3 max-w-2xl">
                        ${['A', 'B', 'C', 'D'].map(opt => `
                            <div class="relative">
                                <input type="radio" name="option" id="opt-${opt}" class="cbt-radio hidden" value="${opt}" ${userAnswer === opt ? 'checked' : ''} onchange="app.selectAnswer('${q.id}', '${opt}')">
                                <label for="opt-${opt}" class="block p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 flex items-center gap-3">
                                    <span class="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center font-bold text-sm">${opt}</span>
                                    <span class="text-gray-700">${q.options?.[opt] || ''}</span>
                                </label>
                            </div>
                        `).join('')}
                    </div>`;
            }
        } else {
            if (isStudyMode) {
                const answerRevealed = this.data.answerRevealed[q.id];
                let fillAnswerDisplay = '';
                if (answerRevealed) {
                    if (isCorrect) {
                        fillAnswerDisplay = `
                            <div class="mt-4 p-4 bg-green-100 border border-green-300 rounded-lg">
                                <p class="font-bold text-green-800"><i class="fas fa-check-circle mr-2"></i>Correct! Your answer: "${userAnswer}"</p>
                                <p class="mt-2 text-sm text-green-700">✓ The correct answer is "${q.correct}"</p>
                            </div>`;
                    } else {
                        fillAnswerDisplay = `
                            <div class="mt-4 p-4 bg-red-100 border border-red-300 rounded-lg">
                                <p class="font-bold text-red-800"><i class="fas fa-times-circle mr-2"></i>Incorrect. Your answer: "${userAnswer}"</p>
                                <p class="mt-3 fill-correct-highlight" onclick="event.preventDefault(); app.showNotification('✓ Correct answer is: ${q.correct}', 'success')">
                                    ✓ Click to see correct answer: "${q.correct}"
                                </p>
                            </div>`;
                    }
                }

                answerArea = `
                    <div class="max-w-2xl">
                        <label class="block text-gray-600 mb-2 font-bold">Your Answer:</label>
                        <div class="flex gap-2">
                            <input type="text" id="fill-answer-${q.id}" class="flex-grow p-4 border-2 border-gray-300 rounded-lg focus:border-blue-500 text-lg" value="${userAnswer || ''}" placeholder="Type your answer..." ${answerRevealed ? 'disabled' : ''}>
                            ${!answerRevealed ?
                                `<button onclick="event.preventDefault(); app.handleStudyAnswerClick('${q.id}', null, true)" class="insert-answer-btn bg-green-600 hover:bg-green-700 text-white px-6 py-4 rounded-lg font-bold">
                                    <i class="fas fa-check mr-2"></i>Check Answer
                                </button>` :
                                `<button class="bg-gray-400 text-white px-6 py-4 rounded-lg font-bold cursor-not-allowed" disabled>
                                    <i class="fas fa-check-circle mr-2"></i>Answered
                                </button>`
                            }
                        </div>
                        ${fillAnswerDisplay}
                        ${!answerRevealed ? '<p class="text-sm text-gray-500 mt-2"><i class="fas fa-info-circle mr-1"></i>Click the button to check your answer and see explanation</p>' : ''}
                    </div>`;
            } else {
                answerArea = `
                    <div class="max-w-2xl">
                        <label class="block text-gray-600 mb-2 font-bold">Your Answer:</label>
                        <input type="text" class="w-full p-4 border-2 border-gray-300 rounded-lg focus:border-blue-500 text-lg" value="${userAnswer || ''}" oninput="app.selectAnswer('${q.id}', this.value)" placeholder="Type your answer...">
                    </div>`;
            }
        }

        let explanationArea = '';
        if (isStudyMode && showExplanation) {
            if (q.explanation) {
                explanationArea = `
                    <div class="mt-6 explanation-box">
                        <div class="flex items-center gap-2 mb-2">
                            <i class="fas ${isCorrect ? 'fa-check-circle text-green-600' : 'fa-times-circle text-red-600'} text-xl"></i>
                            <span class="font-bold text-lg ${isCorrect ? 'text-green-600' : 'text-red-600'}">
                                ${isCorrect ? '✓ Correct!' : '✗ Incorrect'}
                            </span>
                        </div>
                        <div class="bg-white p-4 rounded-lg border-l-4 border-blue-500">
                            <p class="font-bold text-gray-700 mb-2">📚 Explanation:</p>
                            <p class="text-gray-700">${q.explanation}</p>
                        </div>
                        ${!isCorrect && q.type === 'objective' ?
                            `<div class="mt-3 p-3 bg-green-50 rounded-lg">
                                <p class="font-bold text-green-800">Correct answer: ${q.correct}: ${q.options?.[q.correct] || ''}</p>
                            </div>` : ''
                        }
                    </div>`;
            } else if (!q.explanation) {
                explanationArea = `
                    <div class="mt-6 explanation-box">
                        <div class="flex items-center gap-2 mb-2">
                            <i class="fas ${isCorrect ? 'fa-check-circle text-green-600' : 'fa-times-circle text-red-600'} text-xl"></i>
                            <span class="font-bold text-lg ${isCorrect ? 'text-green-600' : 'text-red-600'}">
                                ${isCorrect ? '✓ Correct!' : '✗ Incorrect'}
                            </span>
                        </div>
                        <div class="bg-white p-4 rounded-lg">
                            <p class="font-bold text-gray-700 mb-2">Correct answer:</p>
                            <p class="text-green-700 font-bold text-lg">${q.correct}</p>
                            ${q.type === 'objective' && q.options?.[q.correct] ?
                                `<p class="text
