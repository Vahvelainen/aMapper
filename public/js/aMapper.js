import { KMeans } from './KMeans.js'

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
  const TF_IDF = tfIdf(words, docs);
  const clusters = KMeans(TF_IDF, 3, 10);
  //findNearestPair(TF_IDF); //using this to log ditance mtrix to validate results a bit
  //KMEans does't quarentee best results so no worries if doesnt match nearest neighbours
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
  //pitäis jättää 
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

function tfIdf(words, docs) {
  //TF-IDF vecktor calculation

  //Go over each unique word and calculate its document frequency
  let docFs = []; //taulukon pituudeksi tulee sama ku sanoilla
  words.forEach(function(word){
    let docF = 0;
    docs.forEach(function(doc){
      const docArr = doc.split(' '); //If it works, dont optimize it
      if (countOccurrences(docArr, word)) {
        docF ++;
      }
    });
    docFs.push( docF / docs.length);
  });

  //Go trough each doc and each word to calculate its term frequency, and its TF-IDF representation
  let termFs = []; //term frequesnsies for debugging
  let tf_idf = [];
  docs.forEach(function(doc){
    const docArr = doc.split(' ');
    let termF = [];
    let tf_idf_vector = [];
    for (const i in words) {
      const word = words[i];
      const freq = countOccurrences(docArr, word) / docArr.length;
      termF.push(freq);
      const rep = freq * Math.log10(1 / docFs[i]);
      tf_idf_vector.push(rep);
    }
    termFs.push(termF);
    tf_idf.push(tf_idf_vector);
  });

  return tf_idf;
}

function replaceAll(str, find, replace) {
  return str.replace(new RegExp(find, 'g'), replace);
}

function countOccurrences(arr, find) {
  let counts = 0;
  arr.forEach(function(elem){
    if (elem == find) {
      counts ++;
    }
  });
  return counts;
}
