// script.js

// --- Daily Check-in Functionality ---
async function dailyCheckIn() {
    try {
        // Simulate API call (replace with actual API endpoint)
        const response = await fetch('/api/checkin', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ timestamp: new Date() })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Check-in successful:', data);
        showToast('Check-in successful!');
        scheduleReminder(); // Reschedule the next reminder
        saveCheckInTime(); // Save the check-in time for consistency

    } catch (error) {
        console.error('Check-in failed:', error);
        showToast('Check-in failed. Please try again.');
    }
}


// --- Reminder Scheduling ---
function scheduleReminder() {
    // Cancel any existing reminders
    clearTimeout(window.reminderTimeout);

    // Calculate the time for the next reminder (e.g., 24 hours from now)
    const nextReminderTime = new Date();
    nextReminderTime.setDate(nextReminderTime.getDate() + 1);
    nextReminderTime.setHours(9, 0, 0, 0); // Set to 9:00 AM
    const timeUntilNextReminder = nextReminderTime.getTime() - new Date().getTime();

    // Schedule the reminder
    window.reminderTimeout = setTimeout(() => {
        showReminderNotification();
    }, timeUntilNextReminder);

    console.log('Next reminder scheduled for:', nextReminderTime);
}

function showReminderNotification() {
    if (Notification.permission === 'granted') {
        new Notification('Guardian Angel Reminder', {
            body: 'Time for your daily check-in!',
            icon: 'assets/app_icon.png', // Replace with your app icon
        });
    } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                new Notification('Guardian Angel Reminder', {
                    body: 'Time for your daily check-in!',
                    icon: 'assets/app_icon.png', // Replace with your app icon
                });
            }
        });
    } else {
        showToast('Please enable notifications to receive reminders.');
    }
}


// --- Data Persistence (localStorage) ---
function saveCheckInTime() {
    localStorage.setItem('lastCheckInTime', new Date().toISOString());
}

function loadLastCheckInTime() {
    return localStorage.getItem('lastCheckInTime');
}


// --- Emergency Notification (Backend API) ---
async function sendEmergencyNotification() {
    try {
        // Simulate API call (replace with actual API endpoint)
        const response = await fetch('/api/emergency', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message: 'Emergency! User missed check-in.' })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Emergency notification sent:', data);
        showToast('Emergency notification sent to your trusted contacts.');

    } catch (error) {
        console.error('Failed to send emergency notification:', error);
        showToast('Failed to send emergency notification. Please try again later.');
    }
}

// --- Error Handling & User Feedback (Toast Notifications) ---
function showToast(message) {
    const toastContainer = document.getElementById('toast-container') || createToastContainer();
    const toast = document.createElement('div');
    toast.classList.add('toast');
    toast.textContent = message;
    toastContainer.appendChild(toast);

    // Animate toast appearance
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);

    // Remove the toast after a delay
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            toastContainer.removeChild(toast);
        }, 300); // Fade-out transition time
    }, 3000);
}

function createToastContainer() {
    const toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.classList.add('toast-container');
    document.body.appendChild(toastContainer);
    return toastContainer;
}


// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    // Load last check-in time
    const lastCheckInTime = loadLastCheckInTime();
    if (lastCheckInTime) {
        console.log('Last check-in:', lastCheckInTime);
    }

    // Schedule the first reminder
    scheduleReminder();

    // Attach event listener to the check-in button (assuming you have one)
    const checkInButton = document.getElementById('check-in-button');
    if (checkInButton) {
        checkInButton.addEventListener('click', dailyCheckIn);
    } else {
        console.warn('Check-in button not found.  Ensure an element with id "check-in-button" exists.');
    }

    // Request notification permission on page load
    if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
            console.log('Notification permission:', permission);
        });
    }
});


// --- CSS for Toast Notifications (Example) ---
const toastStyle = `
/* style.css or in a <style> tag */
.toast-container {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 1000;
}

.toast {
    background-color: rgba(0, 0, 0, 0.7);
    color: white;
    padding: 10px 20px;
    border-radius: 5px;
    margin-bottom: 10px;
    opacity: 0;
    transition: opacity 0.3s ease-in-out, transform 0.3s ease-in-out;
    transform: translateY(-20px);
}

.toast.show {
    opacity: 1;
    transform: translateY(0);
}
`;

// Create a style tag and append the CSS to the head
const styleTag = document.createElement('style');
styleTag.textContent = toastStyle;
document.head.appendChild(styleTag);