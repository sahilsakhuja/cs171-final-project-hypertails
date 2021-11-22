

let myMapVis;
let myBrushVis;
let top5hyperVis;
let commodityVis;
let increaseVis;
let yearBrushVis;
let categoryBubbleVis;
let animatedBarChartVis;

// animation run variables
let animatedBarChartRun = false;
let bubbleChartVisRun = false;

// country selector
let selectedCountry = document.getElementById('countrySelector').value;
let selectedCountryEl = document.getElementById('countrySelector');

let categoryColors = ["#d376e3","#334752","#664c6b","#4a913d","#769aad","#42fc21","#27631c","#5e3d63","#f2a277","#2faff5", "#6269A8", "#222759"];

data_files = [
    // {
    //     'idx': 0,
    //     'file': "data/imf_sudan_rawdata.csv",
    //     'type': 'csv',
    //     'name': 'increaseVis_rawData',
    //     'processFile': true
    // },
    {
        'idx': 0,
        'file': "data/IMF_all_weights.json",
        'type': 'json',
        'name': 'increaseVis_weights',
        'processFile': false
    },
    // {
    //     'idx': 2,
    //     'file': "data/Top5_hyperinflation.csv",
    //     'type': 'csv',
    //     'name': 'Top5_hyperinflation',
    //     'processFile': false
    // },
    {
        'idx': 1,
        'file': "data/IMF_all_index.csv",
        'type': 'csv',
        'name': 'IMF_all_index',
        'processFile': true
    },
]

let promises = data_files.map((f) => {
    if (f.type === 'csv')
        return d3.csv(f.file);
    else if (f.type === 'json')
        return d3.json(f.file);
});

Promise.all(promises)
    .then( function(data){ initMainPage(data) })
    .catch( function (err){console.log(err)} );

function get_file_idx(name) {
    return data_files.filter((f) => f.name === name)[0]['idx'];
}

// initMainPage
function initMainPage(allDataArray) {

    // log data
    // console.log(allDataArray);

    // parse dates as required
    let dateParser = d3.timeParse("%d-%b-%Y");
    data_files.forEach((f) => {
        if (f.processFile) {
            allDataArray[get_file_idx(f.name)].forEach((d) => {
                d.Date = dateParser(d.Date);
                Object.keys(d).forEach( (k) =>
                {
                    if (k !== 'Date' && k !== 'Country')
                        d[k] = +d[k];
                });
                return d;
            });
        }
    })

    categoryBubbleVis = new bubbleVis('bubbleVis',
        allDataArray[get_file_idx('increaseVis_weights')],
        'UnitedStates'
    )

    // load initial animated bar chart
    increaseVis = new donutVis('firstincrease',
        allDataArray[get_file_idx('IMF_all_index')],
        allDataArray[get_file_idx('increaseVis_weights')],
        selectedCountry
    );

    // load increase vis
    animatedBarChartVis = new areaVis('animatedBarChartVis',
        allDataArray[get_file_idx('IMF_all_index')],
        'Sudan'
    );

    yearBrushVis = new brushVis('brushVis',
        allDataArray[get_file_idx('IMF_all_index')],
        selectedCountry
    );

    top5hyperVis = new topHyperVis ('top5hyper',
        allDataArray[get_file_idx('IMF_all_index')],
        selectedCountry
    );


}


selectedCountryEl.addEventListener('change', function (event) {
    selectedCountry = document.getElementById('countrySelector').value;
    increaseVis.updateCountry(selectedCountry);
    yearBrushVis.updateCountry(selectedCountry);
    top5hyperVis.updateCountry(selectedCountry);
})

function brushUpdate(startYear, endYear) {
    increaseVis.updateYears(startYear, endYear);
    top5hyperVis.updateYears(startYear, endYear);
}

function updateBubbleSettings() {
    categoryBubbleVis.changeBaseIncomeExpense(
        parseFloat(document.getElementById('baseIncome').value),
        parseFloat(document.getElementById('baseExpense').value)
    )
}

function increaseInflation() {
    let newInflation = parseFloat(document.getElementById('inflationAmount').value) + 0.5;
    categoryBubbleVis.changeInflation(newInflation);
    document.getElementById('inflationAmount').value = newInflation;
    document.getElementById('inflationAmountText').innerText = newInflation.toFixed(2) + '%';
}

function decreaseInflation() {
    let newInflation = parseFloat(document.getElementById('inflationAmount').value) - 0.5;
    categoryBubbleVis.changeInflation(newInflation);
    document.getElementById('inflationAmount').value = newInflation;
    document.getElementById('inflationAmountText').innerText = newInflation.toFixed(2) + '%';
}



// Andrew - need to be incorporated

// Map
const data = new Map();
let selectedState = '';
let rawData = []
let selectedTimeRange = [];
let startRange
let endRange
let csvRaw = []

let promisesMap = [
    d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson", function(data) {
    }),
    d3.csv("data/WorldBank_Agg_Wrangled.csv",  function(d) {

        for (const year in d) {
            rawData.push({
                year:parseInt(year),
                interestRate:parseFloat(d[year]),
                countryCode: d['Country Code'],
                countryName: d['Country Name']
            })
        }
        csvRaw.push(d)

    })
]


Promise.all(promisesMap)
    .then(function (data) {
        data[0].features = data[0].features.filter(d => { return d.properties.name!=="Antarctica"})

        initWorldMap(data)
    })
    .catch(function (err) {
        console.log(err)
    });



function initWorldMap(dataArray) {


    myMapVis = new MapVis("choropleth-map", dataArray)

    // init brush
    myBrushVis = new mapBrushVis('brushDiv', rawData);
}

//Line Chart
d3.csv("data/IMF_CPI_US - Country Indexes And Weights.csv").then(csv => {

    const categories = csv.map((row) => {
        const category = row[csv.columns[0]];
        const categoryName = category.slice(0,5)

        const values = csv.columns.slice(1).map((dateColumn) => parseFloat(row[dateColumn]));
        return {categoryName,category, values}
    });

    const parseDate = d3.timeParse("%YM%m");
    const allDates = csv.columns.slice(1).map((dateColumn) => parseDate(dateColumn))

    const data = {
        categories,
        allDates,
    };

    commodityVis = new LineChart("commodityVis", data);

});