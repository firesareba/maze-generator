//#region access html
const generation_method = document.getElementById("generation-method");

const maze_canvas = document.getElementById("maze")
const drawable_maze_canvas = maze_canvas.getContext("2d");
maze_canvas.width = 2000;
maze_canvas.height = maze_canvas.width;
//#endregion

//#region cookies
drawable_maze_canvas.lineWidth = 2;
drawable_maze_canvas.lineCap = 'round';
//#endregion

//#region globals
const dir_move = {
    0:[0, -1], //'←'
    1:[-1, 0], //'↑'
    2:[0, 1],  //'→'
    3:[1, 0]   //'↓'
    //4 is endpoint
}

let size = 5;

var path_maze = [];

var meet_node;
var meet_node_adj;
var parents = [];

var edge_length;
var offset;
//#endregion

//#region listeners
generation_method.addEventListener("change", function(e){
    generate_maze()
});
//#endregion

generate_maze();

function opposite_dir(direction){
    return (direction+2)%4;
}

function get_direction_choices(row, col){
    direction_choices = [];
    
    for (let direction = 0; direction < 4; direction++){//don't consider endpoint
        row = row+dir_move[direction][0];
        col = col+dir_move[direction][1];
        
        if ((0 <= row && row < size) && (0 <= col && col < size)){
            if (!path_maze[row][col].includes(true) || generation_method.value == 'origin-shift'){
                direction_choices.push(direction)
            }
        }
        
        row = row-dir_move[direction][0];
        col = col-dir_move[direction][1];
    }
    return direction_choices;
}

async function origin_shift(){
    //create base
    for (let row = 0; row<size; row++){
        for (let col = 0; col<size; col++){
            path_maze[row][col][2] = true;
        }
        path_maze[row][size-1][2] = false;
        path_maze[row][size-1][3] = true;
    }
    origin_pos = [size-1, size-1];
    path_maze[origin_pos[0]][origin_pos[1]] = [false, false, false, false, true];

    for (let i = 0; i<size**3; i++){
        display_maze();
        await sleep(100);
        direction_choices = get_direction_choices(origin_pos[0], origin_pos[1])

        direction = direction_choices[Math.floor(Math.random()*direction_choices.length)];

        path_maze[origin_pos[0]][origin_pos[1]] = [false, false, false, false, false];
        path_maze[origin_pos[0]][origin_pos[1]][direction] = true;

        origin_pos = [origin_pos[0]+dir_move[direction][0], origin_pos[1]+dir_move[direction][1]];
        path_maze[origin_pos[0]][origin_pos[1]] = [false, false, false, false, true];
    }
}

async function dfs(row, col){
    //generate Solution
    var stack = [[row, col]];
    while (!(row == size-1 && col == size-1)){
        display_maze();
        await sleep(100);
        [row, col] = stack.pop();
        if (path_maze[row][col].includes(true)){
            path_maze[row][col] = [false, false, false, false, false];
        }

        direction_choices = get_direction_choices(row, col);
        if (direction_choices.length > 0) {
            if (direction_choices.length > 1){
                direction = direction_choices[Math.floor(Math.random()*direction_choices.length)];
            } else{
                direction = direction_choices[0];
            }
            stack.push([row, col]);
            path_maze[row][col][direction] = true;
            row += dir_move[direction][0];
            col += dir_move[direction][1];
            stack.push([row, col])
        } else {
            path_maze[row][col][4] = true;
        }
    }

    //Reset non-solution path visited(endnodes)
    for (let row = 0; row < size; row++){
        for (let col = 0; col < size; col++){
            path_maze[row][col][4] = false;
        }    
    }
    path_maze[row][col][4] = true;//except for ending

    //Check for open
    rows_to_check = [];
    for (let i = 0; i < size; i++){
        rows_to_check.push(i);
    }
    
    while (rows_to_check.length > 0){
        check_row = rows_to_check.splice(Math.floor(Math.random()*rows_to_check.length), 1)[0];

        cols_to_check = [];
        for (let i = 0; i < size; i++){
            cols_to_check.push(i);
        }
        while (cols_to_check.length > 0){
            check_col = cols_to_check.splice(Math.floor(Math.random()*cols_to_check.length), 1)[0];

            if (get_direction_choices(check_row, check_col).length > 0 && path_maze[check_row][check_col].includes(true)){
                var stack = [[check_row,check_col]];
                while (stack.length > 0){
                    [row, col] = stack.pop();
                    while (true){
                        display_maze();
                        await sleep(100);
                        direction_choices = get_direction_choices(row, col);
                        if (direction_choices.length > 0) {
                            if (direction_choices.length > 1){
                                stack.push([row, col]);
                                direction = direction_choices[Math.floor(Math.random()*direction_choices.length)]
                            } else{
                                direction = direction_choices[0];
                            }
                            path_maze[row][col][direction] = true;
                            row += dir_move[direction][0];
                            col += dir_move[direction][1];
                        } else {
                            path_maze[row][col][4] = true;
                            break;
                        }
                    }
                }
            }
        }    
    }
}

async function hunt_and_kill(){
    var open_nodes = [[0, 0]];
    var backup_nodes = [];
    while (open_nodes.length + backup_nodes.length > 0){ 
        display_maze();
        await sleep(100);
        
        if (open_nodes.length > 0){
            [row, col] = open_nodes.shift();
        } else {
            [row, col] = backup_nodes.shift();
        }

        direction_choices = get_direction_choices(row, col)

        if (direction_choices.length > 0){
            if (direction_choices.length > 1){
                backup_nodes.push([row, col])

                direction = direction_choices[Math.floor(Math.random()*direction_choices.length)];
                path_maze[row][col][direction] = true;
        
                row = row+dir_move[direction][0];
                col = col+dir_move[direction][1];
                open_nodes.push([row, col])
            } else {
                direction = direction_choices[0];
                path_maze[row][col][direction] = true;
        
                row = row+dir_move[direction][0];
                col = col+dir_move[direction][1];
                open_nodes.push([row, col]);
            }
        } else if (!path_maze[row][col].includes(true)){
            path_maze[row][col][4] = true;
        }
    }
}

function make_bidirectional(){
    for (let row=0; row<path_maze.length; row++){
        for (let col=0; col<path_maze.length; col++){
            for (let direction = 0; direction < 4; direction++){
                if (path_maze[row][col][direction]){
                    path_maze[row+dir_move[direction][0]][col+dir_move[direction][1]][opposite_dir(direction)] = true;
                }
            }
        }
    }
}

function reset_all(){
    console.clear();
    edge_length = maze_canvas.width/size
    offset = edge_length/2;
    path_maze = [];
    parents = [];
    for (let row=0; row<size; row++){
        path_maze.push([]);
        parents.push([]);
        for (let col=0; col<size; col++){
            path_maze[row].push([false, false, false, false, false]);
            parents[row].push([]);
        }
    }

    drawable_maze_canvas.clearRect(0, 0, maze_canvas.width, maze_canvas.height);
    drawable_maze_canvas.fillStyle = "darkgoldenrod";
    drawable_maze_canvas.fillRect(0, 0, maze_canvas.width, maze_canvas.height);
}

async function generate_maze(){
    reset_all();

    if (generation_method.value == "origin-shift"){
        await origin_shift()
    } else if (generation_method.value == "dfs"){
       await dfs(0, 0)
        path_maze[0][0][1] = false;
    } else if (generation_method.value == "hunt-and-kill"){
        await hunt_and_kill();
    }

    make_bidirectional();

    path_maze[0][0][1] = true;
    path_maze[size-1][size-1][3] = true;
    display_maze();
    console.log("done")
}

function sleep(ms){
    return new Promise(resolve => setTimeout(resolve, ms));
}

function display_maze(){
    // maze_canvas.style.height = `${Math.max(600, size*10)}px`

    //filled walls
    edge_length = maze_canvas.width/size;

    for (let row = 0; row<=size; row++){
        draw_line(0, edge_length*row, maze_canvas.width, edge_length*row, 'base');
    }
    for (let col = 0; col<=size; col++){
        draw_line(edge_length*col, 0, edge_length*col, maze_canvas.width, 'base');
    }

    //remove walls for path
    for (let row = 0; row<size; row++){
        for (let col = 0; col<size; col++){
            direction_booleans = path_maze[row][col];
            
            for (let direction = 0; direction < 4; direction++){
                if (!direction_booleans[direction]){
                    continue;
                }

                y = (row*edge_length)+(edge_length/2);
                x = (col*edge_length)+(edge_length/2);
                if (dir_move[direction][0] == 0){//y doesn't change
                    x = x+(dir_move[direction][1]*edge_length/2)
                    draw_line(x, y-(edge_length/2)+drawable_maze_canvas.lineWidth, x, y+(edge_length/2)-drawable_maze_canvas.lineWidth, 'remove');
                } else {
                    y = y+(dir_move[direction][0]*edge_length/2)
                    draw_line(x-(edge_length/2)+drawable_maze_canvas.lineWidth, y, x+(edge_length/2)-drawable_maze_canvas.lineWidth, y, 'remove');
                }
            }
        }
    }
}

function draw_line(x1, y1, x2, y2, type) {
    if (type == 'remove'){
        curr_canvas = drawable_maze_canvas;
        curr_canvas.lineWidth = curr_canvas.lineWidth+1;
        curr_canvas.strokeStyle = 'darkgoldenrod';
    } else if (type == 'base'){
        curr_canvas = drawable_maze_canvas;
        curr_canvas.strokeStyle = 'black';
    }
    curr_canvas.beginPath();
    curr_canvas.moveTo(x1, y1);
    curr_canvas.lineTo(x2, y2);
    curr_canvas.stroke();
    if (type == 'remove'){
        curr_canvas.lineWidth = curr_canvas.lineWidth-1;
    }
}
