const axios = require('axios');
const xml2js = require('xml2js');

const parser = new xml2js.Parser();

axios.get('https://www.youtube.com/feeds/videos.xml?channel_id=UCHQb90WIYhLUObEc8uVJR6A')
    .then(response => {
        parser.parseStringPromise(response.data).then(result => {
            const entries = result.feed.entry;
            const videos = entries.map(entry => {
                const videoId = entry['yt:videoId'][0];
                const title = entry.title[0];
                const thumbnail = `https://img.youtube.com/vi/${videoId}/0.jpg`;
                return `- [${title}](${thumbnail})`;
            });
            console.log(videos.join('\n'));
        });
    })
    .catch(error => {
        console.log(error);
    });