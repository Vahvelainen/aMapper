import { splitAndFilterDocs, splitAndFilterWordsFromDocs, lowerAndRemoveSpecialsFromArray } from './SplitsAndFilters.js'
import { TF_IDF } from './TF-IDF.js'
import { KMeans, centroidsByIndexes, normalizedCentroidsByIndexes, cosineSim } from './KMeans.js'

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

function updateWordAndDocumentCount() {
  //not DRY
  const data = $('#aMapper-input-data')[0].value;
  const splitter = splitters[ $('#aMapper-input-separator')[0].value ];
  const docs = splitAndFilterDocs(data, splitter);
  const words = splitAndFilterWordsFromDocs(docs, splitter);
  
  $('#aMapper-word-count')[0].innerHTML = words.length;
  $('#aMapper-document-count')[0].innerHTML = docs.length;
}

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
  const tf_idf = TF_IDF(words, docs);

  //KMeans.js
  let clusters = KMeans(tf_idf, K, 1);
  clusters = sortByLength(clusters);

  //should be wild
  console.log(centroidsByIndexes(tf_idf, clusters));
  //should be only between 0 and one
  console.log(normalizedCentroidsByIndexes(tf_idf, clusters));

  setOutput(clusters, og_docs, tf_idf, words);
}

function setOutput(output, docs, tf_idf, words) {
  const outElem = $('#aMapper-output')[0];
  outElem.innerHTML = '';

  const centroids = normalizedCentroidsByIndexes(tf_idf, output);

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
      //some day write index here aswell
      const number = document.createElement("h4");
      number.innerHTML = index;
      const p = document.createElement("p");
      p.innerHTML = docs[index];
      article.append(number, p);

      //separate thizz also
      const dist_p = document.createElement("p");
      dist_p.innerHTML = 'Distance: '+ cosineSim(centroids[i], tf_idf[index]);
      article.append(dist_p);
    })
    outElem.append(article);
  }
}

function sortByLength(arr) {
  arr.sort(function(a, b) { 
    return a.length - b.length;
  });
  return arr;
} 