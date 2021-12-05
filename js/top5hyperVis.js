/******************
 *
 * Creator: Janice Ly Pham
 * Contributor: Sahil Sakhuja (Combined with Stacked Donut Chart)
 *
 */


class topHyperVis {

    // Create topHyperVis constructor
    constructor(parentElement, _data, _country) {
        this.parentElement = parentElement;
        this.data = _data;
        this.country = _country;

        this.displayData = [];

        this.lastYear = new Date().getFullYear();
        this.startYear = 2015;
        this.endYear = new Date().getFullYear();

        this.initVis()
    }

    initVis(){

        let vis = this;

        // Adjust by screen size
        vis.margin = {top: 20, right: 20, bottom: 20, left: 55};
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - 80 - vis.margin.left - vis.margin.right;
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
            .x(function(d) { return vis.x(d.Date); })
            .y(function(d) { return vis.y(d['Consumer Price Index']); })
            .curve(d3.curveLinear);

        // Add y-axis text
        vis.svg.append("text")
            .attr("x", -25)
            .attr("y", -10)
            .text("CPI");

        vis.tooltip_box = vis.svg.append("g")
            .style("display", "none");

        this.wrangleData();

    }

    wrangleData(){

        let vis = this;

        // filter out the data only for the selected country
        vis.filteredData = vis.data.filter((d) => d.Country === vis.country );

        // we want to display only for december of each year and the last month of the last year
        let total_cnt = vis.filteredData.length;
        vis.filteredData = vis.filteredData.filter((d, i) => {
            if (d.Date.getMonth() === 11 && d.Date.getFullYear() >= vis.startYear && d.Date.getFullYear() <= vis.endYear)
                return true;
            else if ((vis.endYear === vis.lastYear) && (i+1) === total_cnt)
                // special handling to also pick the last available date if end year is the same as last available year
                return true;
            else
                return false;
        });

        vis.displayData = vis.filteredData.sort((a, b) => a.Date - b.Date);

        vis.updateVis()

    }


    updateVis(){

        let vis = this;

        // Update x domain
        vis.x.domain(d3.extent(vis.displayData.map(function (d){
            return d.Date;
        })))

        // Update y domain
        vis.y.domain(d3.extent(vis.displayData.map(function (d) {
            return d['Consumer Price Index'];
        })));

        // Update line chart
        vis.top5linechart
            .transition()
            .duration(800)
            .attr('d', vis.top5line(vis.displayData))
            .attr("fill", "none")
            .attr('stroke', 'salmon')

        // Add circle to line chart
        vis.circles = vis.svg.selectAll('.tooltipCircle')
            .data(vis.displayData, function (d) { return d.Date; })

        vis.circles.enter().append('circle')
            .attr('class', 'tooltipCircle')
            .merge(vis.circles)
            .transition()
            .duration(800)
            .attr('cx', function (d) {
                return vis.x(d.Date);
            })
            .attr('cy', function (d) {
                return vis.y(d['Consumer Price Index']);
            })
            .attr('fill', 'red')
            .attr('r', 3)

        vis.circles.exit().remove()


        // Update y-axis and add transition
        vis.svg.select(".y-axis")
            .transition()
            .duration(2000)
            .call(vis.yAxis);

        // Update x-axis
        vis.svg.select(".x-axis").call(vis.xAxis);

    }

    updateCountry(_country) {
        let vis = this;
        vis.country = _country;
        vis.wrangleData();
    }

    updateYears(startYear, endYear) {
        let vis = this;

        vis.startYear = startYear;
        vis.endYear = endYear;

        vis.wrangleData();

    }

}