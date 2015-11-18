var srvAddress = "http://www.ilnostrocalcio.eu/orsapp/server/v1/";
var apiKey = "";
var idUser = 0;
var giorni = ["Domenica","Lunedi","Martedi","Mercoledi","Giovedi","Venerdi","Sabato"];
var app = document.URL.indexOf( 'http://' ) === -1 && document.URL.indexOf( 'https://' ) === -1;
function validateEmail(email) {
    var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
    return re.test(email);
}
function showLoading(){
	$.mobile.loading( "show", {
  text: "Attendi",
  textVisible: true,
  theme: "b",
  html: ""
});
}
function hideLoading(){
	$.mobile.loading( "hide" );
}
function loadPageMieiImpegni(){
	showLoading();
	$(':mobile-pagecontainer').pagecontainer('change', "#pgMieiImpegni");
	$('#pgMieiImpegniContent').html('');
	$.ajax({
		url: srvAddress+'impegni',
		type: 'GET',
		headers: {
		  'Authorization' :apiKey
		},			
		success:function(resp){
			var repartiFuturi = resp.repartiFuturi;
			var repartiFuturiArray = $.parseJSON(repartiFuturi);
			console.log(repartiFuturiArray);
			hideLoading();
			$("#pgMieiImpegniContent").append('<ul id="listaImpegniFuturi" data-role="listview"></ul>');
			$.each(repartiFuturiArray,function(index,objRepartoFuturo){
				$("#listaImpegniFuturi").append("<li>Reparto "+moment(objRepartoFuturo['data'],"YYYY-MM-DD").format("DD-MM-YYYY")+" "+moment(objRepartoFuturo['orainizio'],"HH:mm:ss").format("HH:mm")+" - "+moment(objRepartoFuturo['orafine'],"HH:mm:ss").format("HH:mm")+"</li>");
			});
			$('#pgMieiImpegniContent').trigger('create').listview('refresh');
		},
		error: function(err){
			hideLoading();
			loadPgErrore("si è verificato un errore, alla finestra di invio mail ti prego di inviarla così potrò correggere");
			sendMailError('impegni',"GET",JSON.stringify(err));
			$("#pgMieiImpegniContent").html('');			
		}
	});
}
function loadPgErrore(msg){
	$(':mobile-pagecontainer').pagecontainer('change', "#paginaErrore");
	$('#paginaErroreContent').html(msg);
}
function loadPgRecuperoPassword()
{
	$('#pgRecuperoPasswordContent').find($('.infoText')).remove();
	$('#pgRecuperoPasswordContent').find($('#mailField')).val('');	
	$(':mobile-pagecontainer').pagecontainer('change','#pgRecuperoPassword');
	return false;
}
function sendMailError(funzione,metodo,err){
	if(app)
	{
		cordova.plugins.email.open({
			to:      'cittello@gmail.com',
			subject: 'malfunzionamento in orsapp',
			body:    'funzione: '+funzione+' ('+metodo+')<br>errore: '+JSON.stringify(err)
		});
	}	
}
function loadPgSelRepartoAttivita(idturno, dataReparto){
	$(':mobile-pagecontainer').pagecontainer('change', "#pgSelezioneRepartoAttivita");
	showLoading();
	$.ajax({
		url:srvAddress+'/coverage/'+dataReparto+'/0',
		type:"GET",
		headers: {
		  'Authorization' :apiKey
		},		
		success:function(coverageResp){
			var coverage = coverageResp.copertura;
			var copertura = $.parseJSON(coverage);
			var coperturaTurno = copertura[dataReparto][parseInt(idturno)];
			var volontari = coperturaTurno['volontari'];
			$("#pgSelezioneRepartoAttivitaContent").html('');
			$("#pgSelezioneRepartoAttivitaContent").append('<ul id="listaRepartiAttivita" data-filter="true" data-filter-placeholder="cerca" data-role="listview" data-idturno="'+idturno+'" data-datareparto="'+dataReparto+'"></ul>');
			$.ajax({
				url:srvAddress+'listarepartiattivita',
				type:"GET",
				headers: {
				  'Authorization' :apiKey
				},			
				success:function(resp){
					var repartiattivita = $.parseJSON(resp.repartiattivita);
					var reparti = repartiattivita['reparti'];
					var attivita = repartiattivita['attivita'];
					$.ajax({
						url: srvAddress+'repartiattivita/'+idturno+'/'+dataReparto,
						method:"GET",
						headers: {
						  'Authorization' :apiKey
						},			
						success:function(response){
							var repartiattivitasvolti = $.parseJSON(response.repartiattivita);
							var repartisvolti = repartiattivitasvolti['reparti'];
							var attivitasvolte = repartiattivitasvolti['attivita'];
							//var unVolontarioConfermato = 0;
							$("#pgSelezioneRepartoAttivitaContent").find($('#listaRepartiAttivita')).append("<li data-role='list-divider' role='heading'>Volontari</li>");			
							$.each(volontari,function(idVolontario,cognomeNome){
								$("#pgSelezioneRepartoAttivitaContent").find($('#listaRepartiAttivita')).append("<li data-icon='false' data-checked='0' data-idVolontario='"+idVolontario+"'><a href='#' class='linkSelRepartoAttivita linkConfermaVolontario'>"+cognomeNome+"</a></li>");		
							});
							$.each(coperturaTurno['confermata'], function(idVolontario,boolConfermata){
								if(parseInt(boolConfermata)){
									$("li[data-idVolontario='"+idVolontario+"']").attr('data-checked','1').find("a").css("background","#00FF33");
									//unVolontarioConfermato = 1;
								}
							});
							$("#pgSelezioneRepartoAttivitaContent").find($('#listaRepartiAttivita')).append("<li data-role='list-divider' role='heading'>Reparti</li>");
							$.each(reparti,function(index, objReparto){
								$("#pgSelezioneRepartoAttivitaContent").find($('#listaRepartiAttivita')).append("<li data-icon='false' data-checked='0' data-idreparto='"+objReparto['id_reparto']+"'><a href='#' class='linkSelRepartoAttivita linkSelReparto'>"+objReparto['reparto']+"</a></li>");
							});
							$("#pgSelezioneRepartoAttivitaContent").find($('#listaRepartiAttivita')).append("<li data-role='list-divider' role='heading'>Attivita</li>");
							$.each(attivita,function(index, objAttivita){
								$("#pgSelezioneRepartoAttivitaContent").find($('#listaRepartiAttivita')).append("<li data-icon='false' data-checked='0' data-idattivita='"+objAttivita['id_attivitaospedale']+"'><a href='#' class='linkSelRepartoAttivita linkSelAttivita'>"+objAttivita['attivita']+"</a></li>");
							});
							$.each(repartisvolti, function(index, idreparto){
								$("li[data-idreparto='"+idreparto+"']").attr('data-checked','1').find("a").css("background","#00FF33");
							});
							$.each(attivitasvolte, function(index, idattivita){
								$("li[data-idattivita='"+idattivita+"']").attr('data-checked','1').find("a").css("background","#00FF33");
							});
							hideLoading();
							/*if(!unVolontarioConfermato)
							{
								$('#btSalvaPgSelezioneRepartoAttivita').addClass('ui-disabled');
							}	
							else
							{
								$('#btSalvaPgSelezioneRepartoAttivita').removeClass('ui-disabled');
							}	*/
							$('#pgSelezioneRepartoAttivitaContent').trigger('create').listview('refresh');
						},
						error:function(error){
						hideLoading();
						loadPgErrore("si è verificato un errore, alla finestra di invio mail ti prego di inviarla così potrò correggere");
						sendMailError('repartiattivita/'+idturno+'/'+dataReparto,"GET",JSON.stringify(error));
						}				
					});
				},
				error:function(err){
					hideLoading();
					loadPgErrore("si è verificato un errore, alla finestra di invio mail ti prego di inviarla così potrò correggere");
					sendMailError('listarepartiattivita',"GET",JSON.stringify(err));
					$("#pgSelezioneRepartoAttivitaContent").html('');
				}
			});
		},
		error:function(errorCoverage){
			hideLoading();
			loadPgErrore("si è verificato un errore, alla finestra di invio mail ti prego di inviarla così potrò correggere");
			sendMailError('coverage',"GET",JSON.stringify(errorCoverage));
			$("#pgSelezioneRepartoAttivita").html('');				
		}
	});
}
function loadPgSelRepartoPassato(){
	//$("#pgReferentiRepartoContent").html('Carico le informazioni');
	$(':mobile-pagecontainer').pagecontainer('change', "#pgReferentiReparto");
	showLoading();
	$.ajax({
		url: srvAddress+'reparti/'+idUser,
		method:"GET",
		headers: {
		  'Authorization' :apiKey
		},	
		success:function(resp){
			hideLoading();
			var repartiPassati = $.parseJSON(resp.repartipassati);
			console.log(repartiPassati);
			$("#pgReferentiRepartoContent").html('').append('<ul  id="listaRepartiPassati" data-role="listview"></ul>');
			$.each(repartiPassati,function(index, objRepartoPassato){
				$("#pgReferentiRepartoContent").find($('#listaRepartiPassati')).append('<li data-iconpos="right" data-inset="true" data-dataReparto="'+objRepartoPassato['data']+'" data-idturno="'+objRepartoPassato['idturno']+'"><a href="#" class="linkSelRepartoPassato">'+moment(objRepartoPassato['data'],"YYYY-MM-DD").format("DD-MM-YYYY")+' '+objRepartoPassato['orainizio']+'</a></li>')
			});
			$('#pgReferentiRepartoContent').trigger('create').listview('refresh');
		},
		error:function(err){
			hideLoading();
			if(parseInt(err.status!=403))
			{
				loadPgErrore("si è verificato un errore, alla finestra di invio mail ti prego di inviarla così potrò correggere");
				sendMailError('reparti/'+idUser,"GET",JSON.stringify(err));
			}
			else
			{
				loadMainPage();
			}
			//$("#pgReferentiRepartoContent").html('reparti/'+idUser,"GET");
		}
	});
	
}
function loadPgAggiungiAltriVolontari(idturno,giornoNumerico,giornoTestuale,dataReparto,volontariSegnati)
{
	$('#btSalvaAggiungiVolontariReparto').attr('data-dataReparto',dataReparto);
	$(':mobile-pagecontainer').pagecontainer('change', "#pgAggiungiAltriVolontari");
	$('#dtAggiungiAltriVolontariContent').html('');
	$('#footerAggiungiVolontario').hide('');
	var volontariSegnatiArray = [];
	if(parseInt(volontariSegnati.length))
	{
		volontariSegnatiArray = volontariSegnati.substr(0,volontariSegnati.length-1).split(',');
	}
	for(var i=0; i<volontariSegnatiArray.length;i++) 
		volontariSegnatiArray[i] = +volontariSegnatiArray[i];
	$.ajax({
		url:srvAddress+'/utenti/',
		method:"GET",
		headers: {
		  'Authorization' :apiKey
		},
		success:function(resp){
			hideLoading();
			var utenti = $.parseJSON(resp.users);
			$('#dtAggiungiAltriVolontariContent').append('<ul data-filter="true" data-filter-placeholder="cerca" id="listaVolontariAggiungibiliReparto" data-role="listview"></ul>');
			$.each(utenti,function(index,objUtente){
				if(volontariSegnatiArray.indexOf(parseInt(objUtente['id_user']))==-1)
					$('#listaVolontariAggiungibiliReparto').append("<li data-icon='false'><a href='#' class='linkSelVolontarioReparto' data-idvolontario='"+objUtente['id_user']+"' data-idturno='"+idturno+"' data-checked='0'>"+objUtente['lastname']+" "+objUtente['firstname']+"</a></li>");
			});
			$('#dtAggiungiAltriVolontariContent').trigger('create').listview('refresh');
		},
		error: function(err){
			hideLoading();
			loadPgErrore("si è verificato un errore, alla finestra di invio mail ti prego di inviarla così potrò correggere");
			sendMailError('/utenti/',"GET",JSON.stringify(err));
		}
	});
}
function ordinaperdata(a,b)
{
	if (moment(a.data,"YYYY-MM-DD").isBefore(moment(b.data,"YYYY-MM-DD")))
    return -1;
  if (moment(a.data,"YYYY-MM-DD").isAfter(moment(b.data,"YYYY-MM-DD")))
    return 1;
  return 0;
}
function loadDtGiornoReparto(giornoNumerico, giornoTestuale, dataReparto)
{
	$('#dtGiornoRepartoContent').html('');
	$(':mobile-pagecontainer').pagecontainer('change', "#dtGiornoReparto");
	showLoading();
	var giornoDelMese = moment(dataReparto,"YYYY-MM-DD").format("DD");
	$('#headerTxtDtGiornoReparto').text(giornoTestuale+' '+giornoDelMese);
	$.ajax({
		url:srvAddress+'coverage/'+dataReparto+'/0',
		type:"GET",
		headers: {
		  'Authorization' :apiKey
		},
		success:function(resp){
			hideLoading();
			var copertura = $.parseJSON(resp.copertura);
			var utenteReferente = 0;
			$('#dtGiornoRepartoContent').html('<ul data-role="listview" id="listTurniGiornoReparto"></ul>');
			$.each(copertura,function(data,idTurnoOrarioVolontariReferenti){
				$.each(idTurnoOrarioVolontariReferenti, function(idturno,orarioVolontariReferenti){
					if((idUser in orarioVolontariReferenti['referenti']))
					{
						utenteReferente = 1;
					}
					$('#listTurniGiornoReparto').append('<li data-role="collapsible" data-iconpos="right" data-inset="true"><h2>'+orarioVolontariReferenti['orario']+'<span class="ui-li-count ui-btn-up-c ui-btn-corner-all counterVolontariTurno '+idturno+'">0</span></h2><ul data-role="listview" class="dtTurnoReparto '+idturno+'"></ul></li>');
					var nVolontari = 0;
					var btJoin = 1;
					var BtEnabled = 1;
					var orainizio = orarioVolontariReferenti['orario'].split('-')[0];
					var orafine = orarioVolontariReferenti['orario'].split('-')[1];
					var dataOraInizio = moment(data+' '+orainizio,"YYYY-MM-DD HH:mm").format('YYYY-MM-DD HH:mm');
					if(moment().isAfter(dataOraInizio))
						BtEnabled = 0;
					var dataidVolontari = "";
					$.each(orarioVolontariReferenti['volontari'],function(idvolontario,volontario){
						$('.dtTurnoReparto.'+idturno).append('<li><a href="#">'+volontario+'</a></li>');
						nVolontari++;
						if(utenteReferente)
							$('.dtTurnoReparto.'+idturno).find('li').last().attr('data-icon','delete').find('a').addClass('deleteVolontarioFromTurno').attr('data-idturno',idturno).attr('data-idVolontario',idvolontario).attr('data-giornoNumerico',giornoNumerico).attr('data-giornoTestuale',giornoTestuale).attr('data-dataReparto',dataReparto);
						else
							$('.dtTurnoReparto.'+idturno).find('li').last().attr('data-icon','false');							
						if(idvolontario == idUser)
							btJoin = 0;
						dataidVolontari+=idvolontario+',';
					});
					if(btJoin)
					{
						$('.dtTurnoReparto.'+idturno).append('<li><a href="#" data-role="button" data-icon="calendar" class="joinTurno '+idturno+'" data-idturno='+idturno+' data-giornoNumerico='+giornoNumerico+' data-giornoTestuale='+giornoTestuale+' data-dataReparto='+dataReparto+'><center>Segnami per questo turno</center></a></li>');
						if(!BtEnabled)
							$('.joinTurno.'+idturno).addClass('ui-disabled');
					}
					else
					{
						$('.dtTurnoReparto.'+idturno).append('<li><a href="#" data-role="button" data-icon="delete" class="deleteFromTurno '+idturno+'" data-idturno='+idturno+' data-giornoNumerico='+giornoNumerico+' data-giornoTestuale='+giornoTestuale+' data-dataReparto='+dataReparto+'><center>Cancellami da questo turno</center></a></li>');						
						if(!BtEnabled)
							$('.deleteFromTurno.'+idturno).addClass('ui-disabled');
					}
					if(utenteReferente)
					{
						$('.dtTurnoReparto.'+idturno).append('<li><a href="#" data-role="button" data-icon="calendar" class="addOtherUserTurno '+idturno+'" data-idturno='+idturno+' data-giornoNumerico='+giornoNumerico+' data-giornoTestuale='+giornoTestuale+' data-dataReparto='+dataReparto+' data-volontari='+dataidVolontari+'><center>Aggiungi altri volontari</center></a></li>');											
					}
					$('.counterVolontariTurno.'+idturno).text(nVolontari);
				});
			});
			$('#dtGiornoRepartoContent').trigger('create').listview('refresh');
		},
		error:function(err){
			hideLoading();
			loadPgErrore("si è verificato un errore, alla finestra di invio mail ti prego di inviarla così potrò correggere");
			sendMailError('coverage/'+dataReparto+'/0',"GET",JSON.stringify(err));
		}
	});
	return false;
}
function loadMainPage()
{
	$('#main_page_content').html('');
	$(':mobile-pagecontainer').pagecontainer('change', "#main_page");
	var start = moment().format("YYYY-MM-DD");
	$.ajax({
		url: srvAddress+"turni/",
		type:"GET",
		headers: {
		  'Authorization' :apiKey
		},
		success:function(resp){
			hideLoading();
			var turni = $.parseJSON(resp.turni);
			$('#main_page_content').html('<ul data-role="listview" id="listaGiorniReparto"></ul>');
			$('#listaGiorniReparto').append("<li><a href='#' id='linkImpegniFuturi'>I tuoi impegni</a></li>");
			$('#listaGiorniReparto').append("<li data-role='list-divider' role='heading' class='ui-li-divider ui-bar-inherit ui-first-child'>Calendario</li>");
			/*$.each(turni, function(index, objTurno){
				var giorno = objTurno['giorno'];
				if(objTurno['giorno']<moment().day())
					giorno+=7;
				turni[index]['data'] = moment().day(giorno).format("YYYY-MM-DD");	
			});
			turni.sort(ordinaperdata);
			$.each(turni, function(index, objTurno){
				var orainizio = moment(objTurno['orainizio'],"HH:mm:ss").format("HH:mm");
				var orafine = moment(objTurno['orafine'],"HH:mm:ss").format("HH:mm");
				var giornoRepartoText = giorni[objTurno['giorno']];
				var giorno = objTurno['giorno'];
				if(giorniStampati.indexOf(giorno)==-1)
				{
					var giornoRepartoNumber = moment(turni[index]['data'],"YYYY-MM-DD").format("DD"); 
					$('#listaGiorniReparto').append("<li><a href='#dtGiornoReparto' id='linkDtGiornoReparto' data-giornoNumerico='"+objTurno['giorno']+"' data-dataReparto='"+objTurno['data']+"' data-giornoText='"+giornoRepartoText+"'><img src='http://www.ilnostrocalcio.eu/orsapp/client/res/img/calendar.png' style='width:3em;'>"+giornoRepartoText+" "+giornoRepartoNumber+'</a>');
					giorniStampati[giorniStampati.length] = giorno;
				}
			});*/
			//le due variabili sotto regolano quanti giorni indietro e quanti avanti mostrare nella finestra di selezione giorno
			var giorniIndietro = 2; 
			var giorniAvanti= 7;
			var dataInizio = moment().subtract(giorniIndietro,'days').format("YYYY-MM-DD");
			var dataFine = moment().add(giorniAvanti,'days').format("YYYY-MM-DD");
			var giorniDaStampare = [];
			var ultimoGiornoStampato = -1;
			var scorriGiorni = 0;
			for(i = dataInizio; moment(i,"YYYY-MM-DD").isBefore(dataFine); i = moment(i,"YYYY-MM-DD").add(1,'days')){
				var giornoCorrente = parseInt(moment(i,"YYYY-MM-DD").format('d'));
				$.each(turni, function(index,objTurno){
					if(parseInt(objTurno['giorno']) == giornoCorrente)
					{
						giorniDaStampare[scorriGiorni] = {};
						giorniDaStampare[scorriGiorni]['data'] = moment(i,"YYYY-MM-DD").format("YYYY-MM-DD");
						giorniDaStampare[scorriGiorni]['giorno'] = objTurno['giorno'];
						giorniDaStampare[scorriGiorni]['orafine'] = objTurno['orafine'];
						giorniDaStampare[scorriGiorni]['orainizio'] = objTurno['orainizio'];
						giorniDaStampare[scorriGiorni]['id_turnireparto'] = objTurno['id_turnireparto'];
						scorriGiorni++;
					}
				});
			}
			giorniDaStampare.sort(ordinaperdata);
			$.each(giorniDaStampare, function(index, objGiorno){
				var orainizio = moment(objGiorno['orainizio'],"HH:mm:ss").format("HH:mm");
				var orafine = moment(objGiorno['orafine'],"HH:mm:ss").format("HH:mm");
				var giornoRepartoText = giorni[objGiorno['giorno']];
				var giorno = objGiorno['giorno'];
				if(giorno!=ultimoGiornoStampato)
				{
					var giornoRepartoNumber = moment(giorniDaStampare[index]['data'],"YYYY-MM-DD").format("DD"); 
					$('#listaGiorniReparto').append("<li><a href='#dtGiornoReparto' id='linkDtGiornoReparto' data-giornoNumerico='"+objGiorno['giorno']+"' data-dataReparto='"+objGiorno['data']+"' data-giornoText='"+giornoRepartoText+"'><img src='http://www.ilnostrocalcio.eu/orsapp/client/res/img/calendar.png' style='width:3em;'>"+giornoRepartoText+" "+giornoRepartoNumber+'</a>');
					//giorniStampati[giorniStampati.length] = giorno;
					ultimoGiornoStampato = giorno;
				}
			});
			$('#main_page_content').trigger('create').listview('refresh');
		},
		error:function(err){
			hideLoading();
			loadPgErrore("si è verificato un errore, alla finestra di invio mail ti prego di inviarla così potrò correggere");
			sendMailError("turni/","GET",JSON.stringify(err));
		}
	});
	return false;
}
function OnDeviceReady(){
	showLoading();
	//window.localStorage.removeItem("orsapp_apikey");
	valueCookie = window.localStorage.getItem("orsapp_apikey");
	apiKeyString = JSON.stringify(valueCookie);
	if(apiKeyString!="null")
	{
		apiKey = valueCookie;
		$.ajax({
			url: srvAddress+"/me/",
			type: "GET",
			headers: {
			  'Authorization' :apiKey
			},
			success:function(resp){
				user = $.parseJSON(resp.user);
				idUser = parseInt(user['id']);
				loadMainPage();
			},
			error:function(err){
				if(parseInt(err.status!=401))
				{
					loadPgErrore("si è verificato un errore, alla finestra di invio mail ti prego di inviarla così potrò correggere");
					sendMailError("/me/","GET",JSON.stringify(err));
				}
				else
				{
					window.localStorage.removeItem("orsapp_apikey");
					hideLoading();
				}
			}
		});
	}
	else{
		hideLoading();
		$(':mobile-pagecontainer').pagecontainer('change', "#login");
	}
	$('#login').on('click','.bt_loginProprietario',function(){
		showLoading();
		var mail = $('#txt_email').val();
		var psw = $('#txt_psw').val();
		$.ajax({
			url : srvAddress+"login",
			type :"POST",
			data:{
				'email':mail,
				'password':psw
			},
			success:function(me){
				window.localStorage.setItem("orsapp_apikey", me['apiKey']);
				apiKey = me['apiKey'];
				idUser = me['id'];
				loadMainPage();
			},
			error:function(err){
				hideLoading();
				if(parseInt(err.status)!=403)
					sendMailError("login","POST",JSON.stringify(err));
				else
					loadPgErrore("credenziali errate");
			}
		});
	});
	$('.navLinkReparto').click(function(){
		showLoading();
		loadMainPage();
	});
	$('#main_page_content').on('click','#linkDtGiornoReparto',function(){
		//showLoading();
		loadDtGiornoReparto($(this).attr('data-giornoNumerico'),$(this).attr('data-giornoText'),$(this).attr('data-dataReparto'));
	});
	$('#dtGiornoRepartoContent').on('click','.joinTurno',function(){
		showLoading();
		var idturno = parseInt($(this).attr('data-idturno'));
		var giornoNumerico = $(this).attr('data-giornoNumerico');
		var giornoTestuale = $(this).attr('data-giornoTestuale');
		var dataReparto = $(this).attr('data-dataReparto');
		$.ajax({
			url: srvAddress+'/reparto/'+apiKey+'/'+idturno,
			method: "POST",
			headers: {
			  'Authorization' :apiKey
			},
			success:function(resp){
				loadDtGiornoReparto(giornoNumerico,giornoTestuale,dataReparto);
			},
			error:function(err){
				hideLoading();
				loadPgErrore("si è verificato un errore, alla finestra di invio mail ti prego di inviarla così potrò correggere");
				sendMailError('/reparto/'+apiKey+'/'+idturno,"POST",JSON.stringify(err));
			}
		});
	});
	$('#dtGiornoRepartoContent').on('click','.deleteFromTurno',function(){
		showLoading();
		var idturno = parseInt($(this).attr('data-idturno'));
		var giornoNumerico = $(this).attr('data-giornoNumerico');
		var giornoTestuale = $(this).attr('data-giornoTestuale');
		var dataReparto = $(this).attr('data-dataReparto');
		$.ajax({
			url: srvAddress+'/reparto/'+apiKey+'/'+idturno,
			method: "DELETE",
			headers: {
			  'Authorization' :apiKey
			},
			success:function(resp){
				loadDtGiornoReparto(giornoNumerico,giornoTestuale,dataReparto);
			},
			error:function(err){
				hideLoading();
				loadPgErrore("si è verificato un errore, alla finestra di invio mail ti prego di inviarla così potrò correggere");
				sendMailError('/reparto/'+apiKey+'/'+idturno,"DELETE",JSON.stringify(err));
			}
		});
	});
	$('#dtGiornoRepartoContent').on('click','.deleteVolontarioFromTurno',function(){
		showLoading();
		var idturno = parseInt($(this).attr('data-idturno'));
		var giornoNumerico = $(this).attr('data-giornoNumerico');
		var giornoTestuale = $(this).attr('data-giornoTestuale');
		var dataReparto = $(this).attr('data-dataReparto');
		var idVolontario = parseInt($(this).attr('data-idVolontario'));
		$.ajax({
			url: srvAddress+'/apikey/'+idVolontario,
			method: "GET",
			headers: {
			  'Authorization' :apiKey
			},
			success:function(resp){
				var apikeyVolontario = resp.apiKey;
				$.ajax({
					url: srvAddress+'/reparto/'+apikeyVolontario+'/'+idturno+'/'+dataReparto,
					method: "DELETE",
					headers: {
					  'Authorization' :apiKey
					},
					success:function(resp){
						loadDtGiornoReparto(giornoNumerico,giornoTestuale,dataReparto);
					},
					error:function(err){
						hideLoading();
						loadPgErrore("si è verificato un errore, alla finestra di invio mail ti prego di inviarla così potrò correggere");
						sendMailError('/reparto/'+apikeyVolontario+'/'+idturno,"DELETE",JSON.stringify(err));
					}
				});	
			},
			error:function(err){
				hideLoading();
				loadPgErrore("si è verificato un errore, alla finestra di invio mail ti prego di inviarla così potrò correggere");
				sendMailError('/apikey/'+idVolontario,"GET",JSON.stringify(err));
			}
		});		
	});
	$('#dtGiornoRepartoContent').on('click','.addOtherUserTurno',function(){
		showLoading();
		var idturno = parseInt($(this).attr('data-idturno'));
		var giornoNumerico = $(this).attr('data-giornoNumerico');
		var giornoTestuale = $(this).attr('data-giornoTestuale');
		var dataReparto = $(this).attr('data-dataReparto');
		loadPgAggiungiAltriVolontari(idturno,giornoNumerico,giornoTestuale,dataReparto,$(this).attr('data-volontari'));
	});
	$('#dtAggiungiAltriVolontariContent').on('click','.linkSelVolontarioReparto',function(){
		if(!parseInt($(this).attr('data-checked')))
		{
			$(this).css('background','#00FF33');
			$(this).attr('data-checked','1');
		}
		else
		{
			$(this).css('background','');
			$(this).attr('data-checked','0');			
		}
		$('#listaVolontariAggiungibiliReparto').listview('refresh');
		var unoDaAggiungere = 0;
		$.each($('#listaVolontariAggiungibiliReparto').find('li'),function(){
			if(parseInt($(this).find('a').attr('data-checked')))
			{
				unoDaAggiungere = 1;
				return;
			}
		});
		if(unoDaAggiungere)
		{
			$('#footerAggiungiVolontario').show();
		}
		else
			$('#footerAggiungiVolontario').hide();
	});
	$('#pgAggiungiAltriVolontari').on('click','#btSalvaAggiungiVolontariReparto',function(){
		var idVolontariDaAggiungere = {};
		var dataReparto = $(this).attr('data-dataReparto');
		idVolontariDaAggiungere['volontari']=[];
		var idturno = 0;
		$.each($('#listaVolontariAggiungibiliReparto').find('li'),function(){
			if(parseInt($(this).find('a').attr('data-checked')))
			{
				//alert($(this).find('a').attr('data-idvolontario'));
				idVolontariDaAggiungere['volontari'] [idVolontariDaAggiungere['volontari'] .length] = $(this).find('a').attr('data-idvolontario');
				idturno = $(this).find('a').attr('data-idturno');
			}			
		});
		if(idVolontariDaAggiungere['volontari'].length)
		{
			showLoading();
			//alert(idVolontariDaAggiungere);
			var idVolontariDaAggiungereString = JSON.stringify(idVolontariDaAggiungere);
			console.log(idVolontariDaAggiungereString);
			$.ajax({
				url:srvAddress+'multiplo/reparto/'+idturno+'/'+dataReparto,
				type:"POST",
				headers: {
				  'Authorization' :apiKey
				},		
				accept: "*/*",
				dataType:"json",
				contentType:"application/json",
			data:idVolontariDaAggiungereString,
				success:function(resp){
					loadMainPage();	
				},
				error:function(err){
					hideLoading();
					loadPgErrore("si è verificato un errore, alla finestra di invio mail ti prego di inviarla così potrò correggere");
					sendMailError('multiplo/reparto/'+idturno,"POST",JSON.stringify(err));
				}
			});
		}
	});
	$('#main_page_content').on('swiperight',function(event){
		if($('#main_page').find('[data-role="navbar"]').find($('.ui-btn-active')).hasClass('navLinkReparto'))
		{
			loadPgSelRepartoPassato();
		}
	});
	$("#pgReferentiRepartoContent").on('click','.linkSelRepartoPassato',function(){
		showLoading();
		var idturno = $(this).parent().attr('data-idturno');
		var dataReparto = $(this).parent().attr('data-dataReparto');
		loadPgSelRepartoAttivita(idturno,dataReparto);
	});
	$('#pgSelezioneRepartoAttivitaContent').on('click','.linkSelRepartoAttivita',function(){
		if(parseInt($(this).parent().attr('data-checked'))){
			$(this).parent().attr('data-checked','0');
			$(this).css('background','');
		}
		else
		{
			$(this).parent().attr('data-checked','1');
			$(this).css('background','#00FF33');		
		}
		/*if($(this).hasClass('linkConfermaVolontario'))
		{*/
			var volontariConfermati = 0;
			var repartiAttivitaSelezionati = 0;
			$.each($('#pgSelezioneRepartoAttivitaContent').find($('.linkSelRepartoAttivita')),function(){
				if(parseInt($(this).parent().attr('data-checked'))){
					if($(this).hasClass('linkConfermaVolontario'))
					{
						volontariConfermati = 1;
					}
					else
						repartiAttivitaSelezionati = 1;
				}
			});
			if(volontariConfermati == repartiAttivitaSelezionati)
				$('#btSalvaPgSelezioneRepartoAttivita').removeClass('ui-disabled');
			else
				$('#btSalvaPgSelezioneRepartoAttivita').addClass('ui-disabled');
		//}
	});
	$('#footerPgSelezioneRepartoAttivita').on('click','#btSalvaPgSelezioneRepartoAttivita',function(){
		showLoading();
		var reparti=[];
		var attivita=[];
		var volontari = [];
		$.each($('.linkSelRepartoAttivita').parent(),function(){
			if(parseInt($(this).attr('data-checked'))){
				if(typeof $(this).attr('data-idreparto') === 'undefined' && typeof $(this).attr('data-idVolontario') === 'undefined')
				{
					attivita[attivita.length] = $(this).attr('data-idattivita');
				}
				else if (typeof $(this).attr('data-idattivita') === 'undefined' && typeof $(this).attr('data-idVolontario') === 'undefined')
				{
					reparti[reparti.length] = $(this).attr('data-idreparto');					
				}
				else
					volontari[volontari.length] = $(this).attr('data-idVolontario');
			}
		});
		var repartiattivitavolontari = {};
		repartiattivitavolontari['reparti'] = reparti;
		repartiattivitavolontari['attivita'] = attivita;
		repartiattivitavolontari['volontari'] = volontari;
		var dataReparto = $("#pgSelezioneRepartoAttivita").find($("#listaRepartiAttivita")).attr('data-dataReparto');
		var idturno = $("#pgSelezioneRepartoAttivita").find($("#listaRepartiAttivita")).attr('data-idturno');
		repartiattivitavolontari['datareparto'] = dataReparto;
		repartiattivitavolontari['idturno'] = idturno;
		var repartiattivitavolontariString = JSON.stringify(repartiattivitavolontari);
		$.ajax({
			url: srvAddress+"repartiattivitavolontari",
			type:"POST",				
			headers: {
				  'Authorization' :apiKey
			},		
			accept: "*/*",
			dataType:"json",
			contentType:"application/json",
			data: repartiattivitavolontariString,
			success:function(resp){
				loadMainPage();
			},
			error:function(err){
				hideLoading();
				loadPgErrore("si è verificato un errore, alla finestra di invio mail ti prego di inviarla così potrò correggere");
				sendMailError("repartiattivitavolontari","POST",JSON.stringify(err));
			}
		});
	});
	$('#linkRecuperoPsw').click(function(){
		loadPgRecuperoPassword();
	});
	$('.btRecuperaPassword').click(function(){
		showLoading();
		var emailAddress = $('#mailField').val();
		$('#pgRecuperoPasswordContent').find($('.infoText')).remove();
		if(validateEmail(emailAddress)){
			$.ajax({
				url: srvAddress+'password',
				type:"POST",
				data:{
					'email':emailAddress
				},
				success:function(resp){
					hideLoading();
					$('#pgRecuperoPasswordContent').append('<p class="infoText">Attendi la mail con la nuova password, premi indietro (in alto) per tornare alla schermata di login</p>');
				},
				error: function(err){
					hideLoading();
					if(err.status!=404)
					{
						loadPgErrore("si è verificato un errore, alla finestra di invio mail ti prego di inviarla così potrò correggere");
						sendMailError('repartiattivita/'+idturno+'/'+dataReparto,"GET",JSON.stringify(error));
					}
					else
					{
						$('#pgRecuperoPasswordContent').append('<p class="infoText">La tua mail non è nel database, se pensi sia un errore puoi scrivere a cittello@gmail.com indicando come contattarti per risolvere il problema</p>');					
					}
				}
			});
		}
		else
		{
			hideLoading();
			$('#pgRecuperoPasswordContent').append('<p class="infoText">Indirizzo mail non valido</p>');							
		}
	});
	$('#main_page').on('click','#linkImpegniFuturi',function(){
		loadPageMieiImpegni();
	});
}
document.addEventListener("deviceready", OnDeviceReady, false);