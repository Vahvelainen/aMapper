import { splitAndFilterDocs, splitAndFilterWordsFromDocs, lowerAndRemoveSpecialsFromArray } from './SplitsAndFilters.js'
import { TF_IDF } from './TF-IDF.js'
import { SphericalKmeans2, normalizedCentroid, cosineDiff } from './SphericalKmeans.js'

const div = $('.visualization-box')[0];

//stolen from aMapper.js
const splittersCopy = ['\n','.',',',':',';'];
const dataInputFieldCopy = $('#aMapper-input-data')[0];
const splitterSelectorCopy = $('#aMapper-input-separator')[0];

$('#do-visualization')[0].addEventListener("click", function(event){
  event.preventDefault();
    //1. take data and filter it as normal
    //More stolen code from both inputs and aMapper file
    const data = dataInputFieldCopy.value;
    const splitter = splittersCopy[ splitterSelectorCopy.value ];

    const og_docs = splitAndFilterDocs(data, splitter);
    const docs = lowerAndRemoveSpecialsFromArray(og_docs);
    const words = splitAndFilterWordsFromDocs(docs, splitter);

    //2. Calculate tf-idf as normal
    const tf_idf = TF_IDF(words, docs);

    //3. start X-means mapping (write the necessary function here in htis file)
      // Function calculates the mmaximum distance
      // Function runs K-means for different K's
      // Function draws a dot after each pass
      //Would be great if dot s were named or identifies by their K somehow
    xMap(tf_idf);

});

function xMap(tf_idf) {
  console.log(tf_idf)
  if (tf_idf.length == 0) {
    drawDot([0.5 , 0.5],div);
    return
  }
  const K1_center = normalizedCentroid(tf_idf);
  const maxDiff = totalCosineDiff(K1_center, tf_idf);
  const N = tf_idf.length;

  console.log(N);
  console.log(maxDiff);

  for (let K = 1; K < N + 1; K++) {
    const diff = SphericalKmeans2(tf_idf, K, 10, 10, 1e-10)[1];
    console.log(diff);
    const X = (K-1) / (N-1);
    const Y = diff / maxDiff;
    drawDot( [X, Y] , div);
  }
}

function totalCosineDiff(centroid, array) {
  let totalDiff = 0;
  for (const i in array) {
    totalDiff += cosineDiff(centroid, array[i]);
  }
  return totalDiff
}

function makeRandomVectors(amount, length) {
  let vectors = [];
  for (let amnt = 0; amnt < amount; amnt++) {
    let vector = [];
    for (let lngth = 0; lngth < length; lngth++) {
      vector.push( Math.random() );
    }
    vectors.push(vector);
  }
  return vectors;
}

function drawDots(vectors, elem) {
  vectors.forEach(vector => { 
    drawDot(vector, elem)
  });
}

function drawDot(vector, elem, color = 'blue') {
  const dot = document.createElement('div');
  const x = vector[0] * 100;
  const y = vector[1] * 100;
  dot.setAttribute('style',
    'left:' + (x) +
    '%; bottom:' + (y) +
    '%; background-color:' + color +
    ';' );
  dot.classList.add("dot");
  elem.append( dot );
}
