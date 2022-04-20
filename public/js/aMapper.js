import { KMeans, centroidsByIndexes } from './KMeans.js'
import { TF_IDF } from './TF-IDF.js'

$('#aMapper-submit')[0].addEventListener("click", function(event){
  event.preventDefault();
  sendData();
});

const splitters = [
  '\n',
  '.',
  ',',
  ':',
  ';'
];

function sendData() {
  const data = $('#aMapper-input-data')[0].value;
  const splitter = splitters[ $('#aMapper-input-separator')[0].value ];
  const K = $('#aMapper-input-K')[0].value;

  const og_docs = splitDocs(data, splitter);
  const docs = removeSpecialsFromArray(og_docs);
  const words = splitWordsFromDocs(docs, splitter);
  
  console.log('Documents: ' + docs.length);
  console.log('Individual words: ' + words.length);
  
  const tf_idf = TF_IDF(words, docs);
  const clusters = KMeans(tf_idf, K, 10);

  setOutput(clusters, og_docs, tf_idf, words);
}

function setOutput(output, docs, tf_idf, words) {
  const outElem = $('#aMapper-output')[0];
  outElem.innerHTML = '';

  const centroids = centroidsByIndexes(tf_idf, output);

  for (const i in output) {
    const group = output[i];
    const article = document.createElement("article");
    const heading = document.createElement("h3");

    //separate thizz
    let key_words = [];
    group.forEach(function(document_id) {
      const arr = tf_idf[document_id];
      const best_word = words[ arr.indexOf( Math.max( ...arr ) ) ];
      const str = ' '.concat(best_word);
      key_words.push(str);
    });

    heading.innerHTML =  'Group: ' + key_words.slice(0, 2);
    article.append(heading);

    group.forEach(function(index){
      //some day write index here aswell
      const number = document.createElement("h4");
      number.innerHTML = index;
      const p = document.createElement("p");
      p.innerHTML = docs[index];
      article.append(number, p);

      //separate thizz also
      const dist_p = document.createElement("p");
      dist_p.innerHTML = 'Distance: '+ manhattanDist(centroids[i], tf_idf[index]);
      article.append(dist_p);
    })
    outElem.append(article);
  }
}

function splitDocs(data, splitter) {
  const docs = replaceAll(data, '\n', '\n ').split(splitter);
  return removeNonWordsFromArray(docs);
}

function splitWordsFromDocs(docs, splitter) {
  let word_seq = [];
  docs.forEach(function(doc) {
    const doc_words = replaceAll(doc, splitter, ' ').split(' ');
    word_seq = word_seq.concat(doc_words);
  });
  word_seq = removeSpecialsFromArray(word_seq);
  const words = [...new Set(word_seq)]; //remove duplicates
  return words;
}

function removeSpecialsFromArray(arr) {
  //also lower capitals
  let new_arr = [];
  arr.forEach(function(item){
    new_arr.push(removeSpecialsAndLower(item));
  });
  return removeNonWordsFromArray(new_arr);
}

function removeNonWordsFromArray(arr) {
  return arr.filter(function (item) {
    return replaceAll(removeSpecialsAndLower(item), ' ', '') != '';
  });
}

function removeSpecialsAndLower(str) {
  const new_srt = str.replace(/[^A-ZÅÄÖa-zåäö ]/g, '');
  return new_srt.toLowerCase();
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
  //not my finest but works enough for now
  if (find.match[/[ `!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/] ) {
    //not a special chracter
    return str.replace(new RegExp(find, 'g'), replace);
  } else {
    //is a special character
    return str.replace(new RegExp(find + '\-', 'g'), replace);
  }
}
