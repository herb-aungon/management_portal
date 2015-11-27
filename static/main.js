var url = 'http://192.168.1.76:5000/'
var stats = null;
var token = null;
var message=null;
var data=null;
$( document ).ready(function() {
    
    $('#login').click(function(){

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
		console.log(status);
		token=xhr.getResponseHeader("X-token");
		console.log(token);
		var result_json = JSON.parse(result);
		console.log(result_json);
		message = result_json['message'];
		
	    },
	    async: false
	});

	console.log(message);

	
	// if(username.length > 1)
	// {
	// }else{

	//     $("#neg_msg_val").text(message)
	//     $(".negative_msg").show();
	// }


	
    });


});
