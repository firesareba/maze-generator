//#region access html
const generation_method = document.getElementById("generation-method");
const stopwatch = document.getElementById("stopwatch")
const size = document.getElementById("size");
const size_label = document.getElementById("size-label");
const download_button = document.getElementById("download-button");
const solve_checkbox = document.getElementById("solve-checkbox");
const blind_checkbox = document.getElementById("blind-checkbox");

const maze_canvas = document.getElementById("maze")
const drawable_maze_canvas = maze_canvas.getContext("2d");
const user_canvas = document.getElementById("user")
const drawable_user_canvas = user_canvas.getContext("2d");
const solution_canvas = document.getElementById("solution")
const drawable_solution_canvas = solution_canvas.getContext("2d");
const blind_canvas = document.getElementById("blind")
const drawable_blind_canvas = blind_canvas.getContext("2d");
maze_canvas.width = 2000;
maze_canvas.height = maze_canvas.width;
user_canvas.width = 2000;
user_canvas.height = user_canvas.width;
blind_canvas.width = 2000;
blind_canvas.height = blind_canvas.width;
solution_canvas.width = 2000;
solution_canvas.height = solution_canvas.width;
//#endregion

//#region cookies
size.value = 5;
size_label.innerHTML = "Size: "+ size.value;
solve_checkbox.checked = false;
blind_checkbox.checked = true;
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


var path_maze = [];

var meet_node;
var meet_node_adj;
var parents = [];

var user_pos = [0, 0];
var user_visited = []
var time = 0;
var edge_length;
var offset;
var stopwatch_interval;
//#endregion

//#region listeners
size.addEventListener("input", function(e){
    size_label.innerHTML = "Size: "+ size.value;
});

size.addEventListener("change", function(e){
    generate_maze()
});

generation_method.addEventListener("change", function(e){
    generate_maze()
});

solve_checkbox.addEventListener("change", function(e){
    if (solve_checkbox.checked){
        solution_canvas.style.opacity = '100%';
    } else {
        solution_canvas.style.opacity = '0%';
    }
});

blind_checkbox.addEventListener("change", function(e){
    if (blind_checkbox.checked){
        blind_canvas.style.opacity = '100%';
    } else {
        blind_canvas.style.opacity = '0%';
    }
});

download_button.addEventListener("click", function(e){
    var dataURL = maze_canvas.toDataURL("image/jpeg", 1.0);

    var a = document.createElement('a');
    a.href = dataURL;
    a.download = 'maze.jpeg';
    document.body.appendChild(a);
    a.click();
});

document.onkeydown = function(event){
    if (user_pos[0] == size.value){
        return;
    }
    if (37 <= event.keyCode && event.keyCode <= 40){
        event.preventDefault();
        direction = event.keyCode-37;
        new_pos =  [user_pos[0] + dir_move[direction][0], user_pos[1] + dir_move[direction][1]];
        if (path_maze[user_pos[0]][user_pos[1]][direction] && (0 <= new_pos[0] && new_pos[0] < size.value)){
            if (user_visited[new_pos[0]][new_pos[1]]){
                draw_line(offset + (edge_length*new_pos[1]), offset + (edge_length*new_pos[0]), offset + (edge_length*user_pos[1]), offset + (edge_length*user_pos[0]), 'remove_user');
                user_visited[user_pos[0]][user_pos[1]] = false;
            } else {
                draw_line(offset + (edge_length*new_pos[1]), offset + (edge_length*new_pos[0]), offset + (edge_length*user_pos[1]), offset + (edge_length*user_pos[0]), 'user');
                user_visited[user_pos[0]][user_pos[1]] = true;
            }
            user_pos = new_pos;
            if (user_pos[0] == size.value-1 && user_pos[1] == size.value-1){
                clearInterval(stopwatch_interval);
                stopwatch.innerHTML = "Final Time: "+stopwatch.innerHTML;
                blind_checkbox.checked = false;
                blind_canvas.style.opacity = '0%';
                alert("You solved it!");
            } else if (time == 0){
                stopwatch_interval = setInterval(function () {
                    time += 1;
                    temp_time = time;
                    stopwatch.innerHTML = "."+(temp_time%100)+" secs";
                    temp_time = Math.floor(temp_time/100);
                    if (temp_time > 0){
                        stopwatch.innerHTML = (temp_time%60)+stopwatch.innerHTML;
                        temp_time = Math.floor(temp_time/60);
                        if (temp_time > 0){
                            stopwatch.innerHTML = (temp_time%60)+" mins, "+stopwatch.innerHTML;
                            temp_time = Math.floor(temp_time/60);
                            if (temp_time > 0){
                                stopwatch.innerHTML = temp_time+"hrs, "+stopwatch.innerHTML;
                            }
                        }
                    }
                }, 10)
                
            }
            clear_user_circle();
        }
    }
};
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
        
        if ((0 <= row && row < size.value) && (0 <= col && col < size.value)){
            if (!path_maze[row][col].includes(true) || generation_method.value == 'origin-shift'){
                direction_choices.push(direction)
            }
        }
        
        row = row-dir_move[direction][0];
        col = col-dir_move[direction][1];
    }
    return direction_choices;
}

function origin_shift(){
    //create base
    for (let row = 0; row<size.value; row++){
        for (let col = 0; col<size.value; col++){
            path_maze[row][col][2] = true;
        }
        path_maze[row][size.value-1][2] = false;
        path_maze[row][size.value-1][3] = true;
    }
    origin_pos = [size.value-1, size.value-1];
    path_maze[origin_pos[0]][origin_pos[1]] = [false, false, false, false, true];

    for (let i = 0; i<size.value**3; i++){
        direction_choices = get_direction_choices(origin_pos[0], origin_pos[1])

        direction = direction_choices[Math.floor(Math.random()*direction_choices.length)];

        path_maze[origin_pos[0]][origin_pos[1]] = [false, false, false, false, false];
        path_maze[origin_pos[0]][origin_pos[1]][direction] = true;

        origin_pos = [origin_pos[0]+dir_move[direction][0], origin_pos[1]+dir_move[direction][1]];
        path_maze[origin_pos[0]][origin_pos[1]] = [false, false, false, false, true];
    }
}

function dfs(row, col){
    //generate Solution
    var stack = [[0,0]];
    while (!(row == size.value-1 && col == size.value-1)){
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
    for (let row = 0; row < size.value; row++){
        for (let col = 0; col < size.value; col++){
            path_maze[row][col][4] = false;
        }    
    }
    path_maze[row][col][4] = true;//except for ending


    //Check for open
    rows_to_check = [];
    for (let i = 0; i < size.value; i++){
        rows_to_check.push(i);
    }
    
    while (rows_to_check.length > 0){
        check_row = rows_to_check.splice(Math.floor(Math.random()*rows_to_check.length), 1)[0];

        cols_to_check = [];
        for (let i = 0; i < size.value; i++){
            cols_to_check.push(i);
        }
        while (cols_to_check.length > 0){
            check_col = cols_to_check.splice(Math.floor(Math.random()*cols_to_check.length), 1)[0];

            if (get_direction_choices(check_row, check_col).length > 0 && path_maze[check_row][check_col].includes(true)){
                var stack = [[check_row,check_col]];
                while (stack.length > 0){
                    [row, col] = stack.pop();
                    while (true){
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

function hunt_and_kill(){
    var open_nodes = [[0, 0]];
    var backup_nodes = [];
    while (open_nodes.length + backup_nodes.length > 0){ 
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

function dsu(){
    groups = [];
    for (let row=0; row<size.value; row++){
        groups.push([]);
        for (let col=0; col<size.value; col++){
            groups[row].push(0);
        }
    }

    let unvisited = []
    for (let row = 0; row<size.value-1; row++){
        for (let col = 0; col<size.value-1; col++){
            unvisited.push([row, col]);
        }
    }

    while (unvisited.length > 0){
        let [start_r, start_c] = unvisited.splice(Math.floor(Math.random()*unvisited.length), 1);
        let [end_r, end_c] = unvisited.splice(Math.floor(Math.random()*unvisited.length), 1);
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
    edge_length = maze_canvas.width/size.value
    offset = edge_length/2;
    path_maze = [];
    parents = [];
    user_visited = [];
    user_pos = [0, 0];
    time = 0;
    solve_checkbox.checked = false;
    solution_canvas.style.opacity = '0%';
    blind_checkbox.checked = true;
    blind_canvas.style.opacity = '100%';
    stopwatch.innerHTML = "00.00 sec"
    for (let row=0; row<size.value; row++){
        path_maze.push([]);
        parents.push([]);
        user_visited.push([]);
        for (let col=0; col<size.value; col++){
            path_maze[row].push([false, false, false, false, false]);
            parents[row].push([]);
            user_visited[row].push(false);
        }
    }

    drawable_maze_canvas.clearRect(0, 0, maze_canvas.width, maze_canvas.height);
    drawable_maze_canvas.fillStyle = "darkgoldenrod";
    drawable_maze_canvas.fillRect(0, 0, maze_canvas.width, maze_canvas.height);
    drawable_user_canvas.clearRect(0, 0, user_canvas.width, user_canvas.height);
    clear_user_circle();
    drawable_solution_canvas.clearRect(0, 0, solution_canvas.width, solution_canvas.height);
}

function generate_maze(){
    reset_all();

    if (generation_method.value == "origin-shift"){
        origin_shift()
    } else if (generation_method.value == "dfs"){
        dfs(0, 0, 1)
        path_maze[0][0][1] = false;
    } else if (generation_method.value == "hunt-and-kill"){
        hunt_and_kill()
    }
    else if (generation_method.value == "dsu"){
        dsu()
    }

    make_bidirectional();
    solve();
    display_solve();

    path_maze[0][0][1] = true;
    path_maze[size.value-1][size.value-1][3] = true;
    display_maze()
}

function clear_user_circle(){
    drawable_blind_canvas.save();
    drawable_blind_canvas.fillRect(0, 0, blind_canvas.width, blind_canvas.height);
    drawable_blind_canvas.beginPath();
    drawable_blind_canvas.arc(offset + (edge_length*user_pos[1]), offset + (edge_length*user_pos[0]), edge_length*3, 0, Math.PI * 2);
    drawable_blind_canvas.clip();
    drawable_blind_canvas.clearRect(0, 0, blind_canvas.width, blind_canvas.height);
    drawable_blind_canvas.restore();
}

function solve(){
    s_queue = [[0, 0]];
    f_queue = [[size.value-1, size.value-1]];
    
    while (s_queue.length > 0){
        var [s_row, s_col] = s_queue.shift();
        var [f_row, f_col] = f_queue.shift();
        
        for (let direction = 0; direction < 4; direction++){
            if (path_maze[s_row][s_col][direction]){
                child_row = s_row + dir_move[direction][0];
                child_col = s_col + dir_move[direction][1];
                
                
                if (parents[child_row][child_col].length == 0 && !(child_row == 0 && child_col == 0)){
                    s_queue.push([child_row, child_col]);
                    parents[child_row][child_col] = [s_row, s_col, 's'];
                }else if (parents[child_row][child_col][2] == 'f'){
                    meet_node = [child_row, child_col];
                    meet_node_adj = [s_row, s_col]
                    return;
                }
            }
            
            if (path_maze[f_row][f_col][direction]){
                child_row = f_row + dir_move[direction][0];
                child_col = f_col + dir_move[direction][1];
                
                
                if (parents[child_row][child_col].length == 0 && !(child_row == size.value-1 && child_col == size.value-1)){
                    f_queue.push([child_row, child_col]);
                    parents[child_row][child_col] = [f_row, f_col, 'f'];
                } else if (parents[child_row][child_col][2] == 's'){
                    meet_node = [child_row, child_col];
                    meet_node_adj = [f_row, f_col]
                    return;
                }
            }
        }
    }
    
}

function display_solve(){
    [row, col] = meet_node;
    while (parents[row][col].length == 3){
        [parent_row, parent_col] = parents[row][col];
        draw_line(offset + (edge_length*col), offset + (edge_length*row), offset + (edge_length*parent_col), offset + (edge_length*parent_row), 'solve');
        [row, col] = [parent_row, parent_col];
    }
    
    [row, col] = meet_node_adj;
    while (parents[row][col].length == 3){
        [parent_row, parent_col] = parents[row][col];
        draw_line(offset + (edge_length*col), offset + (edge_length*row), offset + (edge_length*parent_col), offset + (edge_length*parent_row), 'solve');
        [row, col] = [parent_row, parent_col];
    }
    
    draw_line(offset + (edge_length*meet_node[1]), offset + (edge_length*meet_node[0]), offset + (edge_length*meet_node_adj[1]), offset + (edge_length*meet_node_adj[0]), 'solve');
}

function display_maze(){
    // maze_canvas.style.height = `${Math.max(600, size.value*10)}px`

    //filled walls
    edge_length = maze_canvas.width/size.value;

    for (let row = 0; row<=size.value; row++){
        draw_line(0, edge_length*row, maze_canvas.width, edge_length*row, 'base');
    }
    for (let col = 0; col<=size.value; col++){
        draw_line(edge_length*col, 0, edge_length*col, maze_canvas.width, 'base');
    }

    //remove walls for path
    for (let row = 0; row<size.value; row++){
        for (let col = 0; col<size.value; col++){
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
    } else if (type == 'solve'){
        curr_canvas = drawable_solution_canvas;
        curr_canvas.strokeStyle = 'rgb(0, 255, 0)';
    } else if (type == 'user'){
        curr_canvas = drawable_user_canvas;
        curr_canvas.strokeStyle = 'indigo';
    } else if (type == 'remove_user'){
        curr_canvas = drawable_user_canvas;
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
    if (type == 'remove' || type == 'remove_user'){
        curr_canvas.lineWidth = curr_canvas.lineWidth-1;
    }
}
