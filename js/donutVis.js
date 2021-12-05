/****************
 *
 * Creator: Sahil Sakhuja
 *
 */

/*
 * donutVis - Object constructor function
 * @param _parentElement 	-- the HTML element in which to draw the visualization
 * @param _data						-- the actual data: imf_**_rawdata.csv
 */

class donutVis {
    constructor(_parentElement, _data, _weights, _country) {
        this.parentElement = _parentElement;
        this.data = _data;
        this.weights = _weights;
        this.country = _country;

        // activating only weights which have more than 5% weightage
        this.weightState = {};

        Object.keys(this.weights[this.country]).forEach( (w) => {
            if(this.weights[this.country][w] <= 5)
                this.weightState[w] = false;
            else
                this.weightState[w] = true;
        });

        // setting default params
        // set last year as the last year of the data
        this.lastYear = d3.max(this.data.filter((f) => f.Country === this.country), (d) => d.Date.getFullYear());
        // set first year as 7 years ago
        this.startYear = this.lastYear - 7;
        this.endYear = this.lastYear;
        this.colors = categoryColors;
        this.inactiveColor = inactiveColor;

        // sort the data by date - just in case
        // we need to do this only once
        this.data = this.data.sort((a, b) => a.Date - b.Date);

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
        // vis.brushDimBottom = 150;
        vis.brushDimBottom = 0;

        vis.pieWidth = (vis.width - vis.legendDimLeft);
        vis.pieHeight = (vis.height - vis.brushDimBottom);

        vis.pieChartGroup = vis.svg.append('g')
            .attr('class', 'pie-chart-group')
            .attr("transform", "translate(" + vis.pieWidth * 2 / 3 + "," + vis.pieHeight / 2 + ")");

        vis.pie = d3.pie()
            .value((d) => d.value)
            .sort((a, b) => a.key.localeCompare(b.key));

        vis.tooltip = d3.select('body').append('div')
            .attr('class', "tooltip")
            .attr('id', 'pieTooltip')

        // set some of the configuration values for the pie chart
        vis.piePadding = 2; // the padding between 2 donut charts
        vis.innerMostRadius = 10; // the inner radius of the inner most donut
        vis.outerMostRadius = Math.min(vis.pieWidth, vis.pieHeight) / 2; // the outer radius of the outer most donut

        // draw the year holders
        let right_x = vis.pieWidth * 1 / 3;
        let top_y = - vis.pieHeight / 2;

        vis.pieChartGroup.append('line')
            .attr('id', 'line-center')
            .attr('class', 'year-line')
            .attr('x1', 0)
            .attr('y1', 0)
            .attr('x2', right_x)
            .attr('y2', 0);

        vis.startYearText = vis.pieChartGroup.append('text')
            .attr('id', 'year-text-center')
            .attr('class', 'year-text')
            .attr('x', right_x - 20)
            .attr('y', -10);

        vis.pieChartGroup.append('line')
            .attr('id', 'line-top')
            .attr('class', 'year-line')
            .attr('x1', 0)
            .attr('y1', top_y)
            .attr('x2', right_x)
            .attr('y2', top_y);

        vis.endYearText = vis.pieChartGroup.append('text')
            .attr('id', 'year-text-center')
            .attr('class', 'year-text')
            .attr('x', right_x - 20)
            .attr('y', top_y + 20);

        // draw the initial legend
        vis.legend = vis.svg.append('g')
            .attr('class', 'legend-group')
            .attr("transform", "translate(0, 0)");

        vis.wrangleData();
    }

    wrangleData() {
        let vis = this;

        // filter out the data only for the selected country
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

        vis.filteredData = vis.filteredData.sort((a, b) => a.Date - b.Date);

        // console.log(vis.filteredData);
        // filter the weights
        vis.filteredWeights = vis.weights[vis.country];
        vis.filteredWeightsForDisplay = [];
        Object.keys(vis.filteredWeights).forEach((k) => {
            vis.filteredWeightsForDisplay.push({
                'key': k,
                'value': vis.filteredWeights[k]
            })
        });
        // sort the weights in alphabetic order
        vis.filteredWeightsForDisplay = vis.filteredWeightsForDisplay.sort((a, b) => a.key.localeCompare(b.key));

        // apply the weights to the filtered data
        vis.displayData = vis.filteredData.map((d) => {
            let new_d = {};
            new_d.Date = d.Date;
            new_d.PieValues = [];
            vis.filteredWeightsForDisplay.forEach((w, i) => {
                // if (vis.weightState[w.key]) {
                    new_d.PieValues.push(
                        {
                            'key': w.key,
                            'value': d[w.key] * w.value / 100,
                            'total_value': d['Consumer Price Index'],
                            'date': d.Date,
                            'weight_idx': i
                        }
                    )
                // }
            });

            return new_d;
        });

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
                .on('mouseover', function(event, d){
                    d3.select(this)
                        .attr('stroke-width', '2px')
                        .attr('stroke', 'black')
                        .attr('fill', 'rgba(173,222,255,0.62)');

                    vis.tooltip
                        .style("opacity", 1)
                        .style("left", event.pageX + 20 + "px")
                        .style("top", event.pageY + "px")
                        .html(`<div class="tooltip-holder">
                 <strong>Category:</strong> ${d.data.key}<br>
                 <strong>Year:</strong> ${d.data.date.getFullYear()}<br>
                 <strong>Contribution to Total CPI:</strong> <span class="emphasis">${(d.data.value * 100 / d.data.total_value).toFixed(1)}%</span>
             </div>`);

                }).on('mouseout', function(event, d){
                d3.select(this)
                    .attr('stroke-width', '0px')
                    .attr('fill', (_d) => {
                        if (vis.weightState[_d.data.key])
                            return vis.colors[_d.data.weight_idx];
                        else
                            return vis.inactiveColor;
                    })
                    .attr('opacity', (_d) => {
                            if (vis.weightState[_d.data.key])
                                return 1;
                            else
                                return 0.25;
                        }
                    );

                vis.tooltip
                    .style("opacity", 0)
                    .style("left", 0)
                    .style("top", 0)
                    .html(``);
                })
                .transition()
                .duration(400)
                .attr('d', arc)
                .attr('fill', (_d) => {
                    if (vis.weightState[_d.data.key])
                        return vis.colors[_d.data.weight_idx];
                    else
                        return vis.inactiveColor;
                })
                .attr('opacity', (_d) => {
                    if (vis.weightState[_d.data.key])
                        return 1;
                    else
                        return 0.25;
                }
                );

            arcs.exit().remove();

        });

        // update the year texts
        vis.startYearText.text(vis.startYear);
        vis.endYearText.text(vis.endYear);

        vis.legendRects = vis.legend.selectAll('rect')
            .data(vis.filteredWeightsForDisplay);

        vis.legendRects.enter()
            .append('rect')
            .merge(vis.legendRects)
            .attr('class', 'legend-rect')
            .attr('width', 10)
            .attr('height', 10)
            .attr('x', 2)
            .attr('y', (d, i) => i * 15)
            .attr('fill', (d, i) => vis.colors[i])
            .on('click', (event, d) => {
                vis.weightState[d.key] = !vis.weightState[d.key];
                vis.wrangleData();
            });

        vis.legendRects.exit().remove();

        vis.legendText = vis.legend.selectAll('text')
            .data(vis.filteredWeightsForDisplay);

        vis.legendText.enter()
            .append('text')
            .merge(vis.legendText)
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
                vis.weightState[d.key] = !vis.weightState[d.key];
                vis.wrangleData();
            });

        vis.legendText.exit().remove();

        vis.legend.selectAll('rect')
            .attr('opacity', (d) => vis.weightState[d.key] ? 1 : 0.25);

        vis.legend.selectAll('text')
            .attr('opacity', (d) => vis.weightState[d.key] ? 1 : 0.25);

    }

    updateCountry(_country) {
        let vis = this;
        vis.country = _country;
        Object.keys(vis.weights[vis.country]).forEach( (w) => {
            if(vis.weights[vis.country][w] <= 5)
                vis.weightState[w] = false;
            else
                vis.weightState[w] = true;
        });
        vis.wrangleData();
    }

    updateYears(startYear, endYear) {
        let vis = this;

        vis.startYear = startYear;
        vis.endYear = endYear;

        vis.wrangleData();

    }


}
