const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const request = require('request');
const axios = require('axios')
const session = require('express-session')
const fetch = require('node-fetch');
const json = require('body-parser/lib/types/json');
app = express();


app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));


//API KEY
let API_KEY = 'AIzaSyBAjSUYf2Op90nijPE7vQnckgFokRUrC-k'



//get video id from url
var finalresult
app.get('/', (req, res) => {
    res.render('index',{data:finalresult})
});

app.get('/about',(req,res)=>{
    res.render('about');
})
app.get('/contact-us',(req,res)=>{
    res.render('contactUs');
})
app.get('/privacy-policy',(req,res)=>{
    res.render('privacyPolicy');
})



var link
var count = 0
var incount = 0
app.post('/', async (req, res) => {

    link = req.body.link
    link = req.body.playlist_link
    link = link.slice(38);

    var token = ''

    try {
        if (link) {
            
            async function DurationCalculate(token) {
        
                
                let url1 = `https://youtube.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${link}&key=${API_KEY}&pageToken=${token}`
        
                const response = await fetch(url1, {
                    method: 'GET'
                })
        
                const details = await response.json()
        
        
        
                token = details.nextPageToken;
                count = details.pageInfo.totalResults;
                
                // console.log(incount + " :incount");
        
                
        
                const videoIds = []
                details.items.forEach(item => {
                    videoIds.push(item.snippet.resourceId.videoId)
                })
                var minSum = 0;
                var hourSum = 0;
                var secSum = 0;
        
        
                let url2 = `https://youtube.googleapis.com/youtube/v3/videos?part=contentDetails&id=${videoIds.join(',')}&key=${API_KEY}`
        
        
                const response2 = await fetch(url2, {
                    method: 'GET'
                })
               
        
                var durations = await response2.json()
                // duration = duration.items[0].contentDetails.duration;
                // Assuming the array is stored in a variable named "duration"
                // const durations = duration.map(video => video.contentDetails.duration);
        
        
        
                durations = durations.items;
                durations.forEach((video) => {
                    const duration = video.contentDetails.duration;
        
                    // let minute = duration.substring(0, duration.indexOf('M'));
                    // let minute = duration
                    // minute = duration.replaceAll("PT", "");
                    let nduration = duration.replaceAll("PT", "");
                    // console.log(nduration);
                    const hoursRegex = /^(\d+)H/;
                    let hour = nduration.match(hoursRegex);
                    hour = hour ? parseInt(hour[1]) : 0;
                    // console.log(hour);
                    hourSum = hourSum+hour;
                    const  minRegEx = /(\d+)M/;//minute regular expression 
                    let minute = nduration.match(minRegEx);
                    minute = minute ? parseInt(minute[1]):0;
                    // console.log(minute);
                    minSum = minSum+ minute;
        
                    const  secRegEx = /(\d+)S/;//second regular expression 
                    let sec = nduration.match(secRegEx);
                    sec = sec ? parseInt(sec[1]):0;
                    //console.log(sec);
                    secSum = secSum+sec;            
        
        
                    // console.log(minute);
                    // var hour = minute.split(/[HM]/);
                    // minute = minute.split(/[HM]/);
        
                    // console.log(minute);
        
                    // if (minute.length == 3) {
                    //     var minute1 = minute[1];
                    //     min1 = parseInt(minute1);
                    //     minSum = minSum + min1;
        
                    //     //couting hours
                    //     var hour1 = parseInt(hour[0])
                    //     hourSum = hourSum+  hour1
                    //     // counting second
                    //     // console.log(hour);
                    //     var sec1 = parseInt(hour[2]);
                    //     // console.log(sec1);
        
        
                    // } else if (minute.length == 2) {
                    //    var min0 = parseInt(minute[0]);
                    //    minSum = minSum + min0;
        
                    //    var sec0 = parseInt(minute[1]);
                    //    secSum = secSum+sec0;
                        
                    // }
        
                });
        
                // console.log("1");
        
                let subTotal = 0
                // console.log("token: "+ token);
                if (token) {
                    subTotal = await DurationCalculate(token);
                    incount++
                    
                    // console.log("2 : "+subTotal);
                    
                }
                
        
                // console.log("3: printing total");
                // console.log("4: printing Subtotal: "+ subTotal);
                total = minSum + hourSum*60 + secSum/60 + subTotal;
                
                //  console.log("total :"+total);
        
                return total
        
        
            }
        
        
            
            // console.log("0: ");
            const result = await DurationCalculate(token);
            // console.log("count: "+incount);
            // console.log(parseInt(result/60) +" hours : "+ parseInt(result%60)+" min : "+  (parseInt(result%60))%60+" second" );
            // finalresult = parseInt(result/60) +" hours : "+ parseInt(result%60)+" min : "+  (parseInt(result%60))%60+" second" 
            
            finalresult =
            {
                minute:parseInt(result) ,
                totalVideo:count
            }
             
            res.redirect('/');
            }else{
                finalresult = 0;
                res.redirect('/')
            }
    } catch (error) {
        res.send(error)
    }
    



});










app.listen(process.env.PORT || 3000);