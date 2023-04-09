const  link_Db = 'http://localhost:3000/songs'


const app = {
    getSongs(cb) {
        fetch(link_Db)
            .then(function (response) {
                return response.json()
            })
            .then(cb)
    },
    renderSong(data) {
        data = data.slice(0, 10)
        console.log(data);
        const idElement = $('#audio')
        console.log((idElement));
        const output = data.map(function(currentSong, index) {
            return ``})
        idElement.innerHTML = output.join(" ")
    },

    start() {
        this.getSongs(this.renderSong)
    }
}

app.start();

