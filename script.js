const matterContainer = document.querySelector("#matter-container");
const addButton = document.querySelector("#add-button");
const thickness = 60;

// module aliases
let Engine = Matter.Engine,
  Render = Matter.Render,
  Runner = Matter.Runner,
  Bodies = Matter.Bodies,
  Composite = Matter.Composite;
//Mouse = Matter.Mouse,
//MouseConstraint = Matter.MouseConstraint;

// create an engine
let engine = Engine.create();

// create a renderer
let render = Render.create({
  //canvas: canvas,
  element: matterContainer,
  engine: engine,
  options: {
    background: "transparent",
    wireframes: false,
    width: matterContainer.clientWidth,
    height: matterContainer.clientHeight,
  },
});

const getScaleFactor = () => {
  const screenWidth = window.innerWidth;

  if (screenWidth <= 480) {
    // Mobile devices
    return 0.35; // scale down to 35%
  } else if (screenWidth <= 1024) {
    // Tablets
    return 0.4; // scale down to 40%
  } else if (screenWidth <= 1440) {
    // Laptops
    return 0.5; // scale down to 50%
  } else {
    return 0.65; // scale down to 65%
  }
};

const createObject = () => {
  const scaleFactor = getScaleFactor();

  // Generate a random x-coordinate within the window's width
  let randomX = Math.random() * matterContainer.clientWidth;

  // Generate a random rotation angle in radians
  let randomAngle = Math.random() * 2 * Math.PI;

  let textureUrl;
  let baseWidth;
  let baseHeight;

  textureUrl =
    "https://uploads-ssl.webflow.com/659f523b391d64a0ec0ec185/660ddf6694ea1f57d17763e8_ch-logo-2018-_250w.png";
  baseWidth = 250;
  baseHeight = 178;

  // Apply the scale factor
  let elWidth = baseWidth * scaleFactor;
  let elHeight = baseHeight * scaleFactor;

  let el = Bodies.rectangle(randomX, 0, elWidth, elHeight, {
    angle: randomAngle,
    render: {
      sprite: {
        texture: textureUrl,
        xScale: scaleFactor,
        yScale: scaleFactor,
      },
    },
    friction: 0.3,
    frictionAir: 0.00001,
    restitution: 0.4,
  });

  Composite.add(engine.world, el);
};

const letItRainElements = () => {
  const scaleFactor = getScaleFactor();

  // Base number of puffs adjusted by the screen size
  let baseNumberOfEls = 80 * scaleFactor;

  const numberOfEls = Math.floor(baseNumberOfEls); // Ensures the number of puffs is an integer

  for (let i = 0; i < numberOfEls; i++) {
    createObject();
  }
};

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        // Call letItRainPuffs when matterContainer scrolls into view
        letItRainElements();

        // Optional: If you only want it to trigger once, you can unobserve the element
        observer.unobserve(matterContainer);
      }
    });
  },
  {
    root: null, // observes intersections with the viewport
    threshold: 0.1, // trigger when at least 10% of matterContainer is visible
  }
);

// Start observing
observer.observe(matterContainer);

let ground = Bodies.rectangle(
  matterContainer.clientWidth / 2,
  matterContainer.clientHeight + thickness / 2,
  27184,
  thickness,
  { isStatic: true }
);

let leftWall = Bodies.rectangle(
  0 - thickness / 2,
  matterContainer.clientHeight / 2,
  thickness,
  matterContainer.clientHeight * 5,
  {
    isStatic: true,
  }
);

let rightWall = Bodies.rectangle(
  matterContainer.clientWidth + thickness / 2,
  matterContainer.clientHeight / 2,
  thickness,
  matterContainer.clientHeight * 5,
  { isStatic: true }
);

// add all of the bodies to the world
Composite.add(engine.world, [ground, leftWall, rightWall]);

let mouse = Matter.Mouse.create(render.canvas);
let mouseConstraint = Matter.MouseConstraint.create(engine, {
  mouse: mouse,
  constraint: {
    stiffness: 0.2,
    render: {
      visible: false,
    },
  },
});

Composite.add(engine.world, mouseConstraint);

mouseConstraint.mouse.element.removeEventListener(
  "mousewheel",
  mouseConstraint.mouse.mousewheel
);
mouseConstraint.mouse.element.removeEventListener(
  "DOMMouseScroll",
  mouseConstraint.mouse.mousewheel
);

// run the renderer
Render.run(render);

// create runner
let runner = Runner.create();

// run the engine
Runner.run(runner, engine);

function handleResize(matterContainer) {
  render.canvas.width = matterContainer.clientWidth;
  render.canvas.height = matterContainer.clientHeight;

  Matter.Body.setPosition(
    ground,
    Matter.Vector.create(
      matterContainer.clientWidth / 2,
      matterContainer.clientHeight + thickness / 2
    )
  );

  // reposition right wall
  Matter.Body.setPosition(
    rightWall,
    Matter.Vector.create(
      matterContainer.clientWidth + thickness / 2,
      matterContainer.clientHeight / 2
    )
  );

  // reposition left wall
  Matter.Body.setPosition(
    leftWall,
    Matter.Vector.create(0 - thickness / 2, matterContainer.clientHeight / 2)
  );
}

addButton.addEventListener("click", createObject);

window.addEventListener("resize", function () {
  handleResize(matterContainer);
});
