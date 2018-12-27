var express = require('express'),
    app = express(),
    http = require('http'),
    socketIo = require('socket.io');

const fs = require('fs');
var filename = 'canvas.json';

// start webserver on port 8080
var server =  http.createServer(app);
var io = socketIo.listen(server);

// add directory with our static files
app.use(express.static(__dirname + '/public'));

// array of all lines drawn
// Example line added for seeing
var line_history = [
    //[ { x: 0.03759398496240601, y: 0.6080114449213162 },
    //    { x: 0.9285714285714286, y: 0.6008583690987125 } ]
];

loadCanvas();

// event-handler for new incoming connections
io.on('connection', function (socket) {

    console.log("User connected.")
    //console.log(JSON.stringify(line_history));
    // first send the history to the new client
    for (var i in line_history) {
        socket.emit('draw_line', { line: line_history[i] } );
    }

    // add handler for message type "draw_line".
    socket.on('draw_line', function (data) {
        // add received line to history
        line_history.push(data.line);
        // send line to all clients
        io.emit('draw_line', { line: data.line });
    });

    socket.on('save_canvas', saveCanvas);

    socket.on('reset_canvas', resetCanvas);

    socket.on('reload_canvas', function() {
        resetCanvas();
        loadCanvas();

        for (var i in line_history) {
            io.emit('draw_line', { line: line_history[i] } );
        }
        io.emit('refresh_canvas');
    });

    socket.on('disconnect', function(){
        console.log("User disconnected.");
        //console.log(line_history);
    });

});

function resetCanvas() {
    line_history = [];
    console.log("Canvas successfully reset.")
    io.emit('reset_canvas');
}

function saveCanvas() {
    let data = JSON.stringify(line_history);
    fs.writeFileSync(filename, data);
    console.log('Successfully saved canvas to ' + filename);
}


function loadCanvas() {
    fs.readFile(filename, (err, data) => {
        console.log("Reading canvas history from " + filename);
    
        if(err) {
            console.log("Warning! No canvas history found.");
        } else {
            line_history = JSON.parse(data);
            console.log("Success! Successfully Loaded canvas history.");
            //console.log(JSON.stringify(line_history));
        }
    });
}


server.listen(4000);
console.log("Server running on port: 4000");