const  link_Db = 'http://localhost:3000/songs'
const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)

const wrapper = $('.wrapper')
const playingWrapper = $('#playing')
const playingElement = $("#playing_header")
const cdPlayingThumb = $('#playing_thumb')
const cdHeaderThumb = $('.playing_header_thumb')
const playingInfo = $('.playing_info')
const titlePlaying = $('#playing_info--title')
const artistPlaying = $('#playing_info--artist')

const playlistHiddenElement = $('#playlist_hidden')
const playlistElement = $('#playlist')
const songElement = $$(".playlist_song")
const nextElement = $('#next')
const prevElement = $('#prev')
const repeatElement = $('#repeat')
const shuffleElement = $('#shuffle')
const togglePlayPause = $('#toggle_play_pause')
const audio = $('#audio')
const timeRange = $('#time')

const wrapperHeight = wrapper.offsetHeight
const thumbWidth = cdHeaderThumb.offsetWidth
const playlistHeight = playlistElement.offsetHeight
const playingHeaderHeight = playingElement.offsetHeight
// const playingWrapperHeight = playingWrapper.offsetHeight

function handleSongIndex(index, next, lenList) {
    if (next === true) {
        return index < lenList ? index : 0
    }
    return index < 0 ? lenList -1 : index
}

function toggleButtons() {
    const toggleButtons = $$('.toggle_button')
    toggleButtons.forEach(function(btn) {
        btn.classList.toggle('deactive')
    })
}

function removeActiveSong() {
    let currentSong = $('#playlist .active')
    currentSong.classList.remove('active')
}

function handleThumbResize(scrollTop) {
    let newThumbWidth = thumbWidth - scrollTop
    if (newThumbWidth > 200) 
    {
        newThumbWidth = 200
    }
    else {
        newThumbWidth = newThumbWidth > 80 ? newThumbWidth : 80
    }
    cdHeaderThumb.style.width = newThumbWidth + 'px'
    playingElement.style.height = newThumbWidth / 4 * 5 + 'px'

    const playingWrapperHeight = playingWrapper.offsetHeight
    playlistElement.style.height = wrapperHeight - playingWrapperHeight + 'px'

    if (cdHeaderThumb.offsetHeight === 80) {
        playingElement.style.flexDirection = "row"
        playingInfo.style.flexDirection = "column"
        playingInfo.style.alignItems  = "baseline"
        playingInfo.style.marginLeft = "24px"
        artistPlaying.style.display = "block"
    }
    else {
        playingElement.style.flexDirection = "column"
        // playingInfo.style.flexDirection = "row"
        // playingInfo.style.alignItems  = "center"
        playingInfo.style.marginLeft = "0"
        artistPlaying.style.display = "none"
    }
} 

function handlePlaylistResize(scrollTop) {
    let newPlaylistHeight = playlistHeight  - scrollTop
    console.log(newPlaylistHeight);
            if (newPlaylistHeight > 250) {
                newPlaylistHeight = 250 + 'px'
            }
            else { 
                newPlaylistHeight = newPlaylistHeight > 50 ? newPlaylistHeight : 50 + 'px'
            }
            playlistElement.style.height = newPlaylistHeight + 'px'
}
const app = { 
    isShuffle: false,
    isRepeat: false,
    isPlaying: false,
    playSongIds: [],
    currentIndex: 0,
    thumbAnimate: cdPlayingThumb.animate({
        transform: 'rotate(360deg)'
    }, {duration: 10000, iterations: Infinity}),
    defineProperty: function() {
        Object.defineProperty(this, "currentSong", {
            get: function () {
                return this.songs[this.currentIndex];
            },
        }); 
    },
    getSongs(cb) {
        const _this = this
        fetch(link_Db)
            .then(function (response) {
                return response.json()
            })
            .then(function(data) {
                _this.songs = data
                cb(data, _this)
            })
    },
    renderCurrentSong(currentSong, play=true) {
        cdPlayingThumb.setAttribute("src",`${currentSong.thumbnail}`)
        titlePlaying.textContent = currentSong.title
        artistPlaying.textContent = currentSong.artist
        audio.src = `${currentSong.link}`
        if (play ===true)
        {
            audio.play()
        }
    },
    renderSongs(data, _thisObj) {
        const playlistSongs = data.map(function(song, index) {
            return `<div class="playlist_song pointer ${index ===_thisObj.currentIndex ? "active ": ""}" data-index=${index}>
                <img class ="playlist_song--thumb" src="${song.thumbnail}"></img>
                <div class="playlist-song--info">
                    <div class ="playlist_song--title">${song.title}</div>
                    <div class ="playlist_song--artist">${song.artist}</div>
                </div>
            </div>`})
        playlistElement.innerHTML += playlistSongs.join(" ")
        _thisObj.renderCurrentSong(data[_thisObj.currentIndex], play=false)
        _thisObj.thumbAnimate.pause()
    },

    playSong() {
        this.renderCurrentSong(this.songs[this.currentIndex])
        removeActiveSong()
        let currentSong = $$('.playlist_song')[this.currentIndex]
        currentSong.classList.add('active')
    },
    playNextShuffle() {
        this.playSongIds.push(this.currentIndex)
        if (this.playSongIds.length === this.songs.length) {
            this.playSongIds = []
        }
        let index
        do {
            index = Math.floor(Math.random()*this.songs.length)
        }
        while (this.playSongIds.includes(index))
        this.currentIndex = index
        this.playSong()
    },
    playPausedSong() {
        this.isPlaying = true
        this.thumbAnimate.play()
        toggleButtons()
    },
    handleEvents() {
        const _this = this

        // Seek 
        timeRange.oninput = function(e) {
            let seek = audio.duration / 100 * e.target.value
            audio.currentTime = seek
        }
        //  Timing
        audio.ontimeupdate = function() {
            const progressTime = audio.currentTime * 100/audio.duration
            if (!isNaN(progressTime)) {
                timeRange.value = progressTime
            }
            
        }
        //  Handle scroll 
        playlistElement.onscroll = function() {
            const scrollTop = playlistElement.scrollY || playlistElement.scrollTop
            handleThumbResize(scrollTop)
            // handlePlaylistResize(scrollTop)
        }
        audio.onplay = function() {
            _this.thumbAnimate.play()
            _this.isPlaying=true
        }

        audio.onpause = function() {
            _this.thumbAnimate.pause()
            _this.isPlaying=false
        }

        // Toggle play/pause 
        togglePlayPause.onclick = function() {
            toggleButtons()
            if (_this.isPlaying) {
                audio.pause()
            }
            else {
                audio.play()
            }
        },
        // Next song
        nextElement.onclick = function() {
            if (!_this.isPlaying) {
               _this.playPausedSong()
            }

            if(_this.isShuffle) {
                _this.playNextShuffle()
            }
            else {
                _this.currentIndex = handleSongIndex(_this.currentIndex+1, true, _this.songs.length)
                _this.playSong()
            }
        }

        // Prev song 
        prevElement.onclick = function() {
            _this.currentIndex = handleSongIndex(_this.currentIndex-1, false, _this.songs.length)
            if (!_this.isPlaying) {
                _this.playPausedSong()
            }
            _this.playSong()
        }      

        //  Repeat song
        repeatElement.onclick = function() {
            _this.isRepeat = !_this.isRepeat
            repeatElement.classList.toggle('active')
        }

        // Shuffle song
        shuffleElement.onclick = function() {
            _this.isShuffle = !_this.isShuffle
            shuffleElement.classList.toggle('active')
        }
        // Auto play next song
        audio.onended = function() {
            if (_this.isRepeat) {
                audio.play()
            }
            else if (_this.isShuffle) {
                _this.playNextShuffle() 
            }
            else {
                _this.currentIndex = handleSongIndex(_this.currentIndex+1, true, _this.songs.length)
                _this.playSong()
            }
        }

        // Click on song
        playlistElement.onclick = function(e) {
            const songNode = e.target.closest('.playlist_song:not(.active)')
            if (songNode) {
                songNode.classList.add('active')
                _this.currentIndex = Number(songNode.dataset.index)
                if (_this.isRepeat) {
                    _this.isRepeat = false
                    repeatElement.classList.remove("active")
                }
                if(_this.isShuffle) {
                    if(!_this.playSongIds.includes(_this.currentIndex))
                        {
                            _this.playSongIds.push(_this.currentIndex)
                        }
                }
                // Remove active song
                removeActiveSong()
                // Add new active song
                if (!_this.isPlaying) {
                    _this.playPausedSong()
                }
                _this.playSong()
            }
        }
        
    },
    start() {
        this.getSongs(this.renderSongs)
        this.handleEvents()
    }
}

app.start();