export function TF_IDF(words, docs) {
  //TF-IDF vector calculation

  //Word document frequency
  let docFs = [];
  words.forEach(function(word){
    let docF = 0;
    docs.forEach(function(doc){
      const docArr = doc.split(' '); //split prevents shorter words from matching to longer ones
      if (docArr.includes(word)) {
        docF ++;
      }
    });
    docFs.push( docF / docs.length);
  });

  //Term frequency, and TF-IDF representation
  let termFs = []; //only for debugging
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

function countOccurrences(arr, find) {
  let counts = 0;
  arr.forEach(function(elem){
    if (elem == find) {
      counts ++;
    }
  });
  return counts;
}
