var _name;
var _groupSelect;
var _groupFirst = true;
var loggedin = false;

jQuery(document).ready(function($) {

    //if {tag_grouping} is present
    if($("select[name='AddToCart_Grouping']").length) {
        if(readCookie('dfBCReview') === null){
            createCookie('dfBCReview', $('#CAT_Custom_10.cat_textbox').val() + '-' + $('#CAT_Custom_20.cat_textbox').val(), 0);
        }

        _groupSelect = $("select[name='AddToCart_Grouping']").val();
        if(_groupSelect !== $("select[name='AddToCart_Grouping'] option:first-child").val()){
            _groupFirst = false;
        }
    }
    //reload review for grouped products select
    $(document).on('change',"select[name='AddToCart_Grouping']",function () {
        _groupSelect = $("select[name='AddToCart_Grouping']").val();
        loadReview();
    });

    loadReview();

    function loadReview() {

        _name = $('.cat_textbox.customerName').val();

        var curAvg = parseInt($('span.average').text(), 10) || 0, //from backup list view
            curTot = parseInt($('input.cat_textbox.totReviews').val(), 10) || 0
            realSum = parseInt($('span.votes').attr('data-sum'), 10) || 0, //sum of all ratings - from backup list view
            today = new Date(), // todays date
            tagName = $('#CAT_Custom_20').val(), // tag_name
            tagID = $('#CAT_Custom_10').val(), // tag_name
            formUpdate = function() {

                //Get the new avg
                var newRating = parseInt($('.cat_textbox.ratingSelect').val(), 10), // selected in the form
                    newSum = realSum + newRating, //new rating plus all ratings
                    newAvg;
                if (curTot == 0) {
                    newAvg = 0;
                } else {
                    newAvg = Math.round(newSum / curTot);
                };


                //Update Hidden Fields
                $('.cat_textbox.avgRating').val(newAvg);
                $('.cat_textbox.realSum').val(newSum);

                if ($('.cat_textbox.customerName').val()) {
                    $('#ItemName').val(_name + ' - User - ' + today + ' - ' + tagID + ' - ' + tagName);
                } else {
                    $('#ItemName').val('Anonymous - ' + today + ' - ' + tagID + ' - ' + tagName);
                }

            };

        //Remove Recommended if unticked
        $('#reviewsList .item.checkbox div').each(function() {
            if ($(this).text() === "0") {
                $(this).parent().remove();
            }
        });

        //Remove blanks
        $('#reviewsList .item').not('.checkbox').each(function() {
            var nameTxt = $(this).children().text();
            var allTxt = $(this).text();
            if (nameTxt === allTxt) {
                $(this).remove();
            }
        });

        //Rating on load
        $('.review-rating .form-rating.selected').each(function(index, element) {
            if (index > 0) {
                var rating = index + 1;
                $('.cat_textbox.ratingSelect').val(rating);
                $('#yourrating').text(rating + ' Stars');
                formUpdate();
            }
        });

        //Star Rating Be first to review	
        if (realSum <= 0) {
            $('div.no-reviews').show();
        }

        //If Answer - Customer Name
        $('.cat_textbox.customerName').on('change', function() {
            _name = $(this).val();
            if ($('#anonymousReviews').text() === 'a') {
                $('#ItemName').val(_name + ' - Anonymous - ' + today + ' - ' + tagID + ' - ' + tagName);
            } else {
                $('#ItemName').val(_name + ' - Disguised User - ' + today + ' - ' + tagID + ' - ' + tagName);
            }
        });

        $('.hreview-aggregate ul').remove(); //remove pagination

        //display reviews
        $('#reviewSubmit').on('click', function(e) {
            e.preventDefault();
            $('#reviewsList,#reviewSubmit').fadeOut(200);
            $('#reviewForm,#readReviews').fadeIn(200);
        });
        $('#readReviewsTop, #reviewsTop').on('click', function(e) {
            e.preventDefault();
            $('#reviewForm,#readReviews').fadeOut(200);
            $('#reviewsList,#reviewSubmit').fadeIn(200);
            $("html, body").animate({
                scrollTop: $("#reviews").offset().top
            });
        });

        //display review form
        $('#readReviews').on('click', function(e) {
            e.preventDefault();
            $('#reviewForm,#readReviews').fadeOut(200);
            $('#reviewsList,#reviewSubmit').fadeIn(200);
        });

        $('#reviewSubmitTop').on('click', function(e) {
            e.preventDefault();
            $('#reviewsList,#reviewSubmit').fadeOut(200);
            $('#reviewForm,#readReviews').fadeIn(200);
            $("html, body").animate({
                scrollTop: $("#reviews").offset().top
            });
        });

        //Rating Replaces Select
        $('.form-rating').on('click', function() {
            var rating = $(this).text();
            if ($(this).siblings('#yourrating').length) {
                $('#yourrating').text(rating + ' Stars');
            }
            $(this).siblings('.rating-select').children('.cat_textbox.ratingSelect').val(rating);
            formUpdate();
            $(this).siblings('.form-rating').andSelf().each(function() {
                var $this = $(this);
                var star = $this.text();
                if (star <= rating) {
                    $this.addClass('selected');
                } else {
                    $this.removeClass('selected');
                }
            });
        });

    }

    function anonymousUser() {
        // Anonymous user login (if customer is not logged in)
        var today = new Date(), // todays date
            tagName = $('h1').text();
        $.post('/ZoneProcess.aspx?ZoneID=-1', {
            Username: 'anonymousReviews',
            Password: 'dvjoKb9BCHA1'
        });
        $('#ItemName').val('Anonymous - ' + today + ' - ' + tagName);
    }

    $('#reviewForm input, #reviewForm textarea').one('input',function(e){
        if ($("#anonymousReviews").text() === "0") {
            var value = $(this).val();
            if ( value.length > 2 ) {
                loggedin = true;
                anonymousUser();
            }
        }
    });

    $( "#reviewForm form" ).submit(function(e) {
        if ($("#anonymousReviews").text() === "0") {
            if (loggedin == false ) {
                anonymousUser();
            }
        }
    });
          
});

//delete cookie created for grouped products
window.onbeforeunload = function(){
    if(jQuery("select[name='AddToCart_Grouping']").length) {
        if(_groupSelect === jQuery("select[name='AddToCart_Grouping'] option:first-child").val()){
            if(_groupFirst == true){
                eraseCookie('dfBCReview');
            }
        }
    }
};