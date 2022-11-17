
// var dat=[];
// This variable stores the result of processing the queries as an array of objects like
// [
//     { year: 1991, value: 0.5 },
//     { year: 1992, value: 0.5 },
// ]

var OLDEST_YEAR = 1990;
var NEWEST_YEAR = 2020;
// Change these variables according to the years available in the dataset

var slider=document.getElementById("myRange");
var output=document.getElementById('demo');
var cur_slider_value=slider.value;
output.innerHTML=slider.value;

slider.oninput = function ()
{
	output.innerHTML = this.value;
	cur_slider_value = this.value;
    setTimeout(() => {
        getyearly();
    }, 250);
    setTimeout(() => {
        getmaxdiff();
    }, 250);
	// updateWorld();
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
// befault side panel grph when loaded
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
    // reverse dat
    // dat.reverse();
    
    // let ran=dat.reverse();
    // dat=ran;
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