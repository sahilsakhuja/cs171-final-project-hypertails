
$('#fullpage').fullpage({
    sectionsColor: ['#FFFFFF', '#FFFFFF', '#FFFFFF', '#FFFFFF', '#FFFFFF','#FFFFFF','#FFFFFF'],
    sectionSelector: '.vertical-scrolling',
    slideSelector: '.horizontal-scrolling',
    navigation: true,
    slidesNavigation: true,
    controlArrows: false,
    anchors: ['firstSection', 'secondSection', 'thirdSection', 'fourthSection', 'fifthSection','sixthSection', 'seventhSection'],
    afterLoad: function( section, origin, destination, direction){
        if ((section === 'secondSection') && !animatedBarChartRun) {
            setTimeout(function() {
                animatedBarChartVis.animateBarChart();
                animatedBarChartRun = true;
            }, 500);
        } else if ((section === 'sixthSection') && !bubbleChartVisRun) {
            setTimeout(function() {
                categoryBubbleVis.animateSavings();
                bubbleChartVisRun = true;
            }, 100);
        }
    },
    menu: '#menu'
});