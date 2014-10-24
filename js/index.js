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
                tx.executeSql('insert into Formatos (nombre, configJSON) values (?,?)', ["Automatico",JSON.stringify(formatos.configuration) ]);
                localStorage.setItem("lastFormat",1);
                alert("Debe crear un usuario");
                desamovil.pageShow("#crearUsuario");
            }else{
                $(".header").hide();
                desamovil.pageShow("#login"); //nuevoFormato
                formatos.getFormatsById(localStorage.getItem("lastFormat"),function (row) {
                    formatos.configuration = JSON.parse(row.configJSON);
                    $(".nombreFormato").text(row.nombre);
                })
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
    $("#btnAddSeccion").on("touchend",function(){
        formatos.addSecction()
    })
    $("#btnRemoveSeccion").on("touchend",function(){
        formatos.removeSection()
    })

    $("#btnCrearFormato").on("touchend",function(){
        formatos.saveFormat(function(tx,results){
            formatos.loadFormats();
            alert("El formato ha sido registrado con éxito");
        })
    })




    //Datos de Prueba 
    ////formatos.displayFormat({text:"SA-161358533-4748"})
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
            formatos.configuration.text = result.text;
            _fun(result);
        },function () {
            
        }, { quality: 100 });
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
        text:'',
        length:0,
        caracters:[],
        config:[],
        divider:'',
        sections:[]

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
        currentCharIndex=0;
        currentChar='';
        charCount=0;
        comparationTypeSelected=comparationType.EXCACT;
        textScanned='';
        formatos.configuration= {
            text: result.text,
            caracters:[],
            config:[],
            sections:[]
        }
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
        $(".nombreFormato").text(formatos.name);
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
    getFormatsById:function (id,fun) {
        db.transaction(function(tx){
            tx.executeSql('select id, nombre, configJSON  from Formatos where id = ?', [id], function(tx, results) { 
                    for (i=0;i<results.rows.length ;i++){
                        var row = results.rows.item(i);
                        fun(row);
                    }
                });
        })
    },
    loadFormats:function(){
        $("#listaFormatos a").remove();
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
                        formatos.configuration = JSON.parse(row.configJSON);
                        formatos.name = row.nombre;
                        formatos.setFormat(formatos.configuration);
                    })
                });
            }) 
    },
    setComparationType:function(type){
        formatos.comparationTypeSelected = type;
    },
    compare:{
        auto: function (s1,s2) {
            if(s2.indexOf(s1) == 0 ){
                return true;
            }else{
                return false;
            }
        },
        custom:function (s1,s2,config) {
            //Se entiende que el Primer Codigo coincide con la Logica Seleccionada en cada seccion.
            //A35;   mm
            //A3 ;   
            

        }

    }

   /* function () {




        var match = true;
        var mensaje = '';
        var divider = formato.configuration.divider;
        var sections = formato.configuration.sections;
        var caracters = formato.configuration.caracters;
        var config = formato.configuration.config;
        var validacionSecciones = [];
        if(formato.configuration.sections.length > 0){
            var s1 = $("#txtResultado1").val().split(divider);
            var s2 = $("#txtResultado2").val().split(divider);
             for (var i = 0; i < sections.length - 1; i++) {
                //recorremos Cada letra de la seccion.
                var bubble = s1[1].substring(0,1);
                var equals = true;
                for(var j = 0 ; j< s1[1].length; j++){
                    if(bubble != config[sections[i]+(j+1)]){
                        equals = false;
                    }
                }
                if (equals)





                   try{


                        try{
                            validacionSecciones[i] = config[sections[i]+1];
                        }
                        catch(ex){
                            validacionSecciones[i] = comparationType.VARIABLE;
                        }

                        if (validacionSecciones[i] == comparationType.EXCACT){

                            if (s1[i] != s2[i]){
                                match = false;
                            }
                        }
                        if (validacionSecciones[i] == comparationType.VARIABLE){

                            if (s1[i] != s2[i]){
                                match = true;
                            }
                        }
                    }catch(ex){
                        match = false;
                    }
                }





        }
    }*/
    ,
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
    addSecction:function () {
         var charElement = $($(".char")[formatos.currentCharIndex])
            charElement.removeClass("color-red")
                       .removeClass("color-grey")
                       .removeClass("color-green")
                       .addClass("color-indigo");

            //Al usar Dividers creamos secciones del Codigo para analizar.
            //Revisamos si comiensa con un divider, de lo contrartio setemos en -1 el primer divider Imaginario.
            debugger;
            if (formatos.currentCharIndex > 0 ){
                formatos.configuration.sections[0] = -1
            }else{
                formatos.configuration.sections[formatos.configuration.sections.length] = formatos.currentCharIndex
            }                  
            formatos.configuration.config[formatos.currentCharIndex] = comparationType.DIVIDER;
            formatos.nextChar();
    },
    removeSecction:function () {
         var charElement = $($(".char")[formatos.currentCharIndex])
            charElement.removeClass("color-red")
                       .removeClass("color-grey")
                       .removeClass("color-green")
                       .removeClass("color-indigo");

            if(formatos.configuration.config[formatos.currentCharIndex] == comparationType.DIVIDER){
                var index = formatos.configuration.sections.indexOf(formatos.currentCharIndex);
                if (index > -1) {
                    formatos.configuration.sections.splice(index, 1);
                }
            }          
    }

}



monomer.setInterval= function (_window,_content,em) {
    //$(".page").css({"left":_window.width,"top":(0 + (em * 3)+14)});
}

var listaItem = function(element){ 
                
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
                            '                <p>'+JSON.parse(element.configJSON).text+'</p>',
                            '            </div>',
                            '        </div>                ',
                            '    </li>',
                            '</a>'].join("\n");
                }