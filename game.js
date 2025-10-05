import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import sunTexture from './Textures/sun_texture.jpg';
import earthTextureImg from './Textures/Earth.jpeg';
import asteroidTextureImg from './Textures/asteroid_texture.jpeg';

document.addEventListener("DOMContentLoaded", () => {
    // Creating base --> starts
    const canvas = document.getElementById("play");
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas });

    function resizeRendererToDisplaySize() {
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        const needResize = canvas.width !== width || canvas.height !== height;
        if (needResize) {
            renderer.setSize(width, height, false);
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
        }
        return needResize;
    }

    resizeRendererToDisplaySize();

    camera.position.z = 100;

    // OrbitControls initialization
    const controls = new OrbitControls(camera, renderer.domElement);

    // Texture loader
    const textureLoader = new THREE.TextureLoader();

    // 3D models --> starts
    // Sun
    const sunTextureLoaded = textureLoader.load(sunTexture);
    const sunGeometry = new THREE.SphereGeometry(30, 128, 128);
    const sunMaterial = new THREE.MeshBasicMaterial({ map: sunTextureLoaded });
    const sun = new THREE.Mesh(sunGeometry, sunMaterial);
    sun.position.set(0, 0, 0);
    scene.add(sun);

    // Earth
    const earthTexture = textureLoader.load(earthTextureImg);
    const earthGeometry = new THREE.SphereGeometry(20, 128, 128);
    const earthMaterial = new THREE.MeshBasicMaterial({ map: earthTexture });
    const earth = new THREE.Mesh(earthGeometry, earthMaterial);
    earth.position.set(100, 0, 0);
    scene.add(earth);

    // Asteroid
    const asteroidTexture = textureLoader.load(asteroidTextureImg);
    const asteroidGeometry = new THREE.SphereGeometry(15, 128, 128);
    const asteroidMaterial = new THREE.MeshBasicMaterial({ map: asteroidTexture });
    const asteroid = new THREE.Mesh(asteroidGeometry, asteroidMaterial);
    asteroid.position.set(-90, 20, 0);
    scene.add(asteroid);
    // 3D models --> ends

    // Stars in the background
    function createStars() {
        const starGeometry = new THREE.BufferGeometry();
        const starCount = 1000; // Adjust for more or fewer stars
        const starVertices = [];

        for (let i = 0; i < starCount; i++) {
            const x = THREE.MathUtils.randFloatSpread(2000); // Spread stars across space
            const y = THREE.MathUtils.randFloatSpread(2000);
            const z = THREE.MathUtils.randFloatSpread(2000);
            starVertices.push(x, y, z);
        }

        starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));

        const starMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 1 });
        const stars = new THREE.Points(starGeometry, starMaterial);
        scene.add(stars);
    }

    createStars();

    // Animation loop
    function animate() {
        requestAnimationFrame(animate);

        // Optional rotation
        sun.rotation.y += 0.001;
        earth.rotation.y += 0.01;
        asteroid.rotation.y += 0.02;

        controls.update();

        renderer.render(scene, camera);
    }
    animate();

    //End of 3js part

    //==========================================+++++=================================
    
    // Popup message (non-alert)
    const popup = document.createElement('div');
    popup.id = 'infoPopup';
    popup.innerHTML = `
        <h2>Note!</h2>
        <p>This page is for fun and play, so the data is not scientifically accurate.</p>
        <p>All calculations are based on average values, like average density to calculate mass, etc.</p>
        <button id="closePopup">Got it!</button>
    `;
    document.body.appendChild(popup);

    // CSS styling for the popup (responsive and bigger)
    const style = document.createElement('style');
    style.innerHTML = `
        #infoPopup {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0,0,0,0.9);
            color: #fff;
            padding: 25px 35px;
            border-radius: 15px;
            box-shadow: 0 0 20px #000;
            max-width: 90%;
            width: 400px;
            text-align: center;
            z-index: 9999;
            font-family: Arial, sans-serif;
            font-size: 16px;
        }
        #infoPopup h2 {
            margin-top: 0;
            color: #ffcc00;
            font-size: 1.5em;
        }
        #infoPopup button {
            margin-top: 20px;
            padding: 10px 20px;
            border: none;
            border-radius: 7px;
            background-color: #ffcc00;
            color: #000;
            font-weight: bold;
            font-size: 1em;
            cursor: pointer;
        }
        #infoPopup button:hover {
            background-color: #ffaa00;
        }
        @media (max-width: 768px) {
            #infoPopup {
                width: 80%;
                padding: 20px 25px;
                font-size: 14px;
            }
            #infoPopup h2 {
                font-size: 1.3em;
            }
            #infoPopup button {
                padding: 8px 16px;
                font-size: 0.9em;
            }
        }
    `;
    document.head.appendChild(style);

    // Close popup functionality
    document.getElementById('closePopup').addEventListener('click', () => {
        popup.style.display = 'none';
    });

    const asteroidID = localStorage.getItem("selectedAsteroidID");
    const asteroid_name = localStorage.getItem("Name")
    document.getElementById("id").innerText=asteroidID;
    document.getElementById("name").innerText=asteroid_name;
    
    const butt = document.getElementById("fc");
    if (butt) {
        butt.addEventListener("click", () => {
            let diameter = parseFloat(localStorage.getItem("Diameter"));
            let velocity = parseFloat(localStorage.getItem("Velocity"));

            if (isNaN(diameter) || isNaN(velocity)) {
                alert("Diameter or Velocity not set in localStorage.");
                return;
            }

            const avgDensity = 3000; // kg/m^3, average density for an asteroid

            // Calculate area of asteroid as a circle (π * r^2)
            const radius = diameter / 2;
            let area = Math.PI * radius * radius;

            // Remove 20% of area as asteroid is irregular
            area = area * 0.8;

            // Approximate volume as area * diameter (assuming roughly spherical)
            const volume = area * diameter;

            // Mass = density * volume
            const mass = avgDensity * volume;

            // Impact energy: E = 1/2 m v^2
            const energy = 0.5 * mass * (velocity *velocity); // in Joules

            // Compare to Nagasaki nuke (~21 kilotons = 8.8e13 J)
            const nukeEnergy = 8.8e13;
            const energyInNuke = energy / nukeEnergy;

            // Crater size (simple empirical formula, D in meters)
            const craterDiameter = 0.07 * Math.pow(mass, 0.3333) * Math.pow(velocity, 0.3333);

            // Tsunami height (rough estimate, meters)
            const tsunamiHeight = 0.1 * craterDiameter;

            document.getElementById("mass").innerText = mass.toFixed(2) + " kg";
            document.getElementById("E").innerText = energy.toExponential(2) + " J";
            document.getElementById("NE").innerText = energyInNuke.toFixed(2) + " times Nagasaki nuke";
            document.getElementById("csz").innerText = craterDiameter.toFixed(2) + " m";
            document.getElementById("tslv").innerText = tsunamiHeight.toFixed(2) + " m";
        });
    }
});