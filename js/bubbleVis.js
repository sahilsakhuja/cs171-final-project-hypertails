/****************
 *
 * Creator: Sahil Sakhuja
 * Originally designed as the bubble chart (hence the name)
 * Now, in revised format - this class draws the bar chart for income / expenses and the legend display to show the categories
 *
 */

/*
 * bubbleVis - Object constructor function
 * @param _parentElement 	-- the HTML element in which to draw the visualization
 * @param _legendElement 	-- the HTML element in which to draw the information and legend
 * @param _weights			-- the weights file
 * @param _country          -- the name of the country we are using right now
 */

class bubbleVis {
    constructor(_pathElement, _legendElement, _weights, _country) {
        this.pathElement = _pathElement;
        this.legendElement = _legendElement;
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

        // console.log(this.cumulativeWeights);

        this.currencyFormat = d3.format("$,.2f");

        this.initVis();
    }

    initVis() {

        let vis = this;

        vis.margin = { top: 10, right: 10, bottom: 10, left: 10 };

        vis.width = document.getElementById(vis.pathElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.pathElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;

        // SVG drawing area
        vis.svg = d3.select("#" + vis.pathElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");


        vis.legendWidth = document.getElementById(vis.legendElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.legendHeight = document.getElementById(vis.legendElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;

        // SVG drawing area
        vis.legendSvg = d3.select("#" + vis.legendElement).append("svg")
            .attr("width", vis.legendWidth + vis.margin.left + vis.margin.right)
            .attr("height", vis.legendHeight + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");


        let topSliderHeight = 20;
        let topIncomeTextHeight = 50;
        let contentHeight = vis.height - topSliderHeight;

        // placeholder for a slider

        vis.income = vis.legendSvg.append('g')
            // .attr('transform', 'translate(' + vis.width/8 + ', '+ topSliderHeight +')');
            .attr('transform', 'translate(0, '+ topSliderHeight +')');

        vis.collection = vis.legendSvg.append('g')
            // .attr('transform', 'translate('+ vis.width/2 +', '+ topSliderHeight +')');
            .attr('transform', 'translate(0, ' + (topSliderHeight + topIncomeTextHeight) + ')');

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
        let income_width = vis.width / 2;

        vis.incomex = d3.scaleLinear()
            .range([0, income_width])
            .domain([0, 1]);

        vis.incomey = d3.scaleLinear()
            .range([x_axis_pt, topIncomeTextHeight]);

        // init pathGroup
        vis.pathGroup = vis.svg
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
            .attr("transform", "translate(0, 20)")
            .attr('opacity', 0);

        // add a title to the legend
        vis.legend.append('text')
            .attr('class', 'legend-title')
            .text('Category-wise expected expenses')
            .attr('x', 2)
            .attr('y', 0);

        vis.legendRects = vis.legend.selectAll('rect')
            .data(vis.filteredWeightsForDisplay)
            .enter()
            .append('rect')
            .attr('class', 'legend-rect')
            .attr('width', 10)
            .attr('height', 10)
            .attr('x', 2)
            .attr('y', (d, i) => (i+1) * 15) // i+1 => to leave space for the title
            .attr('fill', (d, i) => vis.colors[i]);

        // vis.tooltip = d3.select('body').append('div')
        //     .attr('class', "tooltip")
        //     .attr('id', 'pieTooltip')

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

        vis.legendText = vis.legend.selectAll('.legend-text-inactive')
            .data(vis.filteredWeightsForDisplay);

        vis.legendText.enter()
            .append('text')
            .attr('class', 'legend-text-inactive')
            .merge(vis.legendText)
            .attr('x', 15)
            .attr('y', (d, i) => (i+1) * 15 + 10) // i+1 => to leave space for the title
            .text((d) => {
                // if (d.key.length > 30)
                //     return d.key.substr(0, 30) + '... : ' + vis.currencyFormat(d.value * vis.currentExpense / 100);
                // else
                    return d.key + ' : ' + vis.currencyFormat(d.value * vis.currentExpense / 100);
            });



    }

    updateCpi(cpi) {
        let vis = this;
        vis.currentCpi = cpi;
        // vis.nodeCircles.remove();

        vis.updateBubbleVis();
    }

    calibrateSavings() {
        let vis = this;
        vis.currentSavings = vis.currentIncome - vis.currentExpense;
        // update all the texts
        vis.incomeText.text("Income: " + vis.currencyFormat(vis.currentIncome));
        vis.expenseText.text('Expected Expenses: ' + vis.currencyFormat(vis.currentExpense));
        vis.savingsText.text('Expected Savings: ' + vis.currencyFormat(vis.currentSavings));
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