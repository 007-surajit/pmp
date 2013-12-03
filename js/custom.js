var tempHTML = "";

function goTo(page)
{
	//alert(page);
	$.mobile.changePage( page+".html", { transition: "slide"} );
	//document.location = page+".html";
}

function back()
{
	history.back();
}

function goBack(page) 
{
	$.mobile.changePage( page+".html", { transition: "slide" , reverse: true} );
}

function submitFromPda()
{
	/*<from_pda_id>guid</from_pda_id>
      <imei_id>string</imei_id>
      <dist_nr>int</dist_nr>
      <dist_nm>string</dist_nm>
      <pda_user_dtime>dateTime</pda_user_dtime>
      <utcTime>dateTime</utcTime>
      <dist_net_cd>string</dist_net_cd>
      <cont_inv_nr>int</cont_inv_nr>
      <del_terr_cd>int</del_terr_cd>
      <latitude>double</latitude>
      <longitude>double</longitude>*/
	  showLoader();
	  var UTCstring = (new Date()).toUTCString();
	  console.log(UTCstring);  
	
	
	/*POST /PMP/PDAservice.asmx HTTP/1.1
Host: support.mobiliseit.com
Content-Type: text/xml; charset=utf-8
Content-Length: length
SOAPAction: "http://tempuri.org/SubmitFromPda"

<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <SubmitFromPda xmlns="http://tempuri.org/">
      <from_pda_id>guid</from_pda_id>
      <imei_id>string</imei_id>
      <dist_nr>int</dist_nr>
      <dist_nm>string</dist_nm>
      <pda_user_dtime>dateTime</pda_user_dtime>
      <utcTime>dateTime</utcTime>
      <dist_net_cd>string</dist_net_cd>
      <cont_inv_nr>int</cont_inv_nr>
      <del_terr_cd>int</del_terr_cd>
      <latitude>double</latitude>
      <longitude>double</longitude>
    </SubmitFromPda>
  </soap:Body>
</soap:Envelope>*/	
	
	var soapMessage = '<?xml version="1.0" encoding="utf-8"?><soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body><SubmitFromPda xmlns="http://tempuri.org/"><from_pda_id>2aecb267-aa8c-46bb-ad4b-ec501ae95f67</from_pda_id><imei_id>aaa</imei_id><dist_nr>1</dist_nr><dist_nm>aa</dist_nm><pda_user_dtime>2013-08-31T09:05:07.740Z</pda_user_dtime><utcTime>2013-08-31T09:05:07.740Z</utcTime><dist_net_cd>N</dist_net_cd><cont_inv_nr>2</cont_inv_nr><del_terr_cd>3</del_terr_cd><latitude>30.0</latitude><longitude>40.0</longitude></SubmitFromPda></soap:Body></soap:Envelope>';
						
    var soapServiceURL = "https://support.mobiliseit.com/PMP/PDAservice.asmx";
    //$.support.cors = true;
    $.ajax({
        url: soapServiceURL,
		beforeSend: function(xhr) {
			xhr.setRequestHeader("Content-Type","text/xml; charset=utf-8");
			xhr.setRequestHeader("Content-Length",soapMessage.length);
			xhr.setRequestHeader("SOAPAction","http://tempuri.org/SubmitFromPda");
            },        
        type: "POST",
        dataType: "xml", 
        cache : false,
        processData: false,
        data: soapMessage,
        success:function(data, textStatus, jqXHR)
	    {		
			console.log(JSON.stringify(data));	
	    },
	    error: function(jqXHR, textStatus, errorThrown)
	    {
			 hideLoader();		 
			 if(navigator.notification) {
				navigator.notification.alert("Network Connection Error "+errorThrown, null, 'Outstanding Jobs', 'Ok');
			 }else{
				alert("Network Connection Error "+errorThrown);
			 }			
	   }
    });

}


function popUp(dt,cw,cont_nr,dist_nr)
{
	$('span.del_terr_cd').html(dt);
	$('span.cont_inv_nr').html(cw);
	
	localStorage.setItem("JOB_DEL_TERR_CD",dt);
	localStorage.setItem("JOB_CONT_INV_NR",cw);	
	localStorage.setItem("JOB_CONT_NR",cont_nr);
	localStorage.setItem("JOB_DIST_NR",dist_nr);	
	
	var d1 = document.getElementById('Outstandingjob');    
    
	var d2 = document.getElementById('confirmation');	
	
	if(document.getElementById('overlayOutstanding') == null) {		
		d1.insertAdjacentHTML('afterend', '<div id="overlayOutstanding">'+d2.innerHTML+'</div>');
	}else{
		document.getElementById('overlayOutstanding').style.display='block';
	}
}

function showLoader()
{
	var d1 = document.getElementsByTagName('body')[0];
    var d2 = document.getElementById('loader');	
	if(document.getElementById('loaderOverlay') == null) {
		d1.insertAdjacentHTML('afterend', '<div id="loaderOverlay">'+d2.innerHTML+'</div>');
	}else{
		document.getElementById('loaderOverlay').style.display='block';
	}
}

function hideLoader()
{
	document.getElementById('loaderOverlay').style.display='none';
}

function popUpDelivery()
{
	//var overlay = jQuery('<div id="overlay"> </div>');
	//overlay.appendTo(document.body);
	var d1 = document.getElementById('delivery_audit');
    var d2 = document.getElementById('audit_popup');
    
     	
	//d1.insertAdjacentHTML('afterend', '<div id="overlay"> </div>');
	if(document.getElementById('overlay') == null) {
		d1.insertAdjacentHTML('afterend', '<div id="overlay">'+d2.innerHTML+'</div>');
	}else{
		document.getElementById('overlay').style.display='block';
	}
}

function closePopUp()
{
	if(document.getElementById('overlay') != null) {
		document.getElementById('overlay').style.display='none';
	}
	
	if(document.getElementById('overlayOutstanding') != null) {
		document.getElementById('overlayOutstanding').style.display='none';
	}
}

function markJobAsComplete()
{
	console.log('del_terr_cd'+$('span.del_terr_cd').first().html());
	console.log('cont_inv_nr'+$('span.cont_inv_nr').first().html());
	showLoader();
	//var UTCstring = (new Date()).toUTCString();
	//console.log(UTCstring);	
    $.ajax({
	  url: "https://support.mobiliseit.com/PMP/PDAservice.asmx/markCompleted",
	  type: "POST",
	  data: {cont_nr: localStorage.getItem("JOB_CONT_NR"), cont_inv_nr: localStorage.getItem("JOB_CONT_INV_NR"), del_terr_cd: localStorage.getItem("JOB_DEL_TERR_CD"), dist_nr: localStorage.getItem("JOB_DIST_NR"), utcTime: (new Date()).toUTCString()},
	  success:function(data, textStatus, jqXHR)
	  {		
		closePopUp();
		getOutstandingJobs();		
	  },
	  error: function(jqXHR, textStatus, errorThrown)
	  {
		 hideLoader();
		 closePopUp();
		 if(navigator.notification) {
			navigator.notification.alert("Network Connection Error "+errorThrown, null, 'Outstanding Jobs', 'Ok');
		 }else{
			alert("Network Connection Error "+errorThrown);
		 }			
	   }	  
	});
}

// device APIs are available
//
function onDeviceReady() {
	//document.addEventListener("backbutton", delivery_check_back, false);
	 //
	 //navigator.notification.alert("Unique identifier "+device.uuid, null, 'PMP', 'Ok');
}

function checkDeviceStatus() {
	showLoader();
		setTimeout(function(){hideLoader();},3000);
	if(navigator.connection) {
	    
		checkConnection();
		navigator.geolocation.getCurrentPosition(onGeolocationSuccess, onGeolocationError , {  maximumAge: 3000, timeout: 5000, enableHighAccuracy: true });
	}
}

function checkConnection() {
    var networkState = navigator.connection.type;
    /*var states = {};
    states[Connection.UNKNOWN]  = 'Unknown connection';
    states[Connection.ETHERNET] = 'Ethernet connection';
    states[Connection.WIFI]     = 'WiFi connection';
    states[Connection.CELL_2G]  = 'Cell 2G connection';
    states[Connection.CELL_3G]  = 'Cell 3G connection';
    states[Connection.CELL_4G]  = 'Cell 4G connection';
    states[Connection.CELL]     = 'Cell generic connection';
    states[Connection.NONE]     = 'No network connection';
    //alert('Connection type: ' + states[networkState]);
	if(navigator.notification) {
			navigator.notification.alert('Connection type: ' + states[networkState], null, 'PMP', 'Ok');
	 }else{
		alert('Connection type: ' + states[networkState]);
	 }*/		
	 var filename = $("#network_status_icon").attr("src");	
	 var splitArray = filename.lastIndexOf("/");
	 var newfilename = "";	 
	 if(networkState == Connection.NONE) {	 
		newfilename = filename.substring(0,splitArray)+'/'+'no_network_status.png';			
	 }else{	 
		newfilename = filename.substring(0,splitArray)+'/'+'network_status.png';			
	 }
	 $("#network_status_icon").attr("src",newfilename);
}

// onSuccess Geolocation
//
function onGeolocationSuccess(position) {
	/*var element = document.getElementById('geolocation');
	element.innerHTML = 'Latitude: '          + position.coords.latitude         + '<br />' +
						'Longitude: '         + position.coords.longitude        + '<br />' +
						'Altitude: '          + position.coords.altitude         + '<br />' +
						'Accuracy: '          + position.coords.accuracy         + '<br />' +
						'Altitude Accuracy: ' + position.coords.altitudeAccuracy + '<br />' +
						'Heading: '           + position.coords.heading          + '<br />' +
						'Speed: '             + position.coords.speed            + '<br />' +
						'Timestamp: '         + position.timestamp               + '<br />';*/
	//navigator.notification.alert('Latitude: ' + position.coords.latitude + ' Longitude: ' + position.coords.longitude, null, 'PMP', 'Ok');
	 var filename = $("#location_status_icon").attr("src");	
	 var splitArray = filename.lastIndexOf("/");
	 var newfilename = filename.substring(0,splitArray)+'/'+'location_available.png';			
	 $("#location_status_icon").attr("src",newfilename);
}

// onError Callback receives a PositionError object
//
function onGeolocationError(error) {
	/*alert('code: '    + error.code    + '\n' +
		  'message: ' + error.message + '\n');*/
    //navigator.notification.alert('code: ' + error.code    + '\n' + 'message: ' + error.message, null, 'PMP', 'Ok');
	var filename = $("#location_status_icon").attr("src");	
	var splitArray = filename.lastIndexOf("/");
	var newfilename = filename.substring(0,splitArray)+'/'+'location_status.png';	 
	$("#location_status_icon").attr("src",newfilename);
}

function login()
{
	//console.log('login');
	//checkConnection();    	
	if($('input[name="username"]').val() == '') {
		if(navigator.notification) {
			navigator.notification.alert("Username field is blank", null, 'Login', 'Ok');
		 }else{
			alert("Username field is blank");
		 }
	}else if($('input[name="password"]').val() == '') {
		if(navigator.notification) {
			navigator.notification.alert("Password field is blank", null, 'Login', 'Ok');
		}else{
			alert("Password field is blank");
		}
	}else{
	  showLoader();
	  $.ajax({
		  url: "https://support.mobiliseit.com/PMP/PDAservice.asmx/Authenticate",
		  type: "POST",
		  data: {userID: $('input[name="username"]').val(), password: $('input[name="password"]').val()},
		  dataType: 'json',
		  success:function(data, textStatus, jqXHR)
		  {
			hideLoader();
			//console.log(data.hasOwnProperty("dist_nrr"));
			if(data.hasOwnProperty("dist_nr"))
			{
				
				localStorage.setItem("dist_nr",data.dist_nr);
				//console.log('Distributor number is '+localStorage.getItem("dist_nr"));
				setTimeout(function(){
					//goTo('menu');
					$.mobile.changePage( "menu.html" ,{ transition: "slide"});
				});
				
			}else {
				//alert(data.Exception.Message);
				if(navigator.notification) {
					navigator.notification.alert(data.Exception.Message, null, 'Login', 'Ok');
				}else{
					alert(data.Exception.Message);
				}	

			}
		  },
		  error: function(jqXHR, textStatus, errorThrown)
		  {
			 hideLoader();
			 if(navigator.notification) {
				navigator.notification.alert("Network Connection Error "+errorThrown, null, 'Login', 'Ok');
			 }else{
				alert("Network Connection Error "+errorThrown);
				//$.mobile.changePage( "menu.html" ,{ transition: "slide"});
			 }			
		   }	  
		  });
    }	
}

function logout()
{
	var play_audit_sound ="no",play_query_sound="no";
	if(localStorage.getItem("play_audit_sound")!= null) {	
		play_audit_sound = localStorage.getItem("play_audit_sound");
	}	
	if(localStorage.getItem("play_query_sound")!= null) {	
		play_audit_sound = localStorage.getItem("play_query_sound");
	}
	localStorage.clear();
	setTimeout(function(){
		//document.location = "index.html";
		localStorage.setItem("play_audit_sound",play_audit_sound);
		localStorage.setItem("play_query_sound",play_query_sound);
		$.mobile.changePage( "main.html", { transition: "slide" , reverse : true} );
	});
}


function isBigEnough(element) {
  return element >= 10;
}
var filtered = [12, 5, 8, 130, 44].filter(isBigEnough);

function getAuditList()
{
	localStorage.setItem("screen","delivery_audit");
    var delivery_category_filter = 'All';
	if(localStorage.getItem('delivery_catalog_filter') != null) {	
		switch(localStorage.getItem('delivery_catalog_filter')) {
		  case 'all':                      
			delivery_category_filter = 'All';
			break;			
		  case 'C':                      
			delivery_category_filter = 'Catalogue';
			break;                     
		  case 'N':                      
			delivery_category_filter = 'News';
			break;                     
		  case 'A':                      
			delivery_category_filter = 'Address';
			break;                     
		  case 'Q':                      
			delivery_category_filter = 'Query';
			break;                     
		  default:		
			break;                     
		}
	}
	$("#catalog_type").html(delivery_category_filter);	
	showLoader();	
	//$("#delivery_audit").css({'background': 'url(images/tr_bg1.png)', 'height': $(this).height()});
	
	/*
				“cont_nr”  => Walker No,
				“cont_inv_nr” => CW
				“del_terr_cd” => DT number, 
				dist_nr    => AREA
				ivr_serv_dtime => current time,
				ivr_user_dtime => current time, 
				“deliveryday” => day name
	*/
	//alert(localStorage.getItem("dist_nr"));	
	$.ajax({
	  url: "https://support.mobiliseit.com/PMP/PDAservice.asmx/GetFromIvrByManager",
	  type: "POST",
	  data: {dist_nr: localStorage.getItem("dist_nr")},
	  dataType: 'json',
	  success:function(data, textStatus, jqXHR)
	  {
			//console.log(data.hasOwnProperty("dist_nrr"));from_ivr
			//console.log(JSON.stringify(data));			
			/*data= {"from_ivr":[{"cont_nr":9808236,"cont_inv_nr":377149125,"del_terr_cd":6,"dist_net_cd":"N","dist_nr":3050234,"ivr_serv_dtime":"\/Date(1382487136863)\/","ivr_user_dtime":null,"batch":69705,"DeliveryDay":null,"DeliveryDate":null},{"cont_nr":9806236,"cont_inv_nr":377149125,"del_terr_cd":6,"dist_net_cd":"N","dist_nr":3050234,"ivr_serv_dtime":"\/Date(1382487136863)\/","ivr_user_dtime":null,"batch":69705,"DeliveryDay":null,"DeliveryDate":null},{"cont_nr":9808636,"cont_inv_nr":377149125,"del_terr_cd":6,"dist_net_cd":"C","dist_nr":3050234,"ivr_serv_dtime":"\/Date(1382487136863)\/","ivr_user_dtime":null,"batch":69705,"DeliveryDay":null,"DeliveryDate":null},{"cont_nr":9908636,"cont_inv_nr":377149125,"del_terr_cd":6,"dist_net_cd":"Q","dist_nr":3050234,"ivr_serv_dtime":"\/Date(1382487136863)\/","ivr_user_dtime":null,"batch":69705,"DeliveryDay":null,"DeliveryDate":null},{"cont_nr":9918636,"cont_inv_nr":377149125,"del_terr_cd":6,"dist_net_cd":"Q","dist_nr":3050234,"ivr_serv_dtime":"\/Date(1382487136863)\/","ivr_user_dtime":null,"batch":69705,"DeliveryDay":null,"DeliveryDate":null},{"cont_nr":9918736,"cont_inv_nr":377149125,"del_terr_cd":6,"dist_net_cd":"Q","dist_nr":3050234,"ivr_serv_dtime":"\/Date(1382487136863)\/","ivr_user_dtime":null,"batch":69705,"DeliveryDay":null,"DeliveryDate":null},{"cont_nr":9918746,"cont_inv_nr":377149125,"del_terr_cd":6,"dist_net_cd":"N","dist_nr":3050234,"ivr_serv_dtime":"\/Date(1382487136863)\/","ivr_user_dtime":null,"batch":69705,"DeliveryDay":null,"DeliveryDate":null},{"cont_nr":9919746,"cont_inv_nr":377149125,"del_terr_cd":6,"dist_net_cd":"Q","dist_nr":3050234,"ivr_serv_dtime":"\/Date(1382487136863)\/","ivr_user_dtime":null,"batch":69705,"DeliveryDay":null,"DeliveryDate":null},{"cont_nr":9919746,"cont_inv_nr":377149125,"del_terr_cd":6,"dist_net_cd":"N","dist_nr":3050234,"ivr_serv_dtime":"\/Date(1382487136863)\/","ivr_user_dtime":null,"batch":69705,"DeliveryDay":null,"DeliveryDate":null},{"cont_nr":9919746,"cont_inv_nr":377149125,"del_terr_cd":6,"dist_net_cd":"A","dist_nr":3050234,"ivr_serv_dtime":"\/Date(1382487136863)\/","ivr_user_dtime":null,"batch":69705,"DeliveryDay":null,"DeliveryDate":null},{"cont_nr":9919746,"cont_inv_nr":377149125,"del_terr_cd":6,"dist_net_cd":"C","dist_nr":3050234,"ivr_serv_dtime":moment(),"ivr_user_dtime":null,"batch":69705,"DeliveryDay":null,"DeliveryDate":null}]};*/
			auditSuccess(data);
      },
      error: function(jqXHR, textStatus, errorThrown)	  
      {
            //if fails
		hideLoader();
		if(navigator.notification) {
			navigator.notification.alert("Network Connection Error "+errorThrown, function(){history.back()}, 'Delivery Audit', 'Ok');
		}else{
			alert("Network Connection Error "+errorThrown);
		}		
      }	  
	});	
}

function auditSuccess(data) {
    //alert(data);
    var selectAreaList = new Array();
	if(data.from_ivr.length)
	{	
		//$.get('audit_template.html', function(template_data) {
			//console.log(audit_template_html);
			var html = "";
			var catalogCount = 0;
			tempHTML = $("#audit_template").html();
			$.each(data.from_ivr, function(i,audits){
				//console.log(JSON.stringify(audits));
					
				//alert(tempHTML);			
				//tempHTML =  audit_template_html;
				tempHTML = tempHTML.replace(/{{DIST_NR}}/gi, audits.area_cd);
				tempHTML = tempHTML.replace(/{{CONT_INV_NR}}/gi, audits.cont_inv_nr);
				tempHTML = tempHTML.replace(/{{CONT_NR}}/gi, audits.cont_nr);		
				tempHTML = tempHTML.replace(/{{IVR_SERV_DTIME}}/gi, moment(audits.ivr_serv_dtime).format("DD MMM YYYY HH:mm"));
				tempHTML = tempHTML.replace(/{{DEL_TERR_CD}}/gi, audits.del_terr_cd);
				tempHTML = tempHTML.replace(/{{DIST_NET_CD}}/gi, audits.dist_net_cd);
				
				var ivr_time = moment(audits.ivr_serv_dtime);
				var now = moment();
				var difference_in_hours = now.diff(ivr_time, 'hours');
				var class_name ="";
				if(difference_in_hours >= 24) {
					class_name = "delivery_audit_bg1";
				}else if(difference_in_hours >= 12) {
					class_name = "delivery_audit_bg2";
				}else if(difference_in_hours < 12) {
					class_name = "delivery_audit_bg3";
				}
				/*if(i %2 == 0) {
					class_name = "delivery_audit_bg1";
				}else if(i%3==0) {
					class_name = "delivery_audit_bg2";
				}else {
					class_name = "delivery_audit_bg3";
				}*/
				tempHTML = tempHTML.replace(/{{class_name}}/gi, class_name);
				
				if(localStorage.getItem('delivery_catalog_filter') == null) {						
					
					if(localStorage.getItem("delivery_filter")== null) {
						
						if(selectAreaList.indexOf(audits.area_cd) == -1) {
							selectAreaList.push(audits.area_cd);
						}
						localStorage.setItem("deliverySelectAreaList",JSON.stringify(selectAreaList));
						//tempHTML = tempHTML.replace(/{{DIST_NR}}/gi, audits.dist_nr);
						html += tempHTML;
						catalogCount++;
					}else if(audits.area_cd == localStorage.getItem("delivery_filter")) {
						html += tempHTML;
						catalogCount++
					}
				}else if(audits.dist_net_cd == localStorage.getItem("delivery_catalog_filter")) {
					
					if(localStorage.getItem("delivery_filter")== null) {
						
						if(selectAreaList.indexOf(audits.area_cd) == -1) {
							selectAreaList.push(audits.area_cd);
						}
						localStorage.setItem("deliverySelectAreaList",JSON.stringify(selectAreaList));
						//tempHTML = tempHTML.replace(/{{DIST_NR}}/gi, audits.dist_nr);
						html += tempHTML;
						catalogCount++;
					}else if(audits.area_cd == localStorage.getItem("delivery_filter")) {
						html += tempHTML;
						catalogCount++
					}																	
				}
			});
			
			$("#catalog_count").html(' ('+catalogCount+') ');
			$("#delivery_audit_content").html( html );
			hideLoader();
			if(catalogCount == 0) {
				if(navigator.notification) {
					navigator.notification.alert("No Data found", null, 'Delivery Audit', 'Ok');
				}else{
					alert("No Data found");						
				}
			}
		//});
				
	}
	else 
	{
		hideLoader();
		if(navigator.notification) {
			navigator.notification.alert("No Data found", function(){goBack('menu')}, 'Delivery Audit', 'Ok');
		}else{
			alert("No Data found");
			setTimeout(function(){history.back()});
		}
	}

}

function deliveryCheck(walker_no,cw,dt,area)
{
		
	//console.log(walker_no+'-'+cw+'-'+dt+'-'+area);	
	localStorage.setItem("AUDIT_WALKER_NO",walker_no);
	localStorage.setItem("AUDIT_CW",cw);	
	localStorage.setItem("AUDIT_DT",dt);
	localStorage.setItem("AUDIT_AREA",area);
	goTo('deliverycheck');
	
}

function getAuditDetail()
{	
	var audit_detail_html = $("#audit_detail").html();

	var tempHTML = audit_detail_html;

    tempHTML = tempHTML.replace(/{{CONT_NR}}/gi, localStorage.getItem("AUDIT_WALKER_NO"));
	tempHTML = tempHTML.replace(/{{CONT_INV_NR}}/gi, localStorage.getItem("AUDIT_CW"));
	tempHTML = tempHTML.replace(/{{DEL_TERR_CD}}/gi, localStorage.getItem("AUDIT_DT"));
	tempHTML = tempHTML.replace(/{{DIST_NR}}/gi, localStorage.getItem("AUDIT_AREA"));
	
	$("#audit_detail").html(tempHTML);	
	
	localStorage.setItem("delivery_confirmation_count","0");
	
	checkDeviceStatus();
}

function delivery_confirmation_action() {
	
	var count = parseInt(localStorage.getItem("delivery_confirmation_count"));
	if(count < 6) {
	count++;
	localStorage.setItem("delivery_confirmation_count",count);
	$("#delivery_confirmation_count").text(count);
	}

}

function delivery_check_back() {
   
   /*if($.mobile.activePage.attr('id') == "delivery_check") {
		if(localStorage.getItem("delivery_confirmation_count") < 5) {
		
			if(navigator.notification) {
				navigator.notification.alert("Please complete at least 5 delivery confirmations", null, 'PMP', 'Ok');
			}else {
				alert("Please complete at least 5 delivery confirmations");
			}
		
		}else {
			localStorage.removeItem("delivery_confirmation_count");
			setTimeout(function(){back()});		
		}
	}else if($.mobile.activePage.attr('id') == "menu"){
		setTimeout(function(){back()});
	}*/
	if($.mobile.activePage.attr('id') != "menu"){
		setTimeout(function(){back()});
	}
}

function getOutstandingJobs()
{
	/*	Sample:{"to_ivr":[{"cont_nr":2203242,"del_terr_cd":90,"cont_inv_nr":377147913,"dist_nr":2203247,"first_nm":"Sergio","last_nm":"Rossi","old_cont_inv_nr":null,"start_dtime":"\/Date(1382360400000)\/","end_dtime":"\/Date(1382446800000)\/","dist_net_cd":"C","batch":179494,"area_cd":290}]}	
	*/
	//$("#Outstandingjob").css({'background': 'url(images/tr_bg1.png)', 'height': $(this).height()});
	
	localStorage.setItem("screen","Outstandingjob");
	showLoader();
		
	var selectAreaList = new Array();
	
	$.ajax({
	  url: "https://support.mobiliseit.com/PMP/PDAservice.asmx/GetToIvrByManager",
	  type: "POST",
	  data: {dist_nr: localStorage.getItem("dist_nr")},
	  dataType: 'json',
	  success:function(data, textStatus, jqXHR)
      {
			//console.log(data.hasOwnProperty("dist_nrr"));from_ivr
			
			/*data = {"to_ivr":[{"cont_nr":2203242,"del_terr_cd":90,"cont_inv_nr":377147913,"dist_nr":2203247,"first_nm":"Sergio","last_nm":"Rossi","old_cont_inv_nr":null,"start_dtime":"\/Date(1382360400000)\/","end_dtime":"\/Date(1382446800000)\/","dist_net_cd":"C","batch":179494,"area_cd":290},{"cont_nr":7203242,"del_terr_cd":90,"cont_inv_nr":377147913,"dist_nr":2203247,"first_nm":"Sergio","last_nm":"Rossi","old_cont_inv_nr":null,"start_dtime":"\/Date(1382360400000)\/","end_dtime":"\/Date(1382446800000)\/","dist_net_cd":"C","batch":179494,"area_cd":290},{"cont_nr":7203242,"del_terr_cd":90,"cont_inv_nr":377147913,"dist_nr":2203247,"first_nm":"Sergio","last_nm":"Rossi","old_cont_inv_nr":null,"start_dtime":"\/Date(1382360400000)\/","end_dtime":"\/Date(1382446800000)\/","dist_net_cd":"C","batch":179494,"area_cd":290},{"cont_nr":7203242,"del_terr_cd":90,"cont_inv_nr":377147913,"dist_nr":2203247,"first_nm":"Sergio","last_nm":"Rossi","old_cont_inv_nr":null,"start_dtime":"\/Date(1382360400000)\/","end_dtime":"\/Date(1382446800000)\/","dist_net_cd":"C","batch":179494,"area_cd":290},{"cont_nr":7203242,"del_terr_cd":90,"cont_inv_nr":377147913,"dist_nr":2203247,"first_nm":"Sergio","last_nm":"Rossi","old_cont_inv_nr":null,"start_dtime":"\/Date(1382360400000)\/","end_dtime":"\/Date(1382446800000)\/","dist_net_cd":"C","batch":179494,"area_cd":290},{"cont_nr":7203242,"del_terr_cd":90,"cont_inv_nr":377147913,"dist_nr":2203247,"first_nm":"Sergio","last_nm":"Rossi","old_cont_inv_nr":null,"start_dtime":"\/Date(1382360400000)\/","end_dtime":"\/Date(1382446800000)\/","dist_net_cd":"C","batch":179494,"area_cd":290}]};*/
			
			if(data.to_ivr && data.to_ivr.length)
			{
				var outstanding_jobs_template = $("#outstanding_jobs_template").html();

				//console.log(audit_template_html);
				var html = "";
				var tempHTML = "";
				$.each(data.to_ivr, function(i,outstandingJobs){
					//console.log(JSON.stringify(audits));
					tempHTML =  outstanding_jobs_template;
					tempHTML = tempHTML.replace(/{{AREA_CD}}/gi, outstandingJobs.area_cd);
					tempHTML = tempHTML.replace(/{{CONT_INV_NR}}/gi, outstandingJobs.cont_inv_nr);
					tempHTML = tempHTML.replace(/{{CONT_NR}}/gi, outstandingJobs.cont_nr);
					tempHTML = tempHTML.replace(/{{DIST_NR}}/gi, outstandingJobs.dist_nr);
					
					
					tempHTML = tempHTML.replace(/{{DEL_TERR_CD}}/gi, outstandingJobs.del_terr_cd);
					tempHTML = tempHTML.replace(/{{DIST_NET_CD}}/gi, outstandingJobs.dist_net_cd);
					
					if(localStorage.getItem("outstandingjob_filter")== null) {					
						if(selectAreaList.indexOf(outstandingJobs.area_cd) == -1) {
							selectAreaList.push(outstandingJobs.area_cd);
						}
						localStorage.setItem("outstandingJobSelectAreaList",JSON.stringify(selectAreaList));
						html += tempHTML;
					}else if(outstandingJobs.area_cd == localStorage.getItem("outstandingjob_filter")) {
						html += tempHTML;											
					}
				});
				$("#outstanding_jobs_content").html( html );
				hideLoader();
				//console.log(selectAreaList);				
				//console.log('Local Storage '+localStorage.getItem("selectAreaList"));
				
			}else {	
                hideLoader();			
				if(navigator.notification) {
					navigator.notification.alert("No Data found", function(){goBack('menu')}, 'Outstanding Jobs', 'Ok');
				}else{
					alert("No Data found");
					setTimeout(function(){history.back()});
				}				
			}
      },
      error: function(jqXHR, textStatus, errorThrown)
      {
        //if fails
		hideLoader();
		if(navigator.notification) {
			navigator.notification.alert("Network Connection Error "+errorThrown, function(){history.back()}, 'Outstanding Jobs', 'Ok');
		}else{
			alert("Network Connection Error "+errorThrown);
		}
      }
	});
}

function populateSelectList()
{		
	var selectArray = new Array();
	
	if(localStorage.getItem('screen')== 'delivery_audit') {
		selectArray = localStorage.getItem("deliverySelectAreaList");
	}else if(localStorage.getItem('screen')== 'Query') {
		selectArray = localStorage.getItem("querySelectAreaList");
	}else if(localStorage.getItem('screen')== 'Outstandingjob') {
		selectArray = localStorage.getItem("outstandingJobSelectAreaList");
	}	
	$.each(JSON.parse(selectArray), function(i,area){	
		
		$("#select_area_list").append('<div class="row-fluid"><div class="span10 offset1 area_list" onClick="filterData('+area+')">'+area+'</div></div>');		
	});	
}

function filterData(area)
{
    if(area != 'all') {
	    if(localStorage.getItem('screen')== 'delivery_audit') {
			localStorage.setItem('delivery_filter',area);
		}else if(localStorage.getItem('screen')== 'Query') {
			localStorage.setItem('query_filter',area);
		}else if(localStorage.getItem('screen')== 'Outstandingjob') {
			localStorage.setItem('outstandingjob_filter',area);
		}		
	}else{
		if(localStorage.getItem('screen')== 'delivery_audit') {
			localStorage.removeItem('delivery_filter');
		}else if(localStorage.getItem('screen')== 'Query') {
			localStorage.removeItem('query_filter');
		}else if(localStorage.getItem('screen')== 'Outstandingjob') {
			localStorage.removeItem('outstandingjob_filter');
		}
	}
	goTo(localStorage.getItem('screen'));	
}

function catalogfilter(filterType)
{
	closePopUp();
	if(filterType != 'all') {
		localStorage.setItem('delivery_catalog_filter',filterType);
	}else{
		localStorage.removeItem('delivery_catalog_filter');
	}
	$("#overlay .calagory").css("background-image","url(images/category_bg2.png)");
	setTimeout(function(){$("#overlay #"+filterType).css("background-image","url(images/category_hover2.png)");});	
	getAuditList();	
}


function getQueryList()
{
	/*
	{"queries_to_pda":[{"query_nr":728335,"dist_nr":3050234,"dist_net_cd":"N","query_job_nr":721795,"query_job_desc":"Job 721795 HOBSONS BAY LEADER [08 Oct 2013 to 09 Oct 2013] for 10 Oct 2013","query_job_dtime":"\/Date(1381064400000)\/","query_reported_dtime":"\/Date(1381804613240)\/","query_area_details":"159/24","query_type_desc":"Non delivery","query_detail":"no delivery for 3 years -|- Please investigate and respond within 72 hours. Thanks.","str_nr":"11/76","str_nm":"POINT COOK","str_type_cd":"RD","sub_nm":"SEABROOK","pc_cd":"3028","batch":141007}]}	
	*/
	
	//$("#query").css({'background': 'url(images/tr_bg1.png)', 'height': $(this).height()});
	localStorage.setItem("screen","Query");
	showLoader();
	
	var selectAreaList = new Array();
	
	$.ajax({
	  url: "https://support.mobiliseit.com/PMP/PDAservice.asmx/GetQueryToPdaByManager",
	  type: "POST",
	  data: {dist_nr: localStorage.getItem("dist_nr")},
	  dataType: 'json',
	  success:function(data, textStatus, jqXHR)
      {
			//console.log(data.hasOwnProperty("dist_nrr"));from_ivr	

			/*data = {"queries_to_pda":[{"query_nr":728335,"dist_nr":3050234,"dist_net_cd":"N","query_job_nr":721795,"query_job_desc":"Job 721795 HOBSONS BAY LEADER [08 Oct 2013 to 09 Oct 2013] for 10 Oct 2013","query_job_dtime":"\/Date(1381064400000)\/","query_reported_dtime":"\/Date(1381804613240)\/","query_area_details":"159/24","query_type_desc":"Non delivery","query_detail":"no delivery for 3 years -|- Please investigate and respond within 72 hours. Thanks.","str_nr":"11/76","str_nm":"POINT COOK","str_type_cd":"RD","sub_nm":"SEABROOK","pc_cd":"3028","batch":141007},{"query_nr":728335,"dist_nr":3050234,"dist_net_cd":"N","query_job_nr":721795,"query_job_desc":"Job 721795 HOBSONS BAY LEADER [08 Oct 2013 to 09 Oct 2013] for 10 Oct 2013","query_job_dtime":"\/Date(1381064400000)\/","query_reported_dtime":"\/Date(1381804613240)\/","query_area_details":"159/24","query_type_desc":"Non delivery","query_detail":"no delivery for 3 years -|- Please investigate and respond within 72 hours. Thanks.","str_nr":"11/76","str_nm":"POINT COOK","str_type_cd":"RD","sub_nm":"SEABROOK","pc_cd":"3028","batch":141007},{"query_nr":728335,"dist_nr":3050234,"dist_net_cd":"N","query_job_nr":721795,"query_job_desc":"Job 721795 HOBSONS BAY LEADER [08 Oct 2013 to 09 Oct 2013] for 10 Oct 2013","query_job_dtime":"\/Date(1381064400000)\/","query_reported_dtime":"\/Date(1381804613240)\/","query_area_details":"159/24","query_type_desc":"Non delivery","query_detail":"no delivery for 3 years -|- Please investigate and respond within 72 hours. Thanks.","str_nr":"11/76","str_nm":"POINT COOK","str_type_cd":"RD","sub_nm":"SEABROOK","pc_cd":"3028","batch":141007},{"query_nr":728335,"dist_nr":3050234,"dist_net_cd":"N","query_job_nr":721795,"query_job_desc":"Job 721795 HOBSONS BAY LEADER [08 Oct 2013 to 09 Oct 2013] for 10 Oct 2013","query_job_dtime":"\/Date(1381064400000)\/","query_reported_dtime":"\/Date(1381804613240)\/","query_area_details":"159/24","query_type_desc":"Non delivery","query_detail":"no delivery for 3 years -|- Please investigate and respond within 72 hours. Thanks.","str_nr":"11/76","str_nm":"POINT COOK","str_type_cd":"RD","sub_nm":"SEABROOK","pc_cd":"3028","batch":141007}]};*/
			
			
			if(data.queries_to_pda && data.queries_to_pda.length)
			{
				
				
				var query_template = $("#query_template").html();

				//console.log(audit_template_html);
				var html = "";
				var tempHTML = "";
				var queryCount = 0;
				$.each(data.queries_to_pda, function(i,query){
					//console.log(JSON.stringify(audits));
					tempHTML =  query_template;
					tempHTML = tempHTML.replace(/{{QUERY_NR}}/gi, query.query_nr);
					tempHTML = tempHTML.replace(/{{DIST_NR}}/gi, query.query_area_details);
					tempHTML = tempHTML.replace(/{{QUERY_DETAIL}}/gi, query.query_detail);
					tempHTML = tempHTML.replace(/{{QUERY_JOB_NR}}/gi, query.query_job_nr);
					tempHTML = tempHTML.replace(/{{QUERY_JOB_NR}}/gi, query.query_job_nr);
					tempHTML = tempHTML.replace(/{{DATE_WINDOW}}/gi,  moment(query.query_job_dtime).format("DD MMM YYYY"));			
                    
					var area_details = query.query_area_details;
					
					var parts = area_details.split("/");
					
					if(localStorage.getItem("query_filter")== null) {					
						if(selectAreaList.indexOf(parts[0]) == -1) {
							selectAreaList.push(parts[0]);
						}
						localStorage.setItem("querySelectAreaList",JSON.stringify(selectAreaList));
						html += tempHTML;
						queryCount++;
					}else if(parts[0] == localStorage.getItem("query_filter")) {
						html += tempHTML;
						queryCount++;
											
					}					
					//tempHTML = tempHTML.replace(/{{DEL_TERR_CD}}/gi, query.del_terr_cd);					
				});
                $("#query_count").html(queryCount);				
				$("#query_content").html( html );
				hideLoader();
				
			}else {	
                hideLoader();			
				if(navigator.notification) {
					navigator.notification.alert("No Data found", function(){goBack('menu')}, 'Query Inbox', 'Ok');
				}else{
					alert("No Data found");
					setTimeout(function(){history.back()});
				}				
			}
      },
      error: function(jqXHR, textStatus, errorThrown)
      {
        //if fails
		hideLoader();
		if(navigator.notification) {
			navigator.notification.alert("Network Connection Error "+errorThrown, function(){history.back()}, 'Query Inbox', 'Ok');
		}else{
			alert("Network Connection Error "+errorThrown);
		}
      }
	});
}

$(document).on("pageshow", "#delivery_audit", function( event ) {
	getAuditList();
});

$(document).on("pagebeforeshow", "#delivery_check", function( event ) {
	getAuditDetail();	
});

$(document).on("pageshow", "#query", function( event ) {
	getQueryList();
});

$(document).on("pageshow", "#Outstandingjob", function( event ) {
	getOutstandingJobs();
});

$(document).on("pageshow", "#selectarea", function( event ) {
	populateSelectList();
});

$(document).on("pageshow", "#settings", function( event ) {
	$(".settings_icon").click(function(){
		$(this).toggleClass("thikbg");
			if($(this).attr("id") == "play_audit_sound") {
				if($(this).hasClass("thikbg")) {
					localStorage.setItem("play_audit_sound","yes");
				}
				else {
					localStorage.setItem("play_audit_sound","no");
				}
			}else{
				if($(this).hasClass("thikbg")) {
					localStorage.setItem("play_query_sound","yes");
				}
				else {
					localStorage.setItem("play_query_sound","no");
				}
			}					
		});
	setTimeout(function(){loadPreferences()});	
});

function loadPreferences() {

	if(localStorage.getItem("play_audit_sound")!= null && localStorage.getItem("play_audit_sound") == "yes") {	
		if(!$("#play_audit_sound").hasClass("thikbg")) {
			$("#play_audit_sound").toggleClass("thikbg");
		}
	}
	
	if(localStorage.getItem("play_query_sound")!= null && localStorage.getItem("play_query_sound") == "yes") {
		if(!$("#play_query_sound").hasClass("thikbg")) {
			$("#play_query_sound").toggleClass("thikbg");
		}
	}						
}