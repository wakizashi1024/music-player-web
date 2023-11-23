class LyricManager {
    /**
     * 初始化歌詞管理器
     * @param {String} url 
     * @param {String} mode 
     * @param {HTMLElement} playerNode 
     */
    constructor(url, playerNode = document.querySelector("#player-source")) {
        this.url = url;
        this.lyrics = [];
        this.animationDelay = 0.2 + 0.05; // css transition + 0.05s
        this.playerNode = playerNode;
        this.lyricListNode = document.querySelector("#lyric-list");
        this.lyricContainerNode = document.querySelector(".lyric-container");
        this.lyricListNode = document.querySelector("#lyric-list");
        this.lyricLineClassname = "lyric-line";
        this.lyricLineHeight = 0;
        this.containerHeight = document.querySelector(".lyric-container").clientHeight;
    }

    /**
     * 將歌詞文本以簡易LRC標準解析後存入歌詞列表(this.lyrics)
     * lyric格式: {time: "秒數", words: "歌詞"}
     * @param {String} rawLyricString 
     */
    parseLyric(rawLyricString) {
        rawLyricString.split("\n").map((textLine) => {
            const timeStrings = textLine.match(/\[[0-9:.]+\]/)?.map((timeString) => timeString.slice(1, -1))
            const lyric = textLine.slice(textLine.lastIndexOf("]") + 1).trim();
            
            if (timeStrings &&timeStrings.length > 0) {
                timeStrings.map((timeString) => {
                   const time = timeString.split(":");
                   const seconds = +(+time[0] * 60 + +time[1]).toFixed(3);
                   this.lyrics.push({
                       time: seconds,
                       words: lyric
                   }); 
                });
            }
        })
        this.lyrics = this.lyrics.sort((a, b) => a.time - b.time);
    }

    /**
     * 將歌詞文本載入
     * @returns {Promise}
     */
    loadLyric() {
        return fetch(this.url)
            .then((response) => response)
            .then((data) => data.text())
            .then((text) => this.parseLyric(text))
            .catch((error) => console.log(error));
    }

    /**
     * 查詢現在秒數對應的歌詞
     * @param {Number} time 
     * @returns 
     */
    findActiveLyricIndex(time) {
        time = time ?? this.playerNode.currentTime;
        const index = this.lyrics.findIndex((lyric) => lyric.time - this.animationDelay > time);

        if (index === -1 && time < this.lyrics[0].time - this.animationDelay) {
            return index;
        } else if (index === -1) {
            return null;
        }

        return index - 1;
    }

    /**
     * 控制歌詞列表指向目前播放的歌詞
     * @param {Number} currentTime 
     */
    focusPlayingLyric(currentTime) {
        const activeLyricIndex = this.findActiveLyricIndex(currentTime);

        // const lyricLineHeight = document.querySelector(".lyric-line").clientHeight;
        // const containerHeight = document.querySelector(".lyric-container").clientHeight;
        const offset = activeLyricIndex > 0
            ? -(activeLyricIndex * this.lyricLineHeight + this.lyricLineHeight / 2) + this.containerHeight / 2
            : activeLyricIndex === null
                ? -((this.lyrics.length - 1) * this.lyricLineHeight + this.lyricLineHeight / 2) + this.containerHeight / 2
                : this.containerHeight / 2;

        this.lyricListNode.style.transform = `translateY(${offset}px)`;

        // document.querySelectorAll(".lyric-line").forEach((lyric) => {
        //     lyric.classList.remove("active");
        // });
        document.querySelector(`.${this.lyricLineClassname}.active`)
            ?.classList.remove("active");
        if (activeLyricIndex >= 0 && activeLyricIndex !== null ) {
            document.querySelectorAll(`.${this.lyricLineClassname}`)
                .item(activeLyricIndex)
                .classList.add("active");
        } else if (activeLyricIndex === null) {
            document.querySelectorAll(`.${this.lyricLineClassname}`)
                .item(this.lyrics.length - 1)
                .classList.add("active");
        }
    }

    /**
     * 取得歌詞列表
     * @returns {Array}
     */
    getLyrics() {
        return this.lyrics;
    }

    /**
     * 在Dom上建立歌詞列表元素
     */
    createLyricNodes() {
        const fragment = document.createDocumentFragment()
        this.getLyrics().map(lyric => {
            const li = document.createElement("li");
            li.classList.add("lyric-line");
            li.textContent = lyric.words;
            fragment.appendChild(li);
        });
        this.lyricListNode.appendChild(fragment);
        this.lyricLineHeight = document.querySelector(".lyric-line").clientHeight;
        this.focusPlayingLyric();
    }
}

export { LyricManager };