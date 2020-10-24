var geoMapGas = (data) => {

    data = JSON.parse(data);
    // console.log(data);
    
    // get map data
    let url = "/serve/usmap";
    d3.json(url)
        .then( function(topology) {

            var projection = d3.geoAlbersUsa()
            var path = d3.geoPath()
                .pointRadius(4.5)
                .projection(projection);

            let geojson = topojson.feature(topology, topology.objects.states);

            // bind geojson to percentage data
            for (var i = 0; i < geojson.features.length; i++) {
                // console.log(geojson.features[i].id);
                for (var j = 0; j < data.length; j++) {
                    if (geojson.features[i].id == data[j].id) {
                        geojson.features[i]['percentage'] = data[j].percentage;
                        geojson.features[i]['state'] = data[j].name;
                        geojson.features[i]['date'] = data[j].date;
                        geojson.features[i]['code'] = data[j].code;
                        break;
                    }
                }
            }

            // console.log(geojson);

            let width = 675;
            let height = 450;

            let colorScale = d3.scaleLinear()
                .domain([
                    0, 
                    d3.max(data, d => d.percentage)
                ])
                .range(['#FFFFFF', "#fc0000"]);

            gasMap = d3.select('#geo-gas')
                .append('svg')
                .attr("width", width)
                .attr("height", height)
                .attr('viewBox', '-250 0 1200 800');

            gasMapToolTip = d3.select('#geo-gas')
                .append('div')
                .attr('class', 'tooltip')
                .style("position", "absolute")
                .style("visibility", "hidden")
                .style("background-color", "white")
                .style("border", "solid")
                .style("border-width", "1px")
                .style("border-radius", "6px")
                .style("padding", "3px")
                .style("font-size", "small");

            gasMap.append('g')
                .attr('class', 'gas-map')
                .selectAll("path")
                .data(geojson.features)
                .enter()
                .append("path")
                .attr('class', 'gas-shape')
                .attr('fill', e => colorScale(e.percentage))
                .attr('stroke', '#fff')
                .attr('stroke-width', '.5px')
                .attr("d", path)
                .on("mouseover", function() {
                    gasMapToolTip.style("visibility", "visible");
                })
                .on("mousemove", function (event, e) {

                    return gasMapToolTip.html(
                        "<p>Date: " + e.date + "</p>"
                        + "<p>State: " + e.state + "</p>"
                        + "<p>Percentage of baseline: " 
                        + Math.round(e.percentage*100)/100 + "%</p>")
                        .style("top", (event.pageY - 25) +"px")
                        .style("left", (event.pageX + 25) +"px")
                        ;
                })
                .on("mouseout", function() {
                    return gasMapToolTip.style("visibility", "hidden");
                });
        });

    // let d = new Date(data[0].date);
    $('#main-title').text('Percentage of Gas Fillup Compared With Baseline Before Covid-19' 
        +  ` (Week of ${data[0].date})`);
    $('#sub-title').text('Click on the State to View the Time Series Data on Right');

}

// create the bar chart for gas fill ups
var barGas = (data) => {

    data = JSON.parse(data);

    let width = 675;
    let height = 450;
    padding = 20;
    let barWidth = (width - padding * 2) / data.length;

    let xScale = d3.scaleLinear()
        .domain([
            d3.min(data, (d) => new Date(d.date)), 
            d3.max(data, (d) => new Date(d.date))
        ])
        .range([padding, width - padding]);

    let yScale = d3.scaleLinear()
    .domain([
        d3.min(data, (d) => d.percentage), 
        d3.max(data, (d) => d.percentage)
    ])
    .range([height - padding, padding]);

    gasBarToolTip = d3.select('#bar-gas')
        .append('div')
        .attr('class', 'tooltip')
        .style("position", "absolute")
        .style("visibility", "hidden")
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "1px")
        .style("border-radius", "6px")
        .style("padding", "3px")
        .style("font-size", "small");
        
    let bar = d3.select('#bar-gas')
        .append('svg')
        .attr("width", width)
        .attr("height", height)
        .attr('viewBox', '-150 0 1200 800');

    bar.selectAll('rect')
        .data(data)
        .enter()
        .append('rect')
        .attr('class', 'gas-shape')
        .attr('x', (d, i) => i * barWidth + padding)
        .attr('y', (d) => height - yScale(d.percentage))
        .attr('width', barWidth)
        .attr('height', d => yScale(d.percentage))
        .attr('fill', "#fc0000")
        .style('opacity', '0.5')
        .on("mouseover", function() {
            gasBarToolTip.style("visibility", "visible");
        })
        .on("mousemove", function (event, e) {

            return gasBarToolTip.html(
                "<p>Date: " + e.date + "</p>"
                + "<p>State: " + e.code + "</p>"
                + "<p>Percentage of baseline: " 
                + Math.round(e.percentage*100)/100 + "%</p>")
                .style("top", (event.pageY - 25) +"px")
                .style("left", (event.pageX + 25) +"px")
                ;
        })
        .on("mouseout", function() {
            return gasBarToolTip.style("visibility", "hidden");
        });
        ;

}

$('#gas').click(
    (e) => {
        e.preventDefault();
        $(".plots").html("");

        d3.select('.plots')
            .append('div')
            .attr('id', 'gas-fillup')
            .style('grid-column', '1 / 4')
            .style('display', 'flex')
            .style('flex-direction', 'row');
        
        d3.select('#gas-fillup')
            .append('div')
            .attr('id', 'geo-gas')
            .attr('padding', '0 3%')
            .style('width', '44vw');

        d3.select('#gas-fillup')
            .append('div')
            .attr('id', 'bar-gas')
            .attr('padding', '0 3%')
            .style('width', '44vw');

        $.ajax({
            url: "/mobility/gas", 
            success: (data) => {
                geoMapGas(data);
            }
        });

        $.ajax({
            url: "/mobility/gas/AL", 
            success: (data) => {
                barGas(data);
            }
        });
    }
);