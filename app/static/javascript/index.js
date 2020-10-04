$('#city').click(
    (e) => {
        e.preventDefault();
        $(".plots").html("");
        $.ajax({
            url: "/test2", 
            success: (data, stat, haha) => { 

                var width = 900;
                var height = 600;
                
                let svg = d3.select('.plots')
                    .append('svg')
                    .attr("width", width)
                    .attr("height", height);

            svg.append('text')
                .text(data)
                .attr('x', 200)
                .attr('y', 200);
          }
        });
    }
);