var url = 'http://192.168.1.76:5000/'
var stats = null;
var token = null;
var message=null;
var data=null;
var sucess=null;
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
		success = result_json['success'];
		//console.log(success);
		localStorage.setItem("token", token);
		localStorage.setItem("username", username);
		localStorage.setItem("success", success);
		localStorage.setItem("message", message);
	    },
	    async: false
	});

	//console.log(stat);
	if(success==true){
	    //console.log('success');
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


    //finance page
    var max_fields = 50; //maximum input boxes allowed
    var wrapper = $(".budget"); //Fields wrapper
    var x = 1; //initlal text box count
    $("#add").click(function(e){
	console.log('new field added');
	e.preventDefault();
	if(x < max_fields){ //max input box allowed
	    x++; //text box increment
	    //$(wrapper).append('<div><input type="text" name="mytext[]"/><a href="#" class="remove_field">Remove</a></div>'); //add input box
	    $(wrapper).append('<div><select id="select_name" name="name" class="drop_name"><option selected>Select Name</option>{% for name in names %}<option value="{{ name.name }}">{{ name.name }}</option>{% endfor %}</select><select id="select_amount" name="name" class="drop_amount"><option selected>Select Name</option></select></div>');
	    // var _id = document.querySelectorAll('.name');
	    // var _amount = document.querySelectorAll('.amount');
	    // var _remove = document.querySelectorAll('.remove');
	    // var id_val = "name_amount_"+x;
	    // console.log(id_val);
	    // _id.id= id_val;
	    // _amount.id=id_val;
	    // _remove.id=id_val;
	}

    });

    $('.drop_name').on('change', function() {
	for (amount =50; amount < 20000; amount += 50) {
	    $('.drop_amount').append( new Option(amount) );
	}
    });
    


    
});


