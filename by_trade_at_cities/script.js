
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
function view_graph(item,city) {
    var realm = getRealm();
    if (realm == null || realm == '') return;
    var locale = getLocale();
    var domain = getDomain(locale);
    var imgSrc = 'https://'+domain+'/'+realm+'/graph/globalreport/marketing/product/'+item+'/'+city+'/';
    if($("#graph > img").attr('src') == imgSrc){
        clear_graph();
    } else {
        $("#graph").html('<div style="position: fixed; bottom:250px; right:15px;">'
            + '<a href="#" onclick="clear_graph(); return false;">x</a></div>'
            + '<img src="' + imgSrc + '" width="900" height="250" style="border: 1px solid #CCCCCC; padding: 5px; margin: 3px;">'
        );
        $('div[name="graph_color_mark"]').show();
    }
}
function clear_graph() {
    $("#graph").html('');
    $('div[name="graph_color_mark"]').hide();
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
}
function nvl(val1, val2){
    if (val1 == null || val1 == ''){
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
        document.title = "Retail sales";
        $('#btnSubmit').val('Generate');
        $('#locale_flag').attr('src','/img/us.gif');
    } else {
        document.title = "Розничная торговля в городах";
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
    if (/^\d+$/.test(volume)) {
        return commaSeparateNumber(volume);
    } else if (locale === 'en') {
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
function loadPredictionData(predRow, data) {
    var productID = getProductID();
    if (productID == null || productID == '') return;
    var locale = getLocale();
    var notEnoughDataMsg = (locale === 'en') ? 'Not enough data. Try another day.' : 'Недостаточно данных. Попробуйте в другой день.';

    var output = '';
    var svMarketIdx = predRow.prev().find('>td#td_idx').attr('data-value');
    console.log("svMarketIdx = '"+ svMarketIdx+"'" );
    var nvMarketVolume = parseFloat(predRow.prev().find('>td#td_volume').attr('data-value'));
    var nvMarketVolumeDelta = nvMarketVolume * 0.25;
    console.log("nvMarketVolume = '"+ nvMarketVolume+"'" );
    var nvWealthIndex = parseFloat(predRow.prev().find('>td#td_w_idx').attr('data-value'));
    console.log("nvWealthIndex = '"+ nvWealthIndex+"'" );
    var tableId = 'table_' + predRow.attr('id');
    var uniqPred = [];
    var suitable = true;
    var maxCnt = 50;

    $.each(data, function (key, val) {
        suitable = true;
        key = val.sv + '|' + Math.round(val.p) + '|' + Math.round(val.q) + '|' + Math.round(val.b) + '|';
        key += val.mv + '|' + val.sc + '|' + val.sl + '|' + val.vc + '|' + val.td + '|';
        key += val.ss + '|' + val.dc + '|' + val.mi;

        if (suitable && (val.mi === svMarketIdx || svMarketIdx === '')) {
            suitable = true;
        } else if (suitable) {
            suitable = false;
            //console.log("marketIdx = '"+ val.mi +"'" );
        }
        if (suitable && parseFloat(val.wi) >= (nvWealthIndex - 2) && parseFloat(val.wi) <= (nvWealthIndex + 2)) {
            suitable = true;
        } else if (suitable) {
            suitable = false;
            //console.log("wealthIndex = '"+ val.wi +"'" );
        }
        if (suitable && parseFloat(val.mv) >= (nvMarketVolume - nvMarketVolumeDelta) && parseFloat(val.mv) <= (nvMarketVolume + nvMarketVolumeDelta)) {
            suitable = true;
        } else if (suitable) {
            suitable = false;
            //console.log("marketVolume = '"+ val.mv +"'" );
        }
        if (suitable && parseFloat(val.n) >= 100) {
            suitable = true;
        } else if (suitable) {
            suitable = false;
            //console.log("notoriety = '"+ val.n +"'" );
        }
        if (suitable && (key in uniqPred)) {
            suitable = false;
            console.log("cached");
        }

        if(suitable){
            maxCnt -= 1;
            uniqPred[key] = 1;
            var marketShare = parseFloat(val['ms']);
            var sellVolume = 0;
            var sellVolumeStr = '';
            if(marketShare > 0){
                sellVolume = parseFloat(val.mv) * marketShare / 100;
                sellVolumeStr = '~' + commaSeparateNumber(sellVolume.toFixed(0));
            } else {
                sellVolume = parseFloat(val.sv.replace(/[\D]+/g,''));
                sellVolumeStr = getVolume(val.sv, locale);
            }
            
            output += '<tr class="trec hoverable">';
            output += '<td align="right" id="td_sellVolume">'+ sellVolumeStr + ' (' + Math.round(sellVolume/parseFloat(val.mv)*100) + '%)</td>';
            output += '<td align="right" id="td_price" data-value="'+ parseFloat(val.p).toFixed(2) +'">'+ commaSeparateNumber(parseFloat(val.p).toFixed(2)) +'</td>';
            output += '<td align="right" id="td_quality">'+parseFloat(val.q).toFixed(2)+'</td>';
            output += '<td align="right" id="td_brand">'+parseFloat(val.b).toFixed(2)+'</td>';
            output += '<td align="right" id="td_marketVolume">'+ commaSeparateNumber(val.mv) +'</td>';
            output += '<td align="center" id="td_sellerCnt">'+val.sc+'</td>';
            output += '<td align="center" id="td_serviceLevel">'+getServiceLevel(val.sl, locale) +'</td>';
            output += '<td align="right" id="td_visitorsCount">'+getVolume(val.vc, locale)+'</td>';
            output += '<td align="center" id="td_notoriety">'+parseFloat(val.n).toFixed(2)+'</td>';
            output += '<td align="center" id="td_townDistrict">'+getCityDistrict(val.td, locale) +'</td>';
            output += '<td align="right" id="td_shopSize">'+commaSeparateNumber(val.ss,' ')+'</td>';
            output += '<td align="center" id="td_departmentCount">'+val.dc+'</td>';
            output += '<td align="right" id="td_wealthIndex">'+parseFloat(val.wi).toFixed(2)+'</td>';
            output += '<td align="center" id="td_marketIdx">'+val.mi+'</td>';
            output += '</tr>';

            if (maxCnt <= 0) {
                //break each
                return false;
            }
        }
    });
    if (output === '') {
        predRow.html(notEnoughDataMsg);
    } else {
        var salesVolumeLabel = (locale === 'en') ? 'Sales volume' : 'Объем продаж';
        var brandLabel = (locale === 'en') ? 'Brand' : 'Бренд';
        var priceLabel = (locale === 'en') ? 'Price' : 'Цена';
        var marketVolumeLabel = (locale === 'en') ? 'Market volume' : 'Объем рынка';
        var qualityLabel = (locale === 'en') ? 'Quality' : 'Качество';
        var serviceLevelLabel = (locale === 'en') ? 'Service level' : 'Уровень сервиса';
        var sellerCntLabel = (locale === 'en') ? 'NoM' : 'К.п.';
        var sellerCntHint = (locale === 'en') ? 'Number of merchants' : 'Количество продавцов';
        var notorietyLabel = (locale === 'en') ? 'Popularity' : 'Известность';
        var visitorsCountLabel = (locale === 'en') ? 'Number of visitors' : 'Кол-во пос.';
        var visitorsCountHint = (locale === 'en') ? 'Number of visitors' : 'Количество посетителей';
        var townDistrictLabel = (locale === 'en') ? 'City district' : 'Район города';
        var shopSizeLabel = (locale === 'en') ? 'Trade area' : 'Торг. пл.';
        var departmentCountLabel = (locale === 'en') ? 'NoD' : 'К.о.';
        var departmentCountHint = (locale === 'en') ? 'Number of departments' : 'Количество отделов';
        var wealthIndexLabel = (locale === 'en') ? 'WL' : 'И.б.';
        var wealthIndexHint = (locale === 'en') ? 'Wealth level' : 'Индекс богатства';
        var indexLabel = (locale === 'en') ? 'Index' : 'И.';
        var indexHint = (locale === 'en') ? 'Index' : 'Индекс';

        var headers = '<thead><tr class="theader">';
        headers += '<th id="th_sellVolume">'+salesVolumeLabel+'&nbsp;<b id="sort_by_sellVolume"></b></th>';
        headers += '<th id="th_price">'+priceLabel+'&nbsp;<b id="sort_by_price"></b></th>';
        headers += '<th id="th_quality">'+qualityLabel+'&nbsp;<b id="sort_by_quality"></b></th>';
        headers += '<th id="th_brand">'+brandLabel+'&nbsp;<b id="sort_by_brand"></b></th>';
        headers += '<th id="th_marketVolume">'+marketVolumeLabel+'&nbsp;<b id="sort_by_marketVolume"></b></th>';
        headers += '<th id="th_sellerCnt" title="'+sellerCntHint+'">'+sellerCntLabel+'&nbsp;<b id="sort_by_sellerCnt"></b></th>';
        headers += '<th id="th_serviceLevel">'+serviceLevelLabel+'&nbsp;<b id="sort_by_serviceLevel"></b></th>';
        headers += '<th id="th_visitorsCount" title="'+visitorsCountHint+'">'+visitorsCountLabel+'&nbsp;<b id="sort_by_visitorsCount"></b></th>';
        headers += '<th id="th_notoriety">'+notorietyLabel+'&nbsp;<b id="sort_by_notoriety"></b></th>';
        headers += '<th id="th_townDistrict">'+townDistrictLabel+'&nbsp;<b id="sort_by_townDistrict"></b></th>';
        headers += '<th id="th_shopSize" title="Торговая площадь">'+shopSizeLabel+'&nbsp;<b id="sort_by_shopSize"></b></th>';
        headers += '<th id="th_departmentCount" title="'+departmentCountHint+'">'+departmentCountLabel+'&nbsp;<b id="sort_by_departmentCount"></b></th>';
        headers += '<th id="th_wealthIndex" title="'+wealthIndexHint+'">'+wealthIndexLabel+'&nbsp;<b id="sort_by_wealthIndex"></b></th>';
        headers += '<th id="th_marketIdx" title="'+indexHint+'">'+indexLabel+'&nbsp;<b id="sort_by_marketIdx"></b></th>';
        headers += '</tr></thead>';
        predRow.html('<td colspan=15><table id="'+tableId+'" border="0" width="100%" cellspacing="0" cellpadding="0">' + headers + '<tbody>' + output + '</tbody></table></td>'); 	// replace all existing content

        var table = document.getElementById(tableId);
        var tableBody = table.querySelector('tbody');
        tinysort(
            tableBody.querySelectorAll('tr')
            ,{
                selector:'td#td_price'
                ,order: 'desc'
                ,data: 'value'
            }
        );
    }
    return false;
}
function loadPredictionUnZipped(predRow) {
    var realm = getRealm();
    var productID = getProductID();
    if (productID == null || productID == '') return;
    var locale = getLocale();
    var notEnoughDataMsg = (locale === 'en') ? 'Not enough data. Try another day.' : 'Недостаточно данных. Попробуйте в другой день.';

    $.getJSON('./'+realm+'/retail_analytics_'+productID+'.json', function (data) {
        loadPredictionData(predRow, data);
    })
        .fail(function(jqxhr, textStatus, error) {
            var err = textStatus + ", " + error;
            console.log( "Request Failed: " + err );
            predRow.html(notEnoughDataMsg);
        });
    return false;
}
function loadPrediction(predRow) {
    var realm = getRealm();
    var productID = getProductID();
    if (productID == null || productID == '') return;

    console.log('./'+realm+'/retail_analytics_'+productID+'.json.zip');
    
    zip.workerScriptsPath = '/js/';
    zip.createReader(new zip.HttpReader('./'+realm+'/retail_analytics_'+productID+'.json.zip'), function(reader) {
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
                    loadPredictionData(predRow, data);
                });
            } else {
                loadPredictionUnZipped(predRow);
            }
        });
    }, function(error) {
        // onerror callback
        console.error(error);
        loadPredictionUnZipped(predRow);
    });
    return false;
}
function hideAllPredictions(){
    var locale = getLocale();
    var showLabel = (locale === 'en') ? 'Show' : 'Показать';

    $('tr[id^=prediction_]').remove();
    $('td[id^=toggle_prediction_] > a').text(showLabel);
}
function togglePrediction(npPredNum){
    var link = $('#toggle_prediction_' + npPredNum + ' > a');
    var locale = getLocale();
    var showLabel = (locale === 'en') ? 'Show' : 'Показать';
    var hideLabel = (locale === 'en') ? 'Hide' : 'Скрыть';
    var loadingLabel = (locale === 'en') ? 'Loading...' : 'Загружаю...';

    if(link.text() === hideLabel) {
        var predRow = $('#prediction_' + npPredNum);
        predRow.remove();
        link.text(showLabel);
    } else {
        link.closest('tr').after('<tr class="trec" id="prediction_'+npPredNum+'"><td colspan=15>'+loadingLabel+'</td></tr>');
        var predRow = $('#prediction_' + npPredNum);
        loadPrediction(predRow);
        link.text(hideLabel);
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
    var id_country  = getVal('id_country');
    var id_region   = getVal('id_region');
    var id_town     = getVal('id_town');
    var id_category = getVal('id_category');
    var id_product  = getVal('id_product');

    if (Object.keys(urlParams).length > 1 && urlParams['realm'] !== '' && urlParams['id_product'] !== '') {
        realm       = urlParams['realm'];
        id_country  = urlParams['id_country'];
        id_region   = urlParams['id_region'];
        id_town     = urlParams['id_town'];
        id_product  = urlParams['id_product'];
        fillFormFromUrl(urlParams);
    }

    var sort_col_id = urlParams['sort_col_id'] || getVal('sort_col_id_btac') || 'local_perc';
    if (sort_col_id != null || sort_col_id != '') {
        $('#sort_col_id').val(sort_col_id);
    }
    var sort_dir = urlParams['sort_dir'] || getVal('sort_dir_btac') || 'desc';
    if (sort_dir != null || sort_dir != '') {
        $('#sort_dir').val(sort_dir);
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
        var changeRegionCallback = function() {
            $('#id_town').val(id_town).trigger("chosen:updated");
            changeTown();
        };
        var changeCountryCallback = function() {
            $('#id_region').val(id_region).trigger("chosen:updated");
            //console.log("$('#id_region').childNodes.length = " + document.getElementById('id_region').childNodes.length);
            changeRegion(changeRegionCallback);
        };
        var countryCallback = function() {
            $('#id_country').val(id_country).trigger("chosen:updated");
            //console.log("$('#id_country').childNodes.length = " + document.getElementById('id_country').childNodes.length);
            changeCountry(changeCountryCallback);
        };
        changeRealm(productCategoriesCallback, countryCallback);

    } else {
        loadProductCategories();
        loadCountries();
        fillUpdateDate();
    }
    /*$('input[type="text"]').each(function(){
     $(this).val(commaSeparateNumber($(this).val(),' '));
     });
     $('input[type="text"]')
     .focus(function(){
     $(this).val($(this).val().replace(/\s+/g,''));
     })
     .focusout(function() {
     $(this).val(commaSeparateNumber($(this).val(),' '));
     });*/
}
// function parseFloatFromFilter(spSelector, npDefVal){
// 	return parseFloat($(spSelector).val().replace(',', '.').replace(/\s+/g,''),10) || npDefVal;
// }
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

    $.getJSON('./'+realm+'/cities'+suffix+'.json', function (data) {
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

function updateOthers(townID, attr){
    var realm = getRealm();
    if (realm == null || realm == '') return;

    var text = '';
    $('td[img_sub_product_id]').each(function() {
        var cell = $(this);
        var productID = cell.attr('img_sub_product_id');
        cell.attr('town_id', townID);
        $.getJSON('./'+realm+'/tradeAtCity_'+productID+'.json', function (data) {
            $.each(data, function (key, val) {
                if(townID === val.ti){
                    text = val[attr] + '';
                    if (text == '') {
                        cell.html('&nbsp;');
                    } else {
                        cell.html(shortenNumber(text.replace(/\.\d+$/,'')));
                    }
                }
            });
        });
    });
}

function addHoverHandlers() {
    var timer;
    var delay = 500;

    $('td[field_name]').hover(function() {
        var cell = $(this);
        var attrName = cell.attr('field_name');
        if (attrName != '') {
            //on mouse hover, start a timeout
            timer = setTimeout(function() {
                //Do your stuff here
                var townID = $('td#td_city', cell.parent()).attr('city_id');
                var townCaption = $('#td_city > a', cell.parent()).text();
                var locale = getLocale();
                var colID = 'th' + cell.attr('id').substr(2);
                var rowName = $('#' + colID + ' > span[lang="' + locale + '"]').text();
                $('td#img_sub_town_caption').html(townCaption + ', ' + rowName);
                updateOthers(townID, attrName);
            }, delay);
        }
    }, function() {
        //Do mouse leaving function stuff here
        clearTimeout(timer);
    });
}
function addImgSubProdHoverHandlers() {
    var timer;
    var delay = 500;

    $('td[img_sub_product_id]').hover(function() {
        var cell = $(this);
        var town_id = cell.attr('town_id');
        var product_id = cell.attr('img_sub_product_id');
        if (town_id != '') {
            //on mouse hover, start a timeout
            timer = setTimeout(function() {
                //Do your stuff here
                view_graph(product_id,town_id);
            }, delay);
        }
    }, function() {
        //Do mouse leaving function stuff here
        clearTimeout(timer);
        clear_graph();
    });
}
function fillFormFromUrl(urlParams){
    const localPriceFrom  = urlParams['local_price_from'];
    if (localPriceFrom != null && localPriceFrom !== '') {
        $('#localPriceFrom').val(localPriceFrom);
    }
    const localQualityTo  = urlParams['local_quality_to'];
    if (localQualityTo != null && localQualityTo !== '') {
        $('#localQualityTo').val(localQualityTo);
    }
}
function updateUrl() {
    var productID = getProductID();
    var realm = getRealm();
    var svColId = $('#sort_col_id').val();
    var svOrder = $('#sort_dir').val();
    var id_country = $('#id_country').val();
    var id_region = $('#id_region').val();
    var id_town = $('#id_town').val();
    window.history.pushState("", ""
        , '#id_product='  + productID
        + '&realm='       + realm
        + '&id_country='  + id_country
        + '&id_region='   + id_region
        + '&id_town='     + id_town
        + '&sort_col_id=' + svColId
        + '&sort_dir='    + svOrder
    );
}
//////////////////////////////////////////////////////
function loadData() {
    var realm = getRealm();
    if (realm == null || realm == '') return;
    var productID = getProductID();
    if (productID == null || productID == '') return;
    var locale = getLocale();
    var showLabel = (locale === 'en') ? 'Show' : 'Показать';
    var mayoralBonusesLabel = (locale === 'en') ? 'Mayoral bonuses' : 'Бонусы мэрии';
    var domain = getDomain(locale);
    if (sagTownCaption === null || oagTowns === null) {
        fillTownCaptions(loadData);
        return false;
    }
    var id_country = $('#id_country').val();
    var id_region = $('#id_region').val();
    var id_town = $('#id_town').val();
    var wealthIndexFrom = $('#wealthIndexFrom').val();
    var wealthIndexTo = $('#wealthIndexTo').val();
    var volumeFrom = $('#volumeFrom').val();
    var volumeTo = $('#volumeTo').val();
    var localPercentFrom = $('#localPercentFrom').val();
    var localPercentTo = $('#localPercentTo').val();
    var localPriceFrom = $('#localPriceFrom').val();
    var localPriceTo = $('#localPriceTo').val();
    var localQualityFrom = $('#localQualityFrom').val();
    var localQualityTo = $('#localQualityTo').val();
    var shopPriceFrom = $('#shopPriceFrom').val();
    var shopPriceTo = $('#shopPriceTo').val();
    var shopQualityFrom = $('#shopQualityFrom').val();
    var shopQualityTo = $('#shopQualityTo').val();
    var shopBrandFrom = $('#shopBrandFrom').val();
    var shopBrandTo = $('#shopBrandTo').val();
    var category_name = $('#id_category').val();
//    console.log('loadData /'+realm+'/tradeAtCity_'+productID+'.json, caller is '+ arguments.callee.caller.toString());

    updateUrl();

    $.getJSON('./'+realm+'/tradeAtCity_'+productID+'.json', function (data) {
        var output = '';
        var nvPredIdx = 1;

        $.each(data, function (key, val) {
            var suitable = true;

            //if (suitable && val.pi == $('#id_product').val()) {suitable = true;} else {suitable = false;}
            if(id_town == null || id_town == ''){
                if(id_region == null || id_region == ''){
                    if (suitable && val.ci == nvl(id_country,val.ci)) {suitable = true;} else {suitable = false;}
                } else {
                    if (suitable && val.ri == id_region) {suitable = true;} else {suitable = false;}
                }
            } else {
                if (suitable && val.ti == id_town) {suitable = true;} else {suitable = false;}
            }

            if (suitable && val.wi >= wealthIndexFrom) {suitable = true;} else {suitable = false;}
            if (suitable && val.wi <= wealthIndexTo) {suitable = true;} else {suitable = false;}

            if (suitable && val.v >= volumeFrom) {suitable = true;} else {suitable = false;}
            if (suitable && val.v <= volumeTo) {suitable = true;} else {suitable = false;}

            if (suitable && val.lpe >= localPercentFrom) {suitable = true;} else {suitable = false;}
            if (suitable && val.lpe <= localPercentTo) {suitable = true;} else {suitable = false;}

            if (suitable && val.lpr >= localPriceFrom) {suitable = true;} else {suitable = false;}
            if (suitable && val.lpr <= localPriceTo) {suitable = true;} else {suitable = false;}

            if (suitable && val.lq >= localQualityFrom) {suitable = true;} else {suitable = false;}
            if (suitable && val.lq <= localQualityTo) {suitable = true;} else {suitable = false;}

            if (suitable && val.spr >= shopPriceFrom) {suitable = true;} else {suitable = false;}
            if (suitable && val.spr <= shopPriceTo) {suitable = true;} else {suitable = false;}

            if (suitable && val.sq >= shopQualityFrom) {suitable = true;} else {suitable = false;}
            if (suitable && val.sq <= shopQualityTo) {suitable = true;} else {suitable = false;}

            if (suitable && val.sb >= shopBrandFrom) {suitable = true;} else {suitable = false;}
            if (suitable && val.sb <= shopBrandTo) {suitable = true;} else {suitable = false;}

            if(suitable){
                output += '<tr class="trec hoverable">';
                output += '<td id="td_city" city_id="'+val.ti+'" title="'+sagCountryCaption[val.ci]+' - '+sagRegionCaption[val.ri]+'" data-value="'+ sagTownCaption[val.ti] +'">';
                output += '<a target="_blank" href="https://'+domain+'/'+realm+'/main/globalreport/marketing?geo='+val.ci+'/'+val.ri+'/'+val.ti+'&product_id='+val.pi+'#by-trade-at-cities">'+sagTownCaption[val.ti]+'</a>';
                if(oagTowns[val.ti] != null && oagTowns[val.ti]['mb'] != null && oagTowns[val.ti]['mb'].indexOf(category_name) >= 0){
                    output += '<a target="_blank" href="https://'+domain+'/'+realm+'/main/geo/city/'+val.ti+'" title="'+ mayoralBonusesLabel +'"><img src="/img/small_logo.gif" width="18"></a>';
                }
                output += '</td>';
                output += '<td '+getColStyle('graph')+' align="right" id="td_graph"><a href="#" onclick="view_graph('+val.pi+','+val.ti+'); return false;"><img src="/img/graph.png" width="18"></a></td>';
                output += '<td '+getColStyle('w_idx')+' align="center" id="td_w_idx" data-value="'+ parseFloat(val.wi).toFixed(2) +'">'+parseFloat(val.wi).toFixed(2)+'</td>';
                output += '<td field_name="mi" '+getColStyle('idx')+' align="center" id="td_idx" data-value="'+ val.mi +'">'+val.mi+'</td>';
                output += '<td field_name="v" '+getColStyle('volume')+' align="right" id="td_volume" data-value="'+ val.v +'">'+ commaSeparateNumber(val.v)+'</td>';
                output += '<td '+getColStyle('dem')+' align="right" id="td_dem" data-value="'+ unknownIfNull(locale, nvl(oagTowns[val.ti], [])['d']) +'">'+ commaSeparateNumber(unknownIfNull(locale, nvl(oagTowns[val.ti], [])['d']))+'</td>';
                output += '<td '+getColStyle('pop')+' align="right" id="td_pop" data-value="'+ unknownIfNull(locale, nvl(oagTowns[val.ti], [])['p']) +'">'+ commaSeparateNumber(unknownIfNull(locale, nvl(oagTowns[val.ti], [])['p']))+'</td>';
                output += '<td field_name="lpe" '+getColStyle('local_perc')+' align="right" id="td_local_perc" style="color:black" data-value="'+ parseFloat(val.lpe).toFixed(2) +'">'+parseFloat(val.lpe).toFixed(2)+'</td>';
                output += '<td field_name="lpr" '+getColStyle('local_price')+' align="right" id="td_local_price" data-value="'+ parseFloat(val.lpr).toFixed(2) +'">'+ commaSeparateNumber(parseFloat(val.lpr).toFixed(2))+'</td>';
                output += '<td field_name="lq" '+getColStyle('local_quality')+' align="right" id="td_local_quality" data-value="'+ parseFloat(val.lq).toFixed(2) +'">'+parseFloat(val.lq).toFixed(2)+'</td>';
                output += '<td field_name="lmvs" '+getColStyle('lmvs')+' align="right" id="td_lmvs" data-value="'+ unknownIfNull(locale, val['lmvs']) +'">'+ commaSeparateNumber(unknownIfNull(locale, val['lmvs']))+'</td>';
                output += '<td '+getColStyle('lmvst')+' align="right" id="td_lmvst" data-value="'+ unknownIfNull(locale, val['lmvst']) +'">'+ commaSeparateNumber(unknownIfNull(locale, val['lmvst']))+'</td>';
                output += '<td field_name="spr" '+getColStyle('shop_price')+' align="right" id="td_shop_price" data-value="'+ parseFloat(val.spr).toFixed(2) +'">'+ commaSeparateNumber(parseFloat(val.spr).toFixed(2))+'</td>';
                output += '<td field_name="sq" '+getColStyle('shop_quality')+' align="right" id="td_shop_quality" data-value="'+ parseFloat(val.sq).toFixed(2) +'">'+parseFloat(val.sq).toFixed(2)+'</td>';
                output += '<td field_name="sb" '+getColStyle('shop_brand')+' align="right" id="td_shop_brand" data-value="'+ parseFloat(val.sb).toFixed(2) +'">'+parseFloat(val.sb).toFixed(2)+'</td>';
                output += '<td field_name="smvs" '+getColStyle('smvs')+' align="right" id="td_smvs" data-value="'+ unknownIfNull(locale, val['smvs']) +'">'+ commaSeparateNumber(unknownIfNull(locale, val['smvs']))+'</td>';
                output += '<td '+getColStyle('smvst')+' align="right" id="td_smvst" data-value="'+ unknownIfNull(locale, val['smvst']) +'">'+ commaSeparateNumber(unknownIfNull(locale, val['smvst']))+'</td>';
                output += '<td field_name="pmvs" '+getColStyle('pmvs')+' align="right" id="td_pmvs" data-value="'+ unknownIfNull(locale, val['pmvs']) +'">'+ commaSeparateNumber(unknownIfNull(locale, val['pmvs']))+'</td>';
                output += '<td '+getColStyle('pmvst')+' align="right" id="td_pmvst" data-value="'+ unknownIfNull(locale, val['pmvst']) +'">'+ commaSeparateNumber(unknownIfNull(locale, val['pmvst']))+'</td>';
                output += '<td field_name="sc" '+getColStyle('sc')+' align="right" id="td_sc" data-value="'+ val.sc +'">'+val.sc+'</td>';
                output += '<td field_name="cc" '+getColStyle('cc')+' align="right" id="td_cc" data-value="'+ val.cc +'">'+val.cc+'</td>';
                output += '<td '+getColStyle('itr')+' align="right" id="td_itr" data-value="'+ unknownIfNull(locale, val['itr']) +'">'+unknownIfNull(locale, val['itr'])+'</td>';
                output += '<td field_name="itp" '+getColStyle('itp')+' align="right" id="td_itp" data-value="'+ unknownIfNull(locale, val['itp']) +'">'+unknownIfNull(locale, val['itp'])+'</td>';
                output += '<td '+getColStyle('pred')+' align="center" id="toggle_prediction_'+nvPredIdx+'"><a href="#" onclick="togglePrediction(\''+nvPredIdx+'\'); return false;">'+showLabel+'</td>';
                output += '</tr>';
    
                nvPredIdx = nvPredIdx + 1;
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
            setVal('sort_col_id_btac', $('#sort_col_id').val());
            setVal('sort_dir_btac', $('#sort_dir').val());

            addHoverHandlers();
        }
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

    $.getJSON('./'+realm+'/product_categories'+suffix+'.json', function (data) {
        var output = '';

        $.each(data, function (key, val) {
            output += '<option value="'+val.c+'">'+val.c+'</option>';
        });

        $('#id_category').html(output); 	// replace all existing content
        $('#products').html('');
        if(typeof(callback) === 'function') {
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
    var suffix = (locale == 'en') ? '_en' : '';

    $.getJSON('./'+realm+'/products'+suffix+'.json', function (data) {
        var output = '';
        var selected = $('#id_product').attr('value');

        $.each(data, function (key, val) {
            if(svCategoryId == val.pc){
                output += '<td valign="top"><table cellpadding="0" cellspacing="0"><tr><td><img src="'+ val.s+'"';
                if(selected != null && selected == val.i){
                    output += ' border="1"';
                }
                output += ' width="24" height="24" id="img'+val.i+'" title="'+val.c+'" style="cursor:pointer" onclick="changeProduct('+val.i+')">';
                output += '</td></tr><tr class="trec"><td img_sub_product_id="'+val.i+'" town_id="" align="center"></td></tr></table></td>';
            }
        });
        output += '<td valign="top"><table cellpadding="0" cellspacing="0"><tr><td>&nbsp;</td></tr>';
        output += '<tr class="trec"><td id="img_sub_town_caption" align="left"></td></tr></table></td>';
        $('#products').html('<table cellpadding="1" cellspacing="1"><tr>' + output + '</tr></table>');
        addImgSubProdHoverHandlers();
        if(typeof(callback) === 'function') callback();
    });
    return false;
}
function loadCountries(callback) {
    var realm = getRealm();
    if (realm == null || realm == '') return;
    var suffix = (getLocale() == 'en') ? '_en' : '';
    if(sagCountryCaption === null) {
        sagCountryCaption = [];
    }
    if(sagRegionCaption === null) {
        sagRegionCaption = [];
    }

    $.getJSON('./'+realm+'/regions'+suffix+'.json', function (data) {
        $.each(data, function (key, val) {
            sagRegionCaption[val.i] = val.c;
        });
    });
    $.getJSON('./'+realm+'/countries'+suffix+'.json', function (data) {
        var allCountries = (getLocale() == 'en') ? 'All countries' : 'Все страны';
        var allRegions = (getLocale() == 'en') ? 'All regions' : 'Все регионы';
        var output = '<option value="" selected="">'+allCountries+'</option>';

        $.each(data, function (key, val) {
            output += '<option value="'+val.i+'">'+val.c+'</option>';
            sagCountryCaption[val.i] = val.c;
        });

        $('#id_country').html(output).trigger("chosen:updated"); 	// replace all existing content
        $('#id_region').html('<option value="" selected="">'+allRegions+'</option>').trigger("chosen:updated"); 	// replace all existing content
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

    $.getJSON('/by_trade_at_cities/'+realm+'/cities'+suffix+'.json', function (data) {
        var output = '<option value="" selected="">'+allTowns+'</option>';

        $.each(data, function (key, val) {
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
    loadProductCategories(productCategoriesCallback);
    loadCountries(countryCallback);
    setVal('realm', getRealm());
    fillUpdateDate();
    updateProdRemainLinks();
}
function changeCategory(callback) {
    loadProducts(callback);
    setVal('id_category', $('#id_category').val());
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
    var id_region = $('#id_region').val();
    setVal('id_region', id_region);
}
function changeTown() {
    loadData();
    setVal('id_town', $('#id_town').val());
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

    $.getJSON('./'+realm+'/products'+suffix+'.json', function (data) {
        $.each(data, function (key, val) {
            if(productId === val.i){
                $('select#id_category').val(val.pc);
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
// function getSearchParameters() {
// 	var prmstr = window.location.search.substr(1);
// 	return prmstr != null && prmstr != "" ? transformToAssocArray(prmstr) : {};
// }
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
    if (colID === 'pred'){
        $('th#th_pred, td[id^=toggle_prediction_]', 'tr').show();
    } else {
        $('th#th_'+ colID +', td#td_' + colID, 'tr').show();
    }
    sagInvisibibleColumns = jQuery.grep(sagInvisibibleColumns, function(value) {
        return value != colID;
    });
}
function hideCol(colID){
    if (colID === 'pred'){
        $('th#th_pred, td[id^=toggle_prediction_]', 'tr').hide();
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
    setVal('invisibible_columns_btac', sagInvisibibleColumns);
}
function hideAllCol(){
    $('select#show_hide_col_ru > option').each(function() {
        var value = $(this).attr('value');
        hideCol(value);
    });
    setVal('invisibible_columns_btac', sagInvisibibleColumns);
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
            setVal('invisibible_columns_btac', sagInvisibibleColumns.filter(onlyUnique));
        },
        checkAll: function(){
            showAllCol();
        },
        uncheckAll: function(){
            hideAllCol();
        }
    });

    sagInvisibibleColumns = getVal('invisibible_columns_btac');
    if (sagInvisibibleColumns == null) {
        sagInvisibibleColumns = ['smvs','smvst','lmvs','lmvst','itp','itr','dem','pop'];
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
        hideAllPredictions();

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
            setVal('sort_col_id_btac', $('#sort_col_id').val());
            setVal('sort_dir_btac', $('#sort_dir').val());
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
