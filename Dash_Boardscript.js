document.addEventListener("DOMContentLoaded", () => {
    const base_url = "https://script.google.com/macros/s/AKfycby29jhoLsLNUiFypxMqI0NQOPFpVh5VD9oWk1JpMGQHEHQNuE5SCyjvuj9qdzPv2zw_6w/exec"
    const asteroidID = localStorage.getItem("selectedAsteroidID");

    const url = `${base_url}?id=${asteroidID}`;
    //DODM
    const Name = document.getElementById("Aname"); 
    const ID = document.getElementById("Aid");
    const Next_app = document.getElementById("next_approach");
    const Diameter = document.getElementById("diameter");
    const Velocity = document.getElementById("velocity");
    const Miss_Dist = document.getElementById("miss_distance");
    const Orbital_period = document.getElementById("orbital_period");
    const Hazardous = document.getElementById("hazardous");
    //DOM


    fetch(url)
        .then(res => {
            return res.json();
        }).then(data => {
            Name.innerText = data.Name;
            localStorage.setItem("Name", data.Name);
            ID.innerText = data.ID;
            const date = data.Next_Approach;
            Next_app.innerText = date;
            Diameter.innerText = data.Diameter_max_km;
            localStorage.setItem("Diameter", data.Velocity_km_s);
            Velocity.innerText = data.Velocity_km_s;
            localStorage.setItem("velocity", data.Diameter_max_km)
            Miss_Dist.innerText = data.Miss_distance_km;
            Orbital_period.innerText = data.Orbital_period;
            let denger = data.Hazardous;
            if (denger === true) {
                Hazardous.style.backgroundColor = "red";
            } else {
                Hazardous.style.backgroundColor = "green";
            }
        }).catch(err => {
            console.log(err);
        });
    console.log(url);

    // Single click: enter fullscreen, double click: exit fullscreen
    Hazardous.addEventListener("click", () => {
        const elem = document.documentElement;
        if (!document.fullscreenElement) {
            if (elem.requestFullscreen) {
                elem.requestFullscreen();
            } else if (elem.webkitRequestFullscreen) {
                elem.webkitRequestFullscreen();
            } else if (elem.msRequestFullscreen) {
                elem.msRequestFullscreen();
            }
        }
    });

    Hazardous.addEventListener("dblclick", () => {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
    });


})