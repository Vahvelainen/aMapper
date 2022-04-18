console.log('This code here will run');

$('#aMapper-submit')[0].addEventListener("click", function(event){
  event.preventDefault();
  sendData();
});

function sendData() {
  const data = $('#aMapper-input-data')[0].value;
  setOutput(data)
  console.log(data);
}

function setOutput(output) {
  $('#aMapper-output')[0].innerHTML = output;
}