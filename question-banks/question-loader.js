// ============================================================
// QUESTION LOADER
// Reads window.CBT_SUBJECT_BANKS (array of text strings pushed
// by each *-bank.js file), parses them using the original
// text-format parser, and merges into app.data.subjects.
//
// Bank file contract:
//   window.CBT_SUBJECT_BANKS = window.CBT_SUBJECT_BANKS || [];
//   window.CBT_SUBJECT_BANKS.push(`...text with Subject:/Topic:/...`);
//
// MUST be loaded AFTER all *-bank.js files and AFTER app-core.js.
// ============================================================

(function () {
    const MAX_WAIT_ATTEMPTS = 50;   // 50 × 100ms = 5s
    let attempts = 0;

    function tryImport() {
        attempts++;
        if (attempts > MAX_WAIT_ATTEMPTS) {
            console.warn('⚠️ question-loader.js gave up waiting for app or banks');
            return;
        }

        const appReady   = typeof app !== 'undefined' && app.data;
        const banksReady = window.CBT_SUBJECT_BANKS &&
                           Array.isArray(window.CBT_SUBJECT_BANKS) &&
                           window.CBT_SUBJECT_BANKS.length > 0;

        if (!appReady || !banksReady) {
            setTimeout(tryImport, 100);
            return;
        }

        doImport();
    }

    // --------------------------------------------------------
    // Parser — identical to the original question-bank.js
    // --------------------------------------------------------
    function parseQuestions(text) {
        const lines = text.split('\n');
        const subjects = {};
        let currentSubject = null;
        let currentTopic = null;
        let currentSubTopic = null; // 🌟 NEW
        let currentQuestion = null;
        let currentOptions = {};
        let explanationLines = [];
        let readingExplanation = false;

        for (let i = 0; i < lines.length; i++) {
            let line = lines[i].trim();
            if (line === '' || line.startsWith('===')) continue;

            if (line.match(/^Subject:/i)) {
                if (currentQuestion) finalizeQuestion();
                const subjectName = line.substring(8).trim();
                if (subjectName) {
                    const newId = 'subj_' + Date.now() + '_' + Math.random();
                    currentSubject = {
                        id: newId,
                        name: subjectName,
                        duration: 30,
                        questions: [],
                        topics: [],
                        notes: {},
                        topicImages: {}
                    };
                    subjects[newId] = currentSubject;
                }
                continue;
            }

            if (!currentSubject) continue;

            if (line.match(/^Topic:/i)) {
                if (currentQuestion) finalizeQuestion();
                const topicName = line.substring(6).trim();
                if (topicName) {
                    let existingTopic = currentSubject.topics.find(t => t.name === topicName);
                    if (!existingTopic) {
                        existingTopic = {
                            id: 'topic_' + Date.now() + '_' + Math.random(),
                            name: topicName
                        };
                        currentSubject.topics.push(existingTopic);
                    }
                    currentTopic = existingTopic;
                }
                currentSubTopic = null; // 🌟 NEW: Reset sub-topic when topic changes
                continue;
            }

            // 🌟 NEW: Parse SubTopic
            const subTopicMatch = line.match(/^SubTopic:\s*(.*)$/i);
            if (subTopicMatch) {
                if (currentQuestion) finalizeQuestion();
                currentSubTopic = subTopicMatch[1].trim();
                continue;
            }

            if (line.match(/^Type:/i)) {
                if (currentQuestion) finalizeQuestion();
                const type = line.substring(5).trim().toLowerCase();
                currentQuestion = {
                    id: Date.now() + Math.random(),
                    text: '',
                    type: type === 'mcq' ? 'objective' : (type === 'theory' ? 'theory' : 'fill'),
                    correct: '',
                    explanation: '',
                    options: type === 'mcq' ? {} : null,
                    topicId: currentTopic ? currentTopic.id : 'general',
                    subTopic: currentSubTopic || 'General', // 🌟 NEW: Attach sub-topic
                    maxMarks: 10
                };
                currentOptions = {};
                explanationLines = [];
                readingExplanation = false;
                continue;
            }

            const marksMatch = line.match(/^Marks:\s*(\d+)$/i);
            if (marksMatch && currentQuestion.type === 'theory') {
                currentQuestion.maxMarks = parseInt(marksMatch[1]);
                continue;
            }

            if (!currentQuestion) continue;

            const qMatch = line.match(/^Q\d+:\s*(.*)$/i);
            if (qMatch) {
                currentQuestion.text = qMatch[1].trim();
                continue;
            }

            let optMatch = line.match(/^Option:\s*([A-D]):\s*(.*)$/i);
            if (!optMatch && currentQuestion.type === 'objective') {
                optMatch = line.match(/^([A-D]):\s*(.*)$/i);
            }
            if (optMatch && currentQuestion.type === 'objective') {
                const letter = optMatch[1].toUpperCase();
                const text = optMatch[2].trim();
                currentQuestion.options[letter] = text;
                continue;
            }

            const ansMatch = line.match(/^Answer:\s*(.*)$/i);
            if (ansMatch) {
                currentQuestion.correct = ansMatch[1].trim();
                readingExplanation = false;
                continue;
            }

            const expMatch = line.match(/^Explanation:\s*(.*)$/i);
            if (expMatch) {
                readingExplanation = true;
                const expText = expMatch[1].trim();
                if (expText) explanationLines.push(expText);
                continue;
            }

            if (readingExplanation && line) {
                explanationLines.push(line);
            }
        }

        function finalizeQuestion() {
            if (currentQuestion && currentQuestion.text) {
                if (explanationLines.length > 0) {
                    currentQuestion.explanation = explanationLines.join(' ');
                }

                if (currentQuestion.type === 'objective') {
                    const optionCount = Object.keys(currentQuestion.options).length;
                    if (optionCount >= 2 && currentQuestion.correct) {
                        currentSubject.questions.push({ ...currentQuestion });
                    }
                } else if (currentQuestion.type === 'fill') {
                    if (currentQuestion.correct) {
                        currentSubject.questions.push({ ...currentQuestion });
                    }
                } else if (currentQuestion.type === 'theory') {
                    currentSubject.questions.push({ ...currentQuestion });
                }
            }
            currentQuestion = null;
            currentOptions = {};
            explanationLines = [];
            readingExplanation = false;
        }

        finalizeQuestion();

        for (let id in subjects) {
            if (subjects[id].topics.length === 0) {
                subjects[id].topics.push({ id: 'general', name: 'General' });
            }
        }
        return subjects;
    }

    // --------------------------------------------------------
    // Import — reload from storage, clean up old data, merge
    // --------------------------------------------------------
        // --------------------------------------------------------
    // Import — strictly overwrite with bank file data
    // --------------------------------------------------------
    function doImport() {
        // 1. Parse the combined bank text from your .js files
        const combinedText = window.CBT_SUBJECT_BANKS.join('\n');
        const newSubjects = parseQuestions(combinedText);
        let totalQuestions = 0;

        // 2. (Optional) Preserve notes and images from Local Storage if they exist
        // This prevents students from losing their study materials when you update questions.
        const saved = localStorage.getItem('cbt_subjects');
        if (saved) {
            try {
                const oldSubjects = JSON.parse(saved);
                for (let id in newSubjects) {
                    // Find if this subject existed before by checking the name
                    const oldMatch = Object.values(oldSubjects).find(s => s.name === newSubjects[id].name);
                    if (oldMatch) {
                        if (oldMatch.notes) newSubjects[id].notes = oldMatch.notes;
                        if (oldMatch.topicImages) newSubjects[id].topicImages = oldMatch.topicImages;
                    }
                }
            } catch (e) { console.warn("Could not merge old notes/images", e); }
        }

        // 3. 🛑 STRICT OVERWRITE: Wipe old subjects and use ONLY what was in the .js files
        app.data.subjects = newSubjects;
        
        for (let id in newSubjects) {
            totalQuestions += newSubjects[id].questions.length;
        }

        // 4. Save the clean slate back to Local Storage
        try {
            app.saveSubjects();
            console.log(`✅ question-loader.js: strictly loaded ${totalQuestions} questions from ${window.CBT_SUBJECT_BANKS.length} bank file(s).`);
        } catch (e) {
            console.error('Import failed:', e);
            return;
        }

        // 5. Re-render the landing page
        const container = document.getElementById('app-container');
        if (app.data.mode === 'landing' && container && container.innerHTML.trim().length > 0) {
            app.showLanding();
        }
    }
    // Kick off
    tryImport();
})();
