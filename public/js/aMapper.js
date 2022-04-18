
$('#aMapper-submit')[0].addEventListener("click", function(event){
  event.preventDefault();
  sendData();
});

function sendData() {
  const data = $('#aMapper-input-data')[0].value;
  const splitter = '\n'; //only linebreaks for starter
  const words = splitWords(data, splitter);
  const docs = splitDocs(data, splitter);
  const out = tfIdf(words, docs);
  setOutput(out)
}

function setOutput(output) {
  $('#aMapper-output')[0].innerHTML = output;
}

function splitDocs(data, splitter) {
  const docs = data.toLowerCase().split(splitter); 
  return docs;
}

function splitWords(data, splitter) {
  const word_seq = replaceAll(data.toLowerCase(), splitter, ' ').split(' ');
  const words = [...new Set(word_seq)]; //remove duplicates
  return words;
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

function euclideanDist(a, b) {
  //euclidinen etäisyys funkkari tänne
  return 0;
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
