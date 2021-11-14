/*
 * donutVis - Object constructor function
 * @param _parentElement 	-- the HTML element in which to draw the visualization
 * @param _data						-- the actual data: imf_**_rawdata.csv
 */

class donutVis {
    constructor(_parentElement, _data, _weights) {
        this.parentElement = _parentElement;
        this.data = _data;
        this.weights = [];
        Object.keys(_weights).forEach((k) => {
            this.weights.push({
                'key': k,
                'value': _weights[k],
                'active': true
            })
        });

        // setting default params
        this.lastYear = new Date().getFullYear();
        this.startYear = 2015;
        this.endYear = new Date().getFullYear();
        this.colors = ["#d376e3","#334752","#664c6b","#4a913d","#769aad","#42fc21","#27631c","#5e3d63","#f2a277","#2faff5", "#6269A8", "#222759"];

        // convert the dates to actual dates - we'll need this for filtering
        // we need to do this only once
        this.dateParser = d3.timeParse("%d-%b-%Y");
        this.data.forEach((d) => {
            d.Date = this.dateParser(d.Date);
            Object.keys(d).forEach( (k) =>
            {
                if (k !== 'Date')
                    d[k] = +d[k];
            });
            return d;
        });

        // sort the data by date - just in case
        // we need to do this only once
        this.data = this.data.sort((a, b) => a.Date - b.Date);

        // sort the weights and set the weights below 1% to inactive (since we only want to show some of the values in the inital plot)
        // we need to do this only once
        this.weights.sort((a, b) => b.value - a.value);
        this.weights.map((w) => {
            if (w.value <= 5)
                w.active = false;
        });

        // console.log(this.data);

        // set the actual data to filtered data object
        this.filteredData = this.data;

        this.initVis();
    }

    initVis() {
        let vis = this;

        vis.margin = { top: 10, right: 10, bottom: 10, left: 10 };

        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right,
            vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;

        // SVG drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

        vis.legendDimLeft = 50;
        vis.brushDimBottom = 150;

        vis.pieWidth = (vis.width - vis.legendDimLeft);
        vis.pieHeight = (vis.height - vis.brushDimBottom);

        vis.pieChartGroup = vis.svg.append('g')
            .attr('class', 'pie-chart-group')
            .attr("transform", "translate(" + vis.pieWidth / 2 + "," + vis.pieHeight / 2 + ")");

        vis.pie = d3.pie()
            .value((d) => d.value);

        vis.tooltip = d3.select("body").append('div')
            .attr('class', "tooltip")
            .attr('id', 'pieTooltip')

        // set some of the configuration values for the pie chart
        vis.piePadding = 2; // the padding between 2 donut charts
        vis.innerMostRadius = 10; // the inner radius of the inner most donut
        vis.outerMostRadius = Math.min(vis.pieWidth, vis.pieHeight) / 2; // the outer radius of the outer most donut

        // draw the initial legend
        vis.legend = vis.svg.append('g')
            .attr('class', 'legend-group')
            .attr("transform", "translate(0, 0)");

        vis.legendRects = vis.legend.selectAll('rect')
            .data(vis.weights)
            .enter()
            .append('rect')
            .attr('class', 'legend-rect')
            .attr('width', 10)
            .attr('height', 10)
            .attr('x', 2)
            .attr('y', (d, i) => i * 15)
            .attr('fill', (d, i) => vis.colors[i])
            .on('click', (event, d) => {
                vis.weights.map((w) => {
                    if (w.key == d.key)
                        w.active = !w.active;
                })
                vis.wrangleData();
            });

        vis.legend.selectAll('text')
            .data(vis.weights)
            .enter()
            .append('text')
            .attr('class', 'legend-text')
            .attr('x', 15)
            .attr('y', (d, i) => i * 15 + 10)
            .text((d) => {
                if (d.key.length > 30)
                    return d.key.substr(0, 30) + '...';
                else
                    return d.key;
            })
            .on('click', (event, d) => {
                vis.weights.map((w) => {
                    if (w.key == d.key)
                        w.active = !w.active;
                })
                vis.wrangleData();
            });

        // draw the brushing component
        vis.brushMargin = { top: 0, right: 0, bottom: 20, left: 50 };
        vis.brushWidth = vis.width - vis.brushMargin.left,
            vis.brushHeight = vis.brushDimBottom - vis.brushMargin.bottom;

        // init scales
        vis.x = d3.scaleTime()
            .range([0, vis.brushWidth])
            .domain(d3.extent(vis.data, (d) => d.Date));

        vis.y = d3.scaleLinear()
            .range([vis.brushHeight, 0])
            .domain(d3.extent(vis.data, (d) => d['Consumer Price Index']));

        // init x & y axis
        vis.xAxis = vis.svg.append("g")
            .attr("class", "axis axis-x")
            .attr("transform", "translate(" + vis.brushMargin.left + ", " + (vis.pieHeight + vis.brushHeight) + ")");

        vis.yAxis = vis.svg.append("g")
            .attr("class", "axis axis-y")
            .attr('transform', "translate(" + vis.brushMargin.left + "," + vis.pieHeight + ")");

        vis.brushHolder = vis.svg.append('g')
            .attr('class', 'brush-holder')
            .attr('transform', 'translate('+ vis.brushMargin.left +', ' + vis.pieHeight + ')');

        // init pathGroup
        vis.pathGroup = vis.brushHolder
            .append('g')
            .attr('class', 'pathGroup');

        // clip path
        vis.pathGroup.append("defs")
            .append("clipPath")
            .attr("id", "clip")
            .append("rect")
            .attr("width", vis.brushWidth)
            .attr("height", vis.brushHeight);

        // init path for CPI
        vis.pathOne = vis.pathGroup
            .append('path')
            .attr("class", "pathOne");

        // init path generator
        vis.area = d3.area()
            .curve(d3.curveMonotoneX)
            .x(function (d) {
                return vis.x(d.Date);
            })
            .y0(vis.y(0))
            .y1(function (d) {
                return vis.y(d['Consumer Price Index']);
            });

        // draw x & y axis
        vis.xAxis.transition().duration(400).call(d3.axisBottom(vis.x));
        vis.yAxis.transition().duration(400).call(d3.axisLeft(vis.y).ticks(5));

        // draw the path
        vis.pathOne.datum(vis.data)
            .transition().duration(400)
            .attr("d", vis.area)
            .attr("class", 'brush-path')
            .attr("clip-path", "url(#clip)");

        // init brush
        vis.brush = d3.brushX()
            .extent([[0, 0], [vis.brushWidth, vis.brushHeight]])
            .on("brush end", function (event) {
                let selectedTimeRange = [vis.x.invert(event.selection[0]), vis.x.invert(event.selection[1])];
                vis.startYear = selectedTimeRange[0].getFullYear();
                vis.endYear = selectedTimeRange[1].getFullYear();
                vis.wrangleData();
            });

        vis.brushHolder
            .call(vis.brush);

        vis.wrangleData();
    }

    wrangleData() {
        let vis = this;

        // let's start by displaying only for december of each year and the last month of the last year
        let total_cnt = vis.data.length;
        vis.filteredData = vis.data.filter((d, i) => {
            if (d.Date.getMonth() === 11 && d.Date.getFullYear() >= vis.startYear && d.Date.getFullYear() <= vis.endYear)
                return true;
            else if ((vis.endYear === vis.lastYear) && (i+1) === total_cnt)
                // special handling to also pick the last available date if end year is the same as last available year
                return true;
            else
                return false;
        });

        vis.filteredData = this.filteredData.sort((a, b) => a.Date - b.Date);

        // console.log(vis.filteredData);

        // apply the weights to the filtered data
        vis.displayData = vis.filteredData.map((d) => {
            let new_d = {};
            new_d.Date = d.Date;
            new_d.PieValues = [];
            vis.weights.forEach((w, i) => {
                if (w.active)
                    new_d.PieValues.push(
                        {
                            'key': w.key,
                            'value': d[w.key] * w.value / 100,
                            'weight_idx': i
                        }
                    )
            });
            return new_d;
        });

        // console.log(vis.filteredData[0]);
        // console.log(vis.displayData[0]);

        // console.log(vis.displayData);

        vis.updateVis();

    }

    updateVis() {
        let vis = this;

        vis.pieWidth =  ((vis.outerMostRadius - vis.innerMostRadius) / vis.displayData.length) - vis.piePadding; // the

        vis.displayData.forEach((d, i) => {
            let innerRadius = vis.innerMostRadius + vis.pieWidth * i + vis.piePadding * i;
            let outerRadius = innerRadius + vis.pieWidth;

            let arc = d3.arc()
                .innerRadius(innerRadius)
                .outerRadius(outerRadius);

            let arcs = vis.pieChartGroup.selectAll(`.arc-parts-${i}`)
                .data(vis.pie(d.PieValues));

            arcs.enter()
                .append('path')
                .attr('class', `arc arc-parts-${i}`)
                .merge(arcs)
                .transition()
                .duration(400)
                .attr('d', arc)
                .attr('fill', (_d) => {
                    return vis.colors[_d.data.weight_idx];
                })
                .attr('opacity', 0.25 + i * 0.07);

            arcs.exit().remove();

        });

        vis.legend.selectAll('rect')
            .attr('opacity', (d) => d.active ? 1 : 0.25);

        vis.legend.selectAll('text')
            .attr('opacity', (d) => d.active ? 1 : 0.25);

        // let outerRadius = vis.width / 10;
        // let innerRadius = vis.width / 12;      // Relevant for donut charts
        //
        //
        // arcs.enter()
        //     .append("path")
        //     .merge(arcs)
        //     .attr("d", vis.arc)
        //     .attr("fill", (d, idx) => {
        //         // return vis.circleColors[idx]
        //         return 'red';
        //     })
        //     .attr('class', 'arc')
        //     .on('mouseover', function(event, d){
        //
        //         d3.select(this)
        //             .attr('stroke-width', '2px')
        //             .attr('stroke', 'black')
        //             .attr('fill', 'rgba(173,222,255,0.62)')
        //
        //         vis.tooltip
        //             .style("opacity", 1)
        //             .style("left", event.pageX + 20 + "px")
        //             .style("top", event.pageY + "px")
        //             .html(`<div style="border: thin solid grey; border-radius: 5px; background: lightgrey; padding: 20px">
        //      <h3>Arc with index #${d.index}<h3>
        //      <h4> value: ${d.value}</h4>
        //      <h4> startAngle: ${d.startAngle}</h4>
        //      <h4> endAngle: ${d.endAngle}</h4>
        //      <h4> data: ${JSON.stringify(d.data)}</h4>
        //  </div>`);
        //
        //     }).on('mouseout', function(event, d){
        //     d3.select(this)
        //         .attr('stroke-width', '0px')
        //         .attr("fill", d => d.data.color)
        //
        //     vis.tooltip
        //         .style("opacity", 0)
        //         .style("left", 0)
        //         .style("top", 0)
        //         .html(``);
        // });
        //
        // arcs.exit().remove();

    }


}
