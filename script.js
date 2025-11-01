// Create stars
function createStars() {
  const starsContainer = document.getElementById('stars');
  const starCount = 150;
  
  for (let i = 0; i < starCount; i++) {
    const star = document.createElement('div');
    star.className = 'star';
    star.style.width = `${Math.random() * 3 + 1}px`;
    star.style.height = star.style.width;
    star.style.left = `${Math.random() * 100}%`;
    star.style.top = `${Math.random() * 100}%`;
    star.style.animationDelay = `${Math.random() * 3}s`;
    star.style.animationDuration = `${Math.random() * 2 + 2}s`;
    starsContainer.appendChild(star);
  }
}

// Create comets
function createComet() {
  const cometsContainer = document.getElementById('comets');
  const comet = document.createElement('div');
  comet.className = 'comet';
  comet.style.left = `${Math.random() * 50}%`;
  comet.style.top = `${Math.random() * 50}%`;
  cometsContainer.appendChild(comet);
  
  setTimeout(() => {
    comet.remove();
  }, 3000);
}

createStars();
setInterval(createComet, 4000);
createComet();

// Create pop sound using Web Audio API
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
let currentSoundStyle = 2;
let hzMultiplier = 1.0;

const soundPresets = {
  0: { name: 'High Pitch', freq1Start: 1500, freq1End: 2000, freq2Start: 1200, freq2End: 1600, type1: 'sine', type2: 'sine', duration: 0.1 },
  1: { name: 'Mickey Mouse', freq1Start: 800, freq1End: 1200, freq2Start: 600, freq2End: 900, type1: 'square', type2: 'sine', duration: 0.15 },
  2: { name: 'Star Wars', freq1Start: 600, freq1End: 400, freq2Start: 400, freq2End: 250, type1: 'sine', type2: 'square', duration: 0.18 },
  3: { name: 'Deep Bass', freq1Start: 200, freq1End: 80, freq2Start: 150, freq2End: 60, type1: 'sine', type2: 'triangle', duration: 0.3 },
  4: { name: 'Low Rumble', freq1Start: 100, freq1End: 40, freq2Start: 80, freq2End: 30, type1: 'triangle', type2: 'sine', duration: 0.4 }
};

function playPopSound() {
  const now = audioContext.currentTime;
  const preset = soundPresets[currentSoundStyle];
  
  const oscillator1 = audioContext.createOscillator();
  const oscillator2 = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator1.connect(gainNode);
  oscillator2.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator1.type = preset.type1;
  oscillator2.type = preset.type2;
  
  oscillator1.frequency.setValueAtTime(preset.freq1Start * hzMultiplier, now);
  oscillator1.frequency.exponentialRampToValueAtTime(preset.freq1End * hzMultiplier, now + preset.duration);
  
  oscillator2.frequency.setValueAtTime(preset.freq2Start * hzMultiplier, now);
  oscillator2.frequency.exponentialRampToValueAtTime(preset.freq2End * hzMultiplier, now + preset.duration);
  
  gainNode.gain.setValueAtTime(0.4, now);
  gainNode.gain.exponentialRampToValueAtTime(0.01, now + preset.duration);
  
  oscillator1.start(now);
  oscillator2.start(now);
  oscillator1.stop(now + preset.duration);
  oscillator2.stop(now + preset.duration);
}

// DOM elements
const titleElement = document.getElementById('title');
const newQuoteBtn = document.getElementById('newQuoteBtn');
const regenerateBtn = document.getElementById('regenerateBtn');
const resetBtn = document.getElementById('resetBtn');
const quoteContent = document.getElementById('quoteContent');
const quoteText = document.getElementById('quoteText');
const quoteAuthor = document.getElementById('quoteAuthor');
const dateDisplay = document.getElementById('date');
const timeDisplay = document.getElementById('time');
const styleSlider = document.getElementById('styleSlider');
const styleLabel = document.getElementById('styleLabel');
const hzSlider = document.getElementById('hzSlider');
const hzLabel = document.getElementById('hzLabel');

function splitTextIntoLetters(text) {
  titleElement.innerHTML = '';
  const words = text.split(' ');
  let letterIndex = 0;
  
  words.forEach((word, wordIndex) => {
    word.split('').forEach((letter) => {
      const span = document.createElement('span');
      span.textContent = letter;
      span.style.animationDelay = `${letterIndex * 0.15}s`;
      titleElement.appendChild(span);
      letterIndex++;
    });
    
    if (wordIndex < words.length - 1) {
      const space = document.createElement('span');
      space.innerHTML = '&nbsp;';
      space.style.animation = 'none';
      titleElement.appendChild(space);
    }
  });
}

splitTextIntoLetters('Quote of the Day');

styleSlider.addEventListener('input', (e) => {
  currentSoundStyle = parseInt(e.target.value);
  styleLabel.textContent = soundPresets[currentSoundStyle].name;
});

hzSlider.addEventListener('input', (e) => {
  const value = parseInt(e.target.value);
  hzMultiplier = 0.5 + (value / 100) * 1.5;
  
  if (value < 25) {
    hzLabel.textContent = 'Very Low';
  } else if (value < 45) {
    hzLabel.textContent = 'Low';
  } else if (value < 55) {
    hzLabel.textContent = 'Medium';
  } else if (value < 75) {
    hzLabel.textContent = 'High';
  } else {
    hzLabel.textContent = 'Very High';
  }
});

// Fetch quote from API
async function fetchQuote() {
  try {
    const response = await fetch('https://api.quotable.io/random');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching quote:', error);
    return {
      content: 'The only way to do great work is to love what you do.',
      author: 'Steve Jobs',
      authorSlug: 'steve-jobs'
    };
  }
}

// Fetch author details
async function fetchAuthorDetails(authorSlug) {
  try {
    const response = await fetch(`https://api.quotable.io/authors?slug=${authorSlug}`);
    const data = await response.json();
    if (data.results && data.results.length > 0) {
      return data.results[0];
    }
    return null;
  } catch (error) {
    console.error('Error fetching author:', error);
    return null;
  }
}

// Display quote
async function displayQuote() {
  playPopSound();
  
  const quote = await fetchQuote();
  
  quoteText.textContent = `"${quote.content}"`;
  
  let authorText = `— ${quote.author}`;
  
  if (quote.authorSlug) {
    const authorDetails = await fetchAuthorDetails(quote.authorSlug);
    if (authorDetails) {
      let birthYear = null;
      let deathYear = null;
      
      if (authorDetails.dateOfBirth) {
        birthYear = new Date(authorDetails.dateOfBirth).getFullYear();
      }
      
      if (authorDetails.dateOfDeath) {
        deathYear = new Date(authorDetails.dateOfDeath).getFullYear();
      }
      
      if (birthYear || deathYear) {
        authorText += ` (${birthYear || '?'}${deathYear ? '-' + deathYear : '-'})`;
      }
    }
  }
  
  quoteAuthor.textContent = authorText;
  
  quoteContent.classList.remove('hidden');
  quoteContent.style.animation = 'none';
  setTimeout(() => {
    quoteContent.style.animation = 'quoteAppear 0.8s ease';
  }, 10);
  
  newQuoteBtn.classList.add('hidden');
  regenerateBtn.classList.remove('hidden');
}

// Reset to initial state
function resetPage() {
  newQuoteBtn.classList.remove('hidden');
  quoteContent.classList.add('hidden');
  regenerateBtn.classList.add('hidden');
  quoteText.textContent = '';
  quoteAuthor.textContent = '';
}

// Update date and time
function updateDateTime() {
  const now = new Date();
  
  const options = { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  };
  const dateString = now.toLocaleDateString('en-US', options);
  
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const seconds = now.getSeconds().toString().padStart(2, '0');
  const timeString = `${hours}:${minutes}:${seconds}`;
  
  dateDisplay.textContent = dateString;
  timeDisplay.textContent = timeString;
}

updateDateTime();
setInterval(updateDateTime, 1000);

// Event listeners
newQuoteBtn.addEventListener('click', displayQuote);
regenerateBtn.addEventListener('click', displayQuote);
resetBtn.addEventListener('click', resetPage);
