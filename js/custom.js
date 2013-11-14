function goTo(page)
{
	//alert(page);
	//$.mobile.changePage( "menu.html", { transition: "slide"} );
	document.location = page+".html";
}

function back()
{
	history.back();
}

function popUp()
{
	//var overlay = jQuery('<div id="overlay"> </div>');
	//overlay.appendTo(document.body);
	var d1 = document.getElementById('Outstandingjob');
    var d2 = document.getElementById('confirmation');	
	//d1.insertAdjacentHTML('afterend', '<div id="overlay"> </div>');
	//alert(d2.innerHTML);
	if(document.getElementById('overlay') == null) {
		d1.insertAdjacentHTML('afterend', '<div id="overlay">'+d2.innerHTML+'</div>');
	}else{
		document.getElementById('overlay').style.display='block';
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
	document.getElementById('overlay').style.display='none';
}

function login()
{
	console.log('login');
	showLoader();
	$.ajax({
	  url: "https://support.mobiliseit.com/PMP/PDAservice.asmx/Authenticate",
	  type: "POST",
	  data: {userID: $('input[name="username"]').val(), password: $('input[name="password"]').val()},
	  dataType: 'json',
	  success:function(data, textStatus, jqXHR)
      {
			//console.log(data.hasOwnProperty("dist_nrr"));
			if(data.hasOwnProperty("dist_nr"))
			{
				
				localStorage.setItem("dist_nr",data.dist_nr);
				//console.log('Distributor number is '+localStorage.getItem("dist_nr"));
				setTimeout(function(){goTo('menu');});
				
			}else {
				//alert(data.Exception.Message);
				navigator.notification.alert(data.Exception.Message, null, 'PMP', 'Ok')

			}
      },
      error: function(jqXHR, textStatus, errorThrown)
      {
        hideLoader();
		if(navigator.notification) {
			navigator.notification.alert("Network Connection Error "+errorThrown, null, 'PMP', 'Ok');
		}else{
			alert("Network Connection Error "+errorThrown);
		}			
      }	  
	});	
}

function logout()
{
	localStorage.removeItem("dist_nr");
	setTimeout(function(){document.location = "index.html";});
}


function getAuditList()
{
	
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
	
	$.ajax({
	  url: "https://support.mobiliseit.com/PMP/PDAservice.asmx/GetFromIvrByManager",
	  type: "POST",
	  data: {dist_nr: localStorage.getItem("dist_nr")},
	  dataType: 'json',
	  success:function(data, textStatus, jqXHR)
      {
			//console.log(data.hasOwnProperty("dist_nrr"));from_ivr
			
			/*data= {"from_ivr":[{"cont_nr":9808236,"cont_inv_nr":377149125,"del_terr_cd":6,"dist_nr":3050234,"ivr_serv_dtime":"\/Date(1382487136863)\/","ivr_user_dtime":null,"batch":69705,"DeliveryDay":null,"DeliveryDate":null},{"cont_nr":9808236,"cont_inv_nr":377149125,"del_terr_cd":6,"dist_nr":3050234,"ivr_serv_dtime":"\/Date(1382487136863)\/","ivr_user_dtime":null,"batch":69705,"DeliveryDay":null,"DeliveryDate":null}]};*/
			
			
			if(data.from_ivr.length)
			{
				var audit_template_html = $("#audit_template").html();

				//console.log(audit_template_html);
				var html = "";
				var tempHTML = "";
				$.each(data.from_ivr, function(i,audits){
					//console.log(JSON.stringify(audits));
					tempHTML =  audit_template_html;
					tempHTML = tempHTML.replace(/{{DIST_NR}}/gi, audits.dist_nr);
					tempHTML = tempHTML.replace(/{{CONT_INV_NR}}/gi, audits.cont_inv_nr);
					tempHTML = tempHTML.replace(/{{CONT_NR}}/gi, audits.cont_nr);		
					tempHTML = tempHTML.replace(/{{IVR_SERV_DTIME}}/gi, moment(audits.ivr_serv_dtime).format("DD MMM YYYY HH:mm"));
					tempHTML = tempHTML.replace(/{{DEL_TERR_CD}}/gi, audits.del_terr_cd);
					//tempHTML = tempHTML.replace(/{{DIST_NR}}/gi, audits.dist_nr);
					html += tempHTML;
				});

				$("#delivery_audit_content").html( html );
				hideLoader();
				
			}else {
				if(navigator.notification) {
					navigator.notification.alert("No Data found", function(){history.back()}, 'PMP', 'Ok');
				}else{
					alert("No Data found");
					setTimeout(function(){history.back()});
				}
			}
      },
      error: function(jqXHR, textStatus, errorThrown)
      {
            //if fails
		if(navigator.notification) {
			navigator.notification.alert("Network Connection Error "+errorThrown, function(){history.back()}, 'PMP', 'Ok');
		}else{
			alert("Network Connection Error "+errorThrown);
		}
      }	  
	});		
}

function getOutstandingJobs()
{
	/*	Sample:{"to_ivr":[{"cont_nr":2203242,"del_terr_cd":90,"cont_inv_nr":377147913,"dist_nr":2203247,"first_nm":"Sergio","last_nm":"Rossi","old_cont_inv_nr":null,"start_dtime":"\/Date(1382360400000)\/","end_dtime":"\/Date(1382446800000)\/","dist_net_cd":"C","batch":179494,"area_cd":290}]}	
	*/
	//$("#Outstandingjob").css({'background': 'url(images/tr_bg1.png)', 'height': $(this).height()});
	showLoader();
	
	$.ajax({
	  url: "https://support.mobiliseit.com/PMP/PDAservice.asmx/GetToIvrByManager",
	  type: "POST",
	  data: {dist_nr: localStorage.getItem("dist_nr")},
	  dataType: 'json',
	  success:function(data, textStatus, jqXHR)
      {
			//console.log(data.hasOwnProperty("dist_nrr"));from_ivr
			
			/*data = {"to_ivr":[{"cont_nr":2203242,"del_terr_cd":90,"cont_inv_nr":377147913,"dist_nr":2203247,"first_nm":"Sergio","last_nm":"Rossi","old_cont_inv_nr":null,"start_dtime":"\/Date(1382360400000)\/","end_dtime":"\/Date(1382446800000)\/","dist_net_cd":"C","batch":179494,"area_cd":290},{"cont_nr":7203242,"del_terr_cd":90,"cont_inv_nr":377147913,"dist_nr":2203247,"first_nm":"Sergio","last_nm":"Rossi","old_cont_inv_nr":null,"start_dtime":"\/Date(1382360400000)\/","end_dtime":"\/Date(1382446800000)\/","dist_net_cd":"C","batch":179494,"area_cd":290}]};*/
			
			if(data.to_ivr && data.to_ivr.length)
			{
				var outstanding_jobs_template = $("#outstanding_jobs_template").html();

				//console.log(audit_template_html);
				var html = "";
				var tempHTML = "";
				$.each(data.to_ivr, function(i,outstandingJobs){
					//console.log(JSON.stringify(audits));
					tempHTML =  outstanding_jobs_template;
					tempHTML = tempHTML.replace(/{{DIST_NR}}/gi, outstandingJobs.dist_nr);
					tempHTML = tempHTML.replace(/{{CONT_INV_NR}}/gi, outstandingJobs.cont_inv_nr);
					tempHTML = tempHTML.replace(/{{CONT_NR}}/gi, outstandingJobs.cont_nr);		
					
					tempHTML = tempHTML.replace(/{{DEL_TERR_CD}}/gi, outstandingJobs.del_terr_cd);
					tempHTML = tempHTML.replace(/{{DIST_NET_CD}}/gi, outstandingJobs.dist_net_cd);
					html += tempHTML;
				});
				$("#outstanding_jobs_content").html( html );
				hideLoader();
				
			}else {			
				if(navigator.notification) {
					navigator.notification.alert("No Data found", function(){history.back()}, 'PMP', 'Ok');
				}else{
					alert("No Data found");
					setTimeout(function(){history.back()});
				}				
			}
      },
      error: function(jqXHR, textStatus, errorThrown)
      {
        //if fails
		if(navigator.notification) {
			navigator.notification.alert("Network Connection Error "+errorThrown, function(){history.back()}, 'PMP', 'Ok');
		}else{
			alert("Network Connection Error "+errorThrown);
		}
      }
	});
}

function getQueryList()
{
	/*
	{"queries_to_pda":[{"query_nr":728335,"dist_nr":3050234,"dist_net_cd":"N","query_job_nr":721795,"query_job_desc":"Job 721795 HOBSONS BAY LEADER [08 Oct 2013 to 09 Oct 2013] for 10 Oct 2013","query_job_dtime":"\/Date(1381064400000)\/","query_reported_dtime":"\/Date(1381804613240)\/","query_area_details":"159/24","query_type_desc":"Non delivery","query_detail":"no delivery for 3 years -|- Please investigate and respond within 72 hours. Thanks.","str_nr":"11/76","str_nm":"POINT COOK","str_type_cd":"RD","sub_nm":"SEABROOK","pc_cd":"3028","batch":141007}]}	
	*/
	
	//$("#query").css({'background': 'url(images/tr_bg1.png)', 'height': $(this).height()});
	showLoader();
	
	$.ajax({
	  url: "https://support.mobiliseit.com/PMP/PDAservice.asmx/GetQueryToPdaByManager",
	  type: "POST",
	  data: {dist_nr: localStorage.getItem("dist_nr")},
	  dataType: 'json',
	  success:function(data, textStatus, jqXHR)
      {
			//console.log(data.hasOwnProperty("dist_nrr"));from_ivr			
			if(data.queries_to_pda && data.queries_to_pda.length)
			{
				var query_template = $("#query_template").html();

				//console.log(audit_template_html);
				var html = "";
				var tempHTML = "";
				$.each(data.queries_to_pda, function(i,query){
					//console.log(JSON.stringify(audits));
					tempHTML =  query_template;
					tempHTML = tempHTML.replace(/{{QUERY_NR}}/gi, query.query_nr);
					tempHTML = tempHTML.replace(/{{DIST_NR}}/gi, query.dist_nr);
					tempHTML = tempHTML.replace(/{{QUERY_DETAIL}}/gi, query.query_detail);		
					
					//tempHTML = tempHTML.replace(/{{DEL_TERR_CD}}/gi, query.del_terr_cd);
					tempHTML = tempHTML.replace(/{{QUERY_JOB_NR}}/gi, query.query_job_nr);
					html += tempHTML;
				});
				$("#query_content").html( html );
				hideLoader();
				
			}else {			
				if(navigator.notification) {
					navigator.notification.alert("No Data found", function(){history.back()}, 'PMP', 'Ok');
				}else{
					alert("No Data found");
					setTimeout(function(){history.back()});
				}				
			}
      },
      error: function(jqXHR, textStatus, errorThrown)
      {
        //if fails
		if(navigator.notification) {
			navigator.notification.alert("Network Connection Error "+errorThrown, function(){history.back()}, 'PMP', 'Ok');
		}else{
			alert("Network Connection Error "+errorThrown);
		}
      }
	});

}