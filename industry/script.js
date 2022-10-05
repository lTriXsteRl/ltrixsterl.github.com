
function getRealm(){
	return $('#realm').val();
}
function getProductID(){
	return $('#id_product').val();
}
function getVal(spName){
	return JSON.parse(window.localStorage.getItem(spName));
}
function setVal(spName, pValue){
	window.localStorage.setItem(spName,JSON.stringify(pValue));
}
function lockSubmit() {
	$('#btnSubmit').attr('disabled', true);
	var locale = getLocale();
	
	if (locale === 'en') {
		$('#btnSubmit').val('Please wait...');
	} else {
		$('#btnSubmit').val('Пожалуйста, подождите...');
	}
}
function unlockSubmit() {
	var locale = getLocale();
	
	if (locale === 'en') {
		$('#btnSubmit').val('Generate');
	} else {
		$('#btnSubmit').val('Сформировать');
	}
	$('#btnSubmit').attr('disabled', false);
}
function getLocale() {
	return getVal('locale') || $('#locale').val() || 'ru';
}
function applyLocale() {
	var locale = getLocale();
	
	if (locale === 'en') {
		document.title = "Production";
		$('#btnSubmit').val('Generate');
		$('#locale_flag').attr('src','/img/us.gif');
	} else {
		document.title = "Производство";
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
function getDomain(locale) {
  if (locale === 'en') {
	  return 'virtonomics.com';
	} else {
	  return 'virtonomica.ru';
	}
}
function updateGeneralReportLink(){
	var productID = getProductID();
	if (productID == null || productID == '') return;
	var realm = getRealm();
	if (realm == null || realm == '') return;
	var locale = getLocale();
	var domain = getDomain(locale);
	$('#general_report_link').attr('href','https://'+domain+'/'+realm+'/main/globalreport/product_history/'+productID+'/');
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
		fillFormFromUrl(urlParams);
	}

	var sort_col_id = urlParams['sort_col_id'] || getVal('sort_col_id_ind') || 'costperqua';
	if (sort_col_id != null || sort_col_id != '') {
	    $('#sort_col_id').val(sort_col_id);
	}
	var sort_dir = urlParams['sort_dir'] || getVal('sort_dir_ind') || 'asc';
	if (sort_dir != null || sort_dir != '') {
	    $('#sort_dir').val(sort_dir);
	}
	
	$('#tech_from').val(urlParams['tech_from'] || getVal('tech_from') || 20);
	$('#tech_to').val(urlParams['tech_to'] || getVal('tech_to') || 20);
	$('#quality_from').val(urlParams['quality_from'] || getVal('quality_from') || 1);
	$('#workQuan').val(getVal('workQuan') || 10000);
	$('#workSalary').val(getVal('workSalary') || 300);
	$('#volumeFrom_'+id_product).val(getVal('volumeFrom_'+id_product) || getVal('volumeFrom') || 1);
	
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
		loadProductCategories();
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
//////////////////////////////////////////////////////
var tableCache = [];
function addToResultCache(val){
	var suitable = true;
	//console.log('val.quality = ' + val.quality);
	//console.log('val.cost = ' + val.cost);
	
	if (suitable && val.quality >= parseFloatFromFilter("#quality_from", val.quality)) {suitable = true;} else {suitable = false;}
	if (suitable && val.quality <= parseFloatFromFilter('#quality_to', val.quality)) {suitable = true;} else {suitable = false;}
	
	if (suitable && val.cost >= parseFloatFromFilter('#cost_from', val.cost)) {suitable = true;} else {suitable = false;}
	if (suitable && val.cost <= parseFloatFromFilter('#cost_to', val.cost)) {suitable = true;} else {suitable = false;}
	
	if(suitable){
		var existed = tableCache[val.quality];
		if(existed == null || existed.cost > val.cost){
			tableCache[val.quality] = val;
		}
	}
}

function sortTable(){
	var svOrder = $('#sort_dir').val();
	var svColId = $('#sort_col_id').val();
	 
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
	var isAscending = svOrder=='asc';
	var orderArrow = isAscending?'&#9650;':'&#9660;';
	$('#sort_by_'+svColId).html(orderArrow);
	
	$('#sort_col_id').val(svColId);
	$('#sort_dir').val(svOrder);
	setVal('sort_col_id_ind', $('#sort_col_id').val());
	setVal('sort_dir_ind', $('#sort_dir').val());
}
var sagMaterialImg = null;
function updateTableFromCache(splicedTableCache){
	var realm = getRealm();
	var output = '';
	var locale = getLocale();
	var domain = getDomain(locale);
	var href = '';
	var unitHref = '';
	var imgSrc = '';
	var techHref = '';
	var svMaterialsImg = '';
	var svMaterialsQty = '';
	var svMaterialsQual = '';
	var svMaterialsPrice = '';
	//var svPricePerQty = '';
	var svDate = new Date().toISOString().slice(0, 10);
	var openCalcHref = '';
	var specHref = '';
	var nvTechFrom = parseFloatFromFilter('#tech_from', 20);
	var nvTechTo = parseFloatFromFilter('#tech_to', 20);

	splicedTableCache.forEach(function(val){
		output += '<tr class="trec hoverable">';
		openCalcHref = 'http://ovh.belyan.in/factory/'+val.manufactureID+'.html';
		specHref = 'https://'+domain+'/'+realm+'/main/industry/unit_type/info/'+val.manufactureID;
		output += '<td align="center"><a target="_blank" href="'+specHref+'">'+val.spec+'</a>&nbsp;<a target="_blank" href="'+openCalcHref+'"><img src="../favicon.ico"></a></td>';
		output += '<td align="center"><a target="_blank" href="https://'+domain+'/'+realm+'/main/globalreport/marketing?product_id='+ val.equipId +'#by-offers">'+val.equipQual+'</a></td>';
		techHref = 'https://'+domain+'/'+realm+'/main/globalreport/technology/'+val.manufactureID+'/'+val.tech+'/target_market_summary/'+svDate+'/bid';
		output += '<td align="center" id="td_tech" id="td_quality" data-value="'+val.tech+'"><a target="_blank" href="'+techHref+'">'+val.tech+'</a></td>';
		svMaterialsImg = '';
		svMaterialsQty = '';
		svMaterialsQual = '';
		svMaterialsPrice = '';
		//vPricePerQty = '';
		val.materials.forEach(function(mat){
			openCalcHref = '/industry/#id_product='+mat.productID+'&realm='+realm+'&tech_from='+nvTechFrom+'&tech_to='+nvTechTo+'&quality_from='+mat.quality;
			imgSrc = sagMaterialImg[mat.productID].replace('/img/products/','/img/products/16/');
			unitHref = 'https://'+domain+'/'+realm+'/main/unit/view/'+mat.unitID+'/';
			href = 'https://'+domain+'/'+realm+'/main/globalreport/marketing?product_id='+mat.productID+'#by-offers';
			svMaterialsImg += '<td align="center"><a target="_blank" href="'+href+'"><img src="'+imgSrc+'"></a></td>';
			svMaterialsQty += '<td align="center">'+commaSeparateNumber(mat.ingQty)+'&nbsp;</td>';
			svMaterialsQual += '<td align="center"><a target="_blank" href="'+openCalcHref+'">'+commaSeparateNumber(mat.quality)+'</a>&nbsp;</td>';
			//svPricePerQty += '<td align="center">$'+commaSeparateNumber((mat.price / mat.quality).toFixed(2))+'&nbsp;</td>';
			svMaterialsPrice += '<td align="center"><a target="_blank" href="'+unitHref+'">$'+commaSeparateNumber(mat.price)+'</a>&nbsp;</td>';
		});
		href = 'https://'+domain+'/'+realm+'/main/globalreport/marketing?product_id='+val.productID+'#by-offers';
		output += '<td align="center"><table cellspacing="0" cellpadding="0"><tr class="trec">'+svMaterialsImg+'</tr><tr class="trec">'+svMaterialsQty+'</tr><tr class="trec">'+svMaterialsQual+'</tr><tr class="trec">'+svMaterialsPrice+'</tr></table></td>';
		output += '<td align="center" id="td_quality" data-value="'+val.quality+'"><a target="_blank" href="'+href+'">'+commaSeparateNumber(val.quality)+'</a></td>';
		output += '<td align="center" id="td_quantity" data-value="'+val.quantity+'">'+commaSeparateNumber(val.quantity)+'</td>';
		output += '<td align="center" id="td_cost" data-value="'+val.cost+'"><a target="_blank" href="/by_trade_at_cities/#id_product='+val.productID+'&realm='+realm+'&local_price_from='+val.cost+'&local_quality_to='+val.quality+'&id_country=&id_region=&id_town=&sort_col_id=local_price&sort_dir=desc">$'+commaSeparateNumber(val.cost)+'</a></td>';
		output += '<td align="center" id="td_costperqua" data-value="'+(val.cost / val.quality).toFixed(2)+'">$'+commaSeparateNumber((val.cost / val.quality).toFixed(2))+'</td>';
		output += '<td align="center" id="td_profit" data-value="'+val.profit+'">$'+commaSeparateNumber(val.profit)+'</td>';
		output += '</tr>';
	});
	//console.log('output = ' + output);
	$('#xtabletbody').html(output); 	// replace all existing content
	if(output != ''){
		sortTable();
	}
}
//////////////////////////////////////////////////////
var material_remains = null;
function calcResult(recipe, materials, tech) {
	//console.log('calcResult for materials.length = ' + materials.length);
	var result = {
		spec: recipe.s
	 ,manufactureID : recipe.i
	 ,tech: tech
	 ,quality: 0
	 ,quantity: 0
	 ,cost: 0
	 ,profit: 0
	 ,equipQual: 0
	 ,equipId: recipe.e.i
	 ,materials: materials
	 ,productID: recipe.rp[0].pi
	};
	var ingQual = [],
				ingPrice = [],
				ingBaseQty = [],
				ingTotalPrice = [],
				IngTotalCost = 0;
				
	recipe.ip.forEach(function(ingredient) {
		ingBaseQty.push(ingredient.q || 0);
	});
	materials.forEach(function(material){
		ingQual.push(material.quality || 0);
		ingPrice.push(material.price || 0);
	});
	var num = ingQual.length;
	var eff = 1;
	var Sale_Price = parseFloatFromFilter("#salePrice") || 0;
	//количество товаров производимых 1 человеком
	var prodbase_quan   = recipe.rp[0].pbq;
	//var prodbase_quan2  = recipe.rp[1].pbq || 0;
	//итоговое количество товара за единицу производства
	var resultQty = recipe.rp[0].rq;
	
	var work_quant	= parseFloatFromFilter("#workQuan") || 10000;
	var work_salary	= parseFloatFromFilter("#workSalary") || 300;
	
	//квалификация работников
	//var PersonalQual = Math.pow(tech, 0.8);
	//$("#PersonalQual", this).text(PersonalQual.toFixed(2));
	
	//качество станков
	var EquipQual = Math.pow(tech, 1.2);
	//$("#EquipQuan", this).text(EquipQual.toFixed(2));
	result.equipQual = EquipQual.toFixed(2);
	
	var ingQuantity = [];
	//количество ингридиентов
	for (var i = 0; i < num; i++) {
		ingQuantity[i] = ingBaseQty[i] / resultQty * prodbase_quan * work_quant * Math.pow(1.05, tech-1 ) * eff;
		result.materials[i].ingQty = Math.round( ingQuantity[i] );
		//console.log('ingQuantity[i] = ' + ingQuantity[i]);
	}
	//цена ингридиентов
	for (var i = 0; i < num; i++) {
		if (ingPrice[i] > 0) {
			ingTotalPrice[i] = ingQuantity[i] * ingPrice[i];
		} else {
			ingTotalPrice[i] = 0;
		}
	}
	//общая цена ингридиентов
	for (var i = 0; i < num; i++) {
		IngTotalCost += ingTotalPrice[i];
	}
	//объем выпускаемой продукции
	var Prod_Quantity = work_quant * prodbase_quan * Math.pow(1.05, tech-1) *  eff;
	result.quantity = Math.round (Prod_Quantity);
	
	//итоговое качество ингридиентов
	var IngTotalQual = 0;
	var IngTotalQty = 0;
	for (var i = 0; i < num; i++) {
		IngTotalQual+= ingQual[i] * ingBaseQty[i];
		IngTotalQty += ingBaseQty[i];
	}
	IngTotalQual = IngTotalQual/IngTotalQty*eff;	
	
	//качество товара
	var ProdQual = Math.pow(IngTotalQual, 0.5) * Math.pow(tech, 0.65);
	//console.log('ProdQual = ' + ProdQual);
	//ограничение качества (по технологии)
	if (ProdQual > Math.pow(tech, 1.3) ) {ProdQual = Math.pow(tech, 1.3)}
	if ( ProdQual < 1 ) { ProdQual = 1 }	
	//бонус к качеству
	ProdQual = ProdQual * ( 1 + recipe.rp[0].qbp / 100 );
	//$("#ProdQual", this).text( ProdQual.toFixed(2) ) ;
	result.quality = ProdQual.toFixed(2);
	
	//себестоимость
	var zp = work_salary * work_quant;
	var exps = IngTotalCost + zp + zp * 0.1 ;
	//$("#Cost", this).text( "$" + commaSeparateNumber((exps / Prod_Quantity).toFixed(2)) );
	result.cost = (exps / Prod_Quantity ).toFixed(2);
	
	//прибыль
	var profit = ( Sale_Price * Prod_Quantity ) - exps;
	//$("#profit", this).text( "$" + commaSeparateNumber(profit.toFixed(2)) );
	result.profit = profit.toFixed(2);
	return result;
}
function cartesianProduct(a) { // a = array of array
		var totalMaxLen = 20000;
    var i, j, l, m, a1, o = [];
    if (!a || a.length === 0) {
    	return a;
    }

    a1 = a.splice(0,1);
    a = cartesianProduct(a);
    for (i = 0, l = a1[0].length; i < l; i++) {
        if (a && a.length){ 
					for (j = 0, m = a.length; j < m; j++) {
						o.push([a1[0][i]].concat(a[j]));
						if (o.length > totalMaxLen) {
							return o;
						}
					}
				} else {
          o.push([a1[0][i]]);
				}
    }
    return o;
}
function sortTableCache(a,b){
	var svOrder = $('#sort_dir').val();
	var svColId = $('#sort_col_id').val();
	var isAscending = svOrder=='asc';
	/*
	{
		spec: recipe.s
	 ,manufactureID : recipe.i
	 ,tech: tech
	 ,quality: 0
	 ,quantity: 0
	 ,cost: 0
	 ,profit: 0
	 ,equipQual: 0
	 ,materials: materials
	 ,productID: recipe.rp[0].pi
	};
	*/
	if(svColId == 'tech' && a.tech != b.tech){
		if(isAscending){
		  return a.tech - b.tech;
		} else {
		  return b.tech - a.tech;
		}
	} 
	else if(svColId == 'quality' && a.quality != b.quality){
		if(isAscending){
		  return a.quality - b.quality;
		} else {
		  return b.quality - a.quality;
		}
	} 
	else if(svColId == 'quantity' && a.quantity != b.quantity){
		if(isAscending){
		  return a.quantity - b.quantity;
		} else {
		  return b.quantity - a.quantity;
		}
	} 
	else if(svColId == 'cost' && a.cost != b.cost){
		if(isAscending){
		  return a.cost - b.cost;
		} else {
		  return b.cost - a.cost;
		}
	} 
	else if(svColId == 'profit' && a.profit != b.profit){
		if(isAscending){
		  return a.profit - b.profit;
		} else {
		  return b.profit - a.profit;
		}
	} else {
		return a.cost/a.quality - b.cost/b.quality;
	}
}
function sortAndUpdateResult() {
	tableCache.sort(sortTableCache);
	var splicedTableCache = tableCache;
	splicedTableCache.splice(50);
	
	console.log('updateTableFromCache for splicedTableCache.length = ' + splicedTableCache.length);
	updateTableFromCache(splicedTableCache);
}
function sortMaterials(a,b){
	var svOrder = $('#sort_dir').val();
	var svColId = $('#sort_col_id').val();
	var isAscending = svOrder=='asc';
	/*{
	  quality: remain.q
	 ,price  : remain.p
	 ,ingQty : 0
	 ,remain : remain.r
	 ,productID : productID
	 ,unitID : remain.ui
	};*/
	if(svColId == 'quality' && a.quality != b.quality){
		if(isAscending){
		  return a.quality - b.quality;
		} else {
		  return b.quality - a.quality;
		}
	} 
	else if(svColId == 'cost' && a.price != b.price){
		if(isAscending){
		  return a.price - b.price;
		} else {
		  return b.price - a.price;
		}
	} 
	else {
		return a.price/a.quality - b.price/b.quality;
	}
}
function getRecipeIngErrMsg(recipe) {
  var realm = getRealm();
  var svText = '';
  recipe.ip.forEach(function(ingredient) {
    var svProductID = ingredient.pi;
    var svImgUrl = sagMaterialImg[svProductID];
    svText += '+<a href="/industry/#id_product='+svProductID+'&realm=' + realm + '" target="_blank">';
    svText += '<img src="'+ svImgUrl+'" width="16" height="16" id="img'+svProductID+'" productID="'+svProductID+'">';
    svText += '</a>';
  });
  return svText.substr(1);
}
function calcProduction(recipe) {
	var remains = [];
	var allExists = true;
	var locale = getLocale();
	var domain = getDomain(locale);
	var realm = getRealm();
	var notAllHasRemains = (locale == 'en') ? 'Not all ingredients has remains for producrion ' : 'Недостаточно запасов ингридиентов на складе для производства ';
	notAllHasRemains += getRecipeIngErrMsg(recipe);
	notAllHasRemains += '=<a target="_blank" href="https://'+domain+'/'+realm+'/main/industry/unit_type/info/'+recipe.i+'">"'+recipe.s+'"</a>';
	recipe.ip.forEach(function(ingredient) {
		if(allExists){
//		    console.log('typeof material_remains = "' + typeof(material_remains) + '"');
//		    console.log('typeof material_remains[ingredient.pi] = "' + typeof(material_remains[ingredient.pi]) + '"');
			var material_remains_ing = null;
			if (material_remains[ingredient.pi] != null && material_remains[ingredient.pi].length != 0){
			  material_remains_ing = material_remains[ingredient.pi].filter(function(ing_remain) {
			      return ing_remain.quality >= ingredient.mq;
			  });
			}

			if (material_remains_ing === null || material_remains_ing.length === 0) {
				allExists = false;
			} else {
				remains.push(material_remains_ing);
			}
		}
	});
	if (!allExists){
		unlockSubmit();
		if($('#messages > p[name="remain_not_found_'+ recipe.i +'"]').length === 0) {
			$('#messages').append('<p name="remain_not_found_'+ recipe.i +'">'+notAllHasRemains+'</p>');
			console.log('calcProduction not all ingredients has remains');
		}
		return;
	}
	var tech_from = $("#tech_from").val() || 10;
	var tech_to = $("#tech_to").val() || tech_from;
	if (tech_to < tech_from) {
		tech_to = tech_from;
	}
	setVal('tech_from', tech_from);
	setVal('tech_to', tech_to);
	setVal('workQuan', $('#workQuan').val());
	setVal('workSalary', $('#workSalary').val());
	//setVal('volumeFrom', $('#volumeFrom').val());
	for (var key in savVolumeFromByMaterials ) {
		setVal('volumeFrom_'+key, $('#volumeFrom_'+key).val());
	}
	
	console.log('cartesianProduct for remains.length = ' + remains.length);
	materials = cartesianProduct(remains);
	var techDiff = tech_to - tech_from + 1;
	console.log('cartesianProduct result materials.length = ' + materials.length);
	//materials.sort(function(a,b) { return a.price/a.quality - b.price/b.quality } );
	//materials.splice(10000/techDiff);
	materials.sort(sortMaterials);
	materials.splice(10000/techDiff);
	console.log('cartesianProduct result sorted materials.length = ' + materials.length);

	for (var tech = tech_from; tech <= tech_to; tech++) {
	  console.log('calcResult for tech = ' + tech);
		materials.forEach(function(mats) {
			var result = calcResult(recipe, mats, tech);
			addToResultCache(result);
		});
	}
	var tmp = [];
	for (var key in tableCache) {
		tmp.push(tableCache[key]);
	}
	tableCache = tmp;
	sortAndUpdateResult();
	unlockSubmit();
}
function sortRemains(a,b){
	var svOrder = $('#sort_dir').val();
	var svColId = $('#sort_col_id').val();
	var isAscending = svOrder=='asc';
	/*{
	  quality: remain.q
	 ,price  : remain.p
	 ,ingQty : 0
	 ,remain : remain.r
	 ,productID : productID
	 ,unitID : remain.ui
	};*/
	if(svColId == 'quality' && a.quality != b.quality){
		if(isAscending){
		  return a.quality - b.quality;
		} else {
		  return b.quality - a.quality;
		}
	} else if(svColId == 'cost' && a.price != b.price){
		if(isAscending){
		  return a.price - b.price;
		} else {
		  return b.price - a.price;
		}
	} else if(svColId == 'costperqua' && a.price/a.quality != b.price/b.quality) {
		if(isAscending){
		  return a.price/a.quality - b.price/b.quality;
		} else {
		  return b.price/b.quality - a.price/a.quality;
		}
	} else {
        return a.remain - b.remain;
    }
}
function loadRemains(recipe, productID, npMinQuality) {
	var realm = getRealm();
	if (realm == null || realm == '') {
		unlockSubmit();
		return;
	}
	if (productID == null || productID == '') {
		unlockSubmit();
		return;
	}
	var locale = getLocale();
	var domain = getDomain(locale);
	var notAllHasRemains = (locale == 'en') ? 'Not all ingredients has remains for producrion ' : 'Недостаточно запасов ингридиентов на складе для производства ';
	notAllHasRemains += getRecipeIngErrMsg(recipe);
	notAllHasRemains += '=<a target="_blank" href="https://'+domain+'/'+realm+'/main/industry/unit_type/info/'+recipe.i+'">"'+recipe.s+'"</a>';

	console.log('load ./'+realm+'/product_remains_'+productID+'.json');
	$.getJSON('./'+realm+'/product_remains_'+productID+'.json', function (remains) {
		remains.forEach(function(remain) {
			var suitable = true;
			if(material_remains[productID] == null){
				material_remains[productID] = [];
			}
			//if (suitable && remain.q >= npMinQuality) {suitable = true;} else {suitable = false;}
			if (suitable && remain.r >= parseFloatFromFilter('#volumeFrom_'+productID,remain.r)) {suitable = true;} else {suitable = false;}
			if (suitable && (remain.mo === 0 || remain.mo >= parseFloatFromFilter('#volumeFrom_'+productID,remain.mo))) {suitable = true;} else {suitable = false;}
			
			if(suitable){
				material_remains[productID].push({
					quality: remain.q
				 ,price  : remain.p
				 ,ingQty : 0
				 ,remain : remain.r
				 ,productID : productID
				 ,unitID : remain.ui
				});
			}
		});
		var tmp = material_remains[productID];
		tmp.sort(sortRemains);
		tmp.splice(100);
		material_remains[productID]  = tmp;

		calcProduction(recipe);
	})
	  .fail(function() {
		if($('#messages > p[name="remain_not_found_'+ recipe.i +'"]').length === 0) {
			$('#messages').append('<p name="remain_not_found_'+ recipe.i +'">'+notAllHasRemains+'</p>');
		}
		unlockSubmit();
	  });
}

Object.size = function(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};
var savVolumeFromByMaterials = [];
function addVolumeFromForIngredient(productID) {
	if(savVolumeFromByMaterials[productID] === 1) return;
	var size = Object.size(savVolumeFromByMaterials);
	if (size > 0 && size % 6 === 0){
	  $('#volumeFromByMaterials').append('<br>'); 
	}
	var realm = getRealm();
	var locale = getLocale();
	var domain = getDomain(locale);
	
	var imgSrc = sagMaterialImg[productID].replace('/img/products/','/img/products/16/');
	var defVal = getVal('volumeFrom_'+productID) || getVal('volumeFrom') || 1;
	var fromLabel = (locale == 'en') ? 'from' : 'от';
	var field = '&nbsp;'+fromLabel+'&nbsp;<input type="number" id="volumeFrom_'+productID+'" size="7" maxlength="32" value="'+defVal+'"> ';
	var href = 'https://'+domain+'/'+realm+'/main/globalreport/marketing?product_id='+productID+'#by-offers';
	var svMaterialImg = '<a target="_blank" href="'+href+'"><img src="'+imgSrc+'"></a>';
	$('#volumeFromByMaterials').append(svMaterialImg + field); 
	savVolumeFromByMaterials[productID] = 1;
}
function loadRecipe() {
	var realm = getRealm();
	if (realm == null || realm == '') {
		unlockSubmit();
		return;
	}
	var productID = getProductID();
	if (productID == null || productID == '') {
		unlockSubmit();
		return;
	}
	var suffix = (getLocale() == 'en') ? '_en' : '';
	material_remains = [];
	console.log('load ./'+realm+'/recipe_'+productID+suffix+'.json');
	$.getJSON('./'+realm+'/recipe_'+ productID + suffix +'.json', function (recipes) {
		recipes.forEach(function(recipe) {
			recipe.ip.forEach(function(ingredient) {
			  	addVolumeFromForIngredient(ingredient.pi); 
				loadRemains(recipe, ingredient.pi, ingredient.mq);
			});
		});
	})
	  .fail(function() {
		unlockSubmit();
	  });
}
function fillFormFromUrl(urlParams){
	var newVal = '';
	['tech_from', 'tech_to', 'quality_from'].map( function(attrID) {
		newVal = urlParams[attrID];
		if(newVal != null && newVal != '') {
			$('#' + attrID).val(newVal);
		}
	});
}
function updateUrl() {
	var productID = getProductID();
	var realm = getRealm();
	var svColId = $('#sort_col_id').val();
	var svOrder = $('#sort_dir').val();
	var tech_from = $('#tech_from').val();
	var tech_to = $('#tech_to').val();
	var quality_from = $('#quality_from').val();

	window.history.pushState("", ""
		, '#id_product='  + productID
		+ '&realm='       + realm
		+ '&tech_from='    + strToNum(tech_from)
		+ '&tech_to='      + strToNum(tech_to)
		+ '&quality_from=' + strToNum(quality_from)
		+ '&sort_col_id=' + svColId
		+ '&sort_dir='    + svOrder
	);
}
function loadData() {
	if (sagMaterialImg === null) return false;
	if ($('#btnSubmit').attr('disabled') === 'disabled') {
		return false;
	} else {
		lockSubmit();
		$('#messages').html('');
	    $('#xtabletbody').html('');
	}
	tableCache = [];

	updateUrl();

	/*
	- загрузить рецепт
	- для каждого ингридиента загрузить остатки
	- посчитать производимую продукцию
	- применить фильтр и если подошло записать в таблицу результатов
	*/
	loadRecipe();
	//разблокируем по таймауту в случае ошибок
	setTimeout(function() {
		unlockSubmit();
	},10000);
	
	return false;
}

function loadProductCategories(callback) {
	var realm = getRealm();
	if (realm == null || realm == '') return;
	var suffix = (getLocale() == 'en') ? '_en' : '';
	
	$.getJSON('./'+realm+'/materials'+suffix+'.json', function (data) {
		var output = '';
		var categories = [];
		$.each(data, function (key, val) {
			if(categories[val.pc] == null && val.pc != 'Полезные ископаемые' && val.pc != 'Natural resources'){
				output += '<option value="'+val.pci+'">'+val.pc+'</option>';
				categories[val.pc] = 1;
			}
		});
		
		$('#id_category').html(output); 	// replace all existing content
		$('#materials').html(''); 
		
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
	
	$.getJSON('./'+realm+'/materials'+suffix+'.json', function (data) {
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
		
		$('#materials').html(output);
		if(typeof(callback) === 'function') callback();
	});
	return false;
}
function changeRealm(productCategoriesCallback) {
	loadProductCategories(productCategoriesCallback);
	setVal('realm', getRealm());
	fillUpdateDate();
	updateGeneralReportLink();
}
function changeCategory(callback) {
	loadProducts(callback);
	setVal('id_category', $('#id_category').val());
}
function changeProduct(productId) {
	var selected = $('#id_product').val();
	if(selected != null && selected != ''){
		$('#img'+selected).attr('border','');
	}
	savVolumeFromByMaterials = [];
	$('#volumeFromByMaterials').html(''); 
	$('#img'+productId).attr('border','1');
	$('#id_product').val(productId);
	loadData();
	setVal('id_product', $('#id_product').val());
	updateGeneralReportLink();
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
	$('#update_date').text('');
	var realm = getRealm();
	if (realm == null || realm == '') return;
	var prefix = (getLocale() == 'en') ? 'updated' : 'обновлено';
	
	$.getJSON('./'+realm+'/updateDate.json', function (data) {
		$('#update_date').text(prefix+': ' + data.d);
	});
}

function selectCategoryByProduct(productId, callback) {
	if (productId == null || productId == '') return;
	var realm = getRealm();
	if (realm == null || realm == '') return;
	var suffix = (getLocale() == 'en') ? '_en' : '';
	
	$.getJSON('./'+realm+'/materials'+suffix+'.json', function (data) {
		$.each(data, function (key, val) {
			if(productId === val.i){
				$('select#id_category').val(val.pci);
			}
		});
		loadProducts(callback);
	});
	return false;
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
	var table = document.getElementById('xtable');
	var tableHead = table.querySelector('thead');
		
	tableHead.addEventListener('click',function(e){
		var tableHeader = e.target;
		var isAscending;
		var order;
		var orderArrow;
		
		while (tableHeader.nodeName!=='TH') {
				tableHeader = tableHeader.parentNode;
		}
		
		var tableHeaderId = tableHeader.getAttribute('id').substr(3);
		if (tableHeaderId != null && tableHeaderId != '') {
			//console.log(tableHeaderId);
			isAscending = tableHeader.getAttribute('data-order')=='asc';
            order = isAscending ? 'desc' : 'asc';
            orderArrow = isAscending ? '&#9660;' : '&#9650;';
			tableHeader.setAttribute('data-order',order);
			$('#sort_by_'+$('#sort_col_id').val()).html('');
			$('#sort_col_id').val(tableHeaderId);
			$('#sort_dir').val(order);
			setVal('sort_col_id_ind', $('#sort_col_id').val());
			setVal('sort_dir_ind', $('#sort_dir').val());
			$('#sort_by_'+tableHeaderId).html(orderArrow);
			loadData();
		}
	});
	loadSavedFlt(urlParams);

	if (getLocale() != 'ru') {
		 $('#locale').val(getLocale());
		applyLocale();
	}
});
