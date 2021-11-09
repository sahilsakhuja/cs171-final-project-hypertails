
// Margin object with properties for the four directions
let margin = {top: 20, right: 10, bottom: 20, left: 10};

// Width and height as the inner dimensions of the chart area
// changed width to support 2 plots
let width = 1400 - margin.left - margin.right,
  height = 500 - margin.top - margin.bottom;

let plot_width = 700 - margin.left - margin.right,
  plot_height = 500 - margin.top - margin.bottom;

// Define 'svg' as a child-element (g) from the drawing area and include spaces
let svg = d3.select("#chart-area").append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

let padding = 30;
