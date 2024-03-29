
function WordCount(text, word) {
    console.log("counting words");
    let splitText = text.split(' ');
    let filterText = splitText.filter(function (n) { return n === word });
    return filterText.length;
}

function theSpiritsAreUnhappy(passChance) {
  let roll = Math.random();
  if (roll > passChance) {
    console.log("The spirits are unhappy.");
    return true;
  }
  console.log("The spirits are happy.");
  return false;
}

const rejectBasedOnTooManyWords = (word, maxAllowedCount, passChance) =>
  (text) => {
    if (WordCount(text, word) >= maxAllowedCount) {
      console.log("The word " + word + " is abundant.");
      if (theSpiritsAreUnhappy(passChance)) {
        return true;
      }
    }
    return false;
  }

const rejectTooShort = (minWordCount) => 
  (text) => {
    let splitText = text.split(' ');
    if (splitText.length < minWordCount) {
      console.log("Size issue. Reject.");
      return true;
    }
    return false;
  }

// -------------- ADD STUFF HERE ----------------------
const rejectionFunctions = [            // elements must be (string -> bool), true means reject
  // reject 60% of article with at least 5 words 'film'
  rejectBasedOnTooManyWords("film", 5, 0.4),
  // reject 70% of articles with at least 8 words 'player'
  rejectBasedOnTooManyWords("player", 8, 0.3),
  // reject all articles shorter than 300 words
  rejectTooShort(300),
]; 

function rejectArticle(text){
  // returns true iff there's at least one reason to reject the article
  for (const f of rejectionFunctions) {
    if (f(text)) {
      return true;
    }
  }
  return false;
}
