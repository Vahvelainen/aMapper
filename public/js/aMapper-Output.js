import { normalizedCentroids, cosineDiff } from './SphericalKmeans.js'

export function setOutput(raw_clusters, docs, tf_idf, words) {
  raw_clusters = sortByLength(raw_clusters);
  let output = findClusterIndexes(tf_idf, raw_clusters);

  const outElem = $('#aMapper-output')[0];
  outElem.innerHTML = '';
  
  const centroids = normalizedCentroids(raw_clusters);
  
  for (const i in output) {
    const group = output[i];
    const article = document.createElement("article");
    const heading = document.createElement("h3");
    if (i > 0) {
      article.classList.add('hidden');
    }
    
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
     const div = document.createElement("div");
     const number = document.createElement("h4");
     number.innerHTML = index;
     const p = document.createElement("p");
     p.innerHTML = docs[index];
     div.append(number, p);
     
     
     //separate thizz also
     const dist_p = document.createElement("p");
     dist_p.innerHTML = 'Distance: '+ cosineDiff(centroids[i], tf_idf[index]);
     div.append(dist_p);
     article.append(div);   
    });
    outElem.append(article);
  }

  //this is nor optimal either but works for now
  $('#aMapper-prev-cluster')[0].addEventListener("click", function(event){
    event.preventDefault();
    const articles = $('#aMapper-output > article')
    const K = articles.length;
    for (let i = 0; i < K; i++) {
      if (!articles[i].classList.contains('hidden')) {
        articles[i].classList.add('hidden')
        articles[Math.max(i-1, 0)].classList.remove('hidden');
        break;
      }
    }
  });
  
  $('#aMapper-next-cluster')[0].addEventListener("click", function(event){
    event.preventDefault();
    const articles = $('#aMapper-output > article')
    const K = articles.length;
    for (let i = 0; i < K; i++) {
      if (!articles[i].classList.contains('hidden')) {
        articles[i].classList.add('hidden')
        articles[Math.min(i+1, K-1)].classList.remove('hidden');
        break;
      }
    }
  });
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