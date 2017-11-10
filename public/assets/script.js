$(function() {
  	chat.init();
})
var d_host = 'http://localhost:5000';

var chat_app = function() { }

chat_app.prototype = {
	init: function() {
		var self = this;

		var epush = {
			user_id: self.ramdom_key(),
			user_name: 'MAD MAX',
			user_to: 'doctor',
			img: 'http://earnthis.net/wp-content/uploads/2015/03/Sokka-2-50x50.png',
			channel: 'put-your-channel-here'
		}

		self.load_pusher(epush);
		self.chat_events(epush);
	},
	chat_events: function(epush) {
		var self = this;
		$(window).on('keyup', function(e) {
			var code = (e.keyCode ? e.keyCode : e.which);
		  	if(code == 13) { 
		        self.send_chat(epush)
  				self.send_untyping(epush)
		  	} 
		  	$('#input_'+ epush.channel).focus()
		  	self.load_typing(epush)
		});
	},
	ramdom_key: function() {
		var text = "";
		var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
		for (var i = 0; i < 5; i++)
		    text += possible.charAt(Math.floor(Math.random() * possible.length));
		return text;
	},
	// loading pusher config
	load_pusher: function(epush) {
		var self = this;
		var box = $('#'+epush.channel); // container
		
		var atpush = {
		  	cluster: 'ap1',
		 	encrypted: true,
			authTransport: 'jsonp',
    		authEndpoint: d_host + '/pusher/auth',
    		auth: {
		      	params: {
		      		user_id: epush.user_id,
		      		name: epush.user_name
		      	}
		    }
		}

		var pusher = new Pusher('62310c0e42042fc35881', atpush);
		Pusher.logToConsole = false;


		pusher.connection.bind('connecting_in', function(delay){
			box.find('.box-connecting').fadeIn()
			box.find('.box-chat').hide()
		})

		pusher.connection.bind('connected', function() {
			box.find('.box-connecting').hide()
			box.find('.box-chat').fadeIn()
		})

		self.load_channels(pusher, epush)
	},
	// bind channel from server
	load_channels: function(pusher, epush) {

		var presence = pusher.subscribe('presence-'+ epush.channel)
		var channel = pusher.subscribe(epush.channel)

		presence.bind('pusher:subscription_succeeded', function(members) {
		  	if (members.count >= 2) {
		  		$('#'+epush.channel+ ' .who-online')
		  		.find('span').html('online').addClass('active')
		  	}
		  		console.log(members.count)
		});	

		presence.bind('pusher:member_added', function(member){
			$('#'+epush.channel+ ' .who-online')
			.find('span').html('online').addClass('active')
			console.log(member)
		})

		presence.bind('pusher:member_removed', function(member){
			$('#'+epush.channel+ ' .who-online')
			.find('span').html('offline').removeClass('active')
			console.log(member)
		})

		// ===== >> listening for chat request
		channel.bind('chat', function(data) {
			var _cls = '', _img = '';  
			if ( epush.user_id == data.res.user_id ) {
				_cls = 'msg-right';
			} else {
				_img = '<img src="'+ data.res.img +'">';
			}
			
			$('#ul_'+ data.res.channel +' li.typing').remove()
		  	$('#ul_'+ data.res.channel)
		  	.append('<li><div class="chat-msg '+ _cls +'">'+ _img +'\
		        <div class="text-chat">'+ data.res.message +'</div>\
		      </div></li>')

		  	var _element = document.getElementById(data.res.channel)
		  	_element.scrollTop = _element.scrollHeight
		});

		// ===== >> listening for typing request
		channel.bind('typing', function(data) {
			if ( epush.user_id != data.res.user_id ) {
				$('#ul_'+ data.res.channel)
				.append('<li id="li_'+ data.res.user_id +'" class="typing"><div class="chat-msg">\
			        <img src="'+ data.res.img +'">\
			        <div class="text-chat">\
			        	<div class="one"></div>\
		                <div class="two"></div>\
		                <div class="three"></div>\
			        </div>\
			      </div></li>');
				var _element = document.getElementById(data.res.channel)
		  		_element.scrollTop = _element.scrollHeight
			}
		});

		// ===== >> listening for notTyping request
		channel.bind('notyping', function(data) {
			$('#li_'+ data.res.user_id).remove()
			var _element = document.getElementById(data.res.channel)
		  	_element.scrollTop = _element.scrollHeight
		})
	},
	// send message on server
	send_chat: function(epush) {
		var msg = $('#input_'+epush.channel)
		var _bee = epush;
			_bee.message = msg.val()

		$.ajax({
			type: 'POST', url: d_host + '/chat', data: _bee,
			complete: function(xhr, res){ 
				msg.val('') 
  				_is_press = false;
			}
		})
	},
	send_typing: function(epush) {
		$.ajax({
			type: 'POST',
			url: d_host+ '/typing',
			data: epush,
			complete: function(xhr, res){  }
		})
	},
	send_untyping: function(epush) {
		$.ajax({
			type: 'POST',
			url: d_host + '/notyping',
			data: epush,
			complete: function(xhr, res){  }
		})
	},
	load_typing: function(epush) {
		var self = this;
		var _input = $('#input_'+ epush.channel);
		if(_input.val() != '' && _is_press == false ) {
			_is_press = true;
			self.send_typing(epush)
		} else {
			if (_input.val() == '') {
				self.send_untyping(epush)
				_is_press = false;
			}
		}
	},

}

var _is_press = false;
var chat = new chat_app();
