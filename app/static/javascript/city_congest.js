var cityCongestionPlot = (func) => {
    // append tooltip
    var tooltipBar = d3.select('#city-congestion-plot').append('div')
        .attr('class', 'tooltip')
        .style("position", "absolute")
        .style("visibility", "hidden")
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "1px")
        .style("border-radius", "6px")
        .style("padding", "3px")
        .style("font-size", "small")
        ;

    // draw range selector
    let data = Array.from(Array(24).keys());

    var sliderSimple = d3
        .sliderBottom()
        .min(d3.min(data))
        .max(d3.max(data))
        .width(300)
        .ticks(24)
        .step(1)
        .default(0)
        .on('onchange', (val) => {
            d3.select('#value-simple')
            .text('Selected Hour: ' + val);

            let city = $('#selected-city').val();
            let url = `city/${val}/${city}`;
            d3.json(url)
                .then( (data) => {
                    func(gSimple, data);
                });
        })
        ;

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

    // append drop down selection
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
        .attr('id', 'selected-city')
        .selectAll('option')
        .data(cities)
        .enter()
        .append('option')
        .text((d) => d)
        .attr('value', (d) => d);

    dropSelection.on('change', (val) => {
        let city = $('#selected-city').val();
        let hour = sliderSimple.value();
        console.log(city + hour);
    });

    // create initial plot
    let city = $('#selected-city').val();
    creatBarChart(gSimple, 0, city, tooltipBar);

    // change plot tilte
    $('#main-title').text('Percentage of City Congestion Compared With Baseline Before Covid-19');
    $('#sub-title').text('Select Hour and City to View The Percentage');
}

function creatBarChart(svg, hour, city, tooltipBar) {

    let url = `city/${hour}/${city}`;

    d3.json(url)
        .then( (data) => {

            let paddingX = 30;
            let xScale = d3.scaleLinear()
                .range([paddingX - 30, 900 - paddingX])
                .domain([
                    d3.min(data, (d) => new Date(d.date)), 
                    d3.max(data, (d) => new Date(d.date))
                ]);
            
            let yScale = d3.scaleLinear()
                .range([500, 100])
                .domain([
                    d3.min(data, (d) => d.percent_congestion),
                    d3.max(data, (d) => d.percent_congestion)
                ]);

            svg.selectAll('rect')
                .data(data)
                .enter()
                .append('rect')
                .attr('class', 'city-bar')
                .attr('x', (d, i) => 860/data.length * i)
                .attr('y', (d) => yScale(d.percent_congestion))
                .attr('height', (d) => 500 - yScale(d.percent_congestion))
                .attr('width', 860/data.length)
                .attr('fill', '#066094')
                .on("mouseover", function() {
                    tooltipBar.style("visibility", "visible");
                })
                .on("mousemove", function (event, d) {
                    // d = new Date(parseInt(e.date));
                    return tooltipBar.html(
                        "<p>Date: " + d.date + "</p>"
                        + "<p>Percentage of baseline: " 
                        + Math.round(d.percent_congestion*10000)/100 + "%</p>"
                        + `<p>Hour: ${d.hour}:00`)
                        .style("top", (event.pageY - 150) +"px")
                        .style("left", (event.pageX) +"px")
                        ;
                })
                .on("mouseout", function() {
                    return tooltipBar.style("visibility", "hidden");
                })
                ;

            let xAxis = d3.axisBottom(xScale)
                .ticks(5)
                .tickFormat(d3.timeFormat("%Y/%m/%d"))
                ;

            svg.append('g')
                .attr('class', 'axis')
                .attr(
                    'transform',
                    `translate(${paddingX - 30}, 500)`
                )
                .call(xAxis)

            let yAxis = d3.axisLeft(yScale)
                .ticks(5)
                .tickFormat(d3.format('.0%'))
                ;
            
            svg.append('g')
                .attr('class', 'axis')
                .attr(
                    'transform',
                    `translate(${paddingX - 30}, 0)`
                )
                .call(yAxis)
                ;
        })
        .catch((error) => console.log(error)); 

}

function updateLineChart(svg, data) {

    // specify y scale
    let yScale = d3.scaleLinear()
        .range([500, 100])
        .domain([
            d3.min(data, (d) => d.percent_congestion),
            d3.max(data, (d) => d.percent_congestion)
        ]);
    
    // update existing (x, y, height), enter new and add all attributes, exit bar if data no longer exists
    svg.selectAll('rect')
        .data(data)
        .attr('x', (d, i) => 860/data.length * i)
        .attr('y', (d) => yScale(d.percent_congestion))
        .attr('height', (d) => 500 - yScale(d.percent_congestion))
        .enter()
        .append('rect')
        .attr('class', 'city-bar')
        .attr('x', (d, i) => 860/data.length * i)
        .attr('y', (d) => yScale(d.percent_congestion))
        .attr('height', (d) => 500 - yScale(d.percent_congestion))
        .attr('width', 860/data.length)
        .attr('fill', '#066094')
        .on("mouseover", function() {
            tooltipBar.style("visibility", "visible");
        })
        .on("mousemove", function (event, d) {
            // d = new Date(parseInt(e.date));
            return tooltipBar.html(
                "<p>Date: " + d.date + "</p>"
                + "<p>Percentage of baseline: " 
                + Math.round(d.percent_congestion*10000)/100 + "%</p>"
                + `<p>Hour: ${d.hour}:00`)
                .style("top", (event.pageY - 150) +"px")
                .style("left", (event.pageX) +"px")
                ;
        })
        .on("mouseout", function() {
            return tooltipBar.style("visibility", "hidden");
        })
        .exit()
        .remove()
        ;
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
                cityCongestionPlot(updateLineChart);
            }
        });
    }
);