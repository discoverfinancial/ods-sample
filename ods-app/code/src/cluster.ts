/**
 * Copyright (c) 2025 Capital One
*/

// Run Surveyor app as cluster, using up to 4 CPUs

var cluster = require('cluster');
var numCPUs = require('os').cpus().length;

if (cluster.isMaster) {

    for (var i = 0; i < Math.min(4, numCPUs); i++) {
        cluster.fork();
    }

    Object.keys(cluster.workers).forEach(function (id) {
        console.log("Worker running with ID : " + cluster.workers[id].process.pid);
    });
    
    cluster.on('exit', function (worker: any, code: any, signal: any) {
        console.log('Worker ' + worker.process.pid + ' died');
    });
}

else {
    require("./app");
}