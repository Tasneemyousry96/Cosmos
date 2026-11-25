
// Today in Space
const apodImage = document.getElementById("apod-image");
const apodTitle = document.getElementById("apod-title");
const apodExplanation = document.getElementById("apod-explanation");
const apodDate = document.getElementById("apod-date");
const apodDateInput = document.getElementById("apod-date-input");
const apodDateDetail = document.getElementById("apod-date-detail");
const apodDateInfo = document.getElementById("apod-date-info");
const apodCopyright = document.getElementById("apod-copyright");
const apodMediaType = document.getElementById("apod-media-type");
const loadDateBtn = document.getElementById("load-date-btn");
const todayApodBtn = document.getElementById("today-apod-btn");
const apodLoading = document.getElementById("apod-loading");
const apodDateLabel = document.getElementById("apod-date-label");
const apodImageContainer = document.getElementById("apod-image-container");


// Launches
const featuredLaunch = document.getElementById("featured-launch");
const launchesGrid = document.getElementById("launches-grid");
const launchesCount = document.getElementById("launches-count");
const launchesCountMobile = document.getElementById("launches-count-mobile");


// Set Maximum Date
const today = new Date();
const year = today.getFullYear();
const month = String(today.getMonth() + 1).padStart(2, "0");
const day = String(today.getDate()).padStart(2, "0");

apodDateInput.max = `${year}-${month}-${day}`;


// Format Date
function formatDate(date) {

    const newDate = new Date(date + "T00:00:00");

    return newDate.toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric"
    });

}


// Show Loading
function showLoading(isLoading) {

    if (isLoading) {
        apodLoading.classList.remove("hidden");
        apodImage.classList.add("hidden");
    } else {
        apodLoading.classList.add("hidden");
    }

    loadDateBtn.disabled = isLoading;
    todayApodBtn.disabled = isLoading;

}


// Display APOD
function displayApod(apod) {

    console.log("APOD Object:", apod);

    apodTitle.textContent = apod.title || "No Title Available";
    apodExplanation.textContent = apod.explanation || "No Explanation Available";

    const formattedDate = formatDate(apod.date);

    apodDate.textContent = `Astronomy Picture of the Day - ${formattedDate}`;
    apodDateLabel.textContent = formattedDate;
    apodDateInfo.textContent = apod.date;

    apodCopyright.textContent = apod.copyright || "NASA";
    apodMediaType.textContent = apod.media_type || "Unknown";

    apodDateInput.value = apod.date;

    apodImage.classList.add("hidden");

    if (apod.media_type === "image") {

        // Use HD Image URL
        const imageUrl = apod.hdurl || apod.url;

        console.log("APOD Image URL:", imageUrl);

        if (!imageUrl) {

            console.log("No Image URL Found");

            apodLoading.classList.add("hidden");

            return;

        }

        apodLoading.classList.remove("hidden");

        // Image Loaded
        apodImage.onload = function () {

            console.log("Image Loaded Successfully");

            console.log("Natural Width:", apodImage.naturalWidth);

            apodLoading.classList.add("hidden");

            apodImage.classList.remove("hidden");

        };

        // Image Error
        apodImage.onerror = function () {

            console.log("Image Failed to Load:", imageUrl);

            apodLoading.classList.add("hidden");

            apodImage.classList.add("hidden");

        };

        apodImage.alt = apod.title || "Astronomy Picture of the Day";

        apodImage.src = imageUrl;

    } else {

        console.log("APOD Media Type:", apod.media_type);

        apodLoading.classList.add("hidden");

        apodImage.classList.add("hidden");

    }

}


// Get Today's APOD
async function CallToday() {

    showLoading(true);

    try {

        const url = "https://science.nasa.gov/wp-json/wp/v2/apod-basic";

        const response = await fetch(url, {
            method: "GET"
        });

        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`);
        }

        const data = await response.json();

        console.log("Full APOD Response:", data);

        // API can return Array or Object
        const todayApod = Array.isArray(data) ? data[0] : data;

        if (!todayApod) {
            throw new Error("No APOD data found");
        }

        console.log("APOD Title:", todayApod.title);
        console.log("APOD Date:", todayApod.date);
        console.log("APOD Media Type:", todayApod.media_type);
        console.log("APOD HD URL:", todayApod.hdurl);

        displayApod(todayApod);

    } catch (error) {

        console.log("APOD Error:", error);

        apodLoading.classList.add("hidden");

        alert("Unable to load today's picture. Please try again.");

    }

}


// Load Today's Picture
CallToday();


// Get APOD by Selected Date
async function getApodByDate(date) {

    showLoading(true);

    try {

        const url = `https://science.nasa.gov/wp-json/wp/v2/apod-basic?date=${date}`;

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`);
        }

        const data = await response.json();

        console.log("Selected Date Response:", data);

        let selectedApod;

        if (Array.isArray(data)) {

            selectedApod = data.find(function (item) {
                return item.date === date;
            });

        } else {

            selectedApod = data;

        }

        if (!selectedApod || selectedApod.date !== date) {

            apodLoading.classList.add("hidden");

            alert("No image found for this date. Please choose another date.");

            return;

        }

        displayApod(selectedApod);

    } catch (error) {

        console.log("APOD Error:", error);

        apodLoading.classList.add("hidden");

        alert("Unable to load the selected date. Please try again.");

    }

}


// Load Selected Date
loadDateBtn.addEventListener("click", function () {

    const selectedDate = apodDateInput.value;

    if (selectedDate === "") {

        alert("Please select a date");

    } else if (selectedDate > apodDateInput.max) {

        alert("You cannot select a future date");

    } else {

        getApodByDate(selectedDate);

    }

});


// Back to Today
todayApodBtn.addEventListener("click", function () {

    CallToday();

});


// Get Upcoming Launches
async function getLaunches() {

    const cacheKey = "upcomingLaunches";
    const cacheDuration = 30 * 60 * 1000;

    // Check Cache
    const cachedData = localStorage.getItem(cacheKey);

    let cachedLaunches = null;

    if (cachedData) {

        try {

            const parsedData = JSON.parse(cachedData);

            cachedLaunches = parsedData.launches;

            // Check if Cache is Still Valid
            if (
                cachedLaunches &&
                Date.now() - parsedData.timestamp < cacheDuration
            ) {

                console.log("Loading Launches from Cache");

                displayLaunches(cachedLaunches);

                displayFeaturedLaunch(cachedLaunches[0]);

                launchesCount.textContent = cachedLaunches.length;
                launchesCountMobile.textContent = cachedLaunches.length;

                return;

            }

        } catch (error) {

            console.log("Cache Error:", error);

        }

    }


    // Fetch Data from API
    try {

        const url = "https://lldev.thespacedevs.com/2.3.0/launches/upcoming/?limit=10";

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`);
        }

        const data = await response.json();

        const launches = data.results;

        console.log("First Launch:", launches[0]);
        console.log("Launch Image:", launches[0]?.image);

        // Save Data in Cache
        localStorage.setItem(cacheKey, JSON.stringify({
            timestamp: Date.now(),
            launches: launches
        }));

        console.log("Loading Launches from API");

        displayLaunches(launches);

        displayFeaturedLaunch(launches[0]);

        launchesCount.textContent = launches.length;
        launchesCountMobile.textContent = launches.length;

    } catch (error) {

        console.log("Launches Error:", error);

        // Use Old Cache if API Fails
        if (cachedLaunches && cachedLaunches.length > 0) {

            console.log("Loading Old Launches from Cache");

            displayLaunches(cachedLaunches);

            displayFeaturedLaunch(cachedLaunches[0]);

            launchesCount.textContent = cachedLaunches.length;
            launchesCountMobile.textContent = cachedLaunches.length;

        } else {

            launchesGrid.innerHTML = "<p>Unable to load launches. Please try again later.</p>";

        }

    }

}


// Display Launches
function displayLaunches(launches) {

    let cartona = "";

    for (let i = 0; i < launches.length; i++) {

        cartona += `
            <div class="launch-card">

                <div class="launch-image">

                    ${launches[i].image?.image_url
                        ? `
                            <img
                                src="${launches[i].image.image_url}"
                                alt="${launches[i].name}"
                            >
                        `
                        : `
                            <div class="no-image">
                                No Image Available
                            </div>
                        `
                    }

                </div>

                <div class="launch-info">

                    <h3>${launches[i].name}</h3>

                    <p>
                        ${launches[i].launch_service_provider?.name || "Unknown Provider"}
                    </p>

                    <p>
                        ${launches[i].net || "Date not available"}
                    </p>

                    <p>
                        ${launches[i].status?.name || "Unknown Status"}
                    </p>

                    <p>
                        ${launches[i].pad?.name || "Unknown Launch Pad"}
                    </p>

                </div>

            </div>
        `;

    }

    launchesGrid.innerHTML = cartona;

}


// Display Featured Launch
function displayFeaturedLaunch(launch) {

    if (!launch) {
        return;
    }

    featuredLaunch.innerHTML = `

        <div class="featured-launch-card">

            <div class="featured-launch-image">

                ${launch.image?.image_url
                    ? `
                        <img
                            src="${launch.image.image_url}"
                            alt="${launch.name}"
                        >
                    `
                    : `
                        <div class="no-image">
                            No Image Available
                        </div>
                    `
                }

            </div>

            <div class="featured-launch-info">

                <h3>${launch.name}</h3>

                <p>
                    ${launch.launch_service_provider?.name || "Unknown Provider"}
                </p>

                <p>
                    ${launch.net || "Date not available"}
                </p>

                <p>
                    ${launch.status?.name || "Unknown Status"}
                </p>

                <p>
                    ${launch.rocket?.configuration?.name || "Unknown Rocket"}
                </p>

            </div>

        </div>

    `;

}


// Call Launches Function
getLaunches();


// Navigation
const navLinks = document.querySelectorAll(".nav-link");
const sections = document.querySelectorAll(".app-section");

navLinks.forEach(function (link) {

    link.addEventListener("click", function (e) {

        e.preventDefault();

        const sectionId = link.getAttribute("data-section");

        // Hide All Sections
        sections.forEach(function (section) {
            section.classList.add("hidden");
        });

        // Show Selected Section
        document.getElementById(sectionId).classList.remove("hidden");

    });

});




// ==================== PLANETS ====================

// Elements
const planetDetailImage = document.getElementById("planet-detail-image");
const planetDetailName = document.getElementById("planet-detail-name");
const planetDetailDescription = document.getElementById("planet-detail-description");

const planetDistance = document.getElementById("planet-distance");
const planetRadius = document.getElementById("planet-radius");
const planetMass = document.getElementById("planet-mass");
const planetDensity = document.getElementById("planet-density");
const planetOrbitalPeriod = document.getElementById("planet-orbital-period");
const planetRotation = document.getElementById("planet-rotation");
const planetMoons = document.getElementById("planet-moons");
const planetGravity = document.getElementById("planet-gravity");

const planetDiscoverer = document.getElementById("planet-discoverer");
const planetDiscoveryDate = document.getElementById("planet-discovery-date");
const planetBodyType = document.getElementById("planet-body-type");
const planetVolume = document.getElementById("planet-volume");

const planetFacts = document.getElementById("planet-facts");

const planetPerihelion = document.getElementById("planet-perihelion");
const planetAphelion = document.getElementById("planet-aphelion");
const planetEccentricity = document.getElementById("planet-eccentricity");
const planetInclination = document.getElementById("planet-inclination");
const planetAxialTilt = document.getElementById("planet-axial-tilt");
const planetTemp = document.getElementById("planet-temp");
const planetEscape = document.getElementById("planet-escape");

const planetComparisonTbody = document.getElementById(
    "planet-comparison-tbody"
);


// API
const planetsUrl =
    "https://solar-system-opendata-proxy.vercel.app/api/planets";


// Planet Images
const planetImages = {
    mercury: "./assets/images/mercury.png",
    venus: "./assets/images/venus.png",
    earth: "./assets/images/earth.png",
    mars: "./assets/images/mars.png",
    jupiter: "./assets/images/jupiter.png",
    saturn: "./assets/images/saturn.png",
    uranus: "./assets/images/uranus.png",
    neptune: "./assets/images/neptune.png"
};


// Planet Descriptions
const planetDescriptions = {
    mercury: "Mercury is the smallest planet in our solar system and the closest planet to the Sun.",
    venus: "Venus is the hottest planet in our solar system, with a thick atmosphere that traps heat.",
    earth: "Earth is our home planet and the only known planet to support life.",
    mars: "Mars is known as the Red Planet because of its reddish appearance.",
    jupiter: "Jupiter is the largest planet in our solar system and has a giant storm called the Great Red Spot.",
    saturn: "Saturn is famous for its beautiful and extensive ring system.",
    uranus: "Uranus is an ice giant that rotates on its side.",
    neptune: "Neptune is the farthest planet from the Sun and has extremely strong winds."
};


// Planet Quick Facts
const planetQuickFacts = {
    mercury: [
        "Mercury is the closest planet to the Sun.",
        "It has extreme temperature changes.",
        "It has no natural moons."
    ],

    venus: [
        "Venus is the hottest planet.",
        "Its atmosphere is mostly carbon dioxide.",
        "It rotates in the opposite direction to most planets."
    ],

    earth: [
        "Earth is the only known planet with life.",
        "About 71% of its surface is covered by water.",
        "Earth has one natural moon."
    ],

    mars: [
        "Mars is called the Red Planet.",
        "It has the largest volcano in the solar system.",
        "Scientists are searching for signs of ancient life on Mars."
    ],

    jupiter: [
        "Jupiter is the largest planet.",
        "Its Great Red Spot is a giant storm.",
        "It has a very strong magnetic field."
    ],

    saturn: [
        "Saturn has a spectacular ring system.",
        "It is less dense than water.",
        "Its rings are made mostly of ice and rocky material."
    ],

    uranus: [
        "Uranus rotates on its side.",
        "It has a blue-green color because of methane.",
        "It is classified as an ice giant."
    ],

    neptune: [
        "Neptune is the farthest planet from the Sun.",
        "It has some of the fastest winds in the solar system.",
        "It has a deep blue appearance."
    ]
};


// Format Number
function formatPlanetNumber(value, decimals = 2) {

    if (value === null || value === undefined || value === "") {
        return "N/A";
    }

    return Number(value).toLocaleString("en-US", {
        maximumFractionDigits: decimals
    });
}


// Format Large Number
function formatPlanetLargeNumber(value) {

    if (value === null || value === undefined) {
        return "N/A";
    }

    return Number(value).toLocaleString("en-US");
}


// Format Mass
function getPlanetMass(mass) {

    if (!mass || mass.massValue === undefined || mass.massExponent === undefined) {
        return "N/A";
    }

    return `${formatPlanetNumber(mass.massValue, 5)} × 10^${mass.massExponent} kg`;
}


// Format Volume
function getPlanetVolume(volume) {

    if (!volume || volume.volValue === undefined || volume.volExponent === undefined) {
        return "N/A";
    }

    return `${formatPlanetNumber(volume.volValue, 5)} × 10^${volume.volExponent} km³`;
}


// Format Temperature
function getPlanetTemperature(temp) {

    if (temp === null || temp === undefined) {
        return "N/A";
    }

    // API temperature is in Kelvin
    let celsius = Number(temp) - 273.15;

    return `${formatPlanetNumber(celsius, 1)} °C`;
}


// Format Moons
function getPlanetMoons(moons) {

    if (!moons) {
        return "0";
    }

    return moons.length;
}


// Get Planet Data
async function getPlanets() {

    try {

        let response = await fetch(planetsUrl);

        if (!response.ok) {
            throw new Error(`HTTP Error: ${response.status}`);
        }

        let data = await response.json();

        console.log("Planets Data:", data);

        let planets = data.bodies.filter(function (planet) {
            return planet.isPlanet === true;
        });

        // Match API names with HTML data-planet-id
        planets = planets.map(function (planet) {

            planet.planetId = planet.englishName.toLowerCase();

            return planet;
        });

        console.log("Filtered Planets:", planets);

        // Add click events to planet cards
        const planetCards = document.querySelectorAll(".planet-card");

        planetCards.forEach(function (card) {

            card.addEventListener("click", function () {

                let planetId = card.getAttribute("data-planet-id");

                let selectedPlanet = planets.find(function (planet) {
                    return planet.planetId === planetId;
                });

                if (selectedPlanet) {
                    displayPlanetDetails(selectedPlanet);
                }

            });

        });


        // Display Earth by default
        let earth = planets.find(function (planet) {
            return planet.planetId === "earth";
        });

        if (earth) {
            displayPlanetDetails(earth);
        }

        // Display comparison table
        displayPlanetComparison(planets);

    }

    catch (error) {

        console.log("Planets Error:", error);

        if (planetComparisonTbody) {
            planetComparisonTbody.innerHTML =
                `<tr><td colspan="7">Unable to load planets data. Please try again later.</td></tr>`;
        }

    }

}


// Display Planet Details
function displayPlanetDetails(planet) {

    let planetId = planet.planetId;

    // Image
    if (planetDetailImage) {
        planetDetailImage.src = planetImages[planetId] || "";
        planetDetailImage.alt = planet.englishName;
    }

    // Basic Information
    if (planetDetailName) {
        planetDetailName.textContent = planet.englishName;
    }

    if (planetDetailDescription) {
        planetDetailDescription.textContent =
            planetDescriptions[planetId] || "No description available.";
    }


    // Main Statistics
    if (planetDistance) {
        planetDistance.textContent =
            formatPlanetLargeNumber(planet.semimajorAxis) + " km";
    }

    if (planetRadius) {
        planetRadius.textContent =
            formatPlanetLargeNumber(planet.meanRadius) + " km";
    }

    if (planetMass) {
        planetMass.textContent = getPlanetMass(planet.mass);
    }

    if (planetDensity) {
        planetDensity.textContent =
            planet.density !== null && planet.density !== undefined
                ? formatPlanetNumber(planet.density, 2)
                : "N/A";
    }

    if (planetOrbitalPeriod) {
        planetOrbitalPeriod.textContent =
            formatPlanetNumber(planet.sideralOrbit, 2) + " days";
    }

    if (planetRotation) {
        planetRotation.textContent =
            formatPlanetNumber(planet.sideralRotation, 2) + " hours";
    }

    if (planetMoons) {
        planetMoons.textContent = getPlanetMoons(planet.moons);
    }

    if (planetGravity) {
        planetGravity.textContent =
            formatPlanetNumber(planet.gravity, 2) + " m/s²";
    }


    // Additional Information
    if (planetDiscoverer) {
        planetDiscoverer.textContent =
            planet.discoveredBy || "Unknown";
    }

    if (planetDiscoveryDate) {
        planetDiscoveryDate.textContent =
            planet.discoveryDate || "Known since ancient times";
    }

    if (planetBodyType) {
        planetBodyType.textContent =
            planet.bodyType || "Planet";
    }

    if (planetVolume) {
        planetVolume.textContent = getPlanetVolume(planet.vol);
    }


    // Planet Facts
    if (planetFacts) {

        let facts = planetQuickFacts[planetId] || [];

        planetFacts.innerHTML = facts.map(function (fact) {
            return `<li>${fact}</li>`;
        }).join("");

    }


    // Orbit Information
    if (planetPerihelion) {
        planetPerihelion.textContent =
            formatPlanetLargeNumber(planet.perihelion) + " km";
    }

    if (planetAphelion) {
        planetAphelion.textContent =
            formatPlanetLargeNumber(planet.aphelion) + " km";
    }

    if (planetEccentricity) {
        planetEccentricity.textContent =
            formatPlanetNumber(planet.eccentricity, 5);
    }

    if (planetInclination) {
        planetInclination.textContent =
            formatPlanetNumber(planet.inclination, 2) + "°";
    }

    if (planetAxialTilt) {
        planetAxialTilt.textContent =
            formatPlanetNumber(planet.axialTilt, 2) + "°";
    }

    if (planetTemp) {
        planetTemp.textContent =
            getPlanetTemperature(planet.avgTemp);
    }

    if (planetEscape) {
        planetEscape.textContent =
            formatPlanetNumber(planet.escape, 2);
    }

}


// Display Planet Comparison
function displayPlanetComparison(planets) {

    if (!planetComparisonTbody) {
        return;
    }

    planetComparisonTbody.innerHTML = "";

    // Sort planets by distance from the Sun
    planets.sort(function (a, b) {
        return a.semimajorAxis - b.semimajorAxis;
    });


    planets.forEach(function (planet) {

        let distanceAU = planet.semimajorAxis
            ? planet.semimajorAxis / 149597870.7
            : null;

        let diameter = planet.meanRadius
            ? planet.meanRadius * 2
            : null;

        let earthMass = "N/A";

        if (planet.mass && planet.mass.massValue !== undefined) {

            let massInKg =
                planet.mass.massValue * Math.pow(10, planet.mass.massExponent);

            earthMass = formatPlanetNumber(
                massInKg / 5.9722e24,
                4
            );

        }

        let orbitalPeriod = planet.sideralOrbit;
        let moonsCount = getPlanetMoons(planet.moons);

        let row = document.createElement("tr");

        row.innerHTML = `
            <td>${planet.englishName}</td>
            <td>${formatPlanetNumber(distanceAU, 3)} AU</td>
            <td>${formatPlanetLargeNumber(diameter)} km</td>
            <td>${earthMass} Earth</td>
            <td>${formatPlanetNumber(orbitalPeriod, 2)} days</td>
            <td>${moonsCount}</td>
            <td>${planet.bodyType || "Planet"}</td>
        `;

        planetComparisonTbody.appendChild(row);

    });

}


// Start Planets Page
getPlanets();
