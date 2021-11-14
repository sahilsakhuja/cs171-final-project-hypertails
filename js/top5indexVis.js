class topIndexVis {

    constructor(parentElement, countryindex) {
        this.parentElement = parentElement;
        this.countryindex = countryindex;

        this.initVis()
    }

    initVis(){

        let vis = this;

        vis.margin = {top: 20, right: 20, bottom: 20, left: 40};
        //vis.width = 500;
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width+200 - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;


        // init drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append('g')
            .attr('transform', `translate (${vis.margin.left}, ${vis.margin.top})`);


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



        this.wrangleData();

    }

    wrangleData(){
        let vis = this;

        let filteredIndexData = [];

        let parseTime = d3.timeParse("%m/%d/%Y");

        /*for (let item of vis.countryindex) {
            let year = parseTime(item["Year"]);
            let country = item['Country'];
            let cpi_all = parseFloat(parseFloat(item['Consumer Price Index, All items']).toFixed(2));
            let food_beverages = parseFloat(parseFloat(item['Food and non-alcoholic beverages']).toFixed(2));
            let alcohol_tobacco = parseFloat(parseFloat(item['Alcoholic Beverages, Tobacco, and Narcotics']).toFixed(2));
            let clothing_footwear = parseFloat(parseFloat(item['Clothing and footwear']).toFixed(2));
            let housing_electric_gas = parseFloat(parseFloat(item['Housing, Water, Electricity, Gas and Other Fuels']).toFixed(2));
            let household_equipment = parseFloat(parseFloat(item['Furnishings, household equipment and routine household maintenance']).toFixed(2));
            let health = parseFloat(parseFloat(item['Health']).toFixed(2));
            let communication = parseFloat(parseFloat(item['Communication']).toFixed(2));
            let transport = parseFloat(parseFloat(item['Transport']).toFixed(2));
            let recreation = parseFloat(parseFloat(item['Recreation and culture']).toFixed(2));
            let education = parseFloat(parseFloat(item['Education']).toFixed(2));
            let restaurant = parseFloat(parseFloat(item['Restaurants and hotels']).toFixed(2));
            let misc = parseFloat(parseFloat(item['Miscellaneous goods and services']).toFixed(2));



            let newItem = {
                "year": year,
                "country": country,
                "cpi_all": cpi_all,
                "food_beverages": food_beverages,
                "alcohol_tobacco": alcohol_tobacco,
                "clothing_footwear": clothing_footwear,
                "housing_electric_gas": housing_electric_gas,
                "household_equipment": household_equipment,
                "health": health,
                "communication": communication,
                "transport": transport,
                "recreation": recreation,
                "education": education,
                "restaurant": restaurant,
                "misc": misc


            }
            filteredIndexData.push(newItem)
        };*/
        //console.log(filteredIndexData)

       // vis.filteredIndex = filteredIndexData;



        vis.updateVis()

    }

    updateVis(){


        //let selectedCategoryEl = document.getElementById("categorySelector");
        //let selectedCategory = selectedCategoryEl.value;

        let vis = this;


        // (1) Update domain
        /*vis.x.domain(d3.extent(vis.filteredIndex.map(function (d){
            return d.year;
        })))

        vis.y.domain(d3.extent(vis.filteredIndex.map(function (d) {
            return d[selectedCategory];
        })));*/




        /*let xData = vis.filteredIndex.map(function (d) {
            return d.year;
        });

        let yData = vis.filteredIndex.map(function (d) {
            return d[selectedCategory];
        });


        vis.top5line = vis.svg.append("path")
            .datum(vis.filteredIndex);

        vis.top5line.enter()
            .append()
            .merge(vis.top5line)
            .attr("fill", "none")
            .attr("stroke", "salmon")
            .attr("stroke-width", 1.5)
            .transition().duration(3000).delay(500)
            .attr("d", d3.line()
                .x(function(d) { return vis.x(d.year)})
                .y(function(d) { return vis.y(d[selectedCategory]) }))




        vis.top5line.exit().remove();*/

        // Update y-axis
        vis.svg.select(".y-axis")
            .transition()
            .duration(2000)
            .call(vis.yAxis);

        // Update x-axis
        vis.svg.select(".x-axis").call(vis.xAxis);


    }

}