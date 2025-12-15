let currentIndex = 0;

const flashcard = document.getElementById("flashcard");
const front = document.getElementById("card-front");
const back = document.getElementById("card-back");

function renderCard() {
  flashcard.classList.remove("flipped");

  front.textContent = cards[currentIndex].term;
  back.textContent = cards[currentIndex].definition;
}

function nextCard() {
  if (currentIndex < cards.length - 1) {
    currentIndex++;
    renderCard();
  }
}

function prevCard() {
  if (currentIndex > 0) {
    currentIndex--;
    renderCard();
  }
}

flashcard.addEventListener("click", () => {
  flashcard.classList.toggle("flipped");
});

// initial load
renderCard();
