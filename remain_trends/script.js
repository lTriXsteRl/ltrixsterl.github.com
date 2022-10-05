
function getRealm(){
    return $('#realm').val();
}
function getProductID(){
    return $('#id_product').val();
}
function getDomain(locale) {
    if (locale === 'en') {
        return 'virtonomics.com';
    } else {
        return 'virtonomica.ru';
    }
}
function updateProdRemainLinks(){
    var productID = getProductID();
    if (productID == null || productID == '') return;
    var realm = getRealm();
    if (realm == null || realm == '') return;
    var locale = getLocale();
    var domain = getDomain(locale);
    $('#show_remain_link').attr('href','https://'+domain+'/'+realm+'/main/globalreport/marketing?product_id='+productID+'#by-offers');
    $('#calc_prod_link').attr('href','/industry/#id_product=' + productID);
	$('#general_report_link').attr('href','https://'+domain+'/'+realm+'/main/globalreport/product_history/'+productID+'/');
}
function nvl(val1, val2){
    if (val1 == null || val1 == ''){
        return val2;
    } else {
        return val1;
    }
}
function getVal(spName){
	try {
    		return JSON.parse(window.localStorage.getItem(spName));
	} catch (err) {
		console.error(err);
		return '';
	}
}
function setVal(spName, pValue){
    window.localStorage.setItem(spName,JSON.stringify(pValue));
}

function getLocale() {
    return getVal('locale') || $('#locale').val() || 'ru';
}
function applyLocale() {
    var locale = getLocale();

    if (locale === 'en') {
        document.title = "Remains trends";
        $('#btnSubmit').val('Generate');
        $('#locale_flag').attr('src','/img/us.gif');
    } else {
        document.title = "Сырьевые тренды";
        $('#btnSubmit').val('Сформировать');
        $('#locale_flag').attr('src','/img/ru.png');
    }
    $("[lang]").each(function () {
        if ($(this).attr("lang") == locale) {
            $(this).show();
        } else {
            $(this).hide();
        }
    });
}
function changeLocale() {
    setVal('locale', $('#locale').val() || 'ru');
    window.location.reload();
}
function getCityDistrict(name, locale) {
    if (locale === 'en') {
        if (name === 'Центр города') {
            return 'City centre';
        } else if (name === 'Фешенебельный район') {
            return 'Trendy neighborhood';
        } else if (name === 'Пригород') {
            return 'Suburb';
        } else if (name === 'Окраина') {
            return 'Outskirts';
        } else if (name === 'Спальный район') {
            return 'Residential area';
        } else {
            return name;
        }
    } else {
        return name;
    }
}
function getVolume(volume, locale) {
    if (locale === 'en') {
        return volume.replace('менее', 'below').replace('около', 'about').replace('более', 'over');
    } else {
        return volume;
    }
}

function getServiceLevel(serviceLevel, locale) {
    if (locale === 'en') {
        if (serviceLevel === 'Элитный') {
            return 'Elite';
        } else if (serviceLevel === 'Очень высокий') {
            return 'Very high';
        } else if (serviceLevel === 'Высокий') {
            return 'High';
        } else if (serviceLevel === 'Нормальный') {
            return 'Normal';
        } else if (serviceLevel === 'Низкий') {
            return 'Low';
        } else if (serviceLevel === 'Очень низкий') {
            return 'Very low';
        } else {
            return serviceLevel;
        }
    } else {
        return serviceLevel;
    }
}
//резделитель разрядов
function commaSeparateNumber(val, sep){
    var separator = sep || ',';
    while (/(\d+)(\d{3})/.test(val.toString())){
        val = val.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1"+separator);
    }
    return val;
}
function loadSavedFlt(urlParams){
    var realm       = getVal('realm') || 'olga';
    var id_category = getVal('id_category');
    var id_product  = getVal('id_product');

    if (Object.keys(urlParams).length > 1 && urlParams['realm'] != '' && urlParams['id_product'] != '') {
        realm       = urlParams['realm'];
        id_product  = urlParams['id_product'];
        var trend_date_min  = urlParams['trend_date_min'];
        var trend_date_max  = urlParams['trend_date_max'];
	if(trend_date_min != '' && trend_date_min != 'null'){
	  setVal('trend_date_min', trend_date_min);
	  setVal('trend_date_max', trend_date_max);
        }
    }

    if ((getVal('locale') === null || getVal('locale') === '') && (document.referrer.substring(0, 'https://virtonomics.com/'.length) === 'https://virtonomics.com/' || document.referrer.substring(0, 'https://virtonomics-free.blogspot.'.length) === 'https://virtonomics-free.blogspot.')) {
        setVal('locale', 'en');
    }

    if (realm != null || realm != '') {
        $('#realm').val(realm);
        var loadProductsCallback = function() {
            //console.log("$('#products').childNodes.length = " + document.getElementById('products').childNodes.length);
            changeProduct(id_product);
        };
        var productCategoriesCallback = function() {
            if (id_product != null && id_product != '') {
                var selectCategoryByProductCallback = function() {
                    changeProduct(id_product);
                };
                selectCategoryByProduct(id_product, selectCategoryByProductCallback);
            } else {
                //console.log("$('#id_category').childNodes.length = " + document.getElementById('id_category').childNodes.length);
                id_category = id_category || $('#id_category > option').eq(0).val();
                if (id_category == null || id_category == '') return;
                $('#id_category').val(id_category);
                id_category = $('#id_category').val();
                if (id_category == null || id_category == '') {
                    id_category = $('#id_category > option').eq(0).val();
                    $('#id_category').val(id_category);
                }
                loadProducts(loadProductsCallback);
            }
        };
        changeRealm(productCategoriesCallback);

    } else {
        fillUpdateDate();
    }
}

var sagInvisibibleColumns = [];
function getColStyle(spColID){
    if ($.inArray(spColID, sagInvisibibleColumns) >= 0) {
        return 'style="display: none;"';
    } else {
        return '';
    }
}

function getLast(str){
    var matches = str.match(/\/(\d+)$/);
    return matches[1];
}

function shortenNumber(text){
    if (text.length > 3) {
        var num = parseFloat(text);
        if (num < 1e+6) {
            num = (num / 1e+3).toFixed(0) + 'k';
        } else if (num < 1e+9) {
            num = (num / 1e+6).toFixed(0) + 'm';
        } else if (num < 1e+12) {
            num = (num / 1e+9).toFixed(0) + 'b';
        } else if (num < 1e+15) {
            num = (num / 1e+12).toFixed(0) + 't';
        } else if (num < 1e+18) {
            num = (num / 1e+15).toFixed(0) + 'q';
        }
        return num;
    } else {
        return text;
    }
}

function updateUrl() {
    var productID = getProductID();
    var realm = getRealm();
    var trend_date_min = getVal('trend_date_min')||'';
    var trend_date_max = getVal('trend_date_max')||'';
    
    window.history.pushState("", ""
        , '#id_product='    + productID
        + '&realm='         + realm
        + '&trend_date_min=' + trend_date_min
        + '&trend_date_max=' + trend_date_max
    );
}
//////////////////////////////////////////////////////

function onlyUnique(value, index, self) { 
    return self.indexOf(value) === index;
}
function showTrendGraph(data) {
  function strToDate(strDate, defVal){
    if (strDate === null || strDate === '' || (strDate + '').indexOf('.') <= 0){
      return defVal;
    }
    var dateParts = strDate.split(".");
    //new Date(year, month[, date[, hours[, minutes[, seconds[, milliseconds]]]]]);
    //return new Date(parseInt(dateParts[2]), parseInt(dateParts[1]) - 1, parseInt(dateParts[0]));
    return new Date(Date.UTC(parseInt(dateParts[2]), parseInt(dateParts[1]) - 1, parseInt(dateParts[0]) ));
  }
    function min(array, current, window){
      var res = 1000*1000*1000*1000*1000;
      for( var i = current - window; i <= current; i++ ){
        if(i>=0 && i<array.length){
            res = Math.min(res, array[i]['p']);
          }
      }
      return parseFloat(res.toFixed(2));
    }
    function max(array, current, window){
      var res = 0;
      for( var i = current - window; i <= current; i++ ){
        if(i>=0 && i<array.length){
            res = Math.max(res, array[i]['p']);
          }
      }
      return parseFloat(res.toFixed(2));
    }
  var dateTo = new Date();
  var dateFrom = new Date();  
  dateFrom.setMonth(dateTo.getMonth() - 3);
  var nvStep = 2;
    
  console.log("data.length = " + data.length);
	
  data.sort(function(a,b) {
      var dateA = strToDate(a['d']);
      var dateB = strToDate(b['d']);
      if (dateA < dateB) {
          return -1;
      } else if (dateA > dateB) {
          return 1;
      } else {
          return 0;
      }
  });
  	
    var avCategories = [];
    
    var avRemainsVolume = [];
    var avRemainsMeanPrice = [];
    var avRemainsMeanQual = [];
    var avDonchianChannelRemPrc = [];	
	
    var productRemainsDataByDateStr = [];
    var productRemainsUnitIDs = [];
    var productRemainsUnitByID = [];
    var productRemainsUnitDataByDateStr = [];
    
      for (var i = 0; i < data.length; i++) {
        var svDate = data[i]['d'];
	productRemainsDataByDateStr[svDate] = data[i];
	      
	productRemainsUnitDataByDateStr[svDate] = [];
	if(data[i]['s'] != null){
          for (var k = 0; k < data[i]['s'].length; k++) {
            var svUnitID = data[i]['s'][k]['ui'] || 'RemainOthers';
	    productRemainsUnitByID[svUnitID] = data[i]['s'][k];
	    productRemainsUnitIDs.push(svUnitID);
  	    productRemainsUnitDataByDateStr[svDate][svUnitID] = data[i]['s'][k];
          }
	}
      }
      
    productRemainsUnitIDs = productRemainsUnitIDs.filter(onlyUnique);
	
    for (var i = 0; i < data.length; i++) {
      var svDate = data[i]['d'];
      var dvDate = strToDate(svDate);
      var svDateStr = $.datepicker.formatDate( "yy-M-d", dvDate);
      avCategories[i] = svDateStr;
	     
      var nvRemainsVolume = parseFloat(productRemainsDataByDateStr[svDate]['r']);
      avRemainsVolume.push({
	    x: dvDate.getTime(), 
            y: nvRemainsVolume,
            pr_total: 0,
            pr_available:0,
            pr_price: 0,
            pr_quality: 0
	  });
      
      var nvRemainsQual = parseFloat(productRemainsDataByDateStr[svDate]['q']);
      avRemainsMeanQual.push({
	    x: dvDate.getTime(), 
            y: nvRemainsQual,
            pr_total: 0,
            pr_available:0,
            pr_price: 0,
            pr_quality: 0
	  });
      
      var nvRemainsPrice = parseFloat(productRemainsDataByDateStr[svDate]['p']);
      avRemainsMeanPrice.push({
	    x: dvDate.getTime(), 
            y: nvRemainsPrice,
            pr_total: 0,
            pr_available:0,
            pr_price: 0,
            pr_quality: 0
	  });
      
      //avDonchianChannelRemPrc.push([dvDate.getTime(), min(data, i, 10), max(data, i, 10)]);
    }
    function avg(array, current, window){
      var sum = 0;
      var sumCnt = 0;
      for( var i = current - window; i <= current; i++ ){
        if(i>=0 && i<array.length){
            sum += parseFloat(array[i][1]) || 0;
            ++sumCnt;
          }
      }
      return parseFloat( (sum / sumCnt).toFixed(2));
    }
    function getMoveMean(array, window){
      var result = [];
      var mean = 0;
      // calculate average for each subarray and add to result
      for (var i=0; i < array.length; i++){
          mean = avg(array, i, window);
          result.push([array[i][0],mean]);
      }

      return result;
    }
    
 var chart = Highcharts.stockChart('trends_price', {

    chart: {
        zoomType: 'x',
        animation: {
            duration: 0
        },
        events: {
            redraw: function (event) {
                if (event.xAxis) {
		    setVal('trend_date_min', Highcharts.dateFormat('%d.%m.%Y', event.xAxis[0].min));
		    setVal('trend_date_max', Highcharts.dateFormat('%d.%m.%Y', event.xAxis[0].max));
                } else {
		    setVal('trend_date_min', Highcharts.dateFormat('%d.%m.%Y', this.axes[0].min));
		    setVal('trend_date_max', Highcharts.dateFormat('%d.%m.%Y', this.axes[0].max));
                }
    		updateUrl();
            }
        }
    },
    plotOptions: {
        column: {
            stacking: 'normal'
        },
        series: {
            animation: false
        }
    },
    legend: {
        enabled: false
    },
    tooltip: {
	useHTML: true,
        formatter: function () {
            var s = '<table border="1" cellspacing="0" cellpadding="2" bordercolorlight="#000000" bordercolordark="#FFFFFF">';
	    s += '<tr class="theader"><th><b>' + Highcharts.dateFormat('%A, %b %d, %Y', this.x).replace(/\s+/g,'&nbsp;') + '</b></th>';
	    s += '<th>value</th><th>total</th><th>price</th><th>quality</th><th>pqr</th></tr>';
//' <b>{point.y}</b>, total/available: {point.total} / {point.available} price: {point.price} quality: {point.quality}<br>',
            $.each(this.points, function () {
		    s += '<tr class="trec"> <td><span style="color:'+this.color+'">\u25CF</span>&nbsp;' + this.series.name.replace(/\s+/g,'&nbsp;') + '</td>';
		    s += '<td align="right"><b>' + commaSeparateNumber(this.y, '&nbsp;') + '</b></td>';
		    //console.log(this);
		    var pointData = [];
		    var pointDataIdx = this.point.index;   
		    var seriesIdx = this.series.index; 
		    if(this.series.data.length > pointDataIdx){   
		    	pointData = this.series.data[pointDataIdx];
			    //console.log(pointData);
		    }
		    else if(this.series.xAxis.series.length > seriesIdx && this.series.xAxis.series[seriesIdx].options.data.length > pointDataIdx){  
		    	pointData = this.series.xAxis.series[seriesIdx].options.data[pointDataIdx];
			    //console.log(pointData);
		    }
		    else {
			console.log(this);
		    }
		try {    		
		    if(pointData['pr_total'] > 0){
		        s += '<td align="right">' + commaSeparateNumber(pointData['pr_total'], '&nbsp;') + '</td>';
		    } else {
		        s += '<td>&nbsp;</td>';
		    }
		    if(pointData['pr_price'] > 0){
		        s += '<td align="right">' + commaSeparateNumber((pointData['pr_price']).toFixed(2), '&nbsp;') + '</td>';
		    }  else {
		        s += '<td>&nbsp;</td>';
		    }
		    if(pointData['pr_quality'] > 0){
		        s += '<td align="right">' + commaSeparateNumber((pointData['pr_quality']).toFixed(2), '&nbsp;') + '</td>';
		    }  else {
		        s += '<td>&nbsp;</td>';
		    }
		    if(pointData['pr_price'] > 0 && pointData['pr_quality'] > 0){
		        s += '<td align="right">' + commaSeparateNumber((pointData['pr_price'] / pointData['pr_quality']).toFixed(2), '&nbsp;') + '</td>';
		    }  else {
		        s += '<td>&nbsp;</td>';
		    }
		} catch (err) {
			console.error(err);
			console.log('pointDataIdx = ' + pointDataIdx);
			console.log('seriesIdx = ' + seriesIdx);
			console.log(this);
		        s += '<td colspan="4">&nbsp;</td>';
		}
	      s += '</tr>';
            });
	    s += '</table>';
            return s;
        },
        //pointFormat: '<span style="color:{point.color}">\u25CF</span> {series.name}: <b>{point.y}</b>, total/available: {point.total} / {point.available} price: {point.price} quality: {point.quality}<br>',
	shared: true
    },
    xAxis: [{
        min: strToDate(getVal('trend_date_min'), dateFrom).getTime(),
        max: strToDate(getVal('trend_date_max'), dateTo).getTime(),
        crosshair: true,
	type: 'datetime',
	labels: {
	    format: '{value: %Y-%b-%e}',
	    align: 'left',
        step:2,
	    rotation: 0
	}
    }],
    yAxis: [{ // Primary yAxis
        type: (($("#togglelinearprice:checked").length)?'linear':'logarithmic'),
        labels: {
            style: {
                color: Highcharts.getOptions().colors[0]
            }
        },
        title: {
            text: '',
            style: {
                color: Highcharts.getOptions().colors[0]
            }
        }
    }, { // Secondary yAxis
        type: (($("#togglelinearvolume:checked").length)?'linear':'logarithmic'),
        title: {
            text: '',
            style: {
                color: Highcharts.getOptions().colors[1]
            }
        },
        labels: {
            style: {
                color: Highcharts.getOptions().colors[1]
            }
        },
        opposite: true
    }, { // Third yAxis
        type: (($("#togglelinearqual:checked").length)?'linear':'logarithmic'),
        title: {
            text: '',
            style: {
                color: Highcharts.getOptions().colors[2]
            }
        },
        labels: {
            style: {
                color: Highcharts.getOptions().colors[2]
            }
        },
        opposite: true
    }],

    series: [
         {
	     turboThreshold: 0,
	     showInLegend : false,
        type: 'spline',
             name: 'RemainsMeanPrice',
             data: avRemainsMeanPrice,
             marker: {enabled: false},
             visible: ((getVal('RemainsMeanPrice'+'Visible') === 0) ? false : true)        
         },
         {
	     showInLegend : false,
        yAxis: 1,
             name: 'RemainsVolume',
             data: avRemainsVolume,
             marker: {enabled: false},
             visible: ((getVal('RemainsVolume'+'Visible') === 0) ? false : true)                
         },
         {
	     showInLegend : false,
        yAxis: 2,
             name: 'RemainsMeanQual',
             data: avRemainsMeanQual,
             marker: {enabled: false},
             visible: ((getVal('RemainsMeanQual'+'Visible') === 1) ? true : false)                
         }
	    ],
    credits: {
	enabled: false
    }
});

	var btns = ['RemainsMeanPrice','RemainsVolume','RemainsMeanQual'
		    ];
	$('#trends_btns').html('');
for(var i = 0; i < btns.length; ++i){
	var ed = $('<button id="Toggle'+ btns[i] +'" name="'+ btns[i] +'" idx="'+i+'">'+ btns[i] +'</button>');
	ed.click(function(){
	    var idx = $(this).attr('idx');
	    var series = chart.series[idx];
	    var name = $(this).attr('name');
	    if (series.visible) {
		    setVal(name+'Visible', 0);
		series.hide();
	    } else {
		    setVal(name+'Visible', 1);
		series.show();
	    }
		return false;
	});
	$('#trends_btns').append(ed);
	
	if((i + 1) % 3 === 0){
	  $('#trends_btns').append('&nbsp;');
	}
	if((i + 1) % 11 === 0){
	  $('#trends_btns').append('<br>');
	}
}
	$('#btnSubmit').hide();

var seriesAdded = 0;
function addProductRemainsUnitSeries(){
  var bvVisible = getVal('ProductRemainByUnits'+'Visible');
  if (seriesAdded === 0 && bvVisible === 1){
    var startTime = new Date();
    console.log('productRemainsUnitIDs.length = ' + productRemainsUnitIDs.length);
    console.log('trend_date_min = ' + (getVal('trend_date_min') || dateFrom));
    console.log('trend_date_max = ' + (getVal('trend_date_max') || dateTo));	
    var minDate = strToDate(getVal('trend_date_min'), dateFrom).getTime();
    var maxDate = strToDate(getVal('trend_date_max'), dateTo).getTime();
	  
    for (var k = 0; k < productRemainsUnitIDs.length; k++) {
      var productRemainsUnitData = [];
      var svUnitID = productRemainsUnitIDs[k];
      for (var i = 0; i < data.length; i++) {
        var svDate = data[i]['d'];
	var avByDate = productRemainsUnitDataByDateStr[svDate];
        var dvDate = strToDate(svDate).getTime();
	//minDate >= dvDate && dvDate <= maxDate && 
	if (avByDate != null && avByDate[svUnitID] != null && parseFloat(avByDate[svUnitID]['mo']) > 0){
	  var ovVal = {
	    x: dvDate, 
            y: parseFloat(avByDate[svUnitID]['mo']),
            pr_total: parseFloat(avByDate[svUnitID]['t']),
            pr_available: parseFloat(avByDate[svUnitID]['mo']),
            pr_price: parseFloat(avByDate[svUnitID]['p']),
            pr_quality: parseFloat(avByDate[svUnitID]['q'])
	  };
	  //console.log(ovVal);
          productRemainsUnitData.push(ovVal);
	}
      }
      console.log((k+1) + '/' + productRemainsUnitIDs.length + ': productRemainsUnitData.length = ' + productRemainsUnitData.length);
      if (productRemainsUnitData.length > 0){
	      chart.addSeries({
		yAxis: 1,
		type: 'column',
		name: productRemainsUnitByID[svUnitID]['cn'] || svUnitID,
		data: productRemainsUnitData,
		visible: ((getVal('ProductRemainByUnits'+'Visible') === 1) ? true : false)
	      }
	      ,false);
      }
    }
	  
    chart.redraw();
	  
    var endTime = new Date();
    var timeDiff = endTime - startTime;
    console.log('productRemainsUnitIDs.length = ' + productRemainsUnitIDs.length + ' done in ' + timeDiff + 'ms ('+Math.round(timeDiff/1000 % 60)+'s)');
    seriesAdded = 1;
  }
}
addProductRemainsUnitSeries();
	
var ed = $('<button id="ToggleProductRemainByUnits">ProductRemainByUnits</button>');
ed.click(function(){
  var bvSetVisible = ((getVal('ProductRemainByUnits'+'Visible') === 1) ? 0 : 1);
  setVal('ProductRemainByUnitsVisible', bvSetVisible);
  var seriesAddedTmp = seriesAdded;
  addProductRemainsUnitSeries();
if (seriesAddedTmp === 1){
  for (var k = btns.length; k < Math.min(chart.series.length, productRemainsUnitIDs.length + btns.length); k++) {
    var series = chart.series[k];
	  
    if (series.visible) {
      //series.hide();
      series.setVisible(false, false);
    } else {
      //series.show();
      series.setVisible(true, false);
    }
  }
  chart.redraw();
}
  return false;
});
$('#trends_btns').append(ed);

    
}
function loadData() {
    var realm = getRealm();
    if (realm == null || realm == '') return;
    var productID = getProductID();
    if (productID == null || productID == '') return;
    var locale = getLocale();
    var showLabel = (locale === 'en') ? 'Show' : 'Показать';

    updateUrl();

    zip.workerScriptsPath = '/js/';
    zip.createReader(new zip.HttpReader('/industry/'+realm+'/product_remains_trends/'+productID+'.json.zip'), function(reader) {
        // get all entries from the zip
        reader.getEntries(function(entries) {
            if (entries.length > 0) {
                // get first entry content as text
                entries[0].getData(new zip.TextWriter(), function(text) {
                    // text contains the entry data as a String
                    // close the zip reader
                    reader.close();
                    // console.log(text.length);
                    // console.log(text.substr(0, 100) );
                    // console.log(text.substr(-100) );
                    var data = JSON.parse(text);
                    showTrendGraph(data);
                });
            } else {
              console.error('entries.length = ' + entries.length);
            }
        });
    }, function(error) {
        // onerror callback
        console.error(error);
    });
    return false;
}
function unknownIfNull(locale, opValue) {
    if (opValue == null || opValue === '' || isNaN(opValue)){
        return (locale == 'en') ? 'unknown' : 'не изв.';
    } else {
        return opValue;
    }
}
function loadProductCategories(callback) {
	var realm = getRealm();
	if (realm == null || realm == '') return;
	var suffix = (getLocale() == 'en') ? '_en' : '';
	
	$.getJSON('/industry/'+realm+'/materials'+suffix+'.json', function (data) {
		var output = '';
		var categories = [];
		$.each(data, function (key, val) {
			if(categories[val.pci] == null){
				output += '<option value="'+val.pci+'">'+val.pc+'</option>';
				categories[val.pci] = 1;
			}
		});
		
		$('#id_category').html(output); 	// replace all existing content
		$('#products').html(''); 
		
		if(typeof(callback) === 'function'){
			callback();
		} else {
			selectCategoryByProduct($('#id_product').val());
			changeProduct($('#id_product').val());
		}
	});
	return false;
}
function loadProducts(callback) {
	var realm = getRealm();
	if (realm == null || realm == '') return;
	
	var svCategoryId = $('#id_category').val();
	if (svCategoryId == null || svCategoryId == '') return;
	var locale = getLocale();
	var suffix = (locale === 'en') ? '_en' : '';
	
	$.getJSON('/industry/'+realm+'/materials'+suffix+'.json', function (data) {
		var output = '';
		var selected = $('#id_product').attr('value');
		
		sagMaterialImg = [];
		var cnt = 0;
		$.each(data, function (key, val) {
			sagMaterialImg[val.i] = val.s;
			
			if(svCategoryId == val.pci){
				if(cnt > 30){
					cnt = 0;
					output += '<br>';
				}
				cnt++;
				output += '&nbsp;<img src="'+ val.s +'"';
				if(selected != null && selected == val.i){
					output += ' border="1"';
				}
				output += ' width="24" height="24" id="img'+val.i+'" title="'+val.c+'" style="cursor:pointer" onclick="changeProduct('+val.i+')">';
			}
		});
		
		$('#products').html(output);
		if(typeof(callback) === 'function') callback();
	});
	return false;
}
function changeRealm(productCategoriesCallback) {
    loadProductCategories(productCategoriesCallback);
    setVal('realm', getRealm());
    fillUpdateDate();
    updateProdRemainLinks();
}
function changeCategory(callback) {
    loadProducts(callback);
    setVal('id_category', $('#id_category').val());
}
function changePeriod() {
    setVal('trends_period', $('#trends_period').val());
    loadData();
}
function changeProduct(productId) {
//    console.log('changeProduct, caller is '+ arguments.callee.caller.toString());
    var selected = $('#id_product').val();
    if(selected != null && selected != ''){
        $('#img'+selected).attr('border','');
    }
    if ($('#img'+productId).length === 0 && $('#products > img[id]').length > 0){
        productId = $('#products > img').eq(0).attr('id').replace("img", "");
    }
    $('#img'+productId).attr('border','1');
    $('#id_product').val(productId);
    loadData();
    setVal('id_product', $('#id_product').val());
    updateProdRemainLinks();
}
function selectCategoryByProduct(productId, callback) {
    if (productId == null || productId == '') return;
    var realm = getRealm();
    if (realm == null || realm == '') return;
    var suffix = (getLocale() == 'en') ? '_en' : '';

    $.getJSON('/industry/'+realm+'/materials'+suffix+'.json', function (data) {
        $.each(data, function (key, val) {
            if(productId === val.i){
                $('select#id_category').val(val.pci);
            }
        });
        loadProducts(callback);
    });
    return false;
}

function transformToAssocArray( prmstr ) {
    var params = {};
    var prmarr = prmstr.split("&");
    for ( var i = 0; i < prmarr.length; i++) {
        var tmparr = prmarr[i].split("=");
        params[tmparr[0]] = tmparr[1];
    }
    return params;
}
function fillUpdateDate() {
    $('#update_date').text(''); 	// replace all existing content
    var realm = getRealm();
    if (realm == null || realm == '') return;
    var prefix = (getLocale() == 'en') ? 'updated' : 'обновлено';

    $.getJSON('/industry/'+realm+'/product_remains_trends/updateDate.json', function (data) {
        $('#update_date').text(prefix+': ' + data.d); 	// replace all existing content
    });
}
//////////////////////////////////////////////////////
$(document).ready(function () {
    var urlParams = [];
    var hashParams = window.location.hash.substr(1).toLowerCase().split('&'); // substr(1) to remove the `#`
    //только для локали, чтобы категории правильные загрузились сразу
    if (hashParams != null && hashParams != '') {
        for(var i = 0; i < hashParams.length; i++){
            var p = hashParams[i].split('=');
            if (p[0] === 'locale') {
                setVal('locale', decodeURIComponent(p[1]));
            }
            urlParams[p[0]] = decodeURIComponent(p[1]);
        }
    }

	
    loadSavedFlt(urlParams);
      
    if (getLocale() != 'ru') {
        $('#locale').val(getLocale());
        applyLocale();
    }

  $("#togglelinearprice").change(function(){
    var checked = $("#togglelinearprice:checked").length;
    if(!checked){
	$('#trends_price').highcharts().yAxis[0].update({ type: 'logarithmic'});
    } else {
	$('#trends_price').highcharts().yAxis[0].update({ type: 'linear'});
    }
  });
  $("#togglelinearvolume").change(function(){
    var checked = $("#togglelinearvolume:checked").length;
    if(!checked){
	$('#trends_price').highcharts().yAxis[1].update({ type: 'logarithmic'});
    } else {
	$('#trends_price').highcharts().yAxis[1].update({ type: 'linear'});
    }
  });
  $("#togglelinearqual").change(function(){
    var checked = $("#togglelinearqual:checked").length;
    if(!checked){
	$('#trends_price').highcharts().yAxis[2].update({ type: 'logarithmic'});
    } else {
	$('#trends_price').highcharts().yAxis[2].update({ type: 'linear'});
    }
  });
});
