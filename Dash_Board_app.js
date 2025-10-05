import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import sunTexture from './Textures/sun_texture.jpg';
import earthTexture from './Textures/Earth.jpeg';
import asteroidTexture from './Textures/asteroid_texture.jpeg';

document.addEventListener("DOMContentLoaded", () => {
    
    const base_url = "https://script.google.com/macros/s/AKfycby29jhoLsLNUiFypxMqI0NQOPFpVh5VD9oWk1JpMGQHEHQNuE5SCyjvuj9qdzPv2zw_6w/exec";
    const asteroidID = localStorage.getItem("selectedAsteroidID");
    const url = `${base_url}?id=${asteroidID}`;
    fetch(url)
        .then(res => res.json())
        .then(data => {
            //---API Data Destructuring---
            const Semi_major_axis = data.Semi_major_axis;
            const Eccentricity = data.Eccentricity;
            const Inclination = data.Inclination;;
            const Perihelion = data.Perihelion;
            const Orbit_color = data.Orbit_color;
            const Orbital_period = data.Orbital_period; // Added for orbital period
            // --- Three.js Scene Setup ---
            const canvas = document.getElementById("play_Ground");
            const scene = new THREE.Scene();
            const solarSystemGroup = new THREE.Group();

            const camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 3000);
            const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
            renderer.setSize(canvas.clientWidth, canvas.clientHeight);
            renderer.setPixelRatio(window.devicePixelRatio);

            const controls = new OrbitControls(camera, canvas);
            controls.enableDamping = true;
            controls.dampingFactor = 0.09;
            camera.position.set(10, 25, 20);
            const gui = new GUI();
            const clock = new THREE.Clock();

            // --- Auto resize canvas on window resize ---
            window.addEventListener('resize', () => {
                const width = canvas.clientWidth;
                const height = canvas.clientHeight;
                camera.aspect = width / height;
                camera.updateProjectionMatrix();
                renderer.setSize(width, height);
            });

            // --- Stars ---
            const starGeom = new THREE.BufferGeometry();
            const starVertices = [];
            for (let i = 0; i < 5000; i++) {
                starVertices.push((Math.random() - 0.5) * 600);
                starVertices.push((Math.random() - 0.5) * 600);
                starVertices.push((Math.random() - 0.5) * 600);
            }
            starGeom.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
            solarSystemGroup.add(new THREE.Points(starGeom, new THREE.PointsMaterial({ color: 0xffffff, size: 0.2 })));

            // --- Sun ---
            const sun = new THREE.Mesh(new THREE.SphereGeometry(2.5, 75, 75), new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load(sunTexture) }));
            solarSystemGroup.add(sun);

            // --- Earth ---
            const earthOrbitRadius = 12;
            const earth = new THREE.Mesh(new THREE.SphereGeometry(0.8, 75, 75), new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load(earthTexture) }));
            solarSystemGroup.add(earth);

            const earthOrbitPoints = [];
            for (let t = 0; t <= 360; t++) {
                const rad = t * Math.PI / 180;
                earthOrbitPoints.push(new THREE.Vector3(earthOrbitRadius * Math.cos(rad), 0, earthOrbitRadius * Math.sin(rad)));
            }
            const earthOrbitLine = new THREE.Line(new THREE.BufferGeometry().setFromPoints(earthOrbitPoints), new THREE.LineBasicMaterial({ color: 0x00aaff }));
            solarSystemGroup.add(earthOrbitLine);

            // --- Asteroid ---
            const asteroid = new THREE.Mesh(new THREE.IcosahedronGeometry(0.35, 1), new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load(asteroidTexture) }));
            solarSystemGroup.add(asteroid);

            // Asteroid orbit calculation using orbital period
            const asteroidOrbitPoints = [];
            const orbitScale = Semi_major_axis * 12; // visual scale

            function getAsteroidPositionMeanMotion(a, e, iDeg, periDeg, thetaRad) {
                const rad = Math.PI / 180;
                const i = iDeg * rad;
                const peri = periDeg * rad;

                // radius at given theta (true anomaly)
                const r = a * (1 - e * e) / (1 + e * Math.cos(thetaRad));
                let x_orbit = r * Math.cos(thetaRad);
                let y_orbit = r * Math.sin(thetaRad);

                let x_inc = x_orbit;
                let y_inc = y_orbit * Math.cos(i);
                let z_inc = y_orbit * Math.sin(i);

                let x_final = x_inc * Math.cos(peri) + z_inc * Math.sin(peri);
                let y_final = y_inc;
                let z_final = -x_inc * Math.sin(peri) + z_inc * Math.cos(peri);

                return { x: x_final, y: y_final, z: z_final };
            }

            // Precompute orbit line for visualization
            for (let t = 0; t <= 360; t++) {
                const thetaRad = t * Math.PI / 180;
                const pos = getAsteroidPositionMeanMotion(orbitScale, Eccentricity, Inclination, Perihelion, thetaRad);
                asteroidOrbitPoints.push(new THREE.Vector3(pos.x, pos.y, pos.z));
            }
            const asteroidOrbitLine = new THREE.Line(new THREE.BufferGeometry().setFromPoints(asteroidOrbitPoints), new THREE.LineBasicMaterial({ color: Orbit_color || 0xff0000 }));
            solarSystemGroup.add(asteroidOrbitLine);

            earthOrbitLine.visible = false;
            asteroidOrbitLine.visible = false;

            //< --- GUI Controls --->
            
            // Added styling for lil-gui interface
            const guiDom = gui.domElement;
            guiDom.style.backgroundColor = 'rgba(30, 30, 30, 0.85)';
            guiDom.style.color = '#eee';
            guiDom.style.width = '320px';
            guiDom.style.borderRadius = '8px';
            guiDom.style.fontFamily = 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif';
            guiDom.style.boxShadow = '0 0 15px rgba(0,0,0,0.5)';

            const orbitFolder = gui.addFolder('Orbit Visibility');
            const orbitSettings = {
                'Earth Orbit': false,
                'Asteroid Orbit': false,
                'Asteroid Speed': 1,
                'Earth Speed': 0.01
            };
            orbitFolder.add(orbitSettings, 'Earth Orbit').onChange(value => {
                earthOrbitLine.visible = value;
            });
            orbitFolder.add(orbitSettings, 'Asteroid Orbit').onChange(value => {
                asteroidOrbitLine.visible = value;
            });
            

            const speedFolder = gui.addFolder('Orbit Speed');
            speedFolder.add(orbitSettings, 'Asteroid Speed', 0.1, 10).step(0.1);
            speedFolder.add(orbitSettings, 'Earth Speed', 0.01, 0.1).step(0.001);
            
            gui.close();
            scene.add(solarSystemGroup);

            // --- Updated asteroid animation using mean motion ---
            const orbitalPeriodSeconds = Orbital_period * 24 * 3600; // convert days to seconds
            let elapsedTime = 0;
            let earthTheta = 0;

            function animate() {
                const delta = clock.getDelta();
                elapsedTime += delta;

                // Sun rotation
                sun.rotation.y += delta / 10;

                // Earth rotation
                earth.rotation.y += delta;
                earthTheta += orbitSettings['Earth Speed'];
                earth.position.set(earthOrbitRadius * Math.cos(earthTheta), 0, earthOrbitRadius * Math.sin(earthTheta));

                // Asteroid moves along precomputed orbit points for exact alignment
                const totalPoints = asteroidOrbitPoints.length;
                const index = Math.floor((elapsedTime * orbitSettings['Asteroid Speed'] * 60) % totalPoints);
                const pos = asteroidOrbitPoints[index];
                asteroid.position.set(pos.x, pos.y, pos.z);

                controls.update();
                renderer.render(scene, camera);
                requestAnimationFrame(animate);
            }
            animate();
        })
        .catch(err => console.error(err));
});
