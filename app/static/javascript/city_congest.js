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
    
console.log(sliderSimple.value());

d3.select('#value-simple')
    .text('Select Hour: ' + sliderSimple.value());