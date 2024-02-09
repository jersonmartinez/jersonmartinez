const axios = require('axios');
const xml2js = require('xml2js');

const parser = new xml2js.Parser();
const MAX_RESULTS = 6;

axios.get('https://www.youtube.com/feeds/videos.xml?channel_id=UCHQb90WIYhLUObEc8uVJR6A')
    .then(response => {
        parser.parseStringPromise(response.data).then(result => {
            const entries = result.feed.entry.slice(0, MAX_RESULTS);
            let videos = '<table><tr>';
            entries.forEach((entry, index) => {
                const videoId = entry['yt:videoId'][0];
                const title = entry.title[0];
                const thumbnail = `https://img.youtube.com/vi/${videoId}/0.jpg`;
                videos += `<td align="center"><a href="https://www.youtube.com/watch?v=${videoId}" target="_blank"><img src="${thumbnail}" alt="${title}" width="100%"><br>${title}</a></td>`;
                if ((index + 1) % 3 === 0) {
                    videos += '</tr><tr>';
                }
            });
            videos += '</tr></table>';
            console.log(videos);
        });
    })
    .catch(error => {
        console.log(error);
    });