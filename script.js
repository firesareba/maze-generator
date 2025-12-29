const size = document.getElementById("size");
const size_label = document.getElementById("size-label");
const generation_method = document.getElementById("generation-method");
const canvas = document.getElementById("display")
const drawable_canvas = canvas.getContext("2d");
canvas.width = 450;
canvas.height = drawable_canvas.canvas.width;

var maze = []
const canvas_rect = canvas.getBoundingClientRect();
size.value = 20;//git cookies annoying
generate_maze()
console.log(size.value);
console.log(maze);

size.addEventListener("input", function(e){
    size_label.innerHTML = "Size: "+ size.value;
});

size.addEventListener("change", function(e){
    generate_maze()
    console.log(size.value);
    console.log(maze);
});

function origin_shift(){
    //create base
    for (let x = 0; x<maze.length; x++){
        for (let y = 0; y<maze.length; y++){//maze.length = maze[0].length
            maze[x][y] = '→';
        }
        maze[x][maze.length-1] = '↓';
    }
    origin_pos = [maze.length-1, maze.length-1];
    maze[origin_pos[0]][origin_pos[1]] = 'O';


    dir_move = {
        '←':[-1, 0],
        '→':[1, 0], 
        '↑':[0, -1], 
        '↓':[0, 1]
    }

    for (let i = 0; i<1000; i++){
        direction_choices = [];
        if (origin_pos[0]-1 > 0){
            direction_choices.push('←');
        }
        if (origin_pos[0]+1 < maze.length){
            direction_choices.push('→');
        }
        if (origin_pos[1]-1 > 0){
            direction_choices.push('↑');
        }
        if (origin_pos[1]+1 < maze.length){
            direction_choices.push('↓');
        }

        direction = direction_choices[Math.floor(Math.random()*direction_choices.length)];
        maze[origin_pos[0]][origin_pos[1]] = direction;
        origin_pos = [origin_pos[0]+dir_move[direction][0], origin_pos[1]+dir_move[direction][1]];
        maze[origin_pos[0]][origin_pos[1]] = 'O';
    }
}

function generate_maze(){
    maze = [];
    for (let x=0; x<size.value; x++){
        maze.push([]);
        for (let y=0; y<size.value; y++){
            maze[x].push(" ");
        }
    }
    if (generation_method.value == "origin-shift"){
        origin_shift()
        display_maze()
    }
}

function display_maze(){
    draw_line(0, 0, 450, 450)
}

function draw_line(x1, y1, x2, y2) {
    const canvas_rect = canvas.getBoundingClientRect();
    x1 = x1;
    y1 = y1;
    x2 = x2;
    y2 = y2;

    drawable_canvas.beginPath();
    drawable_canvas.lineWidth = 5;
    drawable_canvas.strokeStyle = "antiquewhite";
    drawable_canvas.moveTo(x1, y1);
    drawable_canvas.lineTo(x2, y2);
    drawable_canvas.stroke();
}