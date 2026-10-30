// ============================================================
// APP CORE — state, data loading, landing, login UI
// ============================================================

window.app = {
    data: {
        subjects: {},
        currentSubjectId: null,
        questions: [],
        examDuration: 30,
        currentQuestionIndex: 0,
        userAnswers: {},
        candidateName: '',
        timer: null,
        timeLeft: 0,
        mode: 'landing',
        results: [],
        images: {},
        examMode: null,          // 'practice' or 'study'
        answerRevealed: {},
        lastResults: null,
        refreshLocked: true
    },

    // ============================================================
    // INITIALIZATION
    // ============================================================

    init: function () {
        this.loadData();
        this.loadResults();
        this.loadImages();
        imageViewer.init();
        this.setupMathJaxPatch();

        // Resume prompt short-circuits the normal landing render
        if (this.checkForSavedExam()) return;

        this.showLanding();
    },

    loadData: function () {
        const storedSubjects = localStorage.getItem('cbt_subjects');
        if (storedSubjects) {
            this.data.subjects = JSON.parse(storedSubjects);
            Object.values(this.data.subjects).forEach(subj => {
                if (!subj.notes) subj.notes = {};
                if (!subj.topicImages) subj.topicImages = {};
            });
        } else {
            this.data.subjects = {};
        }
    },

    loadImages: function () {
        const storedImages = localStorage.getItem('cbt_images');
        if (storedImages) {
            try {
                this.data.images = JSON.parse(storedImages);
            } catch (e) {
                this.data.images = {};
            }
        }
    },

    loadResults: function () {
        const storedResults = localStorage.getItem('cbt_results');
        if (storedResults) {
            try {
                this.data.results = JSON.parse(storedResults);
            } catch (e) {}
        }
    },

    saveSubjects: function () {
        localStorage.setItem('cbt_subjects', JSON.stringify(this.data.subjects));
    },

    saveResults: function () {
        localStorage.setItem('cbt_results', JSON.stringify(this.data.results));
    },

    saveImages: function () {
        localStorage.setItem('cbt_images', JSON.stringify(this.data.images));
    },

    createSubjectInternal: function (name, duration, questions = [], id = null) {
        const newId = id || 'subj_' + Date.now();
        this.data.subjects[newId] = {
            id: newId,
            name: name,
            duration: parseInt(duration) || 30,
            questions: questions,
            topics: [{ id: 'general', name: 'General' }],
            notes: {},
            topicImages: {}
        };
        this.saveSubjects();
        return newId;
    },

    // ============================================================
    // NOTIFICATIONS
    // ============================================================

    showNotification: function (message, type = 'info') {
        const existing = document.querySelector('.cbt-notification');
        if (existing) existing.remove();

        const colors = {
            info: 'bg-blue-100 text-blue-800 border-blue-300',
            success: 'bg-green-100 text-green-800 border-green-300',
            warning: 'bg-yellow-100 text-yellow-800 border-yellow-300',
            error: 'bg-red-100 text-red-800 border-red-300'
        };

        const notification = document.createElement('div');
        notification.className = `cbt-notification fixed top-4 right-4 z-50 p-4 rounded-lg border shadow-lg ${colors[type]}`;
        notification.innerHTML = `
            <div class="flex items-center gap-3">
                <i class="fas fa-info-circle"></i>
                <span class="font-medium">${message}</span>
                <button onclick="this.parentElement.parentElement.remove()" class="ml-4 text-gray-500 hover:text-gray-700">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            if (notification.parentNode) notification.remove();
        }, 3000);
    },

    // ============================================================
    // LANDING PAGE
    // ============================================================

    showLanding: function () {
        this.stopTimer();
        this.data.mode = 'landing';
        this.data.examMode = null;
        this.updateHeader();

        const subjectsWithNotes = Object.values(this.data.subjects).filter(subj =>
            (subj.notes && Object.keys(subj.notes).some(topicId => subj.notes[topicId] && subj.notes[topicId].trim() !== '')) ||
            (subj.topicImages && Object.keys(subj.topicImages).some(topicId => subj.topicImages[topicId]?.length > 0))
        );

        document.getElementById('app-container').innerHTML = `
            <div class="flex flex-col items-center justify-center h-full p-4">
                <div class="text-center mb-8">
                    <i class="fas fa-graduation-cap text-6xl text-green-600 mb-4"></i>
                    <h2 class="text-3xl font-bold text-gray-800 mb-2">Welcome to the CBT Portal</h2>
                    <p class="text-gray-600">Select your role to continue</p>
                </div>

                ${subjectsWithNotes.length > 0 ? `
                <div class="w-full max-w-2xl mb-6">
                    <h3 class="text-lg font-bold text-gray-700 mb-3 flex items-center gap-2">
                        <i class="fas fa-book-open text-blue-500"></i>
                        Available Study Materials
                    </h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                        ${subjectsWithNotes.map(subj => {
                            const noteCount = subj.notes ? Object.keys(subj.notes).filter(t => subj.notes[t]?.trim()).length : 0;
                            const imageCount = subj.topicImages ? Object.values(subj.topicImages).flat().length : 0;
                            return `
                                <div onclick="event.preventDefault(); app.showSubjectNotes('${subj.id}')" class="note-card cursor-pointer">
                                    <i class="fas fa-book"></i>
                                    <h4 class="font-bold">${subj.name}</h4>
                                    <p class="text-sm opacity-90">${noteCount} topics with notes, ${imageCount} topic images</p>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
                ` : ''}

                <div class="grid grid-cols-1 md:grid-cols-1 gap-6 w-full max-w-md">
                    <button onclick="event.preventDefault(); app.showCandidateOptions()" class="group bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition border text-center">
                        <div class="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200">
                            <i class="fas fa-user-graduate text-2xl text-blue-600"></i>
                        </div>
                        <h3 class="text-xl font-bold text-gray-800">Candidate</h3>
                        <p class="text-gray-500 mt-2">Take the examination</p>
                    </button>
                </div>
            </div>`;
    },

    // ============================================================
    // STUDY MATERIALS
    // ============================================================

    showSubjectNotes: function (subjectId) {
        const subj = this.data.subjects[subjectId];
        if (!subj) return;

        const topicsWithMaterials = subj.topics.filter(t =>
            (subj.notes && subj.notes[t.id] && subj.notes[t.id].trim() !== '') ||
            (subj.topicImages && subj.topicImages[t.id] && subj.topicImages[t.id].length > 0)
        );

        if (topicsWithMaterials.length === 0) {
            this.showNotification('No notes or images available for this subject', 'info');
            return;
        }

        this.data.mode = 'notes-browser';
        this.updateHeader();

        document.getElementById('app-container').innerHTML = `
            <div class="max-w-4xl mx-auto h-full flex flex-col">
                <div class="flex items-center gap-2 mb-4">
                    <button onclick="event.preventDefault(); app.showLanding()" class="text-gray-500 hover:text-gray-800">
                        <i class="fas fa-arrow-left text-xl"></i>
                    </button>
                    <h2 class="text-2xl font-bold text-gray-800">${subj.name} - Study Materials</h2>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 flex-grow overflow-y-auto pb-4">
                    ${topicsWithMaterials.map(t => {
                        const hasNote = subj.notes && subj.notes[t.id] && subj.notes[t.id].trim() !== '';
                        const hasImages = subj.topicImages && subj.topicImages[t.id] && subj.topicImages[t.id].length > 0;
                        return `
                            <div class="bg-white p-6 rounded-lg shadow-md border hover:shadow-lg transition">
                                <div class="flex items-center gap-3 mb-3">
                                    <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                        <i class="fas fa-folder-open text-blue-600"></i>
                                    </div>
                                    <h3 class="font-bold text-lg text-gray-800">${t.name}</h3>
                                </div>
                                <div class="flex flex-wrap gap-2">
                                    ${hasNote ? `
                                        <button onclick="event.preventDefault(); app.viewTopicNote('${subjectId}', '${t.id}', '${t.name}')" class="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-2 rounded text-sm font-bold">
                                            <i class="fas fa-book-open mr-1"></i> Read Notes
                                        </button>
                                    ` : ''}
                                    ${hasImages ? `
                                        <button onclick="event.preventDefault(); app.viewTopicImages('${subjectId}', '${t.id}')" class="flex-1 bg-purple-50 hover:bg-purple-100 text-purple-700 px-3 py-2 rounded text-sm font-bold">
                                            <i class="fas fa-images mr-1"></i> View Images (${subj.topicImages[t.id].length})
                                        </button>
                                    ` : ''}
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    },

    viewTopicNote: function (subjectId, topicId, topicName) {
        const subj = this.data.subjects[subjectId];
        if (!subj || !subj.notes || !subj.notes[topicId]) {
            this.showNotification('No notes available for this topic', 'info');
            return;
        }

        document.getElementById('note-viewer-title').textContent = `Notes: ${topicName}`;
        document.getElementById('note-viewer-content').innerHTML = subj.notes[topicId];
        document.getElementById('note-viewer-modal').classList.remove('hidden');
        this.triggerMathJax();
    },

    viewTopicImages: function (subjectId, topicId) {
        const subj = this.data.subjects[subjectId];
        if (!subj || !subj.topicImages || !subj.topicImages[topicId] || subj.topicImages[topicId].length === 0) {
            this.showNotification('No images for this topic', 'info');
            return;
        }
        const images = subj.topicImages[topicId];
        const modal = document.getElementById('topic-image-modal');
        document.getElementById('topic-image-modal-title').textContent = `Images - ${subj.topics.find(t => t.id === topicId)?.name || 'Topic'}`;
        const gallery = document.getElementById('topic-image-gallery');
        gallery.innerHTML = '';
        images.forEach(img => {
            const item = document.createElement('div');
            item.className = 'image-item';
            item.onclick = () => {
                const full = document.createElement('div');
                full.className = 'fixed inset-0 bg-black/90 flex items-center justify-center z-[60]';
                full.onclick = () => full.remove();
                const fullImg = document.createElement('img');
                fullImg.src = img.data;
                fullImg.className = 'max-h-[90vh] max-w-[90vw] object-contain';
                full.appendChild(fullImg);
                document.body.appendChild(full);
            };
            const thumb = document.createElement('img');
            thumb.src = img.data;
            thumb.alt = img.filename;
            const filename = document.createElement('div');
            filename.className = 'filename';
            filename.textContent = img.filename;
            item.appendChild(thumb);
            item.appendChild(filename);
            gallery.appendChild(item);
        });
        modal.classList.remove('hidden');
    },

    // ============================================================
    // CANDIDATE OPTIONS & LOGIN
    // ============================================================

    showCandidateOptions: function () {
        this.data.mode = 'candidate-options';
        this.updateHeader();

        document.getElementById('app-container').innerHTML = `
            <div class="flex flex-col items-center justify-center h-full p-4">
                <div class="bg-white p-8 rounded-xl shadow-lg w-full max-w-md text-center">
                    <i class="fas fa-user-graduate text-5xl text-blue-600 mb-4"></i>
                    <h2 class="text-2xl font-bold text-gray-800 mb-6">Select Exam Mode</h2>

                    <div class="space-y-4">
                        <button onclick="event.preventDefault(); app.showCandidateLogin('practice')" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-lg transition flex items-center justify-center gap-3">
                            <i class="fas fa-clock"></i>
                            <span>Practice Mode (Timed)</span>
                        </button>

                        <button onclick="event.preventDefault(); app.showCandidateLogin('study')" class="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-lg transition flex items-center justify-center gap-3">
                            <i class="fas fa-book-open"></i>
                            <span>Study Mode (Learn with Explanations)</span>
                        </button>
                    </div>

                    <div class="mt-6 text-sm text-gray-500">
                        <p><i class="fas fa-info-circle mr-1"></i> Practice: Timed exam, results at the end</p>
                        <p class="mt-1"><i class="fas fa-info-circle mr-1"></i> Study: Click on your answer to see correct answer & explanation</p>
                    </div>

                    <button onclick="event.preventDefault(); app.showLanding()" class="mt-6 text-gray-500 hover:text-gray-700">
                        <i class="fas fa-arrow-left mr-1"></i> Back
                    </button>
                </div>
            </div>
        `;
    },

    showCandidateLogin: function (mode) {
        this.data.examMode = mode;
        const subjects = Object.values(this.data.subjects);

        if (subjects.length === 0) {
            this.showNotification('No subjects available.', 'error');
            return;
        }

        const customDurationHtml = mode === 'practice' ? `
            <div class="mb-4">
                <label class="block text-gray-700 mb-2 font-medium">
                    <i class="fas fa-hourglass-half mr-1 text-blue-500"></i>
                    Custom Exam Duration (minutes)
                </label>
                <input type="number" id="custom-duration-input" class="w-full border rounded-lg p-3"
                       placeholder="Leave empty to use subject default (${subjects[0]?.duration || 30} min)"
                       min="1" max="999" step="1">
                <p class="text-xs text-gray-500 mt-1">Enter any number between 1 and 999 minutes</p>
            </div>
        ` : '';

        document.getElementById('app-container').innerHTML = `
            <div class="flex flex-col items-center justify-center min-h-full py-6 px-2">
                <div class="bg-white p-6 sm:p-8 rounded-xl shadow-lg w-full max-w-md border-t-4 ${mode === 'practice' ? 'border-blue-600' : 'border-green-600'}">
                    <div class="flex items-center gap-2 mb-4">
                        <button onclick="event.preventDefault(); app.showCandidateOptions()" class="text-gray-500 hover:text-gray-700">
                            <i class="fas fa-arrow-left"></i>
                        </button>
                        <h2 class="text-2xl font-bold text-center text-gray-800 flex-grow">Candidate Login</h2>
                    </div>

                    <div class="mb-4 text-center">
                        <span class="inline-block px-4 py-1 rounded-full text-sm font-bold ${mode === 'practice' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}">
                            <i class="fas ${mode === 'practice' ? 'fa-clock' : 'fa-book-open'} mr-1"></i>
                            ${mode === 'practice' ? 'Practice Mode (Timed)' : 'Study Mode (Click answers to reveal)'}
                        </span>
                    </div>

                    <form id="candidate-login-form">
                        <div class="mb-4">
                            <label class="block text-gray-700 mb-2 font-medium">Full Name</label>
                            <input type="text" id="candidate-name" class="w-full border rounded-lg p-3" placeholder="Enter your name" required>
                        </div>
                        <div class="mb-4">
                            <label class="block text-gray-700 mb-2 font-medium">Select Subject</label>
                            <select id="exam-subject" onchange="app.renderCandidateTopics()" class="w-full border rounded-lg p-3">
                                ${subjects.map(s => `<option value="${s.id}">${s.name}</option>`).join('')}
                            </select>
                        </div>

                        ${customDurationHtml}

                        <div id="candidate-topics-container" class="mb-6"></div>
                        <div class="bg-blue-50 p-4 rounded mb-6 text-sm text-blue-800">
                            <p class="font-bold mb-1"><i class="fas fa-info-circle"></i> Instructions:</p>
                            <ul class="list-disc list-inside">
                                <li>${mode === 'practice' ? 'You can set a custom time limit above' : 'No time limit - learn at your own pace'}</li>
                                ${mode === 'study' ? '<li class="text-green-700 font-bold">Click on your chosen answer to see correct answer and explanation!</li>' : ''}
                                <li>Don't refresh the browser</li>
                                <li>Reference images are available during exam</li>
                                <li>Click the <i class="fas fa-book-open"></i> or <i class="fas fa-images"></i> icons next to topics to view study materials</li>
                            </ul>
                        </div>
                        <button type="submit" class="w-full ${mode === 'practice' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'} text-white font-bold py-3 rounded-lg transition">
                            Start ${mode === 'practice' ? 'Practice' : 'Study'}
                        </button>
                    </form>
                </div>
            </div>`;

        document.getElementById('candidate-login-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.startTestPrep();
        });
        setTimeout(() => this.renderCandidateTopics(), 0);
    },

    renderCandidateTopics: function () {
        const subjEl = document.getElementById('exam-subject');
        if (!subjEl) return;
        const subj = this.data.subjects[subjEl.value];
        const container = document.getElementById('candidate-topics-container');
        if (!subj?.topics || subj.topics.length <= 1) {
            container.innerHTML = '';
            return;
        }

        let topicsHtml = `
            <p class="mb-2 text-sm font-bold text-gray-700">Select Topics & Choose Number of Questions</p>
            <div class="grid grid-cols-1 gap-3 max-h-60 overflow-y-auto border p-3 rounded bg-white">
        `;

        subj.topics.forEach(topic => {
            const questionCount = subj.questions.filter(q => q.topicId === topic.id).length;
            const hasNote = subj.notes && subj.notes[topic.id] && subj.notes[topic.id].trim() !== '';
            const hasImages = subj.topicImages && subj.topicImages[topic.id] && subj.topicImages[topic.id].length > 0;

            topicsHtml += `
                <div class="flex flex-col gap-2 p-3 border rounded-lg bg-gray-50 hover:bg-gray-100">
                    <div class="flex items-center gap-2 flex-wrap">
                        <input type="checkbox" name="exam-topic" value="${topic.id}" class="topic-checkbox rounded text-green-600 w-5 h-5">
                        <span class="text-sm font-bold text-gray-800 flex-grow">${topic.name}</span>
                        ${hasNote ? `<button type="button" onclick="event.preventDefault(); app.viewTopicNote('${subj.id}', '${topic.id}', '${topic.name}')" class="text-blue-500 hover:text-blue-700" title="View notes"><i class="fas fa-book-open"></i></button>` : ''}
                        ${hasImages ? `<button type="button" onclick="event.preventDefault(); app.viewTopicImages('${subj.id}', '${topic.id}')" class="text-purple-500 hover:text-purple-700" title="View images"><i class="fas fa-images"></i></button>` : ''}
                    </div>
                    <div class="flex items-center gap-3 text-sm ml-6">
                        <span class="text-gray-600"><i class="fas fa-database"></i> Available: <strong class="text-green-700">${questionCount}</strong> questions</span>
                        <div class="flex items-center gap-2">
                            <label class="text-gray-600">Take:</label>
                            <input type="number"
                                   class="topic-quantity w-20 border rounded px-2 py-1 text-center text-sm"
                                   data-topic-id="${topic.id}"
                                   min="0"
                                   max="${questionCount}"
                                   value="${questionCount}"
                                   step="1"
                                   ${questionCount === 0 ? 'disabled' : ''}>
                            <span class="text-xs text-gray-500">questions</span>
                        </div>
                    </div>
                </div>
            `;
        });
        topicsHtml += `</div>`;
        container.innerHTML = topicsHtml;

        document.querySelectorAll('.topic-checkbox').forEach(checkbox => {
            const topicId = checkbox.value;
            const qtyInput = document.querySelector(`.topic-quantity[data-topic-id="${topicId}"]`);
            if (qtyInput) {
                const updateQtyState = () => {
                    if (checkbox.checked) {
                        qtyInput.disabled = false;
                        let currentVal = parseInt(qtyInput.value);
                        let maxVal = parseInt(qtyInput.max);
                        if (isNaN(currentVal) || currentVal < 1) qtyInput.value = 1;
                        if (currentVal > maxVal) qtyInput.value = maxVal;
                    } else {
                        qtyInput.disabled = true;
                        qtyInput.value = 0;
                    }
                };
                checkbox.addEventListener('change', updateQtyState);
                qtyInput.addEventListener('input', function () {
                    let val = parseInt(this.value);
                    let maxVal = parseInt(this.max);
                    if (isNaN(val)) val = 1;
                    if (val < 0) val = 0;
                    if (val > maxVal) val = maxVal;
                    this.value = val;
                    if (val === 0 && checkbox.checked) {
                        checkbox.checked = false;
                        this.disabled = true;
                    } else if (val > 0 && !checkbox.checked) {
                        checkbox.checked = true;
                        this.disabled = false;
                    }
                });
                updateQtyState();
            }
        });
    },

    // ============================================================
    // HEADER
    // ============================================================

    updateHeader: function () {
        const headerActions = document.getElementById('header-actions');

        if (this.data.mode === 'test') {
            const subjName = this.data.subjects[this.data.currentSubjectId]?.name || '';
            const hasImages = this.data.images?.[this.data.currentSubjectId]?.length > 0;

            headerActions.innerHTML = `
                <div class="flex items-center gap-2">
                    ${hasImages ? `
                        <button onclick="event.preventDefault(); app.showImageModal()" class="text-sm bg-purple-600 hover:bg-purple-700 px-3 py-1 rounded flex items-center gap-2">
                            <i class="fas fa-image"></i>
                            <span class="hidden sm:inline">Images</span>
                        </button>
                    ` : ''}
                    <div class="hidden md:block text-right">
                        <div class="text-xs text-green-200 uppercase font-bold">${subjName}</div>
                        <div class="font-bold">${this.data.candidateName}</div>
                    </div>
                    ${this.data.examMode === 'practice' ?
                        `<div class="bg-white text-green-800 px-4 py-1 rounded font-mono font-bold text-lg shadow" id="timer-display">00:00</div>` :
                        `<div class="bg-white text-green-800 px-4 py-1 rounded font-mono font-bold text-lg shadow">
                            <i class="fas fa-book-open text-sm mr-1"></i>Study
                        </div>`
                    }
                    <button onclick="event.preventDefault(); app.toggleMobileGrid()" class="md:hidden bg-green-800 hover:bg-green-900 text-white px-3 py-1 rounded">
                        <i class="fas fa-th"></i>
                    </button>
                </div>`;

            if (this.data.examMode === 'practice') {
                this.updateTimerDisplay();
            }
        } else if (this.data.mode === 'result' || this.data.mode === 'review') {
            headerActions.innerHTML = `
                <div class="flex items-center gap-2">
                    <button onclick="event.preventDefault(); app.showLanding()" class="text-sm bg-green-800 hover:bg-green-900 px-3 py-1 rounded flex items-center gap-2">
                        <i class="fas fa-home"></i>
                        <span class="hidden sm:inline">Home</span>
                    </button>
                </div>`;
        } else {
            headerActions.innerHTML = `
                <button onclick="event.preventDefault(); app.showLanding()" class="text-sm bg-green-800 hover:bg-green-900 px-3 py-1 rounded flex items-center gap-2">
                    <i class="fas fa-home"></i>
                    <span class="hidden sm:inline">Home</span>
                </button>`;
        }
    }
};
