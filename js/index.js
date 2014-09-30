var app = {
    initialize: function() {
        this.bindEvents();
    },
    bindEvents: function() {
        document.ºEventListener('deviceready', this.onDeviceReady, false);
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
    db = window.openDatabase("EqualTracer_2", "1.0", "EqualTracer_2", 20971520);
    db.transaction(function(tx){
        tx.executeSql('CREATE TABLE IF NOT EXISTS Usuarios (id INTEGER PRIMARY KEY, fullNombre VARCHAR, userName VARCHAR, password VARCHAR, lastLogin )');
        tx.executeSql('CREATE TABLE IF NOT EXISTS Formatos (id INTEGER PRIMARY KEY, nombre VARCHAR, configJSON VARCHAR)');
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
                desamovil.pageShow("#login"); //nuevoFormato

            }
        }
    })

    $("#btnPrev").on("touchend",function(){
        formatos.prevChar()
    })
    $("#btnNext").on("touchend",function(){
        formatos.nextChar()
    })

    $("#btnIgnorear").on("touchend",function(){
        formatos.ignoreChar()
    })
    $("#btnExacto").on("touchend",function(){
        formatos.exactChar()
    })
    $("#btnVariable").on("touchend",function(){
        formatos.variableChar()
    })
    $("#btnSeparador").on("touchend",function(){
        formatos.dividerChar()
    })

    $("#btnCrearFormato").on("touchend",function(){
        formatos.saveFormat(function(tx,results){
            alert("El formato ha sido registrado con éxito");
        })
    })

    //Datos de Prueba 
    formatos.displayFormat({text:"SA-161358533-4748"})
    //Datos de Prueba 


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
                                        formatos.loadFormats();
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
var comparationType ={
    IGNORE:0,
    EXCACT:1,
    VARIABLE:2,
    DIVIDER:3
};



var formatos={
    currentCharIndex:0,
    currentChar:'',
    charCount:0,
    comparationTypeSelected:comparationType.EXCACT,
    textScanned:'',
    name:'',
    configuration: {
        length:0,
        caracters:[],
        config:[],
        divider:''
    },
    addFormat:function(){
        desamovil.pageShow('#nuevoFormato')
        desamovil.scan("#txtNewFormat",formatos.displayFormat);
    },
    displayFormat:function(result,target){
        if(target == undefined){
            target = "#h3ForatCreator";
        }
        $(target).html("");
        for (var i = 0; i < result.text.length; i++) {
            var newChar = result.text.substring(i,i+1);
            $(target).append($("<i>").text(newChar).addClass("char"));
            ln = formatos.configuration.caracters.length;
            formatos.configuration.caracters[ln] = newChar;
            formatos.configuration.config[ln] = 0;
        };
        $($(".char")[0]).addClass("charSelected");
        formatos.currentChar = $($(".char")[0]).text();
        formatos.textScanned = result.text;
        $("#lblForatCreator").text(formatos.textScanned);
        formatos.charCount = formatos.textScanned.length;
    },
  	saveFormat:function(fun){
        if($("#txtNewFormat").val().length == 0  ){
            alert("Debe establecer un nombre para el Formato");
            $("#txtNewFormat").focus();
        }else{
    	//gurdar informacion de la configuracion en la bd
            db.transaction(function(tx){
                tx.executeSql('insert into Formatos (nombre, configJSON) values (?,?)', [$("#txtNewFormat").val(),JSON.stringify(formatos.configuration) ], function(tx, results) { 
                    fun(tx,results)
                });
            }) 
        }
    },
    setFormat:function(element){
        //1º Leer BD y formato solicitado.

        //2º Se establece el valor en pantalla
        formatos.displayFormat(element,".estructuraFormato");
        //3º se carga algoritmo de validacion.
        
    },
    loadFormats:function(){
        db.transaction(function(tx){
                tx.executeSql('select id, nombre, configJSON  from Formatos ', [], function(tx, results) { 
                    for (i=0;i<results.rows.length ;i++){
                        var row = results.rows.item(i);
                        if(row.Cant == 0 ){
                            alert("Debe crear un formato de Comparación");
                            desamovil.pageShow("#nuevoFormato"); 
                        }else{
                            $("#listaFormatos").append($(listaItem(row)).data("data",JSON.stringify(row)));
                        }
                    }
                    $(".liFormato").on("touchend",function(){
                        var row = JSON.parse($(this).data("data"));
                        formatos.setFormat(row);
                    })
                });
            }) 
    },
    setComparationType:function(type){
        formatos.comparationTypeSelected = type;
    },
    nextChar:function(){
        if(formatos.currentCharIndex < formatos.charCount){
            formatos.currentCharIndex++;
            formatos.currentChar = formatos.textScanned.substring(formatos.currentCharIndex,formatos.currentCharIndex +1);
            $(".char").removeClass("charSelected");
            $($(".char")[formatos.currentCharIndex]).addClass("charSelected");
        }
    },
    prevChar:function(){
        if(formatos.currentCharIndex > 0){
            formatos.currentCharIndex--;
            formatos.currentChar = formatos.textScanned.substring(formatos.currentCharIndex,formatos.currentCharIndex + 1);
            $(".char").removeClass("charSelected");
            $($(".char")[formatos.currentCharIndex]).addClass("charSelected");
        } 
    },
    ignoreChar:function(){
        var charElement = $($(".char")[formatos.currentCharIndex])
            charElement.removeClass("color-red")
                       .removeClass("color-green")
                       .removeClass("color-indigo")
                       .addClass("color-grey");
        
        formatos.configuration.config[formatos.currentCharIndex] = comparationType.IGNORE;
        formatos.nextChar();
    },
    exactChar:function(){
         var charElement = $($(".char")[formatos.currentCharIndex])
            charElement.removeClass("color-grey")
                       .removeClass("color-green")
                       .removeClass("color-indigo")
                       .addClass("color-red");
            
            formatos.configuration.config[formatos.currentCharIndex] = comparationType.EXCACT;
            formatos.nextChar();
    },
    variableChar:function () {
         var charElement = $($(".char")[formatos.currentCharIndex])
            charElement.removeClass("color-red")
                       .removeClass("color-grey")
                       .removeClass("color-indigo")
                       .addClass("color-green");
        
            formatos.configuration.config[formatos.currentCharIndex] = comparationType.VARIABLE;
            formatos.nextChar();
    },
    dividerChar:function () {
         var charElement = $($(".char")[formatos.currentCharIndex])
            charElement.removeClass("color-red")
                       .removeClass("color-grey")
                       .removeClass("color-green")
                       .addClass("color-indigo");
        
            formatos.configuration.config[formatos.currentCharIndex] = comparationType.DIVIDER;
            formatos.nextChar();
    }

}



monomer.setInterval= function (_window,_content,em) {
    //$(".page").css({"left":_window.width,"top":(0 + (em * 3)+14)});
}

var listaItem = function(element){ 
                    debugger;
                    return['<a id="'+element.id+'" href="#" class="liFormato">',
                            '    <li>',
                            '        <div>',
                            '            <div class="test_box fab z-d1">',
                            '                <i class="icon-arrow-left"></i>',
                            '            </div>',
                            '        </div>',
                            '        <div>',
                            '            <div>',
                            '                <h3>'+element.nombre+'</h3>',
                            '                <p>'+JSON.parse(element.configJSON).textScanned+'</p>',
                            '            </div>',
                            '        </div>                ',
                            '    </li>',
                            '</a>'].join("\n");
                }