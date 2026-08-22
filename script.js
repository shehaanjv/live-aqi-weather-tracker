const API_KEY = "9722676d3d4f7d9d41de4db8eb631f3f"; // Replace with your actual OpenWeather API key

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("searchButton").addEventListener("click", () => {
        const city = document.getElementById("cityInput").value;
        if (city) fetchAqiData(city);
    });

    document.getElementById("locateMeButton").addEventListener("click", () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    fetchAqiByCoords(latitude, longitude);
                },
                (error) => {
                    document.getElementById("resultsDiv").innerHTML = "<p>Location access denied. Please enable location services.</p>";
                }
            );
        } else {
            document.getElementById("resultsDiv").innerHTML = "<p>Geolocation is not supported by this browser.</p>";
        }
    });
});

// Fetch AQI data based on user input city
async function fetchAqiData(city) {
    try {
        const geoRes = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=5&appid=${API_KEY}`);
        const geoData = await geoRes.json();
        if (!geoData.length) {
            document.getElementById("resultsDiv").innerHTML = "<p>Location not found. Try again.</p>";
            return;
        }
        const { lat, lon } = geoData[0];
        fetchAqiByCoords(lat, lon);
    } catch (error) {
        document.getElementById("resultsDiv").innerHTML = "<p>Error fetching AQI data. Try again.</p>";
    }
}

// Fetch AQI data based on coordinates
async function fetchAqiByCoords(lat, lon) {
    try {
        const aqiRes = await fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`);
        const aqiData = await aqiRes.json();
        const { aqi } = aqiData.list[0].main;
        document.getElementById("resultsDiv").innerHTML = `
            <h2>AQI at Your Location</h2>
            <p><strong>AQI Level:</strong> ${aqi} (${getAqiDescription(aqi)})</p>
        `;
    } catch (error) {
        document.getElementById("resultsDiv").innerHTML = "<p>Error fetching AQI data. Try again.</p>";
    }
}

// Function to get AQI description
function getAqiDescription(aqi) {
    return ["Good", "Fair", "Moderate", "Poor", "Very Poor"][aqi - 1] || "Unknown";
}
