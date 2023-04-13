
link_db = 'http://localhost:3000/songs'


// POST new song to db
function createSong(info) {
    
    fetch(link_db, {
        method: 'POST',
        headers: {
            "content-type": "application/json"
        },
        body: JSON.stringify(info),})
    .then(function(response) {
        console.log(response);
        return response.json()
    })
    .then(function(data) {
        console.log(data);
    })
}

const btnElement = $('#submit')

// Catch click on Submit button to create new song in db
btnElement.onclick = function() {
    const title = document.getElementById('title').value
    const artist = document.getElementById('artist').value
    const link = document.getElementById('link').value
    const thumbnail = document.getElementById('thumbnail').value

    const info = {
        title, artist, link, thumbnail
    }
    createSong(info)
}