const size = document.getElementById("size");
const size_label = document.getElementById("size-label");

var maze = []

size.addEventListener("input", function(e){
    size_label.innerHTML = "Size: "+ size.value;
});

size.addEventListener("change", function(e){
    console.log(size.value);
    maze = [];
    for (let i=0; i<size.value; i++){
        maze.push([]);
    }
    console.log(maze);
});
