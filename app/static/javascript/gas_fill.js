var geoMapGas = (data) => {

    data = JSON.parse(data);
    
    // get map data
    let url = "/serve/usmap";
    d3.json(url)
        .then( function(topology) {

            var projection = d3.geoAlbersUsa()
            var path = d3.geoPath()
                .pointRadius(4.5)
                .projection(projection);

            // convert topojson to geojson
            let geojson = topojson.feature(topology, topology.objects.states);
            // console.log(geojson);

            for (var i = 0; i < geojson.features.length; i++) {
                // console.log(geojson.features[i].id);
                for (var j = 0; j < data.length; j++) {
                    if (geojson.features[i].id == data[j].id) {
                        geojson.features[i]['percentage'] = data[j].percentage;
                        break;
                    }
                }
            }

            console.log(geojson);

            let width = 675;
            let height = 450;

            gasMap = d3.select('#geo-gas')
                .append('svg')
                .attr("width", width)
                .attr("height", height)
                .attr('viewBox', '-150 0 1200 800');

            gasMap.append('g')
                .attr('class', 'gas-map')
                .selectAll("path")
                .data(geojson.features)
                .enter()
                .append("path")
                .attr('class', 'gas-state')
                .attr('fill', '#ccc')
                .attr('stroke', '#fff')
                .attr('stroke-width', '.5px')
                .attr("d", path);
        });

    let d = new Date(data[0].date);
    $('#main-title').text('Percentage of Gas Fillup Compared With Baseline Before Covid-19' 
        +  ` (Week of ${d.toLocaleDateString()})`);
    $('#sub-title').text('Click on the State to View the Time Series Data');

}

// var lineGas = () {
// }

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
            .attr('id', 'line-gas')
            .attr('padding', '0 3%')
            .style('width', '44vw');

        $.ajax({
            url: "/mobility/gas", 
            success: (data) => {
                // console.log(data);
                geoMapGas(data);
                $(window).scrollTop(600);
            }
        });
    }
);