
function getRealm(){
    return $('#realm').val();
}
function getCategoryID(){
    return $('#id_category').val();
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
        document.title = "Retail guide";
        $('#btnSubmit').val('Generate');
        $('#locale_flag').attr('src','/img/us.gif');
    } else {
        document.title = "Розничный гид";
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
let oagProducts = null;
function loadDataAfter(data) {
    const realm = getRealm();
    if (realm == null || realm === '') return;
    const locale = getLocale();
    const domain = getDomain(locale);
    const categoryID = getCategoryID();
    if (categoryID == null || categoryID === '') return;
    updateUrl();

    const id_country = $('#id_country').val();
    const id_region = $('#id_region').val();
    const id_town = $('#id_town').val();

    const hintQuantity = ((locale === 'en') ? 'Quantity' : 'Количество');
    const hintQuality = ((locale === 'en') ? 'Quality' : 'Качество');
    const hintPurchasePrice = ((locale === 'en') ? 'Purchase price' : 'Закупочная цена');
    const hintSumPurchasePrice = ((locale === 'en') ? 'Purchase sum' : 'Сумма закупки');
    const hintSellingPrice = ((locale === 'en') ? 'Selling price' : 'Цена продажи');
    const hintSumSellingPrice = ((locale === 'en') ? 'Selling sum' : 'Сумма продажи');
    const hintProfit = ((locale === 'en') ? 'Profit' : 'Прибыль');
    const hintTotal = ((locale === 'en') ? 'Total' : 'Итого');

    let output_th = '';
    let output = '';
    const oavCategoryProducts = oagProducts.filter(function(o){ return o.pci === categoryID; });

    output_th += '<th id="th_city">' + ((locale === 'en') ? 'City' : 'Город') + '&nbsp;<b id="sort_by_city"></b></th>';
    output_th += '<th id="th_profit">' + ((locale === 'en') ? 'Profit' : 'Прибыль') + '&nbsp;<b id="sort_by_profit"></b></th>';
    $.each(oavCategoryProducts, function (cpKey, cpVal) {
        output_th += '<th id="th_product_'+ cpVal.sym +'"><a target="_blank" href="https://'+domain+'/'+realm+'/main/globalreport/marketing?product_id='+ cpVal.i +'#by-offers"><img src="'+ oagProducts[cpVal.i].s +'" width="16" height="16"></a></th>';
    });

    $.each(data, function (key, val) {
        let suitable = true;

        if(id_town == null || id_town === ''){
            if(id_region == null || id_region === ''){
                suitable = suitable && val.ci === nvl(id_country, val.ci);
            } else {
                suitable = suitable && val.ri === id_region;
            }
        } else {
            suitable = suitable && val.ti === id_town;
        }

        if(suitable && val.tgp != null && val.tgp.length > 0){
            output += '<tr class="trec hoverable">';
            output += '<td id="td_city" city_id="'+val.ti+'" title="'+sagCountryCaption[val.ci]+' - '+sagRegionCaption[val.ri]+'" data-value="'+ sagTownCaption[val.ti] +'">';
            output += '<a target="_blank" href="https://'+domain+'/'+realm+'/main/globalreport/marketing?geo='+val.ci+'/'+val.ri+'/'+val.ti+'&product_id='+val.tgp[0].pi+'#by-trade-at-cities">'+sagTownCaption[val.ti]+'</a>';
            output += '</td>';
            let profit = 0;
            let products = '';
            $.each(oavCategoryProducts, function (cpKey, cpVal) {
                const tgpVal = val.tgp.filter(function(o) { return o.pi === cpVal.i;})[0];
                if(tgpVal != null && parseFloat(tgpVal.iat) > 0) {
                    profit += parseFloat(tgpVal.iat);
                    products += '<td id="td_product_'+ cpVal.sym +'" align="right">';
                    products += '<table border="0" width="100%" cellspacing="1" cellpadding="1">';
                    const svProdLink = '<a target="_blank" href="/industry/#id_product='+ cpVal.i +'&realm='+ realm +'&quality_from=' + parseFloat(tgpVal.q).toFixed(2) + '">'+ tgpVal.q +'</a>';
                    products += '<tr class="trec2"><td align="right" data-value="'+ parseFloat(tgpVal.v).toFixed(2) +'" title="'+hintQuantity+'" id="td_product_'+ cpVal.sym +'_v">' + commaSeparateNumber(tgpVal.v) + '</td></tr>';
                    products += '<tr class="trec2"><td align="right" data-value="'+ parseFloat(tgpVal.q).toFixed(2) +'" title="'+hintQuality+'" id="td_product_'+ cpVal.sym +'_q">' + svProdLink + '</td></tr>';
                    products += '<tr class="trec2"><td align="right" data-value="'+ parseFloat(tgpVal.bp).toFixed(2) +'" title="'+hintPurchasePrice+'" id="td_product_'+ cpVal.sym +'_bp">$' + commaSeparateNumber(parseFloat(tgpVal.bp).toFixed(2)) + '</td></tr>';
                    products += '<tr class="trec2"><td align="right" data-value="'+ parseFloat(tgpVal.sp).toFixed(2) +'" title="'+hintSellingPrice+'" id="td_product_'+ cpVal.sym +'_sp">$' + commaSeparateNumber(parseFloat(tgpVal.sp).toFixed(2)) + '</td></tr>';
                    products += '<tr class="trec2"><td align="right" data-value="'+ parseFloat(tgpVal.iat).toFixed(2) +'" title="'+hintProfit+': '+ commaSeparateNumber(parseFloat(tgpVal.iat).toFixed(2))+'" id="td_product_'+ cpVal.sym +'_iat">$' +shortenNumber(tgpVal.iat) + '</td></tr>';
                    products += '</table>';
                    products += '</td>';
                } else {
                    products += '<td id="td_product_'+ cpVal.sym +'" align="right">';
                    products += '<table border="0" width="100%" cellspacing="1" cellpadding="1">';
                    products += '<tr class="trec2"><td align="right" data-value="0" title="'+hintQuantity+'" id="td_product_'+ cpVal.sym +'_v">0</td></tr>';
                    products += '<tr class="trec2"><td align="right" data-value="0" title="'+hintQuality+'" id="td_product_'+ cpVal.sym +'_q">0</td></tr>';
                    products += '<tr class="trec2"><td align="right" data-value="0" title="'+hintPurchasePrice+'" id="td_product_'+ cpVal.sym +'_bp">$0</td></tr>';
                    products += '<tr class="trec2"><td align="right" data-value="0" title="'+hintSellingPrice+'" id="td_product_'+ cpVal.sym +'_sp">$0</td></tr>';
                    products += '<tr class="trec2"><td align="right" data-value="0" title="'+hintProfit+'" id="td_product_'+ cpVal.sym +'_iat">$0</td></tr>';
                    products += '</table>';
                    products += '</td>';
                }
            });
            output += '<td align="right" id="td_profit" data-value="'+ profit.toFixed(2) +'">'+ commaSeparateNumber(profit.toFixed(2)) +'</td>';
            output += products;
            output += '</tr>';
        }
    });
    function sumArray(arr){
        let sum = 0;
        for (let i = 0; i < arr.length; ++i) sum += arr[i];
        return sum;
    }
    if(output !== '') {
        output += '<tr class="trec hoverable">';
        output += '<td><b>' + hintTotal + '</b></td>';
        let products = '';
        $.each(oavCategoryProducts, function (cpKey, cpVal) {
            products += '<td id="td_product_' + cpVal.sym + '" align="right">';
            products += '<table border="0" width="100%" cellspacing="1" cellpadding="1">';
            products += '<tr class="trec2"><td align="right"><a target="_blank" href="https://'+domain+'/'+realm+'/main/globalreport/marketing?product_id='+ cpVal.i +'#by-offers"><img src="'+ oagProducts[cpVal.i].s +'" width="16" height="16"></a></td></tr>';
            products += '<tr class="trec2"><td align="right" id="td_product_total_' + cpVal.sym + '_v">0</td></tr>';
            products += '<tr class="trec2"><td align="right" id="td_product_total_' + cpVal.sym + '_q">0</td></tr>';
            products += '<tr class="trec2"><td align="right" id="td_product_total_' + cpVal.sym + '_bp">$0</td></tr>';
            products += '<tr class="trec2"><td align="right" id="td_product_total_' + cpVal.sym + '_sp">$0</td></tr>';
            products += '<tr class="trec2"><td align="right" id="td_product_total_' + cpVal.sym + '_iat">$0</td></tr>';
            products += '</table>';
            products += '</td>';
        });
        output += '<td align="right" id="td_profit_total" data-value="0">0</td>';
        output += products;
        output += '</tr>';
    }

    $('#xtablethead').html('<tr class="theader">' + output_th + '</tr>');
    $('#xtabletbody').html(output);

    if(output !== '') {
        $.each(oavCategoryProducts, function (cpKey, cpVal) {
            const navQ = $('td[id="td_product_' + cpVal.sym + '_q"]').map((k,v) => parseFloat(v.getAttribute('data-value'))).filter((k, v) => v > 0);
            let nvMinQ = 0;
            let nvMaxQ = 0;
            if (navQ.length > 0) {
                nvMinQ = Math.min.apply(null, navQ);
                nvMaxQ = Math.max.apply(null, navQ);
            }
            let svMinMaxQ = nvMinQ + ' - ' + nvMaxQ;
            if (nvMinQ === 0 || nvMinQ === nvMaxQ){
                svMinMaxQ = nvMaxQ;
            }
            const nvSumV = sumArray($('td[id="td_product_' + cpVal.sym + '_v"]').map((k,v) => parseFloat(v.getAttribute('data-value'))));
            const nvSumBp = sumArray($('td[id="td_product_' + cpVal.sym + '_bp"]').map((k,v) => parseFloat(v.getAttribute('data-value'))));
            const nvSumSp = sumArray($('td[id="td_product_' + cpVal.sym + '_sp"]').map((k,v) => parseFloat(v.getAttribute('data-value'))));
            const nvSumIat = sumArray($('td[id="td_product_' + cpVal.sym + '_iat"]').map((k,v) => parseFloat(v.getAttribute('data-value'))));

            $('#td_product_total_' + cpVal.sym + '_v').attr('title', hintQuantity + ': ' + commaSeparateNumber(nvSumV)).text(shortenNumber(nvSumV));
            $('#td_product_total_' + cpVal.sym + '_q').attr('title', hintQuality).text(svMinMaxQ);
            $('#td_product_total_' + cpVal.sym + '_bp').attr('title', hintSumPurchasePrice + ': ' + commaSeparateNumber(nvSumBp.toFixed(2))).text(shortenNumber(nvSumBp));
            $('#td_product_total_' + cpVal.sym + '_sp').attr('title', hintSumSellingPrice + ': ' + commaSeparateNumber(nvSumSp.toFixed(2))).text(shortenNumber(nvSumSp));
            $('#td_product_total_' + cpVal.sym + '_iat').attr('title', hintProfit + ': ' + commaSeparateNumber(nvSumIat.toFixed(2))).text(shortenNumber(nvSumIat));
        });
        const nvSumProfit = sumArray($('td[id="td_profit"]').map((k,v) => parseFloat(v.getAttribute('data-value'))));
        $('#td_profit_total').attr('title', hintTotal + ': ' + commaSeparateNumber(nvSumProfit.toFixed(2))).text(shortenNumber(nvSumProfit));
    }

    if(output !== ''){
        const svOrder = $('#sort_dir').val();
        const svColId = $('#sort_col_id').val();
        const isAscending = svOrder==='asc';
        const orderArrow = isAscending?'&#9650;':'&#9660;';
        $('#sort_by_'+svColId).html(orderArrow);

        const table = document.getElementById('xtable');
        const tableBody = table.querySelector('#xtabletbody');
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
        setVal('sort_col_id_btg', svColId);
        setVal('sort_dir_btg', svOrder);

    }
    return false;
}
function loadData() {
    const realm = getRealm();
    const categoryID = getCategoryID();
    if (categoryID == null || categoryID === '') return;
    if (sagTownCaption === null || oagTowns === null) {
        fillTownCaptions(loadData);
        return false;
    }
    if (oagProducts === null) {
        loadProducts(loadData);
        return false;
    }

    console.log('./'+realm+'/by_product_category_id/'+categoryID+'.json.zip');

    zip.workerScriptsPath = '/js/';
    zip.createReader(new zip.HttpReader('./'+realm+'/by_product_category_id/'+categoryID+'.json.zip'), function(reader) {
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
                    loadDataAfter(data);
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
    const separator = sep || ',';
    while (/(\d+)(\d{3})/.test(val.toString())){
        val = val.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1"+separator);
    }
    return val;
}
function loadSavedFlt(urlParams){
    let realm      = getVal('realm') || 'olga';
    let id_country = getVal('id_country');
    let id_region  = getVal('id_region');
    let id_town    = getVal('id_town');
    let id_category  = null;
    let id_product   = null;
    try {
        id_product = getVal('id_product');
    } catch (err) {
        id_product = null;
        id_category  = getVal('id_category');
        console.error(err);
    }

    if (Object.keys(urlParams).length > 1 && urlParams['realm'] !== '' && urlParams['id_category'] !== '') {
        realm       = urlParams['realm'];
        id_country  = urlParams['id_country'];
        id_region   = urlParams['id_region'];
        id_town     = urlParams['id_town'];
        id_category  = urlParams['id_category'];
        fillFormFromUrl(urlParams);
    }

    const sort_col_id = urlParams['sort_col_id'] || getVal('sort_col_id_btg') || 'local_perc';
    if (sort_col_id != null || sort_col_id !== '') {
        $('#sort_col_id').val(sort_col_id);
    }
    const sort_dir = urlParams['sort_dir'] || getVal('sort_dir_btg') || 'desc';
    if (sort_dir != null || sort_dir !== '') {
        $('#sort_dir').val(sort_dir);
    }
    if ((getVal('locale') === null || getVal('locale') === '') && (document.referrer.substring(0, 'https://virtonomics.com/'.length) === 'https://virtonomics.com/' || document.referrer.substring(0, 'https://virtonomics-free.blogspot.'.length) === 'https://virtonomics-free.blogspot.')) {
        setVal('locale', 'en');
    }

    if (realm != null || realm !== '') {
        $('#realm').val(realm);
        const productCategoriesCallback = function() {
            if (id_category != null && id_category !== '') {
                //console.log("$('#id_category').childNodes.length = " + document.getElementById('id_category').childNodes.length);
                $('#id_category').val(id_category);
                id_category = $('#id_category').val();
                if (id_category == null || id_category === '') {
                    id_category = $('#id_category > option').eq(0).val();
                    $('#id_category').val(id_category);
                }
                loadData();
            } else {
                selectCategoryByProduct(id_product);
            }
        };
        const changeRegionCallback = function() {
            $('#id_town').val(id_town).trigger("chosen:updated");
            changeTown();
        };
        const changeCountryCallback = function() {
            $('#id_region').val(id_region).trigger("chosen:updated");
            //console.log("$('#id_region').childNodes.length = " + document.getElementById('id_region').childNodes.length);
            changeRegion(changeRegionCallback);
        };
        const countryCallback = function() {
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
    const realm = getRealm();
    if (realm == null || realm == '') return;
    const locale = getLocale();
    const suffix = (locale === 'en') ? '_en' : '';
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
function isColVisible(spColID){
    return $.inArray(spColID, sagInvisibibleColumns) < 0;
}

function getLast(str){
    var matches = str.match(/\/(\d+)$/);
    return matches[1];
}

function shortenNumber(text){
    if (text.toString().length > 3) {
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
        $.getJSON('/by_trade_at_cities/'+realm+'/tradeAtCity_'+productID+'.json', function (data) {
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
}
function updateUrl() {
    var categoryID = getCategoryID();
    var realm = getRealm();
    var svColId = $('#sort_col_id').val();
    var svOrder = $('#sort_dir').val();
    var id_country = $('#id_country').val();
    var id_region = $('#id_region').val();
    var id_town = $('#id_town').val();
    window.history.pushState("", ""
        , '#id_category='  + categoryID
        + '&realm='       + realm
        + '&id_country='  + id_country
        + '&id_region='   + id_region
        + '&id_town='     + id_town
        + '&sort_col_id=' + svColId
        + '&sort_dir='    + svOrder
    );
}
//////////////////////////////////////////////////////
function unknownIfNull(locale, opValue) {
    if (opValue == null || opValue === '' || isNaN(opValue)){
        return (locale === 'en') ? 'unknown' : 'не изв.';
    } else {
        return opValue;
    }
}
function loadProductCategories(callback) {
    const realm = getRealm();
    if (realm == null || realm === '') return;
    const suffix = (getLocale() === 'en') ? '_en' : '';

    $.getJSON('/by_trade_at_cities/'+realm+'/product_categories'+suffix+'.json', function (data) {
        let output = '';

        $.each(data, function (key, val) {
            output += '<option value="'+val.i+'">'+val.c+'</option>';
        });

        $('#id_category').html(output); 	// replace all existing content
        if(typeof(callback) === 'function') {
            callback();
        } else {
            loadData();
        }
    });
    return false;
}
function loadCountries(callback) {
    const realm = getRealm();
    if (realm == null || realm === '') return;
    const locale = getLocale();
    const suffix = (locale === 'en') ? '_en' : '';
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
        const allCountries = (locale === 'en') ? 'All countries' : 'Все страны';
        const allRegions = (locale === 'en') ? 'All regions' : 'Все регионы';
        let output = '<option value="" selected="">'+allCountries+'</option>';

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
    oagProducts = null;
    fillTownCaptions();
    if (typeof(productCategoriesCallback) !== 'function') {
        let id_category  = getVal('id_category');
        if (id_category != null && id_category !== '') {
            productCategoriesCallback = function () {
                $('#id_category').val(id_category);
                id_category = $('#id_category').val();
                if (id_category == null || id_category === '') {
                    id_category = $('#id_category > option').eq(0).val();
                    $('#id_category').val(id_category);
                }
                loadData();
            };
        }
    }
    loadProductCategories(productCategoriesCallback);
    loadCountries(countryCallback);
    setVal('realm', getRealm());
    fillUpdateDate();
}
function changeCategory(callback) {
    setVal('id_category', $('#id_category').val());
    loadData();
}
function loadProducts(callback) {
    const realm = getRealm();
    if (realm == null || realm === '') return;

    const locale = getLocale();
    const suffix = (locale === 'en') ? '_en' : '';

    oagProducts = [];

    $.getJSON('/by_trade_at_cities/'+realm+'/products'+suffix+'.json', function (data) {
        $.each(data, function (key, val) {
            oagProducts[val.i] = val;
        });
        if(typeof(callback) === 'function') callback();
    });
    return false;
}
function changeCountry(callback) {
//    console.log('changeCountry, caller is '+ arguments.callee.caller.toString());
    $('#id_region').html(''); 	// replace all existing content
//	console.log('changeCountry, typeof(callback) =  '+ typeof(callback));
    if (typeof(callback) !== 'function'){
        callback = function() {
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
function selectCategoryByProduct(productId, callback) {
    if (productId == null || productId == '') return;
    var realm = getRealm();
    if (realm == null || realm == '') return;
    var suffix = (getLocale() == 'en') ? '_en' : '';

    $.getJSON('/by_trade_at_cities/'+realm+'/products'+suffix+'.json', function (data) {
        $.each(data, function (key, val) {
            if(productId === val.i){
                $('select#id_category').val(val.pci);
            }
        });
        loadData();
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
    setVal('invisibible_columns_btg', sagInvisibibleColumns);
}
function hideAllCol(){
    $('select#show_hide_col_ru > option').each(function() {
        var value = $(this).attr('value');
        hideCol(value);
    });
    setVal('invisibible_columns_btg', sagInvisibibleColumns);
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
            setVal('invisibible_columns_btg', sagInvisibibleColumns.filter(onlyUnique));
        },
        checkAll: function(){
            showAllCol();
        },
        uncheckAll: function(){
            hideAllCol();
        }
    });

    sagInvisibibleColumns = getVal('invisibible_columns_btg');
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
    //initShowHideColSelect();

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
        if (tableHeaderId === 'city' || tableHeaderId === 'profit') {
            //console.log(tableHeaderId);
            var ascDesc = tableHeader.getAttribute('data-order');
            isAscending = ascDesc=='asc';
            order = isAscending?'desc':'asc';
            tableHeader.setAttribute('data-order',order);
            $('#sort_by_'+$('#sort_col_id').val()).html('');
            $('#sort_col_id').val(tableHeaderId);
            $('#sort_dir').val(order);
            setVal('sort_col_id_btg', $('#sort_col_id').val());
            setVal('sort_dir_btg', $('#sort_dir').val());
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
            updateUrl();
        }
    });
    loadSavedFlt(urlParams);

    if (getLocale() !== 'ru') {
        $('#locale').val(getLocale());
        applyLocale();
    }
});
