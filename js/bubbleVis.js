/****************
 *
 * Creator: Sahil Sakhuja
 *
 */

/*
 * bubbleVis - Object constructor function
 * @param _parentElement 	-- the HTML element in which to draw the visualization
 * @param _weights			-- the weights file
 * @param _country          -- the name of the country we are using right now
 */

class bubbleVis {
    constructor(_parentElement, _weights, _country) {
        this.parentElement = _parentElement;
        this.country = _country;

        this.weights = _weights[this.country];
        this.filteredWeightsForDisplay = [];
        Object.keys(this.weights).forEach((k) => {
            this.filteredWeightsForDisplay.push({
                'key': k,
                'value': this.weights[k]
            })
        });
        // sort the weights in alphabetic order
        this.filteredWeightsForDisplay = this.filteredWeightsForDisplay.sort((a, b) => a.key.localeCompare(b.key));

        this.colors = categoryColors;

        this.baseIncome = 65000;
        this.baseExpense = 63000;
        this.currentIncome = 0;
        this.currentSavings = 0;
        this.currentExpense = 0;
        this.baseCpi = 300;
        this.currentCpi = 0;
        this.currentInflation = 0;

        this.baseRadius = 10;

        let i = 0;
        this.cumulativeWeights = this.filteredWeightsForDisplay.map((w) => {
            i = i + (w.value * this.baseCpi / 100);
            return i;
        });

        console.log(this.cumulativeWeights);

        this.currencyFormat = d3.format("$,.2f");

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

        let topSliderHeight = 0;
        let topIncomeTextHeight = 50;
        let contentHeight = vis.height - topSliderHeight;

        // placeholder for a slider

        vis.income = vis.svg.append('g')
            .attr('transform', 'translate(' + vis.width/8 + ', '+ topSliderHeight +')');

        vis.collection = vis.svg.append('g')
            .attr('transform', 'translate('+ vis.width/2 +', '+ topSliderHeight +')');

        // making the income path
        // putting the income as text

        vis.incomeText = vis.income.append('text')
            .attr('class', 'bubbleVisIncomeText')
            .attr('x', 0)
            .attr('y', 0);

        vis.expenseText = vis.income.append('text')
            .attr('class', 'bubbleVisExpenseText')
            .attr('x', 0)
            .attr('y', 15);

        vis.savingsText = vis.income.append('text')
            .attr('class', 'bubbleVisSavingsText')
            .attr('x', 0)
            .attr('y', 30);

        // keep x-axis in the middle so that we can also have a negative path
        let x_axis_pt = contentHeight / 2;
        let income_width = vis.width / 4;

        vis.incomex = d3.scaleLinear()
            .range([0, income_width])
            .domain([0, 1]);

        vis.incomey = d3.scaleLinear()
            .range([x_axis_pt, topIncomeTextHeight]);

        // init pathGroup
        vis.pathGroup = vis.income
            .append('g')
            .attr('class', 'pathGroup');

        vis.pathIncome = vis.pathGroup
            .append('path')
            .attr("class", "pathIncome");

        vis.pathSavings = vis.pathGroup
            .append('path')
            .attr("class", "pathSavings");

        vis.area = d3.area()
            .curve(d3.curveBasis)
            .x(function(d) {
                return vis.incomex(d.x)
            })
            .y0(vis.incomey(0))
            .y1(function(d) {
                return vis.incomey(d.y)
            });

        // making the expenses bubble chart
        // vis.colorScale = d3.scaleOrdinal()
        //     .range(vis.colors)
        //     .domain(vis.cumulativeWeights);
        //
        // vis.categoryScale = d3.scaleOrdinal()
        //     .range(vis.filteredWeightsForDisplay.map(((w) => w.key)))
        //     .domain(vis.cumulativeWeights);

        vis.categoryScale = d3.scaleThreshold()
            .range(d3.range(vis.filteredWeightsForDisplay.length))
            .domain(vis.cumulativeWeights);

        // try to keep the same weights together
        vis.y = d3.scaleOrdinal()
            .range(d3.range(vis.cumulativeWeights.length).map((i) => contentHeight/2 + (i - 5)*35))
            .domain(vis.cumulativeWeights);

        // draw the legend
        vis.legend = vis.collection.append('g')
            .attr('class', 'legend-group')
            .attr("transform", "translate(0, 0)")
            .attr('opacity', 0);

        vis.legendRects = vis.legend.selectAll('rect')
            .data(vis.filteredWeightsForDisplay)
            .enter()
            .append('rect')
            .attr('class', 'legend-rect')
            .attr('width', 10)
            .attr('height', 10)
            .attr('x', 2)
            .attr('y', (d, i) => i * 15)
            .attr('fill', (d, i) => vis.colors[i]);

        vis.tooltip = d3.select('body').append('div')
            .attr('class', "tooltip")
            .attr('id', 'pieTooltip')

        vis.updateAreaVis();
        vis.updateBubbleVis();
    }

    updateAreaVis() {
        let vis = this;
        vis.incomey.domain([0, vis.baseIncome]);

        let current_x = 0;
        let pathIncomeData = d3.range(10).map((i) => {
            let val = {
                x: current_x,
                y: vis.currentIncome + d3.randomUniform(-1000, 1000)()
            };
            current_x += 0.1;
            return val;
        });

        current_x = 0;
        let pathSavingsData = d3.range(10).map((i) => {
            let val = {
                x: current_x,
                y: vis.currentSavings + d3.randomUniform(-1000, 1000)()
            };
            current_x += 0.1;
            return val;
        });

        vis.pathIncome.datum(pathIncomeData)
            .attr("d", vis.area)
            .attr('fill', 'grey');

        vis.pathSavings.datum(pathSavingsData)
            .attr("d", vis.area)
            .attr('fill', (d) => {
                return (d3.min(d, d.y).y > 0) ? 'green' : 'red'
            });

    }

    updateBubbleVis() {
        let vis = this;

        vis.nodes = d3.range(vis.currentCpi).map(
            (i) => ({
                x: vis.width/4,
                y: vis.height/2,
                i: i,
                r: d3.randomUniform(-1, 1)() + vis.baseRadius
            }));

        vis.sim = d3.forceSimulation(vis.nodes)
            .force("x", d3.forceX(vis.width / 4).strength(0.01))
            .force("y", d3.forceY().y((d) => vis.y(d.i/10)).strength(0.05))
            .force("collide", d3.forceCollide(vis.baseRadius*1.25));

        vis.nodeCircles = vis.collection.selectAll('circle')
            .data(vis.nodes)
            .enter()
            .append('circle')
            .attr('r', (d) => d.r )
            .attr('fill', (d) => vis.colors[vis.categoryScale(d.i)])
            .attr('cx', (d) => d.x)
            .attr('cy', (d) => d.y);

        vis.nodeCircles.on('mouseover', function(event, d) {

            let category = vis.filteredWeightsForDisplay[vis.categoryScale(d.i)].key;

            let tooltip_text = '';
            vis.filteredWeightsForDisplay.forEach((w) => {
                if (w.key === category)
                    tooltip_text += `<span class="emphasis"><strong>${w.key}:</strong> ${vis.currencyFormat(w.value * vis.currentExpense / 100)}</span><br>`
                else
                    tooltip_text += `<strong>${w.key}:</strong> ${vis.currencyFormat(w.value * vis.currentExpense / 100)}<br>`
            })

            vis.tooltip
                .style("opacity", 1)
                .style("left", event.pageX + 20 + "px")
                .style("top", event.pageY + "px")
                .html(`<div class="tooltip-holder">${tooltip_text}</div>`);
        }).on('mouseout', function(event, d){
            vis.tooltip
                .style("opacity", 0)
                .style("left", 0)
                .style("top", 0)
                .html(``);
        })


        vis.sim.on('tick', () => {
            vis.nodeCircles
                .attr('cx', d => d.x)
                .attr('cy', d => d.y)
        });

        vis.legendText = vis.legend.selectAll('text')
            .data(vis.filteredWeightsForDisplay);

        vis.legendText.enter()
            .append('text')
            .attr('class', 'legend-text')
            .merge(vis.legendText)
            .attr('x', 15)
            .attr('y', (d, i) => i * 15 + 10)
            .text((d) => {
                if (d.key.length > 30)
                    return d.key.substr(0, 30) + '... : ' + vis.currencyFormat(d.value * vis.currentExpense / 100);
                else
                    return d.key + ' : ' + vis.currencyFormat(d.value * vis.currentExpense / 100);
            });



    }

    updateCpi(cpi) {
        let vis = this;
        vis.currentCpi = cpi;
        vis.nodeCircles.remove();

        vis.updateBubbleVis();
    }

    calibrateSavings() {
        let vis = this;
        vis.currentSavings = vis.currentIncome - vis.currentExpense;
        // update all the texts
        vis.incomeText.text("Income: " + vis.currencyFormat(vis.currentIncome));
        vis.expenseText.text(' Expense: ' + vis.currencyFormat(vis.currentExpense));
        vis.savingsText.text('Savings: ' + vis.currencyFormat(vis.currentSavings));
    }

    animateSavings() {
        let vis = this;

        if (vis.currentIncome < vis.baseIncome) {
            setTimeout( function() {
                vis.currentIncome += 1000;
                vis.calibrateSavings();
                vis.updateAreaVis();
                vis.animateSavings();
            }, 5 )
        } else {
            setTimeout(function() {
                vis.animateExpense();
            }, 500);
        }

    }

    animateExpense() {
        let vis = this;

        if (vis.currentExpense < vis.baseExpense) {
            setTimeout( function() {
                vis.currentExpense += Math.min(1000, (vis.baseExpense - vis.currentExpense));
                vis.calibrateSavings();
                vis.updateAreaVis();
                vis.animateExpense();
            }, 5 )
        } else {
            vis.legend.attr('opacity', 1)
            setTimeout(vis.updateCpi(vis.baseCpi), 50);
        }
    }

    changeInflation(value) {
        let vis = this;

        vis.currentInflation = value;
        vis.currentExpense = vis.baseExpense * (1 + value/100);
        vis.currentCpi = vis.baseCpi * (1 + value/100);

        vis.calibrateSavings();
        vis.updateAreaVis();
        vis.updateCpi(vis.currentCpi);

    }

    changeBaseIncomeExpense(income, expense) {
        let vis = this;

        vis.baseIncome = income;
        vis.baseExpense = expense;

        vis.currentIncome = vis.baseIncome;
        vis.currentExpense = vis.baseExpense * (1 + vis.currentInflation/100);
        vis.calibrateSavings();
        vis.updateAreaVis();
        vis.updateCpi(vis.currentCpi);

    }

}