const API_KEY = "9722676d3d4f7d9d41de4db8eb631f3f"; // Replace with your OpenWeather API key

async function fetchData(city) {
    try {
        const geoRes = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${API_KEY}`);
        const geoData = await geoRes.json();
        if (!geoData.length) {
            resultsDiv.innerHTML = "<p>Location not found. Try again.</p>";
            return;
        }

        const { lat, lon, name, state, country } = geoData[0];

        const aqiRes = await fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`);
        const aqiData = await aqiRes.json();
        const { aqi } = aqiData.list[0].main;
        const components = aqiData.list[0].components;

        const weatherRes = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);
        const weatherData = await weatherRes.json();

        const { temp, feels_like, temp_min, temp_max, humidity, pressure } = weatherData.main;
        const { speed: windSpeed, deg: windDir } = weatherData.wind;
        const weatherDesc = weatherData.weather[0].description;
        const weatherIcon = weatherData.weather[0].icon;

        const forecastRes = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);
        const forecastData = await forecastRes.json();

        resultsDiv.innerHTML = `
            <h2>${name}, ${state ? state + ', ' : ''}${country}</h2>

            <div class="aqi-container">
                <h3>🌍 Air Quality Index (AQI)</h3>
                <p><strong>AQI Level:</strong> ${aqi} (${getAqiDescription(aqi)})</p>
                <div class="data-grid">
                    ${Object.entries(components).map(([key, value]) => `<div><strong>${key.toUpperCase()}:</strong> ${value} µg/m³</div>`).join('')}
                </div>
            </div>

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
        resultsDiv.innerHTML = "<p>Error fetching data. Please try again.</p>";
    }
}

document.getElementById("searchButton").addEventListener("click", () => {
    const city = document.getElementById("cityInput").value;
    if (city) fetchData(city);
});

function getAqiDescription(aqi) {
    return ["Good", "Fair", "Moderate", "Poor", "Very Poor"][aqi - 1] || "Unknown";
}
