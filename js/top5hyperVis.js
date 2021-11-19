class topHyperVis {

    // Create topHyperVis constructor
    constructor(parentElement, inflation) {
        this.parentElement = parentElement;
        this.inflation = inflation;

        this.initVis()
    }

    initVis(){

        let vis = this;

        // Adjust by screen size
        vis.margin = {top: 20, right: 20, bottom: 20, left: 40};
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width+200 - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;


        // init drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append('g')
            .attr('transform', `translate (${vis.margin.left}, ${vis.margin.top})`);

        // Add x-axis & y-axis
        vis.x = d3.scaleTime()
            .range([0, vis.width]);

        vis.y = d3.scaleLinear()
            .range([vis.height, 0]);

        vis.xAxis = d3.axisBottom()
            .scale(vis.x);

        vis.yAxis = d3.axisLeft()
            .scale(vis.y);

        vis.svg.append("g")
            .attr("class", "x-axis axis")
            .attr("transform", "translate(0," + vis.height + ")");

        vis.svg.append("g")
            .attr("class", "y-axis axis");

        vis.top5linechart = vis.svg.append('path')
            .attr('class', 'line')

        // Create line chart
        vis.top5line = d3.line()
            .x(function(d) { return vis.x(d.year); })
            .y(function(d) { return vis.y(d[selectedCategory]); })
            .curve(d3.curveLinear);

        // Add y-axis text
        vis.svg.append("text")
            .attr("x", -35)
            .attr("y", 0)
            .text("(%)");

        vis.tooltip_box = vis.svg.append("g")
            .style("display", "none");



        this.wrangleData();

    }

    wrangleData(){

        let vis = this;

        let filteredData = [];

        let parseTime = d3.timeParse("%Y");

        // Convert strings to datetime object and float
        for (let item of vis.inflation) {
            let year = parseTime(item["Year"]);
            let angola = parseFloat(parseFloat(item['Angola']).toFixed(2));
            let turkey = parseFloat(parseFloat(item['Turkey']).toFixed(2));
            let bulgaria = parseFloat(parseFloat(item['Bulgaria']).toFixed(2));
            let sudan = parseFloat(parseFloat(item['Sudan']).toFixed(2));
            let zimbabwe = parseFloat(parseFloat(item['Zimbabwe']).toFixed(2));

            let newItem = {
                "year": year,
                "angola": angola,
                "turkey": turkey,
                "bulgaria": bulgaria,
                "sudan": sudan,
                "zimbabwe": zimbabwe
            }
            filteredData.push(newItem)
        };

        vis.filteredInflation = filteredData;
        console.log(vis.filteredInflation)

        vis.updateVis()

    }


    updateVis(){

        let selectedCategoryEl = document.getElementById("categorySelector");
        let selectedCategory = selectedCategoryEl.value;

        let vis = this;


        // Update domain
        vis.x.domain(d3.extent(vis.filteredInflation.map(function (d){
            return d.year;
        })))

        vis.y.domain(d3.extent(vis.filteredInflation.map(function (d) {
            return d[selectedCategory];
        })));

        // Update line chart
        vis.top5linechart
            .transition()
            .duration(800)
            .attr('d', vis.top5line(vis.filteredInflation))
            .attr("fill", "none")
            .attr('stroke', 'salmon')

        // Add circle to line chart
        vis.circles = vis.svg.selectAll('.tooltipCircle')
            .data(vis.filteredInflation, function (d) { return d.year; })

        vis.circles.enter().append('circle')
            .attr('class', 'tooltipCircle')
            .merge(vis.circles)
            .attr('cx', function (d) {
                return vis.x(d.year);
            })
            .attr('cy', function (d) {
                return vis.y(d[selectedCategory]);
            })
            .transition()
            .delay(1000)
            .attr('fill', 'red')
            .attr('r', 3)

        vis.circles.exit().remove()


        // Update y-axis
        vis.svg.select(".y-axis")
            .transition()
            .duration(2000)
            .call(vis.yAxis);

        // Update x-axis
        vis.svg.select(".x-axis").call(vis.xAxis);

    }
};