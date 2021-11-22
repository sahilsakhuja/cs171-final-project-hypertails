/****************
 *
 * Creator: Andrew Ting
 *
 */


class LineChart {

    constructor(parentElement, data, ) {
        this.parentElement = parentElement;
        this.data = data;
        this.initVis();
    }

    initVis() {
        let vis = this;



        vis.margin = {top: 30, right: 30, bottom: 30, left: 0}
        vis.width = 860;
        vis.height = 400;


        vis.svg = d3.select("#" + vis.parentElement)
            .append("svg")
            .attr("width", vis.width)
            .attr("height", vis.height)

        vis.legendkey = d3.select("#commodityLegend")
            .append("svg")
            .attr("width", 200)
            .attr("height", 300);


        let yValues = vis.data.categories.map((category) => category.values)

        vis.x = d3.scaleTime()
            .domain(d3.extent(vis.data.allDates))
            .range([vis.margin.left, vis.width - vis.margin.right]);

        vis.y = d3.scaleLinear()
            .domain(d3.extent(yValues.flat()))
            .range([vis.height - vis.margin.bottom, vis.margin.top])


        vis.svg.append("g")
            .attr("transform", `translate(0,${vis.height - vis.margin.bottom})`)
            .call(d3.axisBottom(vis.x))

        // Y axis
        vis.gYAxis = vis.svg
            .append("g")
            .attr("transform", `translate(${vis.margin.left},0)`)
            .call(d3.axisLeft(vis.y))

        vis.gYAxis
            .append("text")
            .attr("x", 0)
            .attr("y", 10)
            .attr("fill", "black")
            .attr("text-anchor", "start")
            .text("Consumer Price Index");

        vis.legend = vis.legendkey.append('g')
            .attr('font-family', 'sans-serif');

        vis.cell = vis.legend.selectAll('g')
            .data(vis.data.categories)
            .join('g');

        vis.color = d3.scaleOrdinal(d3.schemePaired)

        vis.cell.append('rect')
            .attr('fill', (d) => { return vis.color(d)})
            .attr('y', (d,i)=> {return 30*i})
            .attr('width', 15)
            .attr('height', 15)

        vis.cell.append('text')
            .attr('x', ()=> {return 20})
            .attr('y', (d,i)=> {return 30*i +10})
            .attr("class", function(d){ return d.categoryName })
            .style("pointer-events", 'auto')
            .text(d => d.category)
            .on("click", function(event,d){
                let currentOpacity = d3.selectAll("." + d.categoryName).style("opacity")
                d3.selectAll("." + d.categoryName).transition().style("opacity", currentOpacity == 1 ? 0.1:1)
            })




        vis.wrangleData();
    }

    wrangleData() {
        let vis = this;


        vis.cell.on("click", (d,i) => {

            let allSelectedCategory = []
            vis.data.categories.forEach((x) => {
                allSelectedCategory.push(x.category)
            })

            console.log(allSelectedCategory)
            if (allSelectedCategory.includes(i.category)) {
                let updatedData = vis.data.categories.filter((y) =>y.category !== i.category)
                vis.data.categories = updatedData
            } else {
                vis.data.categories.push(i)
            }

        })

        vis.tooltip = d3.select(".linechart ").append('div')
            .attr('class', 'linechart-tooltip')
            .style("z-index", "10")

        vis.updateVis();

    }



    updateVis() {
        var vis = this;


        vis.path = vis.svg
            .append("g")
            .attr("fill", "none")
            .attr("stroke-width", 1.5)
            .selectAll("path")
            .data(vis.data.categories)
            .join("path")
            .attr("class", (d) => { return d.categoryName })
            .attr("stroke", (d) => { return vis.color(d) })
            .attr("d", (d) => {
                return d3.line()
                    .x((d, i) => {return vis.x(vis.data.allDates[i])})
                    .y((d) => {return vis.y(d)})
                    (d.values)
            })

        vis.cell.on("mouseover", (p,r) => {
                vis.path.attr("stroke", (d,i) => {
                    return d.category === r.category ? vis.color(d) : "#ddd"
                })
                vis.cell.style("cursor", "pointer")

            }
        )
        vis.cell.on("mouseout", () => {
            vis.path.attr("stroke", (d,i) => { return vis.color(d) })
        });




        vis.dot = vis.svg.append("g").attr("display", "none");

        vis.dot.append("circle").attr("r", 2.5);

        vis.dot.append("text").attr("text-anchor", "middle");


        vis.svg.on("mouseenter", () => {
            vis.path.style("mix-blend-mode", null).attr("stroke", "#ddd")
            vis.dot.attr("display", null)
            vis.tooltip.style("display", null);


        })
            .on("mouseleave", () => {
                vis.path.style("mix-blend-mode", "multiply").attr("stroke", 'null');
                vis.path.attr("stroke", (d,i) => { return vis.color(d) })
                vis.dot.attr("display", "none");
                vis.tooltip.style("display", "none");

            });



        vis.svg.on("mousemove", moved)

        function moved(event) {
            let parseDate = d3.utcFormat("%b %Y")
            const pointerX = d3.pointer(event)[0]
            const pointerY = d3.pointer(event)[1]


            const xDate = vis.x.invert(pointerX);
            const yValue = vis.y.invert(pointerY);
            const i = d3.bisectCenter(vis.data.allDates, xDate);


            const cursorDate = vis.data.allDates[i];

            const cursorPriceIndex =  vis.data.categories.map((d) => d.values[i]);
            const closestCategoryLine = cursorPriceIndex.map((d) => Math.abs(d - yValue))
            const categoryLineIndex = d3.leastIndex(closestCategoryLine);

            const lineCategory = vis.data.categories[categoryLineIndex].category;
            const lineValue = vis.data.categories[categoryLineIndex].values[i];


            vis.path
                .attr("stroke", (d) => d.category === lineCategory ? vis.color(d) : "#ddd")
                .attr("stroke-opacity", 1)
                .filter((d) => d.category === lineCategory)
                .raise();



            vis.dot.attr("transform", `translate(${vis.x(cursorDate)},${vis.y(lineValue)})`)




            vis.tooltip.html(`${parseDate(cursorDate)}` + "<br/>"  + `${lineCategory}`+ "<br/>" + `${lineValue}` )
            // .style("left", (vis.x(cursorDate)) + "px")
            // .style("top", (vis.y(lineValue) ) + "px")

        }


    }

}

