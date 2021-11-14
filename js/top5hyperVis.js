class topHyperVis {

    // Create topHyperVis constructor
    constructor(parentElement, inflation) {
        this.parentElement = parentElement;
        this.inflation = inflation;

        this.initVis()
    }

    initVis(){

        let vis = this;

        vis.margin = {top: 20, right: 20, bottom: 20, left: 40};
        //vis.width = 500;
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width+200 - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;


        // init drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append('g')
            .attr('transform', `translate (${vis.margin.left}, ${vis.margin.top})`);


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


        vis.svg.append("text")
            .attr("x", -35)
            .attr("y", 0)
            .text("(%)");


        this.wrangleData();

    }

    wrangleData(){

        let vis = this;

        let filteredData = [];

        let parseTime = d3.timeParse("%Y");

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

        vis.updateVis()

    }


    updateVis(){

        let selectedCategoryEl = document.getElementById("categorySelector");
        let selectedCategory = selectedCategoryEl.value;

        let vis = this;


        // (1) Update domain
        vis.x.domain(d3.extent(vis.filteredInflation.map(function (d){
            return d.year;
        })))

        vis.y.domain(d3.extent(vis.filteredInflation.map(function (d) {
            return d[selectedCategory];
        })));




        let xData = vis.filteredInflation.map(function (d) {
            return d.year;
        });

        let yData = vis.filteredInflation.map(function (d) {
            return d[selectedCategory];
        });


        vis.top5line = vis.svg.append("path")
            .datum(vis.filteredInflation);

        vis.top5line.enter()
            .append()
            .merge(vis.top5line)
            .attr("fill", "none")
            .attr("stroke", "salmon")
            .attr("stroke-width", 1.5)
            .transition().duration(3000).delay(500)
            .attr("d", d3.line()
                .x(function(d) { return vis.x(d.year)})
                .y(function(d) { return vis.y(d[selectedCategory]) }))




        vis.top5line.exit().remove();

        // Update y-axis
        vis.svg.select(".y-axis")
            .transition()
            .duration(2000)
            .call(vis.yAxis);

        // Update x-axis
        vis.svg.select(".x-axis").call(vis.xAxis);

    }
};