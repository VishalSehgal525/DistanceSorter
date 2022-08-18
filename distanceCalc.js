const geoCode = async (address1, address2) => {
  const url1 =
    "https://api.mapbox.com/geocoding/v5/mapbox.places/" +
    encodeURIComponent(address1) +
    ".json?access_token=pk.eyJ1IjoidmlzaGFsc2VoZ2FsIiwiYSI6ImNrdDl2dWV1MTA1emYydms0cDY0a3NnemUifQ.vqtf3FDJxiNqwygTyT9h3Q&limit=1";
  const response1 = await fetch(url1);
  let data1 = await response1.json();
  const url2 =
    "https://api.mapbox.com/geocoding/v5/mapbox.places/" +
    encodeURIComponent(address2) +
    ".json?access_token=pk.eyJ1IjoidmlzaGFsc2VoZ2FsIiwiYSI6ImNrdDl2dWV1MTA1emYydms0cDY0a3NnemUifQ.vqtf3FDJxiNqwygTyT9h3Q&limit=1";
  const response2 = await fetch(url2);
  let data2 = await response2.json();
  const longitude1 = data1.features[0].center[0];
  const longitude2 = data2.features[0].center[0];
  const latitude1 = data1.features[0].center[1];
  const latitude2 = data2.features[0].center[1];
  const long1 = longitude1 / (180 / (22 / 7));
  const long2 = longitude2 / (180 / (22 / 7));
  const lat1 = latitude1 / (180 / (22 / 7));
  const lat2 = latitude2 / (180 / (22 / 7));
  const dlat = Math.abs(lat1 - lat2);
  const dlong = Math.abs(long1 - long2);
  const a =
    Math.pow(Math.sin(dlat / 2), 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.pow(Math.sin(dlong / 2), 2);
  const c = 2 * Math.asin(Math.sqrt(a));
  const r = 6371;
  const distance = c * r;
  return await distance;
};

// // Calling the above function
// (async () => {
//   console.log(await geoCode("Chittoor", "Patiala"));
// })();

const sorter = async (residence, destinations, salaries) => {
  let dis = [];
  let hash = [];
  for (i = 0; i < destinations.length; i++) {
    let distance = await geoCode(residence, destinations[i]);
    dis.push(distance);
    hash.push(i);
  }

  // Sorting on the basis of salaries
  for (let i = 0; i < salaries.length; i++) {
    for (let j = 0; j < salaries.length; j++) {
      if (salaries[j] < salaries[i]) {
        let temp = salaries[j];
        salaries[j] = salaries[i];
        salaries[i] = temp;
        temp = hash[i];
        hash[i] = hash[j];
        hash[j] = temp;
        temp = dis[i];
        dis[i] = dis[j];
        dis[j] = temp;
      }
    }
  }

  // Further Sorting of the Destinations on the basis of Distances where the salaries are same.
  for (let i = 0; i < sal.length; i++) {
    for (let j = 0; j < sal.length; j++) {
      if (i == j) {
        continue;
      }
      if (sal[i] == sal[j]) {
        if (dis[j] > dis[i]) {
          let temp = salaries[j];
          salaries[j] = salaries[i];
          salaries[i] = temp;
          temp = hash[i];
          hash[i] = hash[j];
          hash[j] = temp;
          temp = dis[i];
          dis[i] = dis[j];
          dis[j] = temp;
        }
      }
    }
  }
  //   console.log(salaries);
  //   console.log(hash);
  //   console.log(dis);

  let final_list = [];
  for (let i = 0; i < hash.length; i++) {
    final_list.push(destinations[hash[i]]);
  }
  //   console.log(final_list);

  return await final_list;
};

// const res = "Rajpura";
// const des = ["Patiala", "Chittoor", "Chandigarh", "Dehradun"];
// const sal = [75000, 80000, 75000, 80000];
// sorter(res, des, sal);

module.exports = sorter;

// Note: Async Function will return something so make use of it using await only.
