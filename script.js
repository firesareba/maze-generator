const size = document.getElementById("size");
const size_label = document.getElementById("size-label");
const generation_method = document.getElementById("generation-method");
const canvas = document.getElementById("display")
const drawable_canvas = canvas.getContext("2d");
canvas.width = 450;
canvas.height = drawable_canvas.canvas.width;

var path_maze = []
var visited = 0;
const dir_move = {
    '←':[0, -1],
    '→':[0, 1], 
    '↑':[-1, 0], 
    '↓':[1, 0]
}
const opposite_dir = {
    '←':'→',
    '→':'←',
    '↑':'↓',
    '↓':'↑'
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

generation_method.addEventListener("change", function(e){
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

function get_direction_choices(row, col){
    direction_choices = [];
    if (col-1 >= 0){
        if (path_maze[row][col-1] == " "){
            direction_choices.push('←');
        }
    }
    if (col+1 < size.value){
        if (path_maze[row][col+1] == " "){
            direction_choices.push('→');
        }
    }
    if (row-1 >= 0){
        if (path_maze[row-1][col] == " "){
            direction_choices.push('↑');
        }
    }
    if (row+1 < size.value){
        if (path_maze[row+1][col] == " "){
            direction_choices.push('↓');
        }
    }
    return direction_choices;
}

function dfs(row, col, prev){
    visited += 1;
    if (visited == size.value*size.value){
        path_maze[row][col] = 'O';
        return 0;
    }

    direction_choices = get_direction_choices(row, col);

    while (direction_choices.length > 0){
        direction = direction_choices[Math.floor(Math.random()*direction_choices.length)]
        path_maze[row][col] = direction;
        if (dfs(row+dir_move[direction][0], col+dir_move[direction][1], opposite_dir[direction]) == 0){
            return 0;
        } else {
            direction_choices = get_direction_choices(row, col);
        }
    }
    path_maze[row][col] = prev;
    return -1;
}

function bfs(){
    open_nodes = [[0, 0]];
    while (open_nodes.length > 0){
        choice = Math.floor(Math.random()*open_nodes.length)
        [row, col] = open_nodes[choice];
        open_nodes.splice(choice, 1);

        for (direction of get_direction_choices(row, col)){
            row = row+dir_move[direction][0];
            col = col+dir_move[direction][1];
            if (!myMatrix.some(innerArray => innerArray[0] == row && innerArray[1] == col)){
                open_nodes.push([row, col]);
            }
            row = row-dir_move[direction][0];
            col = col-dir_move[direction][1];
        }
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
    } else if (generation_method.value == "dfs"){
        visited = 0;
        dfs(0, 0, '↑')
    } else if (generation_method.value == "bfs"){

    }
    display_maze()
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