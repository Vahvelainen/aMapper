import { splitAndFilterDocs, splitAndFilterWordsFromDocs, lowerAndRemoveSpecialsFromArray } from './SplitsAndFilters.js'
import { TF_IDF } from './TF-IDF.js'
import { KMeans, centroidsByIndexes, manhattanDist } from './KMeans.js'

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
  //Read from inputs
  const data = $('#aMapper-input-data')[0].value;
  const splitter = splitters[ $('#aMapper-input-separator')[0].value ];
  const K = $('#aMapper-input-K')[0].value;

  //SplitsAndFilters.js
  const og_docs = splitAndFilterDocs(data, splitter);
  const docs = lowerAndRemoveSpecialsFromArray(og_docs);
  const words = splitAndFilterWordsFromDocs(docs, splitter);
  
  console.log('Documents: ' + docs.length);
  console.log('Individual words: ' + words.length);
  
  //TF-IDF.js
  const tf_idf = TF_IDF(words, docs);

  //KMeans.js
  let clusters = KMeans(tf_idf, K, 10);
  clusters = sortByLength(clusters);

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

function sortByLength(arr) {
  arr.sort(function(a, b) { 
    return a.length - b.length;
  });
  return arr;
} 