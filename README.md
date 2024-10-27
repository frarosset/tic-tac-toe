# tic-tac-toe
A project from The Odin Project (Full Stack Javascript).

A simple tic-tac-toe game is built using HTML, CSS, and Javascript.

> A preview is available [here](http://frarosset.github.io/tic-tac-toe).

## Features

### Customizable gameboard size

Beyond the classic **3x3** grid, you can choose to play in a **4x4**, **5x5** or **6x6** grid. Since increasing the grid size increases the configurations resulting in a tie and decrease the winning ones, you only need to align 4 marks to win on these larger grids, balancing that out.

### Extended mode
In this mode, you have a limited number of marks available, equal to the number you need to align to win. Once you’ve placed all your marks, any new mark replaces your oldest mark on the board. This mode prolongs gameplay and continues until there’s a winner. This variation is actually called *extended tic-tac-toe*. 

### One-Player or Two-Players mode

In 1-player mode you play against an AI opponent with different skill levels:
1. **Novice AI:** it makes random moves without any strategy.
1. **Beginner AI**: it makes a winning move if available, otherwise makes a random move.
1. **Intermediate AI**: it makes a winning move if possible, blocks the opponent’s winning move if imminent, otherwise makes a random move.

1. **Proficient AI**: it considers the fork opportunities (moves that
allow for a win on the successive move of the same player) and prioritizes actions in the following order: securing a win, blocking the opponent, creating a fork, or making a random move if none of the above are viable.

1. **Advanced AI**: it prioritizes actions in the following order: securing a win, blocking the opponent, creating a fork,  preventing the opponent’s fork, or making a random move if none of the above are viable.
1. **Expert AI**: It uses the [minmax algorithm](https://alialaa.com/blog/tic-tac-toe-js-minimax) to determine the next move.  It explores the solution tree up to depth 3 on a 3x3 grid, or depth 4 on larger grids. This AI is beatable but has the advantage of looking ahead several moves.
1. **Master AI**: It uses the minimax algorithm to explore (ideally) the entire solution tree. On a 3x3 grid, this results in an unbeatable opponent. On larger grids, this strategy is less effective due to the increased complexity, necessitating a limit on the maximum depth explored and making the ai beatable.

Some optimizations have been implemented for the minmax solver, like alpha-beta pruning and heuristic score computation for incomplete tree exploration.
 
Also, in extended mode, the AI operates under the assumption that game is being played in the classic mode, though there could be more effective strategies for this variant: the AI is beatable at all levels.

   
## Problems
When using the minmax solution on larger boards, despite limiting the depth of the explored search tree, you might have to wait a few more seconds to get the AI player's move. 
In the first version, this caused CSS animations to freeze. This issue has been partially solved by awaiting a 2ms delay a few times during the solver’s execution (and making the appropriate functions async). While not an ideal solution, it prevents the animations from freezing entirely, though some lag might still be noticeable in those cases.
