//////////////////////////API DICTIONARY (BRANDON)//////////////////
async function getDefinition() {
  const termInput = document.getElementById("term");
  const definitionInput = document.getElementById("definition");

  if (!termInput.value) return;

  try {
    const res = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${termInput.value}`
    );
    const data = await res.json();

    definitionInput.value =
      data[0]?.meanings[0]?.definitions[0]?.definition || "";
  } catch (err) {
    console.error("Dictionary API error:", err);
  }
}
