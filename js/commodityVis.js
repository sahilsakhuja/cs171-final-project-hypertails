d3.csv("data/IMF_CPI_US - updated.csv")
    .then((csv) => {

        const margin = {top: 30,right: 30,bottom: 30,left: 30};
        const width = 1080;
        const height = 330;

        const categories = csv.map((row) => {
            const category = row[csv.columns[0]];
            const values = csv.columns.slice(1).map((dateColumn) => parseFloat(row[dateColumn]));
            return {category, values}
        });

        const parseDate = d3.timeParse("%YM%m");
        const allDates = csv.columns.slice(1).map((dateColumn) => parseDate(dateColumn))

        const data = {
            categories,
            allDates,
        };

        let dateValues = data.categories.map((category) => category.values)

        let x = d3.scaleTime()
            .domain(d3.extent(data.allDates))
            .range([30, 700]);

        let y = d3.scaleLinear()
            .domain(d3.extent(dateValues.flat()))
            .range([height -30, 25])

        let svg = d3.select("#commodityinflation")
            .append("svg")
            .attr("width", width)
            .attr("height", height);

        svg.append("g")
            .attr("transform", `translate(0,${height - 30})`)
            .call(d3.axisBottom(x))

        let yAxis = svg
            .append("g")
            .attr("transform", `translate(${margin.left},0)`)
            .call(d3.axisLeft(y))

        yAxis
            .append("text")
            .attr("x", 90)
            .attr("y", 10)
            .attr("fill", "black")
            .text("Consumer Price Index");

        const color = d3.scaleOrdinal()
            .range(['#06d6a0','#213f65','#56b7e6','#90e0ef','#ef476f','#ed1c24','#623412','#939597', '#ffd6ba', '#bcb8b1', '#ffcbf2', '#ff0073'])

        svg
            .append("g")
            .attr("fill", "none")
            .attr("stroke-width", 1.7)
            .selectAll("path")
            .data(data.categories)
            .join("path")
            .attr("stroke", (d,i) => { return color(d.category[i]) })
            .attr("d", (d) => {
                return d3.line()
                    .x((d, i) => {return x(data.allDates[i])})
                    .y((d) => {return y(d)})
                    (d.values)
            })


        const key = svg.append('g')
            .selectAll('g')
            .data(data.categories)
            .join('g')

        key.append('rect')
            .attr('fill', (d,i)=>{ return color(d.category[i]) })
            .attr('width', 18)
            .attr('height', 18)
            .attr("x",745)
            .attr("y", (d, i) => {
                return  (i * 25);
            })

        key.append('text')
            .attr('dominant-baseline', 'middle')
            .attr('x',  775)
            .attr("y", (d, i) => {
                return 10 + (i * 25);
            })
            .style("font-size", "13px")
            .text(d => d.category);
    });