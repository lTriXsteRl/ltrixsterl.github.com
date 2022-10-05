var preditctionParams = []
function getWealthIndex(){
	return preditctionParams['wealth_index'];
}
function getEducationIndex(){
	return preditctionParams['education_index'];
}
function getAverageSalary(){
	return preditctionParams['average_salary'];
}
function getMarketIndex(){
	return preditctionParams['market_index'];
}
function getMarketVolume(){
	return preditctionParams['market_volume'];
}
function getLocalPercent(){
	return preditctionParams['local_percent'];
}
function getLocalPrice(){
	return preditctionParams['local_price'];
}
function getLocalQuality(){
	return preditctionParams['local_quality'];
}
function getPrice(){
	return preditctionParams['price'];
}
function getShopSize(){
	return preditctionParams['shop_size'];
}
function getTownDistrict(){
	return preditctionParams['town_district'];
}
function getDepartmentCount(){
	return preditctionParams['department_count'];
}
function getBrand(){
	return preditctionParams['brand'];
}
function getQuality(){
	return preditctionParams['quality'];
}
function getNotoriety(){
	return preditctionParams['notoriety'];
}
function getVisitorsCount(){
	return preditctionParams['visitors_count'];
}
function getServiceLevel(){
	return preditctionParams['service_level'];
}
function getSellerCount(){
	return preditctionParams['seller_count'];
}
function getRealm(){
	return $('#realm').val();
}
function getProductId(){
	return $('#id_product').val();
}
function getProductCategory(){
	return $('#id_category ').val();
}
function nvl(val1, val2){
	if (val1 == null || val1 == ''){
		return val2;
	} else {
		return val1;
	}
}

function getLocale() {
    return getVal('locale') || $('#locale').val() || 'ru';
}
function onlyUnique(value, index, self) { 
    return self.indexOf(value) === index;
}
const flatten = arr => arr.reduce(
  (acc, val) => acc.concat(
    Array.isArray(val) ? flatten(val) : val
  ),
  []
);
function getVal(spName){
	return JSON.parse(window.localStorage.getItem(spName));
}
function setVal(spName, pValue){
	window.localStorage.setItem(spName,JSON.stringify(pValue));
}
function loadSavedFlt(){
	//var params = getSearchParameters();
	var realm = getVal('realm');
	var id_country = getVal('id_country');
	var id_region = getVal('id_region');
	var id_category = getVal('id_category');
	var id_product = getVal('id_product');
	
	$('#shopSize').val(getVal('shopSize'));
	$('#townDistrict').val(getVal('townDistrict'));
	$('#departmentCount').val(getVal('departmentCount'));
	$('#brand').val(getVal('brand'));
	$('#quality').val(getVal('quality'));
	$('#notoriety').val(getVal('notoriety'));
	$('#visitorsСount').val(getVal('visitorsСount'));
	$('#serviceLevel').val(getVal('serviceLevel'));
	
	if (realm != null || realm != '') {
		$('#realm').val(realm);
		var loadProductsCallback = function() {
			//console.log("$('#products').childNodes.length = " + document.getElementById('products').childNodes.length);
			if (id_product == null || id_product == '') return;
			changeProduct(id_product);
		};
		var productCategoriesCallback = function() {
			//console.log("$('#id_category').childNodes.length = " + document.getElementById('id_category').childNodes.length);
			if (id_category == null || id_category == '') return;
			$('#id_category').val(id_category);
			loadProducts(loadProductsCallback);
  		};
		var changeCountryCallback = function() {
			if (id_region != null || id_region != '') {
				$('#id_region').val(id_region);
				//console.log("$('#id_region').childNodes.length = " + document.getElementById('id_region').childNodes.length);
				changeRegion();
			}
  		};
		var countryCallback = function() {
			if (id_country != null || id_country != '') {
				$('#id_country').val(id_country);
				//console.log("$('#id_country').childNodes.length = " + document.getElementById('id_country').childNodes.length);
				changeCountry(changeCountryCallback);
			}
  		};
		changeRealm(productCategoriesCallback, countryCallback);
		
	} else {
		loadProductCategories();
		loadCountries();
		fillUpdateDate();
	}
}
function tableSortFunc(spColId, a,b){
		//console.log('spColId = '+spColId);
		var cellValA = a.elm.querySelector('#td_'+spColId).innerHTML;
		var cellValB = b.elm.querySelector('#td_'+spColId).innerHTML;
		
		if (spColId == "volume_set" || spColId == "volume_cv"){
			//console.log('a.elm = '+a.elm);
			var partsOfStrA = cellValA.split(' ');
			var partsOfStrB = cellValB.split(' ');
			
			var numA = parseFloat(partsOfStrA[1]);
			var numB = parseFloat(partsOfStrB[1]);
			console.log('numA = '+numA);
			console.log('numB = '+numB);
			
			if (numA > numB){
				console.log('numA > numB');
				return 1;
			} else if (numA < numB) {
				console.log('numA < numB');
				return -1;
			} else {
				var kvalA = partsOfStrA[0];
				var kvalB = partsOfStrB[0];
				console.log('kvalA = '+kvalA);
				console.log('kvalB = '+kvalB);
				
				if (kvalA == "более" && kvalB != "более"){
					console.log('kvalA == "более" && kvalB != "более"');
					return 1;
				} else if (kvalA == "около" && kvalB != "около"){
					console.log('kvalA == "около" && kvalB != "около"');
					return 1;
				} else {
					console.log('else');
					return -1;
				}
			}
		} else {
			return cellValA === cellValB ? 0 : (cellValA > cellValB ? 1 : -1);
		}
}
var oagTowns = null;
var sagTownCaption = null;
var sagCountryCaption = null;
var sagRegionCaption = null;
function fillTownCaptions(callback) {
    var realm = getRealm();
    if (realm == null || realm == '') return;
    var locale = getLocale();
    var suffix = (locale === 'en') ? '_en' : '';
    if(sagTownCaption === null) {
        sagTownCaption = [];
    }
    if(oagTowns === null) {
        oagTowns = [];
    }

    $.getJSON('/by_trade_at_cities/'+realm+'/cities'+suffix+'.json', function (data) {
        $.each(data, function (key, val) {
            sagTownCaption[val.i] = val.c;
            oagTowns[val.i] = val;
        });
        if(typeof(callback) === 'function') callback();
    });
}
var coefficients = null;
//////////////////////////////////////////////////////
function getPriceCoef(attr, val, quality, brand){
	function find(attrValue){
		if(attr.values.length === 0){
			return 1;
		}
		for(var v = 0; v < attr.values.length; ++v){
			if(attrValue == attr.values[v]){
				return 1;
			}
		}
		return 0;
	}
	var value = 0;
	switch(attr.name){
	    case 'SELL_VOLUME_NUMBER': value = parseFloat(val.v) * parseFloat($('#market_volume_percent').val()) / 100; 
	    break;
	    case 'AVERAGE_SALARY': value = val.as;
	    break;
	    case 'EDUCATION_INDEX': value = val.ei;
	    break;
	    case 'LOCAL_PRICE': value = val.lpr;
	    break;
	    case 'LOCAL_QUALITY': value = val.lq;
	    break;
	    case 'LOCAL_PERCENT': value = val.lpe;
	    break;
	    case 'SHOP_SIZE': value = find($('#shopSize').val());
	    break;
	    case 'TOWN_DISTRICT': value = find($('#townDistrict').val());
	    break;
	    case 'DEPARTMENT_COUNT': value = find($('#departmentCount').val());
	    break;
	    case 'BRAND': value = brand || parseFloat($('#brand').val());
	    break;
	    case 'QUALITY': value = quality || parseFloat($('#quality').val());
	    break;
	    case 'NOTORIETY': value = parseFloat($('#notoriety').val());
	    break;
	    case 'DEMOGRAPHY': value = parseFloat(oagTowns[val.ti].d);
	    break;
	    case 'VISITORS_COUNT': value = find($('#visitorsСount').val());
	    break;
	    case 'SELLER_COUNT': value = find(val.sc);
	    break;
	    case 'SERVICE_LEVEL':  value = find($('#serviceLevel').val());
	    break;
	    case 'MARKET_INDEX': value = find(val.mi);
	    break;
	}
	//console.log('attr.name = ' + attr.name);
	//console.log('attr.coef = ' + attr.coef);
	//console.log('value = ' + value);
	return attr.coef * value;
}
//резделитель разрядов
function commaSeparateNumber(val, sep){
    var separator = sep || ',';
    while (/(\d+)(\d{3})/.test(val.toString())){
        val = val.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1"+separator);
    }
    return val;
}
//////////////////////////////////////////////////////
function loadData() {
	var realm = getRealm();
	if (realm == null || realm == '') return;
	var productID = getProductId();
	if (productID == null || productID == '') return;
	
	if (oagTowns === null) {
	  fillTownCaptions(loadData);
	  return false;
        }
	setVal('shopSize', $('#shopSize').val());
	setVal('townDistrict', $('#townDistrict').val());
	setVal('departmentCount', $('#departmentCount').val());
	setVal('brand', $('#brand').val());
	setVal('quality', $('#quality').val());
	setVal('notoriety', $('#notoriety').val());
	setVal('visitorsСount', $('#visitorsСount').val());
	setVal('serviceLevel', $('#serviceLevel').val());
		
	
	$.getJSON('/by_trade_at_cities/'+realm+'/tradeAtCity_'+productID+'.json', function (data) {
		  var output = '';
		$.each(data, function (key, val) {
			var suitable = true;
			
			if (suitable && val.pi == $('#id_product').val()) {suitable = true;} else {suitable = false;}
			if (suitable && val.ci == nvl($('#id_country').val(),val.ci)) {suitable = true;} else {suitable = false;}
			if (suitable && val.ri == nvl($('#id_region').val(),val.ri)) {suitable = true;} else {suitable = false;}
			
			if(suitable){
				preditctionParams['wealth_index'] = val.wi;
				preditctionParams['education_index'] = val.ei;
				preditctionParams['market_index'] = val.mi;
				preditctionParams['market_volume'] = val.v;
				preditctionParams['local_percent'] = val.lpe;
				preditctionParams['price'] = parseFloat($('#priceFrom').val());
				
				var price = coefficients.coef;
				for(var a = 0; a < coefficients.attrs.length; ++a){
				  price += getPriceCoef(coefficients.attrs[a], val);
				}
				var price1 = coefficients.coef;
				for(var a = 0; a < coefficients.attrs.length; ++a){
				  price1 += getPriceCoef(coefficients.attrs[a], val, val.sq, val.sb);
				}
				var price2 = coefficients.coef;
				for(var a = 0; a < coefficients.attrs.length; ++a){
				  price2 += getPriceCoef(coefficients.attrs[a], val, val.lq);
				}
				output += '<tr class="trec">';
				output += '<td id="td_city"><a target="_blank" href="http://virtonomica.ru/'+realm+'/main/globalreport/marketing/by_trade_at_cities/'+val.pi+'/'+val.ci+'/'+val.ri+'/'+val.ti+'">'+val.tc+'</a></td>';
				output += '<td align="right" id="td_dem">'+ commaSeparateNumber(oagTowns[val.ti].d)+'</td>';
				output += '<td align="right" id="td_volume_set">'+price.toFixed(2)+'</td>';
				output += '<td align="right" id="td_volume_set1">'+price1.toFixed(2)+'</td>';
				output += '<td align="right" id="td_volume_set2">'+price2.toFixed(2)+'</td>';
				output += '<td align="right" id="td_volume_cv">'+val.spr+'</td>';
				output += '<td align="right" id="td_volume_cv1">'+val.sq+'</td>';
				output += '<td align="right" id="td_volume_cv2">'+val.sb+'</td>';
				output += '<td align="right" id="td_volume_perc_set">'+val.lpr+'</td>';
				output += '<td align="right" id="td_volume_perc_set1">'+val.lq+'</td>';
				output += '</tr>';
			}
		});
		$('#xtabletbody').html(output); 	// replace all existing content
		
		var svOrder = $('#sort_dir').val();
		var svColId = $('#sort_col_id').val();
		var isAscending = svOrder=='asc';
		var orderArrow = isAscending?'&#9650;':'&#9660;';
		$('#sort_by_'+svColId).html(orderArrow);
		 
		var table = document.getElementById('xtable');
		var tableBody = table.querySelector('tbody');
		tinysort(
				tableBody.querySelectorAll('tr')
				,{
						selector:'td#td_'+svColId
						,order: svOrder
						/*,sortFunction:function(a,b){
							return tableSortFunc(svColId, a, b);
						}*/
				}
		);
	});
		
	return false;
}

function loadProductCategories(callback) {
	var realm = getRealm();
	if (realm == null || realm == '') return;
	
	$.getJSON('/by_trade_at_cities/'+realm+'/product_categories.json', function (data) {
		var output = '<option value="" selected=""></option>';

		$.each(data, function (key, val) {
			output += '<option value="'+val.c+'">'+val.c+'</option>';
		});
		
		$('#id_category').html(output); 	// replace all existing content
		$('#products').html(''); 
		if(callback != null) callback();
	});
	return false;
}
function loadProducts(callback) {
	var realm = getRealm();
	if (realm == null || realm == '') return;
	
	var svCategoryId = $('#id_category').val();
	if (svCategoryId == null || svCategoryId == '') return;
	
	$.getJSON('/by_trade_at_cities/'+realm+'/products.json', function (data) {
		var output = '';
		var selected = $('#id_product').attr('value');
		
		$.each(data, function (key, val) {
			if(svCategoryId == val.pc){
				output += '&nbsp;<img src="http://virtonomica.ru'+val.s+'"';
				if(selected != null && selected == val.i){
					output += ' border="1"';
				}
				output += ' width="24" height="24" id="img'+val.i+'" title="'+val.c+'" style="cursor:pointer" onclick="changeProduct('+val.i+')">';
			}
		});
		
		$('#products').html(output); 	// replace all existing content
		if(callback != null) callback();
	});
	return false;
}
function loadCountries(callback) {
	var realm = getRealm();
	if (realm == null || realm == '') return;
	
	$.getJSON('/by_trade_at_cities/'+realm+'/countries.json', function (data) {
		var output = '<option value="" selected=""></option>';

		$.each(data, function (key, val) {
			output += '<option value="'+val.i+'">'+val.c+'</option>';
		});
		
		$('#id_country').html(output); 	// replace all existing content
		$('#id_region').html(''); 	// replace all existing content
		if(callback != null) callback();
	});
	return false;
}
function loadRegions(callback) {
	var realm = getRealm();
	if (realm == null || realm == '') return;
	
	var svCountryId = $('#id_country').val();
	if (svCountryId == null || svCountryId == '') return;
	
	$.getJSON('/by_trade_at_cities/'+realm+'/regions.json', function (data) {
		var output = '<option value="" selected=""></option>';
		
		$.each(data, function (key, val) {
			if(val.ci == svCountryId){
				output += '<option value="'+val.i+'">'+val.c+'</option>';
			}
		});
		
		$('#id_region').html(output); 	// replace all existing content
		if(callback != null) callback();
	});
	return false;
}
function changeRealm(productCategoriesCallback, countryCallback) {
	oagTowns = null;
	loadProductCategories(productCategoriesCallback);
	loadCountries(countryCallback);
	setVal('realm', getRealm());
	fillUpdateDate();
}
function changeCategory(callback) {
	loadProducts(callback);
	setVal('id_category', $('#id_category').val());
}
function changeCountry(callback) {
	$('#id_region').html(''); 	// replace all existing content
	loadRegions(callback);
	loadData();
	setVal('id_country', $('#id_country').val());
}
function changeRegion() {
	loadData();
	setVal('id_region', $('#id_region').val());
}
function changeProduct(productId) {
	$.getJSON('/predict_retail_sales/coefficients/'+productId+'.json', function (data) {
		coefficients = data;
		var arr = coefficients.attrs.filter(function(val){return val.name == 'VISITORS_COUNT'}).map(function(val) {return val.values;});
		arr = flatten(arr).filter(onlyUnique).sort(function(a,b){ return parseFloat(a.replace(/\D+/g,'')) - parseFloat(b.replace(/\D+/g,''));});
		$('#visitorsСount').html(arr.map(function(val){ return '<option value="'+val+'">'+val+'</option>';}));
	$('#visitorsСount').val(getVal('visitorsСount'));
		
	var selected = $('#id_product').val();
	if(selected != null && selected != ''){
		$('#img'+selected).attr('border','');
	}
	$('#img'+productId).attr('border','1');
	$('#id_product').val(productId);
	loadData();
	setVal('id_product', $('#id_product').val());
	    });
	
	$.get('/predict_retail_sales/coefficients/'+productId+'.summary.txt', function (data1) {
	  $.get('/predict_retail_sales/coefficients/'+productId+'.formula.txt', function (data2) {
	    $('#prediction_summary').html(data1.replace(/\n/g,'<br>') + '<br>' + data2.replace(/\n/g,'<br>'));
	  });
	});
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
function getSearchParameters() {
      var prmstr = window.location.search.substr(1);
      return prmstr != null && prmstr != "" ? transformToAssocArray(prmstr) : {};
}
function fillUpdateDate() {
	$('#update_date').val(''); 	// replace all existing content
	var realm = getRealm();
	if (realm == null || realm == '') return;
	
	$.getJSON('./updateDate.json', function (data) {
		$('#update_date').val('обновлено: ' + data.d); 	// replace all existing content
	});
}

//////////////////////////////////////////////////////
$(document).ready(function () { 
	var table = document.getElementById('xtable');
	var tableHead = table.querySelector('thead');
		
	tableHead.addEventListener('click',function(e){
		var tableBody = table.querySelector('tbody');
		var tableHeader = e.target;
		var isAscending;
		var order;
		
		while (tableHeader.nodeName!=='TH') {
				tableHeader = tableHeader.parentNode;
		}
		
		var tableHeaderId = tableHeader.getAttribute('id').substr(3);
		if (tableHeaderId != null && tableHeaderId != '') {
			//console.log(tableHeaderId);
			isAscending = tableHeader.getAttribute('data-order')=='asc';
			order = isAscending?'desc':'asc';
			tableHeader.setAttribute('data-order',order);
			$('#sort_by_'+$('#sort_col_id').val()).html('');
			$('#sort_col_id').val(tableHeaderId);
			$('#sort_dir').val(order);
			setVal('sort_col_id', $('#sort_col_id').val());
			setVal('sort_dir', $('#sort_dir').val());
			var orderArrow = isAscending?'&#9660;':'&#9650;';
			$('#sort_by_'+tableHeaderId).html(orderArrow);
			tinysort(
					tableBody.querySelectorAll('tr')
					,{
							selector:'td#td_'+tableHeaderId
							,order: order
							/*,sortFunction:function(a,b){
								return tableSortFunc(tableHeaderId, a, b);
							}*/
					}
			);
		}
	});
	loadSavedFlt();
});
