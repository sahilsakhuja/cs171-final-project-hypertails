/****************
 *
 * Creator: Andrew Ting
 *
 */


class MapVis {

    constructor(parentElement, data) {
        this.parentElement = parentElement;
        this.data = data;
        this.displayData = data;
        this.initVis();
    }

    initVis() {
        let vis = this;
        vis.displayData = this.data[0]
        vis.margin = {top: 30, right: 30, bottom: 30, left: 0};

        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right,
            vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;

        // vis.width = 700
        // vis.height = 500
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");
        // console.log('yoyooyo')

        vis.path = d3.geoPath();
        vis.projection = d3.geoMercator()
            .scale(100)
            .center([0,20])
            .translate([vis.width / 2, vis.height / 2]);

        // Data and color scale
        
        vis.colorScale = d3.scaleThreshold()
            .domain([0, 5, 10, 15, 20, 25])
            .range(d3.schemeReds[6]);

        // Add tooltip
        vis.tooltip = d3.select("#mapvisual").append('div')
            .style("position", "absolute")
            .style("z-index", "10")


        // Draw the map
        vis.svg.append("g")
            .selectAll("path")
            .data(vis.displayData.features)
            .enter()
            .append("path")
            // draw each country
            .attr("d", d3.geoPath()
                .projection(vis.projection)
            )



	var svgLegend = d3.select("#" + vis.parentElement).append('svg')
    .style("position", "absolute")
    .style("z-index", "10")
    .attr("transform", "translate(-900," + vis.height + ")")

    
	var defs = vis.svg.append('defs');

	var linearGradient = defs.append('linearGradient')
		.attr('id', 'legend-gradient');


	linearGradient.selectAll("stop")
		.data([{offset: "0%", color: "#ffece4"},{offset: "100%", color: "#c04c4c"}])
		.enter().append("stop")
		.attr("offset", (d) => {return d.offset})
		.attr("stop-color", (d) => { return d.color});

	svgLegend.append("text")
		.attr("x", 0)
		.attr("y", 30)
		.text("Low");

    svgLegend.append("text")
		.attr("x", 170)
		.attr("y", 30)
		.text("High");

	svgLegend.append("rect")
		.attr("width", 200)
		.attr("height", 15)
        .style("position", "absolute")
        .style("z-index", "10")
		.style("fill", "url(#legend-gradient)");

        vis.wrangleData();
    }

    wrangleData() {
        let vis = this;

        csvRaw.forEach((row) => {
            const filteredByDate = Object.fromEntries(
                Object.entries(row).filter(([key, value]) => key > startRange && key < endRange)
            )

            if (Object.keys(filteredByDate).length) {
                let num = Object.values(filteredByDate).map(i=>Number(i)).slice(0,60)
                num = num.filter(val => val !== 0  )

                // num = num.filter (arr => arr.length !== 0)
                if (num.length) {
                    let average = num.reduce((a, b) => (a + b)) / num.length;
                    data.set(row['Country Code'], +average)
                } else {
                    data.set(row['Country Code'], "No Availabe Data")

                }

            } else {

                let num = Object.values(row).map(i=>Number(i)).slice(0,60)
                num = num.filter(val => val !== 0)
                let average = num.reduce((a, b) => (a + b)) / num.length;
                data.set(row['Country Code'], +average)

            }



        })


        this.updateVis()

    }



    updateVis() {

        let vis = this
        var mouseover = function(event,d) {

            d3.select(this)
                .transition()
                .duration(50)
                .style("stroke", "black")
                .style("opacity", 1)

                vis.tooltip
                .style("opacity", 1)
                .style("left", event.pageX + 5 + "px")
                .style("top", event.pageY + "px")
                .html(`
     <div style="border: thin solid grey; border-radius: 5px; background: lightgrey; padding: 8px">
         <h4 style="color: var(--candy-pink)">${d.properties.name}</h4>
         <h5 style="color: var(--candy-pink)">Average Percentage:${(d.total.toFixed(2))}%</h5>
     </div>`);
        }
        var mousemove = function() {

        }
        var mouseleave = function(d) {
            vis.tooltip
                .style("opacity", 1   )
            d3.select(this)
                .style("stroke", "none")
                .style("opacity", 0.8)
        }




        // set the color of each country
        vis.svg
            .selectAll("path")
            .attr("fill", function (d) {
                d.total = data.get(d.id) || 0;
                return vis.colorScale(d.total);
            })
            .style("stroke", "transparent")
            .attr("class", function(d){ return d.id } )
            .style("opacity", .8)
            .on("mouseover",  function(event,d){
                mouseover(event,d)
                d3.select(this)
                    .transition()
                    .duration(10)
                    .style("stroke", "black")
                    .style("opacity", 1)
                vis.tooltip.style("display", null);

            })
            .on("mousemove", mousemove)
            .on("mouseleave", function(d) {
                d3.select(this)
                    .transition()
                    .duration(10)
                    .style("stroke", "transparent")
                    .style("opacity", .8)

                vis.tooltip.style("display", "none");



            })
    }

}
