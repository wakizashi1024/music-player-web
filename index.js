import { LyricManager } from "./lyric-manager.js";

async function main() {
    const playerNode = document.querySelector("#player-source");
    playerNode.setAttribute("src", "./audio/飄向北方.mp3");
    
    // window.lyricManager = new LyricManager("./lyrics/飄向北方.lrc");
    const lyricManager = new LyricManager("./lyrics/飄向北方.lrc", playerNode);

    await lyricManager.loadLyric();
    
    // const fragment = document.createDocumentFragment();
    // lyricManager.getLyrics().map(lyric => {
    //     const li = document.createElement("li");
    //     li.classList.add("lyric-line");
    //     li.textContent = lyric.words;
    //     fragment.appendChild(li);
    // });
    // document.querySelector("#lyric-list").appendChild(fragment);
    lyricManager.createLyricNodes();

    playerNode.addEventListener("timeupdate", () => {
        lyricManager.focusPlayingLyric();
    })
}

const playerNode = document.querySelector("#player-source");
main();