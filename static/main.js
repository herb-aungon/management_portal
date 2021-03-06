var url = 'http://herbportal.ddns.net/'
var stats = null;
var token = null;
var message=null;
var data=null;
var success_msg=null;
var user=null;

$( document ).ready(function() {
    $('#login').click(function(){
	
	//crate json object to be attached on ajax post
	var username = $('#username').val();
	var password = $('#password').val();
	var user_raw = {};
	user_raw["username"] = username;
	user_raw["password"] = password;
	var user= JSON.stringify(user_raw);
	var url_post = url + 'login';
	//console.log(user);

	stats = "sending login credentials to " + url_post;
	console.log(stats);

	//send post request to api for validating login
	$.ajax({
	    type : "POST",
	    url : url_post,
	    data: user,
	    contentType: 'application/json;charset=UTF-8',
	    headers: {
		'X-token':'',
		'Content-Type':'application/json'
	    },
	    success: function(result, status, xhr) {
		console.log(result);
		//console.log(status);
		token=xhr.getResponseHeader("X-token");
		//console.log(token);
		var result_json = JSON.parse(result);
		//console.log(result_json);
		message = result_json['message'];
		success_msg = result_json['success'];
		//console.log(success_msg);
		localStorage.setItem("token", token);
		localStorage.setItem("username", username);
		localStorage.setItem("success_msg", success_msg);
		localStorage.setItem("message", message);
	    },
	    async: false
	});

	if(success_msg==true){
	    url_get = url + 'home/' + token
	    console.log(url_get);
	    window.location.href = url_get;

	}else{
	    console.log(message);
	    //location.reload();
	    $("#neg_msg_val").text(message)
	    $(".negative_msg").show();
	}
	
    });

    
    //assign val to logout object    
    var logout_val = "Logout:" + localStorage.getItem("username");
    //console.log(logout_val);
    $("#logout_val").text(logout_val);


    //logout function
    $("#logout").click(function(){
	var login_page = url + "login";
	console.log(login_page)
	window.location.href =login_page;

	var url_logout=url + "logout"
	$.ajax({
	    type : "DELETE",
	    url : url_logout,
	    data: "",
	    contentType: 'application/json;charset=UTF-8',
	    headers: {
		'X-token':localStorage.getItem("token"),
		'Content-Type':'application/json'
	    },
	    success: function(result, status, xhr) {
		console.log(result);
	    },
	    async: false
	});

	console.log("logout successfull")
	localStorage.removeItem("token");
	localStorage.removeItem("username");
	localStorage.removeItem("success");
	localStorage.removeItem("message");
    });



    $("#create_budget").click(function(){
	$("#budget_cal").show();
	$(".budget_form").show();
	$("#left_monthly").hide();
	$("#monthly_val").hide();
	$("#chart").hide();
	
	for (amount =50; amount < 20000; amount += 50) {
	    $('.drop_amount').append( new Option(amount) );
	}
	for (amount = 10000; amount < 30000; amount += 100) {
	    $('#budget_amount').append( new Option(amount) );
	}
	for (amount =60; amount < 100; amount += 1) {
	    $('#pounds_pesos').append( new Option(amount) );
	}
    });

    $('#budget_amount').on('change', function() {
	document.getElementById("total_budget").value = $("#budget_amount").val();
	document.getElementById("remaining").value = $("#budget_amount").val();
	
	var id = "#" + $(this).attr("id");
	$(id).prop("disabled", true);
	// $("#pounds_pesos").prop("disabled", false);

	for (amount =50; amount < document.getElementById("total_budget").value; amount += 50) {
	    $('.drop_amount').append( new Option(amount) );
	}

	

    });
    $('#pounds_pesos').on('change', function() {
	var total_pounds = $("#budget_amount").val() / parseInt($(this).val());
	document.getElementById("total_pounds").value = total_pounds.toFixed(2);
	// console.log(total_pounds.toFixed(2));
	$("#pounds_pesos").prop("disabled", true);
	// $("#month_label").show();
	$("#month").prop("disabled", false);
    });

    $('#month').on('change', function() {
	$(".drop_amount").prop("disabled", false);
    });


    
    $('.drop_amount').on('change', function() {
	var id = "#" + $(this).attr("id");
	var remaining_int = parseInt(document.getElementById("remaining").value);

	var remaining = remaining_int - $(this).val();
	document.getElementById("remaining").value = remaining;
	

	if(parseInt(document.getElementById("remaining").value)==0){	    
	    $(".drop_amount").prop("disabled", true);
	    document.getElementById("amount_alloc").value = parseInt(document.getElementById("amount_alloc").value) +  parseInt($(this).val());
	    // alert("Amount remaining less than 0");
	}else if(parseInt(document.getElementById("remaining").value)<0){
	    alert("Allocated amount is more than the budget!");
	    $(this).prop("disabled", false);
	    console.log("invalid");
	    var recal_amount_remaining = parseInt(document.getElementById("total_budget").value) - parseInt(document.getElementById("amount_alloc").value);
	    document.getElementById("remaining").value = recal_amount_remaining;;
	}else{
	    $(this).prop("disabled", true);
	    console.log("valid");

	    
	    if(parseInt(document.getElementById("amount_alloc").value)==0){
	    	document.getElementById("amount_alloc").value = $(this).val();
	    }else{
	    	 document.getElementById("amount_alloc").value = parseInt(document.getElementById("amount_alloc").value) +  parseInt($(this).val());
	    }
	    
	}

    });

    
    $("#close").click(function(){
	$(".budget_form").hide();
    })

    
    $("#reset").click(function(){
	location.reload();
    })


    
    var budget_raw = {};

    $("#save").click(function(){

	$(".select_name").each(function() {
	    var name = $(this).val();
	    var sel_id =  "#" + name;
	    var amount= parseInt($(sel_id).val());
	    t = name + ":" + amount
	    budget_raw[name] =amount;
	    //console.log(t);
	});
	var date = new Date();
	var year = date.getFullYear();
	
	budget_raw["amount_pesos"]= parseInt($("#budget_amount").val());
	budget_raw["rate"]= parseInt($("#pounds_pesos").val());
	budget_raw["month"]= $("#month").val();
	budget_raw["year"]= year;
	budget_raw["amount_pounds"]= parseInt($("#total_pounds").val());
	var budget= JSON.stringify(budget_raw);
	console.log(budget);

	
	if(document.getElementById("remaining").value==0){
	    console.log("valid")
	    var token = localStorage.getItem("token");
	    var budget_url = url + "home/" +token + "/" + "monthly_budget"
	    $.ajax({
		type : "POST",
		url : budget_url,
		data: budget,
		contentType: 'application/json;charset=UTF-8',
		headers: {
		    'X-token':localStorage.getItem("token"),
		    'Content-Type':'application/json'
		},
		success: function(result, status, xhr) {
		    console.log(result);
		},
		async: false
	    });
	    location.reload();
	    var message = "success"
	    console.log("message");
	    alert(message);

	}else{
	    $(".drop_amount").prop("disabled", false);
	    var message = "Check amount remaining!All Amount must be allocated!"
	    console.log("message");
	    $("#budget_msg_ng").text(message)
	    $(".budget_msg_ng").show();

	}
	
    });



    $("#add").click(function(){
	var new_raw ={};
	new_raw["name"]=$("#new_member").val();
	var new_member= JSON.stringify(new_raw);
	console.log(new_member);

	var token = localStorage.getItem("token");
	var add_url = url + "home/" +token + "/" + "add_member"
	var message = 0
	$.ajax({
	    type : "POST",
	    url : add_url,
	    data: new_member,
	    contentType: 'application/json;charset=UTF-8',
	    headers: {
		'X-token':localStorage.getItem("token"),
		'Content-Type':'application/json'
	    },
	    success: function(result, status, xhr) {
		console.log(result);
		var result_json = JSON.parse(result);
		message = result_json['message'];

	    },
	    async: false
	});
	alert(message);
	location.reload();	
    });

    $("#view_monthly").click(function(){
	$(".budget_form").hide();
	$("#budget_cal").hide();
	$("#left_monthly").show();
	$("#monthly_val").show();
	$("#chart").show();
	var token = localStorage.getItem("token");
	url_home = url + 'home/' + token;
	window.location.href = url_home;
    })




    $(".sub_link_left").click(function(){
	var month = $(this).attr("id");
	var selected_year = parseInt($("#year").val());
	$("#chart").hide();

	var token = localStorage.getItem("token");
	var get_budget_url = url + "home/" +token + "/" + "get_budget/" + month + "/" + selected_year;
	console.log(get_budget_url);
	budget_url = get_budget_url;
	console.log(budget_url);
	window.location.href = budget_url;
    });
    //set current year
    var current_date = new Date();
    var current_year = current_date.getFullYear();
    var pre_year = current_year -1;
    $('#year').append( new Option(current_year) );
    $('#year').append( new Option(pre_year) );

    //nav bar click function
    $("#workout").click(function(){
	var token = localStorage.getItem("token");
	url_workout = url + 'home/' + token + '/workout';
	window.location.href = url_workout;
    })

    $("#finance").click(function(){
	var token = localStorage.getItem("token");
	url_home = url + 'home/' + token;
	window.location.href = url_home;
    })


    $("#health").click(function(){
	var token = localStorage.getItem("token");
	url_home = url + 'home/' + token + '/health';
	window.location.href = url_home;
    })

    
// workout javasript
    $("#profile").click(function(){
	$("#workout_frm").show();
	$("#create_wrk").hide();
    })
    $("#close_prof").click(function(){
	$("#workout_frm").hide();
	// need to add redirect link for view workout page
    })

    $('#create_workout').click(function(){
	$("#create_wrk").show();
	$("#workout_frm").hide();
	var data_wkr = null;
	var token = localStorage.getItem("token")
	var get_template_url = url + "home/" + token + "/create_workout";
	//console.log(user);

	stats = "getting template from " + get_template_url;
	console.log(stats);
	
    });


    $('#wrk_type').on('change', function() {
	$("#wrk_name").prop("disabled", false);
	var workout_type = $(this).val();
	console.log(workout_type);

	if(workout_type=="chest"){
	    console.log("chest");
	    $('#wrk_name').empty();;
	    var chest = [
		"decline bench press",
		"incline bench press",
		"flat bench press",
		"decline dumbell press",
		"incline dumbell press",
		"flat dumbell press",
		"push up"
	    ];

	    $.each(chest, function(x,y) {
		
		$('#wrk_name').append( new Option(y) );
	    });

	}else if(workout_type=="bicep") {
	    console.log("bicep")
	    $('#wrk_name').empty();;
	    var bicep = [
		"Hammer curl",
		"21",
		"alternate dumbell curl",
		"ez bar curl"
	    ];
	    
	    $.each(bicep, function(x,y) {
		$('#wrk_name').append( new Option(y) );
	    });
	    
	}else if(workout_type=="cardio") {
	    console.log("cardio");
	    $('#wrk_name').empty();;
	    var cardio = [
		"jogging",
		"stationary cycling",
		"jump ropes",
		"boxing"
	    ];
	    $.each(cardio, function(x,y) {
		$('#wrk_name').append( new Option(y) );
	    });
	    
	}else if(workout_type=="legs") {
	    console.log("legs");
	    $('#wrk_name').empty();;
	    var legs = [
		"dumbell squats",
		"barbell squats",
		"body weight squats"
	    ];
	    $.each(legs, function(x,y) {
		$('#wrk_name').append( new Option(y) );
	    });

	    
	}else{
	    console.log("abs");
	    $('#wrk_name').empty();;
	    var abs = [
		"planks",
		"crunches",
		"scissor kick crunch",
		"bicycle crunch"
	    ];
	    $.each(abs, function(x,y) {
		$('#wrk_name').append( new Option(y) );
	    });

	}


	
    });

    //datepicker
    $(function() {
	$( "#datepicker" ).datepicker();


	//loop for generating dropdown values for sugar level
	for (amount =1; amount < 26; amount += 1) {
	    $('#sugar_level').append( new Option(amount) );
	}
	$('#sugar_slevel').append( new Option("unreadable") );


    });

    //function for adding and collecting sugar levels    
    $("#reset_slevel").click(function(){
	location.reload();
    })


    

    $("#save_slevel").click(function(){

	var health_val = {}
	var get_heath_id = []
	health_val["sugar_level"]=parseInt($("#sugar_level").val());
	health_val["date_taken"]=$("#date_taken").val();
	health_val["weight"]=parseInt($("#weight").val());
	health_val["slevel_notes"]=$("#slevel_notes").val();
	console.log(health_val);
	var health =JSON.stringify(health_val);
	console.log(health);


	
	//check if feilds are empty
	// if ($('input[value=""]').length > 0) {
	//     console.log('some fields are empty!')
	// };
    });


    
});


