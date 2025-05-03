let sharedData = null;
let sharedData2 = null;

function loadData() {
    return new Promise((resolve, reject) => {
        if (sharedData) {
            resolve(sharedData);
        } else {
            d3.csv("data1.csv").then(data => {
                sharedData = data;
                resolve(data);
            }).catch(reject);
        }
    });
}

function loadData2() {
    return new Promise((resolve, reject) => {
        d3.csv("data2.csv").then(data => {
            data.forEach(d => {
                d.AQI = +d.AQI;
                d.HealthImpactScore = +d.HealthImpactScore;
                d.CardiovascularCases = +d.CardiovascularCases;
                d.RespiratoryCases = +d.RespiratoryCases;
                d.HealthImpactClass = +d.HealthImpactClass;
            });
            resolve(data);
        }).catch(reject);
    });
}


