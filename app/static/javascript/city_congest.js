var cityCongestionPlot = () => {

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
                .text('Selected Hour: ' + val);
            // func(gSimple, val);
        });

    var gSimple = d3
        .select('#city-congestion-plot')
        .append('svg')
        .attr('width', 900)
        .attr('height', 600)
        .append('g')
        .attr('transform', 'translate(30,30)');

    gSimple.call(sliderSimple);

    gSimple.append('text')
        .attr('id', 'value-simple')
        .attr('x', 320)
        .attr('y', 5)
        .style('opacity', '0.6');

    d3.select('#value-simple')
        .text('Selected Hour: ' + sliderSimple.value());

    let cities = [
        'Atlanta', 
        'Chicago', 
        'Ciudad de México',
        'Los Angeles',
        'New York',
        'Seattle',
        'Washington'
    ]

    let dropSelection = d3.select('#city-congestion-plot')
        .append('label')
        .style('margin', '1em 0 0 1em')
        .attr('for', 'city-select')
        .html('Choose a city: ')

    dropSelection
        .append('select')
        .selectAll('option')
        .data(cities)
        .enter()
        .append('option')
        .text((d) => d)
        .attr('value', (d) => d);

    creatBarChart(gSimple, 8);

    $('#main-title').text('Percentage of City Congestion Compared With Baseline Before Covid-19');
    $('#sub-title').text('Select Hour and City to View The Percentage');
}

function creatBarChart(svg, hour) {
    // get data
    let url = `city/${hour}`;
    d3.json(url)
        .then( (data) => {

            paddingX = 20;
            xScale = d3.scaleLinear()
                .range([paddingX - 30, 900 - paddingX])
                .domain([
                    d3.min(data, (d) => new Date(d.date)), 
                    d3.max(data, (d) => new Date(d.date))
                ]);
            
            yScale = d3.scaleLinear()
                .range([550, 100])
                .domain([
                    d3.min(data, (d) => d.percent_congestion),
                    d3.max(data, (d) => d.percent_congestion)
                ]);

            svg.selectAll('rect')
                .data(data)
                .enter()
                .append('rect')
                .attr('x', (d, i) => 860/data.length * i)
                .attr('y', (d) => yScale(d.percent_congestion))
                .attr('height', (d) => 550 - yScale(d.percent_congestion))
                .attr('width', 860/data.length)
        })
        .catch((error) => console.log(error)); 
}

function updateLineChart(svg, data) {
    svg.selectAll('rect')
        .attr('height', data);
}

$('#city').click(
    (e) => {
        e.preventDefault();
        $(".plots").html("");
        d3.select('.plots')
            .append('div')
            .attr('id', 'city-congestion-plot')
            .style('grid-column', '2 / 3')
            .style('display', 'flex')
            .style('flex-direction', 'column-reverse')
        $.ajax({
            url: "/mobility/city", 
            success: () => {
                cityCongestionPlot();
            }
        });
    }
);