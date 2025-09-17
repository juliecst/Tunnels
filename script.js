import { checkBingo, launchConfetti } from './bingo-checker.js';
const reshuffle = true; // Toggle reshuffling on or off

const scoreFilenames = [
  "Score1.svg","Score2.svg","Score3.svg","Score4.svg",
  "Score5.svg","Score6.svg","Score7.svg","Score8.svg",
  "Score9.svg","Score10.svg","Score11.svg","Score12.svg",
  "Score13.svg","Score14.svg","Score15.svg","Score16.svg"
];

const gridEl = document.getElementById("grid");
const modal = document.getElementById("modal");
const modalContent = document.getElementById("modalContent");
const closeModal = document.getElementById("closeModal");
const completeBtn = document.getElementById("completeBtn");

let currentScoreIndex = null;

// ---------------- Player assignment ----------------
let playerAssignments = JSON.parse(localStorage.getItem("playerAssignments") || "null");
if (!playerAssignments) {
  playerAssignments = {};
  scoreFilenames.forEach(name => {
    playerAssignments[name] = Math.random() < 0.5 ? "Player1" : "Player2";
  });
  localStorage.setItem("playerAssignments", JSON.stringify(playerAssignments));
}

// ---------------- Completed + order ----------------
let completedScores = JSON.parse(localStorage.getItem("completedScores") || "[]");
let randomizedOrder = JSON.parse(localStorage.getItem("randomOrder") || "null");

if (!randomizedOrder || reshuffle) {
  randomizedOrder = [...scoreFilenames.keys()];
  for (let i = randomizedOrder.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [randomizedOrder[i], randomizedOrder[j]] = [randomizedOrder[j], randomizedOrder[i]];
  }
  localStorage.setItem("randomOrder", JSON.stringify(randomizedOrder));
}

// ---------------- SVG helpers ----------------
function inlineSVG(container, filename, assignedPlayer) {
  fetch(`Scores/${filename}`)
    .then(r => r.text())
    .then(svgText => {
      const parser = new DOMParser();
      const svgDoc = parser.parseFromString(svgText, "image/svg+xml");
      const svgEl = svgDoc.documentElement;

      // dim the opposite layer
      if (assignedPlayer === "Player1") {
        const p2 = svgEl.querySelector('#Player2');
        if (p2) p2.setAttribute("opacity", "0.5");
      } else {
        const p1 = svgEl.querySelector('#Player1');
        if (p1) p1.setAttribute("opacity", "0.5");
      }

      // make sure svg scales inside its box
      svgEl.setAttribute("width", "100%");
      svgEl.setAttribute("height", "100%");
      svgEl.setAttribute("preserveAspectRatio", "xMidYMid meet");

      container.innerHTML = '';
      container.appendChild(svgEl);
    });
}

// // ---------------- Grid rendering ----------------
// function renderGrid() {
//   gridEl.innerHTML = "";

//   randomizedOrder.forEach((index) => {
//     const filename = scoreFilenames[index];
//     const assignedPlayer = playerAssignments[filename];

//     const cell = document.createElement("div");
//     cell.className = `
//       border border-gray-300 rounded-xl cursor-pointer aspect-square
//       flex flex-col items-center justify-center overflow-hidden
//       transition-colors duration-300 p-1 sm:p-2 text-center
//       ${completedScores.includes(filename) ? "bg-green-200" : "bg-white hover:bg-gray-100"}
//     `;
//     cell.dataset.scoreIndex = index;

//     const label = document.createElement("div");
//     label.textContent = `${filename.replace(".svg", "")} – ${assignedPlayer}`;
//     label.className = "text-xs sm:text-sm font-semibold mb-1 sm:mb-2";

//     const thumb = document.createElement("div");
//     thumb.className = "w-full h-full flex items-center justify-center";
//     inlineSVG(thumb, filename, assignedPlayer);

//     cell.appendChild(label);
//     cell.appendChild(thumb);
//     cell.addEventListener("click", () => openModal(index));
//     gridEl.appendChild(cell);
//   });
// }

function renderGrid() {
  gridEl.innerHTML = "";

  randomizedOrder.forEach((index) => {
    const filename = scoreFilenames[index];
    const cell = document.createElement("div");
    cell.className = `
      border border-gray-300 rounded-xl cursor-pointer aspect-square
      flex flex-col items-center justify-center overflow-hidden
      transition-colors duration-300 p-1 sm:p-2
      ${completedScores.includes(filename) ? "bg-green-200" : "bg-white hover:bg-gray-100"}
    `;
    cell.dataset.scoreIndex = index;

    // ✅ NEW: center the score + player text
    const label = document.createElement("div");
    label.textContent = filename.replace(".svg", "") + " – " + playerAssignments[filename];
    label.className = `
      text-xs sm:text-sm font-semibold
      flex items-center justify-center
      text-center h-full
    `;

    const thumb = document.createElement("img");
    thumb.src = `Scores/${filename}`;
    thumb.alt = filename;
    thumb.className = "w-full h-full object-contain absolute inset-0";

    // Wrap label and image inside a relative container
    const wrapper = document.createElement("div");
    wrapper.className = "relative w-full h-full flex items-center justify-center";
    wrapper.appendChild(thumb);
    wrapper.appendChild(label);

    cell.appendChild(wrapper);
    cell.addEventListener("click", () => openModal(index));

    gridEl.appendChild(cell);
  });
}

// ---------------- Modal ----------------
// function openModal(index) {
//   currentScoreIndex = index;
//   const filename = scoreFilenames[index];
//   const assignedPlayer = playerAssignments[filename];

//   fetch(`Scores/${filename}`)
//     .then(r => r.text())
//     .then(svgText => {
//       const parser = new DOMParser();
//       const svgDoc = parser.parseFromString(svgText, "image/svg+xml");
//       const svgEl = svgDoc.documentElement;

//       if (assignedPlayer === "Player1") {
//         const p2 = svgEl.querySelector('#Player2');
//         if (p2) p2.setAttribute("opacity", "0.5");
//       } else {
//         const p1 = svgEl.querySelector('#Player1');
//         if (p1) p1.setAttribute("opacity", "0.5");
//       }
//     const serializer = new XMLSerializer();
//     const svgStr = serializer.serializeToString(svgEl);
//     const blob = new Blob([svgStr], { type: "image/svg+xml" });
//     const url = URL.createObjectURL(blob);

//     modalContent.innerHTML = `
//     <div class="flex flex-col items-center w-full">
//         <img src="${url}" class="max-w-[90vw] max-h-[75vh] w-auto h-auto object-contain block overflow-hidden" />
//         <div class="text-center text-gray-600 mt-4 text-lg font-medium">
//         ${filename.replace(".svg","")} – ${assignedPlayer}
//         </div>
//     </div>`;
//     modal.classList.remove("hidden");
//     document.body.classList.add("modal-open");
//      });
// }

function openModal(index) {
  currentScoreIndex = index;
  const filename = scoreFilenames[index];
  const assignedPlayer = playerAssignments[filename];

  fetch(`Scores/${filename}`)
    .then(r => r.text())
    .then(svgText => {
      const parser = new DOMParser();
      const svgDoc = parser.parseFromString(svgText, "image/svg+xml");
      const svgEl = svgDoc.documentElement;

      // ---- helper to grey out the opposite player's layer ----
      function greyOutGroup(g, opacity = 0.5, grey = "#9CA3AF") {
        if (!g) return;
        g.setAttribute("opacity", String(opacity));

        // For every descendant element, override stroke/fill
        g.querySelectorAll("*").forEach((el) => {
          // style attribute override (wins over presentation attrs)
          const style = el.getAttribute("style") || "";
          const newStyle =
            style +
            (style && !style.trim().endsWith(";") ? ";" : "") +
            `stroke:${grey} !important;`;
          el.setAttribute("style", newStyle);

          // Also set presentation attributes (covers cases without inline style)
          el.setAttribute("stroke", grey);

          // If there is a visible fill (not "none"), tint it too
          const fillAttr = el.getAttribute("fill");
          const hasFill =
            (fillAttr && fillAttr.toLowerCase() !== "none") ||
            // some paths rely on default fill; only color typical filled shapes
            ["circle", "ellipse", "rect"].includes(el.tagName.toLowerCase());
          if (hasFill) {
            // style override
            const s2 = el.getAttribute("style") || "";
            el.setAttribute(
              "style",
              s2 +
                (s2 && !s2.trim().endsWith(";") ? ";" : "") +
                `fill:${grey} !important;`
            );
            // presentation attribute
            el.setAttribute("fill", grey);
          }
        });
      }

      // make the *other* player grey + 50% opacity
      if (assignedPlayer === "Player1") {
        greyOutGroup(svgEl.querySelector("#Player2"), 0.5);
      } else {
        greyOutGroup(svgEl.querySelector("#Player1"), 0.5);
      }

      // ---- keep your sizing exactly as before (img with blob url) ----
      const serializer = new XMLSerializer();
      const svgStr = serializer.serializeToString(svgEl);
      const blob = new Blob([svgStr], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);

      modalContent.innerHTML = `
        <div class="flex flex-col items-center w-full">
          <img src="${url}" class="max-w-[90vw] max-h-[75vh] w-auto h-auto object-contain block overflow-hidden" />
          <div class="text-center text-gray-600 mt-4 text-lg font-medium">
            ${filename.replace(".svg","")} – ${assignedPlayer}
          </div>
        </div>
      `;

      modal.classList.remove("hidden");
      document.body.classList.add("modal-open");
    });
}


// ---------------- Buttons ----------------
closeModal.addEventListener("click", () => {
  modal.classList.add("hidden");
  document.body.classList.remove("modal-open");
  currentScoreIndex = null;
});

// completeBtn.addEventListener("click", () => {
//   const filename = scoreFilenames[currentScoreIndex];
//   if (filename && !completedScores.includes(filename)) {
//     completedScores.push(filename);
//     localStorage.setItem("completedScores", JSON.stringify(completedScores));
//     renderGrid();
//     modal.classList.add("hidden");
//     document.body.classList.remove("modal-open");
//   }
// });


// …inside completeBtn.addEventListener:
completeBtn.addEventListener("click", () => {
  const filename = scoreFilenames[currentScoreIndex];
  if (filename && !completedScores.includes(filename)) {
    completedScores.push(filename);
    localStorage.setItem("completedScores", JSON.stringify(completedScores));
    renderGrid();


    // ✅ NEW: check for bingo
    if (checkBingo(completedScores, randomizedOrder, scoreFilenames)) {
        alert("🎉 Bingo! 🎉");
        launchConfetti();
    }


    modal.classList.add("hidden");
    document.body.classList.remove("modal-open");
    currentScoreIndex = null;
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
  localStorage.removeItem("playerAssignments");
  location.reload();
});

// ---------------- Init ----------------
renderGrid();
