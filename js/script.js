let currentSong = new Audio();
let songs;
let currentfolder;

async function getSongs(folder) {
    // songs="";
    currentfolder = folder;
    let a = await fetch(`http://127.0.0.1:5500/songs/${currentfolder}/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    songs = [];
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/songs/${currentfolder}/`)[1]);
        }
    }


    // show all the song in the playlist
    let songUL = document.querySelector(".song-list")
    songUL.innerHTML = "";
    for (const song of songs) {
        songUL.innerHTML += `<div class="song-card">
                                <div class="song-detail">
                                    <img class="svg-img" src="./img/music.svg" alt="music">
                                    <div class="song-info">
                                        <h4>${song.replaceAll("%20", " ")}</h4>
                                        <p>artist name</p>
                                    </div>
                                    <div class="song-play">
                                        <img class="svg-img card-play" src="./img/playsong.svg" alt="play">
                                    </div>
                                </div>
                                

                            </div>`;
    }


    // attach an event litsener to each song 

    Array.from(document.querySelectorAll(".song-info")).forEach(e => {

        const h4Element = e.querySelector("h4");

        if (h4Element) {

            e.addEventListener('click', element => {
                playMusic(h4Element.innerHTML);
            })

        }

    });

    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener('change', (e) => {
        currentSong.volume = parseInt(e.target.value) / 100;
    })


    // function to convert seconds into minute:second formate
    function convertSeconds(seconds) {

        if (isNaN(seconds)) {
            return "00:00";
        }

        // Calculate minutes and remaining seconds
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;

        // Pad the minutes and seconds with leading zeros if necessary
        const paddedMinutes = minutes < 10 ? '0' + minutes : Math.floor(minutes);
        const paddedSeconds = remainingSeconds < 10 ? '0' + Math.floor(remainingSeconds) : Math.floor(remainingSeconds);

        // Return the formatted string
        return `${paddedMinutes}:${paddedSeconds}`;
    }

    // listen for timeupdate event
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".song-time .timepara").innerHTML = `${convertSeconds(currentSong.currentTime)} / ${convertSeconds(currentSong.duration)}`;
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";

    })

    //add an event listner to seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100;
    })

    document.querySelector(".timevol img").addEventListener("click", item => {
        console.log(item.target)
    })




    // responsive harmbar

    document.addEventListener("DOMContentLoaded", () => {
        const linrBtn = document.querySelector('.container .right-section .harmbar');
        const closeBtn = document.querySelector('.container .left-section .harmbar');
        const navHeader = document.querySelector('.container');

        const addLeftSection = () => {
            document.querySelector(".container .left-section").style.left = "0";
        }

        const removeLeftSection = () => {
            document.querySelector(".container .left-section").style.left = "-100%";
        }

        linrBtn.addEventListener('click', addLeftSection);
        closeBtn.addEventListener('click', removeLeftSection);
    });

    // Add event listener to mute the track
    document.querySelector(".timevol>img").addEventListener("click", e => {
        if (e.target.src.includes("./img/volume.svg")) {
            e.target.src = e.target.src.replace("./img/volume.svg", "./img/mute.svg")
            currentSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        }
        else {
            e.target.src = e.target.src.replace("./img/mute.svg", "./img/volume.svg")
            currentSong.volume = 0.10;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
        }
    })


    //add previous and next button

    next.addEventListener('click', () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if ((index + 1) > length) {
            playMusic(songs[index + 1]);
        }
    })

    previous.addEventListener('click', () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1]);
        }
    })

    return songs;
}

async function displayAlbums() {
    let a = await fetch(`http://127.0.0.1:5500/songs/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a");
    let cardcontainer = document.querySelector(".card-container");
    // console.log(anchors); 
    Array.from(anchors).forEach(async e => {
        if (e.href.includes("/songs/")) {
            let folder = e.href.split("/").slice(-1)[0];
            a = await fetch(`http://127.0.0.1:5500/songs/${folder}/info.json`);
            response = await a.json();
            cardcontainer.innerHTML = cardcontainer.innerHTML + `<div class="card" data-folder="${folder}">
                            <img src="songs/${folder}/cover.jpeg"
                                alt="cover">
                            <h3>
                                ${response.title}
                            </h3>
                            <p>${response.description}</p>
                            <div class="play-btn">
                                <ion-icon class="icon" name="play"></ion-icon>
                            </div>
                        </div>`
        }

        

        //load the folder
        Array.from(document.getElementsByClassName("card")).forEach(e => {
            e.addEventListener('click', async item => {
                songs = await getSongs(`${item.currentTarget.dataset.folder}`);
                playMusic(songs[0])
            })
        })

    })
}


async function main() {
    


    // get the list of all the songs
    await getSongs("BollywoodHits2024");
    // console.log(songs[0]);
    playMusic(songs[0], true);

    //Display all the albums on the page
    displayAlbums();

    play.addEventListener('click', () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src="./img/pausesong.svg";
        }
        else {
            currentSong.pause();
            play.src = "./img/playsong.svg";
        }
    })

}
const playMusic = (track, pause = false) => {
    currentSong.src = `/songs/${currentfolder}/` + track.replaceAll(" ", "%20");
    document.querySelector(".song-information p").innerHTML = currentSong.src.split(`/songs/${currentfolder}/`)[1].replaceAll("%20", " ");
    if (!pause) {
        currentSong.play();
        play.src = "./img/pausesong.svg"
    }

    // let audio = new Audio("/songs/" + track.replaceAll(" ", "%20"));

}



// Ensure the DOM is fully loaded before running the script
document.addEventListener('DOMContentLoaded', (event) => {
    main();
});