let data = [];


// Import the GeoJSON merge function
// const { merge } = require('@mapbox/geojson-merge');

// load data-----------------------------------------------------------------------------------------
async function loadData() {
    data = await d3.csv('lib/lnos.csv', (row) => ({
        ...row,
        country: row.country,
        genre: row.genre,
        artist: row.artist,
        songName: row["song name"],
        rating: Number(row.rating)
    }));
    // console.log(data);
    createChoropleth(data);
  }


// execute loadData when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', async () => {
    await loadData();      
});

async function createChoropleth(data) {
    var margin = {top: 0, right: 0, bottom: 0, left: 0},
    width = window.innerWidth * .8,
    height = window.innerHeight;

    // Rollup necessary data
    const countryStats = d3.rollup(
        data,
        v => ({
            count: v.length,
            songs: v.map(d => `${d.songName} - ${d.artist}`) // Fixing template literal syntax
        }),
        d => d.country
            .split(' ')                    // Split the country name into words
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())  // Capitalize each word
            .join(' ')                     // Rejoin the words into a single string
    );

    // Tooltip setup
    const tooltip = d3.select("#lnos-chart").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0)
        .style("position", "absolute")
        .style("background", "white")
        .style("border", "1px solid rgba(0,0,0,0.1)")
        .style("border-radius", "6px")
        .style("padding", "10px")
        .style("box-shadow", "2px 2px 6px rgba(0, 0, 0, 0.1)")
        .style("font-family", "Inter")
        .style("font-size", "12px")
        .style("line-height", "1.4")
        .style("pointer-events", "none")
        .style("z-index", "1000");

    // Mouseover function
    const mouseover = function(event, d) {
        d3.selectAll(".country")
        .style("opacity", 0.75);  // Fade out all

        d3.select(this)
        .style("stroke-width", .6)
        .style("stroke", "black")
        .style("opacity", 1);

        const countryData = countryStats.get(d.properties.ADMIN);
        
        if (countryData) {
            tooltip.html(`
                <div style="font-weight: bold; color: ${colorScale(countryData.count)}; margin-bottom: 5px">
                    ${d.properties.ADMIN}
                </div>
                <div style="color: #666">
                    Songs Count: <span style="color: #333; font-weight: 600;">${countryData.count}</span>
                </div>
                <div style="color: #666; margin-top: 5px">
                    Songs:
                    <ul style="margin: 5px 0; padding-left: 15px; color: #333; font-size: 14px">
                        ${countryData.songs.slice(0, 5).map(song => `<li>${song}</li>`).join('')}
                    </ul>
                </div>
            `)
            .style("opacity", 1)
            .style("left", Math.max(event.pageX + 10, 10) + "px")
            .style("top", Math.max(event.pageY - 10, 10) + "px");
        } else {
            tooltip.html(`
                <div style="font-weight: bold; margin-bottom: 5px">${d.properties.ADMIN}</div>
                <div style="color: #666">No songs recorded</div>
            `)
            .style("opacity", 1)
            .style("left", Math.max(event.pageX + 10, 10) + "px")
            .style("top", Math.max(event.pageY - 10, 10) + "px");
        }
    };

    // Mouseleave function
    const mouseleave = function(event, d) {
        tooltip.style("opacity", 0);

        // Reset opacity for all countries
        d3.selectAll(".country")
        .style("opacity", 1)
        .style("stroke", "#282828")
        .style("stroke-width", .2);
        
        d3.select(this)
            .style("stroke", "black");
    };

    // // Load GeoJSON map data
    // const world = await d3.json('https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson');
    // Load GeoJSON from your local file
    const world = await d3.json('lib/countries.geojson');

    const zoom = d3.zoom()
        .scaleExtent([1.25, 8])
        .translateExtent([[0, 0], [width, height]])
        .on('zoom', zoomed);

    // SVG Setup
    const svg = d3.select('#lnos-chart')
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .attr('class', 'lnos-chart');


        
    // Define Projection
    const projection = d3.geoNaturalEarth1()
    .fitExtent([[0, 0], [width, height]], world);

    const path = d3.geoPath().projection(projection);

    // Create color scale
    const maxCount = d3.max(Array.from(countryStats.values()), d => d.count) || 1;
    const colorScale = d3.scaleSequential(d3.interpolateHcl("#AFC6E9", "#08142E"))
    .domain([0, maxCount]);


    // Scale from 0 to maxCount based on data
    svg.call(zoom);

    // Create a group for all map elements
    const g = svg.append('g');

    // Draw map
    g.selectAll('path')
        .data(world.features)
        .join('path')
        .attr('d', path)
        .attr('fill', d => {
            const countryName = d.properties.ADMIN;
            // If the country has data, color it using the colorScale, otherwise set it to white.
            return countryStats.has(countryName) ? colorScale(countryStats.get(countryName).count) : '#fff'; 
        })
        .attr('stroke', '#282828')  // Set the country borders to black
        .attr('stroke-width', 0.2)
        .attr('class', 'country')
        .on("mouseover", mouseover)
        .on("mouseleave", mouseleave);

    // Apply default zoom transform (1.25x and centered)
    const defaultScale = 1.25;
    const tx = width / 2;
    const ty = height / 2;

    svg.call(zoom.transform, d3.zoomIdentity
        .translate(tx, ty)
        .scale(defaultScale)
        .translate(-width / 2, -height / 2));
        
    // Zoom function that applies the zoom transformations
    function zoomed(event) {
        g.attr('transform', event.transform);  // Apply zoom to the group
    }
    
}
