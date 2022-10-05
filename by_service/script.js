
function getRealm(){
	return $('#realm').val();
}
function getServiceID(){
	return $('#id_service').val();
}
function getDomain(locale) {
  if (locale === 'en') {
	  return 'virtonomics.com';
	} else {
	  return 'virtonomica.ru';
	}
}
function updateReferenceLink(){
	var serviceID = getServiceID();
	if (serviceID == null || serviceID == '') return;
	var realm = getRealm();
	if (realm == null || realm == '') return;
	var locale = getLocale();
	var domain = getDomain(locale);
	//https://virtonomica.ru/olga/main/industry/unit_type/info/359926
	$('#reference_link').attr('href','https://'+domain+'/'+realm+'/main/industry/unit_type/info/'+serviceID);
}
function nvl(val1, val2){
	if (val1 == null || val1 == '' || val1 === 'NaN'){
		return val2;
	} else {
		return val1;
	}
}
function getVal(spName){
	return JSON.parse(window.localStorage.getItem(spName));
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
		document.title = "Services sector";
		$('#btnSubmit').val('Generate');
		$('#locale_flag').attr('src','/img/us.gif');
	} else {
		document.title = "Сфера услуг";
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
	var realm      = getVal('realm') || 'olga';
	var id_country = getVal('id_country');
	var id_region  = getVal('id_region');
	var id_town    = getVal('id_town');
	var id_service = getVal('id_service');
	var id_service_spec = getVal('id_service_spec');

	if (Object.keys(urlParams).length > 1 && urlParams['realm'] != '' && urlParams['id_service'] != '') {
		realm       = urlParams['realm'];
		id_country  = urlParams['id_country'];
		id_region   = urlParams['id_region'];
		id_town     = urlParams['id_town'];
		id_service  = urlParams['id_service'];
		id_service_spec  = urlParams['id_service_spec'];
		fillFormFromUrl(urlParams);
	}

	var sort_col_id = urlParams['sort_col_id'] || getVal('sort_col_id_service') || 'perc';
	if (sort_col_id != null || sort_col_id != '') {
	    $('#sort_col_id').val(sort_col_id);
	}
	var sort_dir = urlParams['sort_dir'] || getVal('sort_dir_service') || 'asc';
	if (sort_dir != null || sort_dir != '') {
	    $('#sort_dir').val(sort_dir);
	}
	
	if (realm != null || realm != '') {
		$('#realm').val(realm);
		var productCategoriesCallback = function() {
			if (id_service == null || id_service == '') {
				id_service = $('#id_service').val();
				if (id_service == null || id_service == '') {
					$('#services > img').eq(0).click();
				}
			}
		};
		var changeRegionCallback = function() {
			$('#id_town').val(id_town).trigger("chosen:updated");
			changeTown();
		};
		var changeCountryCallback = function() {
			$('#id_region').val(id_region).trigger("chosen:updated");
			changeRegion(changeRegionCallback);
  		};
		var countryCallback = function() {
			$('#id_country').val(id_country).trigger("chosen:updated");
			changeCountry(changeCountryCallback);
  		};
		$('#id_service').val(id_service);
		setVal('id_service_spec', id_service_spec);
		changeRealm(productCategoriesCallback, countryCallback);
		
	} else {
		loadServices();
		loadCountries();
		fillUpdateDate();
	}
	$('input[type="text"]').each(function(){
			$(this).val(commaSeparateNumber($(this).val(),' '));
	});
	$('input[type="text"]')
	 .focus(function(){
			$(this).val($(this).val().replace(/\s+/g,''));
	 })
	 .focusout(function() {
			$(this).val(commaSeparateNumber($(this).val(),' '));
      });
}
function strToNum(spStr){
    if (spStr == null) {
        return null;
    } else {
        return parseFloat(spStr.replace(',', '.').replace(/\s+/g, ''), 10);
    }
}
function parseFloatFromFilter(spSelector, npDefVal){
    return strToNum($(spSelector).val()) || npDefVal;
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

var sagInvisibibleColumns = [];
function getColStyle(spColID){
	if ($.inArray(spColID, sagInvisibibleColumns) >= 0) {
		return 'style="display: none;"';
	} else {
		return '';
	}
}
function fillFormFromUrl(urlParams){
	var newVal = '';
	['percent_from', 'percent_to', 'price_from', 'price_to'].map( function(attrID) {
		newVal = urlParams[attrID];
		if(newVal != null && newVal != '') {
			$('#' + attrID).val(newVal);
		}
	});
}
function updateUrl() {
	var serviceID = getServiceID();
	var serviceSpecID = $('#id_service_spec').val();
	var realm = getRealm();
	var svColId = $('#sort_col_id').val();
	var svOrder = $('#sort_dir').val();
	var id_country = $('#id_country').val();
	var id_region = $('#id_region').val();
	var id_town = $('#id_town').val();
	var percent_from = $('#percent_from').val();
	var percent_to = $('#percent_to').val();
	var price_from = $('#price_from').val();
	var price_to = $('#price_to').val();

	window.history.pushState("", ""
		, '#id_service='      + serviceID
		+ '&id_service_spec=' + serviceSpecID
		+ '&realm='           + realm
		+ '&id_country='      + id_country
		+ '&id_region='       + id_region
		+ '&id_town='         + id_town
		+ '&percent_from='     + strToNum(percent_from)
		+ '&percent_to='       + strToNum(percent_to)
		+ '&price_from='       + strToNum(price_from)
		+ '&price_to='         + strToNum(price_to)
		+ '&sort_col_id='     + svColId
		+ '&sort_dir='        + svOrder
	);
}
var agTownAvgSalary;
//////////////////////////////////////////////////////
function loadData() {
	var realm = getRealm();
	if (realm == null || realm == '') return;
	var serviceID = getServiceID();
	if (serviceID == null || serviceID == '') return;
	var locale = getLocale();
	var showLabel = (locale === 'en') ? 'Show' : 'Показать';
	var suffix = (locale === 'en') ? '_en' : '';
	var domain = getDomain(locale);
	if (sagTownCaption === null) {
	  fillTownCaptions(loadData);
	  return false;
	}
	var id_country = $('#id_country').val();
	var id_region = $('#id_region').val();
	var id_town = $('#id_town').val();
//    console.log('loadData /'+realm+'/tradeAtCity_'+serviceID+'.json, caller is '+ arguments.callee.caller.toString());

	updateUrl();
	
	$.getJSON('./'+realm+'/serviceAtCity_'+serviceID + suffix+'.json', function (data) {
		var output = '';
		var serviceSpec = $('#id_service_spec > option').eq($('#id_service_spec').val()).text();
        var percent = 0;
		var retailBySpec = null;
		var calcBySpec = null;

		$.each(data, function (key, val) {
			var suitable = true;
			
			if(id_town == null || id_town == ''){
			  if(id_region == null || id_region == ''){
			    if (suitable && val.ci == nvl(id_country,val.ci)) {suitable = true;} else {suitable = false;}
			  } else {
			    if (suitable && val.ri == id_region) {suitable = true;} else {suitable = false;}
			  }
			} else {
			  if (suitable && val.ti == id_town) {suitable = true;} else {suitable = false;}
			}
			
			if (suitable && parseFloat(val.p) >= parseFloatFromFilter('#price_from',val.p)) {suitable = true;} else {suitable = false;}
			if (suitable && parseFloat(val.p) <= parseFloatFromFilter('#price_to',val.p)) {suitable = true;} else {suitable = false;}
			
			if (suitable && parseFloat(val.wi) >= parseFloatFromFilter('#w_idx_from',val.wi)) {suitable = true;} else {suitable = false;}
			if (suitable && parseFloat(val.wi) <= parseFloatFromFilter('#w_idx_to',val.wi)) {suitable = true;} else {suitable = false;}

			if (suitable && parseFloat(val.mdi) >= parseFloatFromFilter('#mdi_from',val.mdi)) {suitable = true;} else {suitable = false;}
			if (suitable && parseFloat(val.mdi) <= parseFloatFromFilter('#mdi_to',val.mdi)) {suitable = true;} else {suitable = false;}

			if (suitable){
				if(val['cbs'] != null){
					calcBySpec = val.cbs[serviceSpec];
					if(calcBySpec != null){
						if (suitable && parseFloat(calcBySpec.lpr) >= parseFloatFromFilter('#cbs_lpr_from',calcBySpec.lpr)) {suitable = true;} else {suitable = false;}
						if (suitable && parseFloat(calcBySpec.lpr) <= parseFloatFromFilter('#cbs_lpr_to',calcBySpec.lpr)) {suitable = true;} else {suitable = false;}
					}
				}
			}
            		percent = val.pbs[serviceSpec] || 0;
			if (suitable){
				suitable = false;
				if(percent >= parseFloatFromFilter('#percent_from',percent) && percent <= parseFloatFromFilter('#percent_to',percent)) {
				    suitable = true;
				}
			    }

			if(suitable){
				var area_rent_title = (locale === 'en') ? 'Rent 1 m2\n\
Trendy neighborhood '+ (nvl(parseFloat(val['ar']), 1) / 1000 * 2.25).toFixed(2) +'\n\
City centre         '+ (nvl(parseFloat(val['ar']), 1) / 1000 * 1.5).toFixed(2) +'\n\
Residential area    '+ (nvl(parseFloat(val['ar']), 1) / 1000 * 1).toFixed(2) +'\n\
Outskirts           '+ (nvl(parseFloat(val['ar']), 1) / 1000 * 0.66).toFixed(2) +'\n\
Suburb              '+ (nvl(parseFloat(val['ar']), 1) / 1000 * 0.44).toFixed(2) +'' : 'Стоимость аренды 1 м2\n\
Фешенебельный район '+ (nvl(parseFloat(val['ar']), 1) / 1000 * 2.25).toFixed(2) +'\n\
Центр города        '+ (nvl(parseFloat(val['ar']), 1) / 1000 * 1.5).toFixed(2) +'\n\
Спальный район      '+ (nvl(parseFloat(val['ar']), 1) / 1000 * 1).toFixed(2) +'\n\
Окраина             '+ (nvl(parseFloat(val['ar']), 1) / 1000 * 0.66).toFixed(2) +'\n\
Пригород            '+ (nvl(parseFloat(val['ar']), 1) / 1000 * 0.44).toFixed(2) +'';
				
				output += '<tr class="trec hoverable">';
				output += '<td id="td_city" title="'+sagCountryCaption[val.ci]+' - '+sagRegionCaption[val.ri]+'" data-value="'+ sagTownCaption[val.ti] +'"><a target="_blank" href="https://'+domain+'/'+realm+'/main/globalreport/marketing?geo='+val.ci+'/'+val.ri+'/'+val.ti+'&unit_type_id='+serviceID+'#by-service">'+sagTownCaption[val.ti]+'</a></td>';
				output += '<td '+getColStyle('w_idx')+' align="right" id="td_w_idx" data-value="'+ parseFloat(val.wi).toFixed(2) +'">'+ parseFloat(val.wi).toFixed(2) +'</td>';
				output += '<td '+getColStyle('as')+' align="right" id="td_as" data-value="'+ parseFloat(agTownAvgSalary[val.ti]).toFixed(2) +'">'+ parseFloat(agTownAvgSalary[val.ti]).toFixed(2) +'</td>';
				output += '<td '+getColStyle('mdi')+' align="right" id="td_mdi" data-value="'+ parseFloat(val.mdi).toFixed(2) +'">'+parseFloat(val.mdi).toFixed(2)+'</td>';
				output += '<td '+getColStyle('market_volume')+' align="right" id="td_market_volume" data-value="'+ val.v +'">'+ commaSeparateNumber(val.v) +'</td>';
				output += '<td '+getColStyle('dem')+' align="right" id="td_dem" data-value="'+ unknownIfNull(locale, nvl(oagTowns[val.ti], [])['d']) +'">'+ commaSeparateNumber(unknownIfNull(locale, nvl(oagTowns[val.ti], [])['d']))+'</td>';
				output += '<td '+getColStyle('pop')+' align="right" id="td_pop" data-value="'+ unknownIfNull(locale, nvl(oagTowns[val.ti], [])['p']) +'">'+ commaSeparateNumber(unknownIfNull(locale, nvl(oagTowns[val.ti], [])['p']))+'</td>';
				output += '<td '+getColStyle('perc')+' align="right" id="td_perc" data-value="'+ percent.toFixed(2) +'">'+percent.toFixed(2)+'</td>';
				output += '<td '+getColStyle('area_rent')+' align="right" id="td_area_rent" title="'+ area_rent_title +'" data-value="'+ unknownIfNull(locale, (parseFloat(val['ar']) / 1000).toFixed(2)) +'">'+unknownIfNull(locale, (parseFloat(val['ar']) / 1000).toFixed(2))+'</td>';
				output += '<td '+getColStyle('price')+' align="right" id="td_price" data-value="'+ parseFloat(val.p).toFixed(2) +'">'+ commaSeparateNumber(parseFloat(val.p).toFixed(2)) +'</td>';
				output += '<td '+getColStyle('sc')+' align="right" id="td_sc" data-value="'+ val.sc +'">'+val.sc+'</td>';
				output += '<td '+getColStyle('cc')+' align="right" id="td_cc" data-value="'+ val.cc +'">'+val.cc+'</td>';
				output += '<td '+getColStyle('itr')+' align="right" id="td_itr" data-value="'+ val.itr +'">'+ val.itr +'</td>';


				if(val['cbs'] != null){
					calcBySpec = val.cbs[serviceSpec];
					if(calcBySpec != null){
						output += '<td '+getColStyle('cbs_lpr')+' align="right" id="td_cbs_lpr" data-value="'+parseFloat(calcBySpec.lpr).toFixed(2)+'">' + commaSeparateNumber(parseFloat(calcBySpec.lpr).toFixed(2)) + '</td>';
						output += '<td '+getColStyle('cbs_lq')+' align="right" id="td_cbs_lq" data-value="'+parseFloat(calcBySpec.lq).toFixed(2)+'">' + commaSeparateNumber(parseFloat(calcBySpec.lq).toFixed(2)) + '</td>';
						output += '<td '+getColStyle('cbs_spr')+' align="right" id="td_cbs_spr" data-value="'+parseFloat(calcBySpec.spr).toFixed(2)+'">' + commaSeparateNumber(parseFloat(calcBySpec.spr).toFixed(2)) + '</td>';
						output += '<td '+getColStyle('cbs_sq')+' align="right" id="td_cbs_sq" data-value="'+parseFloat(calcBySpec.sq).toFixed(2)+'">' + commaSeparateNumber(parseFloat(calcBySpec.sq).toFixed(2)) + '</td>';
					}
				}

				if(val['rbs'] != null){
					retailBySpec = val.rbs[serviceSpec];
					if(retailBySpec != null){
						$('#equip_raw_mat_body > tr:eq(0) > td:eq(2) > a > img').each(function() {
							var rbsKey = $(this).attr('productID');
							output += '<td '+getColStyle('rbs_lpr')+' align="right" id="td_rbs_lpr_' + rbsKey + '" data-value="'+parseFloat(retailBySpec[rbsKey].lpr).toFixed(2)+'"><a target="_blank" href="https://' + domain + '/' + realm + '/main/globalreport/marketing?geo=' + val.ci + '/' + val.ri + '/' + val.ti + '&product_id=' + rbsKey + '#by-trade-at-cities">' + commaSeparateNumber(parseFloat(retailBySpec[rbsKey].lpr).toFixed(2)) + '</a></td>';
							output += '<td '+getColStyle('rbs_lq')+' align="right" id="td_rbs_lq_' + rbsKey + '" data-value="'+parseFloat(retailBySpec[rbsKey].lq).toFixed(2)+'"><a target="_blank" href="https://' + domain + '/' + realm + '/main/globalreport/marketing?geo=' + val.ci + '/' + val.ri + '/' + val.ti + '&product_id=' + rbsKey + '#by-trade-at-cities">' + commaSeparateNumber(parseFloat(retailBySpec[rbsKey].lq).toFixed(2)) + '</a></td>';
							output += '<td '+getColStyle('rbs_spr')+' align="right" id="td_rbs_spr_' + rbsKey + '" data-value="'+parseFloat(retailBySpec[rbsKey].spr).toFixed(2)+'"><a target="_blank" href="https://' + domain + '/' + realm + '/main/globalreport/marketing?geo=' + val.ci + '/' + val.ri + '/' + val.ti + '&product_id=' + rbsKey + '#by-trade-at-cities">' + commaSeparateNumber(parseFloat(retailBySpec[rbsKey].spr).toFixed(2)) + '</a></td>';
							output += '<td '+getColStyle('rbs_sq')+' align="right" id="td_rbs_sq_' + rbsKey + '" data-value="'+parseFloat(retailBySpec[rbsKey].sq).toFixed(2)+'"><a target="_blank" href="https://' + domain + '/' + realm + '/main/globalreport/marketing?geo=' + val.ci + '/' + val.ri + '/' + val.ti + '&product_id=' + rbsKey + '#by-trade-at-cities">' + commaSeparateNumber(parseFloat(retailBySpec[rbsKey].sq).toFixed(2)) + '</a></td>';
						});
					}
				}
				output += '</tr>';
			}
		});
		
		$('#xtabletbody').html(output); 
		
		if(output != ''){	
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
							,data: 'value'
					}
			);
			$('#sort_col_id').val(svColId);
			$('#sort_dir').val(svOrder);
			setVal('sort_col_id_service', $('#sort_col_id').val());
			setVal('sort_dir_service', $('#sort_dir').val());
		}
	});
	return false;
}

function unknownIfNull(locale, opValue) {
	if (opValue == null || opValue === '' || opValue === 'NaN'){
	  return (locale == 'en') ? 'unknown' : 'не изв.';
	} else {
	  return opValue;
	}
}
function loadServices(callback) {
	var realm = getRealm();
	if (realm == null || realm == '') return;
	var locale = getLocale();
	var suffix = (locale == 'en') ? '_en' : '';
    var selected = $('#id_service').val();
	
	$.getJSON('./'+realm+'/service_unit_types'+suffix+'.json', function (data) {
		var services = '';
		var serviceSpecs = '';

		$.each(data, function (key, val) {
			services += '&nbsp;<img src="'+ val.iu+'"';
            if(selected != null && selected == val.i){
                services += ' border="1"';
                for (var i in val.s) {
                    serviceSpecs += '<option value="'+i+'">'+val.s[i].c+'</option>';
                }
            }
            services += ' width="24" height="24" id="img'+val.i+'" title="'+val.c+'" style="cursor:pointer" onclick="changeService(\''+val.i+'\')">';
		});

		$('#services').html(services);
		$('#id_service_spec').html(serviceSpecs);
        var id_service_spec = getVal('id_service_spec');
		$('#id_service_spec').val(id_service_spec);
        id_service_spec = $('#id_service_spec').val();
        if (id_service_spec == null || id_service_spec == '') {
            id_service_spec = $('#id_service_spec > option').eq(0).val();
            $('#id_service_spec').val(id_service_spec);
        }
        updateEquipRawMat(data);
		if(typeof(callback) === 'function') {
			callback();
		}
	});
	return false;
}
function updateEquipRawMat(data){
    var selected = $('#id_service').val();
    var id_service_spec = $('#id_service_spec').val();
	var locale = getLocale();
	var domain = getDomain(locale);
	var realm = getRealm();
	var svRetailRow = (locale == 'en') ? 'Show remains in warehouses' : 'Показать запасы на складах';
	var svSelfProdRow = (locale == 'en') ? 'Calculate production' : 'Посчитать производство';
	var localPrice = (locale == 'en') ? '<span title="Local suppliers price">L.s. price</span>' : 'Местные, цена';
	var localQuality = (locale == 'en') ? '<span title="Local suppliers quality">L.s. quality</span>' : 'Местные, качество';
	var shopPrice = (locale == 'en') ? 'Stores price' : 'Магазины, цена';
	var shopQuality = (locale == 'en') ? 'Stores quality' : 'Магазины, качество';

    if (id_service_spec != null || id_service_spec != '') {
        $.each(data, function (key, val) {
            if(selected != null && selected == val.i){
                var equipCell = '';
                var equipProdCell = '';
                var rawMatCell = '';
                var rawMatProdCell = '';
				var nvDynColCnt = 2;
				var svDynColHeaders = '';
				var svImgUrl = '';
				var svProductID = '';
				var svProductCaption = '';

                for (var i in val.s) {
                    if(i === id_service_spec){
						nvDynColCnt += 4;
						svDynColHeaders += '<th '+getColStyle('cbs_lpr')+' id="th_cbs_lpr">'+localPrice+'(sum)&nbsp;<b id="sort_by_cbs_lpr"></b></th>';
						svDynColHeaders += '<th '+getColStyle('cbs_lq')+' id="th_cbs_lq">'+localQuality+'(avg)&nbsp;<b id="sort_by_cbs_lq"></b></th>';
						svDynColHeaders += '<th '+getColStyle('cbs_spr')+' id="th_cbs_spr">'+shopPrice+'(sum)&nbsp;<b id="sort_by_cbs_spr"></b></th>';
						svDynColHeaders += '<th '+getColStyle('cbs_sq')+' id="th_cbs_sq">'+shopQuality+'(avg)&nbsp;<b id="sort_by_cbs_sq"></b></th>';
                        if(val.s[i].e != null){
						  svImgUrl = val.s[i].e.s;
						  svProductID = val.s[i].e.i;
						  svProductCaption = val.s[i].e.c;
						  equipCell += '<a href="https://'+domain+'/'+realm+'/main/globalreport/marketing?product_id='+ svProductID +'#by-offers" target="_blank">';
						  equipCell += '<img src="'+ svImgUrl +'" width="16" height="16" id="img'+ svProductID +'" title="'+ svProductCaption +'"">';
						  equipCell += '</a>';
						  equipProdCell += '<a href="/industry/#id_product='+ svProductID +'&realm=' + realm + '" target="_blank">';
						  equipProdCell += '<img src="'+ svImgUrl +'" width="16" height="16" id="img'+ svProductID +'" title="'+ svProductCaption +'"">';
						  equipProdCell += '</a>';
                        }
                        if(val.s[i].rm != null){
                            for (var k in val.s[i].rm) {
								svImgUrl = val.s[i].rm[k].s;
								svProductID = val.s[i].rm[k].i;
								svProductCaption = val.s[i].rm[k].c;
                                rawMatCell += '<a href="https://'+domain+'/'+realm+'/main/globalreport/marketing?product_id='+svProductID+'#by-offers" target="_blank">';
                                rawMatCell += '<img src="'+ svImgUrl+'" width="16" height="16" id="img'+svProductID+'" productID="'+svProductID+'" title="'+svProductCaption+'"">';
                                rawMatCell += '</a>';
                                rawMatProdCell += '<a href="/industry/#id_product='+svProductID+'&realm=' + realm + '" target="_blank">';
                                rawMatProdCell += '<img src="'+ svImgUrl+'" width="16" height="16" id="img'+svProductID+'" productID="'+svProductID+'" title="'+svProductCaption+'"">';
                                rawMatProdCell += '</a>';
								nvDynColCnt += 4;
								svDynColHeaders += '<th '+getColStyle('rbs_lpr')+' id="th_rbs_lpr_' + svProductID + '">' + localPrice + '<img src="' + svImgUrl + '" width="16" height="16" title="' + svProductCaption + '"">&nbsp;<b id="sort_by_rbs_lpr_' + svProductID + '"></b></th>';
								svDynColHeaders += '<th '+getColStyle('rbs_lq')+' id="th_rbs_lq_'+svProductID+'">'+localQuality+'<img src="'+ svImgUrl+'" width="16" height="16" title="'+svProductCaption+'"">&nbsp;<b id="sort_by_rbs_lq_'+svProductID+'"></b></th>';
								svDynColHeaders += '<th '+getColStyle('rbs_spr')+' id="th_rbs_spr_' + svProductID + '">' + shopPrice + '<img src="' + svImgUrl + '" width="16" height="16" title="' + svProductCaption + '"">&nbsp;<b id="sort_by_rbs_spr_' + svProductID + '"></b></th>';
								svDynColHeaders += '<th '+getColStyle('rbs_sq')+' id="th_rbs_sq_'+svProductID+'">'+shopQuality+'<img src="'+ svImgUrl+'" width="16" height="16" title="'+svProductCaption+'"">&nbsp;<b id="sort_by_rbs_sq_'+svProductID+'"></b></th>';
							}
                        }
                        break;
                    }
                }
                var equip_raw_mat_body = '<tr class="trec hoverable"><td>'+svRetailRow+'</td><td>'+ equipCell +'</td><td>'+ rawMatCell +'</td></tr>';
                equip_raw_mat_body += '<tr class="trec hoverable"><td>'+svSelfProdRow+'</td><td>'+ equipProdCell +'</td><td>'+ rawMatProdCell +'</td></tr>';
				$('#equip_raw_mat_body').html(equip_raw_mat_body);

				$('#th_dyn_col').attr('colspan', nvDynColCnt);
				$('#tr_dyn_col').html(svDynColHeaders);
                //break each
                return false;
            }
        });
    }
}
function changeService(newVal) {
    $('#id_service').val(newVal);
    setVal('id_service', newVal);
	loadServices(loadData);
	updateReferenceLink();
}
function changeServiceSpec() {
    setVal('id_service_spec', $('#id_service_spec').val());
	var realm = getRealm();
	if (realm == null || realm == '') return;
	var suffix = (getLocale() == 'en') ? '_en' : '';

	$.getJSON('./'+realm+'/service_unit_types'+suffix+'.json', function (data) {
        updateEquipRawMat(data);
	    loadData();
	});
	return false;
}
function loadCountries(callback) {
	var realm = getRealm();
	if (realm == null || realm == '') return;
	var locale = getLocale();
	var suffix = (locale == 'en') ? '_en' : '';
	if(sagCountryCaption === null) {
		sagCountryCaption = [];
	}
	if(sagRegionCaption === null) {
		sagRegionCaption = [];
	}

    $.getJSON('/by_trade_at_cities/'+realm+'/regions'+suffix+'.json', function (data) {
        $.each(data, function (key, val) {
            sagRegionCaption[val.i] = val.c;
        });
    });

	$.getJSON('/by_trade_at_cities/'+realm+'/countries'+suffix+'.json', function (data) {
	  var allCountries = (locale == 'en') ? 'All countries' : 'Все страны';
	  var allRegions = (locale == 'en') ? 'All regions' : 'Все регионы';
		var output = '<option value="" selected="">'+allCountries+'</option>';

		$.each(data, function (key, val) {
			output += '<option value="'+val.i+'">'+val.c+'</option>';
			sagCountryCaption[val.i] = val.c;
		});
		
		$('#id_country').html(output).trigger("chosen:updated");
		$('#id_region').html('<option value="" selected="">'+allRegions+'</option>').trigger("chosen:updated");
		if(typeof(callback) === 'function') callback();
	});
	return false;
}
function loadTowns(callback) {
	var realm = getRealm();
	if (realm == null || realm == '') return;

	var svCountryId = $('#id_country').val();
	var svRegionId = $('#id_region').val();
	var locale = getLocale();
	var suffix = (locale == 'en') ? '_en' : '';
	var allTowns = (locale == 'en') ? 'All cities' : 'Все города';
	agTownAvgSalary = [];

	$.getJSON('/by_trade_at_cities/'+realm+'/cities'+suffix+'.json', function (data) {
		var output = '<option value="" selected="">'+allTowns+'</option>';

		$.each(data, function (key, val) {
			agTownAvgSalary[val.i] = val.as;
			if(svRegionId !== null && svRegionId != ''){
				if(val.ri == svRegionId){
					output += '<option value="'+val.i+'">'+val.c+'</option>';
				}
			} else if(svCountryId !== null && svCountryId != ''){
				if(val.ci == svCountryId){
					output += '<option value="'+val.i+'">'+val.c+'</option>';
				}
			} else {
				output += '<option value="'+val.i+'">'+val.c+'</option>';
			}
		});

		$('#id_town').html(output).trigger("chosen:updated");
		if(typeof(callback) === 'function') callback();
	});
	return false;
}
function loadRegions(callback) {
	var realm = getRealm();
	if (realm == null || realm == '') return;
	
	var svCountryId = $('#id_country').val();
	var locale = getLocale();
	var suffix = (locale == 'en') ? '_en' : '';
	var allRegions = (locale == 'en') ? 'All regions' : 'Все регионы';

    $.getJSON('/by_trade_at_cities/'+realm+'/regions'+suffix+'.json', function (data) {
        var output = '<option value="" selected="">'+allRegions+'</option>';

        if (svCountryId == null || svCountryId == '') {
            $.each(data, function (key, val) {
                output += '<option value="'+val.i+'">'+val.c+'</option>';
            });
        } else {
            $.each(data, function (key, val) {
                if(val.ci == svCountryId){
                    output += '<option value="'+val.i+'">'+val.c+'</option>';
                }
            });
        }

        $('#id_region').html(output).trigger("chosen:updated");
		loadTowns(callback);
    });
	return false;
}
function changeRealm(productCategoriesCallback, countryCallback) {
	fillTownCaptions();
	loadServices(productCategoriesCallback);
    if(typeof(countryCallback) !== 'function') {
        var id_country = getVal('id_country');
        var id_region = getVal('id_region');
        var regionCallback = function() {
            if(id_region != null && id_region != '') {
                $('#id_region').val(getVal('id_region')).trigger("chosen:updated");
            }
            loadData();
        };
        countryCallback = function() {
            if(id_country != null && id_country != '') {
                $('#id_country').val(id_country).trigger("chosen:updated");
            }
            loadRegions(regionCallback);
        };
    }
	loadCountries(countryCallback);
	setVal('realm', getRealm());
	fillUpdateDate();
	updateReferenceLink();
}
function changeCountry(callback) {
//    console.log('changeCountry, caller is '+ arguments.callee.caller.toString());
	$('#id_region').html(''); 	// replace all existing content
//	console.log('changeCountry, typeof(callback) =  '+ typeof(callback));
	if (typeof(callback) !== 'function'){
		callback = function() {
			$('#id_region').val(getVal('id_region'));
			loadTowns(loadData);
		};
	}
	loadRegions(callback);
	setVal('id_country', $('#id_country').val());
}
function changeRegion(callback) {
	if (typeof(callback) === 'function'){
		loadTowns(callback);
	} else {
		loadTowns(loadData);
	}
	setVal('id_region', $('#id_region').val());
}
function changeTown() {
	loadData();
	setVal('id_town', $('#id_town').val());
}

function fillUpdateDate() {
	$('#update_date').text(''); 	// replace all existing content
	var realm = getRealm();
	if (realm == null || realm == '') return;
	var prefix = (getLocale() == 'en') ? 'updated' : 'обновлено';
	
	$.getJSON('./'+realm+'/updateDate.json', function (data) {
		$('#update_date').text(prefix+': ' + data.d); 	// replace all existing content
	});
}

function showCol(colID){
	if (colID.lastIndexOf('rbs_', 0) === 0 || colID.lastIndexOf('cbs_', 0) === 0){
		$('th[id^=th_'+ colID +'], td[id^=td_'+ colID +']', 'tr').show();
	} else {
		$('th#th_'+ colID +', td#td_' + colID, 'tr').show();
	}
	sagInvisibibleColumns = jQuery.grep(sagInvisibibleColumns, function(value) {
		return value != colID;
	});
}
function hideCol(colID){
	if (colID.lastIndexOf('rbs_', 0) === 0 || colID.lastIndexOf('cbs_', 0) === 0){
		$('th[id^=th_'+ colID +'], td[id^=td_'+ colID +']', 'tr').hide();
	} else {
		$('th#th_'+ colID +', td#td_' + colID, 'tr').hide();
	}
	sagInvisibibleColumns.push(colID);
}
function showAllCol(){
	$('select#show_hide_col_ru > option').each(function() {
		var value = $(this).attr('value');
		showCol(value);
	});
	sagInvisibibleColumns = [];
	setVal('invisibible_columns_service', sagInvisibibleColumns);
}
function hideAllCol(){
	$('select#show_hide_col_ru > option').each(function() {
		var value = $(this).attr('value');
		hideCol(value);
	});
	setVal('invisibible_columns_service', sagInvisibibleColumns);
}
function onlyUnique(value, index, self) { 
    return self.indexOf(value) === index;
}
function initShowHideColSelect() {
	var show_hide_col_id = (getLocale() === 'en') ? "show_hide_col_en" : "show_hide_col_ru";
	var show_hide_col = $("select#" + show_hide_col_id).multiselect();

	show_hide_col.multiselect({
		click: function(event, ui){
			if (ui.checked) {
				showCol(ui.value);
			} else {
				hideCol(ui.value);
			}
			setVal('invisibible_columns_service', sagInvisibibleColumns.filter(onlyUnique) );
		},
		checkAll: function(){
			showAllCol();
		},
		uncheckAll: function(){
			hideAllCol();
		}
	});

	sagInvisibibleColumns = getVal('invisibible_columns_service');
	if (sagInvisibibleColumns == null) {
		sagInvisibibleColumns = ['dem', 'pop', 'rbs_lpr', 'rbs_lq', 'rbs_spr', 'rbs_sq', 'cbs_lq', 'cbs_spr', 'cbs_sq'];
	} else {
		sagInvisibibleColumns = sagInvisibibleColumns.filter(onlyUnique);
	}
	$.each(sagInvisibibleColumns, function (key, val) {
//            console.log('key = '+key +', val = '+val);
		hideCol(val);
		$("select#"+ show_hide_col_id +" > option[value="+val+"]").attr('selected',false);
	});
	show_hide_col.multiselect('refresh');
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
	initShowHideColSelect();

	$('#id_country').chosen({
		inherit_select_classes: true
		,search_contains: true
		,include_group_label_in_selected: true
		,width: "300px"
	});
	$('#id_region').chosen({
		inherit_select_classes: true
		,search_contains: true
		,include_group_label_in_selected: true
		,width: "350px"
	});
	$('#id_town').chosen({
		inherit_select_classes: true
		,search_contains: true
		,include_group_label_in_selected: true
		,width: "250px"
	});

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
			var ascDesc = tableHeader.getAttribute('data-order');
			isAscending = ascDesc=='asc';
			order = isAscending?'desc':'asc';
			tableHeader.setAttribute('data-order',order);
			$('#sort_by_'+$('#sort_col_id').val()).html('');
			$('#sort_col_id').val(tableHeaderId);
			$('#sort_dir').val(order);
			setVal('sort_col_id_service', $('#sort_col_id').val());
			setVal('sort_dir_service', $('#sort_dir').val());
			var orderArrow = isAscending?'&#9660;':'&#9650;';
			$('#sort_by_'+tableHeaderId).html(orderArrow);
			tinysort(
					tableBody.querySelectorAll('tr')
					,{
							selector:'td#td_'+tableHeaderId
							,order: order
							,data: 'value'
					}
			);
		}
	});
	loadSavedFlt(urlParams);

	if (getLocale() != 'ru') {
		 $('#locale').val(getLocale());
		applyLocale();
	}
});
