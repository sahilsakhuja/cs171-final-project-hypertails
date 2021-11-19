

let worldVis;
let top5hyperVis;
let areaVis;
let commodityVis;
let increaseVis;


data_files = [
    {
        'idx': 0,
        'file': "data/imf_sudan_rawdata.csv",
        'type': 'csv',
        'name': 'increaseVis_rawData'
    },
    {
        'idx': 1,
        'file': "data/weights_sudan.json",
        'type': 'json',
        'name': 'increaseVis_weights'
    },
    {
        'idx': 2,
        'file': "data/Top5_hyperinflation.csv",
        'type': 'csv',
        'name': 'Top5_hyperinflation'
    },
    {
        'idx': 3,
        'file': "data/IMF_all_index.csv",
        'type': 'csv',
        'name': 'IMF_all_index'
    },
    {
        'idx': 4,
        'file': "data/IMF_Sudan_index_cpi.csv",
        'type': 'csv',
        'name': 'IMF_Sudan_index_cpi'
    },
    {
        'idx': 5,
        'file': "data/Sudan_exchange_rate.csv",
        'type': 'csv',
        'name': 'Sudan_exchange_rate'
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

    // load increase vis
    increaseVis = new donutVis('firstincrease',
        allDataArray[get_file_idx('increaseVis_rawData')],
        allDataArray[get_file_idx('increaseVis_weights')]
    );

    top5hyperVis = new topHyperVis ('top5hyper',
        allDataArray[get_file_idx('Top5_hyperinflation')]
    );

    areaVis = new AreaVis('hookVis',
        allDataArray[get_file_idx('IMF_Sudan_index_cpi')],
        allDataArray[get_file_idx('Sudan_exchange_rate')]
    );


}


let selectedCategory = document.getElementById('categorySelector').value;
function categoryChange() {
    selectedCategory = document.getElementById('categorySelector').value;

}

let selectedCategoryEl = document.getElementById('categorySelector');
selectedCategoryEl.addEventListener('change', function (event) {

    /*let paths = document.querySelectorAll("path");
    let lastPath = paths[paths.length - 1];
    lastPath.style.display = "none";*/

    top5hyperVis.updateVis();
})
