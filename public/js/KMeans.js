import { manhattanDist } from './aMapper.js' //thiis. could still be better

export function KMeans(data, K) { //and this fucker needsto be splitted up
  const N = data.length;
  const V = data[0].length;

  //create random centers
  //create array with the data vectors random order to pick centers from
  const rndData = data.slice(0).sort(function() { 
    return 0.5 - Math.random();
  });
  //pick K number of document vectors to be centers
  let centers = rndData.slice(N-K);
  
  let clusters = [];
  //put document indexes into nearest clusters
  //will iterate in future
  let centers_moved = true;
  let old_centers = centers; //for debuggin
  let penultimate_centers = []; //for debuggin
  let iteration_count = 0; //for debugging
  while (centers_moved) {
    //initiate clusters
    clusters = [];
    for (const center in centers) {
      clusters.push([]);
    }

    //assign each vector to a nearest center by pushing its index to the cluster
    for (const docI in data) {
      const doc = data[docI];
      let minDist = Infinity;
      let minI = -1;
      for (const centI in centers) {
        const center = centers[centI];
        const dist = manhattanDist(doc, center);
        if (dist < minDist) {
          minDist = dist;
          minI = centI
        }
      }
      clusters[minI].push(docI);
    }

    //there is in some cases empty clusters
    //it maybe shoud be assigned a new random coordinate from data
    //this will lead to great confusion if amoutn of clusters is too high
    //program can auto reduce amount of clusters if this happens
    //empty clusters seem to be because of too little clusters for the data (unintuivitely)
    //program could then add one kluster more
    //This might not really be e problem when multiple tracks are rund (maybe like 50?)
  
    //console.log(centers);
    //calculate new centers
    let new_centers = [];
    clusters.forEach(function(cluster) {
      let center = [];
      if (cluster.length > 0) {
        for (let axis = 0; axis < V; axis++) {
          let loc = 0.;
          cluster.forEach(function(doc){
            loc += data[doc][axis];
          });
          //the average of coordinates should be fine right?
          center.push( loc / cluster.length ); 
        }
      }
      //go trough each axis of the vectors
      new_centers.push(center);
    });

    console.log('iterate!')

    //count total distance between old and new centers
    let cenDistances = 0;
    for ( const i in centers) {
      const dist = manhattanDist(centers[i], new_centers[i]);
      cenDistances += dist;
    }
    
    if ( cenDistances == 0 ) { 
      centers_moved = false;
      console.log('made it!!!')
    }

    //only allows 102 iteration before giving up
    //should not happen but baetter safe than sorry
    if ( iteration_count > 100 ) { 
      centers_moved = false;
      console.log('an iteration got stuck and had to stop')
      console.log('center distance: ' + cenDistances)
    }
    
    iteration_count ++;
    penultimate_centers = centers;
    centers = new_centers;
  }

  //palautus muotoa [[custerin indeksit järjestyksessä etäisyys keskustasta], seuraava clusteri...]
  //aka clusters (ei oo sortattu vielä)
  return clusters;
}