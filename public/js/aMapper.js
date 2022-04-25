import { splitAndFilterDocs, splitAndFilterWordsFromDocs, lowerAndRemoveSpecialsFromArray } from './SplitsAndFilters.js'
import { TF_IDF } from './TF-IDF.js'
import { KMeans, normalizedCentroids, cosineDiff } from './KMeans.js'

const splitters = [
  '\n',
  '.',
  ',',
  ':',
  ';'
];

$('#aMapper-input-data')[0].addEventListener("change", function(event){
  updateWordAndDocumentCount();
});
$('#aMapper-input-separator')[0].addEventListener("change", function(event){
  updateWordAndDocumentCount();
});


$('#aMapper-submit')[0].addEventListener("click", function(event){
  event.preventDefault();
  sendData();
});

function sendData() {
  //Read from inputs
  const data = $('#aMapper-input-data')[0].value;
  const splitter = splitters[ $('#aMapper-input-separator')[0].value ];
  const K = $('#aMapper-input-K')[0].value;
  
  //SplitsAndFilters.js
  const og_docs = splitAndFilterDocs(data, splitter);
  const docs = lowerAndRemoveSpecialsFromArray(og_docs);
  const words = splitAndFilterWordsFromDocs(docs, splitter);
  
  //TF-IDF.js
  const tf_idf = TF_IDF(words, docs); //takes most amount of time with large quantitites
  
  //KMeans.js
  let raw_clusters = KMeans(tf_idf, K, 10);
  raw_clusters = sortByLength(raw_clusters);
  let clusters = findClusterIndexes(tf_idf, raw_clusters);
  
  setOutput(clusters, og_docs, tf_idf, words, raw_clusters);
}

function setOutput(output, docs, tf_idf, words, raw_clusters) {
  const outElem = $('#aMapper-output')[0];
  outElem.innerHTML = '';
  
  const centroids = normalizedCentroids(raw_clusters);
  
  for (const i in output) {
    const group = output[i];
    const article = document.createElement("article");
    const heading = document.createElement("h3");
    
    
    //separate thizz
    let best_wscore = 0;
    let best_w_i = -1;
    let secondbest_w_i = -1;
    for (const word_index in words) {
      let word_score = 0;
      group.forEach(function(document_id) {
        word_score += tf_idf[document_id][word_index];
      });
      if (word_score > best_wscore) {
        best_wscore = word_score;
        secondbest_w_i = best_w_i;
        best_w_i = word_index;
      }
    }
    heading.innerHTML =  'Group: ' + words[best_w_i] + ' ' + words[secondbest_w_i];
    article.append(heading);
    
   
   group.forEach(function(index){
     const number = document.createElement("h4");
     number.innerHTML = index;
     const p = document.createElement("p");
     p.innerHTML = docs[index];
     article.append(number, p);
     
     
     //separate thizz also
     const dist_p = document.createElement("p");
     dist_p.innerHTML = 'Distance: '+ cosineDiff(centroids[i], tf_idf[index]);
     article.append(dist_p);
     
    });
    outElem.append(article);
  }
}

function updateWordAndDocumentCount() {
  //not DRY
  const data = $('#aMapper-input-data')[0].value;
  const splitter = splitters[ $('#aMapper-input-separator')[0].value ];
  const docs = splitAndFilterDocs(data, splitter);
  const words = splitAndFilterWordsFromDocs(docs, splitter);
  
  $('#aMapper-word-count')[0].innerHTML = words.length;
  $('#aMapper-document-count')[0].innerHTML = docs.length;
}

function findClusterIndexes (tf_idf, raw_clusters) {
  let index_clusters = [];
  raw_clusters.forEach(raw_cluster => {
    let index_cluster = [];
    raw_cluster.forEach(vector => {
        const index = findIndexFromArrays(tf_idf, vector);
        index_cluster.push(index);
      });
    index_clusters.push(index_cluster);
  });
  return index_clusters;
}

function findIndexFromArrays (matrix, vector) {
  const V = vector.length;
  const found = matrix.findIndex(element => {
    let isSame = true;
    for (let i = 0; i < V; i++) {
      if (element[i] != vector[i]) {
        isSame = false;
        i = V;
      }
    }
    return isSame;
  });
  return found;
}

function sortByLength(arr) {
  arr.sort(function(a, b) { 
    return a.length - b.length;
  });
  return arr;
} 