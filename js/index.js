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
$(function(){
    db = window.openDatabase("EqualTracer", "1.0", "EqualTracer", 20971520);
    db.transaction(function(tx){
        tx.executeSql('CREATE TABLE IF NOT EXISTS Usuarios (id unique, fullNombre, userName, password, lastLogin)');
        tx.executeSql('CREATE TABLE IF NOT EXISTS Formatos (id unique, nombreFormato, estructura)');
    }, function(err){}, function(tx,results){

    }) 
                
});






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
    scan : function(target,_fun) {
        var scanner = cordova.require("cordova/plugin/BarcodeScanner");
        scanner.scan(function(result) {
            $(target).val(result.text);
            _fun(result);
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
comparationType ={
    EXCACT:0,
    IGNORE:1,
    VARIABLE:2,
};


formatos={
    currentCharIndex:0,
    currentChar:'',
    charCount:0,
    comparationTypeSelected:comparationType.EXCACT,
    textScanned:'',
    addFormat:function(){
        desamovil.pageShow('#nuevoFormato')
        desamovil.scan("#txtNewFormat",function(result){
            formatos.textScanned = result.text;
            $("#lblForatCreator").text(formatos.textScanned);
            formatos.charCount = formatos.textScanned.length;
        });
    },
    setComparationType:function(type){
        formatos.comparationTypeSelected = type;
    },
    nexChar:function(type){
        formatos.currentChar = formatos.textScanned.subString(formatos.currentCharIndex,1);
        formatos.currentCharIndex++;
    }

}

monomer.setInterval= function (_window,_content,em) {
    $(".page").css({"left":_window.width,"top":(0 + (em * 3)+14)});
}
