const generation_method = document.getElementById("generation-method");
const size = document.getElementById("size");
const size_label = document.getElementById("size-label");
const solve_checkbox = document.getElementById("solve-checkbox");
const solve_label = document.getElementById("solve-label");
const canvas = document.getElementById("display")
const drawable_canvas = canvas.getContext("2d");
canvas.width = 2000;
canvas.height = canvas.width;

const dir_move = {
    0:[0, -1], //'←'
    1:[-1, 0], //'↑'
    2:[0, 1],  //'→'
    3:[1, 0]   //'↓'
    //4 is endpoint
}

size.value = 13;//git cookies annoying
size_label.innerHTML = "Size: "+ size.value;
solve_checkbox.checked = false;
drawable_canvas.lineWidth = 2;
drawable_canvas.lineCap = 'round';

var path_maze = []

var meet_node;
var meet_node_adj;
var parents = [];

var user_pos = [0, 0];
var visited = []
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

solve_checkbox.addEventListener("change", function(e){
    display_solve();
});

document.onkeydown = function(event){
    if (user_pos[0] == size.value){
        return;
    }
    edge_length = canvas.width/size.value
    offset = edge_length/2;
    if (37 <= event.keyCode && event.keyCode <= 40){
        event.preventDefault();
        direction = event.keyCode-37;
        new_pos =  [user_pos[0] + dir_move[direction][0], user_pos[1] + dir_move[direction][1]];
        if (path_maze[user_pos[0]][user_pos[1]][direction] && (0 <= new_pos[0] && new_pos[0] < size.value)){
            if (visited[new_pos[0]][new_pos[1]]){
                draw_line(offset + (edge_length*new_pos[1]), offset + (edge_length*new_pos[0]), offset + (edge_length*user_pos[1]), offset + (edge_length*user_pos[0]), 'remove');
                visited[user_pos[0]][user_pos[1]] = false;
            } else {
                draw_line(offset + (edge_length*new_pos[1]), offset + (edge_length*new_pos[0]), offset + (edge_length*user_pos[1]), offset + (edge_length*user_pos[0]), 'user');
                visited[user_pos[0]][user_pos[1]] = true;
            }
            user_pos = new_pos;
            if (user_pos[0] == size.value-1 && user_pos[1] == size.value-1){
                alert("You solved it!");
            }
        } else {
        }
    }
};


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
                open_nodes.push([row, col])
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

function generate_maze(){
    console.clear();
    path_maze = [];
    parents = [];
    visited = [];
    user_pos = [0, 0];
    solve_checkbox.checked = false;
    edge_length = canvas.width/size.value
    offset = edge_length/2;

    for (let row=0; row<size.value; row++){
        path_maze.push([]);
        parents.push([]);
        visited.push([]);
        for (let col=0; col<size.value; col++){
            path_maze[row].push([false, false, false, false, false]);
            parents[row].push([]);
            visited[row].push(false);
        }
    }

    if (generation_method.value == "origin-shift"){
        origin_shift()
    } else if (generation_method.value == "dfs"){
        dfs(0, 0, 1)
        path_maze[0][0][1] = false;
    } else if (generation_method.value == "hunt-and-kill"){
        hunt_and_kill()
    }

    make_bidirectional();
    solve();

    path_maze[0][0][1] = true;
    path_maze[size.value-1][size.value-1][3] = true;
    display_maze()
}

function display_maze(){
    // canvas.style.height = `${Math.max(600, size.value*10)}px`
    drawable_canvas.clearRect(0, 0, canvas.width, canvas.height);

    //filled walls
    edge_length = canvas.width/size.value;

    for (let row = 0; row<=size.value; row++){
        draw_line(0, edge_length*row, canvas.width, edge_length*row, 'base');
    }
    for (let col = 0; col<=size.value; col++){
        draw_line(edge_length*col, 0, edge_length*col, canvas.width, 'base');
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
                    draw_line(x, y-(edge_length/2)+drawable_canvas.lineWidth, x, y+(edge_length/2)-drawable_canvas.lineWidth, 'remove');
                } else {
                    y = y+(dir_move[direction][0]*edge_length/2)
                    draw_line(x-(edge_length/2)+drawable_canvas.lineWidth, y, x+(edge_length/2)-drawable_canvas.lineWidth, y, 'remove');
                }
            }
        }
    }
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
    display_maze();
    if (solve_checkbox.checked){
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

        solve_label.innerHTML = "Hide Solution: "
    } else {
        solve_label.innerHTML = "Show Solution: "
    }
}

function draw_line(x1, y1, x2, y2, type) {
    if (type == 'remove'){
        drawable_canvas.lineWidth = drawable_canvas.lineWidth+1;
        drawable_canvas.strokeStyle = 'black';
    } else if (type == 'solve'){
        drawable_canvas.strokeStyle = 'limegreen';
    } else if (type == 'user'){
        drawable_canvas.strokeStyle = 'cyan';
    }else if (type == 'base'){
        drawable_canvas.strokeStyle = 'antiquewhite';
    }
    drawable_canvas.beginPath();
    drawable_canvas.moveTo(x1, y1);
    drawable_canvas.lineTo(x2, y2);
    drawable_canvas.stroke();
    if (type == 'remove'){
        drawable_canvas.lineWidth = drawable_canvas.lineWidth-1;
    }
}