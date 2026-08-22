const API_KEY = "9722676d3d4f7d9d41de4db8eb631f3f"; // Replace with your OpenWeather API key

async function fetchAqiData(city) {
    try {
        // Fetching the geolocation data for the city with higher preference for popular cities
        const geoRes = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=5&appid=${API_KEY}`);
        const geoData = await geoRes.json();
        
        // If no data found, return a message
        if (!geoData.length) {
            document.getElementById("resultsDiv").innerHTML = "<p>Location not found. Try again.</p>";
            return;
        }

        // Sort the locations by relevance: preference for larger/popular cities
        const sortedGeoData = geoData.sort((a, b) => {
            // We prioritize the place with a larger population or more relevant match
            return (b.population || 0) - (a.population || 0);
        });

        const { lat, lon, name, state, country } = sortedGeoData[0];  // Use the most popular or relevant city
        
        // Fetching the AQI data based on the selected coordinates (lat, lon)
        const aqiRes = await fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`);
        const aqiData = await aqiRes.json();

        const { aqi } = aqiData.list[0].main; // AQI level (1-5)
        const components = aqiData.list[0].components; // Air quality components (like CO, NO2, etc.)

        // Displaying the AQI results for the user
        document.getElementById("resultsDiv").innerHTML = `
            <h2>AQI in ${name}, ${state ? state + ', ' : ''}${country}</h2>
            <div class="aqi-container">
                <h3>🌍 Air Quality Index (AQI)</h3>
                <p><strong>AQI Level:</strong> ${aqi} (${getAqiDescription(aqi)})</p>
                <p><strong>Actual AQI Value:</strong> ${getAqiValue(aqi)}</p> <!-- Added actual AQI value -->
                <div class="data-grid">
                    ${Object.entries(components).map(([key, value]) => `<div><strong>${key.toUpperCase()}:</strong> ${value} µg/m³</div>`).join('')}
                </div>
            </div>
        `;
    } catch (error) {
        document.getElementById("resultsDiv").innerHTML = "<p>Error fetching AQI data. Please try again.</p>";
    }
}

async function fetchWeatherData(city) {
    try {
        // Fetching the geolocation data for the city with higher preference for popular cities
        const geoRes = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=5&appid=${API_KEY}`);
        const geoData = await geoRes.json();
        
        // If no data found, return a message
        if (!geoData.length) {
            document.getElementById("weatherResultsDiv").innerHTML = "<p>Location not found. Try again.</p>";
            return;
        }

        // Sort the locations by relevance: preference for larger/popular cities
        const sortedGeoData = geoData.sort((a, b) => {
            // We prioritize the place with a larger population or more relevant match
            return (b.population || 0) - (a.population || 0);
        });

        const { lat, lon, name, state, country } = sortedGeoData[0];  // Use the most popular or relevant city
        
        // Fetching the weather data for the selected coordinates (lat, lon)
        const weatherRes = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);
        const weatherData = await weatherRes.json();

        // Fetching the 5-day forecast
        const forecastRes = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);
        const forecastData = await forecastRes.json();

        const { temp, feels_like, temp_min, temp_max, humidity, pressure } = weatherData.main;
        const { speed: windSpeed, deg: windDir } = weatherData.wind;
        const weatherDesc = weatherData.weather[0].description;
        const weatherIcon = weatherData.weather[0].icon;

        // Displaying the weather results for the user
        document.getElementById("weatherResultsDiv").innerHTML = `
            <h2>Weather in ${name}, ${state ? state + ', ' : ''}${country}</h2>
            <div class="weather-container">
                <h3>🌦️ Current Weather</h3>
                <p><img src="https://openweathermap.org/img/wn/${weatherIcon}@2x.png" class="weather-icon" alt="${weatherDesc}"> ${weatherDesc}</p>
                <div class="data-grid">
                    <div><strong>Temperature:</strong> ${temp}°C</div>
                    <div><strong>Feels like:</strong> ${feels_like}°C</div>
                    <div><strong>Min Temp:</strong> ${temp_min}°C</div>
                    <div><strong>Max Temp:</strong> ${temp_max}°C</div>
                    <div><strong>Humidity:</strong> ${humidity}%</div>
                    <div><strong>Pressure:</strong> ${pressure} hPa</div>
                    <div><strong>Wind Speed:</strong> ${windSpeed} m/s</div>
                    <div><strong>Wind Direction:</strong> ${windDir}°</div>
                </div>
            </div>

            <div class="forecast-container">
                <h3>📅 5-Day Forecast</h3>
                <ul>
                    ${forecastData.list.slice(0, 5).map(item => `
                        <li><strong>${item.dt_txt}</strong> - ${item.weather[0].description}, ${item.main.temp}°C</li>
                    `).join('')}
                </ul>
            </div>
        `;
    } catch (error) {
        document.getElementById("weatherResultsDiv").innerHTML = "<p>Error fetching weather data. Please try again.</p>";
    }
}

// Detect which page is loaded and attach event listeners
document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById("searchButton")) {
        document.getElementById("searchButton").addEventListener("click", () => {
            const city = document.getElementById("cityInput").value;
            if (city) fetchAqiData(city);
        });
    }

    if (document.getElementById("searchWeatherButton")) {
        document.getElementById("searchWeatherButton").addEventListener("click", () => {
            const city = document.getElementById("cityInput").value;
            if (city) fetchWeatherData(city);
        });
    }
});

// Function to get AQI description based on the level (1-5)
function getAqiDescription(aqi) {
    return ["Good", "Fair", "Moderate", "Poor", "Very Poor"][aqi - 1] || "Unknown";
}

// Function to map the AQI level to an actual AQI value
function getAqiValue(aqi) {
    const aqiValues = {
        1: "0 - 50",
        2: "51 - 100",
        3: "101 - 150",
        4: "151 - 200",
        5: "201 - 300"
    };

    return aqiValues[aqi] || "Unknown";
}
