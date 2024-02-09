const axios = require('axios');
const xml2js = require('xml2js');

const parser = new xml2js.Parser();
const MAX_RESULTS = 6;

axios.get('https://www.youtube.com/feeds/videos.xml?channel_id=UCHQb90WIYhLUObEc8uVJR6A')
    .then(response => {
        parser.parseStringPromise(response.data).then(result => {
            const entries = result.feed.entry.slice(0, MAX_RESULTS);
            let videos = '<div style="display: flex; flex-wrap: wrap;">';
            entries.forEach((entry, index) => {
                const videoId = entry['yt:videoId'][0];
                const title = entry.title[0];
                const thumbnail = `https://img.youtube.com/vi/${videoId}/0.jpg`;
                videos += `<div width="30%"><a href="https://www.youtube.com/watch?v=${videoId}" target="_blank"><img src="${thumbnail}" alt="${title}" style="max-width: 100%;" ><br>${title}</a></div>`;
                // Add a line break after every 3 videos
                if ((index + 1) % 3 === 0) {
                    videos += '</div><div style="display: flex; flex-wrap: wrap;">';
                }
            });
            videos += '</div>';
            console.log(videos);
        });
    })
    .catch(error => {
        console.log(error);
    });