# Maze Generator
A maze generator AND SIMULATOR.
SIMULATOR ON INFO PAGE


3 generation methods.
Depth First Search (DFS)

For Depth First Search (DFS), we first generate the solution path. To do this, we start at 0, 0, and then go randomly to neighbors until we get stuck. Being stuck means that all neighbors are visited. Then we backtrack till we get an open neighbor. Then start DFS from here again. We do this until we get to the end of the maze. Then we reset everything that isn't on the solution path. After this, we go to each cell in a random order, and check if it has unvisited neighbors. If yes, perform dfs same algorithm as before UNTIL STUCK, then abandon. If you do this for all possible cells, you get a full maze.

Hunt and Kill

Similar to DFS, we start at 0, 0, and then go randomly to neighbors until we get stuck. Being stuck means that all neighbors are visited. While traversing, we are keeping track of each cell that is still open. Being open means it still has at least one unvisited neighbor. Once stuck, we go to a random open node and check if it is still open. If so, we start hunt and kill again from this node. Once their are no open nodes left, the entire maze has been traversed.

Origin Shift

We pre-generate a perfect maze with each row open and the last column open. we set all rows pointing to the right and the last colum pointing down, with the bottom right beign the origin. We then move the origin randomly to it's 4 neighbors n^3 times where n is the size of the maze. This ensures the entire maze will be sufficiently scrambled. When the origin moves, it moves the arrows to point to the new origin, thus adding/breaking walls.
