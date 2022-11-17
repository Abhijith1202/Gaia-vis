// declarations
const colorScale = d3.scaleSequentialSqrt(d3.interpolateGreens);
var forestCoverYear = "FOREST2020";
var slider = document.getElementById("myRange");
var output = document.getElementById("demo");
let world;
output.innerHTML = slider.value;
var cur_slider_value = slider.value;

var OLDEST_YEAR = 1990;
var NEWEST_YEAR = 2020;

// helper function to extract the actual corresponding data from the geojson for a given forestCoverYear
const getVal = (feat) =>
{ return feat.properties.hasOwnProperty(forestCoverYear) ? feat.properties[forestCoverYear] : 0; }

// simple call to init
init();

// update the displayed year, and also the state of the world polygons each time the slider is moved
slider.oninput = function ()
{
	output.innerHTML = this.value;
	cur_slider_value = this.value;
	forestCoverYear = "FOREST" + cur_slider_value;
	setTimeout(() => {
        getyearly();
    }, 250);
    setTimeout(() => {
        getmaxdiff();
    }, 250);
	updateWorld();
}

// init function to create the world, and set the initial state
function init()
{
	fetch('../data/forestcover.json').then(res => res.json()).then(countries =>
	{
		// just getting the max forest cover (helps in setting the color scale, see line 1)
		const maxVal = Math.max(...countries.features.map(getVal));
		colorScale.domain([0, maxVal]);	

		world = Globe()
			.globeImageUrl('//unpkg.com/three-globe/example/img/earth-night.jpg')
			.backgroundImageUrl('//unpkg.com/three-globe/example/img/night-sky.png')
			.lineHoverPrecision(0)
			.polygonsData(countries.features.filter(d => d.properties.ISO_A2 !== 'AQ'))
			.polygonAltitude(0.06)
			.polygonCapColor(feat => colorScale(getVal(feat)))
			.polygonSideColor(() => 'rgba(0, 100, 0, 0.15)')
			.polygonStrokeColor(() => '#111')
			.polygonLabel(({ properties: d}) => `
			<b>${d.ADMIN} (${d.ISO_A2}):</b> <br />
			Forest Cover <i>${d[forestCoverYear]}</i> <br />
			Population: <i>${d.POP_EST}</i>
			`)
			.onPolygonHover(hoverD => world
				.polygonsTransitionDuration(300)
				.polygonAltitude(d => d === hoverD ? 0.12 : 0.06)
				.polygonCapColor(d => d === hoverD ? 'steelblue' : colorScale(getVal(d)))
			)
			// call updategraph(country) when a country is clicked
			(document.getElementById('globeViz'))
	});
	gettotal();
	getmaxdiff();
	getyearly();

}

function updateWorld()
{
	// once updated forest cover data is fetched (upon changing slider value), update the world polygons
	fetch('../data/forestcover.json').then(res => res.json()).then(countries =>
	{
		const maxVal = Math.max(...countries.features.map(getVal));
		colorScale.domain([0, maxVal]);
		world.polygonsTransitionDuration(0)
		world.polygonsData(countries.features.filter(d => d.properties.ISO_A2 !== 'AQ'))
	});	
}

// function to get the forest cover of all countries in a particular year
function getyearly() {
    var dat=[];
    let year=cur_slider_value;
    console.log("getyearly called\n");
    fetch('../data/forestcover.json')
    .then(res => res.json())
    .then(feat => 
        {
            dat=[];
            var key='FOREST'+year;
            for (var i = 0; i < feat.features.length; i++) {
                dat.push({
                    year: feat.features[i].properties.NAME,
                    value: feat.features[i].properties[key]
                });
            }
            drawbar("Forest Cover in "+year,'yearlygraph',dat);
        }
    );
}

// function to get the country with most difference in forest cover compared to previous year
function getmaxdiff() {
    var dat=[];
    let year=cur_slider_value;
    if(year==OLDEST_YEAR) year=OLDEST_YEAR+1;
    console.log("getmaxdiff called\n");
    console.log("year: "+year+"\n");
    fetch('../data/forestcover.json')
    .then(res => res.json())
    .then(feat => 
        {
            dat=[];
            var key='FOREST'+year;
            var key1='FOREST'+(year-1);
            var max=0;
            var maxcountry='';
            var val1,val2;
            for (var i = 0; i < feat.features.length; i++) {
                if(feat.features[i].properties[key]==0 || feat.features[i].properties[key1]==0) continue;
                var diff=feat.features[i].properties[key1]-feat.features[i].properties[key];
                if(diff>max) {
                    max=diff;
                    maxcountry=feat.features[i].properties.NAME;
                    val1=feat.features[i].properties[key];
                    val2=feat.features[i].properties[key1];
                }
            }
            dat.push({
                year: year-1,
                value: val2
            });
            dat.push({
                year: year,
                value: val1
            });
            drawbar("Country with most change in forest cover in "+year+" : "+maxcountry,'maxdiffgraph',dat);
        }
    );
}

//draw the global forest cover graph over the years
// befault side panel graph when loaded
function gettotal() {
    var dat=[];
    console.log("gettotal called\n");
    fetch('../data/forestcover.json')
    .then(res => res.json())
    .then(feat => 
        {
            let lookup={};
            dat=[];
            var list={};
            for(var j=NEWEST_YEAR;j>=OLDEST_YEAR;j--) {
                var key='FOREST'+j;
                var sum=0;
                for (var i = 0; i < feat.features.length; i++) {
                    if(feat.features[i].properties[key]==0) {
                        // check if there is a non zero value in lookup table
                        if(lookup[feat.features[i].properties.NAME]!=undefined) 
                        {
                            sum+=lookup[feat.features[i].properties.NAME];
                        }
                    }
                    else {
                        lookup[feat.features[i].properties.NAME]=feat.features[i].properties[key]/100;
                        sum+=feat.features[i].properties[key]/100;
                    }
    
                }
                dat.push({
                    year: j,
                    value: sum
                });
            }
        }
    );
    setTimeout(() => {
        let n=dat.length;
        for(var i=0;i<n/2;i++) {
            var temp=dat[i];
            dat[i]=dat[n-i-1];
            dat[n-i-1]=temp;
        }
        drawline('Global Forest Cover','globalgraph',dat);
    }, 250);
}

// function to draw bar graph
function drawbar(subject,cont,dat) {
    console.log("Drawbar function called for "+cont+"\n");
    const ctx=document.getElementById(cont);
    // 
    // clear canvas
    ctx.width+=0;
    // 
    // const context = ctx.getContext('2d');

    // context.clearRect(0, 0, ctx.width, ctx.height);
    console.log(dat);
    setTimeout(() => {
        // console.log(dat);
        const myChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: dat.map(d => d.year),
                datasets: [{
                    label: subject,
                    data: dat.map(d => d.value),
                    // backgroundColor: [
                    //     'rgba(0, 180, 100, 1)',
                    //     // 'rgba(0, 180, 100, 0)',
                    // ],
                    backgroundColor: color=> {
                        // console.log(color);
                        return 'rgba(0, 180, 100, 1)';
                    },
                    borderColor: color=> {
                        // console.log(color);
                        return 'rgba(190, 20, 50, 0.75)';
                    },
                    // borderColor: [
                    //     'rgba(190, 20, 50, 0.75)',
                    // ],
                    borderWidth: 1
                    // if(ty=='bar') {}
                }]
            },
            options: {
                // start y axis from 0
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero: true
                        }
                    }]
                }
            }
        });
    }, 250);
}

// This function is called when data is processed and a graph is to be drawn
function drawline(subject, cont,dat) {
    console.log("Drawline function called\n");
    const ctx=document.getElementById(cont);
    ctx.width+=0;
    console.log(dat);
    setTimeout(() => {
        // console.log(dat);
        const myChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: dat.map(d => d.year),
                datasets: [{
                    label: subject,
                    data: dat.map(d => d.value),
                    backgroundColor: [
                        'rgba(0, 180, 100, 0.75',
                        // 'rgba(0, 180, 100, 0)',
                    ],
                    borderColor: [
                        'rgba(190, 20, 50, 1)',
                    ],
                    borderWidth: 5
                    // if(ty=='bar') {}
                }]
            },
        });
    }, 250);
}