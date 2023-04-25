const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const request = require('request');
const axios = require('axios')
app = express()


app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));


//API KEY
let API_KEY = 'AIzaSyCV4CMKOtur7xo6O9DtLaQzbY35JIipeRs'
//get video id from url
var minute1
var minute2
var minute
app.get('/', (req, res) => {
    res.render('index', { minute: minute })
});

app.post('/', (req, res) => {
    var link = req.body.playlist_link
    link = link.slice(38);

    let url1 = `https://www.googleapis.com/youtube/v3/playlistItems?part=contentDetails&maxResults=500&fields=items/contentDetails/videoId,nextPageToken,pageInfo&key=${API_KEY}&playlistId=${link}&pageToken=`

    request(url1, function (error, response, body) {
        var details = JSON.parse(body);
        var token
        var totalResult = details.pageInfo.totalResults

        if (totalResult > 50)
            token = details.nextPageToken;

        getVideoLength(details.items, 0, details.items.length, 0).then((minutes) => {

            minute1 = minutes
            console.log("minute1: " + minute1);
            if (totalResult <= 50) {
                minute = minute1
                res.redirect('/');
            } else {
                let url2 = `https://www.googleapis.com/youtube/v3/playlistItems?part=contentDetails&maxResults=500&fields=items/contentDetails/videoId,nextPageToken,pageInfo&key=${API_KEY}&playlistId=${link}&pageToken=${token}`

                request(url2, function (error, response, body) {
                    var details = JSON.parse(body);


                    getVideoLength(details.items, 0, details.items.length, 0).then((minutesN) => {
                        minute2 = minutesN
                        console.log("minute2: " + minute2);
                        minute = minute1 + minute2;
                        console.log(minute);
                        res.redirect('/');


                    })



                })
            }

        })











    });


});


async function getVideoLength(items, current, length, minsum) {

    let id = items[current].contentDetails.videoId
    await axios.get(`https://www.googleapis.com/youtube/v3/videos?&part=contentDetails&key=AIzaSyDCskWpTFkgZT4CEnW-3TU8k3QZZbtoTxA&id=${id}&fields=items/contentDetails/duration`)
        .then((response) => {
            let duration = response.data.items[0].contentDetails.duration;
            let Hour = duration.substring(0, duration.indexOf('H'));
            Hour = Hour.replaceAll("PT", "");

            let minute = duration
            minute = duration.replaceAll("PT", "");
            minute = minute.split(/[HM]/);
            if (minute.length == 3) {

                var minute1 = minute[1];
                let min1 = parseInt(minute1);
                minsum += min1;
            } else if (minute.length == 2) {
                minsum += parseInt(minute[0]);
            }
        }).catch(err => console.log(err))

    if (current == length - 1)
        return minsum;
    return getVideoLength(items, current + 1, length, minsum);
}

app.listen(4000, () => {
    console.log("server running at port 4000");
})