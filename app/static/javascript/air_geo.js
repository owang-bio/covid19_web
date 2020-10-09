var createMap = (data) => {

    var width = 900;
    var height = 600;
    
    // projection & path generator
    // var path = d3.geo.path(); good for d3 v3 to create US map
    var projection = d3.geoAlbersUsa()
    var path = d3.geoPath()
    .pointRadius(4.5)
    .projection(projection);
    
    // prepare cavas
    var svg = d3.select(".plots")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        // .attr('viewBox', '200 0 900 600')
        ;
    
    // prepare tooltip
    var tooltip = d3.select('.plots').append('div')
        .attr('class', 'tooltip')
        .style("position", "absolute")
        .style("visibility", "hidden")
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "1px")
        .style("border-radius", "6px")
        .style("padding", "3px")
        .style("font-size", "small");

    // geo map 
    // var url = "https://gist.githubusercontent.com/mbostock/4090846/raw/d534aba169207548a8a3d670c9c2cc719ff05c47/us.json";
    var url = "/serve/usmap";
    d3.json(url)
        .then( function(topology) {
                // convert topojson to geojson
                var geojson = topojson.feature(topology, topology.objects.states);
        
                // draw map                
                svg.append('g')
                .attr('class', 'map')
                .selectAll("path")
                .data(geojson.features)
                .enter()
                .append("path")
                .attr('fill', '#ccc')
                .attr('stroke', '#fff')
                .attr('stroke-width', '.5px')
                .attr("d", path);
            
                // append points, label, tooltips
                let d;                
                svg.append('g')
                .attr('class', 'points')
                .selectAll("circle")
                .data(data)
                .enter()
                .append("circle")
                .attr('class', 'airport')
                .attr('cx', (e) => projection([e.longitude, e.latitude])[0])
                .attr('cy', (e) => projection([e.longitude, e.latitude])[1])
                .attr('r', (e) => {
                if (/Kennedy|Newark|LaGuardia/.test(e.airport_name)) {
                    return 6;
                } else {
                    return 8;
                }
                })
                .attr('fill', (e) => colorScale(parseInt(e.percent_of_baseline)/100))
                .on("mouseover", function() {
                    tooltip.style("visibility", "visible");
                })
                .on("mousemove", function (event, e) {
        
                    d = new Date(parseInt(e.date));
                    return tooltip.html(
                        "<p>Date: " + d.toLocaleDateString() + "</p>"
                        + "<p>Airport: " + e.airport_name + "</p>"
                        + "<p>Percentage of baseline: " 
                        + Math.round(e.percent_of_baseline*100)/100 + "%</p>")
                        .style("top", (event.pageY - 25) +"px")
                        .style("left", (event.pageX + 25) +"px")
                        ;
                })
                .on("mouseout", function() {
                    return tooltip.style("visibility", "hidden");
                });
        
                svg.append('g')
                    .attr('class', 'airport-text')
                    .selectAll('text')
                    .data(data)
                    .enter()
                    .append('text')
                    .text((e) => e.airport_name.replace('International', ''))
                    .attr('x', (e) => {
                        if (/Detroit/.test(e.airport_name)) {
                            return projection([e.longitude, e.latitude])[0] - 15;
                        } else {
                            return 8 + projection([e.longitude, e.latitude])[0];
                        }
                    })
                    .attr('y', (e) => {
                        if (/Kennedy/.test(e.airport_name)) {
                            return projection([e.longitude, e.latitude])[1];
                        } else if (/Newark/.test(e.airport_name)) {
                            return projection([e.longitude, e.latitude])[1] - 10;
                        } else if (/Detroit/.test(e.airport_name)) {
                            return projection([e.longitude, e.latitude])[1] - 12;
                        } else {
                            return 10 + projection([e.longitude, e.latitude])[1];
                        }
                    })
                    .attr('font-size', 'xx-small');
            })
        .catch((error) => console.log(error)); 
    
    // create legend
    //Append a defs (for definition) element to your SVG, the gredient bar needs to be inlcuded in this defs
    var defs = svg.append("defs");
    
    //Append a linearGradient element to the defs and give it a unique id
    var linearGradient = defs.append("linearGradient")
        .attr("id", "linear-gradient");
    
    linearGradient
        .attr("x1", "0%")
        .attr("y1", "0%")
        .attr("x2", "100%")
        .attr("y2", "0%");
    
    //Set the color for the start (0%)
    linearGradient.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", "#FFFFFF"); //light blue
    
    //Set the color for the end (100%)
    linearGradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", '#066094'); //dark blue
    
    var legend = svg.append('g')
        .attr('class', "legend");
    
    legend.append('rect')
        .attr('x', '50')
        .attr('y', '530')
        .attr('width', '200')
        .attr('height', '10')
        .style("fill", "url(#linear-gradient)");
    
    var colorScale = d3.scaleLinear()
        .domain([0, 1])
        .range(['#FFFFFF', "#066094"]);
    
    var xScale = d3.scaleLinear()
        .domain([0, 1])
        .range([50, 250]);
    
    legend.append('text')
        .text("Percentage of Baseline")
        .style('font-size', 'small')
        .attr('transform', "translate(50, 525)");
    
    //lenged axis
    var xAxis = d3.axisBottom(xScale)
        .ticks(1)
        .tickFormat(d3.format(".0%"))
    
    legend.append('g')
        .attr('class', 'legend-axis')
        .attr('transform', "translate(0, 540)")
        .style('stroke-width', '0px') 
        .call(xAxis);

    let d = new Date(parseInt(data[0].date));
    $('#main-title').text('Percentage of Air Traffic Compared With Baseline Before Covid-19');
    $('#sub-title').text('Hover Over the Airport to View the Percentage for ' + d.toLocaleDateString());

    
    // // console.log(d.toLocaleDateString());    
    // $('.domain').css('fill', 'none');
    // d3.select('.plots')
    //     .append('div')
    //     .attr('class', 'plot-desc')
    //     .html(`<p> Date: ${d.toLocaleDateString()} </p>` 
    //         + '<br> <p> add some description here later!</p>');
}

$(document).ready( () => {
    $.ajax({
        url: "/mobility/air", 
        success: createMap
        });
    }
);

$('#air').click(
    (e) => {
        e.preventDefault();
        $(".plots").html("");
        $.ajax({
            url: "/mobility/air", 
            success: createMap
        });
    }
);