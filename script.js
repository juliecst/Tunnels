


const reshuffle = true; // Toggle reshuffling on or off

const scoreFilenames = [
  "Borbach2.svg",
  "KleinAnnen.svg",
  "RulebasedTunnel.svg",
  "StephaniErbstollen.svg",
  "stJohannes.svg",
  "stJohannesErbstollen1.svg",
  "stJohannesErbstollen3.svg",
  "Stuchtey2.svg",
  "vereinigteFriedrichsfeld2.svg",
  "Vereinigungsstollen.svg",
  "SubwayLoop.svg",
  "SpiralTrack.svg",
  "MazeScore.svg",
  "NeonRun.svg",
  "SoftEdge.svg",
  "WarpLine.svg"
];

const gridEl = document.getElementById("grid");
const modal = document.getElementById("modal");
const modalContent = document.getElementById("modalContent");
const closeModal = document.getElementById("closeModal");
const completeBtn = document.getElementById("completeBtn");

let currentScoreIndex = null;

// Load state
let completedScores = JSON.parse(localStorage.getItem("completedScores") || "[]");
let randomizedOrder = JSON.parse(localStorage.getItem("randomOrder") || "null");

if (!randomizedOrder || reshuffle) {
  randomizedOrder = [...scoreFilenames.keys()]; // [0, 1, 2, ..., 15]
  for (let i = randomizedOrder.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [randomizedOrder[i], randomizedOrder[j]] = [randomizedOrder[j], randomizedOrder[i]];
  }
  localStorage.setItem("randomOrder", JSON.stringify(randomizedOrder));
}

function renderGrid() {
  gridEl.innerHTML = "";

  randomizedOrder.forEach((index) => {
    const filename = scoreFilenames[index];
    const cell = document.createElement("div");
    cell.className = `border border-gray-300 rounded-xl cursor-pointer aspect-square flex flex-col items-center justify-center overflow-hidden transition-colors duration-300 p-2 text-center ${
        completedScores.includes(filename) ? "bg-green-200" : "bg-white hover:bg-gray-100"
        }`;
    
    cell.dataset.scoreIndex = index;

    const label = document.createElement("div");
    label.textContent = filename.replace(".svg", "");
    label.className = "text-sm font-semibold mb-2";

    const thumb = document.createElement("img");
    thumb.src = `scores/${filename}`;
    thumb.alt = filename;
    //thumb.className = "max-w-full max-h-full";
    //thumb.className = "object-contain w-full h-full";
    thumb.className = "w-full h-full object-contain";




    cell.appendChild(label);
    cell.appendChild(thumb);
    cell.addEventListener("click", () => openModal(index));

    gridEl.appendChild(cell);
  });
}

function openModal(index) {
  currentScoreIndex = index;
  const filename = scoreFilenames[index];

  modalContent.innerHTML = `
  <div class="flex flex-col items-center w-full">
    <img
      src="scores/${filename}"
      type="image/svg+xml"
      class="max-w-[90vw] max-h-[75vh] w-auto h-auto object-contain block overflow-hidden"
    />
    <div class="text-center text-gray-600 mt-4 text-lg font-medium">${filename.replace(".svg", "")}</div>
  </div>
`;


 
  modal.classList.remove("hidden");
  document.body.classList.add("modal-open");
}


closeModal.addEventListener("click", () => {
  modal.classList.add("hidden");
  document.body.classList.remove("modal-open");
  currentScoreIndex = null;
});

completeBtn.addEventListener("click", () => {
  const filename = scoreFilenames[currentScoreIndex];
  if (filename && !completedScores.includes(filename)) {
    completedScores.push(filename);
    localStorage.setItem("completedScores", JSON.stringify(completedScores));
    renderGrid();
    modal.classList.add("hidden");
    document.body.classList.remove("modal-open");
  }
});

modal.addEventListener("click", (e) => {
  if (e.target === modal) {
    modal.classList.add("hidden");
    document.body.classList.remove("modal-open");
    currentScoreIndex = null;
  }
});

document.getElementById("resetBtn").addEventListener("click", () => {
  localStorage.removeItem("completedScores");
  localStorage.removeItem("randomOrder");
  location.reload(); // force page refresh
});


// Render the grid initially
renderGrid();
