import { splitAndFilterDocs, splitAndFilterWordsFromDocs, lowerAndRemoveSpecialsFromArray } from './SplitsAndFilters.js'
import { TF_IDF } from './TF-IDF.js'
import { SphericalKmeans } from './SphericalKmeans.js'
import { intitiateInputs } from './aMapper-Input.js'
import { setOutput } from './aMapper-Output.js'

intitiateInputs();

//Called from aMapper-Input.js (button submit)
export function sendData(data, splitter, K) {
  //SplitsAndFilters.js
  const og_docs = splitAndFilterDocs(data, splitter);
  const docs = lowerAndRemoveSpecialsFromArray(og_docs);
  const words = splitAndFilterWordsFromDocs(docs, splitter);
  
  //TF-IDF.js
  const tf_idf = TF_IDF(words, docs); //takes most amount of time with large quantitites
  //SphericalKmeans.js
  let raw_clusters = SphericalKmeans(tf_idf, K, 10);

  //aMapper-Output.js
  setOutput(raw_clusters, og_docs, tf_idf, words);
}