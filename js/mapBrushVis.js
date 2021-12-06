mapBrushVis = function (_parentElement, _data) {
    this.parentElement = _parentElement;
    this.data = _data;
    this.displayData = [];
    this.parseDate = d3.timeParse("%Y");

    // call method initVis
    this.initVis();
};

// init brushVis
mapBrushVis.prototype.initVis = function () {
    let vis = this;

    vis.margin = {top: 20, right: 50, bottom: 20, left: 50};
    // vis.width = 500
    // vis.height = 300
    vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right,
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;

    // SVG drawing area
    vis.svg = d3.select("#" + vis.parentElement).append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

    // clip path
    vis.svg.append("defs")
        .append("clipPath")
        .attr("id", "clip_mapBrush")
        .append("rect")
        .attr("width", vis.width)
        .attr("height", vis.height);


    // init scales
    vis.x = d3.scaleTime().range([0, vis.width]);
    vis.y = d3.scaleLinear().range([vis.height, 0]);

    // init x & y axis
    vis.xAxis = vis.svg.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + vis.height + ")");
    vis.yAxis = vis.svg.append("g")
        .attr("class", "axis axis--y");

    // init pathGroup
    vis.pathGroup = vis.svg.append('g').attr('class', 'pathGroup');

    // init path one (average)
    vis.pathOne = vis.pathGroup
        .append('path')
        .attr("class", "pathOne");

    // init path two (single state)
    vis.pathTwo = vis.pathGroup
        .append('path')
        .attr("class", "pathTwo");

    // init path generator
    vis.area = d3.area()
        // .curve(d3.curveMonotoneX)
        .x(function (d) {
            return vis.x(d.date);
        })
        .y0(vis.y(0))
        .y1(function (d) {
            return vis.y(d.newCases);
        });

    // init brushGroup:
    vis.brushGroup = vis.svg.append("g")
        .attr("class", "brush");

    // init brush
    vis.brush = d3.brushX()
        .extent([[0, 0], [vis.width, vis.height]])
        .on("brush end", function (event) {
            selectedTimeRange = [vis.x.invert(event.selection[0]), vis.x.invert(event.selection[1])];

            startRange = new Date(selectedTimeRange[0].getTime() - (selectedTimeRange[0].getTimezoneOffset() * 60000 ))
                .toISOString()
                .split("T")[0].slice(0,4);

            endRange = new Date(selectedTimeRange[1].getTime() - (selectedTimeRange[1].getTimezoneOffset() * 60000 ))
                .toISOString()
                .split("T")[0].slice(0,4);

            myMapVis.wrangleData();

        });

    // init basic data processing
    this.wrangleDataStatic();
};

// init basic data processing - prepares data for brush - done only once
mapBrushVis.prototype.wrangleDataStatic = function () {
    let vis = this;

    // rearrange data structure and group by state
    let dataByDate = Array.from(d3.group(vis.data, d => d.year), ([key, value]) => ({key, value}))


    vis.preProcessedData = [];

    // iterate over each year
    dataByDate.forEach(year => {
        let tmpSumNewCases = 0;
        let count = 0
        year.value.forEach(entry => {
            if (entry['interestRate']) {
                tmpSumNewCases += entry['interestRate'];
                count += 1

            }
        });


        vis.preProcessedData.push(
            {date: vis.parseDate(year.key), newCases: tmpSumNewCases/count}
        )
    });



    this.wrangleData();
};

// wrangleData - gets called whenever a state is selected
mapBrushVis.prototype.wrangleData = function () {
    let vis = this;

    // Update the visualization
    this.updateVis();
};

// updateVis
mapBrushVis.prototype.updateVis = function () {
    let vis = this;

    // update domains
    vis.preProcessedData = vis.preProcessedData.slice(0, -1)
    vis.x.domain(d3.extent(vis.preProcessedData, function (d) {
        return d.date
    }));
    vis.y.domain(d3.extent(vis.preProcessedData, function (d) {
        return d.newCases
    }));

    // draw x & y axis
    vis.xAxis.transition().duration(400).call(d3.axisBottom(vis.x));
    vis.yAxis.transition().duration(400).call(d3.axisLeft(vis.y).ticks(5));

    // draw pathOne
    vis.pathOne.datum(vis.preProcessedData)
        .attr("d", vis.area)
        .attr("class", 'brush-path')
        .attr("clip-path", "url(#clip)");

    vis.brushGroup
        .call(vis.brush);
};