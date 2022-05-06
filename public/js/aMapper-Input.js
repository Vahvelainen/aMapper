import { sendData } from './aMapper.js'
import { splitAndFilterDocs, splitAndFilterWordsFromDocs, lowerAndRemoveSpecialsFromArray } from './SplitsAndFilters.js'

const splitters = [
  '\n',
  '.',
  ',',
  ':',
  ';'
];

//Form elements
const dataInputField = $('#aMapper-input-data')[0];
const clusterAmountField = $('#aMapper-input-K')[0];
const splitterSelector = $('#aMapper-input-separator')[0];

const submitButton = $('#aMapper-submit')[0];
const exampleDataLink = $('#aMapper-example-data')[0]

const wordCount = $('#aMapper-word-count')[0];
const docCount =$('#aMapper-document-count')[0];

export function intitiateInputs() {
  
  dataInputField.addEventListener("change", function(event){
    updateWordAndDocumentCount();
  });
  splitterSelector.addEventListener("change", function(event){
    updateWordAndDocumentCount();
  });
  
  exampleDataLink.addEventListener("click", function(event){
    event.preventDefault();
    $.get('/public/quote_test.txt', function(example_txt) {
      dataInputField.value = example_txt;
      updateWordAndDocumentCount();
    });
  });
  
  submitButton.addEventListener("click", function(event){
    event.preventDefault();
      //Inputs
    const data = dataInputField.value;
    const splitter = splitters[ splitterSelector.value ];
    const K = clusterAmountField.value;
    sendData(data, splitter, K);
  });

}

function updateWordAndDocumentCount() {
  const data = dataInputField.value;
  const splitter = splitters[ splitterSelector.value ];
  let docs = splitAndFilterDocs(data, splitter);
  docs = lowerAndRemoveSpecialsFromArray(docs);
  const words = splitAndFilterWordsFromDocs(docs, splitter);
  
  wordCount.innerHTML = words.length;
  docCount.innerHTML = docs.length;
}