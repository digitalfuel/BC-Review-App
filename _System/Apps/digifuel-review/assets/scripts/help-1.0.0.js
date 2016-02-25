//global vars
var _refGet = window.sessionStorage.getItem("reviewURL");
var _menuFile = BCAPI.Models.FileSystem.Root.file('/_System/Apps/digifuel-review/_config/menu.json');
var _currentMenuItems;
var _mainAppFolder = new BCAPI.Models.FileSystem.Folder('/_System/Apps/digifuel-review');
var _appFolder = new BCAPI.Models.FileSystem.Folder('/digifuel-review');

//Q&A Contact Expand
$(function() {
    $('.Q a').unbind('click').click(function() {
        $(this).parent().next().toggle(200);
        $(this).parent('.expand, .contract').toggleClass('contract expand');
    });
});

//Delete App
function loadReviews() {
    _menuFile.download().done(function(content) {
        _currentMenuItems = $.parseJSON(content);
    });
}

function uninstallApp() {
    var prompt = window.prompt('To confirm type UNINSTALL - WARNING!!! This action cannot be undone.');
    if (prompt === 'UNINSTALL') {
        DELETE();
    } else if (prompt == null) {} else {
        window.alert('You must type \'UNINSTALL\' (case sensitive to proceed.)');
    }
}

function deleteApp() {
    var prompt = window.prompt('Type DELETE to confirm delete app & review data - WARNING!!! This action cannot be undone.');
    if (prompt === 'DELETE') {
        var x = 'X';
        DELETE(x);
    } else if (prompt == null) {} else {
        window.alert('You must type \'DELETE\' (case sensitive to proceed.)');
    }
}

function DELETE(x) {
    var i = 0;
    $.each(_currentMenuItems, function(menuItem, data) {
        var webAppName = data.title;
        if (x === 'X') {
            i++;
            if (i > 1 && typeof webAppName !== 'undefined') {
                deleteWebApps(webAppName);
            }
        }
    });

    _appFolder.destroy().done(function() {});

    mainAppFolder();

    function mainAppFolder() {
        _mainAppFolder.destroy().done(function() {
            var webAppGet = _refGet.split('/Admin')[0];
            window.parent.location.href = webAppGet + '/Admin/Dashboard_Business.aspx';
        });
    }

    function deleteWebApps(webAppName) {
        webAppName = 'Review - ' + webAppName;
        var app = new BCAPI.Models.WebApp.App({
            name: webAppName
        });
        app.destroy({
            success: function(webAppItem, response) {
                deleteWebAppFolder(webAppName);
            },
            error: function(webAppItem, jqXHR, options) {
                deleteWebAppFolder(webAppName);
            }
        });
    }

    function deleteWebAppFolder(webAppName) {
        var webAppFolder = new BCAPI.Models.FileSystem.Folder('/Layouts/WebApps/' + webAppName);
        webAppFolder.destroy().done(function() {});
    }

}
