var cityCongestionPlot = () => {

    // d3.select('.plots')
    //     .append('div')
    //     .attr('id', 'value-simple');

    // d3.select('.plots')
    //     .append('div')
    //     .attr('id', 'slider-simple');

    $('.plots').append('<div id=value-simple></div>');
    $('.plots').append('<div id=slider-simple></div>');

    let data = Array.from(Array(24).keys());

    var sliderSimple = d3
        .sliderBottom()
        .min(d3.min(data))
        .max(d3.max(data))
        .width(300)
        .ticks(24)
        .step(1)
        .default(0)
        .on('onchange', val => {
        d3.select('#value-simple')
            .text('Select Hour: ' + val);
        });

    var gSimple = d3
        .select('#slider-simple')
        .append('svg')
        .attr('width', 500)
        .attr('height', 100)
        .append('g')
        .attr('transform', 'translate(30,30)');

    gSimple.call(sliderSimple);

    d3.select('#value-simple')
        .text('Select Hour: ' + sliderSimple.value());

}

$('#city').click(
    (e) => {
        e.preventDefault();
        $(".plots").html("");
        $.ajax({
            url: "/mobility/city", 
            success: cityCongestionPlot
        });
    }
);