const express = require('express');
const axios = require('axios');
const path = require('path'); 

const app = express();
const port = 3000;

app.use(express.json());

// Add a route to serve a simple HTML page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'weather.html')); // Assuming your HTML file is named index.html
});

app.post('/getWeather', async (req, res) => {
  try {
    const { cities } = req.body;

    if (!cities || !Array.isArray(cities) || cities.length === 0) {
      return res.status(400).json({ error: 'Invalid input. Please provide an array of cities.' });
    }

    const weatherResults = await getWeatherData(cities);

    res.json({ weather: weatherResults });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

async function getWeatherData(cities) {
  const apiKey = '4408ed2aa893b375092439eb9004da48'; // Replace with your OpenWeatherMap API key

  const weatherResults = {};

  const requests = cities.map(async (city) => {
    try {
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`
      );
      const cityName = response.data.name;
      const temperature = response.data.main.temp;
      const weatherCondition = response.data.weather[0].description;
      // const windSpeed = response.data.wind.speed;
      // const humidity = response.data.main.humidity;

      weatherResults[city] = {
        cityName : `${cityName}`,
        temperature: `${temperature}°C`,
        weatherCondition: `${weatherCondition}`,
        // windSpeed: `${windSpeed} km/h`,
        // humidity: `${humidity}%`,
      };
    } catch (error) {
      console.error(`Error fetching weather for ${city}:`, error.message);
      weatherResults[city] = {
        temperature: 'N/A',
        weatherCondition: 'N/A',
        windSpeed: 'N/A',
        humidity: 'N/A',
        sunDuration: 'N/A',
      };
    }
  });

  await Promise.all(requests);

  return weatherResults;
}

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
