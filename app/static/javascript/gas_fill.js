var geoMapGas = (data) => {

    data = JSON.parse(data);
    console.log(data);
    
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
            let paddingX = 50;
            let paddingY = -80;

            console.log(d3.max(data, (d) => d.percentage));
            
            let colorScale = d3.scaleLinear()
                .domain([
                    0, 
                   d3.max(data, (d) => d.percentage)
                ])
                .range(['#FFFFFF', "#f06c6c"]);

            gasMap = d3.select('#geo-gas')
                .append('svg')
                .attr("width", width)
                .attr("height", height)
                .attr('viewBox', '-100 0 1200 800');

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
                .selectAll("path")
                .data(geojson.features)
                .enter()
                .append("path")
                .attr('class', 'gas-shape gas-state')
                .attr('fill', e => colorScale(e.percentage))
                .attr('stroke', '#fff')
                .attr('stroke-width', '.5px')
                .attr("d", path)
                .on("mouseover", function() {
                    gasMapToolTip.style("visibility", "visible");
                })
                .on("mousemove", function (event, e) {

                    return gasMapToolTip.html(
                        "<p>Week of: " + e.date + "</p>"
                        + "<p>State: " + e.state + "</p>"
                        + "<p>Percentage of baseline: " 
                        + Math.round(e.percentage*10000)/100 + "%</p>")
                        .style("top", (event.pageY - 25) +"px")
                        .style("left", (event.pageX + 25) +"px")
                        ;
                })
                .on("mouseout", function() {
                    return gasMapToolTip.style("visibility", "hidden");
                })
                .on('click', (e, d) => {
                    let url = `/mobility/gas/${d.code}`;
                    $.ajax({
                        url: url, 
                        success: updateGasBar
                    });
                })
                ;

             // create legend
            //Append a defs (for definition) element to your SVG, the gredient bar needs to be inlcuded in this defs
            let defs = gasMap.append("defs");
            
            //Append a linearGradient element to the defs and give it a unique id
            let linearGradient = defs.append("linearGradient")
                .attr("id", "linear-gradient");
            
            linearGradient
                .attr("x1", "0%")
                .attr("y1", "0%")
                .attr("x2", "100%")
                .attr("y2", "0%");
            
            //Set the color for the start (0%)
            linearGradient.append("stop")
                .attr("offset", "0%")
                .attr("stop-color", "#FFFFFF"); //white
            
            //Set the color for the end (100%)
            linearGradient.append("stop")
                .attr("offset", "100%")
                .attr("stop-color", '#f06c6c'); //dark red
            
            let legend = gasMap.append('g')
                .attr('class', "legend");
            
            legend.append('rect')
                .attr('x', paddingX)
                .attr('y', height - paddingY)
                .attr('width', '200')
                .attr('height', '10')
                .style("fill", "url(#linear-gradient)");
            
            legend.append('text')
                .text("Percentage of Baseline")
                .style('font-size', 'small')
                .attr('transform', `translate(${paddingX}, ${height - paddingY - 5})`);
            
            let xScale = d3.scaleLinear()
                .domain([
                    0, 
                    d3.max(data, d => d.percentage)])
                .range([0, 200]);

            //lenged axis
            let xAxisLegend = d3.axisBottom(xScale)
                .ticks(3)
                .tickFormat(d3.format(".0%"))
            
            legend.append('g')
                .attr('class', 'legend-axis')
                .attr('transform', `translate(${paddingX}, ${height - paddingY  + 5})`)
                .style('stroke-width', '0px') 
                .call(xAxisLegend);
                }
    );


    $('#main-title').text('Percentage of Gas Fillup Compared With Baseline Before Covid-19' 
        +  ` (Week of ${data[0].date})`);
    $('#sub-title').text('Click on the State to View the Time Series Data on Right');

}

// create the bar chart for gas fill ups
var barGas = (data) => {

    data = JSON.parse(data);

    let width = 550;
    let height = 350;
    let paddingX = 40;
    let paddingY = 50;
    let barWidth = (width - paddingX * 2) / data.length;

    let xScale = d3.scaleLinear()
        .domain([
            d3.min(data, (d) => new Date(d.date)), 
            d3.max(data, (d) => new Date(d.date))
        ])
        .range([paddingX, width - paddingX]);

    let yScale = d3.scaleLinear()
    .domain([
        0, 
        d3.max(data, (d) => d.percentage)
    ])
    .range([height - paddingY, paddingY]);

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
        .attr('id', 'gas-bar-plot')
        .attr("width", width)
        .attr("height", height)
        // .attr('viewBox', '-100 0 1200 800');

    bar.selectAll('rect')
        .data(data)
        .enter()
        .append('rect')
        .attr('class', 'gas-shape')
        .attr('x', (d, i) => i * barWidth + paddingX)
        .attr('y', (d) => yScale(d.percentage))
        .attr('width', barWidth)
        .attr('height', d => height - yScale(d.percentage) - paddingY)
        .attr('fill', "#fc0000")
        .style('opacity', '0.3')
        .on("mouseover", function() {
            gasBarToolTip.style("visibility", "visible");
        })
        .on("mousemove", function (event, e) {

            return gasBarToolTip.html(
                "<p>Date: " + e.date + "</p>"
                + "<p>State: " + e.code + "</p>"
                + "<p>Percentage of baseline: " 
                + Math.round(e.percentage*10000)/100 + "%</p>")
                .style("top", (event.pageY - 25) +"px")
                .style("left", (event.pageX + 25) +"px")
                ;
        })
        .on("mouseout", function() {
            return gasBarToolTip.style("visibility", "hidden");
        })
        ;

    let xAxis = d3.axisBottom(xScale)
        .ticks(2)
        .tickFormat(d3.timeFormat("%Y/%m/%d"))
        ;

    let yAxis = d3.axisLeft(yScale)
        .ticks(2)
        .tickFormat(d3.format('.0%'))
        ;
    
    bar.append('g')
        .attr('class', 'xaxis')
        .attr(
            'transform',
            `translate(${0}, ${height -  paddingY})`
        )
        .call(xAxis);

    bar.append('g')
        .attr('class', 'yaxis')
        .attr(
            'transform',
            `translate(${paddingX}, ${0})`
        )
        .call(yAxis);

    bar.append('text')
        .attr('id', 'selected-state')
        .text(`Selected State: ${data[0].code}`)
        .attr(
            'transform',
            'translate(250, 330)'
        )
        ;
}

var updateGasBar = (data) => {

    data = JSON.parse(data);

    let width = 550;
    let height = 350;
    let paddingX = 40;
    let paddingY = 50;
    let barWidth = (width - paddingX * 2) / data.length;

    svg = d3.select('#gas-bar-plot');

    // specify y scale
    let xScale = d3.scaleLinear()
        .domain([
            d3.min(data, (d) => new Date(d.date)), 
            d3.max(data, (d) => new Date(d.date))
        ])
        .range([paddingX, width - paddingX]);

     // specify y scale
    let yScale = d3.scaleLinear()
        .domain([
            0, 
            d3.max(data, (d) => d.percentage)
        ])
        .range([height - paddingY, paddingY]);
 
    // update existing (x, y, height)
    svg
        .selectAll('rect')
        .data(data)
        .transition()
        .duration(1000)
        .attr('x', (d, i) => i * barWidth + paddingX)
        .attr('y', (d) => yScale(d.percentage))
        .attr('height', (d) => height - yScale(d.percentage) - paddingY)
        .attr('width', barWidth)
        ;
    
    // enter new and add all attributes
    svg
        .enter()
        .append('rect')
        .attr('class', 'gas-shape')
        .attr('x', (d, i) => i * barWidth + paddingX)
        .attr('y', (d) => yScale(d.percentage))
        .attr('width', barWidth)
        .attr('height', d => heigt - yScale(d.percentage) - paddingY)
        .attr('fill', "#fc0000")
        .style('opacity', '0.3')
        .on("mouseover", function() {
            gasBarToolTip.style("visibility", "visible");
        })
        .on("mousemove", function (event, e) {

            return gasBarToolTip.html(
                "<p>Date: " + e.date + "</p>"
                + "<p>State: " + e.code + "</p>"
                + "<p>Percentage of baseline: " 
                + Math.round(e.percentage*10000)/100 + "%</p>")
                .style("top", (event.pageY - 25) +"px")
                .style("left", (event.pageX + 25) +"px")
                ;
        })
        .on("mouseout", function() {
            return gasBarToolTip.style("visibility", "hidden");
        })
        .on('click', (e) => {
            let url = `/mobility/gas/${e.code}`;
            console.log(url);
            $.ajax({
                url: url, 
                success: updateGasBar
            });
        })
        ;

    // exit bar if data no longer exists
    svg
        .exit()
        .remove()
        ;

    let xAxis = d3.axisBottom(xScale)
    .ticks(2)
    .tickFormat(d3.timeFormat("%Y/%m/%d"))
    ;

    let yAxis = d3.axisLeft(yScale)
        .ticks(2)
        .tickFormat(d3.format('.0%'))
        ;
    
    svg.select('.xaxis')
        .call(xAxis);

    svg.select('.yaxis')
        .call(yAxis);

    d3.select('#selected-state')
        .text(`Selected State: ${data[0].code}`)
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
            .style('flex-direction', 'row')
            .style('padding-top', '3%')
            ;
        
        d3.select('#gas-fillup')
            .append('div')
            .attr('id', 'geo-gas')
            .style('padding', '2% 5% 0 0')
            .style('width', '40vw')
            ;

        d3.select('#gas-fillup')
            .append('div')
            .attr('id', 'bar-gas')
            .style('padding', '0 0 0 3%')
            .style('width', '40vw')
            ;

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
                $(window).scrollTop(999);
            }
        });
    }
);