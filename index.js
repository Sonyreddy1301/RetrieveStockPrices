const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const service = require('./service/service.js');

const tickers = "AAPL,SPY,KMI";
const BATCH_REAL_TIME_PRICE_URL = "https://financialmodelingprep.com/api/v3/stock/real-time-price/" + tickers;
const HISTORICAL_PRICE_FULL = "https://financialmodelingprep.com/api/v3/historical-price-full/";

let today = new Date();
const fromDate = '2019-01-01';
let toDate = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
const quantity = [5, 10, 15];

const main = async () => {
    const data = [];
    let stockPriceResp = await service.get(BATCH_REAL_TIME_PRICE_URL);
    let counter = 0;
    for await (const stock of stockPriceResp.companiesPriceList) {
        const object = {};
        let historicalUrl = HISTORICAL_PRICE_FULL + stock.symbol + '?from=' + fromDate + '&to=' + toDate;
        let historicalResponse = await service.get(historicalUrl);

        const highPrice = historicalResponse.historical.reduce(function (prev, current) {
            return (prev.high > current.high) ? prev : current
        });

        const lowPrice = historicalResponse.historical.reduce(function (prev, current) {
            return (prev.low < current.low) ? prev : current
        });

        object.symbol = stock.symbol.toString();
        object.quantity = quantity[counter];
        object.price = stock.price;
        object.high = highPrice.high;
        object.low = lowPrice.low;
        object.current = quantity[counter] * stock.price;

        data.push(object);
        counter++;
    }

    let finalResponse = JSON.stringify(data);
    finalResponse = JSON.parse(finalResponse);

    let total = finalResponse.map(item => item.current).reduce((prev, next) => prev + next);
    console.log("amount sum:" + total);

    console.log("total " + JSON.stringify(finalResponse));
    createCSV(finalResponse, total);
};

function createCSV(data, total) {

    data.push({
        'symbol': 'Total',
        'quantity': '',
        'price': '',
        'high': '',
        'low': '',
        'current': total
    });

    data = JSON.stringify(data);
    data = JSON.parse(data);

    const csvWriter = createCsvWriter({
        path: 'out.csv',
        header: [
            {id: 'symbol', title: 'Ticker'},
            {id: 'quantity', title: 'Quantity'},
            {id: 'price', title: 'Price'},
            {id: 'high', title: 'High'},
            {id: 'low', title: 'Low'},
            {id: 'current', title: 'Current Value'}
        ]
    });

    csvWriter
        .writeRecords(data)
        .then(() => console.log('The CSV file was written successfully'));
}

main();

module.exports.main = main;