
// fullpage customization
$('#fullpage').fullpage({
    // sectionsColor: ['#43aa8b', '#277da1', '#F2AE72', '#ff8fa3', '#4d908e','#f3722c','#f9c74f','#43aa8b','#577590', '#ff8fa3'],
    sectionsColor: ['#FFFFFF', '#FFF799', '#96F2EE', '#FFFFFF', '#4d908e','#FFFFFF','#f9c74f','#43aa8b','#577590', '#ff8fa3'],
    sectionSelector: '.vertical-scrolling',
    slideSelector: '.horizontal-scrolling',
    navigation: true,
    slidesNavigation: true,
    controlArrows: false,
    anchors: ['firstSection', 'secondSection', 'thirdSection', 'fourthSection', 'fifthSection','sixthSection'],
    afterLoad: function( section, origin, destination, direction){
        if ((section === 'secondSection') && !animatedBarChartRun) {
            setTimeout(function() {
                animatedBarChartVis.animateBarChart();
                animatedBarChartRun = true;
            }, 2000);
        } else if ((section === 'sixthSection') && !bubbleChartVisRun) {
            setTimeout(function() {
                categoryBubbleVis.animateSavings();
                bubbleChartVisRun = true;
            }, 1000);
        }

        // //first slide of the second section
        // if(section.anchor == 'secondPage' && destination.index == 1){
        //     alert("First slide loaded");
        // }
        //
        // //second slide of the second section (supposing #secondSlide is the
        // //anchor for the second slide)
        // if(section.index == 1 && destination.anchor == 'secondSlide'){
        //     alert("Second slide loaded");
        // }
    },
    menu: '#menu'
});