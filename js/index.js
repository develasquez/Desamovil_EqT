var app = {
    initialize: function() {
        this.bindEvents();
    },
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
        scanner = cordova.require("cordova/plugin/BarcodeScanner");

    },
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');
        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');
    }
};
var scanner ;

var desamovil = {
    owner:'@fvelasquezc',
    version:'1.0.0',
    date:'24/08/2014',
    newScanSeries:function () {
        $("#txtResultado1").val("");
        $("#txtResultado2").val("");
        $(".correct").text("0");
        $(".errors").text("0");
        desamovil.pageShow('#main')
    },
    scan : function(target) {
        scanner.scan(function(result) {
            alert(result.text);
                    //    $(target).val(result.text);
        },function () {
            
        });
    },
    pageShow:function (page) {
        $(page).show();
        $(page).animate({"margin-left": -window.innerWidth});
    },
    pageClose:function (page) {
        $(page).animate({"margin-left": 0},function () {
            setTimeout(function () {
                $(page).hide();
            },200)
        });
    }  
}

usuario={
    getUsers:function (fun) {
        
    },
    setUser:function(fun){

    },
    findUser:function (p_user,p_password,fun) {

    },
    deleteUser:function(p_user,fun){

    }
}


monomer.setInterval= function (_window,_content,em) {
    $(".page").css({"left":_window.width,"top":(0 + (em * 3)+14)});
}
