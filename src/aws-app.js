const AWS = require('aws-sdk');
const finnhub = require('finnhub');
AWS.config.region = "us-east-1";
const ssm = new AWS.SSM();
const finnHubConfig = finnhub.ApiClient.instance.authentications['api_key'];
let apiKey = undefined;
let finnhubClient = undefined;

async function run() {
    await init();
    // await getQuote("AAPL");
    let startTime = new Date(Date.now() - (24*60*60*1000*5));
    let endTime = new Date(Date.now() - (24*60*60*1000*2));
    startTime = Math.floor(startTime.getTime()/1000);
    endTime = Math.floor(endTime.getTime()/1000);
    // console.log(`startTime: ${startTime}(${new Date(startTime*1000)}), endTime: ${endTime}(${new Date(endTime*1000)})`);
    await getTimeRangeTechIndicator("AAPL", startTime, endTime, "sma");
}

async function init() {
    return new Promise((resolve, reject) => {
        const params = {
            Name: '/finnhub/sandbox-api-key',
        };
    
        ssm.getParameter(params, function(err, data) {
            if (err) {
                console.log(err, err.stack);
                return reject(err);
            }
            else {
                // console.log(data.Parameter.Value);
                apiKey = data.Parameter.Value;
                finnHubConfig.apiKey = apiKey;
                finnhubClient = new finnhub.DefaultApi()
                resolve();
            }
        });
    });
}

/**
 * c - current price
 * d - change
 * dp - percent change
 * h - high price of the day
 * l - low price of the day
 * o - open price of the day
 * pc - previous close price
 */
async function getQuote(symbol) {
    return new Promise((resolve, reject) => {
        finnhubClient.quote(symbol, (error, data, response) => {
            if(error) {
                return reject(error);
            }
            console.log(data)
            resolve(data);
        });
    });
}

async function getTimeRangeTechIndicator(symbol, startTime, endTime, ind) {
    return new Promise((resolve, reject) => {
        finnhubClient.technicalIndicator(symbol, "D", startTime, endTime, ind, {}, (error, data, response) => {
            console.log(data)
            resolve(data);
        });
    });
}

run();