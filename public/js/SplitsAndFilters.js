export function splitAndFilterDocs(data, splitter) {
  const docs = replaceAll(data, '\n', '\n ').split(splitter);
  return removeNonWordsFromArray(docs);
}

export function splitAndFilterWordsFromDocs(docs, splitter) {
  let word_seq = [];
  docs.forEach(function(doc) {
    const doc_words = replaceAll(doc, splitter, ' ').split(' ');
    word_seq = word_seq.concat(doc_words);
  });
  word_seq = lowerAndRemoveSpecialsFromArray(word_seq);
  const words = [...new Set(word_seq)]; //remove duplicates
  return words;
}

export function lowerAndRemoveSpecialsFromArray(arr) {
  let new_arr = [];
  arr.forEach(function(item){
    new_arr.push(lowerAndremoveSpecials(item));
  });
  return removeNonWordsFromArray(new_arr);
}

function removeNonWordsFromArray(arr) {
  return arr.filter(function (item) {
    let fltrdItem = replaceAll(lowerAndremoveSpecials(item), ' ', '');
    fltrdItem = fltrdItem.replace(/\s+/g, ' ').trim(); //Still leves some whitespaces into docs but works enough for now
    return fltrdItem.length > 1;
  });
}

function lowerAndremoveSpecials(str) {
  const new_srt = str.replace(/[^A-ZÅÄÖa-zåäö ]/g, ' ');
  return new_srt.toLowerCase();
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