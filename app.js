// FocusPaws - Main JavaScript File

// DOM Elements
const navLinks = document.querySelectorAll('nav a');
const sections = document.querySelectorAll('section');
const websiteUrlInput = document.getElementById('website-url');
const blockBtn = document.getElementById('block-btn');
const blockedList = document.getElementById('blocked-list');
const blockerOverlay = document.getElementById('blocker-overlay');
const blockedSiteName = document.getElementById('blocked-site-name');
const backToWorkBtn = document.getElementById('back-to-work-btn');
const startTimer = document.getElementById('start-timer');
const pauseTimer = document.getElementById('pause-timer');
const resetTimer = document.getElementById('reset-timer');
const minutesDisplay = document.getElementById('minutes');
const secondsDisplay = document.getElementById('seconds');
const workDurationInput = document.getElementById('work-duration');
const breakDurationInput = document.getElementById('break-duration');
const catStatus = document.getElementById('cat-status');
const taskInput = document.getElementById('task-input');
const addTaskBtn = document.getElementById('add-task-btn');
const taskList = document.getElementById('task-list');
const taskReward = document.getElementById('task-reward');
const focusSessionsEl = document.getElementById('focus-sessions');
const completedTasksEl = document.getElementById('completed-tasks');
const totalFocusTimeEl = document.getElementById('total-focus-time');
const productivityChart = document.getElementById('productivity-chart');
const soundToggle = document.getElementById('sound-toggle');
const notificationToggle = document.getElementById('notification-toggle');
const themeOptions = document.querySelectorAll('.theme-option');
const catOptions = document.querySelectorAll('.cat-option');

// App State
const state = {
    blockedWebsites: JSON.parse(localStorage.getItem('blockedWebsites')) || [],
    tasks: JSON.parse(localStorage.getItem('tasks')) || [],
    stats: JSON.parse(localStorage.getItem('stats')) || {
        focusSessions: 0,
        completedTasks: 0,
        totalFocusTime: 0,
        dailyFocusTime: {} // Format: { "YYYY-MM-DD": minutes }
    },
    settings: JSON.parse(localStorage.getItem('settings')) || {
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

// Initialize the app
function initApp() {
    // Set up navigation
    navLinks.forEach(link => {
        link.addEventListener('click', navHandler);
    });

    // Initialize website blocker
    renderBlockedWebsites();
    blockBtn.addEventListener('click', addBlockedWebsite);
    backToWorkBtn.addEventListener('click', closeOverlay);

    // Initialize timer
    updateTimerDisplay();
    startTimer.addEventListener('click', startPomodoroTimer);
    pauseTimer.addEventListener('click', pausePomodoroTimer);
    resetTimer.addEventListener('click', resetPomodoroTimer);
    workDurationInput.addEventListener('change', updateTimerSettings);
    breakDurationInput.addEventListener('change', updateTimerSettings);

    // Initialize tasks
    renderTasks();
    addTaskBtn.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', e => {
        if (e.key === 'Enter') addTask();
    });

    // Initialize progress charts
    updateStats();
    renderProductivityChart();

    // Initialize settings
    initializeSettings();
    soundToggle.addEventListener('change', updateSoundSetting);
    notificationToggle.addEventListener('change', updateNotificationSetting);
    themeOptions.forEach(option => {
        option.addEventListener('click', updateTheme);
    });
    catOptions.forEach(option => {
        option.addEventListener('click', updateCatCharacter);
    });

    // URL Blocker Initialization for web usage
    checkCurrentWebsite();
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
    // For the web app version, we'll simulate this with mock functionality
    
    // For demo purposes, we'll add a listener to simulate visiting a blocked site
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
}

function showBlockedOverlay(website) {
    blockedSiteName.textContent = website;
    blockerOverlay.style.display = 'flex';
    playCatSound('meow');
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
    if (state.timer.isRunning && !state.timer.isPaused) return;
    
    if (state.timer.isPaused) {
        state.timer.isPaused = false;
    } else {
        state.timer.isRunning = true;
        state.timer.isPaused = false;
        
        // Apply timer settings
        if (!state.timer.isBreak) {
            state.timer.minutes = parseInt(workDurationInput.value, 10) || 25;
        } else {
            state.timer.minutes = parseInt(breakDurationInput.value, 10) || 5;
        }
        state.timer.seconds = 0;
        updateTimerDisplay();
        
        // Update cat animation
        updateCatAnimation(state.timer.isBreak ? 'break' : 'focus');
    }
    
    state.timer.interval = setInterval(updateTimer, 1000);
    
    // Update button states
    startTimer.disabled = true;
    pauseTimer.disabled = false;
    resetTimer.disabled = false;
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
    state.timer.isRunning = false;
    state.timer.isPaused = false;
    state.timer.isBreak = false;
    state.timer.minutes = parseInt(workDurationInput.value, 10) || 25;
    state.timer.seconds = 0;
    
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
    if (state.timer.seconds > 0) {
        state.timer.seconds--;
    } else if (state.timer.minutes > 0) {
        state.timer.minutes--;
        state.timer.seconds = 59;
    } else {
        // Timer completed
        clearInterval(state.timer.interval);
        state.timer.isRunning = false;
        state.timer.isPaused = false;
        
        if (!state.timer.isBreak) {
            // Work session completed
            state.timer.isBreak = true;
            state.timer.minutes = parseInt(breakDurationInput.value, 10) || 5;
            state.stats.focusSessions++;
            state.stats.totalFocusTime += parseInt(workDurationInput.value, 10);
            
            // Update daily focus time
            const today = new Date().toISOString().split('T')[0];
            if (!state.stats.dailyFocusTime[today]) {
                state.stats.dailyFocusTime[today] = 0;
            }
            state.stats.dailyFocusTime[today] += parseInt(workDurationInput.value, 10);
            
            saveStats();
            updateStats();
            renderProductivityChart();
            
            // Show notification
            showNotification('Work session completed! Time for a break!');
            playCatSound('purr');
            
        } else {
            // Break completed
            state.timer.isBreak = false;
            state.timer.minutes = parseInt(workDurationInput.value, 10) || 25;
            
            // Show notification
            showNotification('Break completed! Ready to focus again?');
            playCatSound('meow');
        }
        
        // Update cat animation
        updateCatAnimation(state.timer.isBreak ? 'break' : 'focus');
        
        // Reset button states
        startTimer.disabled = false;
        startTimer.textContent = 'Start';
        pauseTimer.disabled = true;
        
        // Start next session automatically after a short delay
        setTimeout(() => {
            if (!state.timer.isRunning && !state.timer.isPaused) {
                startPomodoroTimer();
            }
        }, 3000);
    }
    
    updateTimerDisplay();
}

function updateTimerDisplay() {
    minutesDisplay.textContent = state.timer.minutes.toString().padStart(2, '0');
    secondsDisplay.textContent = state.timer.seconds.toString().padStart(2, '0');
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
    let catImagePath;
    
    switch (status) {
        case 'focus':
            catImagePath = `img/cat-working.png`;
            catStatus.style.transform = 'scale(1)';
            break;
        case 'break':
            catImagePath = `img/cat-resting.png`;
            catStatus.style.transform = 'scale(1)';
            break;
        case 'pause':
            catImagePath = `img/cat-waiting.png`;
            catStatus.style.transform = 'scale(0.9)';
            break;
        default:
            catImagePath = `img/cat-idle.png`;
            catStatus.style.transform = 'scale(1)';
    }
    
    // Use the selected cat character from settings if available
    const catCharacter = state.settings.catCharacter;
    if (catCharacter !== 'tabby') {
        // Create character-specific path - in a full implementation this would use different cat images
        catImagePath = catImagePath.replace('.png', `-${catCharacter}.png`);
    }
    
    // Fallback to the default image if the custom one doesn't exist
    catStatus.src = catImagePath;
    catStatus.onerror = () => {
        catStatus.src = catImagePath.replace(`-${catCharacter}.png`, '.png');
    };
}

// =========================
// Task Manager Functions
// =========================

function addTask() {
    const taskText = taskInput.value.trim();
    
    if (!taskText) {
        showNotification('Please enter a task');
        return;
    }
    
    const newTask = {
        id: Date.now(),
        text: taskText,
        completed: false,
        createdAt: new Date().toISOString()
    };
    
    state.tasks.push(newTask);
    saveTasks();
    renderTasks();
    taskInput.value = '';
    showNotification('Task added');
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
    taskList.innerHTML = '';
    
    if (state.tasks.length === 0) {
        taskList.innerHTML = '<li class="empty-list">No tasks yet. Add one above!</li>';
        return;
    }
    
    // First show active tasks, then completed ones
    const activeTasks = state.tasks.filter(task => !task.completed);
    const completedTasks = state.tasks.filter(task => task.completed);
    
    [...activeTasks, ...completedTasks].forEach(task => {
        const li = document.createElement('li');
        if (task.completed) {
            li.classList.add('completed');
        }
        
        li.innerHTML = `
            <span>${task.text}</span>
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
        
        // Add event listeners
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
    focusSessionsEl.textContent = state.stats.focusSessions;
    completedTasksEl.textContent = state.stats.completedTasks;
    totalFocusTimeEl.textContent = `${state.stats.totalFocusTime} mins`;
}

function renderProductivityChart() {
    if (!productivityChart) return;
    
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
    
    // Check if Chart is already initialized
    if (window.productivityChartInstance) {
        window.productivityChartInstance.destroy();
    }
    
    // Create chart
    window.productivityChartInstance = new Chart(productivityChart, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Focus Time (minutes)',
                    data: focusTimeData,
                    backgroundColor: 'rgba(161, 98, 232, 0.5)',
                    borderColor: 'rgba(161, 98, 232, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Completed Tasks',
                    data: tasksData,
                    backgroundColor: 'rgba(255, 107, 107, 0.5)',
                    borderColor: 'rgba(255, 107, 107, 1)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true
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
    
    // In a real implementation, this would play actual sounds
    console.log(`Playing ${soundType} sound`);
    
    // Simulate sound for this demo
    const audio = new Audio();
    
    switch (soundType) {
        case 'meow':
            audio.src = 'https://assets.mixkit.co/sfx/preview/mixkit-domestic-cat-meow-86.mp3';
            break;
        case 'purr':
            audio.src = 'https://assets.mixkit.co/sfx/preview/mixkit-kitty-purring-296.mp3';
            break;
        default:
            return;
    }
    
    audio.play().catch(e => console.log('Audio play error:', e));
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

// Initialize the app on DOM content loaded
document.addEventListener('DOMContentLoaded', initApp); 