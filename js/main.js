

let worldVis;
let top5hyperVis;
let commodityVis;
let increaseVis;
let yearBrushVis;

// country selector
let selectedCountry = document.getElementById('countrySelector').value;
let selectedCountryEl = document.getElementById('countrySelector');


data_files = [
    {
        'idx': 0,
        'file': "data/imf_sudan_rawdata.csv",
        'type': 'csv',
        'name': 'increaseVis_rawData',
        'processFile': true
    },
    {
        'idx': 1,
        'file': "data/IMF_all_weights.json",
        'type': 'json',
        'name': 'increaseVis_weights',
        'processFile': false
    },
    {
        'idx': 2,
        'file': "data/Top5_hyperinflation.csv",
        'type': 'csv',
        'name': 'Top5_hyperinflation',
        'processFile': false
    },
    {
        'idx': 3,
        'file': "data/IMF_all_index.csv",
        'type': 'csv',
        'name': 'IMF_all_index',
        'processFile': true
    }
]

let promises = data_files.map((f) => {
    if (f.type == 'csv')
        return d3.csv(f.file);
    else if (f.type == 'json')
        return d3.json(f.file);
});

Promise.all(promises)
    .then( function(data){ initMainPage(data) })
    .catch( function (err){console.log(err)} );

function get_file_idx(name) {
    return data_files.filter((f) => f.name == name)[0]['idx'];
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

    // load increase vis
    increaseVis = new donutVis('firstincrease',
        allDataArray[get_file_idx('IMF_all_index')],
        allDataArray[get_file_idx('increaseVis_weights')],
        selectedCountry
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