var app = {
    initialize: function() {
        this.bindEvents();
    },
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
    },
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');
        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');
    }
};
var desamovil = {
    owner:'@fvelasquezc',
    version:'1.0.0',
    date:'24/08/2014',
    scan : function(target,fun,err) {

        if(typeof target === "function"){fun = target; target = '' ;}
        if(target.length > 0 && fun == undefined){
            fun = function (result) {
                alert(result.text)
                $(target).val(result.text);
            }
        }
        var scanner = cordova.require("cordova/plugin/BarcodeScanner");
        scanner.scan(fun,err);
    },
    pageShow:function (page) {
        debugger;
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