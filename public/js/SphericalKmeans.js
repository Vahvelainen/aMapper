export function SphericalKmeans(data, K = 2, trackCount = 1, iteration_limit = 20, tolerance = 1e-15 ) { 
  //Empty cluster occurs only anyore when K is too big for the data, which is good
  let bestClusters = [];
  let minDistTotal = Infinity;

  //start tracks and find the one with lowest total distance from centers
  for (let i = 0; i < trackCount; i++) {
    const track = SphericalKmeansTrack(data, K, iteration_limit, tolerance);
    const clusters = track.clusters;
    const distTotal = track.distTotal;
    if (distTotal < minDistTotal) {
      bestClusters = clusters;
      minDistTotal = distTotal;
    }
  }
  const sortedClusters = sortClustersByDistanceToCenter(bestClusters);
  return sortedClusters;
}

function SphericalKmeansTrack(data, K, iteration_limit, tolerance) {
    let centers = pickRandomItems(data, K);
    let clusters = [];
    let centers_moved = true;
    let old_centers = centers; //for debuggin
    let penultimate_centers = []; //for debuggin
    let iteration_count = 0; //for setting a maximum
    let distTotal = Infinity; //for comparing tracks
    //Iterate clusters
    while (centers_moved) {
      //Map data points to nearest center
      const mtc = mapToCenters(data, centers);
      clusters = mtc.clusters;
      distTotal = mtc.distTotal;

      //Calclulate new center based on formed clusters
      let new_centers = normalizedCentroids(clusters); 

      //Quit if centers havent moved past tolerance
      let cenDistances = sumOfDistances(centers, new_centers);
      if ( cenDistances <= tolerance ) { 
        centers_moved = false;
      }
      
      iteration_count ++;
      penultimate_centers = centers;
      centers = new_centers;
      
      //only allows "iteration_limit" iteration before giving up
      if ( iteration_count >= iteration_limit ) { 
        centers_moved = false;
        console.log('One KMean iteration got over limit and had to stop');
        console.log('centers moved total of: ' + cenDistances);
        console.log('iterations: ' +iteration_count);
      }
    }
    return {clusters: clusters, distTotal: distTotal};
}

function sortClustersByDistanceToCenter(clusters) {
  const centers = normalizedCentroids(clusters);
  let sortedClusters = [];
  for (const i in clusters) {
    const cluster = clusters[i];
    const center = centers[i];
    cluster.sort(function(a, b) {
      const a_dist = cosineDiff(center, a); 
      const b_dist = cosineDiff(center, b); 
      return a_dist - b_dist;
    });
    //for validating this works
    //let distances = [];
    //cluster.forEach(function(index){
    //  const dist = cosineDiff(center, index); 
    //  distances.push(dist);
    //});
    //console.log(distances);
    sortedClusters.push(cluster);
  }
  return sortedClusters;
}

function pickRandomItems(data, K) {
  //create array with the items in random order to pick centers from
  const rndData = data.slice(0).sort(function() { 
    return 0.5 - Math.random();
  });
  //pick K number of document vectors to be centers
  return rndData.slice(0, K);
}

function mapToCenters(data, centers) {
  //returns array of [clusters as TF-IDFs, distTotal as sum of every distance between data-item and centroids] 
  //initiate clusters
  let clusters = [];
  for (const center in centers) {
    clusters.push([]);
  }
  //assign each vector to a nearest center by pushing it the cluster
  let distTotal = 0;
  for (const docI in data) { //could be forEach now
    const doc = data[docI];
    let minDist = Infinity;
    let minI = -1;
    for (const centI in centers) {
      const center = centers[centI];
      const dist = cosineDiff(doc, center);
      if (dist < minDist) {
        minDist = dist;
        minI = centI
      }
    }
    clusters[minI].push(doc);
    distTotal += minDist;
  }
  //remove empty clusters, if happened (should not be common)
  const fltrd_clusters = clusters.filter(cluster => cluster.length > 0);

  return {clusters: fltrd_clusters, distTotal: distTotal};
}

export function normalizedCentroids(clusters) {
  //remove empty clusters
  const populated_clusters = clusters.filter(cluster => cluster.length > 0);
  
  ///initiate centroids
  let centroids = [];
  populated_clusters.forEach(function(cluster){
    const centroid = normalizedCentroid(cluster)
    centroids.push(centroid);
  });

  return centroids;
}

export function normalizedCentroid(cluster) {
  const V = cluster[0].length;  
  const N = cluster.length;
  
  let centroid = [];
  for (let axis = 0; axis < V; axis++) {
    centroid.push(0);
  }

  cluster.forEach( vector => {
    const max = Math.max(...vector);
    for (const axis in centroid) {
      const loc = vector[axis];
      const norm_loc = loc / max; 
      centroid[axis] += norm_loc / N; //divide by N to get the average
    }
  });

  return centroid;
}

function sumOfDistances(a, b) {
  if (a.length != b.length) {
    return Infinity; 
  }
  let distSum = 0;
  for ( const i in a) {
    const dist = cosineDiff(a[i], b[i]);
    distSum += dist;
  }
  return distSum;
}

//function loosely from https://stackoverflow.com/questions/51362252/javascript-cosine-similarity-function
export function cosineDiff(A,B){
  if (A.length == 0 || B.length == 0) {
    //should never be
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
  return 1 - similarity;
}
