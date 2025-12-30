const size = document.getElementById("size");
const size_label = document.getElementById("size-label");
const generation_method = document.getElementById("generation-method");
const canvas = document.getElementById("display")
const drawable_canvas = canvas.getContext("2d");
canvas.width = 450;
canvas.height = drawable_canvas.canvas.width;

var path_maze = []
const dir_move = {
    '←':[0, -1],
    '→':[0, 1], 
    '↑':[-1, 0], 
    '↓':[1, 0]
}
const canvas_rect = canvas.getBoundingClientRect();
size.value = 20;//git cookies annoying
drawable_canvas.lineWidth = 2;
generate_maze()



size.addEventListener("input", function(e){
    size_label.innerHTML = "Size: "+ size.value;
});

size.addEventListener("change", function(e){
    generate_maze()
});



function origin_shift(){
    //create base
    for (let row = 0; row<size.value; row++){
        for (let col = 0; col<size.value; col++){
            path_maze[row][col] = '→';
        }
        path_maze[row][size.value-1] = '↓';
    }
    origin_pos = [size.value-1, size.value-1];
    path_maze[origin_pos[0]][origin_pos[1]] = 'O';

    for (let i = 0; i<100000; i++){
        direction_choices = [];
        if (origin_pos[1]-1 >= 0){
            direction_choices.push('←');
        }
        if (origin_pos[1]+1 < size.value){
            direction_choices.push('→');
        }
        if (origin_pos[0]-1 >= 0){
            direction_choices.push('↑');
        }
        if (origin_pos[0]+1 < size.value){
            direction_choices.push('↓');
        }

        direction = direction_choices[Math.floor(Math.random()*direction_choices.length)];
        path_maze[origin_pos[0]][origin_pos[1]] = direction;
        origin_pos = [origin_pos[0]+dir_move[direction][0], origin_pos[1]+dir_move[direction][1]];
        path_maze[origin_pos[0]][origin_pos[1]] = 'O';
    }
}

function generate_maze(){
    path_maze = [];
    for (let row=0; row<size.value; row++){
        path_maze.push([]);
        for (let col=0; col<size.value; col++){
            path_maze[row].push(" ");
        }
    }
    if (generation_method.value == "origin-shift"){
        origin_shift()
        display_maze()
    }
}

function display_maze(){
    drawable_canvas.clearRect(0, 0, canvas.width, canvas.height);

    //filled walls
    edge_length = canvas.width/size.value;

    for (let row = 0; row<=size.value; row++){
        draw_line(0, edge_length*row, 450, edge_length*row, "antiquewhite");
    }
    for (let col = 0; col<=size.value; col++){
        draw_line(edge_length*col, 0, edge_length*col, 450, "antiquewhite");
    }

    //remove walls for path
    for (let row = 0; row<size.value; row++){
        for (let col = 0; col<size.value; col++){
            direction = path_maze[row][col];
            if (direction == 'O'){
                continue;
            }

            y = (row*edge_length)+(edge_length/2);
            x = (col*edge_length)+(edge_length/2);
            if (dir_move[direction][0] == 0){//y doesn't change
                x = x+(dir_move[direction][1]*edge_length/2)
                draw_line(x, y-(edge_length/2)+drawable_canvas.lineWidth, x, y+(edge_length/2)-drawable_canvas.lineWidth, "black");
            } else {
                y = y+(dir_move[direction][0]*edge_length/2)
                draw_line(x-(edge_length/2)+drawable_canvas.lineWidth, y, x+(edge_length/2)-drawable_canvas.lineWidth, y, "black");
            }
        }
    }
}

function draw_line(x1, y1, x2, y2, color) {
    x1 = x1;
    y1 = y1;
    x2 = x2;
    y2 = y2;

    drawable_canvas.beginPath();
    drawable_canvas.strokeStyle = color;
    drawable_canvas.moveTo(x1, y1);
    drawable_canvas.lineTo(x2, y2);
    drawable_canvas.stroke();
}