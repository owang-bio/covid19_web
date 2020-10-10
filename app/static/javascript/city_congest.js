var cityCongestionPlot = (func) => {

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
            func(gSimple, val);
        });

    var gSimple = d3
        .select('.plots')
        .append('svg')
        .attr('width', 900)
        .attr('height', 600)
        .append('g')
        .attr('transform', 'translate(30,30)');

    gSimple.call(sliderSimple);

    gSimple.append('text')
        .attr('id', 'value-simple')
        .attr('x', 0)
        .attr('y', 60)
        .style('opacity', '0.6');

    d3.select('#value-simple')
        .text('Select Hour: ' + sliderSimple.value());

    gSimple
        .append('rect')
        .attr('x', 20)
        .attr('y', 70)
        .attr('width', 20)
        .attr('height', 0);

    $('#main-title').text('Percentage of City Congestion Compared With Baseline Before Covid-19');
    $('#sub-title').text('Select Hour to View The Percentage for Different Hours');
}

function updateLines(svg, data) {
    svg.selectAll('rect')
        .attr('height', data);
}

function creatLineChart(hour) {
    // get data
    let url = `mobility/city/${hour}`;
    d3.json(url)
        .then(drawLines(data))
        .catch((error) => console.log(error)); 
}


$('#city').click(
    (e) => {
        e.preventDefault();
        $(".plots").html("");
        $.ajax({
            url: "/mobility/city", 
            success: () => {
                cityCongestionPlot(updateLines);
            }
        });
    }
);