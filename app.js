// FocusPaws - Main JavaScript File
console.log('App.js loading started');

// DOM Elements
let navLinks, sections, websiteUrlInput, blockBtn, blockedList, blockerOverlay;
let blockedSiteName, backToWorkBtn, startTimer, pauseTimer, resetTimer;
let minutesDisplay, secondsDisplay, workDurationInput, breakDurationInput;
let catStatus, taskInput, addTaskBtn, taskList, taskReward;
let focusSessionsEl, completedTasksEl, totalFocusTimeEl, productivityChart;
let soundToggle, notificationToggle, themeOptions, catOptions;

// App State
const state = {
    blockedWebsites: [],
    tasks: [],
    stats: {
        focusSessions: 0,
        completedTasks: 0,
        totalFocusTime: 0,
        dailyFocusTime: {} // Format: { "YYYY-MM-DD": minutes }
    },
    settings: {
        theme: 'default',
        catCharacter: 'tabby',
        soundEnabled: true,
        notificationsEnabled: true
    },
    timer: {
        isRunning: false,
        isPaused: false,
        isBreak: false,
        minutes: 25,
        seconds: 0,
        interval: null,
        workDuration: 25,
        breakDuration: 5
    }
};

// Make sure DOM elements are loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded fired - initializing app');
    
    try {
        // Initialize all DOM elements - store results for debugging
        const elements = initializeDOMElements();
        console.log('DOM elements initialized:', elements);
        
        // Initialize the app with the found elements
        initApp();
        
        // Load saved data and render initial state
        loadSavedData();
        updateStats();
        renderTasks();
        renderProductivityChart();
        
        console.log('App initialization complete');
    } catch (error) {
        console.error('Error during app initialization:', error);
        alert('There was an error initializing the app. Please check the console for details.');
    }
});

function initializeDOMElements() {
    // Navigation elements
    navLinks = document.querySelectorAll('nav a');
    sections = document.querySelectorAll('section');
    
    // Website blocker elements
    websiteUrlInput = document.getElementById('website-url');
    blockBtn = document.getElementById('block-btn');
    blockedList = document.getElementById('blocked-list');
    blockerOverlay = document.getElementById('blocker-overlay');
    blockedSiteName = document.getElementById('blocked-site-name');
    backToWorkBtn = document.getElementById('back-to-work-btn');
    
    // Timer elements
    startTimer = document.getElementById('start-timer');
    pauseTimer = document.getElementById('pause-timer');
    resetTimer = document.getElementById('reset-timer');
    minutesDisplay = document.getElementById('minutes');
    secondsDisplay = document.getElementById('seconds');
    workDurationInput = document.getElementById('work-duration');
    breakDurationInput = document.getElementById('break-duration');
    catStatus = document.getElementById('cat-status');
    
    // Task elements
    taskInput = document.getElementById('task-input');
    addTaskBtn = document.getElementById('add-task-btn');
    taskList = document.getElementById('task-list');
    taskReward = document.getElementById('task-reward');
    
    // Progress elements
    focusSessionsEl = document.getElementById('focus-sessions');
    completedTasksEl = document.getElementById('completed-tasks');
    totalFocusTimeEl = document.getElementById('total-focus-time');
    productivityChart = document.getElementById('productivity-chart');
    
    // Settings elements
    soundToggle = document.getElementById('sound-toggle');
    notificationToggle = document.getElementById('notification-toggle');
    themeOptions = document.querySelectorAll('.theme-option');
    catOptions = document.querySelectorAll('.cat-option');
    
    // Check for critical elements
    const criticalElements = [
        { name: 'startTimer', element: startTimer },
        { name: 'taskInput', element: taskInput },
        { name: 'taskList', element: taskList },
        { name: 'productivityChart', element: productivityChart }
    ];
    
    const missingElements = criticalElements.filter(item => !item.element);
    if (missingElements.length > 0) {
        console.error('Critical elements missing:', missingElements.map(item => item.name));
        throw new Error('Critical DOM elements are missing');
    }
    
    return {
        navigation: { navLinks, sections },
        blocker: { websiteUrlInput, blockBtn, blockedList, blockerOverlay },
        timer: { startTimer, pauseTimer, resetTimer, minutesDisplay, secondsDisplay },
        tasks: { taskInput, addTaskBtn, taskList },
        progress: { focusSessionsEl, completedTasksEl, totalFocusTimeEl, productivityChart },
        settings: { soundToggle, notificationToggle, themeOptions, catOptions }
    };
}

// Initialize the app
function initApp() {
    console.log('Initializing app components');
    
    // Create fallback images for any missing cat images
    createFallbackCatImages();
    
    // Set up navigation
    if (navLinks && navLinks.length > 0) {
        navLinks.forEach(link => {
            link.addEventListener('click', navHandler);
        });
    }

    // Initialize website blocker
    if (blockBtn) {
        renderBlockedWebsites();
        blockBtn.addEventListener('click', addBlockedWebsite);
    }
    
    if (backToWorkBtn) {
        backToWorkBtn.addEventListener('click', closeOverlay);
    }

    // Initialize timer
    if (startTimer && pauseTimer && resetTimer) {
        updateTimerDisplay();
        startTimer.addEventListener('click', startPomodoroTimer);
        pauseTimer.addEventListener('click', pausePomodoroTimer);
        resetTimer.addEventListener('click', resetPomodoroTimer);
        
        if (workDurationInput) {
            workDurationInput.addEventListener('change', updateTimerSettings);
        }
        
        if (breakDurationInput) {
            breakDurationInput.addEventListener('change', updateTimerSettings);
        }
    }

    // Initialize tasks
    if (addTaskBtn && taskInput) {
        renderTasks();
        addTaskBtn.addEventListener('click', addTask);
        taskInput.addEventListener('keypress', e => {
            if (e.key === 'Enter') addTask();
        });
    }

    // Initialize progress charts
    updateStats();
    renderProductivityChart();

    // Initialize settings
    initializeSettings();
    
    if (soundToggle) {
        soundToggle.addEventListener('change', updateSoundSetting);
    }
    
    if (notificationToggle) {
        notificationToggle.addEventListener('change', updateNotificationSetting);
    }
    
    if (themeOptions && themeOptions.length > 0) {
        themeOptions.forEach(option => {
            option.addEventListener('click', updateTheme);
        });
    }
    
    if (catOptions && catOptions.length > 0) {
        catOptions.forEach(option => {
            option.addEventListener('click', updateCatCharacter);
        });
    }

    // Test timer
    console.log('Timer state on init:', {
        startTimer: startTimer ? startTimer.id : 'missing',
        pauseTimer: pauseTimer ? pauseTimer.id : 'missing',
        resetTimer: resetTimer ? resetTimer.id : 'missing'
    });
}

function loadSavedData() {
    console.log('Loading saved data');
    
    // Load saved data from localStorage
    try {
        const savedBlockedWebsites = localStorage.getItem('blockedWebsites');
        if (savedBlockedWebsites) {
            state.blockedWebsites = JSON.parse(savedBlockedWebsites);
            console.log('Loaded blocked websites:', state.blockedWebsites.length);
        }
        
        const savedTasks = localStorage.getItem('tasks');
        if (savedTasks) {
            state.tasks = JSON.parse(savedTasks);
            console.log('Loaded tasks:', state.tasks.length);
        }

        const savedStats = localStorage.getItem('stats');
        if (savedStats) {
            state.stats = JSON.parse(savedStats);
            console.log('Loaded stats');
        }

        const savedSettings = localStorage.getItem('settings');
        if (savedSettings) {
            state.settings = JSON.parse(savedSettings);
            console.log('Loaded settings');
        }
    } catch (error) {
        console.error('Error loading saved data:', error);
        // Reset to defaults if there's an error
        resetAppState();
    }
}

function resetAppState() {
    console.log('Resetting app state to defaults');
    
    state.blockedWebsites = [];
    state.tasks = [];
    state.stats = {
        focusSessions: 0,
        completedTasks: 0,
        totalFocusTime: 0,
        dailyFocusTime: {}
    };
    state.settings = {
        theme: 'default',
        catCharacter: 'tabby',
        soundEnabled: true,
        notificationsEnabled: true
    };
}

// Navigation Handler
function navHandler(e) {
    e.preventDefault();
    const targetSection = e.currentTarget.getAttribute('data-section');
    
    // Update active navigation link
    navLinks.forEach(link => {
        link.classList.remove('active');
    });
    e.currentTarget.classList.add('active');
    
    // Show active section
    sections.forEach(section => {
        section.classList.remove('active-section');
        if (section.id === `${targetSection}-section`) {
            section.classList.add('active-section');
        }
    });
}

// =========================
// Website Blocker Functions
// =========================

function addBlockedWebsite() {
    const url = websiteUrlInput.value.trim().toLowerCase();
    
    if (!url) {
        showNotification('Please enter a valid website URL');
        return;
    }
    
    // Extract domain name from URL
    const domain = extractDomain(url);
    
    if (state.blockedWebsites.includes(domain)) {
        showNotification('This website is already blocked');
        return;
    }
    
    state.blockedWebsites.push(domain);
    saveBlockedWebsites();
    websiteUrlInput.value = '';
    renderBlockedWebsites();
    showNotification(`${domain} has been blocked`);
    
    // Set up blocking immediately after adding
    setupTabChangeDetection();
}

function removeBlockedWebsite(website) {
    state.blockedWebsites = state.blockedWebsites.filter(site => site !== website);
    saveBlockedWebsites();
    renderBlockedWebsites();
    showNotification(`${website} has been unblocked`);
}

function renderBlockedWebsites() {
    blockedList.innerHTML = '';
    
    if (state.blockedWebsites.length === 0) {
        blockedList.innerHTML = '<li class="empty-list">No websites blocked yet</li>';
        return;
    }
    
    state.blockedWebsites.forEach(website => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span>${website}</span>
            <button class="remove-site" title="Unblock website">
                <i class="fas fa-trash"></i>
            </button>
        `;
        
        const removeBtn = li.querySelector('.remove-site');
        removeBtn.addEventListener('click', () => removeBlockedWebsite(website));
        
        blockedList.appendChild(li);
    });
}

function checkCurrentWebsite() {
    // In a real extension this would check the current URL
    // For the web app version, we'll use multiple approaches to detect navigation
    
    // Alt+B shortcut for demo purposes
    document.addEventListener('keydown', function(e) {
        // Alt+B to simulate visiting a blocked site (for demo)
        if (e.altKey && e.key === 'b') {
            const randomSite = state.blockedWebsites[Math.floor(Math.random() * state.blockedWebsites.length)];
            if (randomSite) {
                showBlockedOverlay(randomSite);
            } else {
                showNotification('No websites have been blocked yet');
            }
        }
    });
    
    // Demo buttons for testing blocking functionality
    const blockerSection = document.getElementById('blocker-section');
    const testBlockingDiv = document.createElement('div');
    testBlockingDiv.className = 'test-blocking';
    testBlockingDiv.innerHTML = `
        <h3>Test Blocking Functionality</h3>
        <p>Click to simulate visiting a blocked website:</p>
        <div class="test-buttons">
        </div>
    `;
    
    // Insert after the blocked-sites div
    const blockedSites = document.querySelector('.blocked-sites');
    if (blockedSites) {
        blockedSites.parentNode.insertBefore(testBlockingDiv, blockedSites.nextSibling);
    }
    
    // Update test buttons whenever websites list changes
    updateTestButtons();
}

function updateTestButtons() {
    const testButtonsDiv = document.querySelector('.test-buttons');
    if (!testButtonsDiv) return;
    
    testButtonsDiv.innerHTML = '';
    
    if (state.blockedWebsites.length === 0) {
        testButtonsDiv.innerHTML = '<p>Add some websites to block first.</p>';
        return;
    }
    
    state.blockedWebsites.forEach(site => {
        const btn = document.createElement('button');
        btn.className = 'test-block-btn';
        btn.textContent = `Visit ${site}`;
        btn.addEventListener('click', () => showBlockedOverlay(site));
        testButtonsDiv.appendChild(btn);
    });
    
    // Add a random button
    const randomBtn = document.createElement('button');
    randomBtn.className = 'test-block-btn random';
    randomBtn.textContent = 'Visit Random Blocked Site';
    randomBtn.addEventListener('click', () => {
        const randomSite = state.blockedWebsites[Math.floor(Math.random() * state.blockedWebsites.length)];
        if (randomSite) {
            showBlockedOverlay(randomSite);
        }
    });
    testButtonsDiv.appendChild(randomBtn);
}

function setupTabChangeDetection() {
    // This function sets up detection for when a user tries to navigate away from the page
    
    window.addEventListener('beforeunload', function(e) {
        // Check if the destination URL is in the blocked list
        // Note: Due to security restrictions, we can't actually get the destination URL
        // This is just a simulation to remind users they might be going to a blocked site
        
        const isWorkHours = new Date().getHours() >= 9 && new Date().getHours() <= 17;
        
        if (state.blockedWebsites.length > 0 && isWorkHours) {
            // Only show if there are blocked sites and during typical work hours
            const confirmationMessage = "You're leaving FocusPaws. Remember to stay focused!";
            e.returnValue = confirmationMessage;
            return confirmationMessage;
        }
    });
    
    // Add a link checker to detect clicks on links
    document.addEventListener('click', function(e) {
        // Find closest anchor tag
        const anchor = e.target.closest('a');
        
        if (anchor && anchor.href && !anchor.href.startsWith('#') && !anchor.href.startsWith('javascript:')) {
            const domain = extractDomain(anchor.href);
            
            if (state.blockedWebsites.includes(domain)) {
                e.preventDefault();
                showBlockedOverlay(domain);
            }
        }
    });
}

function showBlockedOverlay(website) {
    blockedSiteName.textContent = website;
    blockerOverlay.style.display = 'flex';
    playCatSound('meow');
    
    // Add cat animation
    const blockCat = document.querySelector('.block-cat');
    if (blockCat) {
        blockCat.classList.remove('wiggle');
        setTimeout(() => {
            blockCat.classList.add('wiggle');
        }, 10);
    }
}

function closeOverlay() {
    blockerOverlay.style.display = 'none';
}

function extractDomain(url) {
    // Remove protocol and www if present
    let domain = url;
    if (domain.startsWith('http://')) domain = domain.substring(7);
    if (domain.startsWith('https://')) domain = domain.substring(8);
    if (domain.startsWith('www.')) domain = domain.substring(4);
    
    // Remove path if present
    const slashIndex = domain.indexOf('/');
    if (slashIndex !== -1) {
        domain = domain.substring(0, slashIndex);
    }
    
    return domain;
}

function saveBlockedWebsites() {
    localStorage.setItem('blockedWebsites', JSON.stringify(state.blockedWebsites));
}

// =========================
// Pomodoro Timer Functions
// =========================

function startPomodoroTimer() {
    console.log('startPomodoroTimer called');
    
    if (!startTimer || !pauseTimer || !resetTimer) {
        console.error('Timer buttons not available');
        return;
    }
    
    // If already running, don't do anything
    if (state.timer.isRunning && !state.timer.isPaused) return;
    
    // If paused, just resume
    if (state.timer.isPaused) {
        state.timer.isPaused = false;
    } else {
        // Start a new timer
        state.timer.isRunning = true;
        state.timer.isPaused = false;
        
        // Apply timer settings if starting fresh (not resuming)
        if (!state.timer.interval) {
            if (!state.timer.isBreak) {
                // Starting a work session
                state.timer.minutes = parseInt(workDurationInput.value, 10) || 25;
                console.log(`Starting work session for ${state.timer.minutes} minutes`);
            } else {
                // Starting a break
                state.timer.minutes = parseInt(breakDurationInput.value, 10) || 5;
                console.log(`Starting break for ${state.timer.minutes} minutes`);
            }
            state.timer.seconds = 0;
        }
    }
    
    updateTimerDisplay();
    
    // Clear any existing interval before setting a new one
    if (state.timer.interval) {
        clearInterval(state.timer.interval);
    }
    
    // Set new interval
    state.timer.interval = setInterval(updateTimer, 1000);
    
    // Update button states and text
    startTimer.disabled = true;
    startTimer.textContent = state.timer.isBreak ? 'Break Time...' : 'Working...';
    pauseTimer.disabled = false;
    resetTimer.disabled = false;
    
    // Update cat animation
    updateCatAnimation(state.timer.isBreak ? 'break' : 'focus');
    
    console.log('Timer started:', state.timer);
}

function pausePomodoroTimer() {
    if (!state.timer.isRunning || state.timer.isPaused) return;
    
    clearInterval(state.timer.interval);
    state.timer.isPaused = true;
    
    // Update button states
    startTimer.disabled = false;
    startTimer.textContent = 'Resume';
    
    // Update cat animation
    updateCatAnimation('pause');
}

function resetPomodoroTimer() {
    clearInterval(state.timer.interval);
    state.timer.interval = null; // Clear interval reference
    state.timer.isRunning = false;
    state.timer.isPaused = false;
    state.timer.isBreak = false;
    
    // Reset to work duration
    state.timer.minutes = parseInt(workDurationInput.value, 10) || 25;
    state.timer.seconds = 0;
    
    // Update the display
    updateTimerDisplay();
    
    // Update button states
    startTimer.disabled = false;
    startTimer.textContent = 'Start';
    pauseTimer.disabled = true;
    resetTimer.disabled = true;
    
    // Update cat animation
    updateCatAnimation('idle');
}

function updateTimer() {
    if (!state.timer.isRunning) return;
    
    if (state.timer.seconds > 0) {
        state.timer.seconds--;
    } else if (state.timer.minutes > 0) {
        state.timer.minutes--;
        state.timer.seconds = 59;
    } else {
        // Timer completed
        clearInterval(state.timer.interval);
        
        if (!state.timer.isBreak) {
            // Work session completed - transition to break
            completeWorkSession();
        } else {
            // Break completed - transition to work
            completeBreakSession();
        }
    }
    
    updateTimerDisplay();
}

function completeWorkSession() {
    console.log('Work session completed');
    // Work session completed
    state.timer.isRunning = false;
    state.timer.isPaused = false;
    state.timer.isBreak = true;
    
    // Get user-defined break duration
    const breakDuration = parseInt(breakDurationInput.value, 10) || 5;
    state.timer.minutes = breakDuration;
    state.timer.seconds = 0;
    
    // Update statistics
    state.stats.focusSessions++;
    const workDuration = parseInt(workDurationInput.value, 10) || 25;
    state.stats.totalFocusTime += workDuration;
    
    // Update daily focus time
    const today = new Date().toISOString().split('T')[0];
    if (!state.stats.dailyFocusTime[today]) {
        state.stats.dailyFocusTime[today] = 0;
    }
    state.stats.dailyFocusTime[today] += workDuration;
    
    // Save statistics
    saveStats();
    updateStats();
    renderProductivityChart();
    
    // Play sound when work session completes
    playCatSound('meow');
    
    // Show notification
    showNotification('Work session completed! Time for a break!');
    
    // Update cat animation
    updateCatAnimation('break');
    
    // Update button states
    if (startTimer) startTimer.textContent = 'Start Break';
    if (startTimer) startTimer.disabled = false;
    if (pauseTimer) pauseTimer.disabled = true;
    
    // Auto-start break after 1.5 seconds
    setTimeout(() => {
        if (!state.timer.isRunning && !state.timer.isPaused) {
            startPomodoroTimer();
        }
    }, 1500);
    
    updateTimerDisplay();
}

function completeBreakSession() {
    console.log('Break session completed');
    // Break completed
    state.timer.isRunning = false;
    state.timer.isPaused = false;
    state.timer.isBreak = false;
    
    // Get user-defined work duration
    const workDuration = parseInt(workDurationInput.value, 10) || 25;
    state.timer.minutes = workDuration;
    state.timer.seconds = 0;
    
    // Show notification
    showNotification('Break completed! Ready to focus again?');
    
    // Update cat animation
    updateCatAnimation('focus');
    
    // Update button states
    if (startTimer) startTimer.textContent = 'Start Work';
    if (startTimer) startTimer.disabled = false;
    if (pauseTimer) pauseTimer.disabled = true;
    
    // Auto-start next work session after 1.5 seconds
    setTimeout(() => {
        if (!state.timer.isRunning && !state.timer.isPaused) {
            startPomodoroTimer();
        }
    }, 1500);
    
    updateTimerDisplay();
}

function updateTimerDisplay() {
    if (!minutesDisplay || !secondsDisplay) return;
    
    minutesDisplay.textContent = String(state.timer.minutes).padStart(2, '0');
    secondsDisplay.textContent = String(state.timer.seconds).padStart(2, '0');
}

function updateTimerSettings() {
    state.timer.workDuration = parseInt(workDurationInput.value, 10) || 25;
    state.timer.breakDuration = parseInt(breakDurationInput.value, 10) || 5;
    
    if (!state.timer.isRunning) {
        state.timer.minutes = state.timer.isBreak ? state.timer.breakDuration : state.timer.workDuration;
        updateTimerDisplay();
    }
}

function updateCatAnimation(status) {
    console.log('Updating cat animation to:', status);
    const catStatus = document.getElementById('cat-status');
    if (!catStatus) {
        console.error('Cat status element not found');
        return;
    }
    
    // Remove all previous state classes
    catStatus.classList.remove('cat-state-focus', 'cat-state-break', 'cat-state-pause', 'cat-state-idle');
    
    // Apply new state class
    switch (status) {
        case 'focus':
            catStatus.classList.add('cat-state-focus');
            break;
        case 'break':
            catStatus.classList.add('cat-state-break');
            break;
        case 'pause':
            catStatus.classList.add('cat-state-pause');
            break;
        default:
            catStatus.classList.add('cat-state-idle');
    }
    
    // Store current status
    catStatus.dataset.status = status;
    console.log('Cat animation updated to:', status);
}

// =========================
// Task Manager Functions
// =========================

function addTask() {
    console.log('Adding task');
    if (!taskInput || !taskList) {
        console.error('Task input or list not available');
        return;
    }
    
    const taskText = taskInput.value.trim();
    
    if (!taskText) {
        showNotification('Please enter a task');
        return;
    }
    
    const newTask = {
        id: Date.now(),
        text: taskText,
        completed: false,
        createdAt: new Date().toISOString(),
        order: state.tasks.length // Add order for proper drag and drop
    };
    
    state.tasks.unshift(newTask); // Add new task to the beginning
    saveTasks();
    renderTasks();
    taskInput.value = '';
    showNotification('Task added successfully!');
}

function completeTask(taskId) {
    const taskIndex = state.tasks.findIndex(task => task.id === taskId);
    
    if (taskIndex !== -1) {
        state.tasks[taskIndex].completed = true;
        state.stats.completedTasks++;
        saveStats();
        saveTasks();
        renderTasks();
        updateStats();
        
        // Show cat reward
        showTaskReward();
        
        showNotification('Task completed! Purrfect job!');
        playCatSound('purr');
    }
}

function deleteTask(taskId) {
    state.tasks = state.tasks.filter(task => task.id !== taskId);
    saveTasks();
    renderTasks();
    showNotification('Task deleted');
}

function editTask(taskId) {
    const task = state.tasks.find(task => task.id === taskId);
    
    if (task) {
        const newText = prompt('Edit task:', task.text);
        
        if (newText && newText.trim()) {
            task.text = newText.trim();
            saveTasks();
            renderTasks();
            showNotification('Task updated');
        }
    }
}

function renderTasks() {
    if (!taskList) return;
    
    taskList.innerHTML = '';
    
    if (state.tasks.length === 0) {
        taskList.innerHTML = '<li class="empty-list">No tasks yet. Add one above!</li>';
        return;
    }
    
    // Sort tasks: active tasks first, then completed tasks, maintaining order within each group
    const sortedTasks = [...state.tasks].sort((a, b) => {
        if (a.completed === b.completed) {
            return a.order - b.order;
        }
        return a.completed ? 1 : -1;
    });
    
    sortedTasks.forEach((task, index) => {
        const li = document.createElement('li');
        li.className = task.completed ? 'task-item completed' : 'task-item';
        li.draggable = true;
        li.setAttribute('data-task-id', task.id);
        li.setAttribute('data-index', index);
        
        li.innerHTML = `
            <div class="task-content">
                <i class="fas fa-grip-vertical drag-handle"></i>
                <span class="task-text">${task.text}</span>
            </div>
            <div class="task-actions">
                ${!task.completed ? `
                    <button class="complete-task" title="Mark as Complete">
                        <i class="fas fa-check"></i>
                    </button>
                    <button class="edit-task" title="Edit Task">
                        <i class="fas fa-edit"></i>
                    </button>
                ` : ''}
                <button class="delete-task" title="Delete Task">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        // Add drag and drop event listeners
        li.addEventListener('dragstart', handleDragStart);
        li.addEventListener('dragend', handleDragEnd);
        li.addEventListener('dragover', handleDragOver);
        li.addEventListener('drop', handleDrop);
        
        // Add event listeners for task actions
        if (!task.completed) {
            const completeBtn = li.querySelector('.complete-task');
            const editBtn = li.querySelector('.edit-task');
            
            completeBtn.addEventListener('click', () => completeTask(task.id));
            editBtn.addEventListener('click', () => editTask(task.id));
        }
        
        const deleteBtn = li.querySelector('.delete-task');
        deleteBtn.addEventListener('click', () => deleteTask(task.id));
        
        taskList.appendChild(li);
    });
    
    // Update task count in progress
    updateStats();
}

// Add drag and drop handlers
let draggedTask = null;

function handleDragStart(e) {
    draggedTask = this;
    this.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', this.getAttribute('data-task-id'));
}

function handleDragEnd(e) {
    this.classList.remove('dragging');
    draggedTask = null;
}

function handleDragOver(e) {
    e.preventDefault();
    if (this === draggedTask) return;
    
    const rect = this.getBoundingClientRect();
    const midY = rect.top + rect.height / 2;
    
    if (e.clientY < midY) {
        this.classList.add('drag-above');
        this.classList.remove('drag-below');
    } else {
        this.classList.add('drag-below');
        this.classList.remove('drag-above');
    }
}

function handleDrop(e) {
    e.preventDefault();
    if (this === draggedTask) return;
    
    const draggedTaskId = parseInt(e.dataTransfer.getData('text/plain'));
    const dropTaskId = parseInt(this.getAttribute('data-task-id'));
    
    if (isNaN(draggedTaskId) || isNaN(dropTaskId)) return;
    
    const draggedIndex = state.tasks.findIndex(t => t.id === draggedTaskId);
    const dropIndex = state.tasks.findIndex(t => t.id === dropTaskId);
    
    if (draggedIndex === -1 || dropIndex === -1) return;
    
    // Update order of tasks
    const [draggedTask] = state.tasks.splice(draggedIndex, 1);
    state.tasks.splice(dropIndex, 0, draggedTask);
    
    // Update order property for all tasks
    state.tasks.forEach((task, index) => {
        task.order = index;
    });
    
    // Clear drag classes
    this.classList.remove('drag-above', 'drag-below');
    
    // Save and render
    saveTasks();
    renderTasks();
}

function showTaskReward() {
    taskReward.style.display = 'block';
    setTimeout(() => {
        taskReward.style.display = 'none';
    }, 3000);
}

function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(state.tasks));
}

// =========================
// Progress Tracker Functions
// =========================

function updateStats() {
    if (!focusSessionsEl || !completedTasksEl || !totalFocusTimeEl) return;
    
    focusSessionsEl.textContent = state.stats.focusSessions;
    completedTasksEl.textContent = state.stats.completedTasks;
    totalFocusTimeEl.textContent = `${state.stats.totalFocusTime} mins`;
    
    // Ensure chart is updated
    renderProductivityChart();
}

function renderProductivityChart() {
    const chartCanvas = document.getElementById('productivity-chart');
    if (!chartCanvas) return;
    
    // Get the last 7 days
    const labels = [];
    const focusTimeData = [];
    const tasksData = [];
    
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateString = date.toISOString().split('T')[0];
        const dayName = new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(date);
        
        labels.push(dayName);
        focusTimeData.push(state.stats.dailyFocusTime[dateString] || 0);
        
        // Count completed tasks for this day
        const tasksForDay = state.tasks.filter(task => {
            const taskDate = new Date(task.createdAt).toISOString().split('T')[0];
            return taskDate === dateString && task.completed;
        }).length;
        
        tasksData.push(tasksForDay);
    }
    
    // Destroy existing chart if it exists
    if (window.productivityChartInstance) {
        window.productivityChartInstance.destroy();
    }
    
    // Create new chart with improved styling
    window.productivityChartInstance = new Chart(chartCanvas, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Focus Time (minutes)',
                    data: focusTimeData,
                    backgroundColor: 'rgba(161, 98, 232, 0.5)',
                    borderColor: 'rgba(161, 98, 232, 1)',
                    borderWidth: 1,
                    borderRadius: 5,
                    barPercentage: 0.6
                },
                {
                    label: 'Completed Tasks',
                    data: tasksData,
                    backgroundColor: 'rgba(255, 107, 107, 0.5)',
                    borderColor: 'rgba(255, 107, 107, 1)',
                    borderWidth: 1,
                    borderRadius: 5,
                    barPercentage: 0.6
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        padding: 20,
                        font: {
                            size: 12
                        }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    titleFont: {
                        size: 14
                    },
                    bodyFont: {
                        size: 13
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        drawBorder: false,
                        color: 'rgba(0, 0, 0, 0.1)'
                    },
                    ticks: {
                        font: {
                            size: 11
                        }
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        font: {
                            size: 11
                        }
                    }
                }
            }
        }
    });
}

function saveStats() {
    localStorage.setItem('stats', JSON.stringify(state.stats));
}

// =========================
// Settings Functions
// =========================

function initializeSettings() {
    // Set current theme
    document.documentElement.setAttribute('data-theme', state.settings.theme);
    themeOptions.forEach(option => {
        option.classList.toggle('active', option.getAttribute('data-theme') === state.settings.theme);
    });
    
    // Set cat character
    catOptions.forEach(option => {
        option.classList.toggle('active', option.getAttribute('data-cat') === state.settings.catCharacter);
    });
    
    // Set toggle states
    soundToggle.checked = state.settings.soundEnabled;
    notificationToggle.checked = state.settings.notificationsEnabled;
}

function updateTheme(e) {
    const selectedTheme = e.currentTarget.getAttribute('data-theme');
    state.settings.theme = selectedTheme;
    document.documentElement.setAttribute('data-theme', selectedTheme);
    
    themeOptions.forEach(option => {
        option.classList.toggle('active', option.getAttribute('data-theme') === selectedTheme);
    });
    
    saveSettings();
    showNotification(`Theme updated to ${selectedTheme}`);
}

function updateCatCharacter(e) {
    const selectedCat = e.currentTarget.getAttribute('data-cat');
    state.settings.catCharacter = selectedCat;
    
    catOptions.forEach(option => {
        option.classList.toggle('active', option.getAttribute('data-cat') === selectedCat);
    });
    
    // Update cat animation to show the new character
    if (state.timer.isRunning) {
        updateCatAnimation(state.timer.isBreak ? 'break' : 'focus');
    } else {
        updateCatAnimation('idle');
    }
    
    saveSettings();
    showNotification(`Cat character updated to ${selectedCat}`);
    playCatSound('meow');
}

function updateSoundSetting(e) {
    state.settings.soundEnabled = e.target.checked;
    saveSettings();
    showNotification(`Sound ${state.settings.soundEnabled ? 'enabled' : 'disabled'}`);
    if (state.settings.soundEnabled) {
        playCatSound('meow');
    }
}

function updateNotificationSetting(e) {
    state.settings.notificationsEnabled = e.target.checked;
    saveSettings();
    showNotification(`Notifications ${state.settings.notificationsEnabled ? 'enabled' : 'disabled'}`);
    if (state.settings.notificationsEnabled) {
        requestNotificationPermission();
    }
}

function saveSettings() {
    localStorage.setItem('settings', JSON.stringify(state.settings));
}

// =========================
// Utility Functions
// =========================

function showNotification(message) {
    // First show in-app notification
    const notification = document.createElement('div');
    notification.className = 'app-notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
    
    // Then show desktop notification if enabled
    if (state.settings.notificationsEnabled && "Notification" in window) {
        if (Notification.permission === "granted") {
            new Notification("FocusPaws", {
                body: message,
                icon: "img/pawshield.png"
            });
        }
    }
}

function requestNotificationPermission() {
    if ("Notification" in window && Notification.permission !== "granted" && Notification.permission !== "denied") {
        Notification.requestPermission();
    }
}

function playCatSound(soundType) {
    if (!state.settings.soundEnabled) return;
    
    console.log(`Playing ${soundType} sound`);
    
    // Make sure we use the uploaded audio file
    const audio = new Audio();
    
    switch (soundType) {
        case 'meow':
            // Use the uploaded cat meow sound
            audio.src = 'cat-meow-8-fx-306184.mp3';
            // Ensure it's loaded
            audio.load();
            break;
        case 'purr':
            audio.src = 'https://assets.mixkit.co/sfx/preview/mixkit-kitty-purring-296.mp3';
            break;
        default:
            return;
    }
    
    // Play with increased volume and error handling
    audio.volume = 0.7; // 70% volume
    audio.play().catch(e => {
        console.error('Audio play error:', e);
        // Try again after a short delay
        setTimeout(() => {
            audio.play().catch(e2 => 
                console.error('Second attempt audio play error:', e2)
            );
        }, 500);
    });
}

// Add CSS for notifications
const notificationStyle = document.createElement('style');
notificationStyle.textContent = `
    .app-notification {
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%) translateY(100px);
        background-color: var(--primary-color);
        color: white;
        padding: 12px 25px;
        border-radius: 30px;
        box-shadow: 0 3px 10px rgba(0,0,0,0.2);
        z-index: 1001;
        transition: transform 0.3s ease;
    }
    
    .app-notification.show {
        transform: translateX(-50%) translateY(0);
    }
    
    [data-theme="dark"] {
        --primary-color: #7c4dff;
        --secondary-color: #64b5f6;
        --accent-color: #43a047;
        --background-color: #212121;
        --text-color: #f5f5f5;
        --border-color: #424242;
        --card-background: #333333;
        --shadow-color: rgba(0, 0, 0, 0.3);
    }
    
    [data-theme="pastel"] {
        --primary-color: #ffafbd;
        --secondary-color: #ffc3a0;
        --accent-color: #a8e6cf;
        --background-color: #fdffed;
        --text-color: #666;
        --border-color: #dcd0d0;
        --card-background: #ffffff;
        --shadow-color: rgba(0, 0, 0, 0.05);
    }
`;
document.head.appendChild(notificationStyle);

// Add CSS for enhanced website blocker functionality
const additionalStyles = document.createElement('style');
additionalStyles.textContent = `
    .test-blocking {
        margin-top: 30px;
        padding: 20px;
        background-color: rgba(255, 107, 107, 0.1);
        border-radius: 10px;
    }
    
    .test-blocking h3 {
        margin-top: 0;
        color: var(--primary-color);
    }
    
    .test-buttons {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        margin-top: 15px;
    }
    
    .test-block-btn {
        background-color: var(--primary-color);
        color: white;
        border: none;
        padding: 8px 15px;
        border-radius: 5px;
        cursor: pointer;
        transition: background-color 0.3s ease;
    }
    
    .test-block-btn:hover {
        background-color: var(--accent-color);
    }
    
    .test-block-btn.random {
        background-color: var(--secondary-color);
    }
    
    .test-block-btn.random:hover {
        background-color: var(--accent-color);
    }
    
    .wiggle {
        animation: wiggle 1s ease infinite;
    }
    
    @keyframes wiggle {
        0%, 100% { transform: rotate(-5deg); }
        50% { transform: rotate(5deg); }
    }
    
    .blocker-content {
        animation: scaleIn 0.3s ease forwards;
    }
    
    @keyframes scaleIn {
        0% { transform: scale(0.8); opacity: 0; }
        100% { transform: scale(1); opacity: 1; }
    }
`;

document.head.appendChild(additionalStyles);

// Modified initialize function to update test buttons when blocked websites change
const originalRenderBlockedWebsites = renderBlockedWebsites;
renderBlockedWebsites = function() {
    // Call the original function
    originalRenderBlockedWebsites.call(this);
    
    // Update the test buttons
    updateTestButtons();
};

// =========================
// Browser Simulator Functions
// =========================

function initBrowserSimulator() {
    const browserUrlInput = document.getElementById('browser-url');
    const browserGoBtn = document.getElementById('browser-go');
    const browserDisplay = document.getElementById('browser-display');
    
    // Handle browser URL input with Enter key
    browserUrlInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            simulateBrowsing();
        }
    });
    
    // Handle browser go button click
    browserGoBtn.addEventListener('click', simulateBrowsing);
    
    function simulateBrowsing() {
        const url = browserUrlInput.value.trim().toLowerCase();
        
        if (!url) {
            showNotification('Please enter a URL to visit');
            return;
        }
        
        // Extract domain
        const domain = extractDomain(url);
        
        // Check if the site is blocked
        if (state.blockedWebsites.includes(domain)) {
            // Show the blocked overlay with the domain
            showBlockedOverlay(domain);
            return;
        }
        
        // If not blocked, display a simulated website based on the domain type
        displaySimulatedWebsite(domain);
    }
    
    function displaySimulatedWebsite(domain) {
        // Clear the display
        browserDisplay.innerHTML = '';
        
        // Create a simulated website based on domain type
        const websiteEl = document.createElement('div');
        websiteEl.classList.add('browser-website');
        
        let websiteType = 'productive'; // default type
        let websiteContent = '';
        
        // Determine website type based on domain keywords
        const socialKeywords = ['facebook', 'twitter', 'instagram', 'tiktok', 'social', 'reddit'];
        const videoKeywords = ['youtube', 'netflix', 'hulu', 'video', 'tiktok', 'stream'];
        const shoppingKeywords = ['amazon', 'ebay', 'shop', 'buy', 'store', 'shopping'];
        
        // Check domain against keywords
        if (socialKeywords.some(keyword => domain.includes(keyword))) {
            websiteType = 'social';
        } else if (videoKeywords.some(keyword => domain.includes(keyword))) {
            websiteType = 'video';
        } else if (shoppingKeywords.some(keyword => domain.includes(keyword))) {
            websiteType = 'shopping';
        }
        
        // Add the website type class
        websiteEl.classList.add(websiteType);
        
        // Create content based on website type
        switch (websiteType) {
            case 'social':
                websiteContent = `
                    <h2><i class="fas fa-users"></i> ${domain}</h2>
                    <div class="fake-feed">
                        <p>Welcome to ${domain} - Social Media Platform</p>
                        <div class="fake-post">
                            <p><strong>User123:</strong> Just posted a new photo!</p>
                            <div class="fake-interactions">
                                <span><i class="fas fa-heart"></i> 24 Likes</span>
                                <span><i class="fas fa-comment"></i> 5 Comments</span>
                            </div>
                        </div>
                        <div class="fake-post">
                            <p><strong>FriendXYZ:</strong> Check out this cool video!</p>
                            <div class="fake-interactions">
                                <span><i class="fas fa-heart"></i> 105 Likes</span>
                                <span><i class="fas fa-comment"></i> 12 Comments</span>
                            </div>
                        </div>
                    </div>
                `;
                break;
                
            case 'video':
                websiteContent = `
                    <h2><i class="fas fa-video"></i> ${domain}</h2>
                    <div class="fake-video-page">
                        <div class="fake-video-player">
                            <div class="fake-player-controls">
                                <i class="fas fa-play-circle"></i>
                            </div>
                        </div>
                        <h3>Popular Video Title</h3>
                        <p>1.2M views • 2 days ago</p>
                        <div class="fake-recommendations">
                            <p>Recommended videos:</p>
                            <ul>
                                <li>Amazing Cat Tricks - 5M views</li>
                                <li>10 Productivity Tips - 782K views</li>
                                <li>Newest Trending Video - 3.4M views</li>
                            </ul>
                        </div>
                    </div>
                `;
                break;
                
            case 'shopping':
                websiteContent = `
                    <h2><i class="fas fa-shopping-cart"></i> ${domain}</h2>
                    <div class="fake-shop">
                        <p>Welcome to ${domain} - Shopping Platform</p>
                        <div class="fake-products">
                            <div class="fake-product">
                                <div class="fake-product-image"></div>
                                <h3>Product Name</h3>
                                <p>$49.99</p>
                                <button class="fake-button">Add to Cart</button>
                            </div>
                            <div class="fake-product">
                                <div class="fake-product-image"></div>
                                <h3>Another Product</h3>
                                <p>$29.99</p>
                                <button class="fake-button">Add to Cart</button>
                            </div>
                        </div>
                    </div>
                `;
                break;
                
            default: // productive
                websiteContent = `
                    <h2><i class="fas fa-briefcase"></i> ${domain}</h2>
                    <div class="fake-productive-site">
                        <p>Welcome to ${domain}</p>
                        <div class="fake-content">
                            <h3>This is a productive website</h3>
                            <p>This site is not blocked because it helps with your productivity.</p>
                            <p>Keep up the good work!</p>
                            <div class="fake-cat">
                                <img src="img/cat-working.png" alt="Working Cat" style="height: 100px;">
                                <p>This cat approves of your productive browsing!</p>
                            </div>
                        </div>
                    </div>
                `;
        }
        
        websiteEl.innerHTML = websiteContent;
        browserDisplay.appendChild(websiteEl);
        
        // Add additional CSS for fake website elements
        const fakeElementsStyle = document.createElement('style');
        fakeElementsStyle.textContent = `
            .fake-feed, .fake-video-page, .fake-shop, .fake-productive-site {
                padding: 20px;
            }
            
            .fake-post {
                margin-bottom: 15px;
                padding: 10px;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 8px;
            }
            
            .fake-interactions {
                display: flex;
                gap: 15px;
                margin-top: 8px;
                font-size: 0.9em;
            }
            
            .fake-video-player {
                background: #000;
                height: 180px;
                display: flex;
                align-items: center;
                justify-content: center;
                margin-bottom: 15px;
                border-radius: 8px;
            }
            
            .fake-player-controls {
                font-size: 4em;
                opacity: 0.7;
            }
            
            .fake-recommendations ul {
                list-style: none;
                padding: 0;
            }
            
            .fake-recommendations li {
                padding: 8px 0;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            }
            
            .fake-products {
                display: flex;
                gap: 20px;
                margin-top: 20px;
            }
            
            .fake-product {
                background: rgba(255, 255, 255, 0.1);
                padding: 15px;
                border-radius: 8px;
                text-align: center;
            }
            
            .fake-product-image {
                background: rgba(255, 255, 255, 0.2);
                height: 100px;
                width: 100px;
                margin: 0 auto;
                border-radius: 8px;
            }
            
            .fake-button {
                background: white;
                color: #ff9900;
                border: none;
                padding: 8px 15px;
                border-radius: 5px;
                margin-top: 10px;
                cursor: pointer;
            }
            
            .fake-cat {
                margin-top: 20px;
                text-align: center;
            }
        `;
        document.head.appendChild(fakeElementsStyle);
        
        // Update the address bar with the proper URL format
        if (!browserUrlInput.value.startsWith('http')) {
            browserUrlInput.value = 'https://' + domain;
        }
        
        // Show notification
        showNotification(`Visited ${domain}`);
    }
}

console.log('App.js loaded successfully');

// After DOMContentLoaded event listener
function createFallbackCatImages() {
    console.log('Creating fallback cat images');
    
    // List of required cat images
    const requiredImages = [
        'cat-working.png',
        'cat-resting.png',
        'cat-waiting.png',
        'cat-idle.png',
        'cat-celebration.png',
        'cat-no.png'
    ];
    
    // Check which images are missing
    const missingImages = requiredImages.filter(img => {
        const image = new Image();
        image.src = `img/${img}`;
        return !image.complete;
    });
    
    // If pawshield.png exists, use it as fallback
    if (missingImages.length > 0) {
        console.log('Missing cat images detected, using fallbacks');
        
        // Use pawshield.png as fallback for cat images if it exists
        const pawshield = new Image();
        pawshield.src = 'img/pawshield.png';
        
        if (pawshield.complete) {
            missingImages.forEach(img => {
                // Create a copy of pawshield for each missing cat image
                const copyImg = document.createElement('img');
                copyImg.src = 'img/pawshield.png';
                copyImg.id = img.replace('.png', '');
                copyImg.style.display = 'none';
                copyImg.dataset.fallback = 'true';
                document.body.appendChild(copyImg);
            });
        }
    }
} 