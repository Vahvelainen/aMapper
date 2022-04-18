
$('#aMapper-submit')[0].addEventListener("click", function(event){
  event.preventDefault();
  sendData();
});

function sendData() {
  const data = $('#aMapper-input-data')[0].value;
  const splitter = '\n'; //only linebreaks for starter
  const words = splitWords(data, splitter);
  const docs = splitDocs(data, splitter);
  const TF_IDF = tfIdf(words, docs);
  const out = findNearestPair(TF_IDF);
  setOutput(out, docs)
}

function setOutput(output, docs) {
  const outElem = $('#aMapper-output')[0];
  outElem.innerHTML = '';
  output.forEach(function(i){
    const p = document.createElement("p");
    p.innerHTML = docs[i];
    outElem.append(p);
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
      if (dist < minDist) {
        minDist = dist;
        minIx = x;
        minIy = y;
      }
      distVer.push(dist);
    }
    distMat.push(distVer);
  }
  return [minIx, minIy];
}

function manhattanDist(a, b) {
  if (a == b) {
    return Infinity;
  }

  let d = 0;
  for (const i in a) {
    d += Math.abs( a[i] - b[i] )
  }
  return d;
}

function sqrEuclideanDist(a, b) {
  //euclidinen etäisyys funkkari tänne
  return 0;
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
  //termFs matrix (term frequensies in documents is commented out for being unneccesary but important for debugging)
  //let termFs = [];
  let tf_idfs = [];
  docs.forEach(function(doc){
    const docArr = doc.split(' ');
    //let termF = [];
    let tf_idf = [];
    for (const i in words) {
      const word = words[i];
      const freq = countOccurrences(docArr, word) / docArr.length;
      //termF.push(freq);
      const rep = freq * Math.log10(1 / docFs[i]);
      tf_idf.push(rep);
    }
    //termFs.push(termF);
    tf_idfs.push(tf_idf);
  });

  return tf_idfs;
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
