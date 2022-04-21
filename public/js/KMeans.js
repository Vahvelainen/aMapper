export function KMeans(data, K, trackCount = 10) { 
  //Empty cluster occurs only anyore when K is too big for the data, which is good
  let bestClusters = [];
  let minDistTotal = Infinity;

  //start tracks and find the one with lowest total distance from centers
  for (let i = 0; i < trackCount; i++) {
    const track = KMeansTrack(data, K);
    const clusters = track[0]
    const distTotal = track [1];
    if (distTotal < minDistTotal) {
      bestClusters = clusters;
      minDistTotal = distTotal;
    }
  }
  const sortedCluster = sortClustersByDistanceToCenter(data, bestClusters)
  return sortedCluster;
}

function KMeansTrack(data, K) {
    //put document indexes into nearest clusters
    let centers = pickRandomItems(data, K);
    let clusters = [];
    let centers_moved = true;
    let old_centers = centers; //only for debuggin
    let penultimate_centers = []; //only for debuggin
    let iteration_count = 0; //only for debugging
    let distTotal = Infinity; //for comparing tracks
    while (centers_moved) {
      const mtc = mapToCenters(data, centers);
      clusters = mtc[0];
      distTotal = mtc[1];
      //calculate new centers
      let new_centers = centroidsByIndexes(data, clusters);
      let cenDistances = sumOfDistances(centers, new_centers);
      if ( cenDistances == 0 ) { 
        centers_moved = false;
      }
      //only allows 102 iteration before giving up
      //should not happen ever but better safe than sorry
      if ( iteration_count > 100 ) { 
        centers_moved = false;
        console.log('One KMean iteration got stuck and had to stop');
        console.log('center distance: ' + cenDistances);
      }
      iteration_count ++;
      penultimate_centers = centers;
      centers = new_centers;
    }
    return [clusters, distTotal];
}

function sortClustersByDistanceToCenter(data, clusters) {
  const centers = centroidsByIndexes(data, clusters);
  let sortedClusters = [];
  for (const i in clusters) {
    const cluster = clusters[i];
    const center = centers[i];
    cluster.sort(function(a, b) { 
      const a_dist = manhattanDist(center, data[a]); 
      const b_dist = manhattanDist(center, data[b]); 
      return a_dist - b_dist;
    });
    //for validating this works
    //let distances = [];
    //cluster.forEach(function(index){
    //  const dist = manhattanDist(center, data[index]); 
    //  distances.push(dist);
    //});
    //console.log(distances);
    sortedClusters.push(cluster);
  }
  return sortedClusters;
}

function pickRandomItems(data, K) {
  //create array with the items random order to pick centers from
  const rndData = data.slice(0).sort(function() { 
    return 0.5 - Math.random();
  });
  //pick K number of document vectors to be centers
  return rndData.slice(data.length-K);
}

function mapToCenters(data, centers) {
  //returns array of [clusters by its data indexes, distTotal as sum of every distance between data-item and centroids] 
  //initiate clusters
  let clusters = [];
  for (const center in centers) {
    clusters.push([]);
  }
  //assign each vector to a nearest center by pushing its index to the cluster
  let distTotal = 0;
  for (const docI in data) {
    const doc = data[docI];
    let minDist = Infinity;
    let minI = -1;
    for (const centI in centers) {
      const center = centers[centI];
      const dist = manhattanDist(doc, center);
      //manhattanDist causes less empty clusters but we'll keep euclidean in mind aswell
      if (dist < minDist) {
        minDist = dist;
        minI = centI
      }
    }
    clusters[minI].push(docI);
    distTotal += minDist;
  }
  return [clusters, distTotal];
}

export function centroidsByIndexes(data, clusters) {
  const V = data[0].length;
  let centroids = [];
  clusters.forEach(function(cluster) {
    let center = [];
    //go trough each axis of each vector
    if (cluster.length > 0) {
      for (let axis = 0; axis < V; axis++) {
        let loc = 0.;
        cluster.forEach(function(doc){
          loc += data[doc][axis];
        });
        //the average of coordinates
        center.push( loc / cluster.length ); 
      }
    }
    centroids.push(center);
  });
  return centroids;
}

export function normalizedCentroidsByIndexes(data, clusters) {
  const V = data[0].length;
  let centroids = [];

  ///initiate centroids
  for (const cluster_i in clusters) {
    centroids.push( [] );
  }

  //are we going to normalize by the cluster itself or by all the tf-ifdf data???
  //I call all tf-idf data bc why not

  //go trough each axis
  for (let axis = 0; axis < V; axis++) {
    //calculate range of axis here

    // take one axis and calculate the range
    let data_axis = data.map(function(row) { return row[axis]; });
    const axis_max = Math.max(...data_axis);
    const axis_min = Math.min(...data_axis); //min is for almostsure going to be zero
    const axis_range = axis_max - axis_min;

    //go trough each cluster
    for (const cluster_i in clusters) {
      const cluster = clusters[cluster_i];

      //Calculate average of each dimension
      if (cluster.length > 0) { //this might be important, cand divide by hundred
        let loc = 0.;
        cluster.forEach(function(doc){
          //This is what we need to normalize between zero and one
          const doc_loc = data[doc][axis];
          const norm_doc_loc = (doc_loc - axis_min) / axis_range;
          loc += norm_doc_loc;
        });
        //the average of coordinates
        centroids[cluster_i].push( loc / cluster.length ); 
      } else {
        //do something to not have empty centroids, push zero or one idk
        //Iquess 1 is technically more accurate
        //Infinity also maybe
        //or then just remove the cluster alltogether
      }

    }
    

  } //axis
  return centroids;
}

function sumOfDistances(a, b) {
  let distSum = 0;
  for ( const i in a) {
    const dist = manhattanDist(a[i], b[i]);
    distSum += dist;
  }
  return distSum;
}

export function manhattanDist(a, b) {
  if (a == b) {
    return 0;
  }

  let d = 0;
  for (const i in a) {
    d += Math.abs( a[i] - b[i] )
  }
  return d;
}

export function sqrEuclideanDist(a, b) {
  if (a == b) {
    return Infinity;
  }
  let d = 0;
  for (const i in a) {
    d += Math.abs( a[i] - b[i] )**2
  }
  return d;
}

//According to "internet" cosine Similarity is best for TF-IDF
//However, it needs its own normalized way of caculating new center wich is going to be harder
//Additionally, there are better initalisation and center calculating methods for this spherical K-Means (Kim & Cho 2020)
//function from https://stackoverflow.com/questions/51362252/javascript-cosine-similarity-function
export function cosineSim(A,B){
  if (A == B) {
    return 0;
  }
  if (A.length == 0 || B.length == 0) {
    return Infinity;
  }
  var dotproduct=0;
  var mA=0;
  var mB=0;
  for(let i = 0; i < A.length; i++){
      dotproduct += (A[i] * B[i]);
      mA += (A[i]*A[i]);
      mB += (B[i]*B[i]);
  }
  mA = Math.sqrt(mA);
  mB = Math.sqrt(mB);
  var similarity = (dotproduct)/((mA)*(mB));
  return similarity;
}


//Unnecesary but good for debugging
function findNearestPair(data) {
  const N = data.length;
  let minDist = Infinity;
  let minIx = -1;
  let minIy = -1;
  let distMat = [];
  for (let x = 0; x < N; x++) {
    let distVer = [];
    for (let y = 0; y < N; y++) {
      const dist = manhattanDist(data[x], data[y]);
      if (dist < minDist && dist != 0) { //dublicates doesnt count as neighbors
        minDist = dist;
        minIx = x;
        minIy = y;
      }
      distVer.push(dist);
    }
    distMat.push(distVer);
  }
  //Made to be compatible with clusters functions
  //thats why double brackets []
  console.log(distMat);
  return [[minIx, minIy]];
}