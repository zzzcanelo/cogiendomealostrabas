$('#clasico').hide();
$('#full').hide();
$("#contenedorOpcionesPrepago").hide();
$("#contenedorOpciones_Kit_Prepago").hide();
$("#contenedorOpcionesPosPago").hide();
$("#contenedoPromociones-segmentadas").hide();
$("#div-banner").hide();
window.localStorage.clear();
let isPrefull = false;

function eligeOpcion(pagina) {    
    if (pagina == 'Recargas.aspx') {

        console.log(moment().format('dddd'));
        console.log(moment().format('LT'));
        console.log(moment().format('h'));
        console.log(moment().endOf('day').fromNow());

        var day = moment().format('dddd').toLowerCase();
        var hour = parseInt(moment().format('H'));

        console.log(`day: ${day}`);
        console.log(`hour: ${hour}`);

        if ((day == 'saturday' || day == 'sunday') && hour >= 17) {
            $("[id*='HiddenPaginaDestino']").val(pagina);
            $("[id*='btnEnviar']").click();
        }   

        getPromiseForGet($('#universe-api').val() + '/TelcomGestion/GetPromocionesbyAbonado?abonado=' + window.WinNumeroAbonado)
            .done(function (data) {
                if (data && data.length > 0) {
                    cargarPromocionesSegmentadas(data, window.ListaNegra);
                }
                else {
                    $("[id*='HiddenPaginaDestino']").val(pagina);
                    $("[id*='btnEnviar']").click();
                }
            })
            .fail(function (error) {
                $("[id*='HiddenPaginaDestino']").val(pagina);
                $("[id*='btnEnviar']").click();
            });               
    }
    else
    {   
        $("[id*='HiddenPaginaDestino']").val(pagina);
        $("[id*='btnEnviar']").click();
    } 
}

function getPromiseForGet(url) {
    return $.ajax({
        url: url,
        method: "GET",
        dataType: "json",
        crossDomain: true,
        contentType: "application/json; charset=utf-8",
        cache: false,
        beforeSend: function (xhr) {
            xhr.setRequestHeader("Authorization", "Bearer " + $('#universe-token').val());
        }
    });
}

$("#BtnContinuar").on("click", function () {
    $("[id*='HiddenPaginaDestino']").val('Recargas.aspx');
    $("[id*='btnEnviar']").click();
});

function EligeNumeroAbonado(nroAbonado, categoria, nombre, numeroDNI) {
    window.WinNombre = nombre;
    window.WinDNI = numeroDNI;
    window.WinNumeroAbonado = nroAbonado;
    window.Wincategoria = categoria;
    $("[id*='HiddenCategoria']").val(categoria);

    PageMethods.DeterminarPrePagoPospago(nroAbonado, OnSuccess, OnFailure);
}

function OnSuccess(result) {
    $.get('../api/listanegra?nroabonado=' + window.WinNumeroAbonado + '&dni=' + window.WinDNI)
        .done(function (estaEnLaListaNegra) {
            window.ListaNegra = estaEnLaListaNegra;
            $("[id*='ContenedorAbonado']").hide();

            if (result === 'PREPAGO') {
                getSaldo(window.WinNumeroAbonado);
                cargarOpcionesPrepago(estaEnLaListaNegra);                
                $('#clasico').show();
            }
            else if (result === 'PREPAGO FULL') {
                getSaldo(window.WinNumeroAbonado);
                cargarOpcionesPrepago(estaEnLaListaNegra);
                $('#full').show();
                isPrefull = true;
            }
            else if (result === 'KIT PREPAGO') {
                cargarOpcionesKitPrepago(estaEnLaListaNegra);
            }
            else if (result === 'POSPAGO') {
                cargarOpcionesPospago(estaEnLaListaNegra);
            }
        });
}

function getSaldo(nroAbonado) { 
    let urlDias = $('#payments-api').val() + '/saldos/dias?nroAbonado=' + nroAbonado;
    let token = $('#payments-token').val();
    getAjax(urlDias, token)
        .done(setDiasDisponibles);
}

function setDiasDisponibles(dias) {
    const defaultDias = "0 días";
    const messageDisponible = '';
    const keyBasico = 'el servicio BÁSICO permanecerá activo durante';
    const keyFull = 'el servicio Full permanecerá activo durante';
    let diasPlanBasico = _.trim(dias[keyBasico]) || _.trim(dias[keyFull]);

    diasPlanBasico = (diasPlanBasico || defaultDias) + messageDisponible;

    let diasPlanCinePremium = (_.trim(dias["pendiente PPBOX PELICULAS"]) || defaultDias) + messageDisponible;
    let diasPlanAdultos = (_.trim(dias["pendiente PPBOX ADULTOS"]) || defaultDias) + messageDisponible;
    let diasPlanFutbolHd = (_.trim(dias["pendiente PPBOX FUTBOL"]) || defaultDias) + messageDisponible;
    let diasPlanDecoAdicional = (_.trim(dias["pendiente PPBOX DECO ADIC."]) || defaultDias) + messageDisponible;
   
    if (isPrefull) {
        $('#dias-full').text(diasPlanBasico);
        $('#dias-futbol-full').text(diasPlanFutbolHd);
        $('#dias-deco-full').text(diasPlanDecoAdicional);
    } else {
        $('#dias-basico').text(diasPlanBasico);
        $('#dias-futbol').text(diasPlanFutbolHd);
        $('#dias-deco').text(diasPlanDecoAdicional);
        $('#dias-cine').text(diasPlanCinePremium);
        $('#dias-adultos').text(diasPlanAdultos);
    }           
}

function cargarPromocionesSegmentadas(data, estaEnLaListaNegra)
{    
    $("#divpromossegmentadas").empty();
    $.each(data, function (key, value) {
        var pictureUrl = "imgPromociones/" + value.codigo + '/' + value.nombreImagen;
        if (imageExists(pictureUrl))
        {
            $("#divpromossegmentadas").append('<div class="promos">' + '<img src="imgPromociones/' + value.codigo + '/' + value.nombreImagen + '">' + '</div>');
        }
        else
        {
            $("#divpromossegmentadas").append('<div class="promos"><img src="imgPromociones/imgEmpty/noimg.jpg"></div>');
        }
    });
    $("#contenedorOpcionesPrepago").show();
    $("#contenedoPromociones-segmentadas").show();
    $("#spanNombrePrepago").html("Nombre: " + window.WinNombre + "(" + window.WinDNI + ")");
    $("#spanCategoriaPrepago").html("Categoría: " + window.Wincategoria);
    $('#div-banner').hide();
    $('#opciones-prepago').hide();
}

function cargarOpcionesPrepago(estaEnLaListaNegra) {
    $("#contenedoPromociones-segmentadas").hide();
    BannerPrepago();
    $("#spanNombrePrepago").html("Nombre: " + window.WinNombre + "(" + window.WinDNI + ")");
    $("#spanCategoriaPrepago").html("Categoría: " + window.Wincategoria);
    $("#contenedorOpcionesPrepago").show();

    if (estaEnLaListaNegra) {
        $('#contenedorOpcionesPrepago .mensaje-no-esta-habilitado.opciones').show();
        $('#opciones-prepago').hide();
    }
    else {
        $("#SuperTitle").html("Elija una opci&#xF3;n");
        $('#opciones-prepago').show();
    }
}


function cargarOpcionesKitPrepago(estaEnLaListaNegra) {
    BannerPrepago();
    $("#spanNombre_Kit_Prepago").html("Nombre: " + window.WinNombre + "(" + window.WinDNI + ")");
    $("#spanCategoria_Kit_Prepago").html("Categoría: " + window.Wincategoria);
    $("#contenedorOpciones_Kit_Prepago").show();

    if (estaEnLaListaNegra) {
        $('#contenedorOpciones_Kit_Prepago .mensaje-no-esta-habilitado.opciones').show();
        $('#opciones-prepago').hide();
    }
    else {
        $("#SuperTitle").html("Elija una opci&#xF3;n");
        $('#opciones-prepago').show();
    }
}

function cargarOpcionesPospago(estaEnLaListaNegra) {
    $("#spanNombrePosPago").html("Nombre: " + window.WinNombre + "(" + window.WinDNI + ")");
    $("#spanCategoriaPosPago").html("Categoría: " + window.Wincategoria);
    $("#contenedorOpcionesPosPago").show();

    if (estaEnLaListaNegra) {
        $('#contenedorOpcionesPosPago .mensaje-no-esta-habilitado.opciones').show();
        $('#opciones-pospago').hide();
    }
    else {
        $("#SuperTitle").html("Elija una opci&#xF3;n");
        $('#opciones-pospago').show();
    }
}

function OnFailure(error) {
    if (error) {
        alert(error);
    }
}

function BannerPrepago() {
    $('#div-banner').show();
    $('.bxslider').bxSlider({
        auto: true,
        speed: 2000,
        pause: 6000,
        preloadImages: 'all',
        autoHover: true
    });
} 

function imageExists(image_url) {

    var http = new XMLHttpRequest();
    http.open('HEAD', image_url, false);
    http.send();
    return http.status != 404;
}

function getAjax(url, token) {
    return $.ajax({
        url: url,
        method: "GET",
        dataType: "json",
        crossDomain: true,
        contentType: "application/json; charset=utf-8",
        cache: false,
        beforeSend: function (xhr) {
            xhr.setRequestHeader("Authorization", "Bearer " + token);
        }
    });
}