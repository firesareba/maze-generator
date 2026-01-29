//#region access html
const generation_method = document.getElementById("generation-method");

const description = document.getElementById("description");
const description_title = document.getElementById("description-title");
const maze_canvas = document.getElementById("simulation-maze")
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

let size = 10;

var active = [false, false, false]; //dfs, hunt, origin

var path_maze = [];

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

async function dfs(row, col){
    //generate Solution
    var stack = [[row, col]];
    while (!(row == size-1 && col == size-1)){
        if (generation_method.value != "dfs"){
            return;
        }
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
                        if (generation_method.value != "dfs"){
                            return;
                        }
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
        if (generation_method.value != "hunt-and-kill"){
            return;
        }
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
        if (generation_method.value != "origin-shift"){
            return;
        }
        display_maze();
        await sleep(10);
        direction_choices = get_direction_choices(origin_pos[0], origin_pos[1])

        direction = direction_choices[Math.floor(Math.random()*direction_choices.length)];

        path_maze[origin_pos[0]][origin_pos[1]] = [false, false, false, false, false];
        path_maze[origin_pos[0]][origin_pos[1]][direction] = true;

        origin_pos = [origin_pos[0]+dir_move[direction][0], origin_pos[1]+dir_move[direction][1]];
        path_maze[origin_pos[0]][origin_pos[1]] = [false, false, false, false, true];
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
    for (let row=0; row<size; row++){
        path_maze.push([]);
        for (let col=0; col<size; col++){
            path_maze[row].push([false, false, false, false, false]);
        }
    }

    drawable_maze_canvas.clearRect(0, 0, maze_canvas.width, maze_canvas.height);
    drawable_maze_canvas.fillStyle = "black";
    drawable_maze_canvas.fillRect(0, 0, maze_canvas.width, maze_canvas.height);
}

async function generate_maze(){
    while (active.includes(true)){
        continue;
    }

    reset_all();

    if (generation_method.value == "dfs"){
        description_title.innerHTML = "Depth First Search (DFS)";
        description.innerHTML = "For Depth First Search (DFS), we first generate the solution path. To do this, we start at 0, 0, and then go randomly to neighbors until we get stuck. Being stuck means that all neighbors are visited. Then we go to a random neighbor, and update it's direction so it is visited from the stuck node, not wherever it was before. We do this until we get to the end of the maze. Then we reset everything that isn't on the solution path. After this, we go to each cell in a random order, and check if it has unvisited neighbors. If yes, perform dfs same algorithm as before UNTIL STUCK, then abandon. If you do this for all possible cells, you get a full maze.";
        active[0] = true;
        await dfs(0, 0)
        path_maze[0][0][1] = false;
        active[0] = false;
    } else if (generation_method.value == "hunt-and-kill"){
        description_title.innerHTML = "Hunt and Kill";
        description.innerHTML = "Similar to DFS, we start at 0, 0, and then go randomly to neighbors until we get stuck. Being stuck means that all neighbors are visited. While traversing, we are keeping track of each cell that is still open. Being open means it still has at least one unvisited neighbor. Once stuck, we go to a random open node and check if it is still open. If so, we start hunt and kill again from this node. Once their are no open nodes left, the entire maze has been traversed.";
        active[1] = true;
        await hunt_and_kill();
        active[1] = false;
    }else if (generation_method.value == "origin-shift"){
        description_title.innerHTML = "Origin Shift";
        description.innerHTML = "We pre-generate a perfect maze with each row open and the last column open. we set all rows pointing to the right and the last colum pointing down, with the bottom right beign the origin. We then move the origin randomly to it's 4 neighbors n^3 times where n is the size of the maze. This ensures the entire maze will be sufficiently scrambled. When the origin moves, it moves the arrows to point to the new origin, thus adding/breaking walls.";
        active[2] = true;
        await origin_shift()
        active[2] = false;
    }

    make_bidirectional();

    path_maze[0][0][1] = true;
    path_maze[size-1][size-1][3] = true;
    display_maze();
    console.log(active);
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
        curr_canvas.strokeStyle = 'black';
    } else if (type == 'base'){
        curr_canvas = drawable_maze_canvas;
        curr_canvas.strokeStyle = 'antiquewhite';
    }
    curr_canvas.beginPath();
    curr_canvas.moveTo(x1, y1);
    curr_canvas.lineTo(x2, y2);
    curr_canvas.stroke();
    if (type == 'remove'){
        curr_canvas.lineWidth = curr_canvas.lineWidth-1;
    }
}
