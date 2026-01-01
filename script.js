const size = document.getElementById("size");
const size_label = document.getElementById("size-label");
const generation_method = document.getElementById("generation-method");
const canvas = document.getElementById("display")
const drawable_canvas = canvas.getContext("2d");
canvas.width = 1000;
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
size.value = 4;//git cookies annoying
drawable_canvas.lineWidth = 1;
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

    for (let i = 0; i<size.value**3; i++){
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

    for (direction of '←→↑↓'){
        row = row+dir_move[direction][0];
        col = col+dir_move[direction][1];
        
        if ((0 <= row && row < size.value) && (0 <= col && col < size.value)){
            if (path_maze[row][col] == ""){
                direction_choices.push(direction)
            }
        }

        row = row-dir_move[direction][0];
        col = col-dir_move[direction][1];
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

function gen_3(){
    var open_nodes = [[0, 0]];
    var backup_nodes = [];
    while (open_nodes.length + backup_nodes.length > 0){ 
        if (open_nodes.length > 0){
            row = open_nodes[0][0];
            col = open_nodes[0][1];
            open_nodes.shift();
        } else {
            row = backup_nodes[0][0];
            col = backup_nodes[0][1];
            backup_nodes.shift();
        }

        direction_choices = get_direction_choices(row, col)

        if (direction_choices.length > 0){
            if (direction_choices.length > 1){
                backup_nodes.push([row, col])

                direction = direction_choices[Math.floor(Math.random()*direction_choices.length)];
                path_maze[row][col] = path_maze[row][col]+direction;
        
                row = row+dir_move[direction][0];
                col = col+dir_move[direction][1];
                open_nodes.push([row, col])
            } else {
                direction = direction_choices[0];
                path_maze[row][col] = path_maze[row][col]+direction;
        
                row = row+dir_move[direction][0];
                col = col+dir_move[direction][1];
                open_nodes.push([row, col])
            }
        } else if (path_maze[row][col] == ""){
            path_maze[row][col] = 'O';
        }
    }
}

function generate_maze(){
    console.clear();
    path_maze = [];
    for (let row=0; row<size.value; row++){
        path_maze.push([]);
        for (let col=0; col<size.value; col++){
            path_maze[row].push("");
        }
    }

    visited = 0;
    if (generation_method.value == "origin-shift"){
        origin_shift()
    } else if (generation_method.value == "dfs"){
        dfs(0, 0, '↑')
    } else if (generation_method.value == "gen-3"){
        gen_3()
    }
    display_maze()
}

function display_maze(){
    drawable_canvas.clearRect(0, 0, canvas.width, canvas.height);

    //filled walls
    edge_length = canvas.width/size.value;

    for (let row = 0; row<=size.value; row++){
        draw_line(0, edge_length*row, canvas.width, edge_length*row, false);
    }
    for (let col = 0; col<=size.value; col++){
        draw_line(edge_length*col, 0, edge_length*col, canvas.width, false);
    }

    //remove walls for path
    for (let row = 0; row<size.value; row++){
        for (let col = 0; col<size.value; col++){
            children = path_maze[row][col];
            if (children == 'O'){
                continue;
            }

            for (let direction of children){
                y = (row*edge_length)+(edge_length/2);
                x = (col*edge_length)+(edge_length/2);
                if (dir_move[direction][0] == 0){//y doesn't change
                    x = x+(dir_move[direction][1]*edge_length/2)
                    draw_line(x, y-(edge_length/2)+drawable_canvas.lineWidth, x, y+(edge_length/2)-drawable_canvas.lineWidth, true);
                } else {
                    y = y+(dir_move[direction][0]*edge_length/2)
                    draw_line(x-(edge_length/2)+drawable_canvas.lineWidth, y, x+(edge_length/2)-drawable_canvas.lineWidth, y, true);
                }
            }
        }
    }
}

function draw_line(x1, y1, x2, y2, remove) {
    if (remove == true){
        var x;
        var y;
        var rect_width;
        var rect_height;
        if (x1 == x2){
            x = Math.min(x1, x2)-(drawable_canvas.width/2);
            y = Math.min(y1, y2);
            rect_width = drawable_canvas.width;
            rect_height = Math.max(x1, x2) - Math.min(x1, x2);
        } else {
            x = Math.min(x1, x2);
            y = Math.min(y1, y2)-(drawable_canvas.width/2);
            rect_width = Math.max(x1, x2) - Math.min(x1, x2);
            rect_height = drawable_canvas.width;
        }
        drawable_canvas.clearRect(x, y, rect_width, rect_height);
    } else {
        drawable_canvas.beginPath();
        drawable_canvas.strokeStyle = 'antiquewhite';
        drawable_canvas.moveTo(x1, y1);
        drawable_canvas.lineTo(x2, y2);
        drawable_canvas.stroke();
    }
}