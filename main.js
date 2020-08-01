let map;
let myLatLng = { lat: 25.0415956, lng: 121.5362985 };
let cityData = [];
let threeThousandsData = [];
let citySelect = document.querySelector('#city');
let areaSelect = document.querySelector('#area');
let search = document.querySelector('#city');
let sidebarContent = document.querySelector('.sidebar-content');
let toggleBtn = document.querySelector('.sidebar-toggle');

(() => {
  let cityDataUrl =
    'https://raw.githubusercontent.com/donma/TaiwanAddressCityAreaRoadChineseEnglishJSON/master/CityCountyData.json';
  let threeThousandsUrl = 'https://3000.gov.tw/hpgapi-openmap/api/getPostData';
  getData('cityData', cityDataUrl);
  getData('threeThousandsData', threeThousandsUrl);
})();
citySelect.addEventListener('change', function () {
  let val = this.value;
  // 更改區域資料
  let areaData = cityData.find((item) => item.CityName === val);
  areaSelect.innerHTML = '';
  areaData.AreaList.forEach((item) => {
    let option = document.createElement('option');
    option.value = item.AreaName;
    option.textContent = item.AreaName;
    areaSelect.append(option);
  });
  let shopData = getShopData();
  if (shopData.length !== 0) {
    // 側邊攔顯示資料
    displayData(shopData);
    // 移至定點
    panTo(shopData);
  } else {
    sidebarContent.innerHTML = '';
    window.alert('目前查無資料');
  }
});

areaSelect.addEventListener('change', function () {
  let shopData = getShopData();
  if (shopData.length !== 0) {
    // 側邊攔顯示資料
    displayData(shopData);
    // 移至定點
    panTo(shopData);
  } else {
    sidebarContent.innerHTML = '';
    window.alert('目前查無資料');
  }
});

toggleBtn.addEventListener('click', function () {
  if (this.children[1].classList.contains('d-none')) {
    sidebarContent.style.width = '0';
    this.style.left = '0';
    this.children[0].classList.add('d-none');
    this.children[1].classList.remove('d-none');
  } else {
    sidebarContent.style.width = '100%';
    this.children[1].classList.add('d-none');
    this.children[0].classList.remove('d-none');
    this.style.left = '100%';
  }
});
function getData(name, url) {
  fetch(url)
    .then((response) => response.json())
    .then((json) => {
      if (name === 'cityData') {
        renderSelectOptions(json);
        cityData = json;
      } else if (name === 'threeThousandsData') {
        renderMap(json);
        threeThousandsData = json;
      }
    })
    .then(() => {
      let shopData = getShopData();
      displayData(shopData);
    })
    .catch((ex) => {
      console.log(ex);
    });
}
function getShopData() {
  let cityVal = citySelect.value;
  let areaVal = areaSelect.value;
  let shopData = threeThousandsData
    .filter((item) => item.hsnNm === cityVal)
    .filter((item) => item.townNm === areaVal);
  return shopData;
}
function displayData(data) {
  let elements = '';
  for (let i = 0; i < data.length; i++) {
    let contentString = `
    <div class="card">
      <div class="card-body ">
        <h5 class="card-title">${data[i].storeNm}</h5>
        <h6 class="card-subtitle mb-2 text-muted">地址: <a target="_blank" href="https://www.google.com/maps/place/${data[i].addr}">${data[i].addr}</a></h6>
        <p class="card-text">tel:${data[i].tel}</p>
        <p class="card-text">營業時間 : ${data[i].busiTime}</p>
        <p class="card-text text-success">更新時間 : ${data[i].updateTime}</p>
        <span href="#" class="card-link">剩餘 : <span class="badge badge-warning">${data[i].total}</span></span>
        <span href="#" class="card-link">${data[i].busiMemo}</span>
      </div>
    </div>`;
    elements += contentString;
  }
  sidebarContent.innerHTML = elements;
}
function panTo(data) {
  let firstLatitude = parseFloat(data[0].latitude);
  let firstLongitude = parseFloat(data[0].longitude);
  map.panTo({ lat: firstLatitude, lng: firstLongitude });
}
function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: myLatLng,
    zoom: 12,
  });
}
// 渲染地圖
function renderMap(results) {
  let markers = [];
  for (let i = 0; i < results.length; i++) {
    // 新增座標
    let lng = results[i].longitude;
    let lat = results[i].latitude;
    let latLng = new google.maps.LatLng(lat, lng);
    let marker = new google.maps.Marker({
      position: latLng,
      map: map,
    });
    // 加偵聽

    let infoWindow = new google.maps.InfoWindow({
      content: `
      <div class="card border-warning">
        <div class="card-body ">
          <h5 class="card-title">${results[i].storeNm}</h5>
          <h6 class="card-subtitle mb-2 text-muted">地址: <a target="_blank" href="https://www.google.com/maps/place/${results[i].addr}">${results[i].addr}</a></h6>
          <p class="card-text">tel: ${results[i].tel}</p>
          <p class="card-text">營業時間:${results[i].busiTime}</p>
          <p class="card-text text-success">更新時間: ${results[i].updateTime}</p>
          <span href="#" class="card-link">剩餘: <span class="badge badge-warning">${results[i].total}</span></span>
          <span href="#" class="card-link">${results[i].busiMemo}</span>
        </div>
      </div>
    `,
    });
    marker.addListener('click', function () {
      map.setZoom(16);
      map.setCenter(marker.getPosition());
      infoWindow.open(map, marker);
    });
    markers.push(marker);
  }
  var markerCluster = new MarkerClusterer(map, markers, {
    imagePath:
      'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m',
    zoomOnclick: true,
  });
}

// 載入選項
function renderSelectOptions(results) {
  results.forEach((item) => {
    // cityName
    let option = document.createElement('option');
    option.value = item.CityName;
    option.textContent = item.CityName;
    citySelect.append(option);
  });
  results[0].AreaList.forEach((item) => {
    let option = document.createElement('option');
    option.value = item.AreaName;
    option.textContent = item.AreaName;
    areaSelect.append(option);
  });
}
