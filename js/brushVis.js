/****************
 *
 * Creator: Sahil Sakhuja
 *
 */

class brushVis {
    constructor(_parentElement, _data, _country) {
        this.parentElement = _parentElement;
        this.data = _data;
        this.country = _country;

        // convert the dates to actual dates - we'll need this for filtering
        // we need to do this only once

        // sort the data by date - just in case
        // we need to do this only once
        this.data = this.data.sort((a, b) => a.Date - b.Date);

        this.displayData = [];

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

        // draw the brushing component
        vis.brushMargin = { top: 0, right: 0, bottom: 20, left: 50 };
        vis.brushWidth = vis.width - vis.brushMargin.left,
            vis.brushHeight = vis.height - vis.brushMargin.bottom;

        // init scales
        vis.x = d3.scaleTime()
            .range([0, vis.brushWidth]);

        vis.y = d3.scaleLinear()
            .range([vis.brushHeight, 0]);

        // init x & y axis
        vis.xAxis = vis.svg.append("g")
            .attr("class", "axis axis-x")
            .attr("transform", "translate(" + vis.brushMargin.left + ", " + (vis.brushHeight) + ")");

        vis.yAxis = vis.svg.append("g")
            .attr("class", "axis axis-y")
            .attr('transform', "translate(" + vis.brushMargin.left + "," + 0 + ")");

        vis.brushHolder = vis.svg.append('g')
            .attr('class', 'brush-holder')
            .attr('transform', 'translate('+ vis.brushMargin.left +', ' + 0 + ')');

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

        // init brush
        vis.brush = d3.brushX()
            .extent([[0, 0], [vis.brushWidth, vis.brushHeight]])
            .on("brush end", function (event) {
                let selectedTimeRange = [vis.x.invert(event.selection[0]), vis.x.invert(event.selection[1])];
                let startYear = selectedTimeRange[0].getFullYear();
                let endYear = selectedTimeRange[1].getFullYear();
                brushUpdate(startYear, endYear);
            });

        vis.brushHolder
            .call(vis.brush);

        vis.wrangleData();
    }

    wrangleData() {
        let vis = this;

        vis.displayData = vis.data.filter((d) => d.Country === vis.country);

        vis.updateVis();

    }

    updateVis() {
        let vis = this;

        vis.x.domain(d3.extent(vis.displayData, (d) => d.Date));
        vis.y.domain(d3.extent(vis.displayData, (d) => d['Consumer Price Index']));

        // draw x & y axis
        vis.xAxis.transition().duration(400).call(d3.axisBottom(vis.x));
        vis.yAxis.transition().duration(400).call(d3.axisLeft(vis.y).ticks(5));

        // draw the path
        vis.pathOne.datum(vis.displayData)
            .transition().duration(400)
            .attr("d", vis.area)
            .attr("class", 'brush-path')
            .attr("clip-path", "url(#clip)");
    }

    updateCountry(_country) {
        let vis = this;
        vis.country = _country;
        vis.wrangleData();
    }


}
