var queryList = new Array();
var checkDataCron = false;
var auditListRequestInProgress = false;
var queryListRequestInProgress = false;
var outstandingListRequestInProgress = false;
var savingAuditListDataToDb = false;
var savingQueryListDataToDb = false;
var savingOutstandingListDataToDb = false;
var savingDeliveryChecksDataToDb = false;
var savingQuerySubmitDataToDb = false;
var localDatabaseInstance = false;
var serviceResponseForAuditList = "";
var serviceResponseForQuery = "";
var serviceResponseForOutstandingJobs = "";
var checkNewDataRequestInProgress = false;
var submittedChecks = [];
var submittedQueries = [];
var submitDeliveryChecksCron = false; 
var submitQueriesCron = false;

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
	//alert('dg');
	$(".alert_confirmation").css("margin-top","0px");	
	$("#overlayOutstanding").css("padding-top",window.innerHeight/4);
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
	$("#loaderOverlay #custom").css("marginTop",window.innerHeight/3);
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
	$(".alert_confirmation").css("margin-top","0px");	
	$("#overlay").css("padding-top",window.innerHeight/6);
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
	//console.log('del_terr_cd'+$('span.del_terr_cd').first().html());
	//console.log('cont_inv_nr'+$('span.cont_inv_nr').first().html());
	showLoader();
	//var UTCstring = (new Date()).toUTCString();
	//console.log(UTCstring);	
    $.ajax({
	  url: "https://support.mobiliseit.com/PMP/PDAservice.asmx/markCompleted",
	  type: "POST",
	  timeout: 60000 ,
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
	navigator.splashscreen.hide();
	//alert('onDeviceReady');
	/*navigator.geolocation.getCurrentPosition(function(position){alert('Latitude: '+ position.coords.latitude+'Longitude: '+ position.coords.longitude);}, function(error){ alert('code: '    + error.code    + '\n' +
          'message: ' + error.message + '\n');
});*/
    showLoader();
	localStorage.setItem("location_error","location timeout");
	
	var options = { timeout: 60000 , maximumAge: 3000 , enableHighAccuracy: true};
    //watchID = navigator.geolocation.watchPosition(onGeolocationSuccess, onGeolocationError, options);
	navigator.geolocation.getCurrentPosition(onGeolocationSuccess, onGeolocationError, options);

	//navigator.notification.alert("Unique identifier "+device.uuid, null, 'PMP', 'Ok');
	 localStorage.setItem("unique_identifier",device.uuid);
	 
	 if(localDatabaseInstance == false) {
		localDatabaseInstance = openDatabase("PMP Database", "1.0", "PMP Database", 200000);
	 }
    
}

function checkNewDataFromServer()
{
	if(localStorage.getItem("dist_nr") != null && checkNewDataRequestInProgress == false) {
	    checkNewDataRequestInProgress = true;
		$.ajax({
		  url: "https://support.mobiliseit.com/PMP/PDAservice.asmx/GetAnchor?dist_nr="+localStorage.getItem("dist_nr"),
		  timeout: 60000 ,
		  dataType: 'json',	  
		  success:function(data, textStatus, jqXHR)
		  {		
			checkNewDataRequestInProgress = false;
			console.log(JSON.stringify(data));
			if(localStorage.getItem("LastFromIvrTime") == null) {
				if(auditListRequestInProgress == false) {
					localStorage.setItem("LastFromIvrTime",data.LastFromIvrTime);
					//downloadAuditList();
					if(localStorage.getItem("play_audit_sound")!= null && localStorage.getItem("play_audit_sound") == "yes") {	
						if(navigator.notification) {
							navigator.notification.beep(2);
						}
					}
				}
			}else {
				if(localStorage.getItem("LastFromIvrTime") != data.LastFromIvrTime) {
					// download audit list from server
					if(auditListRequestInProgress == false) {
						localStorage.setItem("LastFromIvrTime",data.LastFromIvrTime);
						//downloadAuditList();
						if(localStorage.getItem("play_audit_sound")!= null && localStorage.getItem("play_audit_sound") == "yes") {	
							if(navigator.notification) {
								navigator.notification.beep(2);
							}
						}
					}
				}
			}
			if(localStorage.getItem("MaxToIvrBatch") == null) {
				if(outstandingListRequestInProgress == false) {
					localStorage.setItem("MaxToIvrBatch",data.MaxToIvrBatch);
					//downloadOutstandingList();
				}
			}else{
				if(localStorage.getItem("MaxToIvrBatch") != data.MaxToIvrBatch) {
					// download outstanding job list from server
					if(outstandingListRequestInProgress == false) {
						localStorage.setItem("MaxToIvrBatch",data.MaxToIvrBatch);
						//downloadOutstandingList();
					}
				}
			}
			if(localStorage.getItem("MaxQueryToPdarBatch") == null) {
				if(queryListRequestInProgress == false) {
					localStorage.setItem("MaxQueryToPdarBatch",data.MaxQueryToPdarBatch);
					//downloadQueryList();
					if(localStorage.getItem("play_query_sound")!= null && localStorage.getItem("play_query_sound") == "yes") {
						if(navigator.notification) {
								navigator.notification.beep(2);
						}
					}
				}
     		}else{
				if(localStorage.getItem("MaxQueryToPdarBatch") != data.MaxQueryToPdarBatch) {
					// download query list from server
					if(queryListRequestInProgress == false) {
						localStorage.setItem("MaxQueryToPdarBatch",data.MaxQueryToPdarBatch);
						//downloadQueryList();
						if(localStorage.getItem("play_query_sound")!= null && localStorage.getItem("play_query_sound") == "yes") {
							if(navigator.notification) {
								navigator.notification.beep(2);
							}
						}
					}
				}
            }
		  },
		  error: function(jqXHR, textStatus, errorThrown)
		  {
			checkNewDataRequestInProgress = false;
		  }	  
		});
	}
}

/*******  Query List save to Database  ******/

function downloadQueryList() {

	queryListRequestInProgress = true;
	if(localStorage.getItem("dist_nr") != null) {
		$.ajax({
		  url: "https://support.mobiliseit.com/PMP/PDAservice.asmx/GetQueryToPdaByManager?dist_nr="+localStorage.getItem("dist_nr"),
		  timeout: 60000 ,
		  dataType: 'json',
		  success:function(data, textStatus, jqXHR)
		  {
			queryListRequestInProgress = false;
			serviceResponseForQuery = data.queries_to_pda;
			if(savingQueryListDataToDb == false) {
				savingQueryListDataToDb = true;			
				localDatabaseInstance = openDatabase("PMP Database", "1.0", "PMP Database", 200000);
				localDatabaseInstance.transaction(dropQueryTable, function(){savingQueryListDataToDb = false}, dropQueryTableComplete);
			}
		  },
		  error: function(jqXHR, textStatus, errorThrown)
		  { queryListRequestInProgress = false;}
        });		  
	}
}

function dropQueryTable(tx) {
     tx.executeSql('DROP TABLE IF EXISTS QUERIES');     
}

function dropQueryTableComplete() {
	localDatabaseInstance = openDatabase("PMP Database", "1.0", "PMP Database", 200000);
    localDatabaseInstance.transaction(createQueryTable, function(){savingQueryListDataToDb = false}, createQueryTableComplete);
}

function createQueryTable(tx) {
     tx.executeSql('CREATE TABLE IF NOT EXISTS QUERIES (query_nr, dist_nr, dist_net_cd, query_job_nr, query_job_desc, query_job_dtime, query_reported_dtime, query_area_details, query_type_desc, query_detail, str_nr, str_nm, str_type_cd, sub_nm, pc_cd, batch )');     
}

function createQueryTableComplete() {
    //alert('createQueryTableComplete');
	saveQueryListDataToDb(serviceResponseForQuery,0);
}


function saveQueryListDataToDb(serviceResponseForQuery,i)
{
	//console.log("Query List Length : " + serviceResponseForQuery.length + " i : " + i);
    if (i < serviceResponseForQuery.length) {
        localDatabaseInstance = openDatabase("PMP Database", "1.0", "PMP Database", 200000);
        localDatabaseInstance.transaction(function insertUserPrefDB(tx) {
            tx.executeSql("INSERT INTO QUERIES ( query_nr, dist_nr, dist_net_cd, query_job_nr, query_job_desc, query_job_dtime, query_reported_dtime, query_area_details, query_type_desc, query_detail, str_nr, str_nm, str_type_cd, sub_nm, pc_cd, batch) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
              [serviceResponseForQuery[i].query_nr, serviceResponseForQuery[i].dist_nr, serviceResponseForQuery[i].dist_net_cd, serviceResponseForQuery[i].query_job_nr, serviceResponseForQuery[i].query_job_desc, serviceResponseForQuery[i].query_job_dtime, serviceResponseForQuery[i].query_reported_dtime, serviceResponseForQuery[i].query_area_details, serviceResponseForQuery[i].query_type_desc, serviceResponseForQuery[i].query_detail, serviceResponseForQuery[i].str_nr, serviceResponseForQuery[i].str_nm, serviceResponseForQuery[i].str_type_cd, serviceResponseForQuery[i].sub_nm, serviceResponseForQuery[i].pc_cd, serviceResponseForQuery[i].batch],function(){},function(){savingQueryListDataToDb = false});
        }, function(){savingQueryListDataToDb = false}, function successCB() {
            /* Recursive Function For Inserting the State in Local Db */
            saveQueryListDataToDb(serviceResponseForQuery, (i + 1));
        });
    }
    else {
		savingQueryListDataToDb = false;
        serviceResponseForQuery = "";
        console.log('Query List Inserted Successfully');		
    }
} 

/*******  Query List save to Database  ******/

/******  Outstanding Jobs List ****************/

function downloadOutstandingList()
{	
	outstandingListRequestInProgress = true;
	if(localStorage.getItem("dist_nr") != null) {
		$.ajax({
		  url: "https://support.mobiliseit.com/PMP/PDAservice.asmx/GetToIvrByManager?dist_nr="+localStorage.getItem("dist_nr"),
		  timeout: 60000 ,
		  dataType: 'json',
		  success:function(data, textStatus, jqXHR)
		  {
			outstandingListRequestInProgress = false;
			serviceResponseForOutstandingJobs = data.to_ivr;
			if(savingOutstandingListDataToDb == false) {
				savingOutstandingListDataToDb = true;			
				localDatabaseInstance = openDatabase("PMP Database", "1.0", "PMP Database", 200000);
				localDatabaseInstance.transaction(dropOutstandingJobsTable, function(){savingOutstandingListDataToDb = false}, dropOutstandingJobsTableComplete);
			}
		  },
		  error: function(jqXHR, textStatus, errorThrown)
		  { outstandingListRequestInProgress = false; }
        });		  
	}
}

function dropOutstandingJobsTable(tx) {
     tx.executeSql('DROP TABLE IF EXISTS OUTSTANDINGJOBS');     
}

function dropOutstandingJobsTableComplete() {
	localDatabaseInstance = openDatabase("PMP Database", "1.0", "PMP Database", 200000);
    localDatabaseInstance.transaction(createOutstandingJobsTable, function(){savingOutstandingListDataToDb = false}, createOutstandingJobsTableComplete);
}

function createOutstandingJobsTable(tx) {
     tx.executeSql('CREATE TABLE IF NOT EXISTS OUTSTANDINGJOBS (cont_nr, del_terr_cd, cont_inv_nr, dist_nr, first_nm, last_nm, old_cont_inv_nr, start_dtime, end_dtime, dist_net_cd, batch, area_cd )');     
}

function createOutstandingJobsTableComplete() {
    //alert('createQueryTableComplete');
	saveOutstandingJobsListDataToDb(serviceResponseForOutstandingJobs,0);
}

function saveOutstandingJobsListDataToDb(serviceResponseForOutstandingJobs,j)
{
	//console.log("Outstanding List Length : " + serviceResponseForOutstandingJobs.length + " j : " + j);
    if (j < serviceResponseForOutstandingJobs.length) {
        localDatabaseInstance = openDatabase("PMP Database", "1.0", "PMP Database", 200000);
        localDatabaseInstance.transaction(function insertUserPrefDB(tx) {
            tx.executeSql("INSERT INTO OUTSTANDINGJOBS ( cont_nr, del_terr_cd, cont_inv_nr, dist_nr, first_nm, last_nm, old_cont_inv_nr, start_dtime, end_dtime, dist_net_cd, batch, area_cd) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
              [serviceResponseForOutstandingJobs[j].cont_nr, serviceResponseForOutstandingJobs[j].del_terr_cd, serviceResponseForOutstandingJobs[j].cont_inv_nr, serviceResponseForOutstandingJobs[j].dist_nr, serviceResponseForOutstandingJobs[j].first_nm, serviceResponseForOutstandingJobs[j].last_nm, serviceResponseForOutstandingJobs[j].old_cont_inv_nr, serviceResponseForOutstandingJobs[j].start_dtime, serviceResponseForOutstandingJobs[j].end_dtime, serviceResponseForOutstandingJobs[j].dist_net_cd, serviceResponseForOutstandingJobs[j].batch, serviceResponseForOutstandingJobs[j].area_cd],function(){},function(){savingOutstandingListDataToDb = false});
        }, function(){savingOutstandingListDataToDb = false}, function successCB() {
            /* Recursive Function For Inserting the State in Local Db */
            saveOutstandingJobsListDataToDb(serviceResponseForOutstandingJobs, (j + 1));
        });
    }
    else {
		savingOutstandingListDataToDb = false;
		serviceResponseForOutstandingJobs = "";
        console.log('Outstanding Job List Inserted Successfully');		
    }
}

/******  Outstanding Jobs List ****************/

/***************  Delivery audit List     ****************/

function downloadAuditList()
{	
	auditListRequestInProgress = true;
	if(localStorage.getItem("dist_nr") != null) {
		$.ajax({
		  url: "https://support.mobiliseit.com/PMP/PDAservice.asmx/GetFromIvrByManager?dist_nr="+localStorage.getItem("dist_nr"),
		  timeout: 60000 ,
		  dataType: 'json',
		  success:function(data, textStatus, jqXHR)
		  {
			auditListRequestInProgress = false;
			serviceResponseForAuditList = data.from_ivr;
			if(savingAuditListDataToDb == false) {
				savingAuditListDataToDb = true;			
				localDatabaseInstance = openDatabase("PMP Database", "1.0", "PMP Database", 200000);
				localDatabaseInstance.transaction(dropAuditListTable, function(){savingAuditListDataToDb = false}, dropAuditListTableComplete);
			}
		  },
		  error: function(jqXHR, textStatus, errorThrown)
		  { auditListRequestInProgress = false; }
        });		  
	}
}

function dropAuditListTable(tx) {
     tx.executeSql('DROP TABLE IF EXISTS DELIVERY_AUDIT');     
}

function dropAuditListTableComplete() {
	localDatabaseInstance = openDatabase("PMP Database", "1.0", "PMP Database", 200000);
    localDatabaseInstance.transaction(createAuditListTable, function(){savingAuditListDataToDb = false}, createAuditListTableComplete);
}

function createAuditListTable(tx) {
     tx.executeSql('CREATE TABLE IF NOT EXISTS DELIVERY_AUDIT (cont_nr, cont_inv_nr, del_terr_cd, dist_net_cd, dist_nr, ivr_serv_dtime, ivr_user_dtime, batch, DeliveryDay, DeliveryDate )');     
}

function createAuditListTableComplete() {
    //alert('createQueryTableComplete');
	saveAuditListDataToDb(serviceResponseForAuditList,0);
}

function saveAuditListDataToDb(serviceResponseForAuditList,k)
{
	//console.log("Outstanding List Length : " + serviceResponseForAuditList.length + " j : " + j);
    if (k < serviceResponseForAuditList.length) {
        localDatabaseInstance = openDatabase("PMP Database", "1.0", "PMP Database", 200000);
        localDatabaseInstance.transaction(function insertUserPrefDB(tx) {
            tx.executeSql("INSERT INTO DELIVERY_AUDIT ( cont_nr, cont_inv_nr, del_terr_cd, dist_net_cd, dist_nr, ivr_serv_dtime, ivr_user_dtime, batch, DeliveryDay, DeliveryDate) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ? )",
              [serviceResponseForAuditList[k].cont_nr, serviceResponseForAuditList[k].cont_inv_nr, serviceResponseForAuditList[k].del_terr_cd, serviceResponseForAuditList[k].dist_net_cd, serviceResponseForAuditList[k].dist_nr, serviceResponseForAuditList[k].ivr_serv_dtime, serviceResponseForAuditList[k].ivr_user_dtime, serviceResponseForAuditList[k].batch, serviceResponseForAuditList[k].DeliveryDay, serviceResponseForAuditList[k].DeliveryDate],function(){},function(){savingAuditListDataToDb = false});
        }, function(){savingAuditListDataToDb = false}, function successCB() {
            /* Recursive Function For Inserting the State in Local Db */
            saveAuditListDataToDb(serviceResponseForAuditList, (k + 1));
        });
    }
    else {
		savingAuditListDataToDb = false;
		serviceResponseForAuditList = "";
        console.log('Audit List Inserted Successfully');		
    }
}

/***************  Delivery audit List     ****************/

function checkDeviceStatus() {
	
	if(navigator.connection) {		
		// Update network icon 			
		var networkState = navigator.connection.type;		
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

    if(navigator.geolocation) {			
		
		navigator.geolocation.getCurrentPosition(function(position){
			filename = $("#location_status_icon").attr("src");	
			splitArray = filename.lastIndexOf("/");
			newfilename = filename.substring(0,splitArray)+'/'+'location_available.png';			
			$("#location_status_icon").attr("src",newfilename);
			/*if(!$("#check_submit_btn").hasClass("input_bg")) {
				$("#check_submit_btn").addClass("input_bg");
			}*/
			if($("#check_submit_btn").hasClass("disable")) {
				$("#check_submit_btn").removeClass("disable");
			}	
		}, function(error){			
			filename = $("#location_status_icon").attr("src");	
			splitArray = filename.lastIndexOf("/");
			newfilename = filename.substring(0,splitArray)+'/'+'location_status.png';	 
			$("#location_status_icon").attr("src",newfilename);
			/*if($("#check_submit_btn").hasClass("input_bg")) {
				$("#check_submit_btn").removeClass("input_bg");
			}*/
			if(!$("#check_submit_btn").hasClass("disable")) {
				$("#check_submit_btn").addClass("disable");
			}
		} , {  maximumAge: 3000, timeout: 60000, enableHighAccuracy: true });				
	}
}

function deliveryCheckRefresh() {
	showLoader();
	setTimeout(function(){hideLoader();},3000);
	checkDeviceStatus();

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
	 //alert('Latitude: ' + position.coords.latitude + ' Longitude: ' + position.coords.longitude, null, 'PMP', 'Ok');
	 localStorage.setItem("device_latitude",position.coords.latitude);
	 localStorage.setItem("device_longitude",position.coords.longitude);
     localStorage.setItem("location_error","nil");
	 hideLoader();
     if(navigator.notification) {
			navigator.notification.alert("Location determined successfully", null, 'PMP', 'Ok');
	 }else{
		alert("Network Connection Error "+errorThrown);
	 }
}

// onError Callback receives a PositionError object
//
function onGeolocationError(error) {
	/*alert('code: '    + error.code    + '\n' +
		  'message: ' + error.message + '\n');*/
    //navigator.notification.alert('code: ' + error.code    + '\n' + 'message: ' + error.message, null, 'PMP', 'Ok');
	//alert('code: ' + error.code    + '\n' + 'message: ' + error.message, null, 'PMP', 'Ok');
	localStorage.setItem("location_error",error.message);
    hideLoader();
    if(navigator.notification) {
			navigator.notification.alert("Location could not be determined due to "+error.message, null, 'PMP', 'Ok');
	 }else{
		alert("Network Connection Error "+errorThrown);
	 }	
}

function login()
{
	//console.log('login');
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
	  //alert(window.innerHeight);
      if($('input[name="username"]').val() == 'admin' && $('input[name="password"]').val() == 'admin') {
		setTimeout(function(){
			//goTo('menu');
			hideLoader();
			$.mobile.changePage( "freecheck.html" ,{ transition: "slide"});
		},1000);	  
	  }else{
		  $.ajax({
			  url: "https://support.mobiliseit.com/PMP/PDAservice.asmx/Authenticate",
			  type: "POST",
			  timeout: 60000 ,
			  data: {userID: $('input[name="username"]').val(), password: $('input[name="password"]').val()},
			  dataType: 'json',
			  success:function(data, textStatus, jqXHR)
			  {
				hideLoader();
				//console.log(data.hasOwnProperty("dist_nrr"));
				if(data.hasOwnProperty("dist_nr"))
				{
					
					localStorage.setItem("dist_nr",data.dist_nr);
					localStorage.setItem("distName",data.dist_nm);
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
}

function logout()
{
	var play_audit_sound ="no",play_query_sound="no";
	if(localStorage.getItem("play_audit_sound")!= null) {	
		play_audit_sound = localStorage.getItem("play_audit_sound");
	}	
	if(localStorage.getItem("play_query_sound")!= null) {	
		play_query_sound = localStorage.getItem("play_query_sound");
	}
	setTimeout(function(){
		localStorage.clear();
	});
	setTimeout(function(){
		//document.location = "index.html";
		localStorage.setItem("play_audit_sound",play_audit_sound);
		localStorage.setItem("play_query_sound",play_query_sound);
		//alert(play_audit_sound+' : '+play_query_sound);
		clearTimeout(checkDataCron);
		checkDataCron = false;
		$.mobile.changePage( "index.html", { transition: "slide" , reverse : true} );
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
    auditListRequestInProgress = true;	
	$.ajax({
	  url: "https://support.mobiliseit.com/PMP/PDAservice.asmx/GetFromIvrByManager",
	  type: "POST",
	  timeout: 60000 ,
	  data: {dist_nr: localStorage.getItem("dist_nr")},
	  dataType: 'json',
	  success:function(data, textStatus, jqXHR)
	  {
			//console.log(data.hasOwnProperty("dist_nrr"));from_ivr
			//console.log(JSON.stringify(data));			
			/*data= {"from_ivr":[{"cont_nr":9808236,"cont_inv_nr":377149125,"del_terr_cd":6,"dist_net_cd":"N","area_cd":3050234,"ivr_serv_dtime":"\/Date(1382487136863)\/","ivr_user_dtime":null,"batch":69705,"DeliveryDay":null,"DeliveryDate":null},{"cont_nr":9806236,"cont_inv_nr":377149125,"del_terr_cd":6,"dist_net_cd":"N","area_cd":3050234,"ivr_serv_dtime":"\/Date(1382487136863)\/","ivr_user_dtime":null,"batch":69705,"DeliveryDay":null,"DeliveryDate":null},{"cont_nr":9808636,"cont_inv_nr":377149125,"del_terr_cd":6,"dist_net_cd":"C","area_cd":3050234,"ivr_serv_dtime":"\/Date(1382487136863)\/","ivr_user_dtime":null,"batch":69705,"DeliveryDay":null,"DeliveryDate":null},{"cont_nr":9908636,"cont_inv_nr":377149125,"del_terr_cd":6,"dist_net_cd":"Q","area_cd":3050234,"ivr_serv_dtime":"\/Date(1382487136863)\/","ivr_user_dtime":null,"batch":69705,"DeliveryDay":null,"DeliveryDate":null},{"cont_nr":9918636,"cont_inv_nr":377149125,"del_terr_cd":6,"dist_net_cd":"Q","area_cd":3050234,"ivr_serv_dtime":"\/Date(1382487136863)\/","ivr_user_dtime":null,"batch":69705,"DeliveryDay":null,"DeliveryDate":null},{"cont_nr":9918736,"cont_inv_nr":377149125,"del_terr_cd":6,"dist_net_cd":"Q","area_cd":3050234,"ivr_serv_dtime":"\/Date(1382487136863)\/","ivr_user_dtime":null,"batch":69705,"DeliveryDay":null,"DeliveryDate":null},{"cont_nr":9918746,"cont_inv_nr":377149125,"del_terr_cd":6,"dist_net_cd":"N","area_cd":3050234,"ivr_serv_dtime":"\/Date(1382487136863)\/","ivr_user_dtime":null,"batch":69705,"DeliveryDay":null,"DeliveryDate":null},{"cont_nr":9919746,"cont_inv_nr":377149125,"del_terr_cd":6,"dist_net_cd":"Q","area_cd":3050234,"ivr_serv_dtime":"\/Date(1382487136863)\/","ivr_user_dtime":null,"batch":69705,"DeliveryDay":null,"DeliveryDate":null},{"cont_nr":9919746,"cont_inv_nr":377149125,"del_terr_cd":6,"dist_net_cd":"N","area_cd":3050234,"ivr_serv_dtime":"\/Date(1382487136863)\/","ivr_user_dtime":null,"batch":69705,"DeliveryDay":null,"DeliveryDate":null},{"cont_nr":9919746,"cont_inv_nr":377149125,"del_terr_cd":6,"dist_net_cd":"A","area_cd":3050234,"ivr_serv_dtime":"\/Date(1382487136863)\/","ivr_user_dtime":null,"batch":69705,"DeliveryDay":null,"DeliveryDate":null},{"cont_nr":9919746,"cont_inv_nr":377149125,"del_terr_cd":6,"dist_net_cd":"C","area_cd":3050234,"ivr_serv_dtime":moment(),"ivr_user_dtime":null,"batch":69705,"DeliveryDay":null,"DeliveryDate":null}]};*/
			auditListRequestInProgress = false;	 
			auditSuccess(data);
      },
      error: function(jqXHR, textStatus, errorThrown)	  
      {
            //if fails
		auditListRequestInProgress = false;
		hideLoader();
		/*if(navigator.notification) {
			navigator.notification.alert("Network Connection Error "+errorThrown, function(){history.back()}, 'Delivery Audit', 'Ok');
		}else{
			alert("Network Connection Error "+errorThrown);
		}*/
        readAuditsFromDatabase();		
      }	  
	});	
}

function auditSuccess(data) 
{
    var selectAreaList = new Array();
	if(data.from_ivr.length)
	{	
		var html = "";
		var catalogCount = 0;
		
		var audit_template_html = $("#audit_template").html();
		
		$.each(data.from_ivr, function(i,audits){
			//console.log(JSON.stringify(audits));
			tempHTML =  audit_template_html;
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
		
		/***  Save a copy of the data to local database  ***/
		
		serviceResponseForAuditList = data.from_ivr;
		if(savingAuditListDataToDb == false) {
			savingAuditListDataToDb = true;			
			localDatabaseInstance = openDatabase("PMP Database", "1.0", "PMP Database", 200000);
			localDatabaseInstance.transaction(dropAuditListTable, function(){savingAuditListDataToDb = false}, dropAuditListTableComplete);
		}
		
		/***  Save a copy of the data to local database  ***/
		
		if(catalogCount == 0) {
			if(navigator.notification) {
				navigator.notification.alert("No Data found", null, 'Delivery Audit', 'Ok');
			}else{
				alert("No Data found");						
			}
		}						
	}
	else 
	{
		hideLoader();
		if(navigator.notification) {
			navigator.notification.alert("No Data found", function(){goBack('menu')}, 'Delivery Audit', 'Ok');
		}else{
			alert("No Data found");
			setTimeout(function(){goBack('menu')});
		}
	}
}

function readAuditsFromDatabase()
{		 
	localDatabaseInstance = openDatabase("PMP Database", "1.0", "PMP Database", 200000);
	localDatabaseInstance.transaction(queryreadAudits, function(err){console.log("Error processing SQL: "+err.code+' '+err.message)});		
}

function queryreadAudits(tx) {
        tx.executeSql('SELECT * FROM DELIVERY_AUDIT', [], auditSuccessOffline, function(err){console.log("Error processing SQL: "+err.code+' '+err.message)});
}

function auditSuccessOffline(tx, results) {
	var len = results.rows.length;
    console.log("DELIVERY_AUDIT table: " + len + " rows found.");
	if(len > 0) {
	
		var selectAreaList = new Array();			
		var html = "";
		var catalogCount = 0;		
		var audit_template_html = $("#audit_template").html();
		//results.rows.item(counter)
		var selectAreaList = new Array();
		for(i =0; i < len; i++){
						
			tempHTML =  audit_template_html;
			tempHTML = tempHTML.replace(/{{DIST_NR}}/gi, results.rows.item(i).area_cd);
			tempHTML = tempHTML.replace(/{{CONT_INV_NR}}/gi, results.rows.item(i).cont_inv_nr);
			tempHTML = tempHTML.replace(/{{CONT_NR}}/gi, results.rows.item(i).cont_nr);		
			tempHTML = tempHTML.replace(/{{IVR_SERV_DTIME}}/gi, moment(results.rows.item(i).ivr_serv_dtime).format("DD MMM YYYY HH:mm"));
			tempHTML = tempHTML.replace(/{{DEL_TERR_CD}}/gi, results.rows.item(i).del_terr_cd);
			tempHTML = tempHTML.replace(/{{DIST_NET_CD}}/gi, results.rows.item(i).dist_net_cd);
			
			var ivr_time = moment(results.rows.item(i).ivr_serv_dtime);
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
			tempHTML = tempHTML.replace(/{{class_name}}/gi, class_name);
			
			if(localStorage.getItem('delivery_catalog_filter') == null) {						
				
				if(localStorage.getItem("delivery_filter")== null) {
					
					if(selectAreaList.indexOf(results.rows.item(i).area_cd) == -1) {
						selectAreaList.push(results.rows.item(i).area_cd);
					}
					localStorage.setItem("deliverySelectAreaList",JSON.stringify(selectAreaList));
					//tempHTML = tempHTML.replace(/{{DIST_NR}}/gi, audits.dist_nr);
					html += tempHTML;
					catalogCount++;
				}else if(results.rows.item(i).area_cd == localStorage.getItem("delivery_filter")) {
					html += tempHTML;
					catalogCount++
				}
			}else if(results.rows.item(i).dist_net_cd == localStorage.getItem("delivery_catalog_filter")) {
				
				if(localStorage.getItem("delivery_filter")== null) {
					
					if(selectAreaList.indexOf(results.rows.item(i).area_cd) == -1) {
						selectAreaList.push(results.rows.item(i).area_cd);
					}
					localStorage.setItem("deliverySelectAreaList",JSON.stringify(selectAreaList));
					//tempHTML = tempHTML.replace(/{{DIST_NR}}/gi, audits.dist_nr);
					html += tempHTML;
					catalogCount++;
				}else if(results.rows.item(i).area_cd == localStorage.getItem("delivery_filter")) {
					html += tempHTML;
					catalogCount++
				}																	
			}
		}		
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
	}else{
		hideLoader();
		if(navigator.notification) {
			navigator.notification.alert("No Data found", function(){goBack('menu')}, 'Delivery Audit', 'Ok');
		}else{
			alert("No Data found");
			setTimeout(function(){goBack('menu')});
		}
    }	
}

function deliveryCheck(walker_no,cw,dt,area,dist_net)
{
		
	//console.log(walker_no+'-'+cw+'-'+dt+'-'+area+'-'+dist_net);	
	localStorage.setItem("AUDIT_WALKER_NO",walker_no);
	localStorage.setItem("AUDIT_CW",cw);	
	localStorage.setItem("AUDIT_DT",dt);
	localStorage.setItem("AUDIT_AREA",area);
	localStorage.setItem("DIST_NET_CODE",dist_net);
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

function deliveryCheckObject(guid, unique_identifier, dist_nr, dist_name,device_time,utc_time,dist_net_code,audit_cw,audit_dt,lat,lng) {
  this.fromPdaId = guid;
  this.imei = unique_identifier;
  this.distNr = dist_nr;
  this.distName = dist_name;
  this.deviceTime = device_time;
  this.utcTime = utc_time;
  this.distNetCode = dist_net_code;
  this.contInvNr = audit_cw;
  this.delTerrCd = audit_dt;
  this.latitude = lat;
  this.longitude = lng;
}

// create an array restaurants
var deliveryCheckConfirmations = [];
// add objects to the array

function delivery_confirmation_action() {
    var filename = $("#location_status_icon").attr("src");	
	var splitArray = filename.split("/");
	var image = splitArray[splitArray.length-1];
	if(image == 'location_available.png') {
	    var count = parseInt(localStorage.getItem("delivery_confirmation_count"));
		if(count < 6) {
			showLoader();
			count++;
			var unique_identifier  = localStorage.getItem("unique_identifier");  // "9774d56d682e549c";			
			//var lat = "30";//position.coords.latitude;
			//var lng = "40";//position.coords.longitude	yyyy-mm-dd HH:MM:SS			 
			navigator.geolocation.getCurrentPosition(function(position){
				var guid = (S4() + S4() + "-" + S4() + "-4" + S4().substr(0,3) + "-" + S4() + "-" + S4() + S4() + S4()).toLowerCase();
				deliveryCheckConfirmations.push(new deliveryCheckObject(guid, unique_identifier, localStorage.getItem("dist_nr"), localStorage.getItem("distName"),moment().format("YYYY-MM-DD HH:MM:ss"),moment().format("YYYY-MM-DD HH:MM:ss"),localStorage.getItem("DIST_NET_CODE"),localStorage.getItem("AUDIT_CW"),localStorage.getItem("AUDIT_DT"),position.coords.latitude,position.coords.longitude));
				localStorage.setItem("delivery_checks",JSON.stringify(deliveryCheckConfirmations));
				localStorage.setItem("delivery_confirmation_count",count);
				$("#delivery_confirmation_count").text(count);
				hideLoader();
			}, function(error){
				hideLoader();
				navigator.notification.alert("Could not retrieve current location due to "+error.message, null, 'Delivery Checks', 'Ok');
			} , {  maximumAge: 3000, timeout: 10000, enableHighAccuracy: true });
			
		}else{
			/*if(navigator.notification) {
				navigator.notification.alert("You can confirm maximum 6 times", null, 'Delivery Checks', 'Ok');
			}else{
				alert("You can confirm maximum 6 times");						
			}*/
			if($("#check_submit_btn").hasClass("input_bg")) {
				$("#check_submit_btn").removeClass("input_bg");
			}
			if(!$("#check_submit_btn").hasClass("disable")) {
				$("#check_submit_btn").addClass("disable");
			}
		}		
	}else{
		/*if(navigator.notification) {
				navigator.notification.alert("Location not available.Please try again", null, 'Delivery Checks', 'Ok');
		}else{
				alert("Location not available.Please try again");						
		}*/
	}
}

function S4() {
    return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
}
 
function submitDeliveryConfirmation()
{
	showLoader();
	//var UTCstring = (new Date()).toUTCString();DD MMM YYYY HH:mm
	//console.log(UTCstring);9774d56d682e549c	
	//var dt = {"Count" : "1"};	
	//alert(dt.Count);	
	//console.log(JSON.stringify(deliveryCheckConfirmations));
    //storeDeliveryConfirmation();	
	if(deliveryCheckConfirmations.length > 0) {		
		$.ajax({
		  url: "https://support.mobiliseit.com/PMP/PDAservice.asmx/SubmitDeliveryConfirmation",
		  type: "POST",
		  timeout: 60000 ,
		  data: deliveryCheckConfirmations[0],
		  success:function(data, textStatus, jqXHR)
		  {		
			//success callback			
			//alert('Delivery Checks success'+data.Count);
			deliveryCheckConfirmations.shift();
			if(deliveryCheckConfirmations.length == 0) {
				hideLoader();
				goBack('delivery_audit');
			}else{
				setTimeout('submitDeliveryConfirmation()',0);
			}
		  },
		  error: function(jqXHR, textStatus, errorThrown)
		  {
			 //hideLoader();
			 storeDeliveryConfirmation();			
		   }	  
		});	
	}else{
		hideLoader();
		goBack('delivery_audit');
	}
}

/***************** Offline implementation for Delivery Checks ****************/

function storeDeliveryConfirmation()
{
	console.log(JSON.stringify(deliveryCheckConfirmations));
	if(savingDeliveryChecksDataToDb == false) {
		savingDeliveryChecksDataToDb = true;			
		localDatabaseInstance = openDatabase("PMP Database", "1.0", "PMP Database", 200000);
		localDatabaseInstance.transaction(createDeliveryChecksTable, function(){savingDeliveryChecksDataToDb = false}, createDeliveryChecksTableComplete);
	}
}

function createDeliveryChecksTable(tx) {
	 //tx.executeSql('DROP TABLE IF EXISTS QUERIES');
	 //tx.executeSql('DROP TABLE IF EXISTS OUTSTANDINGJOBS');
	 //tx.executeSql('DROP TABLE IF EXISTS DELIVERY_AUDIT');
	 //tx.executeSql('DROP TABLE IF EXISTS DELIVERYCHECKS');
	 //tx.executeSql('DROP TABLE IF EXISTS DELIVERY_CHECKS');
	 tx.executeSql('CREATE TABLE IF NOT EXISTS DELIVERYCHECKS (fromPdaId, imei, distNr, distName, deviceTime, utcTime, distNetCode, contInvNr, delTerrCd, latitude, longitude )');     
}

function createDeliveryChecksTableComplete() {
    //alert('createQueryTableComplete');
	saveDeliveryChecksDataToDb(deliveryCheckConfirmations,0);
}

function saveDeliveryChecksDataToDb(deliveryCheckConfirmations,l)
{
	
    //console.log(deliveryCheckConfirmations[k].fromPdaId);
	if (l < deliveryCheckConfirmations.length) {
		console.log("deliveryCheckConfirmations Length : " + deliveryCheckConfirmations.length + " l : " + l);
        localDatabaseInstance = openDatabase("PMP Database", "1.0", "PMP Database", 200000);
        localDatabaseInstance.transaction(function insertUserPrefDB(tx) {
            tx.executeSql("INSERT INTO DELIVERYCHECKS (fromPdaId, imei, distNr, distName, deviceTime, utcTime, distNetCode, contInvNr, delTerrCd, latitude, longitude ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ? )",
              [deliveryCheckConfirmations[l].fromPdaId, deliveryCheckConfirmations[l].imei, deliveryCheckConfirmations[l].distNr, deliveryCheckConfirmations[l].distName, deliveryCheckConfirmations[l].deviceTime, deliveryCheckConfirmations[l].utcTime, deliveryCheckConfirmations[l].distNetCode, deliveryCheckConfirmations[l].contInvNr, deliveryCheckConfirmations[l].delTerrCd, deliveryCheckConfirmations[l].latitude,deliveryCheckConfirmations[l].longitude],function(){},function(err){
			  console.log("Error processing SQL: "+err.code+' '+err.message);
			  savingDeliveryChecksDataToDb = false});
        }, function(err){console.log("Error processing SQL: "+err.code+' '+err.message);savingDeliveryChecksDataToDb = false}, function successCB() {
            /* Recursive Function For Inserting the State in Local Db */
            saveDeliveryChecksDataToDb(deliveryCheckConfirmations, (l + 1));
        });
    }
    else {
		savingDeliveryChecksDataToDb = false;
		deliveryCheckConfirmations = "";
        console.log('Delivery checks saved Successfully');
		//prepareSavedDeliveryChecksSubmit();
		hideLoader();
		goBack('delivery_audit');
    }
}

function prepareSavedDeliveryChecksSubmit()
{
	if(navigator.connection) {		
		var networkState = navigator.connection.type;			 
		if(networkState != Connection.NONE) {	 
			localDatabaseInstance = openDatabase("PMP Database", "1.0", "PMP Database", 200000);
			localDatabaseInstance.transaction(querySavedDeliveryChecks, function(err){console.log("Error processing SQL: "+err.code+' '+err.message)});
		}
	}	
}

function querySavedDeliveryChecks(tx) {
        tx.executeSql('SELECT * FROM DELIVERYCHECKS', [], submitSavedDeliveryChecks, function(err){console.log("Error processing SQL: "+err.code+' '+err.message)});
}

function submitSavedDeliveryChecks(tx, results) {
	var len = results.rows.length;
    console.log("DELIVERYCHECKS table: " + len + " rows found.");
	if(len > 0) {
		submittedChecks = [];
	    startSubmittingChecks(results,0);
	}	
}

function startSubmittingChecks(results,counter)
{
	if(counter < results.rows.length){
		var tempObj = new deliveryCheckObject(results.rows.item(counter).fromPdaId, results.rows.item(counter).imei, results.rows.item(counter).distNr, results.rows.item(counter).distName,results.rows.item(counter).deviceTime,results.rows.item(counter).utcTime,results.rows.item(counter).distNetCode,results.rows.item(counter).contInvNr,results.rows.item(counter).delTerrCd,results.rows.item(counter).latitude,results.rows.item(counter).longitude);
		//console.log(tempObj);
		$.ajax({
		  url: "https://support.mobiliseit.com/PMP/PDAservice.asmx/SubmitDeliveryConfirmation",
		  type: "POST",
		  timeout: 60000 ,
		  data: tempObj,
		  success:function(data, textStatus, jqXHR)
		  {		
			submittedChecks.push(results.rows.item(counter).fromPdaId);	
			setTimeout(function(){startSubmittingChecks(results,(counter+1))});					
		  },
		  error: function(jqXHR, textStatus, errorThrown)
		  {				
			//submittedChecks.push(results.rows.item(counter).fromPdaId);	
			setTimeout(function(){startSubmittingChecks(results,(counter+1))});				
		  }	  
	   });
   }else{
		removeSubmitedChecks();
   }
}

function removeSubmitedChecks()
{
	localDatabaseInstance = openDatabase("PMP Database", "1.0", "PMP Database", 200000);	
	localDatabaseInstance.transaction(queryRemoveSubmittedDeliveryChecks, function(err){console.log("Error processing SQL: "+err.code+' '+err.message)}, function(){});
}

function queryRemoveSubmittedDeliveryChecks(tx) {
    var joinedItems = "";
	for(i = 0;i < submittedChecks.length ; i++)
	{
		if(i == submittedChecks.length-1) {
			joinedItems += "'"+submittedChecks[i]+"'";
		}else{
			joinedItems += "'"+submittedChecks[i]+"',";
		}
		
	}
	//console.log(joinedItems);
    sql = "DELETE FROM DELIVERYCHECKS WHERE fromPdaId IN ("+joinedItems+")";
	//console.log(sql);
	tx.executeSql(sql);     
}


/********* Offline implementation for Delivery Checks ****************/


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
	/*if($.mobile.activePage.attr('id') != "menu"){
		setTimeout(function(){back()});
	}else if($.mobile.activePage.attr('id') == "delivery_check"){
		alert('delivery_check');
		//submitDeliveryConfirmation(1);	
	}*/	
	var networkState = navigator.connection.type;
	if(networkState == Connection.NONE) {
		// Store data in sqllite
		storeDeliveryConfirmation();
	}else{
	  navigator.geolocation.getCurrentPosition(submitDeliveryConfirmation, function(error){			
		navigator.notification.alert("Could not retreive current location due to "+error.message, null, 'Delivery Checks', 'Ok');
	  } , {  maximumAge: 3000, timeout: 10000, enableHighAccuracy: true });
	}
	//submitDeliveryConfirmation(1);
}

function getOutstandingJobs()
{
	/*	Sample:{"to_ivr":[{"cont_nr":2203242,"del_terr_cd":90,"cont_inv_nr":377147913,"dist_nr":2203247,"first_nm":"Sergio","last_nm":"Rossi","old_cont_inv_nr":null,"start_dtime":"\/Date(1382360400000)\/","end_dtime":"\/Date(1382446800000)\/","dist_net_cd":"C","batch":179494,"area_cd":290}]}	
	*/
	//$("#Outstandingjob").css({'background': 'url(images/tr_bg1.png)', 'height': $(this).height()});
	
	localStorage.setItem("screen","Outstandingjob");
	showLoader();
		
	var selectAreaList = new Array();
	outstandingListRequestInProgress = true;
	$.ajax({
	  url: "https://support.mobiliseit.com/PMP/PDAservice.asmx/GetToIvrByManager",
	  type: "POST",
	  timeout: 60000 ,
	  data: {dist_nr: localStorage.getItem("dist_nr")},
	  dataType: 'json',
	  success:function(data, textStatus, jqXHR)
      {
			//console.log(data.hasOwnProperty("dist_nrr"));from_ivr
			
			/*data = {"to_ivr":[{"cont_nr":2203242,"del_terr_cd":90,"cont_inv_nr":377147913,"dist_nr":2203247,"first_nm":"Sergio","last_nm":"Rossi","old_cont_inv_nr":null,"start_dtime":"\/Date(1382360400000)\/","end_dtime":"\/Date(1382446800000)\/","dist_net_cd":"C","batch":179494,"area_cd":290},{"cont_nr":7203242,"del_terr_cd":90,"cont_inv_nr":377147913,"dist_nr":2203247,"first_nm":"Sergio","last_nm":"Rossi","old_cont_inv_nr":null,"start_dtime":"\/Date(1382360400000)\/","end_dtime":"\/Date(1382446800000)\/","dist_net_cd":"C","batch":179494,"area_cd":290},{"cont_nr":7203242,"del_terr_cd":90,"cont_inv_nr":377147913,"dist_nr":2203247,"first_nm":"Sergio","last_nm":"Rossi","old_cont_inv_nr":null,"start_dtime":"\/Date(1382360400000)\/","end_dtime":"\/Date(1382446800000)\/","dist_net_cd":"C","batch":179494,"area_cd":290},{"cont_nr":7203242,"del_terr_cd":90,"cont_inv_nr":377147913,"dist_nr":2203247,"first_nm":"Sergio","last_nm":"Rossi","old_cont_inv_nr":null,"start_dtime":"\/Date(1382360400000)\/","end_dtime":"\/Date(1382446800000)\/","dist_net_cd":"C","batch":179494,"area_cd":290},{"cont_nr":7203242,"del_terr_cd":90,"cont_inv_nr":377147913,"dist_nr":2203247,"first_nm":"Sergio","last_nm":"Rossi","old_cont_inv_nr":null,"start_dtime":"\/Date(1382360400000)\/","end_dtime":"\/Date(1382446800000)\/","dist_net_cd":"C","batch":179494,"area_cd":290},{"cont_nr":7203242,"del_terr_cd":90,"cont_inv_nr":377147913,"dist_nr":2203247,"first_nm":"Sergio","last_nm":"Rossi","old_cont_inv_nr":null,"start_dtime":"\/Date(1382360400000)\/","end_dtime":"\/Date(1382446800000)\/","dist_net_cd":"C","batch":179494,"area_cd":290}]};*/
			outstandingListRequestInProgress = false;
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
				
				/*** Keep a copy in local Database ***/
				
				serviceResponseForOutstandingJobs = data.to_ivr;
				if(savingOutstandingListDataToDb == false) {
					savingOutstandingListDataToDb = true;			
					localDatabaseInstance = openDatabase("PMP Database", "1.0", "PMP Database", 200000);
					localDatabaseInstance.transaction(dropOutstandingJobsTable, function(){savingOutstandingListDataToDb = false}, dropOutstandingJobsTableComplete);
				}				
				/*** Keep a copy in local Database ***/
				
				//console.log(selectAreaList);				
				//console.log('Local Storage '+localStorage.getItem("selectAreaList"));
				
			}else {
				outstandingListRequestInProgress = false;
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
		/*if(navigator.notification) {
			navigator.notification.alert("Network Connection Error "+errorThrown, function(){history.back()}, 'Outstanding Jobs', 'Ok');
		}else{
			alert("Network Connection Error "+errorThrown);
		}*/
		readJobsFromDatabase();
      }
	});
}

function readJobsFromDatabase()
{		 
	localDatabaseInstance = openDatabase("PMP Database", "1.0", "PMP Database", 200000);
	localDatabaseInstance.transaction(queryreadJobs, function(err){console.log("Error processing SQL: "+err.code+' '+err.message)});		
}

function queryreadJobs(tx) {
        tx.executeSql('SELECT * FROM OUTSTANDINGJOBS', [], jobsSuccessOffline, function(err){console.log("Error processing SQL: "+err.code+' '+err.message)});
}

function jobsSuccessOffline(tx, results) {
	var len = results.rows.length;
    console.log("OUTSTANDING JOBS table: " + len + " rows found.");
	if(len > 0) {
	
		var selectAreaList = new Array();		
		var outstanding_jobs_template = $("#outstanding_jobs_template").html();
		//console.log(audit_template_html);
		var html = "";
		var tempHTML = "";
		for(i =0 ;i < len ; i++){
			//console.log(JSON.stringify(audits));
			tempHTML =  outstanding_jobs_template;
			tempHTML = tempHTML.replace(/{{AREA_CD}}/gi, results.rows.item(i).area_cd);
			tempHTML = tempHTML.replace(/{{CONT_INV_NR}}/gi, results.rows.item(i).cont_inv_nr);
			tempHTML = tempHTML.replace(/{{CONT_NR}}/gi, results.rows.item(i).cont_nr);
			tempHTML = tempHTML.replace(/{{DIST_NR}}/gi, results.rows.item(i).dist_nr);
			
			
			tempHTML = tempHTML.replace(/{{DEL_TERR_CD}}/gi, results.rows.item(i).del_terr_cd);
			tempHTML = tempHTML.replace(/{{DIST_NET_CD}}/gi, results.rows.item(i).dist_net_cd);
			
			if(localStorage.getItem("outstandingjob_filter")== null) {					
				if(selectAreaList.indexOf(results.rows.item(i).area_cd) == -1) {
					selectAreaList.push(results.rows.item(i).area_cd);
				}
				localStorage.setItem("outstandingJobSelectAreaList",JSON.stringify(selectAreaList));
				html += tempHTML;
			}else if(results.rows.item(i).area_cd == localStorage.getItem("outstandingjob_filter")) {
				html += tempHTML;											
			}
		}
		$("#outstanding_jobs_content").html( html );
	}else{
		if(navigator.notification) {
					navigator.notification.alert("No Data found", function(){goBack('menu')}, 'Outstanding Jobs', 'Ok');
		}else{
			alert("No Data found");
			setTimeout(function(){history.back()});
		}
	}
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
	$("#overlay .calagory").css("background","url(images/category_bg2.png) center center repeat-y");
	setTimeout(function(){$("#overlay #"+filterType).css("background","url(images/category_hover2.png)  center center repeat-y");});	
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
	
	queryList = [];
	queryListRequestInProgress = true;
	$.ajax({
	  url: "https://support.mobiliseit.com/PMP/PDAservice.asmx/GetQueryToPdaByManager",
	  type: "POST",
	  timeout: 60000 ,
	  data: {dist_nr: localStorage.getItem("dist_nr")},
	  dataType: 'json',
	  success:function(data, textStatus, jqXHR)
      {
			//console.log(data.hasOwnProperty("dist_nrr"));from_ivr	
	
			/*data = {"queries_to_pda":[{"query_nr":728335,"dist_nr":3050234,"dist_net_cd":"N","query_job_nr":721795,"query_job_desc":"Job 721795 HOBSONS BAY LEADER [08 Oct 2013 to 09 Oct 2013] for 10 Oct 2013","query_job_dtime":"\/Date(1381064400000)\/","query_reported_dtime":"\/Date(1381804613240)\/","query_area_details":"159/24","query_type_desc":"Non delivery","query_detail":"no delivery for 3 years -|- Please investigate and respond within 72 hours. Thanks.","str_nr":"11/76","str_nm":"POINT COOK","str_type_cd":"RD","sub_nm":"SEABROOK","pc_cd":"3028","batch":141007},{"query_nr":728335,"dist_nr":3050234,"dist_net_cd":"N","query_job_nr":721795,"query_job_desc":"Job 721795 HOBSONS BAY LEADER [08 Oct 2013 to 09 Oct 2013] for 10 Oct 2013","query_job_dtime":"\/Date(1381064400000)\/","query_reported_dtime":"\/Date(1381804613240)\/","query_area_details":"159/24","query_type_desc":"Non delivery","query_detail":"no delivery for 3 years -|- Please investigate and respond within 72 hours. Thanks.","str_nr":"11/76","str_nm":"POINT COOK","str_type_cd":"RD","sub_nm":"SEABROOK","pc_cd":"3028","batch":141007},{"query_nr":728335,"dist_nr":3050234,"dist_net_cd":"N","query_job_nr":721795,"query_job_desc":"Job 721795 HOBSONS BAY LEADER [08 Oct 2013 to 09 Oct 2013] for 10 Oct 2013","query_job_dtime":"\/Date(1381064400000)\/","query_reported_dtime":"\/Date(1381804613240)\/","query_area_details":"159/24","query_type_desc":"Non delivery","query_detail":"no delivery for 3 years -|- Please investigate and respond within 72 hours. Thanks.","str_nr":"11/76","str_nm":"POINT COOK","str_type_cd":"RD","sub_nm":"SEABROOK","pc_cd":"3028","batch":141007},{"query_nr":728335,"dist_nr":3050234,"dist_net_cd":"N","query_job_nr":721795,"query_job_desc":"Job 721795 HOBSONS BAY LEADER [08 Oct 2013 to 09 Oct 2013] for 10 Oct 2013","query_job_dtime":"\/Date(1381064400000)\/","query_reported_dtime":"\/Date(1381804613240)\/","query_area_details":"159/24","query_type_desc":"Non delivery","query_detail":"no delivery for 3 years -|- Please investigate and respond within 72 hours. Thanks.","str_nr":"11/76","str_nm":"POINT COOK","str_type_cd":"RD","sub_nm":"SEABROOK","pc_cd":"3028","batch":141007}]};*/			
			queryListRequestInProgress = false;
			if(data.queries_to_pda && data.queries_to_pda.length)
			{				
				queryList = data;				
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
					tempHTML = tempHTML.replace(/{{QUERY_JOB_DESC}}/gi, query.query_job_desc);
					tempHTML = tempHTML.replace(/{{DATE_WINDOW}}/gi,  moment(query.query_job_dtime).format("DD MMM YYYY"));
					tempHTML = tempHTML.replace(/{{ROW_INDEX}}/gi, queryCount);
					
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
                $("#query_count").html("("+queryCount+")");				
				$("#query_content").html( html );
				hideLoader();
				
				/*** Keep a copy of the data to local database  ***/
				serviceResponseForQuery = data.queries_to_pda;
				if(savingQueryListDataToDb == false) {
					savingQueryListDataToDb = true;			
					localDatabaseInstance = openDatabase("PMP Database", "1.0", "PMP Database", 200000);
					localDatabaseInstance.transaction(dropQueryTable, function(){savingQueryListDataToDb = false}, dropQueryTableComplete);
				}
				/*** Keep a copy of the data to local database  ***/
				
			}else {
				queryListRequestInProgress = false;
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
		/*if(navigator.notification) {
			navigator.notification.alert("Network Connection Error "+errorThrown, function(){history.back()}, 'Query Inbox', 'Ok');
		}else{
			alert("Network Connection Error "+errorThrown);
		}*/
		readQueryListFromDatabase();		
      }
	});
}

function readQueryListFromDatabase()
{		 
	localDatabaseInstance = openDatabase("PMP Database", "1.0", "PMP Database", 200000);
	localDatabaseInstance.transaction(queryReadQueryList, function(err){console.log("Error processing SQL: "+err.code+' '+err.message)});		
}

function queryReadQueryList(tx) {
        tx.executeSql('SELECT * FROM QUERIES', [], queryListSuccessOffline, function(err){console.log("Error processing SQL: "+err.code+' '+err.message)});
}

function queryListSuccessOffline(tx,results)
{
	var len = results.rows.length;
    console.log("Query List table: " + len + " rows found.");
	if(len > 0) {
		var query_template = $("#query_template").html();
		//console.log(audit_template_html);
		var html = "";
		var tempHTML = "";
		var queryCount = 0;
		var selectAreaList = new Array();
		for(i =0; i < len; i++){
			//console.log(JSON.stringify(audits));
			tempHTML =  query_template;
			tempHTML = tempHTML.replace(/{{QUERY_NR}}/gi, results.rows.item(i).query_nr);
			tempHTML = tempHTML.replace(/{{DIST_NR}}/gi, results.rows.item(i).query_area_details);
			tempHTML = tempHTML.replace(/{{QUERY_DETAIL}}/gi, results.rows.item(i).query_detail);
			tempHTML = tempHTML.replace(/{{QUERY_JOB_NR}}/gi, results.rows.item(i).query_job_nr);
			tempHTML = tempHTML.replace(/{{QUERY_JOB_DESC}}/gi, results.rows.item(i).query_job_desc);
			tempHTML = tempHTML.replace(/{{DATE_WINDOW}}/gi,  moment(results.rows.item(i).query_job_dtime).format("DD MMM YYYY"));
			tempHTML = tempHTML.replace(/{{ROW_INDEX}}/gi, queryCount);
			
			var area_details = results.rows.item(i).query_area_details;
			
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
		}
		$("#query_count").html("("+queryCount+")");				
		$("#query_content").html( html );
		hideLoader();
	}
	else{
		if(navigator.notification) {
					navigator.notification.alert("No Data found", function(){goBack('menu')}, 'Query Inbox', 'Ok');
		}else{
			alert("No Data found");
			setTimeout(function(){goBack('menu')});
		}
	}
}

var queryConfirmations = [];

/*
<queryFromPdaId>string</queryFromPdaId>
      <queryNr>int</queryNr>
      <deviceDateTime>string</deviceDateTime>
      <utcTime>string</utcTime>
      <reasonTypeDesc>string</reasonTypeDesc>
      <distComments>string</distComments>
      <strNr>string</strNr>
      <strNm>string</strNm>
      <strTypeCd>string</strTypeCd>
      <subNm>string</subNm>
      <pcCd>string</pcCd>
      <latitude>double</latitude>
      <longitude>double</longitude>
*/

function queryConfirmationObject(guid, query_nr,device_time,utc_time,reason_desc,dist_comments,str_nr,str_nm,str_type_cd,sub_nm,pc_cd,lat,lng) {
  this.queryFromPdaId = guid;
  this.queryNr = query_nr;
  this.deviceDateTime = device_time;
  this.utcTime = utc_time;
  this.reasonTypeDesc = reason_desc;
  this.distComments = dist_comments;
  this.strNr = str_nr;
  this.strNm = str_nm;
  this.strTypeCd = str_type_cd;
  this.subNm = sub_nm;
  this.pcCd = pc_cd;
  this.latitude = lat;
  this.longitude = lng;
}

function query_confirmation_action() {
    var filename = $("#location_status_icon").attr("src");	
	var splitArray = filename.split("/");
	var image = splitArray[splitArray.length-1];
	if(image == 'location_available.png') {
	    var count = parseInt(localStorage.getItem("query_confirmation_count"));
		if(count < 9) {
			showLoader();
			count++;			
			//var lat = "30";//position.coords.latitude;
			//var lng = "40";//position.coords.longitude	yyyy-mm-dd HH:MM:SS			 
			navigator.geolocation.getCurrentPosition(function(position){
				var guid = (S4() + S4() + "-" + S4() + "-4" + S4().substr(0,3) + "-" + S4() + "-" + S4() + S4() + S4()).toLowerCase();
				var queryObj = JSON.parse(localStorage.getItem("query_item"));
				queryConfirmations.push(new queryConfirmationObject(guid, queryObj.query_nr,moment().format("YYYY-MM-DD HH:MM:ss"),moment().format("YYYY-MM-DD HH:MM:ss"),$("#reason_desc_editable").val(),"",$("#str_nr").val(),$("#str_nm").val(),queryObj.str_type_cd,$("#sub_nm").val(),queryObj.pc_cd,position.coords.latitude,position.coords.longitude));
				localStorage.setItem("address_checks",JSON.stringify(queryConfirmations));
				localStorage.setItem("query_confirmation_count",count);
				$("#query_confirmation_count").text(count);
				hideLoader();
			}, function(error){
				hideLoader();
				navigator.notification.alert("Could not retrieve current location due to "+error.message, null, 'Delivery Checks', 'Ok');
			} , {  maximumAge: 3000, timeout: 10000, enableHighAccuracy: true });
			
		}else{
			/*if(navigator.notification) {
				navigator.notification.alert("You can confirm maximum 6 times", null, 'Delivery Checks', 'Ok');
			}else{
				alert("You can confirm maximum 6 times");						
			}*/
			if($("#check_submit_btn").hasClass("input_bg")) {
				$("#check_submit_btn").removeClass("input_bg");
			}
			if(!$("#check_submit_btn").hasClass("disable")) {
				$("#check_submit_btn").addClass("disable");
			}
		}		
	}else{
		/*if(navigator.notification) {
				navigator.notification.alert("Location not available.Please try again", null, 'Delivery Checks', 'Ok');
		}else{
				alert("Location not available.Please try again");						
		}*/
	}
}

function submitQueryInformation()
{
	showLoader();
	//console.log(JSON.stringify(queryConfirmations));
	for (var i=0; i<queryConfirmations.length; i++) {
	  queryConfirmations[i].distComments = $("#query_comment_desc").val();		
	}
	if(queryConfirmations.length > 0) {		
		$.ajax({
		  url: "https://support.mobiliseit.com/PMP/PDAservice.asmx/SubmitQuery",
		  type: "POST",
		  timeout: 60000 ,
		  data: queryConfirmations[0],
		  success:function(data, textStatus, jqXHR)
		  {		
			//success callback			
			//alert('Delivery Checks success'+data.Count);
			queryConfirmations.shift();
			if(queryConfirmations.length == 0) {
				hideLoader();
				//goBack('delivery_audit');
				goTo('Query');
			}else{
				setTimeout('submitQueryInformation()',0);
			}
		  },
		  error: function(jqXHR, textStatus, errorThrown)
		  {
			 //hideLoader();
			 storeFailedQuerySubmit();			
		   }	  
		});	
	}else{
		hideLoader();
		goTo('Query');
	}
}

function storeFailedQuerySubmit()
{
	console.log(JSON.stringify(queryConfirmations));
	if(savingQuerySubmitDataToDb == false) {
		savingQuerySubmitDataToDb = true;			
		localDatabaseInstance = openDatabase("PMP Database", "1.0", "PMP Database", 200000);
		localDatabaseInstance.transaction(createQuerySubmitTable, function(){savingQuerySubmitDataToDb = false}, createQuerySubmitTableComplete);
	}
}

function createQuerySubmitTable(tx) {
	 //tx.executeSql('DROP TABLE IF EXISTS QUERIES');
	 //tx.executeSql('DROP TABLE IF EXISTS OUTSTANDINGJOBS');
	 //tx.executeSql('DROP TABLE IF EXISTS DELIVERY_AUDIT');
	 //tx.executeSql('DROP TABLE IF EXISTS QUERYSUBMIT');
	 //tx.executeSql('DROP TABLE IF EXISTS DELIVERY_CHECKS');
	 tx.executeSql('CREATE TABLE IF NOT EXISTS QUERYSUBMIT (queryFromPdaId, queryNr, deviceDateTime, utcTime, reasonTypeDesc, distComments, strNr, strNm, strTypeCd, subNm, pcCd, latitude, longitude)');  
}

function createQuerySubmitTableComplete() {
    //alert('createQueryTableComplete');
	saveQuerySubmitDataToDb(queryConfirmations,0);
}

function saveQuerySubmitDataToDb(queryConfirmations,l)
{
    //console.log(queryConfirmations[k].fromPdaId);
	if (l < queryConfirmations.length) {
		console.log("queryConfirmations Length : " + queryConfirmations.length + " l : " + l);
        localDatabaseInstance = openDatabase("PMP Database", "1.0", "PMP Database", 200000);
        localDatabaseInstance.transaction(function insertUserPrefDB(tx) {
            tx.executeSql("INSERT INTO QUERYSUBMIT (queryFromPdaId, queryNr, deviceDateTime, utcTime, reasonTypeDesc, distComments, strNr, strNm, strTypeCd, subNm, pcCd, latitude, longitude) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ? ,? ,? )",
              [queryConfirmations[l].queryFromPdaId, queryConfirmations[l].queryNr, queryConfirmations[l].deviceDateTime, queryConfirmations[l].utcTime, queryConfirmations[l].reasonTypeDesc, queryConfirmations[l].distComments, queryConfirmations[l].strNr, queryConfirmations[l].strNm, queryConfirmations[l].strTypeCd, queryConfirmations[l].subNm,queryConfirmations[l].pcCd, queryConfirmations[l].latitude, queryConfirmations[l].longitude],function(){},function(err){
			  console.log("Error processing SQL: "+err.code+' '+err.message);
			  savingQuerySubmitDataToDb = false});
        }, function(err){console.log("Error processing SQL: "+err.code+' '+err.message);savingQuerySubmitDataToDb = false}, function successCB() {
            /* Recursive Function For Inserting the State in Local Db */
            saveQuerySubmitDataToDb(queryConfirmations, (l + 1));
        });
    }
    else {
		savingQuerySubmitDataToDb = false;
		queryConfirmations = "";
        console.log('Query Submits saved Successfully');
	    //prepareSavedQueriesSubmit();
		hideLoader();
		goTo('Query');
    }
}

function prepareSavedQueriesSubmit()
{
	if(navigator.connection) {		
		var networkState = navigator.connection.type;			 
		if(networkState != Connection.NONE) {	 
			localDatabaseInstance = openDatabase("PMP Database", "1.0", "PMP Database", 200000);
			localDatabaseInstance.transaction(querySavedQueries, function(err){console.log("Error processing SQL: "+err.code+' '+err.message)});
		}
	}
}

function querySavedQueries(tx) {
        tx.executeSql('SELECT * FROM QUERYSUBMIT', [], submitSavedQueries, function(err){console.log("Error processing SQL: "+err.code+' '+err.message)});
}

function submitSavedQueries(tx, results) {
	var len = results.rows.length;
    console.log("QUERYSUBMIT table: " + len + " rows found.");
	if(len > 0) {
		submittedQueries = [];
	    startSubmittingQueries(results,0);
	}	
}

function startSubmittingQueries(results,counter)
{
	if(counter < results.rows.length){
	    
		var tempObj = new queryConfirmationObject(results.rows.item(counter).queryFromPdaId, results.rows.item(counter).queryNr, results.rows.item(counter).deviceDateTime, results.rows.item(counter).utcTime,results.rows.item(counter).reasonTypeDesc,results.rows.item(counter).distComments,results.rows.item(counter).strNr,results.rows.item(counter).strNm,results.rows.item(counter).strTypeCd,results.rows.item(counter).subNm,results.rows.item(counter).pcCd,results.rows.item(counter).latitude,results.rows.item(counter).longitude);
		//console.log(tempObj);
		$.ajax({
		  url: "https://support.mobiliseit.com/PMP/PDAservice.asmx/SubmitQuery",
		  type: "POST",
		  timeout: 60000 ,
		  data: tempObj,
		  success:function(data, textStatus, jqXHR)
		  {		
			submittedQueries.push(results.rows.item(counter).queryFromPdaId);	
			setTimeout(function(){startSubmittingQueries(results,(counter+1))});					
		  },
		  error: function(jqXHR, textStatus, errorThrown)
		  {				
			//submittedQueries.push(results.rows.item(counter).queryFromPdaId);	
			setTimeout(function(){startSubmittingQueries(results,(counter+1))});				
		  }	  
	   });
   }else{
		removeSubmitedQueries();
   }
}

function removeSubmitedQueries()
{
	localDatabaseInstance = openDatabase("PMP Database", "1.0", "PMP Database", 200000);	
	localDatabaseInstance.transaction(queryRemoveSubmittedQueries, function(err){console.log("Error processing SQL: "+err.code+' '+err.message)}, function(){});
}

function queryRemoveSubmittedQueries(tx) {
    var joinedItems = "";
	for(i = 0;i < submittedQueries.length ; i++)
	{
		if(i == submittedQueries.length-1) {
			joinedItems += "'"+submittedQueries[i]+"'";
		}else{
			joinedItems += "'"+submittedQueries[i]+"',";
		}
		
	}
	console.log(joinedItems);
    sql = "DELETE FROM QUERYSUBMIT WHERE queryFromPdaId IN ("+joinedItems+")";
	//console.log(sql);
	tx.executeSql(sql);     
}

function storeQueryData(index)
{
	localStorage.setItem("query_item",JSON.stringify(queryList.queries_to_pda[index]));
	setTimeout(function(){goTo('querydetail')});
}

function populateReasons()
{
	showLoader();
	$.ajax({
		  url: "https://support.mobiliseit.com/PMP/PDAservice.asmx/GetReasons ",
		  timeout: 60000 ,
		  dataType: "json",
		  success:function(data, textStatus, jqXHR)
		  {			
			//alert(data.reason_type.length);
			if(data.reason_type && data.reason_type.length)
			{				
				var options = ""
				$.each(data.reason_type, function(i,reason){
					options+="<option value='"+reason.reason_type_desc+"'>"+reason.reason_type_desc+"</option>";
				});
				//console.log(options);
				$("#reason_desc_editable").append(options);
			}
			hideLoader();
		  },
		  error: function(jqXHR, textStatus, errorThrown)
		  {
			 hideLoader();
			 if(navigator.notification) {
				navigator.notification.alert("Network Connection Error "+errorThrown, null, 'Addition Address Checks', 'Ok');
			  }else{
					alert("Network Connection Error "+errorThrown);
			  }			
		   }	  
	});
}

function freecheck_confirmation_action() {
    var filename = $("#location_status_icon").attr("src");	
	var splitArray = filename.split("/");
	var image = splitArray[splitArray.length-1];
	if(image == 'location_available.png') {
	    var count = parseInt(localStorage.getItem("freecheck_confirmation_count"));
		if(count < 6) {
			showLoader();
			count++;
			var unique_identifier  = localStorage.getItem("unique_identifier");  // "9774d56d682e549c";			
			//var lat = "30";//position.coords.latitude;
			//var lng = "40";//position.coords.longitude	yyyy-mm-dd HH:MM:SS			 
			navigator.geolocation.getCurrentPosition(function(position){
				var guid = (S4() + S4() + "-" + S4() + "-4" + S4().substr(0,3) + "-" + S4() + "-" + S4() + S4() + S4()).toLowerCase();
				freeCheckConfirmations.push(new deliveryCheckObject(guid, unique_identifier, localStorage.getItem("dist_nr"), localStorage.getItem("distName"),moment().format("YYYY-MM-DD HH:MM:ss"),moment().format("YYYY-MM-DD HH:MM:ss"),localStorage.getItem("freecheck_dist_net_cd"),localStorage.getItem("AUDIT_CW"),localStorage.getItem("AUDIT_DT"),position.coords.latitude,position.coords.longitude));
				localStorage.setItem("free_checks",JSON.stringify(freeCheckConfirmations));
				localStorage.setItem("freecheck_confirmation_count",count);
				$("#freecheck_confirmation_count").text(count);
				hideLoader();
			}, function(error){
				hideLoader();
				if(navigator.notification) {
					navigator.notification.alert("Could not retrieve current location due to "+error.message, null, 'Delivery Checks', 'Ok');
				}else{
					alert("Could not retrieve current location due to "+error.message);
				}
			} , {  maximumAge: 3000, timeout: 10000, enableHighAccuracy: true });
			
		}else{
			/*if(navigator.notification) {
				navigator.notification.alert("You can confirm maximum 6 times", null, 'Delivery Checks', 'Ok');
			}else{
				alert("You can confirm maximum 6 times");						
			}*/
			/*if($("#check_submit_btn").hasClass("input_bg")) {
				$("#check_submit_btn").removeClass("input_bg");
			}*/
			if(!$("#check_submit_btn").hasClass("disable")) {
				$("#check_submit_btn").addClass("disable");
			}
		}		
	}else{
		/*if(navigator.notification) {
				navigator.notification.alert("Location not available.Please try again", null, 'Delivery Checks', 'Ok');
		}else{
				alert("Location not available.Please try again");						
		}*/
	}
}

$(document).on("pageshow", "#delivery_audit", function( event ) {
	getAuditList();
});

$(document).on("pagebeforeshow", "#delivery_check", function( event ) {
	getAuditDetail();
    deliveryCheckConfirmations = [];	
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

$(document).on("pageshow", "#querydetails", function( event ) {
    var queryObj = JSON.parse(localStorage.getItem("query_item"));
	$("#job_desc_text").val(queryObj.query_job_desc);
	$("#query_desc_textarea").val(queryObj.query_detail);	
	checkDeviceStatus();
});

$(document).on("pageshow", "#addresscheck", function( event ) {
	var queryObj = JSON.parse(localStorage.getItem("query_item"));
	$("#str_nm_text").val(queryObj.str_nm);
	$("#sub_nm_text").val(queryObj.sub_nm);
	$("#reason_desc_readonly").html("<option value='"+queryObj.query_type_desc+"' selected='selected'>"+queryObj.query_type_desc+"</option>");
	checkDeviceStatus();
});

$(document).on("pageshow", "#addition_address", function( event ) {
	localStorage.setItem("query_confirmation_count","0");
	// Calls the selectBoxIt method on your HTML select box
    /*$("select").selectBoxIt({
	   native: true
    });*/
	populateReasons();
	checkDeviceStatus();
});

$(document).on("pageshow", "#query_comments", function( event ) {
	checkDeviceStatus();
});

$(document).on("pageshow", "#freecheck", function( event ) {
	checkDeviceStatus();
	localStorage.setItem("freecheck_confirmation_count","0");
	freeCheckConfirmations = [];
	var radioButton = $('.settings_icon');
	$(radioButton).click(function(){
            if(!$(this).hasClass('thikbg')){
                $(this).addClass("thikbg");
				//console.log($(this).attr("id"));
				localStorage.setItem("freecheck_dist_net_cd",$(this).attr("id"));
            }
            $(radioButton).not(this).each(function(){
                $(this).removeClass("thikbg");
            });
        });
});

$(document).on("pageshow", "#menu", function( event ) {
	if(checkDataCron == false) {
	   // Cron is not running.Restart the cron
		checkDataCron = setInterval(checkNewDataFromServer,5000);
		submitDeliveryChecksCron = setInterval(prepareSavedDeliveryChecksSubmit,5000);
		submitQueriesCron = setInterval(prepareSavedQueriesSubmit,5000);				
	}
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

/*$( document ).bind( "mobileinit", function() {
    // Make your jQuery Mobile framework configuration changes here!
    $.support.cors = true;
    $.mobile.allowCrossDomainPages = true;
});*/

window.onorientationchange = function(){
    if($("#loaderOverlay #custom")) {
		$("#loaderOverlay #custom").css("marginTop",window.innerHeight/3);
	}
}