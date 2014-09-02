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

var db = null;
$(function(){
    db = window.openDatabase("EqualTracer", "1.0", "EqualTracer", 20971520);
    db.transaction(function(tx){
        tx.executeSql('CREATE TABLE IF NOT EXISTS Usuarios (id unique, fullNombre, userName, password, lastLogin)');
        tx.executeSql('CREATE TABLE IF NOT EXISTS Formatos (id unique, nombreFormato, estructura)');
    }, function(err){}, function(tx,results){

    }) 
    desamovil.pageShow("#main");

    //1 Leer existencia de Usuarios. 
    usuario.getUsers(function (tx,results) {
        for (i=0;i<results.rows.length ;i++){
            var row = results.rows.item(i);
            if(row.Cant == 0 ){
                alert("Debe crear un usuario");
                desamovil.pageShow("#crearUsuario");
            }else{
                $(".header").hide();
                desamovil.pageShow("#login");

            }
        }
    })

    //2 Crear Usuario si no existe.
    //3 Solicitar Login.

    //Listar Formatos Existes
    //



});






var desamovil = {
    owner:'@fvelasquezc',
    version:'1.0.0',
    date:'24/08/2014',
    newScanSeries:function () {
        $("#txtResultado1").val("");
        $("#txtResultado2").val("");
        $(".correct h1").text("0");
        $(".errors h1").text("0");
        desamovil.pageShow('#main')
    },
    nuevoUsuario:function () {
        debugger;
        usuario.setUser({
            nombre:$("#txtNuevoUsuario").val(),
            password:$("#txtNuevoPassword").val()
        },function (tx,result) {
            alert("Usuario creado con exito");
            desamovil.pageShow("#login");
        })
    },
    login:function(){
        usuario.findUser(   $("#txtUsuario").val(),
                            $("#txtPassword").val()
                            ,function (tx,results) {
                                for (i=0;i<results.rows.length ;i++){
                                    var row = results.rows.item(i);
                                    if(row.Cant > 0 ){
                                        $(".header").show();
                                        desamovil.pageShow("#main");
                                    }else if(row.Cant == 0){
                                        alert("Usuario o Contraseña Incorrecto");
                                    }
                                }
                            }
                        )
    },
    scan : function(target,_fun) {
        var scanner = cordova.require("cordova/plugin/BarcodeScanner");
        scanner.scan(function(result) {
            $(target).val(result.text);
            _fun(result);
        },function () {
            
        });
    },
    clean: function (element) {
      $(element).val("");
      $(element).focus();
    },
    pageShow:function (page) {
        $(".page").hide();
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
        db.transaction(function(tx){
            tx.executeSql('SELECT count(1) as Cant FROM Usuarios', [], function(tx, results) { 
                fun(tx,results)
            });
        }) 
    },
    setUser:function(user,fun){
        db.transaction(function(tx){
            tx.executeSql('INSERT into Usuarios (fullNombre, userName, password, lastLogin) values (?,?,?,?)', [user.nombre,user.nombre,user.password,new Date()], function(tx, results) { 
                fun(tx,results)
            });
        }) 
    },
    findUser:function (p_user,p_password,fun) {
        db.transaction(function(tx){
            tx.executeSql('SELECT count(1) as Cant FROM Usuarios where userName = ? and password = ?', [p_user,p_password], function(tx, results) { 
                fun(tx,results)
            });
        }) 
    },
    deleteUser:function(p_user,fun){
      db.transaction(function(tx){
            tx.executeSql('DELTE FROM Usuarios where userName = ?', [p_user], function(tx, results) { 
                fun(tx,results)
            });
        })

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
