var srvAddress = "http://www.ilnostrocalcio.eu/orsapp/server/v1/";
var apiKey = "";
var idUser = 0;
var giorni = ["Domenica","Lunedi","Martedi","Mercoledi","Giovedi","Venerdi","Sabato"];
function loadPgSelRepartoAttivita(idturno, dataReparto){
	$("#pgSelezioneRepartoAttivitaContent").html('Carico le informazioni');
	$(':mobile-pagecontainer').pagecontainer('change', "#pgSelezioneRepartoAttivita");
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
					console.log(response);
					var repartiattivitasvolti = $.parseJSON(response.repartiattivita);
					var repartisvolti = repartiattivitasvolti['reparti'];
					var attivitasvolte = repartiattivitasvolti['attivita'];
					$("#pgSelezioneRepartoAttivitaContent").html('');
					$("#pgSelezioneRepartoAttivitaContent").append('<ul id="listaRepartiAttivita" data-role="listview" data-idturno="'+idturno+'" data-datareparto="'+dataReparto+'"></ul>');
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
					$('#pgSelezioneRepartoAttivitaContent').trigger('create').listview('refresh');
				},
				error:function(error){
				alert(JSON.stringify(error));
				}				
			});
		},
		error:function(err){
			$("#pgSelezioneRepartoAttivitaContent").html('');
			alert(JSON.stringify(err));
		}
	});
}
function loadPgSelRepartoPassato(){
	$("#pgReferentiRepartoContent").html('Carico le informazioni');
	$(':mobile-pagecontainer').pagecontainer('change', "#pgReferentiReparto");
	$.ajax({
		url: srvAddress+'reparti/'+idUser,
		method:"GET",
		headers: {
		  'Authorization' :apiKey
		},	
		success:function(resp){
			var repartiPassati = $.parseJSON(resp.repartipassati);
			$("#pgReferentiRepartoContent").html('').append('<ul  id="listaRepartiPassati" data-role="listview"></ul>');
			$.each(repartiPassati,function(index, objRepartoPassato){
			/*<li data-role="collapsible" data-iconpos="right" data-inset="true"><h2>'+orarioVolontariReferenti['orario']+'<span class="ui-li-count ui-btn-up-c ui-btn-corner-all counterVolontariTurno 
			'+idturno+'">0</span></h2><ul data-role="listview" class="dtTurnoReparto '+idturno+'"></ul></li>*/
				$("#pgReferentiRepartoContent").find($('#listaRepartiPassati')).append('<li data-iconpos="right" data-inset="true" data-dataReparto="'+objRepartoPassato['data']+'" data-idturno="'+objRepartoPassato['idturno']+'"><a href="#" class="linkSelRepartoPassato">'+moment(objRepartoPassato['data'],"YYYY-MM-DD").format("DD-MM-YYYY")+' '+objRepartoPassato['orainizio']+'</a></li>')
			});
			$('#pgReferentiRepartoContent').trigger('create').listview('refresh');
		},
		error:function(err){
			alert(JSON.stringify(err));
			$("#pgReferentiRepartoContent").html('');
		}
	});
	
}
function loadPgAggiungiAltriVolontari(idturno,giornoNumerico,giornoTestuale,dataReparto,volontariSegnati)
{
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
			var utenti = $.parseJSON(resp.users);
			$('#dtAggiungiAltriVolontariContent').append('<ul id="listaVolontariAggiungibiliReparto" data-role="listview"></ul>');
			$.each(utenti,function(index,objUtente){
				if(volontariSegnatiArray.indexOf(parseInt(objUtente['id_user']))==-1)
					$('#listaVolontariAggiungibiliReparto').append("<li data-icon='false'><a href='#' class='linkSelVolontarioReparto' data-idvolontario='"+objUtente['id_user']+"' data-idturno='"+idturno+"' data-checked='0'>"+objUtente['lastname']+" "+objUtente['firstname']+"</a></li>");
			});
			$('#dtAggiungiAltriVolontariContent').trigger('create').listview('refresh');
		},
		error: function(err){
			alert(JSON.stringify(err));
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
	var giornoDelMese = moment(dataReparto,"YYYY-MM-DD").format("DD");
	$('#headerTxtDtGiornoReparto').text(giornoTestuale+' '+giornoDelMese);
	$.ajax({
		url:srvAddress+'coverage/'+dataReparto+'/0',
		type:"GET",
		headers: {
		  'Authorization' :apiKey
		},
		success:function(resp){
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
			JSON.stringify(err)
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
			var turni = $.parseJSON(resp.turni);
			$('#main_page_content').html('<ul data-role="listview" id="listaGiorniReparto"></ul>');
			$.each(turni, function(index, objTurno){
				//var orainizio = moment(objTurno['orainizio'],"HH:mm:ss").format("HH:mm");
				//var orafine = moment(objTurno['orafine'],"HH:mm:ss").format("HH:mm");
			//	var giornoRepartoText = giorni[objTurno['giorno']];
				var giorno = objTurno['giorno'];
				if(objTurno['giorno']<moment().day())
					giorno+=7;
				turni[index]['data'] = moment().day(giorno).format("YYYY-MM-DD");	
			});
			turni.sort(ordinaperdata);
			var giorniStampati = [];
			$.each(turni, function(index, objTurno){
				var orainizio = moment(objTurno['orainizio'],"HH:mm:ss").format("HH:mm");
				var orafine = moment(objTurno['orafine'],"HH:mm:ss").format("HH:mm");
				var giornoRepartoText = giorni[objTurno['giorno']];
				var giorno = objTurno['giorno'];
				if(giorniStampati.indexOf(giorno)==-1)
				{
					var giornoRepartoNumber = moment(turni[index]['data'],"YYYY-MM-DD").format("DD"); 
					$('#listaGiorniReparto').append("<li><a href='#dtGiornoReparto' id='linkDtGiornoReparto' data-giornoNumerico='"+objTurno['giorno']+"' data-dataReparto='"+objTurno['data']+"' data-giornoText='"+giornoRepartoText+"'><img src='res/img/calendar.png' style='width:3em;'>"+giornoRepartoText+" "+giornoRepartoNumber+'</a>');
					giorniStampati[giorniStampati.length] = giorno;
				}
			});
			$('#main_page_content').trigger('create').listview('refresh');
		},
		error:function(err){
			alert(JSON.stringify(err));
		}
	});
	return false;
}
function OnDeviceReady(){
	valueCookie = window.localStorage.getItem("orsapp_apikey");
	apiKeyString = JSON.stringify(valueCookie);
	/*if(apiKeyString!="null")
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
				alert(JSON.stringify(err));
			}
		});
	}*/
	$('#login').on('click','.bt_loginProprietario',function(){
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
				idUser = me['id'];
				loadMainPage();
			},
			error:function(err){
				alert(JSON.stringify(err));
			}
		});
	});
	$('.navLinkReparto').click(function(){
		loadMainPage();
	});
	$('#main_page_content').on('click','#linkDtGiornoReparto',function(){
		loadDtGiornoReparto($(this).attr('data-giornoNumerico'),$(this).attr('data-giornoText'),$(this).attr('data-dataReparto'));
	});
	$('#dtGiornoRepartoContent').on('click','.joinTurno',function(){
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
				console.log(JSON.stringify(err));
			}
		});
	});
	$('#dtGiornoRepartoContent').on('click','.deleteFromTurno',function(){
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
				console.log(JSON.stringify(err));
			}
		});
	});
	$('#dtGiornoRepartoContent').on('click','.deleteVolontarioFromTurno',function(){
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
					url: srvAddress+'/reparto/'+apikeyVolontario+'/'+idturno,
					method: "DELETE",
					headers: {
					  'Authorization' :apiKey
					},
					success:function(resp){
						loadDtGiornoReparto(giornoNumerico,giornoTestuale,dataReparto);
					},
					error:function(err){
						console.log(JSON.stringify(err));
					}
				});	
			},
			error:function(err){
				console.log(JSON.stringify(err));
			}
		});		
	});
	$('#dtGiornoRepartoContent').on('click','.addOtherUserTurno',function(){
		//$(':mobile-pagecontainer').pagecontainer('change', "#pgAggiungiAltriVolontari");
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
			//alert(idVolontariDaAggiungere);
			var idVolontariDaAggiungereString = JSON.stringify(idVolontariDaAggiungere);
			console.log(idVolontariDaAggiungereString);
			$.ajax({
				url:srvAddress+'multiplo/reparto/'+idturno,
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
					alert(JSON.stringify(err));
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
	});
	$('#footerPgSelezioneRepartoAttivita').on('click','#btSalvaPgSelezioneRepartoAttivita',function(){
		var reparti=[];
		var attivita=[];
		$.each($('.linkSelRepartoAttivita').parent(),function(){
			if(parseInt($(this).attr('data-checked'))){
				if(typeof $(this).attr('data-idreparto') === 'undefined')
				{
					attivita[attivita.length] = $(this).attr('data-idattivita');
				}
				else
				{
					reparti[reparti.length] = $(this).attr('data-idreparto');					
				}
			}
		});
		var repartiattivita = {};
		repartiattivita['reparti'] = reparti;
		repartiattivita['attivita'] = attivita;
		var dataReparto = $("#pgSelezioneRepartoAttivita").find($("#listaRepartiAttivita")).attr('data-dataReparto');
		var idturno = $("#pgSelezioneRepartoAttivita").find($("#listaRepartiAttivita")).attr('data-idturno');
		repartiattivita['datareparto'] = dataReparto;
		repartiattivita['idturno'] = idturno;
		var repartiattivitaString = JSON.stringify(repartiattivita);
		$.ajax({
			url: srvAddress+"repartiattivita",
			type:"POST",				
			headers: {
				  'Authorization' :apiKey
			},		
			accept: "*/*",
			dataType:"json",
			contentType:"application/json",
			data: repartiattivitaString,
			success:function(resp){
				loadMainPage();
			},
			error:function(err){
				alert(JSON.stringify(err));
			}
		});
	});
}
document.addEventListener("deviceready", OnDeviceReady, false);