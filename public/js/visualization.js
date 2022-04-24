
const div = $('.visualization-box')[0];

let vectors = [];
vectors = makeRandomVectors(6, 2);
console.log(vectors);
drawDots(vectors, div);

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
    'left:' + x +
    '%; bottom:' + y +
    '%; background-color:' + color +
    ';' );
  dot.classList.add("dot");
  elem.append( dot );
}