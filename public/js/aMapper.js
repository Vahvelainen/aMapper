import { KMeans } from './KMeans.js'
import { TF_IDF } from './TF-IDF.js'

$('#aMapper-submit')[0].addEventListener("click", function(event){
  event.preventDefault();
  sendData();
});

function sendData() {
  const data = $('#aMapper-input-data')[0].value;
  const splitter = '\n'; //only linebreaks for starter
  const words = splitWords(data, splitter);
  console.log('Individual words: ' + words.length);
  const docs = splitDocs(data, splitter);
  console.log('Documents: ' + docs.length);
  const tf_idf = TF_IDF(words, docs);
  const clusters = KMeans(tf_idf, 7, 10);
  setOutput(clusters, docs);
}

function setOutput(output, docs) {
  const outElem = $('#aMapper-output')[0];
  outElem.innerHTML = '';
  output.forEach(function(group){
    const article = document.createElement("article");
    const heading = document.createElement("h4");
    heading.innerHTML = 'Group: ' + group; //yeah, this could be better but works for now
    article.append(heading);
    group.forEach(function(index){
      //some day write index here aswell
      const p = document.createElement("p");
      p.innerHTML = docs[index];
      article.append(p);
    })
    outElem.append(article);
  });
}

function splitDocs(data, splitter) {
  const docs = data.toLowerCase().split(splitter); 
  return docs.filter(function (el) { //filter empty ones out
    return el != '';
  });
}

function splitWords(data, splitter) {
  const word_seq = replaceAll(data.toLowerCase(), splitter, ' ').split(' ');
  const words = [...new Set(word_seq)]; //remove duplicates
  return words.filter(function (el) { //filter empty ones out
    return el != '';
  });
}

//Unnecesary but good for debugging
function findNearestPair(data) {
  const N = data.length;
  let minDist = Infinity;
  let minIx = -1;
  let minIy = -1;
  let distMat = [];
  for (let x = 0; x < N; x++) {
    let distVer = [];
    for (let y = 0; y < N; y++) {
      const dist = manhattanDist(data[x], data[y]);
      if (dist < minDist && dist != 0) { //dublicates doesnt count as neighbors
        minDist = dist;
        minIx = x;
        minIy = y;
      }
      distVer.push(dist);
    }
    distMat.push(distVer);
  }
  //Made to be compatible with clusters functions
  //thats why double brackets []
  console.log(distMat);
  return [[minIx, minIy]];
}

export function manhattanDist(a, b) {
  if (a == b) {
    return 0;
  }

  let d = 0;
  for (const i in a) {
    d += Math.abs( a[i] - b[i] )
  }
  return d;
}

export function sqrEuclideanDist(a, b) {
  //euclidinen etäisyys funkkari tänne
  if (a == b) {
    return Infinity;
  }
  let d = 0;
  for (const i in a) {
    d += Math.abs( a[i] - b[i] )**2
  }
  return d;
}

function replaceAll(str, find, replace) {
  return str.replace(new RegExp(find, 'g'), replace);
}
