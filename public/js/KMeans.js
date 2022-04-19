import { manhattanDist, sqrEuclideanDist } from './aMapper.js' //thiis. could still be better


export function KMeans(data, K, trackCount = 10) { //and this fucker needsto be splitted up
  //there is in some cases empty clusters after iteration
  //it maybe shoud be assigned a new random coordinate from data
  //this will lead to great confusion if amoutn of clusters is too high
  //program can auto reduce amount of clusters if this happens
  //empty clusters seem to be because of too little clusters for the data (unintuivitely)
  //program could then add one kluster more
  //This might not really be e problem when multiple tracks are rund (maybe like 50?)
  let bestClusters = [];
  let minDistTotal = Infinity;

  //put document indexes into nearest clusters
  for (let i = 0; i < trackCount; i++) {
    const track = KMEansTrack(data, K);
    const clusters = track[0]
    const distTotal = track [1];
    if (distTotal < minDistTotal) {
      bestClusters = clusters;
      minDistTotal = distTotal;
    }
  }
  console.log(minDistTotal);
  //palautus muotoa [[custerin indeksit järjestyksessä etäisyys keskustasta], seuraava clusteri...]
  //aka clusters (ei oo sortattu vielä)
  return bestClusters;
}

function KMEansTrack(data, K) {
    //put document indexes into nearest clusters
    let centers = pickRandomItems(data, K);
    let clusters = [];
    let centers_moved = true;
    let old_centers = centers; //for debuggin
    let penultimate_centers = []; //for debuggin
    let iteration_count = 0; //for debugging
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
      //should not happen but baetter safe than sorry
      if ( iteration_count > 100 ) { 
        centers_moved = false;
        console.log('an iteration got stuck and had to stop');
        console.log('center distance: ' + cenDistances);
      }
  
      iteration_count ++;
      penultimate_centers = centers;
      centers = new_centers;
    }
    return [clusters, distTotal];
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

function centroidsByIndexes(data, clusters) {
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