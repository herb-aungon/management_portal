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
    });

    $("#close").click(function(){
	$(".budget_form").hide();
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

	var budget= JSON.stringify(budget_raw);
	console.log(budget);
	if(document.getElementById("remaining").value==0){
	    console.log("valid");
	}else{
	    console.log("invalid");
	}

	
    });

    $('#budget_amount').on('change', function() {
	document.getElementById("remaining").value = $("#budget_amount").val();
	$(".budget").show();
	var id = "#" + $(this).attr("id");
	$(id).prop("disabled", true);
    });

    $('.drop_amount').on('change', function() {
	var id = "#" + $(this).attr("id");
	console.log(id);
	$(this).prop("disabled", true);

	var remaining = parseInt(document.getElementById("remaining").value) - $(this).val();
	document.getElementById("remaining").value = remaining;
    });
    
});


