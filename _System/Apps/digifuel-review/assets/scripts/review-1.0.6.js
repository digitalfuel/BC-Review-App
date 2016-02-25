// contants
var _menuFile = BCAPI.Models.FileSystem.Root.file('/_System/Apps/digifuel-review/_config/menu.json');
var _menuFileCopy = BCAPI.Models.FileSystem.Root.file('/_System/Apps/digifuel-review/_config/menuCopy.json');
var _visibleGlyphiconClass = 'glyphicon-eye-open';
var _invisibleGlyphiconClass = 'glyphicon-eye-close';
var _invisibleTitle = 'Disabled - Hidden from users';
var _visibleTitle = 'Enabled - Visible to users';
// global vars
var _refGet;
var _currentMenuItems; //menu.json menu items.
var _reviewItems;
var _currentMenuItemsArray;
var _currentReviewItemsArray;
var _currentReviewVisibleArray;
var _reviewName;
var _reviewPagination;
var _altURL;
var _reviewWebAppName;
var _reviewURL;
var _starDefault;
var _customerTitle;
var _currentWhere = {};
var _currentSkip = 0;
var _currentLimit = 10;
var _totalItemsCount = 0;
var _totalItems = 0;
var _startMonth = 0;
var _startDay = 0;
var _startYear = 0;
var _reviewListIndex = 1;
var _reviewListLength;
var _callAction;
var _rating = 1;
var _i = 0;

//review Item constants
var catCustomID = 10;
var catCustomName = 20;
var catCustomTotReviews = 200;
var catCustomAvgRating = 210;
var catCustomRealSum = 220;
var catCustomRating = 1000;
var catCustomReviewTitle = 1022;
var catCustomReviewTitleVisible;
var catCustomComments = 1020;
var catCustomEmail = 1030;
var catCustomTitle = 1042;
var catCustomTitleVisible;
var catCustomCustomerName = 1040;
var catCustomLocation = 1050;
var catCustomProdRecommend = 1060;
var catCustomProdQuality = 1070;
var catCustomProdValue = 1080;

// global vars variable /*referrer URL reviewID querystring*/
function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var referrer = document.referrer.split('?')[1] || '';
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(referrer);
    return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

if (getParameterByName('reviewID')) {
    var _reviewID = getParameterByName('reviewID');
    window.sessionStorage.setItem("reviewID", _reviewID);
    window.sessionStorage.setItem("reviewURL", document.referrer.split('?')[0]);
    var _refGet = window.sessionStorage.getItem("reviewURL");
} else {
    if (window.sessionStorage.getItem("reviewID").length === 0) {
        alert("To use this Review app incognito mode must be disabled in your browser");
        window.parent.location.href = _refGet + '?client_id=digifuel-review&reviewID=-1';
    } else {
        var _reviewID = window.sessionStorage.getItem("reviewID");
        var _refGet = window.sessionStorage.getItem("reviewURL");
    }
}

var _reviewAppIndex = BCAPI.Models.FileSystem.Root.file('/_System/Apps/digifuel-review/' + _reviewID + '.html');
var _reviewOptions = BCAPI.Models.FileSystem.Root.file('/_System/Apps/digifuel-review/_config/reviews_config/' + _reviewID + '/review_options.json');
var _reviewWebApp = BCAPI.Models.FileSystem.Root.file('/_System/Apps/digifuel-review/_config/reviews_config/' + _reviewID + '/review_webapp.json');
var _reviewOptionsPublic = BCAPI.Models.FileSystem.Root.file('/_System/Apps/digifuel-review/public/reviews_config/' + _reviewID + '/review_options.json');
//END Global vars

function postLoadReviews() {

    var allLeftNavigationItemContainerSelector = $('.nav-item-container:not(.sub-nav-items .nav-item-container)', '#left-admin-menu');
    $('.nav-item-warning-message').remove();

    $(function() {
        $("#form-system-field").sortable({
            items: "li:not(.ui-state-disabled)",
            placeholder: "ui-state-highlight"
        });
    });

    $("#form-system-field li").disableSelection();
    var _reviewWeightArray = [];

    _currentReviewItemsArray = [];
    _currentReviewRequiredArray = [];
    _currentReviewVisibleArray = [];
    _currentAppDetails = [];
    _currentAppSettings = [];
    _currentReviewAccessRights = [];
    _currentReviewSettings = [];
    $.each(_reviewItems, function(key, value) {
        _currentAppSettings = value;

        $.each(value, function(i, object) {
            if (object.weight) {
                _currentReviewItemsArray.push(object.weight);
                _currentReviewRequiredArray.push(object.required);
                _currentReviewVisibleArray.push(object.visible);
            }
            if (object.weight == catCustomComments) {
                catCustomReviewTitleVisible = object.visible;
            }
            if (object.weight == catCustomCustomerName) {
                catCustomTitleVisible = object.visible;
            }
            if (object.appDetails) {
                _currentAppDetails = object.appDetails;
                _reviewName = _currentAppDetails.reviewName;
                _reviewWebAppName = 'Review - ' + _reviewName;
                _reviewURL = _currentAppDetails.reviewURL;
            }
            if (object.accessRights) {
                _currentReviewAccessRights = object.accessRights;
            }
            if (object.reviewSettings) {
                _currentReviewSettings = object.reviewSettings;
                _starDefault = _currentReviewSettings.starDefault;
                _customerTitle = _currentReviewSettings.customerTitle;
            }

        });

        getCustomer();

    });

    $.each(_currentReviewItemsArray, function(index) {
        var id = _currentReviewItemsArray[index];
        createReview();
        var i = createReview();
        if (index === 0) {
            $('#form-system-field li').slice(1).remove();
        }
        $('#form-system-field').append(i[id]);
        var $item = $('#webform-builder #system-fields #a-' + id);
        $item.parent().addClass('used');
    });

    var listArrayAfter = $('#form-system-field li:not(:eq(0))');
    listArrayAfter.each(function(index) {
        var reviewItemRequired = _currentReviewRequiredArray[index];
        if (reviewItemRequired === true) {
            $(this).find('.req').text('*');
        } else {
            $(this).not('#sortable-1030').find('.req').text('');
        }
        var reviewVisible = _currentReviewVisibleArray[index];
        if (reviewVisible === false) {
            var invisibleButtonClass = '';
            $(this).find('.sortable-item-toggle button:eq(0)').attr('class', 'sortable-item-eye' + invisibleButtonClass);
            $(this).find('.sortable-item-toggle button:eq(0)').attr('title', _invisibleTitle);
            $(this).find('.sortable-item-toggle button span:eq(0)').attr('class', 'glyphicon ' + _invisibleGlyphiconClass);
        }
    });

    /*App Details*/
    var appReviewName = $('#reviewName');
    appReviewName.val(_reviewName);

    var appDetailsURL = $('.review-url');
    appDetailsURL.text('http://www.url.com/' + _reviewURL + ".html");

    /*App Settings*/
    if (_currentAppSettings.requiresApproval == "true") {
        $('#requiresApproval').attr('checked', true);
    };
    if (_currentAppSettings.anonymousReviews == "true") {
        $('#anonymousReviews').attr('checked', true);
    };
    $('#reviewPagination').val(_currentAppSettings.reviewPagination);
    if (_currentAppSettings.altSubmitURL == "true") {
        $('#altSubmitURL').attr('checked', true);
        $('#altSubmitURL').next('.hybridFormContainer').show();
    } else {
        $('#altSubmitURL').next('.hybridFormContainer').hide();        
    };
    $('#altURL').val(_currentAppSettings.altURL);

    /* App access Rights*/
    var accessRights = $('#access-rights-container input');
    $.each(accessRights, function(index) {
        if (_currentReviewAccessRights.indexOf($(this).val()) !== -1) {
            $(this).attr('checked', true);
            //$("#tab-edit").parent().show();
        };
    });

    /* Review Settings*/
    //Star Rating Replaces Select
    _rating = _starDefault;
    starUpdate(_rating);

    $(document).on('click', '.form-rating:not(#sortableTable.rgMasterTable .form-rating)', function() {
        _rating = $(this).text();
        starUpdate(_rating);
    });

    function starUpdate(_rating) {
        $('.form-rating').each(function() {
            var $this = $(this);
            var star = $this.text();
            if (star <= _rating) {
                $this.addClass('selected');
            } else {
                $this.removeClass('selected');
            }
        });
    }

    if (_customerTitle !== "MR" && typeof _customerTitle !== "undefined") {
        $('#Title option').filter(function() {
            return $(this).text() === "MR";
        }).removeAttr('selected');
    }

    $('#Title option').filter(function() {
        return $(this).text() === _customerTitle;
    }).attr('selected', 'selected');


    $(document).on('mouseout mouseover', '#form-system-field li', function() {
        $(this).find('.field-actions').toggle();
        var sortableItemToggle = $(this).find('.sortable-item-toggle button');
        if (sortableItemToggle.css('visibility') == 'hidden') {
            sortableItemToggle.css('visibility', 'visible');
        } else {
            sortableItemToggle.css('visibility', 'hidden');
        }
    });

    $(document).on('click', '.field-actions .edit', function() {
        if (confirm("Do you want to change the required option?")) {
            if ($(this).closest('li').find('.req').text() === '') {
                $(this).closest('li').find('.req').text(' *');
            } else {
                $(this).closest('li').find('.req').text('');
            }
        }
    });

    $(document).on('click', '.field-actions .delete', function() {
        var id = $(this).closest('li').attr('id');
        id = id.split('-');
        id = id[1];
        var $item = $('#webform-builder #system-fields #a-' + id);
        if (confirm("Are you sure you wish to delete this item[s]?")) {
            $item.parent().removeClass('used');
            $(this).closest('li').remove();
        }
    });

    var reviewTabSort = $('#webform-builder #tabs li');
    reviewTabSort.unbind('click').click(function() {
        var tabBtn = $(this).attr('id').replace('tab', '');
        tabBtn = tabBtn.toLowerCase();
        $('#system-fields #tabs li').removeClass('active');
        $(this).addClass('active');
        $('#system-fields ul').not('#tabs').removeClass('active').hide();
        $('ul#' + tabBtn).addClass('active').show();
    });

    var reviewSortableAdd = $('#webform-builder #system-fields a').not('#tabs a');
    reviewSortableAdd.unbind('click').click(function() {
        var id = $(this).attr('id');
        id = id.split('-');
        id = id[1];
        createReview();
        var i = createReview();
        if (!$(this).parent().hasClass('used')) {
            $('#form-system-field').append(i[id]);
            $(this).parent().addClass('used');
            starUpdate(_rating);
        }
    });

    if (_reviewID !== "-1") {
        reviewInsert(); //Fill the review code inputs for user to insert into html 
    }

    showPageLoadingIndicator(false);

    if ($('#sortableTable.rgMasterTable').length) {
        tablePagination();
        showPageLoadingIndicator(true, true);
    }
}

function tablePagination(totalItemsCount) {
    var reviewItems = new BCAPI.Models.WebApp.ItemCollection(_reviewWebAppName);
    reviewItems.fetch({
        skip: _currentSkip,
        limit: _currentLimit,
        where: _currentWhere,
        order: "-createDate",
        success: onReviewListFetch,
        error: function(jqXHR) {
            onAPIError(jqXHR);
        }
    });

}

function onReviewListFetch(data, totalItemsCount) {
    $('#sortableTable tr:not(:first-child)').remove();
    _totalItemsCount = totalItemsCount.totalItemsCount;
    _totalItems = totalItemsCount.items;
    _currentSkip = totalItemsCount.skip;
    _currentLimit = totalItemsCount.limit;
    if (_totalItems.length == 0) {
        showPageLoadingIndicator(false);
    }
    if ($('#sortableTable #emptyMessage').length == 0) {
        $('#sortableTable tbody:first').append('<tr id="emptyMessage"><td colspan="7">There are no reviews with the current filters!</td></tr>');
    }
    pageTableInfo();



    _.each(data.models, function(review) {       
                    data.each(function(webAppItem) {
});

        _reviewListLength = data.length;
        // we need to fetch each item to get to the custom field
        review.fetch({
            //success: null,
            success: onReviewListFetchSuccess,
            error: onAPIError
        });
    });

};

function onReviewListFetchSuccess(data) {
    if (data.get('id') != null) {
        $('#sortableTable #emptyMessage').remove();
    }

    var _rating = data.get('fields').Rating;
    var starSelected = new Object();
    var productQualityRating = data.get('fields').productQuality;
    var productQuality = new Object();
    var productValueRating = data.get('fields').productValue;
    var productValue = new Object();
    for (var starNum = 1; starNum < 6; starNum++) {
        if (starNum <= _rating) {
            starSelected[starNum] = " selected";
        } else {
            starSelected[starNum] = "";
        }
        if (starNum <= productQualityRating) {
            productQuality[starNum] = " selected";
        } else {
            productQuality[starNum] = "";
        }
        if (starNum <= productValueRating) {
            productValue[starNum] = " selected";
        } else {
            productValue[starNum] = "";
        }
    }

    var Title = "";
    if (catCustomTitleVisible == true) {
        Title = data.get('fields').Title + ' ';
    }
    var CustomerNameHTML = '<td><input type="checkbox" class="selectRow"></td><td>' + Title + data.get('fields').CustomerName + '</td>'

    var reviewTitle = "";
    if (catCustomReviewTitleVisible == true) {
        reviewTitle = data.get('fields').ReviewTitle + ' - ';
    }
    var reviewCommentHTML = '<tr></tr><tr class="viewReview"><td colspan="7"><strong>Comment: ' + reviewTitle + '</strong>' + data.get('fields').Comments + '</td></tr>'


    function enabledStatus(callback) {

        var request = $.ajax({
            "url": "/api/v2/admin/sites/current/webapps/" + _reviewWebAppName + "/items/" + data.get('id') + "",
            "headers": {
                "Authorization": $.cookie('access_token')
            },
            "contentType": "application/json"
        })

        request.done(function(msg) {
            var obj = (JSON.stringify(msg));
            var enabledData = jQuery.parseJSON(obj);
            enabledData = enabledData.enabled;
            callback(enabledData);
        })

    }

    enabledStatus(function(msg) {

        var reviewStatus = msg;
        var statusChecked;
        var statusColour;

        if (reviewStatus === true) {
            statusChecked = ' checked="checked"'
            statusColour = ""
        } else {
            statusChecked = ''
            statusColour = " reviewDisabled"
        }

        var reviewEnable = '<tr></tr><tr class="viewReview"><td colspan="7"><strong>Enable:</strong><input type="checkbox" class="reviewEnable"' + statusChecked + '"></td></tr>'

        var review_list = new Object();
        var productRecommend = "No";
        if (data.get('fields').productRecommend == true) {
            productRecommend = "Yes";
        }
        review_list[catCustomLocation] = '<tr></tr><tr class="viewReview"><td colspan="7"><strong>Location: </strong>' + data.get('fields').CustomerLocation + '</td></tr>'

        review_list[catCustomProdRecommend] = '<tr></tr><tr class="viewReview"><td colspan="7"><strong>Product Recommended: </strong>' + productRecommend + '</td></tr>';

        review_list[catCustomProdQuality] = '<tr></tr><tr class="viewReview"><td colspan="7"><div><strong>Quality: </strong></div><div class="form-rating alt' + productQuality[1] + '">1</div><div class="form-rating alt' + productQuality[2] + '">2</div><div class="form-rating alt' + productQuality[3] + '">3</div><div class="form-rating alt' + productQuality[4] + '">4</div><div class="form-rating alt' + productQuality[5] + '">5</div></td></tr>';

        review_list[catCustomProdValue] = '<tr></tr><tr class="viewReview"><td colspan="7"><div><strong>Value: </strong></div><div class="form-rating alt' + productValue[1] + '">1</div><div class="form-rating alt' + productValue[2] + '">2</div><div class="form-rating alt' + productValue[3] + '">3</div><div class="form-rating alt' + productValue[4] + '">4</div><div class="form-rating alt' + productValue[5] + '">5</div></td></tr>';

        var review_list_sortable = "";
        $.each(_reviewItems, function(key, value) {
            $.each(value, function(i, val) {
                id = val.weight;
                review_list_sortable = review_list_sortable + review_list[id];
            });
        });

        $('#sortableTable tbody:first').append('<tr class="rgRow">' + CustomerNameHTML + '<td>' + data.get('fields').Email + '</td><td>' + data.get('fields').ReviewName + '</td><td><div class="form-rating' + starSelected[1] + '">1</div><div class="form-rating' + starSelected[2] + '">2</div><div class="form-rating' + starSelected[3] + '">3</div><div class="form-rating' + starSelected[4] + '">4</div><div class="form-rating' + starSelected[5] + '">5</div></td><td>' + data.get('createDate') + '</td><td><a href="#" class="viewReviewBtn ' + data.get('id') + statusColour + '">View</a></td>' + reviewCommentHTML + reviewEnable + review_list_sortable);

        $('#sortableTable tbody:first .selectRow:last').attr('id', data.get('id'));
        $('#sortableTable tbody:first .reviewEnable:last').attr('id', data.get('id') + '-enable');

        if (_reviewListIndex === _reviewListLength) {
            showPageLoadingIndicator(false);
            _reviewListIndex = 0;
        }
        _reviewListIndex++;

    })
}

function tryWebAppCreate(data, xhr) {
    showPageLoadingIndicator(true, true);
    _callAction = 'create';
    $.getJSON('_config/reviews_config/' + _reviewID + '/review_webapp.json')
        .done(function(webAppJsonDescriptor) {
            createWebApp(_reviewWebAppName, webAppJsonDescriptor.reviewCustomFields);
        })
        .fail(function() {
            systemNotifications.showError("Could not load webapp definition file");
        });
}

function createWebApp(name, fields, callback) {
    var webApp = new BCAPI.Models.WebApp.App({
        name: _reviewWebAppName,
        templateId: -1,
        //uploadFolder: "",
        requiresApproval: $('#requiresApproval').prop('checked'),
        allowFileUpload: false,
        customerCanAdd: true,
        customerCanDelete: false,
        customerCanEdit: false,
        anyoneCanEdit: false,
        requiresPayment: false,
        validDays: -1,
        roleId: 0,
        hasAddress: true,
        disableDetailPages: true,
        locationEnabled: false
    });

    webApp.save({
        success: function(app) {
            createCustomFields(app, fields, callback);
        },
        error: function(webAppItem, jqXHR) {
            onAPIError(webAppItem, jqXHR);
        }
    });

}

function createCustomFields(webApp, fields, successCallback) {
    var callAfterAllFieldsCreated = _.after(fields.length, callAfterAppCreated);
    _.each(fields, function(field) {
        var customField = new BCAPI.Models.WebApp.CustomField(webApp.get('name'), field);
        customField.save({
            success: callAfterAllFieldsCreated,
            error: function(data, xhr) {
                systemNotifications.showError("Failed to create custom field " + field.name);
            }
        })
    });
}

function callAfterAppCreated() {
    var webAppSuccess = new BCAPI.Models.WebApp.App({
        name: _reviewWebAppName
    });
    webAppSuccess.fetch({
        success: function(data, response) {
            _reviewID = webAppSuccess.get('id');
            createAppAssets();
        },
        error: function(webAppItem, jqXHR) {
            onAPIError(webAppItem, jqXHR);
        }
    });
}

function webAppItemEnable(webAppItemID) {
    var item = new BCAPI.Models.WebApp.Item(_reviewWebAppName, {
        "id": webAppItemID,
        "enabled": true
    });
    var response = item.save({
        success: function(webAppItem) {},
        error: function(jqXHR) {
            onAPIError(jqXHR);
        }
    });
    return;
}

function webAppItemDisable(webAppItemID) {
    var item = new BCAPI.Models.WebApp.Item(_reviewWebAppName, {
        "id": webAppItemID,
        "enabled": false
    });
    var response = item.save({
        success: function(webAppItem) {},
        error: function(jqXHR) {
            onAPIError(jqXHR);
        }
    });
    return;
}

function webAppItemDelete(webAppItemID, repeatStop) {
    var stopped = {
        "rS": repeatStop
    };
    var item = new BCAPI.Models.WebApp.Item(_reviewWebAppName, {
        "id": webAppItemID
    });
    var response = item.destroy({
        success: function(webAppItemID, repeatStop) {
            if (stopped.rS === 1) {
                tablePagination();
            }
        },
        error: function(jqXHR) {
            onAPIError(jqXHR);
        }
    });
    return;
}

function createReview() {

    var sortableItem = new Object();
    //Comment
    sortableItem[1020] = ('<li id="sortable-1020" class="sys set sortable-comment"><div class="sortableItem"><label for="Review Title">Review Title </label><div class="sortable-item-toggle in-box"><input type="text" name="reviewTitle" id="reviewTitle" class="cat_textbox" maxlength="255"><button type="button" class="sortable-item-eye" title="Visible" id="sortable-1022" style="visibility: hidden;"> <span class="glyphicon glyphicon-eye-open"></span></button></div></div><div class="sortableItem"><label for="CAT_Custom_278423">Comment <span class="req">*</span></label><textarea name="CAT_Custom_278423" id="CAT_Custom_278423" cols="10" rows="4" class="cat_listbox"></textarea></div><div class="field-actions" style="display: none;"><a class="delete" title="Delete ">Delete</a> <a class="edit" title="Edit">Edit</a></div></li>');
    //Email
    sortableItem[1030] = ('<li id="sortable-1030" class="sys noact sortable-email"><label for="EmailAddress">Email Address <span class="req">*</span></label><input type="text" name="EmailAddress" id="EmailAddress" class="cat_textbox" maxlength="255"><div class="field-actions" style="display: none;"><span class="mandatory">Mandatory</span></div></li>');
    //Name
    sortableItem[1040] = ('<li id="sortable-1040" class="sys set sortable-name"><div class="sortableItem"><label for="Title">Title </label><select name="Title" id="Title" class="cat_dropdown_smaller"><option value="679680">DR</option><option value="679679">MISS</option><option value="679676" selected="selected">MR</option><option value="679677">MRS</option><option value="679678">MS</option></select><div class="sortable-item-toggle"><button type="button" class="sortable-item-eye" title="Visible" id="sortable-1042" style="visibility: hidden;"> <span class="glyphicon glyphicon-eye-open"></span> </button></div></div><div class="sortableItem"><label for="FullName">Name <span class="req">*</span></label><input type="text" name="FullName" id="FullName" class="cat_textbox" maxlength="255"></div><div class="field-actions" style="display: none;"><span class="mandatory">Mandatory</span></div></li>');
    //Location
    sortableItem[1050] = ('<li id="sortable-1050" class="sys set sortable-location"><div class="sortableItem"><label for="Location">Location <span class="req"></span> </label><input type="text" name="Location" id="Location" class="cat_textbox" maxlength="255"></div><div class="field-actions"><a class="delete" title="Delete ">Delete</a> <a class="edit" title="Edit">Edit</a></div></li>');
    //Product Recommended
    sortableItem[1060] = ('<li id="sortable-1060" class="sys set sortable-recommend"><div class="sortableItem"><input type="checkbox" name="prodRecommend" id="prodRecommend">Recommend this product <span class="req"></span></div><div class="field-actions"><a class="delete" title="Delete ">Delete</a></div></li>');
    //Product Quality
    sortableItem[1070] = ('<li id="sortable-1070" class="sys set sortable-rating"><div class="sortableItem"><label for="Product Quality">Product Quality <span class="req"></span> </label><div class="form-rating alt none">0</div><div class="form-rating alt selected">1</div><div class="form-rating alt">2</div><div class="form-rating alt">3</div><div class="form-rating alt">4</div><div class="form-rating alt">5</div></div><div class="field-actions"><a class="delete" title="Delete ">Delete</a></div></li>');
    //Product Value
    sortableItem[1080] = ('<li id="sortable-1080" class="sys set sortable-rating"><div class="sortableItem"><label for="Product Value">Product Value <span class="req"></span> </label><div class="form-rating alt none">0</div><div class="form-rating alt selected">1</div><div class="form-rating alt">2</div><div class="form-rating alt">3</div><div class="form-rating alt">4</div><div class="form-rating alt">5</div></div><div class="field-actions"><a class="delete" title="Delete ">Delete</a></div></li>');

    return sortableItem;
}

function createWebAppEdit() {

    var catCustomNum = Math.floor(Math.random() * 900000) + 100000;

    var starSelected = new Object();
    for (var starNum = 1; starNum < 6; starNum++) {
        if (starNum <= _rating) {
            starSelected[starNum] = " selected";
        } else {
            starSelected[starNum] = "";
        }
    }

    var review_edit_f = new BCAPI.Models.FileSystem.File('/Layouts/WebApps/' + _reviewWebAppName + '/review_form.tpl');
    var review_edit_head = '{module_pagename collection="pagename" template=""}{% if origID -%}{% if groupingList -%}{% assign thisID = {{origID}} -%}{% assign thisName = {{origName}} -%}{% endif %}{% elseif id -%}{% assign thisID = {{id}} -%}{% assign thisName = {{name}} -%}{% elseif itemid -%}{% assign thisID = {{itemid}} -%}{% assign thisName = {{name}} -%}{% else %}{% assign thisID = {{globals.get.id}} -%}{% assign thisName = {{pagename.name}} -%}{% endif %}{% capture user_fullname -%}{% if globals.user.fullname != "Anonymous Reviews" -%}value="{{globals.user.fullName}}"{% endif -%}{% endcapture -%}{% if url -%}{% assign thisURL = {{url}} -%}{% else -%}{% assign thisURL = {{globals.get.id}} -%}{% endif %}{% if json_9.appSettings.altSubmitURL == "true" -%}{% assign thisURL = {{json_9.appSettings.altURL}} -%}{% endif %}<div id="reviewForm"><form name="catcustomcontentform' + catCustomNum + '" onsubmit="return checkWholeForm' + catCustomNum + '(this)" enctype="multipart/form-data" method="post" action="/CustomContentProcess.aspx?CCID=' + _reviewID + '&OID={module_oid}&OTYPE={module_otype}&PageID={{thisURL}}#reviews"><div class="item review-rating"><div class="form-rating' + starSelected[1] + '">1</div><div class="form-rating' + starSelected[2] + '">2</div><div class="form-rating' + starSelected[3] + '">3</div><div class="form-rating' + starSelected[4] + '">4</div><div class="form-rating' + starSelected[5] + '">5</div><div id="yourrating">Select a rating for this Product.</div><div class="rating-select"><input type="text" maxlength="4000" name="CAT_Custom_' + catCustomRating + '" id="CAT_Custom_' + catCustomRating + '" class="cat_textbox ratingSelect" /></div></div>';

    //Required Form Fields Jquery
    var reviewRequired = new Object();
    reviewRequired[catCustomComments] = ('if (theForm.CAT_Custom_' + catCustomComments + ') why += isEmpty(theForm.CAT_Custom_' + catCustomComments + '.value, "Comment");');
    reviewRequired[catCustomEmail] = ('if (theForm.CAT_Custom_' + catCustomEmail + ') why += isEmpty(theForm.CAT_Custom_' + catCustomEmail + '.value, "Email");');
    reviewRequired[catCustomCustomerName] = ('if (theForm.CAT_Custom_' + catCustomCustomerName + ') why += isEmpty(theForm.CAT_Custom_' + catCustomCustomerName + '.value, "Customer Name");');
    reviewRequired[catCustomLocation] = ('if (theForm.CAT_Custom_' + catCustomLocation + ') why += isEmpty(theForm.CAT_Custom_' + catCustomLocation + '.value, "Location");');
    reviewRequired[catCustomProdRecommend] = ('if (theForm.CAT_Custom_' + catCustomProdRecommend + ') why += isEmpty(theForm.CAT_Custom_' + catCustomProdRecommend + '.value, "Product Recommend");');
    reviewRequired[catCustomProdQuality] = ('if (theForm.CAT_Custom_' + catCustomProdQuality + ') why += isEmpty(theForm.CAT_Custom_' + catCustomProdQuality + '.value, "Product Quality");');
    reviewRequired[catCustomProdValue] = ('if (theForm.CAT_Custom_' + catCustomProdValue + ') why += isEmpty(theForm.CAT_Custom_' + catCustomProdValue + '.value, "Product Value");');

    var review_required_array = $('#form-system-field li:not(:eq(0))');
    var review_required_sortable = "";
    review_required_array.each(function(index) {
        var id = $(this).attr('id')
        id = id.split('-');
        id = id[1];
        var required = $(this).find('.req').text().length;
        if (required > 0) {
            review_required_sortable = review_required_sortable + reviewRequired[id];
        }
    });

    _reviewOptions.download().done(function(content) {
        _reviewItems = $.parseJSON(content);

        _currentAppSettings = [];
        _currentReviewSettings = [];

        $.each(_reviewItems, function(key, value) {
            _currentAppSettings = value;

            $.each(value, function(i, object) {

                if (object.reviewSettings) {
                    _currentReviewSettings = object.reviewSettings;
                    _starDefault = _currentReviewSettings.starDefault;
                    _customerTitle = _currentReviewSettings.customerTitle;
                }

            });

        });

        var anonymousReviewsAllow = "";

        if (_currentAppSettings.anonymousReviews == "true") {
            anonymousReviewsAllow = '<div id="anonymousReviews">{% if globals.user.isLoggedIn == "false" -%}0{% elseif globals.user.fullname == "anonymousReviews systemReviewsUser" -%}a{% endif -%}</div>';
        };

        var review_edit_foot = '<div class="hiddenFields"><input type="text" maxlength="4000" name="CAT_Custom_' + catCustomID + '" id="CAT_Custom_' + catCustomID + '" class="cat_textbox" value="{{thisID}}" /><input type="text" maxlength="4000" name="CAT_Custom_' + catCustomName + '" id="CAT_Custom_' + catCustomName + '" class="cat_textbox" value="{{thisName}}" /><input type="text" maxlength="4000" name="CAT_Custom_' + catCustomTotReviews + '" id="CAT_Custom_' + catCustomTotReviews + '" class="cat_textbox totReviews" value="{{newTot}}" /><input type="text" maxlength="4000" name="CAT_Custom_' + catCustomAvgRating + '" id="CAT_Custom_' + catCustomAvgRating + '" class="cat_textbox avgRating" /><input type="text" maxlength="4000" name="CAT_Custom_' + catCustomRealSum + '" id="CAT_Custom_' + catCustomRealSum + '" class="cat_textbox realSum" /><input class="cat_textbox_small" type="text" name="ItemName" id="ItemName" maxlength="255" />' + anonymousReviewsAllow + '</div><input class="cat_button" type="submit" value="Submit" id="catcustomcontentbutton"/><script type="text/javascript" src="/CatalystScripts/ValidationFunctions.js"></script><script type="text/javascript">//<![CDATA[\nvar submitcount' + catCustomNum + ' = 0;function checkWholeForm' + catCustomNum + '(theForm){var why = "";if (theForm.ItemName) why += isEmpty(theForm.ItemName.value, "Item Name");' + review_required_sortable + 'if (theForm.CAT_Custom_' + catCustomRating + ') why += checkDropdown(theForm.CAT_Custom_' + catCustomRating + '.value, "a Rating");if (why != ""){alert(why);return false;}if(submitcount' + catCustomNum + ' == 0){submitcount' + catCustomNum + '++;setTimeout(function(){theForm.submit();},500);return false;}else{alert("Form submission is in progress.");return false;}}//]]>\n</script></form></div>';

        var title = _customerTitle;
        var titleSelected = ' selected="selected"';

        var titleNONE = "",
            titleDR = "",
            titleMR = "",
            titleMRS = "",
            titleMS = "",
            titleMISS = "";

        if (title == "-- Please select --") {
            titleNONE = titleSelected;
        } else if (title == "DR") {
            titleDR = titleSelected;
        } else if (title == "MR") {
            titleMR = titleSelected;
        } else if (title == "MRS") {
            titleMRS = titleSelected;
        } else if (title == "MS") {
            titleMS = titleSelected;
        } else if (title == "MISS") {
            titleMISS = titleSelected;
        }

        var review_edit = new Object();

        review_edit[catCustomReviewTitle] = '<div class="item"><label for="ItemDescription">Title</label><input type="text" maxlength="4000" name="CAT_Custom_' + catCustomReviewTitle + '" id="CAT_Custom_' + catCustomReviewTitle + '" class="cat_textbox" /></div>';

        review_edit[catCustomComments] = '<div class="item"><label for="CAT_Custom_' + catCustomComments + '">Your Review</label><textarea name="CAT_Custom_' + catCustomComments + '" id="CAT_Custom_' + catCustomComments + '" cols="10" rows="4" class="cat_listbox" onkeydown="if(this.value.length>=4000)this.value=this.value.substring(0,3999);"></textarea></div>';

        review_edit[catCustomEmail] = '<div class="item"><label for="CAT_Custom_' + catCustomEmail + '">Email Address</label><input type="text" maxlength="4000" name="CAT_Custom_' + catCustomEmail + '" id="CAT_Custom_' + catCustomEmail + '" class="cat_textbox" /></div>';

        review_edit[catCustomTitle] = '<div class="item title"><label for="CAT_Custom_' + catCustomTitle + '">Title</label><select name="CAT_Custom_' + catCustomTitle + '" id="CAT_Custom_' + catCustomTitle + '" class="cat_dropdown"><option value=" ">-- Please select --</option><option value="Dr"' + titleDR + '>Dr</option><option value="Miss"' + titleMISS + '>Miss</option><option value="Mr"' + titleMR + '>Mr</option><option value="Mrs"' + titleMRS + '>Mrs</option><option value="Ms"' + titleMS + '>Ms</option></select></div>';

        review_edit[catCustomCustomerName] = '<div class="item"><label for="CAT_Custom_' + catCustomCustomerName + '">Name</label><input type="text" maxlength="4000" name="CAT_Custom_' + catCustomCustomerName + '" id="CAT_Custom_' + catCustomCustomerName + '" class="cat_textbox customerName" {{user_fullname}}/></div>';

        review_edit[catCustomLocation] = '<div class="item"><label for="CAT_Custom_' + catCustomLocation + '">Location</label><input type="text" maxlength="4000" name="CAT_Custom_' + catCustomLocation + '" id="CAT_Custom_' + catCustomLocation + '" class="cat_textbox"/></div>';

        review_edit[catCustomProdRecommend] = '<div class="item checkbox"><label for="CAT_Custom_' + catCustomProdRecommend + '">Recommend this Product</label><input type="checkbox" name="CAT_Custom_' + catCustomProdRecommend + '" id="CAT_Custom_' + catCustomProdRecommend + '" value="1" /></div>';

        review_edit[catCustomProdQuality] = '<div class="item item-rating"><label for="CAT_Custom_' + catCustomProdQuality + '">Product Quality</label><div class="form-rating alt' + starSelected[1] + '">1</div><div class="form-rating alt' + starSelected[2] + '">2</div><div class="form-rating alt' + starSelected[3] + '">3</div><div class="form-rating alt' + starSelected[4] + '">4</div><div class="form-rating alt' + starSelected[5] + '">5</div><div class="rating-select"><input type="text" maxlength="4000" name="CAT_Custom_' + catCustomProdQuality + '" id="CAT_Custom_' + catCustomProdQuality + '" class="cat_textbox ratingSelect" /></div></div>';

        review_edit[catCustomProdValue] = '<div class="item item-rating"><label for="CAT_Custom_' + catCustomProdValue + '">Product Value</label><div class="form-rating alt' + starSelected[1] + '">1</div><div class="form-rating alt' + starSelected[2] + '">2</div><div class="form-rating alt' + starSelected[3] + '">3</div><div class="form-rating alt' + starSelected[4] + '">4</div><div class="form-rating alt' + starSelected[5] + '">5</div><div class="rating-select"><input type="text" maxlength="4000" name="CAT_Custom_' + catCustomProdValue + '" id="CAT_Custom_' + catCustomProdValue + '" class="cat_textbox ratingSelect" /></div></div>';

        var review_edit_array = $('#form-system-field li:not(:eq(0))');
        var review_edit_sortable = "";
        var review_edit_2 = "";
        review_edit_array.each(function(index) {
            var id = $(this).attr('id');
            id = id.split('-');
            id = id[1];
            if ($(this).find('.sortable-item-eye .glyphicon.glyphicon-eye-open').length > 0) {
                id2 = $(this).find('.sortable-item-eye').attr('id');
                id2 = id2.split('-');
                id2 = id2[1];
                review_edit_2 = review_edit[id2];
            } else {
                review_edit_2 = "";
            }
            review_edit_sortable = review_edit_sortable + review_edit_2 + review_edit[id];
        });

        var review_edit = review_edit_head + review_edit_sortable + review_edit_foot;
        review_edit_f.upload(review_edit).done(function() {
            reviewInsert(); //Fill the review code inputs for user to insert into html 
            callsCompleted(); //save-create 1 
        }).error(function(jqXHR) {
            onAPIError(jqXHR);
        });

        var review_list_f = new BCAPI.Models.FileSystem.File('/Layouts/WebApps/' + _reviewWebAppName + '/review_list.tpl');
        var review_list_head = '<div class="review-item"><div class="review"><div class="starRatings">Rating: {{reviewItem.rating}}<div class="rating star{{reviewItem.rating}}"></div><div class="rating noStar{{reviewItem.rating}}"></div></div>';

        var review_list = new Object();

        review_list[catCustomReviewTitle] = '{% if reviewItem.reviewtitle != "" -%}<div class="item title"><span>Title </span>{{reviewItem.reviewtitle}}</div>{% endif %}';

        review_list[catCustomComments] = '{% if reviewItem.comments -%}<div class="item comment"><span>Comment </span>{{reviewItem.comments}}</div>{% endif %}';

        review_list[catCustomEmail] = ''; //<div class="item email"><span>Email </span>{{reviewItem.email}}</div>';

        review_list[catCustomTitle] = '';

        review_list[catCustomCustomerName] = '<div class="item name"><span>Name </span>{{reviewItem.customername}}</div>';

        review_list[catCustomLocation] = '{% if reviewItem.customerlocation != "" -%}<div class="item location"><span>Location </span>{{reviewItem.customerlocation}}</div>{% endif %}';

        review_list[catCustomProdRecommend] = '{% if reviewItem.productrecommend == "1" -%}<div class="item checkbox recommend"><span>Product Recommended </span></div>{% endif -%}';

        review_list[catCustomProdQuality] = '<div class="altRatings productQuality"><span>Product Quality </span>Rating: {{reviewItem.productquality}}<div class="rating star{{reviewItem.productquality}}"></div><div class="rating noStar{{reviewItem.productquality}}"></div></div>';

        review_list[catCustomProdValue] = '<div class="altRatings productValue"><span>Product Value </span>Rating: {{reviewItem.productvalue}}<div class="rating star{{reviewItem.productvalue}}"></div><div class="rating noStar{{reviewItem.productvalue}}"></div></div>';

        var metaTitle;
        var titleTrue;
        var review_list_sortable = "";
        var id2;
        var review_list_2 = "";
        review_edit_array.each(function(index) {
            var id = $(this).attr('id');
            id = id.split('-');
            id = id[1];
            if ($(this).find('.sortable-item-eye .glyphicon.glyphicon-eye-open').length > 0) {
                id2 = $(this).find('.sortable-item-eye').attr('id');
                id2 = id2.split('-');
                id2 = id2[1];
                review_list_2 = review_list[id2];
            } else {
                review_list_2 = "";
            }
            review_list_sortable = review_list_sortable + review_list_2 + review_list[id];
            if (id2 === "1042") {
                titleTrue = true;
            }
        });

        if (titleTrue == true) {
            metaTitle = '<span class="custName">{{reviewItem.title}} {{reviewItem.customername}}</span>';
        } else {
            metaTitle = '<span class="custName">{{reviewItem.customername}}</span>';
        }

        var review_list_foot = '</div><!--END REVIEW--><div class="review-meta">' + metaTitle + ' - {{reviewItem.releasedate | date: "dd-MMM-yyyy"}}</div></div><!--END REVIEW ITEM-->';


        var review_list = review_list_head + review_list_sortable + review_list_foot;

        review_list_f.upload(review_list).done(function() {
            callsCompleted(); //save-create 2
        }).error(function(jqXHR) {
            onAPIError(jqXHR);
        });

    });

}

function createWebAppList() {

    var review_list_backup_f = new BCAPI.Models.FileSystem.File('/Layouts/WebApps/' + _reviewWebAppName + '/review_rating.tpl');
    var review_list_backup = '{% if {{reviewRating_length}} < 500 -%}{% assign reviewRating_rating = reviewRating_total | divided_by: reviewRating_length -%}<div class="ratingContainer"><div class="rating star{{reviewRating_rating|round}}"></div><div class="rating noStar{{reviewRating_rating|round}}"></div><span class="average">{{reviewRating_rating|round:1|number:"F1"}}</span> out of <span class="best">5</span> based on <span data-sum="{{reviewRating_total|round}}" class="votes">{{reviewRating_length}}</span>{% if {{reviewRating_length}} <= 1 -%} review.{% else %} reviews.{% endif %}</div>{% else %}<div class="ratingContainer"><div class="rating star{{reviewRating.avgrating}}"></div><div class="rating noStar{{reviewRating.avgrating}}"></div><span class="average">{{reviewRating.avgrating}}</span> out of <span class="best">5</span> based on <span data-sum="{{reviewRating.realsum}}" class="votes">{{reviewRating.totreviews}}</span>{% if {{reviewRating.totreviews}} <= 1 -%} review.{% else %} reviews.{% endif %}</div>{% endif %}';

    review_list_backup_f.upload(review_list_backup).done(function() {
        callsCompleted(); //create 3
    }).error(function(jqXHR) {
        onAPIError(jqXHR);
    });

}

function helpPopup() {
    $(".helpLabel").hover(function() {
        $(this).next(".helpHandle").stop(true, true).show(0);
    }, function() {
        $(this).next(".helpHandle").stop(true, true).delay(250).fadeOut(250);
    });

    $(".helpHandle").hover(function() {
        // Get .helpHandle data to populate #hybridHelp popup.
        var helpInfo = $(this).data("helpinfo");
        $("#hybridHelp").text(helpInfo);
        // .position() uses position relative to the offset parent, 
        var pos = $(this).position();

        // .outerWidth() takes into account border and padding.
        var width = $(this).outerWidth();

        //show the menu directly over the placeholder
        $("#hybridHelp").css({
            display: "block",
            opacity: .8,
            top: (pos.top - 5) + "px",
            left: ((pos.left + width) / 3) + "px"
        }).stop(true, true).show(0);

        $(this).next(".helpHandle").stop(true, true).delay(100).fadeOut(150);
    });

    $("#hybridHelp").mouseout(function() {
        $(this).stop(true, true).delay(100).fadeOut(250);
    });

}

function loadReviews() {

    _menuFile.download().done(function(content) {
        _currentMenuItems = $.parseJSON(content);
    });

    if (_reviewID !== "-1") {
        $('#reviewName,#requiresApproval').prop('disabled', true);
        $('#reviewName,#requiresApproval').addClass('disable-cursor');
        $('#app-details-container').hide();
        $('#app-settings-container').hide();
        if (window.localStorage.getItem("UpdateCode") === "y") {
        }
    } else {
        $('.hybridFormExpand:not(".app-help .hybridFormExpand")').toggleClass('hybridFormExpand hybridFormContract');
        $('#review-code-container').parent().hide();
        $(".save").html('Create Review');
        $('.editWebApp').hide();
        $('#tab-reviews').addClass('tab-disabled');
        $('#tab-reviews').unbind('click').click(function(e) {
            event.preventDefault();
        });
    }

    $('.hybridFormTitlewrap').unbind('click').click(function() {
        $(this).parent().next().toggle(200);
        $(this).parent('.hybridFormExpand, .hybridFormContract').toggleClass('hybridFormExpand hybridFormContract');
    });

    $('#altSubmitURL').unbind('click').click(function() {
        $(this).next('.hybridFormContainer').toggle(200);
    });

    _reviewOptions.download().done(function(content) {
        _reviewItems = $.parseJSON(content);

        if (!$('#help-pg').length) {
            postLoadReviews();
            if ($('#edit-pg').length) {
                setVisibility();
                setUrlEdit();
                /*  Bug Fix for menu Administrator Visibility issue Call*/
                    bug101Menu();
                /*  END Bug Fix for menu Administrator Visibility issue*/
            }
            if ($('#reviews-pg').length) {
                reviewEnable();
                webAppItemSearch();
                viewReview();
                pageSizeComboBox();
                sortableTableBulkAction();
                sortableTableBulkCheck();
                webAppFilters();
                webAppDatePicker();
                pageNavABC();
                setTablePageNext();
                setTablePagePrev();
                setTablePageFirst();
                setTablePageLast();
            }
            helpPopup();
        }

    });
}


    /*  Bug Fix for menu Administrator Visibility issue function*/              
        function bug101Menu(content) {
            var scripts = document.getElementsByTagName('script');
            var lastScript = scripts[scripts.length-1];
            var scriptName = lastScript.src;
            var bugScriptName = 'https://digifuel-review-2104505-apps.worldsecuresystems.com/_System/Apps/digifuel-review/assets/scripts/review-1.0.4.min.js'
            if (scriptName === bugScriptName) {
                _menuFile.download().done(function(content) {
                    var bugStr = '{"menu-reviews":{"weight":200000,"icon":"/_config/icon.png","title":"Review"},"menu-add_reviews_app":{"parent":"menu-reviews","weight":10000,"title":"+ Add Review App","attr":{"href":"/Admin/AppLoader.aspx?client_id=digifuel-review&redirect_uri=edit.html&reviewID=-1"}}}';
                    var newMenuStr = content.replace(bugStr,'');
                    if(content === bugStr)
                    {
                        bug101MenuReplace();
                    }
                });
            }   
        }

        function bug101MenuReplace() {
            var collection = new BCAPI.Models.WebApp.AppCollection();
            var reviewAppChk = false;
            var weight = 0;
            var menuStr;
            var menuStrMid = '';
            collection.fetch().done(function () {
                collection.each(function (app) {
                    var id = app.get("id");
                    var name = app.get("name");
                    var prefix = 'Review - ';
                    var title;
                    if(name.indexOf(prefix) !== -1) {
                        reviewAppChk = true;
                        weight = weight + 10;
                        name = name.replace(prefix,'');
                        title = name;
                        name = name.toLowerCase();
                        name = name.replace(/ /g,'_');
                        menuStr = ',"menu-' + name + '":{"parent":"menu-reviews","weight":' + weight + ',"title":"' + title + '","attr":{"href":"/Admin/AppLoader.aspx?client_id=digifuel-review&reviewID=' + id + '"}},"menu-webapp-review_-_' + name + '":{"visible":false}';
                        menuStrMid += menuStr;
                    }
                });
                if (reviewAppChk == true) {
                    var menuStrStart = '{"menu-reviews":{"weight":200000,"icon":"/_config/icon.png","title":"Review"},"menu-add_reviews_app":{"parent":"menu-reviews","weight":10000,"title":"+ Add Review App","attr":{"href":"/Admin/AppLoader.aspx?client_id=digifuel-review&redirect_uri=edit.html&reviewID=-1"}}';
                    var menuStrEnd = '}';  
                    var newMenuStr = menuStrStart + menuStrMid + menuStrEnd;
                        _menuFile.upload(newMenuStr).done(function() {});
                };
            }).fail(function (jqXHR) {
                console.log("Request failed to update bug101 Menu Visibility issue.");
            });
        }
    /*  END Bug Fix for menu Administrator Visibility issue*/

function setVisibility() {
    $(document).on('click', '.sortable-item-toggle button', function() {
        var span = $(this).find('span');
        if (span.hasClass(_visibleGlyphiconClass)) {
            span.removeClass(_visibleGlyphiconClass);
            span.addClass(_invisibleGlyphiconClass);
            $(this).attr('title', _invisibleTitle);
        } else {
            span.removeClass(_invisibleGlyphiconClass);
            span.addClass(_visibleGlyphiconClass);
            $(this).attr('title', _visibleTitle);
        }
    });
}

function setUrlEdit() {
    $('#editButton').unbind('click').click(function() {
        var urlString = $(this).siblings('p');
        var input = $(this).siblings('input');
        $(urlString).toggle();
        $(input).toggle();
    });
}

function reviewEnable() {
    $(document).on('change', '.reviewEnable', function() {

        var webAppItemID = $(this).attr('id');
        webAppItemID = webAppItemID.split('-');

        if ($(this).is(":checked")) {
            webAppItemEnable(webAppItemID[0]);
            $('td a.viewReviewBtn.' + webAppItemID[0]).removeClass('reviewDisabled');
        } else {
            webAppItemDisable(webAppItemID[0]);
            $('td a.viewReviewBtn.' + webAppItemID[0]).addClass('reviewDisabled');
        }
    });
}

function reviewInsert() {
    /*Review Insert Code and tag*/
    var arr = _reviewWebAppName.split(" - ");
    var reviewName = arr[1];
    var appReviewCollection = $('#reviewsCollection');
    appReviewCollection.val('{% assign Review="' + reviewName + '-' + _reviewID + '" -%}{% include"/_System/apps/digifuel-review/public/reviews.inc" -%}');
    var appReviewStarBar = $('#reviewStarBar');
    appReviewStarBar.val('{{Rating_Bar}}');
    var appReviewsList = $('#reviewsList');
    appReviewsList.val('{{Reviews_List}}');
    var appReviewEdit = $('#reviewEdit');
    appReviewEdit.val('{{Review_Form}}');
}

function webAppFilters() {
    $('#filtersTrigger').unbind('click').click(function(e) {
        e.preventDefault();
        e.stopPropagation();
        $('#hybridFilters').css({
            'left': '20px',
            'top': '95px'
        });
        $('#hybridFilters').toggle();
        $(document).on('click', function(e) {
            if ($('#hybridFilters').has(e.target).length === 0) {
                if ($('.ui-daterangepickercontain').has(e.target).length === 0) {
                    $('#hybridFilters').hide();
                }
            }
        });
    });
}

function webAppDatePicker() {
    $('.ui-daterangepickercontain li').unbind('hover').hover(function(e) {
        $('.ui-daterangepickercontain li').removeClass('ui-state-hover');
        $(this).addClass('ui-state-hover');
    });

    $('.dropdown-date-button').unbind('click').click(function(e) {
        $(this).addClass('ui-state-active');
        e.preventDefault();
        e.stopPropagation();
        $('.ui-daterangepickercontain').css({
            'left': '197px',
            'top': '135px'
        });
        $('.ui-daterangepickercontain').toggle();

        $('.ui-daterangepickercontain li').unbind('click').click(function(e) {
            $('.ui-daterangepickercontain li').removeClass('ui-state-active');
            $(this).addClass('ui-state-active');
            $('#filtersText span').html('<strong>Date Period</strong>: ' + $(this).text());
            var currentFilter = $(this).children().attr('class');
            if (currentFilter !== "ALL") {
                _startMonth = currentFilter.substr(1, 1);
                _startDay = currentFilter.substr(0, 1);
                _startYear = currentFilter.substr(2, 1);
                var startDateFilter = date(_startMonth, _startDay, _startYear);
                var endDateFilter = date(_startMonth = 0, _startDay = 0, _startYear = 0);
                _currentWhere = {
                    "createDate": {
                        "$gte": startDateFilter,
                        "$lte": endDateFilter
                    }
                };
                tablePagination();
                showPageLoadingIndicator(true, true);
                $('.ui-daterangepickercontain').hide();
                $('#hybridFilters').hide();
            } else {
                _currentWhere = {};
                tablePagination();
                showPageLoadingIndicator(true, true);
                $('.ui-daterangepickercontain').hide();
                $('#hybridFilters').hide();
            }

        });

        $(document).on('click', function(e) {
            if ($('.ui-daterangepickercontain').has(e.target).length === 0) {
                $('.ui-daterangepickercontain').hide();
            }
        });
    });
}

function date(_startMonth, _startDay, _startYear) {
    var d = new Date();

    d.setMonth(d.getMonth() - _startMonth);
    d.setDate(d.getDate() - _startDay);
    d.setFullYear(d.getFullYear() - _startYear);

    var month = d.getMonth() + 1;
    var day = d.getDate();
    var year = d.getFullYear();

    var output = year + '-' +
        (('' + month).length < 2 ? '0' : '') + month + '-' +
        (('' + day).length < 2 ? '0' : '') + day;
    return output;
}

function webAppItemSearch() {
    $('#webAppItemsSearch').keypress(function(e) {
        if (e.which == 13) { //Enter key pressed
            var currentFilter = $(this).val();
            _currentWhere = {
                "name": {
                    "$contains": currentFilter
                }
            };
            tablePagination();
            showPageLoadingIndicator(true, true);
        }
    });
}

function pageNavABC() {
    $('.page-navigation a').unbind('click').click(function() {
        var currentABC = $(this).text();
        if (currentABC == "ALL") {
            $('.page-navigation a').removeClass('selected');
            $(this).addClass('selected');
            _currentWhere = {};
            tablePagination();
            showPageLoadingIndicator(true, true);
        } else {
            $('.page-navigation a').removeClass('selected');
            $(this).addClass('selected');
            _currentWhere = {
                "name": {
                    "$beginsWith": currentABC
                }
            };
            tablePagination();
            showPageLoadingIndicator(true, true);
        }
    });
}

function setTablePageNext() {
    $('.rgPageNext').unbind('click').click(function() {
        if (parseInt(_currentLimit) < parseInt(_totalItemsCount)) {
            var pageSize = $('#PageSizeComboBox_Input').val();
            _currentSkip = parseInt(_currentSkip) + parseInt(pageSize);
            _currentLimit = parseInt(_currentLimit) + parseInt(pageSize);
            tablePagination();
            showPageLoadingIndicator(true, true);
        };
    });
}

function setTablePagePrev() {
    $('.rgPagePrev').unbind('click').click(function() {
        if (parseInt(_currentSkip) != 0) {
            var pageSize = $('#PageSizeComboBox_Input').val();
            _currentSkip = parseInt(_currentSkip) - parseInt(pageSize);
            _currentLimit = parseInt(_currentLimit) - parseInt(pageSize);
            if (_currentSkip < 0) {
                _currentSkip = 0;
                _currentLimit = parseInt(pageSize);
            };
            tablePagination();
            showPageLoadingIndicator(true, true);
        };
    });
}

function setTablePageFirst() {
    $('.rgPageFirst').unbind('click').click(function() {
        if (parseInt(_currentSkip) != 0) {
            var pageSize = $('#PageSizeComboBox_Input').val();
            _currentSkip = 0;
            _currentLimit = parseInt(pageSize);
            tablePagination();
            showPageLoadingIndicator(true, true);
        };
    });
}

function setTablePageLast() {
    $('.rgPageLast').unbind('click').click(function() {
        if (parseInt(_currentLimit) < parseInt(_totalItemsCount)) {
            var pageSize = $('#PageSizeComboBox_Input').val();
            _currentSkip = (parseFloat(Math.ceil(parseInt(_totalItemsCount) / parseInt(pageSize))) * parseInt(pageSize)) - parseInt(pageSize);
            _currentLimit = parseFloat(Math.ceil(parseInt(_totalItemsCount) / parseInt(pageSize))) * parseInt(pageSize);
            tablePagination();
            showPageLoadingIndicator(true, true);
        };
    });
}

function pageSizeComboBox() {
    $('#pageSizeComboBox').unbind('click').click(function(e) {
        e.preventDefault();
        e.stopPropagation();
        $('.rcbSlide').toggle(200);
        $(this).toggleClass("active");
        $('.rcbItem').unbind('click').click(function() {
            var pageSize = $(this).text();
            $('#PageSizeComboBox_Input').val(pageSize);
            _currentSkip = parseInt(_currentSkip);
            _currentLimit = parseInt(_currentSkip) + parseInt(pageSize);
            tablePagination();
            showPageLoadingIndicator(true, true);
        });
        $(document).on('click', function(e) {
            if ($('.rcbSlide').has(e.target).length === 0) {
                $('.rcbSlide').hide();
            }
        });
    });
}

function pageTableInfo() {
    var pageSize = $('#PageSizeComboBox_Input').val();
    var totalItems = _totalItems.length;
    var currentPage = parseInt(_currentLimit) / (parseInt(_currentLimit) - parseInt(_currentSkip));
    var totalPages = parseInt(_totalItemsCount) / parseInt(pageSize);
    totalPages = parseFloat(Math.ceil(totalPages));
    var currentItems = parseInt(_currentSkip) + 1;
    var currentLimit = parseInt(_currentSkip) + totalItems;
    $('#currentPage').text(currentPage);
    $('#totalPages').text(totalPages);
    $('#currentItems').text(currentItems + " to " + currentLimit);
    $('#totalItems').text(_totalItemsCount);
}

function sortableTableBulkAction() {
    $('#bulkActions .delete').unbind('click').click(function() {

        var bulkActionArray = $('#sortableTable .rgRow input.selectRow');
        var repeatStop = 0;
        $.each(bulkActionArray, function(index) {
            if ($(this).is(":checked")) {
                var webAppItemID = $(this).attr('id');
                repeatStop = repeatStop + 1;
                webAppItemDelete(webAppItemID, repeatStop);
            }
        });
    });
}

function sortableTableBulkCheck() {
    $('.selectAllRows').change(function() {
        var bulkCheckArray = $('#sortableTable .rgRow input.selectRow');
        if ($(this).is(":checked")) {
            $.each(bulkCheckArray, function(index) {
                $(this).prop('checked', true);
            });
        } else {
            $.each(bulkCheckArray, function(index) {
                $(this).prop('checked', false);
            });
        }
    });
}

function viewReview() {
    $(document).on('click', '.viewReviewBtn', function() {
        $(this).closest('.rgRow').next().nextUntil('.rgRow', '.viewReview').toggle(200);
        if ($(this).text() === 'View') {
            $(this).text('Hide');
        } else {
            $(this).text('View');
        }
    });
}


/*$(document).ready(function() {
    $("#reviewEdit").bind({
        copy : function(){
        copyCut();
        },
        cut : function(){
        copyCut();
        }
});
});

 function copyCut() {
    window.localStorage.setItem("UpdateCode", "n");
    $('#reviewEdit').css("background-color", "#FFF");
    $('.alert.update-code').fadeOut(300);   
}*/

function saveCreate() {
    _reviewName = $("input[name='reviewName']").val();
    _reviewWebAppName = 'Review - ' + _reviewName;

    if (_reviewName === '') {
        alert('Please choose a name.');
        return;
    }
    var webApp = new BCAPI.Models.WebApp.App({
        name: _reviewWebAppName
    });
    webApp.fetch({
        success: function(data, response) {
            if (_reviewID === '-1') {
                alert('Review already exists. Please choose a different name.');
            } else {
                _callAction = 'save';
                saveChanges(_callAction);
                showPageLoadingIndicator(true, true);
            }
        },
        error: tryWebAppCreate
    });
}

function createAppAssets() {
    var folder = new BCAPI.Models.FileSystem.Folder('/_System/Apps/digifuel-review/_config/reviews_config/' + _reviewID);
    folder.create().done(function() {
        callsCompleted(); //create 4
    });

    var foptions = BCAPI.Models.FileSystem.Root.file('/_System/Apps/digifuel-review/_config/reviews_config/-1/review_options.json');
    foptions.download().done(function(content) {
        uploadAssets(content, 'review_options.json');
    }).error(function(jqXHR) {
        onAPIError(jqXHR);
    });

    var fwebapp = BCAPI.Models.FileSystem.Root.file('/_System/Apps/digifuel-review/_config/reviews_config/-1/review_webapp.json');
    fwebapp.download().done(function(content) {
        uploadAssets(content, 'review_webapp.json');
    }).error(function(jqXHR) {
        onAPIError(jqXHR);
    });

    function uploadAssets(content, file) {
        var f = new BCAPI.Models.FileSystem.File('/_System/Apps/digifuel-review/_config/reviews_config/' + _reviewID + '/' + file);
        var data = content;
        f.upload(data).done(function() {
            _i++;
            if (_i > 1) {
                saveChanges();
            }
            callsCompleted(); //create 5
        }).error(function(jqXHR) {
            onAPIError(jqXHR);
        });
    }

    var accessRightsSelectedCheckboxes = $('#accessRightsForm').find('input[type="checkbox"]:checked');

    var menuName = _reviewName.replace(/ /g, '_').replace(/[^a-z0-9 _]/gi, '');
    var menuNamelc = menuName.toLowerCase();
    var menuTitle = _reviewName.replace(/ /g, '_').replace(/[^a-z0-9 _]/gi, '').replace(/_/g, ' ');
    var menuWeight;
    var currentProperty = 'menu-' + menuNamelc;
    var webappHide = 'menu-webapp-review_-_' + menuNamelc;

    $.each(_currentMenuItems, function(menuItem, data) {
        var x = parseInt(data.weight);
        if (x === 10000) {
            x = 0;
        }
        if (!isNaN(x)) {
            menuWeight = x + 10;
        }
    });

    _currentMenuItems[currentProperty] = {};
    _currentMenuItems[currentProperty].parent = "menu-reviews";
    _currentMenuItems[currentProperty].weight = menuWeight;
    _currentMenuItems[currentProperty].title = menuTitle;
    _currentMenuItems[currentProperty].attr = {};
    _currentMenuItems[currentProperty].attr.href = "/Admin/AppLoader.aspx?client_id=digifuel-review&reviewID=" + _reviewID;
    _currentMenuItems[webappHide] = {};
    _currentMenuItems[webappHide].visible = false;

    var menuItemString = JSON.stringify(_currentMenuItems);
    _menuFileCopy.upload(menuItemString).done(function() {});

    _menuFile.upload(menuItemString).done(function() {
        try {
            window.parent.location.reload();
        } catch (e) {
            callsCompleted(); //create 6
        }
    });
}

//INPROGRESS
function addCustomFields() {

    _currentCustomFields[currentProperty] = {};
    _currentCustomFields[currentProperty].id = customFieldID;
    _currentCustomFields[currentProperty].name = customFieldName;
    _currentCustomFields[currentProperty].type = customFieldType;
    _currentCustomFields[currentProperty].required = customFieldRequired;

    var menuItemString = JSON.stringify(__currentCustomFields);

    _reviewWebApp.upload(menuItemString).done(function() {
        try {
            window.parent.location.reload();
        } catch (e) {
            callsCompleted(); //create 7
        }
    });
}

function saveChanges(_callAction) {
    /*Save Review Item List*/
    var reviewOptionStringJSON = [];
    var reviewOptionString = $("#form-system-field").sortable('toArray');
    var listArray = $('#form-system-field li:not(:eq(0))');

    /*window.localStorage.setItem("UpdateCode", "y");
    $('#reviewEdit').css("background-color", "#FFF9CC");
    $('.alert.update-code').fadeIn(300);*/

    $.each(listArray, function(index) {
        var weight = reviewOptionString[index].split('-');
        var itemname = $(this).attr("class");
        weight = weight[1];
        var required = $(this).find('.req').text().length;
        if (required > 0) {
            required = true;
        } else {
            required = false;
        }
        var visible = $(this).find('.sortable-item-toggle button span:eq(0)').hasClass(_invisibleGlyphiconClass) === false;
        var reviewStr = {
            itemname: itemname,
            weight: weight,
            required: required,
            visible: visible
        };
        reviewOptionStringJSON.push(reviewStr);
    });

    /*Save App Details*/
    var reviewDetailsName = $("#app-details-container .hybridFormContainer input[name='reviewName']");
    var reviewDetailsURL = $("#app-details-container .hybridFormContainer input[name='reviewURL']");
    var reviewNameVal = reviewDetailsName.val();
    var reviewURLVal = reviewDetailsURL.val();
    var reviewDetailsStr = {
        appDetails: {
            reviewName: reviewNameVal,
            reviewURL: reviewURLVal
        }
    };

    reviewOptionStringJSON.push(reviewDetailsStr);

    /*Save App Settings*/
    var appSettingsList = {};
    var appSettings = $('#app-settings-container input');
    appSettings.each(function(index) {
        if ($(this).is(':checkbox')) {
            if ($(this).is(":checked")) {
                var key = $(this).val();
                appSettingsList[key] = "true";
            } else {
                var key = $(this).val();
                appSettingsList[key] = "false";
            };
        } else {
            var key = $(this).attr('name');
            appSettingsList[key] = $(this).val();
        };
    });
    var appSettingsStr = appSettingsList;

    /*Save App Access Rights*/
    var accessRightsList = " ";
    var accessRightsStringJSON = [];
    var accessRights = $('#access-rights-container input');
    $.each(accessRights, function(index) {
        if ($(this).is(":checked")) {
            accessRightsList = $(this).val();
            accessRightsStringJSON.push(accessRightsList);
        };
    });
    var accessRightsStr = {
        accessRights: accessRightsStringJSON
    };
    reviewOptionStringJSON.push(accessRightsStr);

    /*Save Review Settings*/
    var customerTitle = $('#Title :selected').text();
    var reviewSettingsStr = {
        reviewSettings: {
            starDefault: _rating,
            customerTitle: customerTitle
        }
    };
    reviewOptionStringJSON.push(reviewSettingsStr);

    /*Stringify Review Settings*/
    reviewOptionString = JSON.stringify({
        reviews: reviewOptionStringJSON,
        appSettings: appSettingsStr
    }, null, 2);

    _reviewOptions = BCAPI.Models.FileSystem.Root.file('/_System/Apps/digifuel-review/_config/reviews_config/' + _reviewID + '/review_options.json');
    _reviewOptions.upload(reviewOptionString).done(function() {
        try {
            window.parent.location.reload();
        } catch (e) {
            createWebAppEdit();
            createWebAppList();
            /*if (_callAction !== "save") {
                createWebAppList();
            }*/
        }
    });

    _reviewOptionsPublic.upload(reviewOptionString);    
}

function deleteWebApp() {
    _callAction = 'delete';
    if (_reviewID !== '-1') {
        if (confirm("Are you sure you want to delete this customer review permanently?")) {
            //Ok button pressed...
            var app = new BCAPI.Models.WebApp.App({
                name: _reviewWebAppName
            });
            app.destroy({
                success: function(data, response) {
                    deleteWebAppFolder();
                },
                error: function(data, jqXHR, options) {
                    deleteWebAppFolder(); //TEMP BUG ERROR 200 WORKAROUND - delete 1
                    //onAPIError(data, jqXHR, options);
                }
            });

            var folder = new BCAPI.Models.FileSystem.Folder('/_System/Apps/digifuel-review/_config/reviews_config/' + _reviewID);
            folder.destroy().done(function() {
                callsCompleted(); //delete 1
            });
            deleteMenuItem();
        }
    }
}

function deleteWebAppFolder() {
    var folder = new BCAPI.Models.FileSystem.Folder('/Layouts/WebApps/' + _reviewWebAppName);
    folder.destroy().done(function() {
        callsCompleted(); //delete 2
    });
}

function editWebApp() {
    var webAppGet = _refGet.split('/Admin')[0];
    window.parent.location.href = webAppGet + '/Admin/CustomContent_ItemList.aspx?CustomContentID=' + _reviewID + '&t=t&CustomContent=Review+-+' + _reviewName;
}

function deleteMenuItem() {
    showPageLoadingIndicator(true, true);
    var menuItemName = _reviewName.replace(/ /g, '_').replace(/[^a-z0-9 _]/gi, '');
    var menuName = 'menu-' + menuItemName;
    menuName = menuName.toLowerCase();
    var menuNameWebapp = 'menu-webapp-review_-_' + menuItemName;
    menuNameWebapp = menuNameWebapp.toLowerCase();
    $.each(_currentMenuItems, function(menuItem) {
        if (menuItem === menuName || menuItem === menuNameWebapp) {
            delete _currentMenuItems[menuItem];
        }
    });

    var menuItemString = JSON.stringify(_currentMenuItems);
    _menuFileCopy.upload(menuItemString).done(function() {});

    _menuFile.upload(menuItemString).done(function() {
        try {
            window.parent.location.reload();
        } catch (e) {
            callsCompleted(); //delete 3
        }
    });
}

function getCustomer() {
    var request = $.ajax({
        url: '/webresources/api/v3/sites/current/customers?fields=email1,middleName,firstName,lastName&where={"username":"anonymousReviews"}',
        type: "GET",
        conenection: "keep-alive",
        contentType: "application/json",
        mimeType: "applicaiton/json ",
        headers: {
            "Authorization": $.cookie('access_token')
        }
    });
    request.done(function(msg) {
        if (msg.items.length == 0) {
            createCustomer();
        }
    })
    request.fail(function(jqXHR) {
        onAPIError(jqXHR);
    })
}

function createCustomer() {
    var request = $.ajax({
        url: "/webresources/api/v3/sites/current/customers",
        type: "POST",
        conenection: "keep-alive",
        contentType: "application/json",
        mimeType: "applicaiton/json ",
        processData: false,
        headers: {
            "Authorization": $.cookie('access_token'),

        },
        data: JSON.stringify({
            //"titleTypeId": 3054302,
            "firstName": "Anonymous",
            "lastName": "Reviews",
            "username": "anonymousReviews",
            "email1": {
                "value": "anonymousreviews@anonymousreviews.none",
                "default": true
            }
        })
    });
    request.done(function(msg) {
    })
    request.fail(function(jqXHR) {
        onAPIError(jqXHR);
    })
}

// ERROR SUCCESS FUNCTIONS
function onAPIError(data, jqXHR, options) {

    showPageLoadingIndicator(false);
    showErrorMessage(jqXHR, "API Error");
}

function showErrorMessage(xhr, title) {
    var errorMessage = "Unknown error.";
    if (xhr.responseText) {
        errorMessage = "Server error. Error code: " + JSON.parse(xhr.responseText).code;
    }
    systemNotifications.showError((typeof title != undefined) ? title : "Error", errorMessage);
}

function onReviewSuccess() {
    showPageLoadingIndicator(false);
    systemNotifications.showSuccess("Save successful", "Update Highlighted Review Form Code in your HTML");
    setTimeout(function() {}, 3000);
}

// Check all SDK API Calls are completed then take appropriate action
function callsCompleted() {
    _i++;
    if (_callAction === 'create') {
        if (_i === 7) {
            _i = 0;
            window.parent.location.href = _refGet + '?client_id=digifuel-review&reviewID=' + _reviewID;
        }
    }
    if (_callAction === 'delete') {
        if (_i === 3) {
            _i = 0;
            window.parent.location.href = _refGet + '?client_id=digifuel-review&reviewID=-1';
        }
    }
    if (_callAction === 'save') {
        if (_i === 2) {
            _i = 0;
            onReviewSuccess();
        }
    }
}

// show - boolean show or hide loading indicator
function showPageLoadingIndicator(show, semiopaque) {
    if (show) {
        $(".loading").show(); // show the loading indicator
        if (semiopaque) {
            $(".loading").addClass("semiopaque");
        } else {
            $(".loading").removeClass("semiopaque");
        }
    } else {
        $(".loading").hide(); // hide the loading indicator
    }
}

// JS GO
$(function() {
    'use strict';
    showPageLoadingIndicator(true);
    $('button.save').click(function() {
        saveCreate();
    });
    $('button.delete').click(function() {
        deleteWebApp();
    });
    $('button.editWebApp').click(function() {
        editWebApp();
    });

    $.ajax({
        dataType: "json",
        url: '/api/v2/admin/sites/' + BCAPI.Helper.Site.getSiteId() + '/roles',
        beforeSend: function(xhr) {
            xhr.setRequestHeader("Authorization", BCAPI.Helper.Site.getAccessToken());
        },
        success: function(data) {
            $.each(data.items, function(index, element) {
                $('#access-rights-container').find('' +
                    '.controls').append('<label><input type = "checkbox" value="' + element.name + '">' + element.name + '</input></label>');
            });
        }
    });
    loadReviews();
});