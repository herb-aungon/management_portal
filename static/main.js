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

	//console.log(stat);
	//var test = localStorage.getItem("success_msg")
	if(success_msg==true){
	    //console.log(success_msg);
	    //console.log(message);
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
	$(".budget_form").show();
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
	// console.log(id);
	// $(this).prop("disabled", true);
	// var remaining_int = parseInt(document.getElementById("remaining").value);
	// var remaining = remaining_int - $(this).val()
	// document.getElementById("remaining").value = remaining;
	// document.getElementById("amount_alloc").value = $(this).val();
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

	

	// document.getElementById("remaining").value = remaining;
    });

    
    $("#clear").click(function(){
	$('.drop_amount').prop('selectedIndex', 0);
	$(".drop_amount").prop("disabled", false);
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
	    console.log("valid");
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

});


