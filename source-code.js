//CREATED BY IZZUDDIN MUHAMMAD (UNIVERSITAS NEGERI SEMARANG)
//IG: @adinizdn, LinkedIN: https://www.linkedin.com/in/izzmhmd/


function scale(image){
  var skala = image.multiply(1e5);
  return image.addBands(skala, null, true);
}

Map.setCenter(113.72099940509655, -0.4305111583765818, 5);

var viz = {
  min: 0,
  max: 20,
  palette: ['black', 'blue', 'purple', 'cyan', 'green', 'yellow', 'red']
  //palette: ['248b14', '32ba05', '6ffe5f', 'fdfd3a', 'f03b20', 'f05508', 'bd0026']
};

var vizVHI = {
  min: 0,
  max: 80,
  //palette: colorizedVis
  palette: ['blue','green','yellow','orange','red']
};
var vizVHIKelas = {
  min: 0,
  max: 4,
  palette: ['248b14','6ffe5f','fdfd3a','f03b20','bd0026']
};

var FAO = ee.FeatureCollection("FAO/GAUL_SIMPLIFIED_500m/2015/level2")

//DRAWING TOOLS
var drawingTools = Map.drawingTools();
drawingTools.setShown(true);
while (drawingTools.layers().length() > 0) {
  var layer = drawingTools.layers().get(0);
  drawingTools.layers().remove(layer);
}
var dummyGeometry =
    ui.Map.GeometryLayer({geometries: null, name: 'geometry', color: '#FF0000', shown:false});

drawingTools.layers().add(dummyGeometry);

function clearMap() {
  var mapLayers = Map.layers();
  if (mapLayers.length() > 0) {
    mapLayers.reset();
  }
}   
function clearGeometry() {
  var layers = drawingTools.layers();
  layers.get(0).geometries().remove(layers.get(0).geometries().get(0));
}

function drawRectangle() {
  clearMap();
  clearGeometry();
  drawingTools.setShape('rectangle');
  drawingTools.draw();
}
 
var symbol = {
  rectangle: '⬛',
};
var controlPanel = ui.Panel({
  widgets: [
    ui.Label('Pilih Lokasi'),
    ui.Button({
      label: symbol.rectangle + ' Buat Area',
      onClick: drawRectangle,
      style: {stretch: 'horizontal'}
    }),
  ],
  style: {position: 'top-left'},
  layout: null,
});

//PANEL
var mainPanel = ui.Panel({
  layout: ui.Panel.Layout.flow('vertical', true),
  style: {width: '450px', padding: '20px'}
});
var datePanel = ui.Panel({
  layout: ui.Panel.Layout.flow('horizontal', true)
}); //before

ui.root.add(mainPanel);

//LABEL
var titleLabel = ui.Label({
  value: 'Aplikasi Pemantauan Kekeringan Terintegrasi',
  style: {fontWeight: 'bold', fontSize: '20px', color: 'black'}
});

//DATE
var dateLabel = ui.Label({
  value: 'Masukkan Rentang Tanggal (Year-Month-Day)',
  style: {fontWeight: 'bold',fontFamily:'monospace'}
});

var startDate = ui.Textbox({
  value: '2023-10-01',
  placeholder: 'Masukkan Tanggal Awal',
  style: {width: '150px',border:'1px solid black'}
});

var endDate = ui.Textbox({
  value: '2023-10-30',
  placeholder: 'Masukkan Tanggal Akhir',
  style: {width: '150px',border:'1px solid black'}
});

var hubungLabel = ui.Label({value: '-',style: {width: '5px'}});
datePanel.add(startDate);
datePanel.add(hubungLabel);
datePanel.add(endDate);

var compositeButton = ui.Button({
  label: 'Mulai',
  onClick: Mulai,
  style: {border:'1px solid black'}
});

var ketLabel = ui.Label({
  value: 'Keterangan',
  style: {fontWeight: 'bold'}
});

//REGION SELECTION
var cityText = ui.Textbox({
  value: 'Kota Semarang',
  style: {width: '300px', margin:'0px 0px 0px 10px',border:'1px solid black',fontWeight: 'bold',textAlign:'center'}
});
var CityLabel = ui.Label({
  value: 'Pilih Lokasi',
  style: {fontWeight: 'bold',fontFamily:'monospace'}
});

    // ADD PANEL
    mainPanel.clear();
    mainPanel.add(titleLabel);
    mainPanel.add(CityLabel);    
    mainPanel.add(cityText);
    mainPanel.add(dateLabel);
    mainPanel.add(datePanel);
    mainPanel.add(compositeButton);

    //CHART
    var chartPanel = ui.Panel();
    var chartPanel2 = ui.Panel();
    var koordPanel = ui.Panel();

//FUNGSI KLIK MULAI
// Fungsi pertama memanggil Sentinel
function Mulai(){
  Map.layers().reset();
  chartPanel.clear();
  inspectPanel.clear();
  chartPanel2.clear();
  
  var start = startDate.getValue();
  var end = endDate.getValue();
  var name = cityText.getValue();
  var aoi = FAO.filter(ee.Filter.inList('ADM2_NAME',[name]));
//-------------------------------------------------------
                      //CALCULATING VHI
//------------------------------------------------------- 
// Applies scaling factors.
function applyScaleFactors(image) {
  var opticalBands = image.select('SR_B.').multiply(0.0000275).add(-0.2);
  var thermalBands = image.select('ST_B.*').multiply(0.00341802).add(149.0);
  return image.addBands(opticalBands, null, true)
              .addBands(thermalBands, null, true);
}
// Applies cloud mask
function cloudMask(image) {
  // Define cloud shadow and cloud bitmasks (Bits 3 and 5)
  var cloudShadowBitmask = (1 << 3);
  var cloudBitmask = (1 << 5);
  // Select the Quality Assessment (QA) band for pixel quality information
  var qa = image.select('QA_PIXEL');
  // Create a binary mask to identify clear conditions (both cloud and cloud shadow bits set to 0)
  var mask = qa.bitwiseAnd(cloudShadowBitmask).eq(0)
                .and(qa.bitwiseAnd(cloudBitmask).eq(0));
  // Update the original image, masking out cloud and cloud shadow-affected pixels
  return image.updateMask(mask);
}
  //FUNCTION OF SPECTRAL INDICES   
var indicesInput = function(img){
  // NDVI
  var ndvi = img.normalizedDifference(['SR_B5','SR_B4']).rename('NDVI');
  return img.addBands(ndvi);
};
var indicesNDVI = function(img){
  // NDVI
 var maxNDVI = ee.Number(img.select('NDVI').reduceRegion(ee.Reducer.max(), aoi, 100).get('NDVI'));
 var minNDVI = ee.Number(img.select('NDVI').reduceRegion(ee.Reducer.min(), aoi, 100).get('NDVI'));
 //FV
 var FV =(img.select('NDVI').subtract(minNDVI).divide(maxNDVI.subtract(minNDVI))).pow(ee.Number(2)).rename('FV');
 //EM
 var EM = FV.multiply(0.004).add(0.986).rename('E');
  return img.addBands(FV)
  .addBands(EM);
};
var indicesLST = function(img){
  // LST
  var LST = img.expression(
  '(Tb/(1 + (0.00115* (Tb / 1.438))*log(Ep)))-273.15', {'Tb': img.select('ST_B10'),
  'Ep': img.select('E')
  }).rename('LST');
  return img.addBands(LST);
};
var indicesCI = function(img){
  // VCI
 var maxNDVI = ee.Number(img.select('NDVI').reduceRegion(ee.Reducer.max(), aoi, 100).get('NDVI'));
 var minNDVI = ee.Number(img.select('NDVI').reduceRegion(ee.Reducer.min(), aoi, 100).get('NDVI'));
 var VCI = img.expression('(NDVI-NDVIMIN)/(NDVIMAX-NDVIMIN)',{
    'NDVI':img.select('NDVI'),
    'NDVIMAX':maxNDVI,
    'NDVIMIN':minNDVI,
  }).rename('VCI'); 
  //TVI
 var maxLST = ee.Number(img.select('LST').reduceRegion(ee.Reducer.max(), aoi, 100).get('LST'));
 var minLST = ee.Number(img.select('LST').reduceRegion(ee.Reducer.min(), aoi, 100).get('LST'));
 var TVI = img.expression('(LST-LSTMIN)/(LSTMAX-LSTMIN)',{
    'LST':img.select('LST'),
    'LSTMAX':maxLST,
    'LSTMIN':minLST,
  }).rename('TVI');
  return img.addBands(VCI)
  .addBands(TVI);
};
var indicesVHI = function(img){
  // VHI
 var VHI = img.expression('((0.5*VCI)+(0.5*TVI))*100',{
    'VCI':img.select('VCI'),
    'TVI':img.select('TVI'),
  }).rename('VHI'); 
  return img.addBands(VHI).toFloat();
};

//-------------------------------------------------------
                      //DATASETS
//-------------------------------------------------------

var dataset2 = ee.ImageCollection('LANDSAT/LC08/C02/T1_L2')
    .filterBounds(aoi)
    .filterDate(start, end)
    .filterMetadata('CLOUD_COVER', 'less_than', 30)
    .map(applyScaleFactors)
    .map(cloudMask)
    .map(indicesInput)
    .map(indicesNDVI)
    .map(indicesLST)
    .map(indicesCI)
    .map(indicesVHI)
    .median()
    .clip(aoi);
var VegHI = dataset2.select('VHI');
Map.addLayer(VegHI, vizVHI, 'VHI Value',false);
Map.centerObject(aoi);

  //CLASSIFICATION OF VHI BASED OF KOGAN (1991)
var Kelas = ee.Image(1)
          .where(VegHI.gt(40), 0)
          .where(VegHI.gt(30).and(VegHI.lte(40)), 1)
          .where(VegHI.gt(20).and(VegHI.lte(30)), 2)
          .where(VegHI.gt(10).and(VegHI.lte(20)), 3)
          .where(VegHI.lte(10),4)
          .clip(aoi);
Map.addLayer(Kelas, vizVHIKelas, 'VHI Class');

  //LUASAN
var Area = ee.Image.pixelArea().divide(100*100).addBands(Kelas)
  .reduceRegion({
    reducer: ee.Reducer.sum().group({
      groupField: 1,
      groupName: 'code',
    }),
    geometry: aoi,
    scale:100,
    bestEffort:true,
    maxPixels:1e9 
  }).get('groups');
var area_chart = ui.Chart.image.byClass({
  image: ee.Image.pixelArea().divide(100*100).addBands(Kelas) , 
  classBand: 'constant' , 
  region: aoi, 
  reducer: ee.Reducer.sum(), 
  scale: 100, 
  classLabels:['Tidak Ada','Ringan','Sedang', 'Kuat','Ekstrem']
  })//.setSeriesNames(ee.List(['Tidak Ada','Ringan','Sedang', 'Kuat','Ekstrem']))
  .setOptions({title: 'Luas Kelas',colors: ['248b14','6ffe5f','fdfd3a','f03b20','bd0026']});
chartPanel2.add(area_chart)
mainPanel.add(chartPanel2)
dummyGeometry.setShown(false); 
}

/*
//MODIS 250M LAND MASKED
var dataset = ee.Image('MODIS/061/MCD12Q1/2021_01_01');
var igbpLandCover = dataset.select('LW');
var mask = igbpLandCover.eq(2);
*/


//LEGENDA
//POSISI PANEL LEGENDA
var panel = ui.Panel({
  style: {
    position: 'bottom-left',
    padding: '5px;'
  }
});

var title = ui.Label({
  value: 'Tingkat Kekeringan',
  style: {
    fontSize: '15px',
    fontWeight: 'bold',
    margin: '100px;'
  }
});

panel.add(title);

var color = ['248b14','6ffe5f','fdfd3a','f03b20','bd0026'];
var lc_class = ['Tidak Terjadi', 'Ringan', 'Sedang', 'Kuat','Ekstrem'];

var list_legend = function(color, description) {
  
  var c = ui.Label({
    style: {
      backgroundColor: color,
      padding: '10px',
      margin: '4px'
    }
  })
  
  var ds = ui.Label({
    value: description,
    style: {
      margin: '5px'
    }
  })
  
  return ui.Panel({
    widgets: [c, ds],
    layout: ui.Panel.Layout.Flow('horizontal')
  })
}

for(var a = 0; a < 5; a++){
  panel.add(list_legend(color[a], lc_class[a]))
}

Map.add(panel)
//INSPECTOR
//POSISI PANEL
var inspectPanel = ui.Panel({
  style: {
    position: 'bottom-right',
    padding: '4px 3px'
  }
});

var lon = ui.Label()
var lat = ui.Label()
//Define callback function
function showValue(value) {
  var judulLabel = ui.Label({
    value: 'Nilai VHI',
    style: {
      fontWeight: 'bold',
    }
  });
  var valueLabel = ui.Label(value);

  inspectPanel.clear();
  inspectPanel.add(judulLabel);
  inspectPanel.add(valueLabel);
}

function inspect(coords) {
  var start = startDate.getValue();
  var end = endDate.getValue();
  var name = cityText.getValue();
  var aoi = FAO.filter(ee.Filter.inList('ADM2_NAME',[name]));
//-------------------------------------------------------
                      //CALCULATING VHI - ADDED TO THIS FUNCTION TO AVOID ERROR
//------------------------------------------------------- 
// Applies scaling factors.
function applyScaleFactors(image) {
  var opticalBands = image.select('SR_B.').multiply(0.0000275).add(-0.2);
  var thermalBands = image.select('ST_B.*').multiply(0.00341802).add(149.0);
  return image.addBands(opticalBands, null, true)
              .addBands(thermalBands, null, true);
}
// Applies cloud mask
function cloudMask(image) {
  // Define cloud shadow and cloud bitmasks (Bits 3 and 5)
  var cloudShadowBitmask = (1 << 3);
  var cloudBitmask = (1 << 5);
  // Select the Quality Assessment (QA) band for pixel quality information
  var qa = image.select('QA_PIXEL');
  // Create a binary mask to identify clear conditions (both cloud and cloud shadow bits set to 0)
  var mask = qa.bitwiseAnd(cloudShadowBitmask).eq(0)
                .and(qa.bitwiseAnd(cloudBitmask).eq(0));
  // Update the original image, masking out cloud and cloud shadow-affected pixels
  return image.updateMask(mask);
}
  //FUNCTION OF SPECTRAL INDICES   
var indicesInput = function(img){
  // NDVI
  var ndvi = img.normalizedDifference(['SR_B5','SR_B4']).rename('NDVI');
  return img.addBands(ndvi);
};
var indicesNDVI = function(img){
  // NDVI
 var maxNDVI = ee.Number(img.select('NDVI').reduceRegion(ee.Reducer.max(), aoi, 100).get('NDVI'));
 var minNDVI = ee.Number(img.select('NDVI').reduceRegion(ee.Reducer.min(), aoi, 100).get('NDVI'));
 //FV
 var FV =(img.select('NDVI').subtract(minNDVI).divide(maxNDVI.subtract(minNDVI))).pow(ee.Number(2)).rename('FV');
 //EM
 var EM = FV.multiply(0.004).add(0.986).rename('E');
  return img.addBands(FV)
  .addBands(EM);
};
var indicesLST = function(img){
  // LST
  var LST = img.expression(
  '(Tb/(1 + (0.00115* (Tb / 1.438))*log(Ep)))-273.15', {'Tb': img.select('ST_B10'),
  'Ep': img.select('E')
  }).rename('LST');
  return img.addBands(LST);
};
var indicesCI = function(img){
  // VCI
 var maxNDVI = ee.Number(img.select('NDVI').reduceRegion(ee.Reducer.max(), aoi, 100).get('NDVI'));
 var minNDVI = ee.Number(img.select('NDVI').reduceRegion(ee.Reducer.min(), aoi, 100).get('NDVI'));
 var VCI = img.expression('(NDVI-NDVIMIN)/(NDVIMAX-NDVIMIN)',{
    'NDVI':img.select('NDVI'),
    'NDVIMAX':maxNDVI,
    'NDVIMIN':minNDVI,
  }).rename('VCI'); 
  //TVI
 var maxLST = ee.Number(img.select('LST').reduceRegion(ee.Reducer.max(), aoi, 100).get('LST'));
 var minLST = ee.Number(img.select('LST').reduceRegion(ee.Reducer.min(), aoi, 100).get('LST'));
 var TVI = img.expression('(LST-LSTMIN)/(LSTMAX-LSTMIN)',{
    'LST':img.select('LST'),
    'LSTMAX':maxLST,
    'LSTMIN':minLST,
  }).rename('TVI');
  return img.addBands(VCI)
  .addBands(TVI);
};
var indicesVHI = function(img){
  // VHI
 var VHI = img.expression('((0.5*VCI)+(0.5*TVI))*100',{
    'VCI':img.select('VCI'),
    'TVI':img.select('TVI'),
  }).rename('VHI'); 
  return img.addBands(VHI).toFloat();
};

//DATASETS
var imageVHI = ee.ImageCollection('LANDSAT/LC08/C02/T1_L2')
    .filterBounds(aoi)
    .filterDate(start, end)
    .filterMetadata('CLOUD_COVER', 'less_than', 30)
    .map(applyScaleFactors)
    .map(cloudMask)
    .map(indicesInput)
    .map(indicesNDVI)
    .map(indicesLST)
    .map(indicesCI)
    .map(indicesVHI)
    .mean()
    .clip(aoi);
  
  var point = ee.Geometry.Point(coords.lon, coords.lat);
  var konsentrat = imageVHI.select('VHI').reduceRegion({
    reducer: ee.Reducer.mean(),
    geometry: point,
    scale: Map.getScale()
  }).get('VHI');

  konsentrat.evaluate(showValue);
}

Map.onClick(inspect);
//Map.add(inspectPanel);

koordPanel.add(ui.Panel([lon, lat], ui.Panel.Layout.flow('horizontal')));
Map.onClick(function(coords2) {
  var start = startDate.getValue();
  var end = endDate.getValue();
  var name = cityText.getValue();
  var aoi = FAO.filter(ee.Filter.inList('ADM2_NAME',[name]));
//-------------------------------------------------------
                      //CALCULATING VHI - ADDED TO THIS FUNCTION TO AVOID ERROR
//------------------------------------------------------- 
// Applies scaling factors.
function applyScaleFactors(image) {
  var opticalBands = image.select('SR_B.').multiply(0.0000275).add(-0.2);
  var thermalBands = image.select('ST_B.*').multiply(0.00341802).add(149.0);
  return image.addBands(opticalBands, null, true)
              .addBands(thermalBands, null, true);
}
// Applies cloud mask
function cloudMask(image) {
  // Define cloud shadow and cloud bitmasks (Bits 3 and 5)
  var cloudShadowBitmask = (1 << 3);
  var cloudBitmask = (1 << 5);
  // Select the Quality Assessment (QA) band for pixel quality information
  var qa = image.select('QA_PIXEL');
  // Create a binary mask to identify clear conditions (both cloud and cloud shadow bits set to 0)
  var mask = qa.bitwiseAnd(cloudShadowBitmask).eq(0)
                .and(qa.bitwiseAnd(cloudBitmask).eq(0));
  // Update the original image, masking out cloud and cloud shadow-affected pixels
  return image.updateMask(mask);
}
  //FUNCTION OF SPECTRAL INDICES   
var indicesInput = function(img){
  // NDVI
  var ndvi = img.normalizedDifference(['SR_B5','SR_B4']).rename('NDVI');
  return img.addBands(ndvi);
};
var indicesNDVI = function(img){
  // NDVI
 var maxNDVI = ee.Number(img.select('NDVI').reduceRegion(ee.Reducer.max(), aoi, 100).get('NDVI'));
 var minNDVI = ee.Number(img.select('NDVI').reduceRegion(ee.Reducer.min(), aoi, 100).get('NDVI'));
 //FV
 var FV =(img.select('NDVI').subtract(minNDVI).divide(maxNDVI.subtract(minNDVI))).pow(ee.Number(2)).rename('FV');
 //EM
 var EM = FV.multiply(0.004).add(0.986).rename('E');
  return img.addBands(FV)
  .addBands(EM);
};
var indicesLST = function(img){
  // LST
  var LST = img.expression(
  '(Tb/(1 + (0.00115* (Tb / 1.438))*log(Ep)))-273.15', {'Tb': img.select('ST_B10'),
  'Ep': img.select('E')
  }).rename('LST');
  return img.addBands(LST);
};
var indicesCI = function(img){
  // VCI
 var maxNDVI = ee.Number(img.select('NDVI').reduceRegion(ee.Reducer.max(), aoi, 100).get('NDVI'));
 var minNDVI = ee.Number(img.select('NDVI').reduceRegion(ee.Reducer.min(), aoi, 100).get('NDVI'));
 var VCI = img.expression('(NDVI-NDVIMIN)/(NDVIMAX-NDVIMIN)',{
    'NDVI':img.select('NDVI'),
    'NDVIMAX':maxNDVI,
    'NDVIMIN':minNDVI,
  }).rename('VCI'); 
  //TVI
 var maxLST = ee.Number(img.select('LST').reduceRegion(ee.Reducer.max(), aoi, 100).get('LST'));
 var minLST = ee.Number(img.select('LST').reduceRegion(ee.Reducer.min(), aoi, 100).get('LST'));
 var TVI = img.expression('(LST-LSTMIN)/(LSTMAX-LSTMIN)',{
    'LST':img.select('LST'),
    'LSTMAX':maxLST,
    'LSTMIN':minLST,
  }).rename('TVI');
  return img.addBands(VCI)
  .addBands(TVI);
};
var indicesVHI = function(img){
  // VHI
 var VHI = img.expression('((0.5*VCI)+(0.5*TVI))*100',{
    'VCI':img.select('VCI'),
    'TVI':img.select('TVI'),
  }).rename('VHI'); 
  return img.addBands(VHI).toFloat();
};
//DATASETS
var imagesChart = ee.ImageCollection('LANDSAT/LC08/C02/T1_L2')
    .filterBounds(aoi)
    .filterDate('2023-01-01', '2023-11-15')
    .filterMetadata('CLOUD_COVER', 'less_than', 30)
    .map(applyScaleFactors)
    .map(cloudMask)
    .map(indicesInput)
    .map(indicesNDVI)
    .map(indicesLST)
    .map(indicesCI)
    .map(indicesVHI);
  lon.setValue('G. Lintang: ' + coords2.lon.toFixed(5)),
  lat.setValue('G. Bujur: ' + coords2.lat.toFixed(5));
  var point = ee.Geometry.Point(coords2.lon, coords2.lat);
  var dot = ui.Map.Layer(point);
  //Map.layers().set(1, dot);
  chartPanel.clear();
    var chartz = ui.Chart.image.seriesByRegion({
      imageCollection: imagesChart,
      regions: point,
      reducer: ee.Reducer.mean(),
      band: 'VHI',
      scale: 30,
      xProperty: 'system:time_start'
    }).setSeriesNames(['Nilai']).setChartType('LineChart');
      chartz.setOptions({
      title: 'Grafik Kondisi Kesehatan Vegetasi'
});
chartPanel.add(chartz);
});

mainPanel.add(ketLabel);
mainPanel.add(koordPanel);
mainPanel.add(inspectPanel);
mainPanel.add(chartPanel);
