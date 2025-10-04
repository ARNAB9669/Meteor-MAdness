document.addEventListener("DOMContentLoaded", () => {
    const req_all = document.getElementById("all");
    const req_near = document.getElementById("near");
    const req_danger = document.getElementById("danger");
    const cardsContainer = document.getElementById("cards-container");
    const totalAsteroidsCount = document.querySelector(".count1 h3");
    const potentialThreatsCount = document.querySelector(".count2 h3");

    const url = "https://script.google.com/macros/s/AKfycbzOGI_ekru4-XfWBIckCcN3rjEPbus_35swS4huGoxxeDV-7COiLfNvf-DQ6OB4Kh85pg/exec";

    function createCard(asteroid) {
        const card = document.createElement("div");
        card.classList.add("card");
        if (asteroid.Hazardous) card.classList.add("hazardous");

        card.innerHTML = `
            <div class="card-header">
                <h3>${asteroid.Name}</h3>
                <span class="id">ID: ${asteroid.ID}</span>
            </div>
            <div class="card-body">
                <p><strong>Diameter:</strong> ${asteroid.Diameter_max_km}</p>
                <p><strong>Miss Distance:</strong> ${asteroid.Miss_distance_km} km</p>
                <p><strong>Hazardous:</strong> <span class="hazardous-status">${asteroid.Hazardous ? "Yes" : "No"}</span></p>
                <p><strong>Orbiting Body:</strong> ${asteroid.Orbiting_body}</p>
            </div>
        `;

        card.addEventListener("click", () => {
            localStorage.setItem("selectedAsteroidID", asteroid.ID);
            window.location.href = "Dashboard.html";
        });

        return card;
    }

    function renderCards(asteroids) {
        cardsContainer.innerHTML = '';
        asteroids.forEach(a => cardsContainer.appendChild(createCard(a)));
    }

    function updateCounts(allAsteroids, hazardousAsteroids) {
        totalAsteroidsCount.textContent = allAsteroids.length;
        potentialThreatsCount.textContent = hazardousAsteroids.length;
    }

    async function fetchData() {
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();
            console.log(data); // debug
            return Array.isArray(data) ? data : [];
        } catch (error) {
            console.error(error);
            cardsContainer.innerHTML = `<p class="error-message">Failed to load asteroid data. Please try again later.</p>`;
            return [];
        }
    }

    async function showAllAsteroids() {
        const asteroids = await fetchData();
        const hazardous = asteroids.filter(a => a.Hazardous);
        renderCards(asteroids);
        updateCounts(asteroids, hazardous);
    }

    async function showNearEarthAsteroids() {
        const asteroids = await fetchData();
        const nearAsteroids = asteroids.filter(a => (a["Miss_distance_km"] / 149597870) < 0.2); // Converting km to AU for near-Earth filter

        const hazardous = asteroids.filter(a => a.Hazardous);
        renderCards(nearAsteroids);
        updateCounts(asteroids, hazardous);
    }

    async function showHazardousAsteroids() {
        const asteroids = await fetchData();
        const hazardous = asteroids.filter(a => a.Hazardous);
        renderCards(hazardous);
        updateCounts(asteroids, hazardous);
    }

    req_all.addEventListener("click", () => {
        req_all.style = "background-color: red;border: 3px solid red;box-shadow: none;";
        req_near.style = req_danger.style = "";
        document.getElementById("change").innerText = "ALL_ASTEROID";
        showAllAsteroids();
    });

    req_near.addEventListener("click", () => {
        req_near.style = "background-color: red;border: 3px solid red;box-shadow: none;";
        req_all.style = req_danger.style = "";
        document.getElementById("change").innerText = "NEAR_EARTH_ASTEROID";
        showNearEarthAsteroids();
    });

    req_danger.addEventListener("click", () => {
        req_danger.style = "background-color: red;border: 3px solid red;box-shadow: none;";
        req_all.style = req_near.style = "";
        document.getElementById("change").innerText = "ASTEROIDS_WITH_HIGH_RISK";
        showHazardousAsteroids();
    });
});