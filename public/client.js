document.addEventListener("DOMContentLoaded", function() {
    var mouse = {
        click: false,
        move: false,
        pos: {x:0, y:0},
        pos_prev: false
    };
    // get canvas element and create context
    var canvas  = document.getElementById('drawing');
    const saveBtn = document.getElementById('saveBtn');
    const resetBtn = document.getElementById('resetBtn');
    const reloadBtn = document.getElementById('reloadBtn');
    var context = canvas.getContext('2d');
    var width   = window.innerWidth;
    var height  = window.innerHeight;
    var socket  = io.connect();

    saveBtn.addEventListener('click', function(e) {
        console.log('Save button was clicked');
        socket.emit("save_canvas");
    });

    resetBtn.addEventListener('click', function(e) {
        console.log('Reset button was clicked');
        socket.emit('reset_canvas');
    });

    reloadBtn.addEventListener('click', function(e) {
        console.log('Reload button clicked');
        socket.emit('reload_canvas');
    })

    // set canvas to full browser width/height
    canvas.width = 700;
    canvas.height = 500;

    // register mouse event handlers
    canvas.onmousedown = function(e){ mouse.click = true; };
    canvas.onmouseup = function(e){ mouse.click = false; };
    canvas.onmouseleave = function(e) {mouse.click = false; };

    canvas.onmousemove = function(e) {
        // normalize mouse position to range 0.0 - 1.0
        mouse.pos.x = e.clientX / width;
        mouse.pos.y = e.clientY / height;
        mouse.move = true;
    };

    // draw line received from server
    socket.on('draw_line', function (data) {
        var line = data.line;
        context.beginPath();
        context.moveTo(line[0].x * width, line[0].y * height);
        context.lineTo(line[1].x * width, line[1].y * height);
        context.stroke();
    });

    socket.on('reset_canvas', function(data) {
        context.clearRect(0, 0, canvas.width, canvas.height);
    });

    socket.on('refresh_canvas', function(data) {
        location.reload(true);
    });

    // main loop, running every 25ms
    function mainLoop() {
        // check if the user is drawing
        if (mouse.click && mouse.move && mouse.pos_prev) {
            // send line to to the server
            socket.emit('draw_line', { line: [ mouse.pos, mouse.pos_prev ] });
            mouse.move = false;
        }
        mouse.pos_prev = {x: mouse.pos.x, y: mouse.pos.y};
        setTimeout(mainLoop, 25);
    }
    mainLoop();
});