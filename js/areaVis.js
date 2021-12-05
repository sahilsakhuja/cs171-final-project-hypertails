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


        /*// Add x-axis
        vis.xScale = d3.scaleTime()
            .range([0, vis.width])*/


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


        /*// Add right y-axis for line chart
        vis.yScaleR = d3.scaleLinear()
            .range([vis.height, 0])

        vis.yAxisR = d3.axisRight()
            .scale(vis.yScaleR)

        vis.svg.append("g")
            .attr("class", "axis y-axisR")
            .attr("transform", "translate(" + vis.width + ",0)")
            .call(vis.yAxisR)*/

        // Create area chart class
        /*vis.areachart = vis.svg.append("path")
            .attr("class", "area");*/

        /*// Create line chart
        vis.exch_linechart = vis.svg.append('path')
            .attr('class', 'line')

        vis.exch_line = d3.line()
            .x(function(d) { return vis.xScale(d.year); })
            .y(function(d) { return vis.yScaleR(d.rate); })
            .curve(d3.curveLinear);*/


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

        /*// Add right y-axis text
        vis.svg.append("text")
            .attr("x", vis.width-18)
            .attr("y", -5)
            .text("SDG/USD")
            .style("font-size", "12px")

        // Add text for line chart
        vis.svg.append("text")
            .classed('text_line', true)

        // tooltip
        vis.tooltip = vis.svg.append('g')
            .attr('class', 'tooltip')
            .style('display', 'block');

        // Add line for moving mouse tooltip
        vis.svg.append('line')
            .classed('mouse_line', true)
            .attr('stroke', 'black')
            .attr('stroke-width', '2px')
            .attr('height', vis.height)
            .attr('width', vis.width)*/

        // Add text for tooltip
        /*vis.svg.append('text')
            .classed('mouse_cpi', true)

        vis.svg.append('text')
            .classed('mouse_exch', true)*/

        // Add text to line chart
        /*vis.svg.append('text')
            .style("font-size", "14px")
            .style('fill', 'black')
            .attr('x', 10)
            .attr('y', 115)
            .text('Exchange Rate')

        // Add text to area chart
        vis.svg.append('text')
            .style("font-size", "14px")
            .style('fill', 'black')
            .attr('x', 10)
            .attr('y', vis.height-10)
            .text('CPI')*/

        // Add hoverpoint to mouse event
        //vis.svg.append('circle').classed('hoverPoint-area', true);
        //vis.svg.append('circle').classed('hoverPoint-line', true);

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

        // Convert strings to datetime object and float for CPI data
        // for (let item of vis.cpi) {
        //     let year = parseTime(item["Year"]);
        //     let cpi = parseFloat(item['Consumer Price Index, All items']);
        //     let newItem = {
        //         "year": year,
        //         "cpi": cpi,
        //     }
        //
        //     sudanCPI.push(newItem)
        //
        // };
        // vis.sudan_cpi = sudanCPI;
        // console.log(vis.sudan_cpi)

        /*let sudan_exch = [];

        // Convert strings to datetime object and float for exchange rate data
        for (let item_ of vis.exch) {
            let year = parseTime(item_["Year"]);
            let exch = parseFloat(parseFloat(item_['Exchange Rate']).toFixed(4));

            let newItem_ = {
                "year": year,
                "rate": exch,
            }

            sudan_exch.push(newItem_)

        };
        vis.exch_rate = sudan_exch;
        console.log(vis.exch_rate)*/



        vis.updateVis()

    }

    updateVis() {
        let vis = this;

        // console.log(vis.displayData);

        // Update x domain
        /*vis.xScale.domain(d3.extent(vis.exch_rate.map(function (d){
            return d.year;
        })))*/

        // vis.xScale.domain(vis.sudan_cpi.map(function (d) {
        //     return d.year;
        // }))

        // vis.xScale.domain(d3.extent(vis.displayData, (d) => d.Date));

        vis.xScale.domain(d3.range(vis.startYear, vis.endYear+1));

        // Update x-axis with new tick values

        // let tickValuesForxAxis = vis.sudan_cpi.map(d => d.year);
        let tickValuesForxAxis = d3.range(vis.startYear, vis.endYear+1);
        // console.log(tickValuesForxAxis);

        // vis.xAxis
        //     .tickValues(tickValuesForxAxis.filter (function (d, i) {
        //         return !(i%20);
        //     }))
        //     .tickFormat(function (d) {
        //         return vis.formatDate(d);
        //     });

        vis.xAxis
            .tickValues(tickValuesForxAxis.filter (function (d, i) {
                return (i%2);
            }));

        // Update y domain
        /* vis.yScaleL.domain(d3.extent(vis.sudan_cpi, function (d) {
             return d.cpi;
         }))*/

        vis.yScaleL.domain([0, d3.max(vis.displayData, function (d) {
            return d['Consumer Price Index'];
        })]);


        // Update color domain
        // vis.colors.domain([
        //     d3.max(vis.sudan_cpi, function (d) { return d.cpi; }),
        //     d3.min(vis.sudan_cpi, function (d) { return d.cpi; })
        // ])

        vis.colors.domain(d3.extent(vis.displayData, function (d) {
            return d['Consumer Price Index'];
        }));

        /*vis.yScaleR.domain(d3.extent(vis.exch_rate, (function (d) {
            return d.rate;
        })));*/


        // Update area chart
        /*vis.areachart
            .datum(vis.sudan_cpi)
            //.transition()
            .attr("fill", "pink")
            .attr("stroke", "black")
            .attr("stroke-width", 1.5)
            .attr("d", d3.area()
                .x(function(d) { return vis.xScale(d.year) })
                .y0(vis.height)
                .y1(function(d) { return vis.yScaleL(d.cpi) })
            )*/

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

        //vis.rects.exit().remove()

        // Update tooltip
        /*vis.svg.append('rect')
            .attr('class', 'tooltipbox')
            .attr('width', vis.width)
            .attr('height', vis.height)
            .on('mouseover', function (d) {
                vis.tooltip.style('display', null)
                console.log('mouseover')

            })
            .on('mouseout', function (d) {
                vis.tooltip.style('display', 'none')

            })
            .on('mousemove', mousemove)

        // Create mousemove function
        function mousemove(event) {

            let bisectDate = d3.bisector(d=>d.year).right;

            // Convert event to date
            let x_area = vis.xScale.invert(d3.pointer(event)[0]);
            //let x_line = vis.xScale.invert(d3.pointer(event)[0]);

            // Find index of date
            let idx1 = bisectDate(vis.sudan_cpi, x_area, 1)
            //let idx2 = bisectDate(vis.exch_rate, x_line, 1)

            // Convert index to corresponding date
            let sudanSelection = vis.sudan_cpi[idx1];
            let selectedCPI = sudanSelection.cpi;

            //let exchSelection = vis.exch_rate[idx2];
            //let selectedExch = exchSelection.rate;

            // Find closest point when mouse moves
            let y0_area = vis.sudan_cpi[idx1-1];
            let y1_area = vis.sudan_cpi[idx1];
            let y_area = x_area - y0_area.year > y1_area.year - x_area ? y1_area : y0_area


            let y0_line = vis.exch_rate[idx2-1];
            let y1_line = vis.exch_rate[idx2];
            let y_line = x_area - y0_line.year > y1_line.year - x_line ? y1_line : y0_line


            // Update vertical line when mouse moves
            vis.svg.selectAll('.mouse_line')
                .attr('x1', vis.xScale(x_area))
                .attr('x2', vis.xScale(x_area))
                .attr('y1', 0)
                .attr('y2', vis.height)
                .attr('fill', 'black')

            // Add text to moving line when mouse moves
            vis.svg.select('.mouse_cpi')
                .attr('x', vis.xScale(x_area))
                .attr('y', 20)
                .attr('dx', 10)
                .style('fill', 'red')
                .text('CPI: ' + selectedCPI)

            /*vis.svg.select('.mouse_exch')
                .attr('x', vis.xScale(x_line))
                .attr('y', selectedExch)
                .attr('dx', 10)
                .style('fill', 'blue')
                .text('Exchange Rate: ' + selectedExch)

            // Update hover point when mouse moves
            vis.svg.selectAll('.hoverPoint-line')
                .attr('cx', vis.xScale(x_line))
                .attr('cy', vis.yScaleR(selectedExch))
                .attr('r', '7')
                .attr('fill', 'blue');

            vis.svg.selectAll('.hoverPoint-area')
                .attr('cx', vis.xScale(x_area))
                .attr('cy', vis.yScaleL(selectedCPI))
                .attr('r', '7')
                .attr('fill', 'red');

        }*/


        // Update line chart
        /*vis.exch_linechart
           //.transition()
           //.duration(800)
           .attr('d', vis.exch_line(vis.exch_rate))
           .attr("fill", "none")
           .attr('stroke', 'black')
            .attr("stroke-width", 1.5)*/




        // Update y-axis
        vis.svg.select(".y-axisL")
            .call(vis.yAxisL);
        //
        // /*vis.svg.select(".y-axisR")
        //     .call(vis.yAxisR);*/
        //
        vis.svg.select(".x-axis").call(vis.xAxis);



    }

    animateBarChart() {
        let vis = this;

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
