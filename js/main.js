//import {topHyperVis} from "./top5hyperVis";

let worldVis;
let top5hyperVis;
let commodityVis;
let increaseVis;


let initialData = null;

// Margin object with properties for the four directions
let margin = {top: 20, right: 10, bottom: 20, left: 10};

// Width and height as the inner dimensions of the chart area
// changed width to support 2 plots
let width = 1400 - margin.left - margin.right,
  height = 500 - margin.top - margin.bottom;

let plot_width = 700 - margin.left - margin.right,
  plot_height = 500 - margin.top - margin.bottom;

// Define 'svg' as a child-element (g) from the drawing area and include spaces
/*let svg = d3.select("#top5hyper").append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");*/

let padding = 30;

// load data using promises

let promises = [

    d3.csv("data/Top5_hyperinflation.csv"),
    d3.csv("data/IMF_all_index.csv")

];


Promise.all(promises)
    .then(function (data) {
        initialData = data;
        initMainPage(data)
    })
    .catch(function (err) {
        console.log(err)
    });


function initMainPage(dataArray) {
    console.log(dataArray[0])

    top5hyperVis = new topHyperVis ('top5hyper', dataArray[0])
    console.log(dataArray[1])

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


