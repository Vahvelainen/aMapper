
const div = $('.visualization-box')[0];

let vectors = [];
vectors = makeRandomVectors(2, 2);
drawDots(vectors, div);

const center = centroid(vectors);
drawDot(center, div, 'red');

const newCenter = normalizedCentroid(vectors);
drawDot(newCenter, div, 'black');

const otherCenter = newNormalizedCentroid(vectors);
drawDot(otherCenter, div, 'green');

console.log(otherCenter);

//why cant I just use normal distance since it already gives the direction?
//according to internet, the fucker needs to be "on the arch"



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

export function otherNewNormalizedCentroid(cluster) {
  //same results as og normalizedCentroid

  const V = cluster[0].length;  

  let centroid = [];
  //go trough each axis
  for (let axis = 0; axis < V; axis++) {
    //calculate range of axis here

    // take one axis of the cluster and calculate the range from data???
    //let data_axis = data.map(function(row) { return row[axis]; });
    let data_cluster_axis = [];
    cluster.forEach(function(vector){ 
      data_cluster_axis.push( vector[axis] );
    });

    //console.log(data_cluster_axis); //yaass
    const axis_max = Math.max(...data_cluster_axis);
    const axis_min = Math.min(...data_cluster_axis); //min is for almostsure going to be zero
    const axis_range = axis_max - axis_min;

    //Calculate average of each dimension
    let loc = 0.;
    if (axis_range > 0) { //protects from NaN
      cluster.forEach(function(vector){
        //This is what we need to normalize between zero and one
        const doc_loc = vector[axis];
        loc += doc_loc;
      });
    }
    //the average of coordinates
    const avg = loc / cluster.length;
    const norm_avg = (avg - axis_min) / axis_range;

    centroid.push( norm_avg ); 
  } //axis

  return centroid;
}

export function newNormalizedCentroid(cluster) {
  const V = cluster[0].length;  
  let centroid = [];
  for (let axis = 0; axis < V; axis++) {
    centroid.push(0);
  }

  //go trough each axis
  cluster.forEach( vector => {
    const max = Math.max(...vector);
    //const min = Math.min(...vector);
    //const range = max - min;

    //go trough each axis
    for (const axis in centroid) {
      const loc = vector[axis];
      const norm_loc = loc / max; 
      //in 2D reducing the min actually DOES end up in 0 or 1
      centroid[axis] += norm_loc;
    }
  });

  //divide it up by cluster length
  const N = cluster.length;
  for (const axis in centroid) {
    centroid[axis] = centroid[axis] / N;
  }

  return centroid;
}

export function normalizedCentroid(cluster) {
  const V = cluster[0].length;  
  //are we going to normalize by the cluster itself or by all the tf-ifdf data???
  //This time we are trying with the cluster itself bc what i drew in paper n'stuff

  //Now I'm turning towards normalizing the vectors by themselves instead of by cluster

  let centroid = [];
  //go trough each axis
  for (let axis = 0; axis < V; axis++) {
    //calculate range of axis here

    // take one axis of the cluster and calculate the range from data???
    //let data_axis = data.map(function(row) { return row[axis]; });
    let data_cluster_axis = [];
    cluster.forEach(function(vector){ 
      data_cluster_axis.push( vector[axis] );
    });

    //console.log(data_cluster_axis); //yaass
    const axis_max = Math.max(...data_cluster_axis);
    const axis_min = Math.min(...data_cluster_axis); //min is for almostsure going to be zero
    const axis_range = axis_max - axis_min;

    //Calculate average of each dimension
    let loc = 0.;
    if (axis_range > 0) { //protects from NaN
      cluster.forEach(function(vector){
        //This is what we need to normalize between zero and one
        const doc_loc = vector[axis];
        const norm_doc_loc = (doc_loc - axis_min) / axis_range;
        loc += norm_doc_loc;
      });
    }
    //the average of coordinates
    centroid.push( loc / cluster.length ); 
  } //axis

  return centroid;
}

export function centroid(cluster) {
  const V = cluster[0].length;  
  //are we going to normalize by the cluster itself or by all the tf-ifdf data???
  //This time we are trying with the cluster itself bc what i drew in paper n'stuff

  let centroid = [];

  //go trough each axis
  for (let axis = 0; axis < V; axis++) {

    //Calculate average of each dimension
    let loc = 0.;

    cluster.forEach(function(vector){
      //This is what we need to normalize between zero and one
      const doc_loc = vector[axis];
      loc += doc_loc;
    });
  
    //the average of coordinates
    centroid.push( loc / cluster.length ); 
  } //axis

  return centroid;
}