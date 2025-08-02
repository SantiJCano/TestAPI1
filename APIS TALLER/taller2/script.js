// script.js

const API_KEY = "0f7df6c944465419cfc42a66751906d9"; // <-- API KEY de OpenWeatherMap

// Normaliza la ciudad: quita espacios extras y pone mayúscula inicial a cada palabra
function normalizeCityName(city) {
  return city
    .trim()
    .toLowerCase()
    .split(' ')
    .filter(Boolean)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

async function getWeatherByCity(city) {
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric&lang=es`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    if (!response.ok) {
      // Muestra el mensaje de error real de la API
      console.error("Error de OpenWeatherMap:", data);
      throw new Error(data.message || "Ciudad no encontrada");
    }
    return data;
  } catch (error) {
    // También muestra el error en consola para depuración
    console.error("Error de red o de fetch:", error);
    throw error;
  }
}

function renderWeather(data) {
  const weatherDiv = document.getElementById("weatherResult");
  weatherDiv.innerHTML = `
    <div class="card mt-3">
      <div class="card-body">
        <h5 class="card-title">${data.name}, ${data.sys.country}</h5>
        <h6 class="card-subtitle mb-2 text-muted">${data.weather[0].description}</h6>
        <p class="card-text">
          <strong>Temperatura:</strong> ${data.main.temp} °C<br>
          <strong>Sensación térmica:</strong> ${data.main.feels_like} °C<br>
          <strong>Humedad:</strong> ${data.main.humidity} %
        </p>
      </div>
    </div>
  `;
}

document.getElementById("weatherForm").addEventListener("submit", async function (e) {
  e.preventDefault();
  let city = document.getElementById("cityInput").value;
  city = normalizeCityName(city); // Normaliza el input del usuario
  const weatherDiv = document.getElementById("weatherResult");
  weatherDiv.innerHTML = "<div class='alert alert-info'>Buscando clima...</div>";
  try {
    const data = await getWeatherByCity(city);
    renderWeather(data);
  } catch (error) {
    weatherDiv.innerHTML = `<div class="alert alert-danger">${error.message}</div>`;
  }
});