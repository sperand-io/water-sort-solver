# water-sort-solver

I play a lot of sudoku.com 

They have this absurd minigame as part of their tournaments to sort water by color in vials, and you accumulate moves by solving sudoku puzzles.

In order to minimize the expenditure of moves to progress in the game I implemented a BFS solver for the shortest path in the possibility space of state transitions.

Snap a screenshot, upload it, and the solver will give you the shortest set of steps to take. 

### Game State

![CleanShot 2025-03-12 at 11 56 09@2x](https://github.com/user-attachments/assets/24b40e27-c65d-43a2-81f1-808f540ace42)

```json
{
 "vials": [
   ["green", "purple", "yellow"],
   ["blue", "purple", "cyan"],
   ["cyan", "green", "orange"],
   ["red", "yellow", "green"],
   ["orange", "blue", "purple"],
   ["yellow", "cyan", "orange", "yellow"],
   ["orange", "cyan", "blue"],
   ["green", "red", "red"],
   ["purple", "red", "blue"]
 ]
}
```
