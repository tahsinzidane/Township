function updateClock() {
    const clockElement = document.getElementById('live-clock');
    const now = new Date();

    let hours = now.getHours();
    let minutes = now.getMinutes();
    let seconds = now.getSeconds();
    const ampm = hours >= 12 ? 'PM' : 'AM';

    hours = hours % 12 || 12;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    seconds = seconds < 10 ? '0' + seconds : seconds;

    clockElement.textContent = `⏰ ${hours}:${minutes}:${seconds} ${ampm}`;
}

async function updateWeather() {
    const weatherElement = document.getElementById('live-weather');
    const apiKey = 'd5939d9c555fa58e445b8001497e2b1b';
    const latitude = 22.7185;
    const longitude = 89.0706;
    const units = 'metric';

    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=${units}&appid=${apiKey}`);
        const data = await response.json();

        if (data.weather && data.weather.length > 0) {
            const weatherDescription = data.weather[0].description;
            const temperature = Math.round(data.main.temp);
            weatherElement.textContent = `☀️ ${weatherDescription.charAt(0).toUpperCase() + weatherDescription.slice(1)} ${temperature}°C (Satkhira)`;
        }
    } catch (error) {
        console.error("Failed to fetch weather data:", error);
        weatherElement.textContent = "Weather data unavailable";
    }
}

// Initial call to display time and weather right away
updateClock();
updateWeather();

// Update the clock every second
setInterval(updateClock, 1000);

// Update the weather every 10 minutes (600,000 milliseconds)
setInterval(updateWeather, 600000);










// img slider script
let currentSlide = 0;
const slides = document.querySelectorAll('.slide');
const totalSlides = slides.length;

// Function to show the current slide
function showSlide(index) {
    slides.forEach((slide) => {
        slide.style.display = 'none'; // Hide all slides
    });
    slides[index].style.display = 'block'; // Show the current slide
}

// Function to change slide
function changeSlide(n) {
    currentSlide += n;
    if (currentSlide < 0) {
        currentSlide = totalSlides - 1; // Loop to last slide
    } else if (currentSlide >= totalSlides) {
        currentSlide = 0; // Loop to first slide
    }
    showSlide(currentSlide);
}

// Automatic slide change every 3 seconds
setInterval(() => {
    changeSlide(1); // Change to the next slide
}, 3000);

// Initially show the first slide
showSlide(currentSlide);










// Toggle form visibility and close when clicking outside
document.addEventListener('DOMContentLoaded', function () {
    const commentBtn = document.getElementById('commentBtn');
    const commentForm = document.getElementById('commentForm');

    commentBtn.addEventListener('click', function () {
        commentForm.style.display = commentForm.style.display === 'none' ? 'block' : 'none';
    });

    // Close form if clicked outside of it
    document.addEventListener('click', function (event) {
        if (commentForm.style.display === 'block' && !commentForm.contains(event.target) && event.target !== commentBtn) {
            commentForm.style.display = 'none';
        }
    });
});

