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

const sorter = async (residence, destinations, salaries, ids) => {
  let dis = [];
  let hash = [];
  for (let i = 0; i < destinations.length; i++) {
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
        temp = ids[i];
        ids[i] = ids[j];
        ids[j] = temp;
      }
    }
  }

  // Further Sorting of the Destinations on the basis of Distances where the salaries are same.
  for (let i = 0; i < salaries.length; i++) {
    for (let j = 0; j < salaries.length; j++) {
      if (i == j) {
        continue;
      }
      if (salaries[i] === salaries[j]) {
        if (dis[j] > dis[i]) {
          let temp = hash[i];
          hash[i] = hash[j];
          hash[j] = temp;
          temp = dis[i];
          dis[i] = dis[j];
          dis[j] = temp;
          temp = ids[i];
          ids[i] = ids[j];
          ids[j] = temp;
        }
      }
    }
  }
  return await ids;
};

const percentGetter = async (residence, destinations, salaries) => {
  let dis = [];
  let hash = [];
  for (let i = 0; i < destinations.length; i++) {
    let distance = await geoCode(residence, destinations[i]);
    dis.push(distance);
    hash.push(i);
  }
  max_val = Math.max();
  for (let i = 0; i < salaries.length; i++) {
    if (max_val < salaries[i]) {
      max_val = salaries[i];
    }
  }
  partition = max_val / 4;
  let percentage = [];
  for (let i = 0; i < salaries.length; i++) {
    if (salaries[i] > partition * 3) {
      percentage.push(100);
    } else if (salaries[i] > partition * 2) {
      percentage.push(75);
    } else if (salaries[i] > partition) {
      percentage.push(50);
    } else {
      percentage.push(25);
    }
  }
  return await percentage;
};

const dataBreaker = async (residence, data) => {
  destinations = [];
  ids = [];
  salaries = [];
  for (let i = 0; i < data.length; i++) {
    destinations.push(data[i].jobLocation);
    ids.push(data[i]._id);
    salaries.push(data[i].SalaryRange);
  }
  data = await sorter(residence, destinations, salaries, ids);
  return await data;
};

const integratedValue = async (residence, data) => {
  destinations = [];
  ids = [];
  salaries = [];
  for (let i = 0; i < data.length; i++) {
    destinations.push(data[i].jobLocation);
    ids.push(data[i]._id);
    salaries.push(data[i].SalaryRange);
  }
  percentage = await percentGetter(residence, destinations, salaries);
  new_data = { _100: [], _75: [], _50: [], _25: [] };
  for (let i = 0; i < data.length; i++) {
    if (percentage[i] === 100) {
      new_data._100.push(data[i]);
    } else if (percentage[i] === 75) {
      new_data._75.push(data[i]);
    } else if (percentage[i] === 50) {
      new_data._50.push(data[i]);
    } else {
      new_data._25.push(data[i]);
    }
  }
  final_data = { _100: [], _75: [], _50: [], _25: [] };
  let finale = await dataBreaker(residence, new_data._100);
  final_data._100.push(finale);
  finale = await dataBreaker(residence, new_data._75);
  final_data._75.push(finale);
  finale = await dataBreaker(residence, new_data._50);
  final_data._50.push(finale);
  finale = await dataBreaker(residence, new_data._25);
  final_data._25.push(finale);
  return await final_data;
};

// const res = "Rajpura";
// const data = [
//   {
//     _id: "1",
//     jobLocation: "Patiala",
//     SalaryRange: "25000",
//   },
//   {
//     _id: "2",
//     jobLocation: "Chittoor",
//     SalaryRange: "80000",
//   },
//   {
//     _id: "3",
//     jobLocation: "Chandigarh",
//     SalaryRange: "75000",
//   },
//   {
//     _id: "4",
//     jobLocation: "Dehradun",
//     SalaryRange: "80000",
//   },
// ];

module.exports = integratedValue;

// Note: Async Function will return something so make use of it using await only.
