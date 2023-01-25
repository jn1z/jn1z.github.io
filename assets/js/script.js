// TODO:
// Organize settings / about options
// Add picture for eventual "broadcast" (Twitter, FB, etc.)
// Determine how "good" a pair of words is -- how connected, and minimal distance
// Add definition browse capability:
// -- for each entry, mark if it's accessible in, say, m-w.com
// -- fix "cross-site requests" definition link
// Move ALL distances to one file ?!
// (Cloudflare should handle any amount of bandwidth for free)

// IN PROGESS
// Make colors more indicative of direction
// Make blog entries nice




const header = document.getElementsByTagName("header")[0];
const topElts = document.getElementById("topElts");
const botElts = document.getElementById("botElts");
const keyboard = document.getElementById("keyboard");
const pageHeight = document.documentElement.clientHeight;
const pageWidth = document.documentElement.clientWidth;
const topEltsArray = document.getElementsByClassName("topElt");
const botEltsArray = document.getElementsByClassName("botElt");
const guessesArray = document.getElementsByClassName("guess");
const guessesBox = document.getElementById("guessesRemaining");
const distanceBox = document.getElementById("minimumDistance");
const deleteButton = document.createElement('button');
const guessElts = document.getElementById("guesses");

deleteButton.addEventListener('click', deleteButton.fn = function _deleteWord(){});

const deleteIconSvg = renderDeleteIcon();

window.addEventListener("keydown", physicalKeyClicked);

const warningColour = "rgb(214, 124, 0)";

const distColors = ['rgb(239,138,98)','rgb(150,150,150)','rgb(103,169,207)'];

// Starts at 1
let topEltNum = 1;
let botEltNum = 1;
let currentGuessElement = guessesArray[0];
let currentGuessToolTip = guessElts.lastElementChild;
let guessedWord = "";
let guessCount = 0;
let maxGuesses = 10;

// guess letters
guessLetterArray = currentGuessElement.getElementsByClassName("guess-letter");

// populate first and last
topLetterArray = topEltsArray[0].getElementsByClassName("guess-letter");
botLetterArray = botEltsArray[0].getElementsByClassName("guess-letter");

// Draw each letter
for (i = 0; i < wordLength; i++) {
	topLetterArray[i].innerText = solution[i];
	botLetterArray[i].innerText = solution2[i];
}

// Add dictionary links
topEltsArray[0].append(createDictionaryLink(solution, getHyperlinkForWord(solution)));
botEltsArray[0].append(createDictionaryLink(solution2, getHyperlinkForWord(solution2)));

// populate legal moves
populateLegalMoves(currentGuessToolTip);

updateMinimumDistance(solution);


// https://github.com/apvarun/toastify-js
shortGuessToast = Toastify({
	text: "Guess is too short",
	position: "center",
	style: {
		background: warningColour,
	}
})

invalidGuessToast = Toastify({
	text: "Guess not in dictionary",
	position: "center",
	style: {
		background: warningColour,
	}
})
sameGuessToast = Toastify({
	text: "This word has already been used",
	position: "center",
	style: {
		background: warningColour,
	}
})
victoryToast = Toastify({
	text: "You win!!!",
	position: "center",
	style: {
		background: warningColour,
	},
	callback: broadcastGame
})
outOfGuessesToast = Toastify({
	text: "Out of guesses!",
	position: "center",
	style: {
		background: warningColour,
	}
})

function broadcastGame() {
	// TODO: Make artwork
}


// Handle physical keyboard click and pass the value to the key handling function
function physicalKeyClicked(e) {
	let keyNumCode = e.which;
	let keyText = e.code;
	if (
		(keyNumCode >= 65 && keyNumCode <= 90)
		|| keyText === "Backspace"
		|| keyText === "Enter"
	) {
		keyClicked(e.key);
	}
}

function updateMinimumDistance(word) {
	let dist1 = getDistance(word);
	console.log ("About to update minimum distance to " + dist1);
	distanceBox.innerText = "minimum distance:" + dist1;
}

// On keyboard key click
function keyClicked(letter) {
	// Delete (last) letter
	if (letter === "Backspace") {
		if (guessedWord.length > 0) {
			guessedWord = guessedWord.slice(0, -1);
		}
	}
	// Append new letter
	else if (
		(guessedWord.length < wordLength)
		&& (letter !== "Enter")
	) {
		guessedWord += letter.toLowerCase();
	}
	// loop through guessedWord and update each guess cell with each letter
	populateGuess();

	// Guess submitted
	if (letter === "Enter") {
		let topEltWord = getWord(topEltsArray[topEltNum-1]);
		let botEltWord = getWord(botEltsArray[0]);
		if (validateGuess(topEltWord)) {
			guessCount += 1;
			guessesBox.innerText = "guesses remaining:" + (maxGuesses - guessCount);
			updateMinimumDistance(guessedWord);
			updateGuess(topEltWord, botEltWord);
		}
	}
}

// Display letters for the current guess on screen every time the user touches a keyboard key
function populateGuess() {
	let guessedLetters = guessedWord.length;
	
	// Draw each letter
	for (let i = 0; i < guessedLetters; i++) {
		guessLetterArray[i].innerText = guessedWord[i];
	}

	// Ensure squares are empty if the guess has less than wordLength letters
	for (let i = guessedLetters; i < wordLength; i++) {
		guessLetterArray[i].innerText = "";
	}
}

// is it an edit?
function compareEdit(word1, word2) {
	let word1Array = word1.split("");
	let word2Array = word2.split("");
	let singleDiff = false;
	for (let i = 0; i < word1Array.length; i++) {
		if (word1Array[i] === word2Array[i]) {
			continue;
		}
		singleDiff = !singleDiff;
		if (!singleDiff) {
			return false;
		}
	}
	return singleDiff;
}

// compare guess to solution
function compareToSolution(guessedWord, mySolution) {
	// is it a permutation? Sort letters of guess
	let sortGuess = guessedWord.split("").sort().join("");
	let sortSolution = mySolution.split("").sort().join("");

	if (sortGuess === sortSolution) {
		return true;
	}
	
	// is it an edit?
	return compareEdit(guessedWord, mySolution);
}

// Validate and show toasts
function validateGuess(topEltWord) {
	let guessLength = guessedWord.length;
	if (guessLength < wordLength) {		  
		shortGuessToast.showToast();
		return false;
	}
	// Is guessedWord in the dictionary?
	if (!wordPool.includes(guessedWord)) {
		invalidGuessToast.showToast();
		return false;
	}  
	if (guessedWord === solution || guessedWord === solution2) {
		sameGuessToast.showToast();
		return false;
	}
	if (!compareToSolution(guessedWord, topEltWord)) {
		// Is guessedWord adjacent?
		let notAdjacent2Toast = Toastify({
			text: "Guess isn't adjacent to " + topEltWord,
			position: "center",
			style: {
				background: warningColour,
			}
		})
		notAdjacent2Toast.showToast();
		return false;
	}
	return true;
}

function getDistance(word) {
	// Convert to the appropriate element numbers of wordPool.
	let word1 = wordPool.indexOf(word);
	if (word1 == -1) {
		// word isn't in dictionary...
		// TODO: Assuming right now it's top word
		return minDistance;
	}
	// Get distances (in hex)
	let dist1 = parseInt(dists[word1], 16);
	console.log("Location of word " + word + " is " + word1 + " with distance " + dist1);
	return dist1;
}

function getDistanceColor(prev_word, new_word) {
	let dist1 = getDistance(prev_word);
	let dist2 = getDistance(new_word);
	if (dist2 < dist1) {
		return distColors[2];
	} else if (dist2 == dist1) {
		return distColors[1];
	} else {
		return distColors[0];
	}
}

function appendGuess(topEltWord, botEltWord) {
	let distColor = getDistanceColor(topEltWord, guessedWord);

	// topElt
	topEltNum += 1;
	let cln = cloneGuessWithColor(topEltsArray[0], "topElt-" + topEltNum, guessedWord, distColor);
	//updateDeleteButton();
	//topElts.append(deleteButton);
	topElts.append(cln);

	populateLegalMoves(guessElts.lastElementChild);
	
	// Reset guess
	guessedWord = "";
	
	for (let i = 0; i < wordLength; i++) {
		guessLetterArray[i].innerText = "";
	}
}

function updateGuess(topEltWord, botEltWord) {

	if(compareToSolution(topEltWord, guessedWord) && compareToSolution(guessedWord, botEltWord)) {
		console.log("Victory!");
		appendGuess(topEltWord, botEltWord);
		victoryToast.showToast();
		return;
	}
	if(guessCount >= maxGuesses) {
		console.log("Out of guesses");
		outOfGuessesToast.showToast();
		return;
	}

	appendGuess(topEltWord, botEltWord);
}

function getWord(myElt) {
	let myWord = "";
	let htmlLetters = myElt.getElementsByClassName("guess-letter");
	for (let i = 0; i < htmlLetters.length; i++) {
		myWord += htmlLetters[i].innerText.toLowerCase();
	}
	return myWord;
}

function getHyperlinkForWord(guessedWord) {
	// For now, just m-w
	return "https://m-w.com/dictionary/" + guessedWord;
}

function renderDictIcon() {
	let dictIconSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  
	dictIconSvg.setAttribute('width', 24);
	dictIconSvg.setAttribute('height', 24);

	dictIconSvg.setAttribute('viewBox', '0 0 512 512');
	dictIconSvg.classList.add('post-icon');
  
	let iconPath1 = document.createElementNS(
		'http://www.w3.org/2000/svg',
		'path'
	  );
	iconPath1.setAttribute(
	  'd',
	  'M511.41,217.73c-1.9-9.03-8.24-16.5-16.85-19.856l-30.2-11.74v31.05l5.72,2.22c2.58,1.008,4.483,3.25,5.05,5.95c0.58,2.71-0.26,5.54-2.22,7.5L279.14,426.61c-3.83,3.82-9.56,5.03-14.62,3.07l-43.06-16.75v31.05l30.23,11.76c17.18,6.68,36.68,2.58,49.72-10.45l202.59-202.59C510.52,236.16,513.32,226.77,511.41,217.73z'
	);
	dictIconSvg.appendChild(iconPath1);

	let iconPath2 = document.createElementNS(
		'http://www.w3.org/2000/svg',
		'path'
	  );
	iconPath2.setAttribute(
		'd',
		'M30.914,299.68c1.356-18.9,7.42-43.65,28.47-42.481l192.2,74.75c17.23,6.7,36.78,2.55,49.82-10.56l185.77-186.99c6.5-6.54,9.27-15.92,7.36-24.93c-1.91-9.02-8.24-16.47-16.83-19.81L286.67,15.37c-17.23-6.7-36.79-2.55-49.82,10.56L21.65,242.54C4.63,256.55,0,282.66,0,305.86c0,23.2,1.55,51.04,27.84,61.87l-6.2-1.45l57.94,22.53v-20.74c0-3.37,0.42-6.67,1.11-9.88l-38.94-15.15C29.37,338.35,29.36,321.5,30.91,299.68z'
	  );
	dictIconSvg.appendChild(iconPath2);

	let iconPath3 = document.createElementNS(
		'http://www.w3.org/2000/svg',
		'path'
	  );
	iconPath3.setAttribute(
	'd',
	'M111.05,352.66c-4.09,4.11-6.38,9.65-6.38,15.41v96.08l40.82-8.74l50.89,44.38v-96.05c0-5.79,2.3-11.33,6.39-15.42l16.27-16.28l-91.71-35.66L111.05,352.66z'
	);
	dictIconSvg.appendChild(iconPath3);
  
	return dictIconSvg;
}

function renderDeleteIcon() {
	let deleteIconSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
	let iconPath = document.createElementNS(
	  'http://www.w3.org/2000/svg',
	  'path'
	);
  
	deleteIconSvg.setAttribute('fill', 'none');
	deleteIconSvg.setAttribute('width', 24);
	deleteIconSvg.setAttribute('height', 24);

	deleteIconSvg.setAttribute('viewBox', '-1.7 0 20.4 20.4');
	deleteIconSvg.setAttribute('stroke', 'black');
	deleteIconSvg.classList.add('post-icon');
  
	iconPath.setAttribute(
	  'd',
	  'M16.417 10.283A7.917 7.917 0 1 1 8.5 2.366a7.916 7.916 0 0 1 7.917 7.917zm-6.804.01 3.032-3.033a.792.792 0 0 0-1.12-1.12L8.494 9.173 5.46 6.14a.792.792 0 0 0-1.12 1.12l3.034 3.033-3.033 3.033a.792.792 0 0 0 1.12 1.119l3.032-3.033 3.033 3.033a.792.792 0 0 0 1.12-1.12z'
	);

	iconPath.setAttribute('stroke-linecap', 'round');
	iconPath.setAttribute('stroke-linejoin', 'round');
	iconPath.setAttribute('stroke-width', '2');
	deleteIconSvg.appendChild(iconPath);
  
	return deleteIconSvg;
  }

function createDictionaryLink(guessedWord, guessedWordLink) {
	let dictIconSvg = renderDictIcon();
	let dictButton = document.createElement('button' + guessedWord);

	dictButton.append(dictIconSvg);
	dictButton.addEventListener('click', () => {
		if (self.opener == null) {
			var base_window = self;
		} else {
			var base_window = self.opener;
		}
		base_window.open(guessedWordLink);
	});
	return dictButton;
}

function updateDeleteButton() {
	deleteButton.append(deleteIconSvg);
	deleteButton.removeEventListener('click', deleteButton.fn);
	deleteButton.addEventListener('click', deleteButton.fn = function _deleteWord(deleteNode) {
			topEltNum -= 1;
			topElts.removeChild(topElts.lastChild);
			let topEltWord = getWord(topEltsArray[topEltNum-1]);
			updateMinimumDistance(topEltWord);
			populateLegalMoves(guessElts.lastElementChild);
			delete(deleteNode);
			if (topEltNum > 1) {
				// TODO: Add "X" button to previous entry
			}
		});
}

// Clone and initialize new guess
function cloneGuessWithColor(tr, eltId, guessedWord, distColor) {
	let cln = tr.cloneNode(true);
	cln.setAttribute('id', eltId);
	let clnLetterArr = cln.getElementsByClassName("guess-letter");
	for (let i = 0; i < clnLetterArr.length; i++) {
		clnLetterArr[i].setAttribute("style", `background-color: ${distColor}`);
		clnLetterArr[i].innerText = guessedWord.split("")[i];
	}
	
	// remove old dictionary link
	cln.removeChild(cln.lastChild); 
	// add new definition link
	cln.append(createDictionaryLink(guessedWord, getHyperlinkForWord(guessedWord)));

	updateDeleteButton();
	cln.prepend(deleteButton);
	return cln;
}

function getAdjacentWords(topWord) {
	let adjacentWords = [];
	let topWordArray = topWord.split('');

	// Get permutations and edits
	let sortedTopWord = topWord.split('').sort().join('');
	for (let i = 0; i < wordPool.length; i++) {
		let word = wordPool[i];
		if (word === topWord) {
			continue;
		}
		let sortedword = word.split('').sort().join('');
		if (sortedword === sortedTopWord) {
			adjacentWords.push(word);
			continue;
		}
		let wordArray = word.split('');
		let unmatches = 0;
		for (let j = 0; j < wordLength; j++) {
			if (topWordArray[j] !== wordArray[j]) {
				unmatches += 1;
				if (unmatches > 1) {
					break;
				}
			}
		}
		if (unmatches == 1) {
			adjacentWords.push(word);
		}
	}
	return adjacentWords;
}

// populate legal moves tooltip.
function populateLegalMoves(currentGuessToolTip) {
	let topWord = getWord(topEltsArray[topEltNum-1]);
	let adjacentWords = getAdjacentWords(topWord);
	currentGuessToolTip.innerHTML = 'Legal moves<span class="tooltiptext">' +adjacentWords +'</span>';
}
