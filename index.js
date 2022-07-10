const { Engine, Render, Runner, World, Bodies, Body, Events } = Matter;

const width = window.innerWidth;
const height = window.innerHeight;

const cellsHorizontal = 15;
const cellsVertical = 10;
const cells = 8;
const velocity = 2;
const unitLengthY = height / cellsVertical;
const unitLengthX = width / cellsHorizontal;

const engine = Engine.create();
engine.world.gravity.y = 0;
const { world } = engine;
const render = Render.create({
  element: document.body,
  engine: engine,
  options: {
    wireframes: false,
    width,
    height,
  },
});

Render.run(render);
Runner.run(Runner.create(), engine);

const walls = [
  Bodies.rectangle(width / 2, 0, width, 4, {
    isStatic: true,
  }),
  Bodies.rectangle(width / 2, height, width, 4, {
    isStatic: true,
  }),
  Bodies.rectangle(0, height / 2, 4, height, {
    isStatic: true,
  }),
  Bodies.rectangle(width, height / 2, 4, height, {
    isStatic: true,
  }),
];
World.add(world, walls);

const shuffle = (arr) => {
  let counter = arr.length;
  while (counter > 0) {
    const index = Math.floor(Math.random() * counter);
    counter--;

    const temp = arr[counter];
    arr[counter] = arr[index];
    arr[index] = temp;
  }
  return arr;
};

const grid = Array(cellsVertical)
  .fill(null)
  .map(() => Array(cellsHorizontal).fill(false));

const verticals = Array(cellsVertical)
  .fill(null)
  .map(() => Array(cellsHorizontal - 1).fill(false));

const horizontals = Array(cellsVertical - 1)
  .fill(null)
  .map(() => Array(cellsHorizontal).fill(false));

const startRow = Math.floor(Math.random() * cellsVertical);
const startColumn = Math.floor(Math.random() * cellsHorizontal);

const stepThroughCell = (row, col) => {
  // if the cell is visited at [row,col], then return
  if (grid[row][col]) {
    return;
  }

  // Mark this cell as visited
  grid[row][col] = true;

  // Assemble randomly ordered list of neighbors
  const neighbors = shuffle([
    [row - 1, col, "up"],
    [row, col + 1, "right"],
    [row + 1, col, "down"],
    [row, col - 1, "left"],
  ]);
  // for each neighbor
  for (let neighbor of neighbors) {
    const [nextRow, nextCol, direction] = neighbor;
    // see if neighbor is out of bounds
    if (
      nextRow < 0 ||
      nextRow >= cellsVertical ||
      nextCol < 0 ||
      nextCol >= cellsHorizontal
    ) {
      continue;
    }

    // if we have visited the neighbor,continue to next neighbor
    if (grid[nextRow][nextCol]) {
      continue;
    }

    // remove a wall from either horizontal or vertical
    if (direction === "left") {
      verticals[row][col - 1] = true;
    } else if (direction === "right") {
      verticals[row][col] = true;
    } else if (direction === "up") {
      horizontals[row - 1][col] = true;
    } else if (direction === "down") {
      horizontals[row][col] = true;
    }
    stepThroughCell(nextRow, nextCol);
  }
};

stepThroughCell(startRow, startColumn);
console.log(horizontals);
console.log(verticals);

horizontals.forEach((row, rowIndex) => {
  row.forEach((open, columnIndex) => {
    if (open) {
      return;
    }

    const wall = Bodies.rectangle(
      columnIndex * unitLengthX + unitLengthX / 2,
      rowIndex * unitLengthY + unitLengthY,
      unitLengthX,
      3,
      {
        isStatic: true,
        label: "wall",
        render: {
          fillStyle: "red",
        },
      }
    );
    World.add(world, wall);
  });
});

verticals.forEach((row, rowIndex) => {
  row.forEach((open, columnIndex) => {
    if (open) {
      return;
    }
    const wall = Bodies.rectangle(
      columnIndex * unitLengthX + unitLengthX,
      rowIndex * unitLengthY + unitLengthY / 2,
      3,
      unitLengthY,
      {
        isStatic: true,
        label: "wall",
        render: {
          fillStyle: "red",
        },
      }
    );
    World.add(world, wall);
  });
});

//goal
const goal = Bodies.rectangle(
  width - unitLengthX / 2,
  height - unitLengthY / 2,
  unitLengthX * 0.7,
  unitLengthY * 0.7,
  {
    isStatic: true,
    label: "goal",
    render: {
      fillStyle: "green",
    },
  }
);
World.add(world, goal);

//ball
const ballRadius = Math.min(unitLengthX, unitLengthY) / 4;
const ball = Bodies.circle(unitLengthX / 2, unitLengthY / 2, ballRadius, {
  label: "ball",
  render: {
    fillStyle: "blue",
  },
});
World.add(world, ball);

document.addEventListener("keydown", (event) => {
  const { x, y } = ball.velocity;
  if (event.keyCode === 87) {
    Body.setVelocity(ball, { x, y: y - velocity });
  }
  if (event.keyCode === 68) {
    Body.setVelocity(ball, { x: x + velocity, y });
  }
  if (event.keyCode === 83) {
    Body.setVelocity(ball, { x, y: y + velocity });
  }
  if (event.keyCode === 65) {
    Body.setVelocity(ball, { x: x - velocity, y });
  }
});

// Win condition
Events.on(engine, "collisionStart", (event) => {
  event.pairs.forEach((collision) => {
    const labels = ["ball", "goal"];
    if (
      labels.includes(collision.bodyA.label) &&
      labels.includes(collision.bodyB.label)
    ) {
      const winner = document.querySelector(".winner");
      winner.style.width = `${window.innerWidth}px`;
      winner.style.height = `${window.innerHeight}px`;
      winner.classList.remove("hidden");
      world.gravity.y = 1;
      world.bodies.forEach((body) => {
        if (body.label === "wall") {
          Body.setStatic(body, false);
        }
      });
    }
  });
});
function reload() {
  window.location.reload();
}
