const size = document.getElementById("size");
const size_label = document.getElementById("size-label");
const generation_method = document.getElementById("generation-method");
const canvas = document.getElementById("display")
const drawable_canvas = canvas.getContext("2d");

var maze = []
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
    for (let i = 0; i<maze.length; i++){
        for (let j = 0; j<maze.length; j++){//maze.length = maze[0].length
            maze[i][j] = '→';
        }
        maze[i][maze.length-1] = '↓';
    }
    maze[maze.length-1][maze.length-1] = 'O'
}

function generate_maze(){
    maze = [];
    for (let i=0; i<size.value; i++){
        maze.push([]);
        for (let j=0; j<size.value; j++){
            maze[i].push(" ");
        }
    }
    if (generation_method.value == "origin-shift"){
        origin_shift()
    }
}
