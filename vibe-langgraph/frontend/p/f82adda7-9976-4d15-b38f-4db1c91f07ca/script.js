// script.js

// Mock sleep data (replace with actual data fetching)
const sleepData = [
  {
    "date": "2024-10-27",
    "sleep_start": "22:30",
    "sleep_end": "06:45",
    "total_sleep_duration_minutes": 495,
    "sleep_efficiency": 85,
    "sleep_stages": {
      "wake": 60,
      "light": 240,
      "deep": 90,
      "rem": 105
    },
    "notes": "Felt well-rested."
  },
  {
    "date": "2024-10-28",
    "sleep_start": "23:00",
    "sleep_end": "07:00",
    "total_sleep_duration_minutes": 480,
    "sleep_efficiency": 90,
    "sleep_stages": {
      "wake": 48,
      "light": 210,
      "deep": 120,
      "rem": 102
    },
    "notes": "Slightly restless sleep."
  },
  {
    "date": "2024-10-29",
    "sleep_start": "22:00",
    "sleep_end": "06:00",
    "total_sleep_duration_minutes": 480,
    "sleep_efficiency": 75,
    "sleep_stages": {
      "wake": 120,
      "light": 180,
      "deep": 60,
      "rem": 120
    },
    "notes": "Woke up several times during the night."
  }
];

document.addEventListener('DOMContentLoaded', () => {
  // Function to update the sleep data display (example)
  function updateSleepDataDisplay(data) {
    const dataDisplay = document.getElementById('sleep-data-display'); // Assuming an element with this ID exists
    if (!dataDisplay) {
      console.error("Element with ID 'sleep-data-display' not found.");
      return;
    }

    // Clear existing content
    dataDisplay.innerHTML = '';

    // Create and append elements for each sleep entry
    data.forEach(entry => {
      const entryDiv = document.createElement('div');
      entryDiv.classList.add('sleep-entry', 'bg-white/10', 'backdrop-blur-lg', 'border', 'border-white/20', 'rounded-2xl', 'p-4', 'mb-4'); // Tailwind classes

      const dateHeader = document.createElement('h3');
      dateHeader.textContent = `Date: ${entry.date}`;
      dateHeader.classList.add('font-semibold', 'mb-2', 'text-lg'); // Tailwind classes

      const durationPara = document.createElement('p');
      durationPara.textContent = `Total Sleep: ${entry.total_sleep_duration_minutes} minutes`;
      durationPara.classList.add('text-gray-300'); // Tailwind classes

      const efficiencyPara = document.createElement('p');
      efficiencyPara.textContent = `Sleep Efficiency: ${entry.sleep_efficiency}%`;
      efficiencyPara.classList.add('text-gray-300'); // Tailwind classes

      entryDiv.appendChild(dateHeader);
      entryDiv.appendChild(durationPara);
      entryDiv.appendChild(efficiencyPara);

      dataDisplay.appendChild(entryDiv);
    });
  }

  // Initial data load (replace with API call)
  updateSleepDataDisplay(sleepData);

  // Example: Submit a form (if forms exist)
  const sleepForm = document.getElementById('sleep-form'); // Replace with your form's ID
  if (sleepForm) {
    sleepForm.addEventListener('submit', (event) => {
      event.preventDefault(); // Prevent default form submission

      // Get form data (example)
      const date = document.getElementById('date').value; // Replace with your input IDs
      const sleepDuration = document.getElementById('sleep-duration').value;

      // Process the data (e.g., send to server, update local data)
      console.log('Form submitted:', { date, sleepDuration });

      // Simulate adding new data to the sleepData array (for demonstration)
      const newSleepEntry = {
        date: date,
        total_sleep_duration_minutes: parseInt(sleepDuration),
        sleep_efficiency: 80, // Placeholder
        sleep_stages: {wake: 30, light: 200, deep: 100, rem:150},
        notes: "New entry"
      }
      sleepData.push(newSleepEntry);
      updateSleepDataDisplay(sleepData);

      // Optionally, reset the form
      sleepForm.reset();
    });
  }
});


// Animations using @keyframes (example - move to style.css for better organization)
// These animations can be triggered via JavaScript or CSS classes.  For example,
// you can add the class `animate-fade-in-up` to an element to trigger the animation.

// Define fade-in-up animation directly via Tailwind config in index.html (preferred)
// Or, define it here (less ideal)
/*
const style = document.createElement('style');
style.textContent = `
@keyframes fade-in-up {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.animate-fade-in-up {
    animation: fade-in-up 0.5s ease-out;
}
`;
document.head.appendChild(style);
*/

// Example: Add a class to trigger the animation (can be done dynamically)
// document.getElementById('some-element').classList.add('animate-fade-in-up');

// Haptic feedback (if supported)
function vibrate(duration) {
  if ("vibrate" in navigator) {
    navigator.vibrate(duration);
  }
}

// Example: Trigger haptic feedback on button click
// document.getElementById('my-button').addEventListener('click', () => {
//   vibrate(50); // Vibrate for 50 milliseconds
// });