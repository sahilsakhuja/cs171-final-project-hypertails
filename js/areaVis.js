/****************
 *
 * Creator: Janice Ly Pham
 *
 */

class areaVis {

    // Initialize AreaVis constructor
    constructor(parentElement, _data
                // , exch
                , _country
    ) {
        this.parentElement = parentElement;
        this.data = _data;
        this.country = _country;

        this.startYear = d3.min(this.data.filter((f) => f.Country === this.country), (d) => d.Date.getFullYear());
        this.endYear = d3.max(this.data.filter((f) => f.Country === this.country), (d) => d.Date.getFullYear());
        this.lastYear = d3.max(this.data.filter((f) => f.Country === this.country), (d) => d.Date.getFullYear());

        this.displayData = [];
        this.initVis()

    }

    initVis(){

        let vis = this;

        // Adjust by screen size
        vis.margin = {top: 20, right: 50, bottom: 20, left: 50};
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;

        // init drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append('g')
            .attr('transform', `translate (${vis.margin.left}, ${vis.margin.top})`);


        // Add x-axis
        vis.xScale = d3.scaleBand()
            .range([0, vis.width])
            .paddingInner(0.1);

        vis.xAxis = d3.axisBottom()
            .scale(vis.xScale);

        vis.svg.append("g")
            .attr("class", "axis x-axis")
            .attr("transform", "translate(0," + vis.height + ")")
            .call(vis.xAxis);

        // Add left y-axis for area chart
        vis.yScaleL = d3.scaleLinear()
            .range([vis.height, 0]);

        vis.yAxisL = d3.axisLeft()
            .scale(vis.yScaleL);

        vis.svg.append("g")
            .attr("class", "axis y-axisL")
            .attr("transform", "translate(0, 0)")
            .call(vis.yAxisL);

        // Add color scale
        vis.colors = d3.scaleSequential()
            .range(['#585b56', '#ea526f'])


        // Add left y-axis text
        vis.svg.append("text")
            .attr("x", -20)
            .attr("y", -5)
            .text("CPI")
            .style("font-size", "15px");

        // tooltip
        vis.tooltip = d3.select("body").append('div')
            .attr('class', "tooltip tooltip-holder")
            .attr('id', 'barTooltip');


        vis.formatDate = d3.timeFormat('%Y');

        this.wrangleData();


    }


    wrangleData(){
        let vis = this;

        let sudanCPI = [];

        let parseTime = d3.timeParse("%Y-%m-%d");
        vis.filteredData = vis.data.filter((d) => d.Country === vis.country );
        // let's start by displaying only for december of each year and the last month of the last year
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

    updateVis() {
        let vis = this;

        // Updata x domain
        vis.xScale.domain(d3.range(vis.startYear, vis.endYear+1));

        // Update x-axis with new tick values
        let tickValuesForxAxis = d3.range(vis.startYear, vis.endYear+1);

        vis.xAxis
            .tickValues(tickValuesForxAxis.filter (function (d, i) {
                return (i%2);
            }));

        // Update y domain
        vis.yScaleL.domain([0, d3.max(vis.displayData, function (d) {
            return d['Consumer Price Index'];
        })]);


        // Update color domain
        vis.colors.domain(d3.extent(vis.displayData, function (d) {
            return d['Consumer Price Index'];
        }));

        // Add and update barchart
        vis.rects = vis.svg.selectAll('rect')
            .data(vis.displayData);


        vis.rects.enter()
            .append("rect")
            .attr("class", ".rects")
            //.merge(vis.rects)
            .attr("x", function (d) {
                return vis.xScale(d.Date.getFullYear())
            })
            .attr('y', function (d) {
                return vis.yScaleL(0)
            })
            .attr("width", vis.xScale.bandwidth())
            .attr('height', function (d) {
                return vis.height - vis.yScaleL(0)
            } )
            // Add tooltip effect
            .on('mouseover', function(event, d) {
                d3.select(this)
                    .attr('stroke-width', '2px')
                    .attr('stroke', 'black')
                    .attr('fill', 'rgba(173,222,255,0.62)')
                vis.tooltip
                    .style("opacity", 1)
                    .style("left", event.pageX + 5 + "px")
                    .style("top", event.pageY + "px")
                    .html(`
         <div>
             <strong>CPI: </strong>${d['Consumer Price Index']}                 
         </div>`);

            })
            .on('mouseout', function(event, d){
                d3.select(this)
                    .attr('stroke-width', '0px')
                //.attr("fill", d => d.data.color)

                vis.tooltip
                    .style("opacity", 0)
                    .style("left", 0)
                    .style("top", 0)
                    .html(``);
            })


        // Update y-axis
        vis.svg.select(".y-axisL")
            .call(vis.yAxisL);

        //Update x-axis
        vis.svg.select(".x-axis").call(vis.xAxis);



    }

    animateBarChart() {
        let vis = this;

        // Add animation to barchar
        vis.svg.selectAll("rect")
            .transition()
            .duration(400)
            .delay(function(d,i){ return(i*100); })
            .attr("y", function(d) {
                return vis.yScaleL(d['Consumer Price Index']);
            })
            .attr("height", function(d) { return vis.height - vis.yScaleL(d['Consumer Price Index']); })
            .style('fill', function (d) {
                return vis.colors(d['Consumer Price Index']);
            })

    }




}
