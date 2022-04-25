//Co-sine sim antaa paremman scoren lähemmille seteille
//refacturoi seuraavaksi käyttämään "similarityä" distansen sijaan
//Summan sijaan siitä voi laskea vaikka kesiarvoa vaikka sama asia

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
  const sortedClusters = sortClustersByDistanceToCenter(bestClusters);
  return sortedClusters;
}

function KMeansTrack(data, K) {
    //cluster document vectors into nearest center
    let centers = pickRandomItems(data, K);
    let clusters = [];
    let centers_moved = true;
    let old_centers = centers; //only for debuggin
    let penultimate_centers = []; //only for debuggin
    let iteration_count = 0; //only for debugging
    let distTotal = Infinity; //for comparing tracks
    while (centers_moved) {
      //sometimes drops cluster away in the very first iteration
      const mtc = mapToCenters(data, centers); //check thizz
      clusters = mtc[0];
      distTotal = mtc[1];
      //calculate new centers
      let new_centers = normalizedCentroids(clusters); 

      ///now that we have deleted empty clusters, this doesnt wrk anymore :)
      let cenDistances = sumOfDistances(centers, new_centers);
      if ( cenDistances <= 0 ) { 
        centers_moved = false;
      }
      //only allows 102 iteration before giving up
      //should not happen ever but better safe than sorry
      //when it happens distances between iterations are very very small
      if ( iteration_count > 20 ) { 
        centers_moved = false;
        console.log('One KMean iteration got stuck and had to stop');
        console.log('centers moved total of: ' + cenDistances);
        console.log('iterations: ' +iteration_count);
      }
      iteration_count ++;
      penultimate_centers = centers;
      centers = new_centers;
    }
    return [clusters, distTotal];
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
  //create array with the items random order to pick centers from
  const rndData = data.slice(0).sort(function() { 
    return 0.5 - Math.random();
  });
  //pick K number of document vectors to be centers
  return rndData.slice(data.length-K);
}

function mapToCenters(data, centers) {
  //returns array of [clusters as TF-IDFs, distTotal as sum of every distance between data-item and centroids] 
  //sometimes makes empty clusters
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
  //remove empty clusters
  const fltrd_clusters = clusters.filter(cluster => cluster.length > 0);

  return [fltrd_clusters, distTotal];
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

  //go trough each axis
  cluster.forEach( vector => {
    const max = Math.max(...vector);
    //go trough each axis
    for (const axis in centroid) {
      const loc = vector[axis];
      const norm_loc = loc / max; 
      centroid[axis] += norm_loc;
    }
  });

  //divide it up by cluster length
  for (const axis in centroid) {
    centroid[axis] = centroid[axis] / N;
  }

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


//According to "internet" cosine Similarity is best for TF-IDF
//However, it needs its own normalized way of caculating new center wich is going to be harder
//Additionally, there are better initalisation and center calculating methods for this spherical K-Means (Kim & Cho 2020)
//function from https://stackoverflow.com/questions/51362252/javascript-cosine-similarity-function
export function cosineDiff(A,B){
  if (A.length == 0 || B.length == 0) {
    ///whyy doeas dos even happen
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
//anotherApproach to cosineDiff
//https://gist.github.com/jesus-seijas-sp/5feb3806f63a63dc7954482c232c4749

