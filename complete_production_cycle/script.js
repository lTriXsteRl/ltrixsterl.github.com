
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
function getLocale() {
    return getVal('locale') || $('#locale').val() || 'ru';
}
function applyLocale() {
    var locale = getLocale();

    if (locale === 'en') {
        document.title = "Complete production cycle";
        $('#locale_flag').attr('src','/img/us.gif');
    } else {
        document.title = "Полный цикл производства";
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

    if (Object.keys(urlParams).length > 1 && urlParams['realm'] != '' && (urlParams['id_product'] != '' || urlParams['id_category'] != '')) {
        realm       = urlParams['realm'];
        id_product  = urlParams['id_product'];
        id_category = urlParams['id_category'];
        fillFormFromUrl(urlParams);
    }

    var sort_col_id = urlParams['sort_col_id'] || getVal('sort_col_id_paa') || 'tech';
    if (sort_col_id != null || sort_col_id != '') {
        $('#sort_col_id').val(sort_col_id);
    }
    var sort_dir = urlParams['sort_dir'] || getVal('sort_dir_paa') || 'asc';
    if (sort_dir != null || sort_dir != '') {
        $('#sort_dir').val(sort_dir);
    }

    $('#tech_from').val(getVal('tech_from') || 10);
    $('#tech_to').val(getVal('tech_to') || 10);

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

//максимальное кол-во работающих с заданной квалификацией на предприятиии для заданной квалификации игрока (топ-1)
function calcMaxTop1(playerQuality, workersQuality) {
  var workshopLoads = 50.0;
  return Math.floor(workshopLoads * 14.0 * playerQuality * playerQuality / Math.pow(1.4, workersQuality) / 5.0);
}

//квалификация игрока необходимая для данного уровня технологии
function calcPlayerQualityForTech(techLvl) {
  return Math.pow(2.72, Math.log(techLvl) / (1.0 / 3.0)) * 0.0064;
}

//квалификация рабочих необходимая для данного уровня технологии
function calcWorkersQualityForTech(techLvl) {
  return Math.pow(techLvl, 0.8);
}
var sagMaterialImg = null;
var productOfSelectedCategory = [];
//////////////////////////////////////////////////////

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
    var tech_to = $('#tech_to').val();
    var svColId = $('#sort_col_id').val();
    var svOrder = $('#sort_dir').val();
    var id_category = $('#id_category').val();

    window.history.pushState("", ""
        , '#id_product='  + productID
        + '&id_category=' + id_category
        + '&realm='       + realm
        + '&tech_to='     + strToNum(tech_to)
        + '&sort_col_id=' + svColId
        + '&sort_dir='    + svOrder
    );
}
function changeRecipeSpec(productID, recipeSpec){
    var realm = getRealm();

    var suffix = (getLocale() === 'en') ? '_en' : '';
    var svCellHtml = '';
    var imgSrc = '';

    $.getJSON('/industry/'+realm+'/recipe_'+productID+suffix+'.json', function (data) {
        $.each(data, function (key, val) {
            if(val.s === recipeSpec){
                val.ip.forEach(function(ingredient) {
                    imgSrc = sagMaterialImg[ingredient.pi].replace('/img/products/','/img/products/16/');
                    svCellHtml += '<tr><td align="center"><img src="'+imgSrc+'"></td></tr>';
                });
            }
        });
        $('td[productID="'+ productID +'"][recipeSpec="'+ recipeSpec +'"]').html('<table border="0" cellspacing="0" cellpadding="2">' + svCellHtml + '</table>');
    });
}
function changeRecipeSpecByEditor(editor){
    var select = $(editor);
    var productID = $('> option:selected', select).attr('productID');
    var recipeSpec = $('> option:selected', select).attr('recipeSpec');
    changeRecipeSpec(productID, recipeSpec);
}
function addByRecipeSpec(productID, recipeSpec){
    var realm = getRealm();
    if (realm == null || realm == '') return;

    var suffix = (getLocale() == 'en') ? '_en' : '';
    var svCells = '';
    var recipeSpecOptions = '';

    $.getJSON('/industry/'+realm+'/recipe_'+productID+suffix+'.json', function (data) {
        $.each(data, function (key, val) {
            recipeSpecOptions += '<option productID="'+ productID +'" recipeSpec="'+ val.i +'">'+ val.s +'</option>';
            if(recipeSpec === '' || val.s === recipeSpec){
                //чтобы взять только одну специализацию
                recipeSpec = val.s;
            }
        });
        svCells = '<td><table border="0" cellspacing="0" cellpadding="2">';
        svCells += '<tr><td><select onchange="changeRecipeSpecByEditor(this);">'+ recipeSpecOptions +'</select></td></tr>';
        svCells += '<tr><td productID="'+ productID +'" recipeSpec="'+ recipeSpec +'"></td></tr>';
        svCells += '</table></td>';
        $('#xtablerow').append(svCells);
        changeRecipeSpec(productID, recipeSpec);
    });
}
function loadData() {
    if (sagMaterialImg === null) {return false;}
    $('#messages').html('');
    $('#xtablerow').html('');
    updateUrl();
    var productID = getProductID();
    if (productID == null || productID == '') return;
    addByRecipeSpec(productID, '');

    return false;
}

function loadProductCategories(callback) {
    var realm = getRealm();
    if (realm == null || realm == '') return;
    var suffix = (getLocale() == 'en') ? '_en' : '';
    var oldVal = $('#id_category').val();

    $.getJSON('/industry/'+realm+'/materials'+suffix+'.json', function (data) {
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
            if (oldVal != null && oldVal != '') {
                $('#id_category').val(oldVal);
                var newVal = $('#id_category').val();
                if (newVal == null || newVal == '') {
                    $('#id_category').html(output);
                }
            }
            loadProducts();
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
    var img_suffix = (locale === 'en') ? '_en' : '_ru';
    productOfSelectedCategory = [];
    var svAllProductsTitle = (locale === 'en') ? 'All' : 'Все';

    $.getJSON('/industry/'+realm+'/materials'+suffix+'.json', function (data) {
        var output = '';
        var selected = $('#id_product').attr('value');

        sagMaterialImg = [];
        var cnt = 0;
        $.each(data, function (key, val) {
            sagMaterialImg[val.i] = val.s;

            if(svCategoryId == val.pci){
                productOfSelectedCategory[val.i] = 1;

                if(cnt > 30){
                    cnt = 0;
                    output += '<br>';
                }
                cnt++;
                output += '&nbsp;<img src="'+ val.s +'"';
                if(selected != null && selected == val.i){
                    output += ' border="1"';
                }
                output += ' width="24" height="24" id="img'+val.i+'" title="'+val.c+'" style="cursor:pointer;" onclick="changeProduct('+val.i+')">';
            }
        });

        $('#materials').html(output);
        if(typeof(callback) === 'function'){
            callback();
        } else {
            loadData();
        }
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
    $('#id_product').val('');
    loadProducts(callback);
    setVal('id_category', $('#id_category').val());
}
function changeProduct(productId) {
    var selected = $('#id_product').val();
    if(selected != null && selected != ''){
        $('#img'+selected).attr('border','');
    } 
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

    $.getJSON('/industry/'+realm+'/updateDate.json', function (data) {
        $('#update_date').text(prefix+': ' + data.d);
    });
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
});
