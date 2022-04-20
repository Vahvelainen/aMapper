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