// AdvancedTicTacToe.tsx
import React, { useState, useCallback } from 'react';
import './AdvancedTicTacToe.css';

import winAnimation from './animation/win.json'; 
import Lottie from 'react-lottie';

// React DnD
import { useDrag, useDrop } from 'react-dnd';
import {
  MultiBackend,
  HTML5DragTransition,
  TouchTransition,
} from 'dnd-multi-backend';

// Our triangle icon
import TriangleIcon from './TriangleIcon';

/** DnD type for cones. Must match in Draggable & Droppable. */
const DRAG_TYPE_CONE = 'CONE';

/** Which team. */
type Team = 'A' | 'B';

/** A cone with a team and a size (1..4). */
interface Cone {
  team: Team;
  size: number;
}

/** Each cell on the board is a stack of cones. The last item is the topmost cone. */
type CellStack = Cone[];

const BOARD_SIZE = 3;
const NUM_CELLS = BOARD_SIZE * BOARD_SIZE;

/** Utility: get the top cone of a cell stack. */
function getTopCone(cell: CellStack): Cone | undefined {
  return cell.length > 0 ? cell[cell.length - 1] : undefined;
}

/**
 * Check if a cone can be placed on this cell:
 * 1. The cell is empty, OR
 * 2. The cell's top cone is from the OTHER team AND is smaller in size.
 *    (Cannot place on top of your own cone.)
 */
function canPlaceCone(cone: Cone, cell: CellStack): boolean {
  const top = getTopCone(cell);
  if (!top) return true; // empty cell
  if (top.team === cone.team) return false; // can't place on your own
  return cone.size > top.size; // must be larger than opponent's top
}

/** Check if `team` has 3 in a row of top cones on the board. */
function checkWin(board: CellStack[], team: Team): boolean {
  const winningLines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (const [a, b, c] of winningLines) {
    const topA = getTopCone(board[a]);
    const topB = getTopCone(board[b]);
    const topC = getTopCone(board[c]);
    if (
      topA && topB && topC &&
      topA.team === team &&
      topB.team === team &&
      topC.team === team
    ) {
      return true;
    }
  }
  return false;
}

/** A single record of (cellIndex, size) for track of placements. */
interface PlacementRecord {
  cellIndex: number;
  size: number;
}

const AdvancedTicTacToe: React.FC = () => {
  // 3x3 board
  const [board, setBoard] = useState<CellStack[]>(
    Array.from({ length: NUM_CELLS }, () => [])
  );

  // Current turn
  const [currentTeam, setCurrentTeam] = useState<Team>('A');

  // Each team's inventory
  const [inventory, setInventory] = useState<{
    A: number[];
    B: number[];
  }>({
    A: [1, 2, 3, 4],
    B: [1, 2, 3, 4],
  });

  // Track order of each team's cone placements
  const [placements, setPlacements] = useState<{
    A: PlacementRecord[];
    B: PlacementRecord[];
  }>({
    A: [],
    B: [],
  });

  // Winner
  const [winner, setWinner] = useState<Team | null>(null);

  /**
   * Main logic to place a cone.
   */
  const placeCone = useCallback((team: Team, size: number, cellIndex: number) => {
    if (winner) return; // game ended
    if (team !== currentTeam) return; // must be your turn
    if (!inventory[team].includes(size)) return; // must have it in inventory

    const newBoard = [...board];
    const cellStack = [...newBoard[cellIndex]];

    // Check place is valid
    if (!canPlaceCone({ team, size }, cellStack)) {
      alert(`Cannot place size-${size} cone here.`);
      return;
    }

    // If covering opponent's cone, pop it, return to opponent's inventory
    const topCone = getTopCone(cellStack);
    if (topCone && topCone.team !== team) {
      cellStack.pop();
      setInventory((prev) => ({
        ...prev,
        [topCone.team]: [...prev[topCone.team], topCone.size],
      }));
    }

    // Place new cone
    cellStack.push({ team, size });
    newBoard[cellIndex] = cellStack;
    setBoard(newBoard);

    // Remove from inventory
    setInventory((prev) => ({
      ...prev,
      [team]: prev[team].filter((s) => s !== size),
    }));

    // Track placement
    const newPlacements = [...placements[team], { cellIndex, size }];
    setPlacements((prev) => ({
      ...prev,
      [team]: newPlacements,
    }));

    // If 4th cone is placed, remove oldest top cone
    if (newPlacements.length >= 4) {
      removeOldestTopCone(newBoard, newPlacements, team);
    }

    // Check if this causes a win
    if (checkWin(newBoard, team)) {
      setWinner(team);
      return;
    }

    // Switch turn
    setCurrentTeam(team === 'A' ? 'B' : 'A');
  }, [board, currentTeam, inventory, placements, winner]);

  /**
   * Remove the oldest top cone for `team` if it is still on top.
   */
  const removeOldestTopCone = useCallback((
    updatedBoard: CellStack[],
    teamPlacements: PlacementRecord[],
    team: Team
  ) => {
    const oldest = teamPlacements[0];
    const { cellIndex, size } = oldest;

    const stack = updatedBoard[cellIndex];
    const top = getTopCone(stack);

    if (top && top.team === team && top.size === size) {
      stack.pop();
      updatedBoard[cellIndex] = [...stack];
      setBoard(updatedBoard);

      // Return that cone to inventory
      setInventory((prev) => ({
        ...prev,
        [team]: [...prev[team], size],
      }));
    }

    // Remove from logs
    const updatedPlacementLog = teamPlacements.slice(1);
    setPlacements((prev) => ({
      ...prev,
      [team]: updatedPlacementLog,
    }));
  }, []);

  // Render the board
  function renderBoard() {
    return (
      <div className="board">
        {Array.from({ length: NUM_CELLS }, (_, i) => (
          <DroppableCell
            key={i}
            cellIndex={i}
            stack={board[i]}
            placeCone={placeCone}
          />
        ))}
      </div>
    );
  }

  // Render inventory for a team
  function renderInventory(team: Team) {
    const sortedCones = [...inventory[team]].sort((a,b)=>a-b);
    return (
      <div className="inventoryRow">
        {sortedCones.map((size) => (
          <DraggableCone
            key={`${team}-${size}`}
            team={team}
            size={size}
            disabled={winner !== null || team !== currentTeam}
          />
        ))}
      </div>
    );
  }

  // Lottie config for the "win" animation
  const lottieOptions = {
    loop: false,
    autoplay: true,
    animationData: winAnimation,
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice',
    },
  };

  return (
    <div className="ticTacToeContainer">

      {/* Title at top-left */}
      <div className="gameTitle">Coneato v2.0</div>

      
      {/* Turn Indicator at top-right (only if no winner) */}
      {!winner && (
        <div className="turnIndicator">
          <span className="turnLabel">Current Turn:</span>
          <div
            className={`currentTurnDot ${
              currentTeam === 'A' ? 'teamADot' : 'teamBDot'
            }`}
          />
        </div>
      )}

      <button className="resetButton" onClick={() => window.location.reload()}>
        &#x21bb;
      </button>

      {/* Team A inventory (top) */}
      {!winner && renderInventory('A')}

      {/* Board */}
      {renderBoard()}

      {/* Team B inventory (bottom) */}
      {!winner && renderInventory('B')}

      {/* If there's a winner, show Lottie + message */}
      {winner && (
        <div className="winOverlay">
          <Lottie options={lottieOptions} height={300} width={300} />

          <div className="winnerText">
            {winner === 'A' ? 'Team Blue' : 'Team Red'} wins!
          </div>


          <button className="resetButton" onClick={() => window.location.reload()}>
            &#x21bb;
          </button>

          {/* A new "Restart" button (rounded, to suit your theme) */}
        <button className="restartButton" onClick={() => window.location.reload()}>
          Restart
        </button>
        </div>
      )}


     <div className="bottomContainer">
        <div className="instructionsLine">
          
        </div>
        <div className="bottomBar">
        Every 4th cone zaps the oldest out of play—plan your stacks wisely! Developed by Naman Khurpia
        </div>
      </div>
    </div>


  
  );
};

export default AdvancedTicTacToe;

/* ------------------------------------------------------------------ */
/* A Draggable cone: uses useDrag from React DnD                      */
/* ------------------------------------------------------------------ */
interface DraggableConeProps {
  team: Team;
  size: number;
  disabled?: boolean;
}

const DraggableCone: React.FC<DraggableConeProps> = ({ team, size, disabled }) => {
  // The data we'll drag around
  const dragItem = { type: DRAG_TYPE_CONE, team, size };

  const [{ isDragging }, dragRef] = useDrag({
    type: DRAG_TYPE_CONE,
    item: dragItem,
    canDrag: !disabled, // only allow drag if not disabled
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  // Lower opacity while dragging
  const opacity = isDragging ? 0.5 : 1;
  const cursor  = disabled ? 'not-allowed' : 'grab';

  return (
    <div ref={dragRef} style={{ opacity, cursor }}>
      {/* Our TriangleIcon. You can pass scale if you want smaller in inventory. */}
      <TriangleIcon team={team} size={size} scale={0.8} />
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* A Droppable cell on the board: uses useDrop from React DnD         */
/* ------------------------------------------------------------------ */
interface DroppableCellProps {
  cellIndex: number;
  stack: CellStack;
  placeCone: (team: Team, size: number, cellIndex: number) => void;
}

const DroppableCell: React.FC<DroppableCellProps> = ({
  cellIndex,
  stack,
  placeCone,
}) => {
  const topCone = getTopCone(stack);

  // Drop logic
  const [{ isOver, canDrop }, dropRef] = useDrop({
    accept: DRAG_TYPE_CONE,
    drop: (item: { team: Team; size: number }) => {
      placeCone(item.team, item.size, cellIndex);
    },
    canDrop: (item) => {
      return canPlaceCone({ team: item.team, size: item.size }, stack);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  // Visual highlight if user is dragging a valid cone over
  let highlightClass = '';
  if (isOver && canDrop) {
    highlightClass = 'highlightCanDrop';
  } else if (isOver && !canDrop) {
    highlightClass = 'highlightNoDrop';
  }

  return (
    <div ref={dropRef} className={`cell ${highlightClass}`}>
      {topCone && (
        <TriangleIcon team={topCone.team} size={topCone.size} />
      )}
    </div>
  );
};
