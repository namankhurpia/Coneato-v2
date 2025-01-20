# About Coneato V2.0
Coneato v2.0 is an exciting twist on the classic TicTacToe game, featuring strategic stacking mechanics with colorful cones. Players compete to create a line of three cones while managing their inventory and strategically placing cones on the grid.

[Test the game here](https://coneatov2.web.app/)


# Game Rules
Two Teams:
Team Blue (A) and Team Red (B) compete against each other.
Each team starts with 4 cones of sizes 1 to 4 in their inventory.

# Cone Placement:

A cone can only be placed on:
An empty cell.
A cone from the opponent’s team, if it’s smaller than the cone being placed.
You cannot place a cone on top of your own team’s cone.
Inventory Management:

After placing the 4th cone, the team’s oldest top cone disappears and returns to the inventory.
If you cover an opponent’s cone, the opponent’s cone reappears in their inventory.
No Phantom Cones:

Ensure that no “phantom” cone remains hidden under the stack. Only the top cone matters for gameplay.
Win Condition:

The first team to get 3 in a row (horizontal, vertical, or diagonal) of their top cones wins the game.


# Website Layout
Mobile-Friendly:

The game is optimized for mobile devices, with no scrolling required.
The grid and inventories adjust to fit the screen perfectly.
Inventory Positioning:

Team Blue’s (A) inventory is displayed above the grid.
Team Red’s (B) inventory is displayed below the grid.


# How to Run the Code
1) Prerequisites
Make sure you have the following installed on your machine:

Node.js (v14 or higher recommended)
npm or yarn
\n
2) Clone the Repository
`git clone <repository-url>`
cd advanced-tictactoe
\n
3) Install Dependencies
Install the necessary packages using npm or yarn:
`npm install`
# or
`yarn install`
\n
4) Run the Development Server
Start the React development server:

`npm start`
# or
`yarn start`
The game will be available at http://localhost:3000 in your browser.



# Contributing
We welcome contributions!
Feel free to open issues or submit pull requests for improvements, new features, or bug fixes.

# Credits
Created by Naman Khurpia.

Have fun stacking and strategizing! 🎮✨