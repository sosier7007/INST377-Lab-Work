function getRandomIntInclusive(min, max) {
  const newMin = Math.ceil(min);
  const newMax = Math.floor(max);
  return Math.floor(Math.random() * (newMax - newMin + 1) + newMin); // inclusive
}

function restoArrayMake(dataArray) {
  // console.log('fired dataHandler');
  // console.table(dataArray); // this is called "dot notation"
  const range = [...Array(15).keys()];
  // eslint-disable-next-line no-unused-vars
  const listItems = range.map((item, index) => {
    const restNum = getRandomIntInclusive(0, dataArray.length - 1);
    return dataArray[restNum];
  });

  // console.log(listItems);
  return listItems;

  // range.forEach((item) => {
  // console.log('range item', item);
  // });
}

function createHtmlList(collection) {
  // console.log('fired HTML creator');
  // console.log(collection);
  const targetList = document.querySelector('.resto-list');
  targetList.innerHTML = '';
  collection.forEach((item) => {
    const {name} = item;
    const displayName = name.toLowerCase();
    const injectThisItem = `<li>${displayName}</li>`;
    targetList.innerHTML += injectThisItem;
  });
}

// TODO: reloading restaurants makes forms move around css
function initMap(targetId) {
  const latlong = [38.784, -76.872]; // TODO: should be PG county, is Xinjiang
  const map = L.map(targetId).setView(latlong, 9);
  L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw'
  }).addTo(map);
  return map;
}

// TODO: male sure this runs for filter fields
// TODO: make sure filter fields work together
function addMapMarkers(map, collection) {
  // remove map markers
  map.eachLayer((layer) => {
    if (layer instanceof L.Marker) {
      layer.remove();
    }
  });

  collection.forEach((item) => {
    const point = item.geocoded_column_1?.coordinates;
    //  const {coordinates} = m.geocoded_column_1; - alternate use, destructuring assignment
    console.log(item.geocoded_column_1?.coordinates);
    L.marker([point[1], point[0]]).addTo(map);
  });
}

async function mainEvent() { // the async keyword means we can make API requests
  console.log('script loaded');
  const form = document.querySelector('.main_form');
  const submit = document.querySelector('.submit_button');

  const resto = document.querySelector('#resto_name');
  const zipcode = document.querySelector('#zipcode');
  const map = initMap('map');
  const retrievalVar = 'restaurants';
  submit.style.display = 'none';

  if (localStorage.getItem(retrievalVar) === undefined) {
    const results = await fetch('/api/foodServicesPG'); // This accesses some data from our API
    const arrayFromJson = await results.json(); // This changes it into data we can use - an object
    console.log(arrayFromJson);
    localStorage.setItem(retrievalVar, JSON.stringify(arrayFromJson));
  }

  const storedData = localStorage.getItem(retrievalVar);
  const storedDataArray = JSON.parse(storedData);
  console.log(storedData);
  // const arrayFromJson = {data: []}; // TODO: Remove debug tool

  // to prevent a race condition on data load:
  if (storedDataArray.data.length > 0) {
    submit.style.display = 'block';

    let currentArray = [];
    resto.addEventListener('input', async (event) => {
      console.log(event.target.value);

      // if (currentArray.length < 1) { // handle error if array is empty
      // console.log('empty');
      //  return;
      // }

      const selectResto = storedDataArray.data.filter((item) => {
        const lowerName = item.name.toLowerCase();
        const lowerValue = event.target.value.toLowerCase();
        return lowerName.includes(lowerValue);
      });

      console.log(selectResto);
      createHtmlList(selectResto);
    });

    // zipcode search
    zipcode.addEventListener('input', async (event) => {
      console.log(event.target.value);

      // if (currentArray.length < 1) { // handle error if array is empty
      // console.log('empty');
      //  return;
      // }

      const selectResto = storedDataArray.data.filter((item) => {
        const nums = item.zip;
        const lowerValue = event.target.value.toLowerCase();
        return nums.includes(lowerValue);
      });

      console.log(selectResto);
      createHtmlList(selectResto);
    });

    form.addEventListener('submit', async (submitEvent) => { // async has to be declared all the way to get an await
      submitEvent.preventDefault(); // This prevents your page from refreshing!
      // console.log('form submission'); // this is substituting for a "breakpoint"
      // arrayFromJson.data - we're accessing a key called 'data' on the returned object
      // it contains all 1,000 records we need
      currentArray = restoArrayMake(storedDataArray.data);
      console.log(currentArray);
      createHtmlList(currentArray);
      addMapMarkers(map, currentArray);
    });
  }
}

// this actually runs first! It's calling the function above
document.addEventListener('DOMContentLoaded', async () => mainEvent()); // the async keyword means we can make API requests
