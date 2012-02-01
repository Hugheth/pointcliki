$(function() {

	pc.user = window.user;
	pc.personal = window.personal;

	pc.init();
	
	pc.game.event.bind('update.user', pc.net.updateUser);
	pc.game.event.trigger('update.user');
});

(function() {
	
	pc.net = {};

	pc.net.host = 'http://lifeordeath.org/pointcliki/';
	
	// Prompt user onleave
	window.onbeforeunload = function() {
		if (pc.user.id === false)
			return "UH OH!\n\nYou haven't saved your game! If you'd like to, stay on this page and Sign In or Register - it only takes a few seconds...";
	};
	
	pc.net.updateUser = function() {
	
		if (pc.user.alias) {
			
			$('#avatar').attr('src', pc.user.avatar);
			$('#alias').html(pc.user.alias);
			$('#stars').html(pc.user.stars);
			$('#login').hide();
			$('#settings').show();
			
		} else {
			
			$('#avatar').attr('src', pc.net.host + 'lib/avatar.jpg');
			$('#alias').html('');
			$('#stars').html(pc.user.stars);
			$('#login').show();
			$('#settings').hide();
		}
	};
		
	pc.net.post = function( app, data, callback ){
	
		var error = function() {
			callback({error: 'No connection!'});
		};
		
		var success = function( data ) {
			(callback || function(){})(data);
		};
	
		$.ajax({
			url: pc.net.host + 'server/' + app + '.php',
			type: 'POST',
			dataType: 'json',
			data: data,
			success: success,
			error: error
		});
	};
	
	pc.net.login = function(){
		
		pc.overlay('loginOverlay');
		
		var w = null;
		
		var fbcheck = setInterval(function() {
				
			if (w && w.window) {
				
				if (w.window.user) {
					pc.user = w.window.user;
					pc.personal = w.window.personal;
					w.window.close();
					close();
					pc.game.event.trigger('update.user');
				}
			}
		
		}, 200);
		
		var facebook = function() {
			w = window.open(pc.net.host + 'server/fauth.php', 'clikiLogin');
		};
		
		var login = function() {
		
			var email = $('#loginOverlay input[name="name"]').val();
			var pass = $('#loginOverlay input[name="pass"]').val();
		
			if (!email) return alert('Please enter your email address');
			
			pc.net.post('auth', {}, function( data ) {
				
				if (data.error)
					return alert("An error occurred while trying to login: " + data.error);
					
				if (data.key) {
				
					for (var i = 0; i < 16; i++) pass = hex_md5(pass + data.key + i);
				
					pc.net.post('auth', {email: email, hash: pass}, function( data ) {
					
						if (data.error)
							alert("An error occurred while trying to login: " + data.error);
						
						if (data.user && data.personal) {
							pc.user = data.user;
							pc.personal = data.personal;
							close();
							pc.game.event.trigger('update.user');
						}
					});
				}
			});
			
			$('#loginOverlay input[name="pass"]').val('');
					
			for (var i = 0; i < 16; i++) pass = hex_md5(pass + email + i);
		};
		
		var register = function() {
			var email = $('#loginOverlay input[name="name"]').val();
			var pass = $('#loginOverlay input[name="pass"]').val();
			
			if (!email) return alert('Please enter your email address');
			
			$('#loginOverlay input[name="pass"]').val('');
			
			pc.net.post('auth', {email: email, pass: pass, register: true}, function( data ) {
				
				if (data.error)
					alert("An error occurred while trying to register an account: " + data.error);
				
				if (data.user && data.personal) {
					pc.user = data.user;
					pc.personal = data.personal;
					close();
					pc.game.event.trigger('update.user');
				}
			});
		};
		
		var reset = function() {
			
			var email = $('#loginOverlay input[name="name"]').val();
			
			if (!email) return alert('Please enter your email address');
			
			var ok = confirm('Are you sure you want to reset your password? An email will be sent to "' + email + '" with a new, temporary password. Press OK/YES to continue.');
			
			if (ok) pc.net.post('auth', {email: email, reset: true}, function( data ) {
				if (data.error)
					return alert("An error occurred while trying to reset your password: " + data.error);
					
				alert('Your password has been reset!');
			});
		};
		
		var close = function() {
			clearInterval(fbcheck);
			$('#loginOverlay').trigger('close');
			$('#loginOverlay .heading .close').unbind('click', close);
			$('#loginOverlay .button.facebook').unbind('click', facebook);
			$('#loginOverlay .button.reset').unbind('click', reset);
			$('#loginOverlay .button.login').unbind('click', login);
			$('#loginOverlay .button.register').unbind('click', register);
		};
		
		$('#loginOverlay .heading .close').bind('click', close);
		$('#loginOverlay .button.facebook').bind('click', facebook);
		$('#loginOverlay .button.reset').bind('click', reset);
		$('#loginOverlay .button.login').bind('click', login);
		$('#loginOverlay .button.register').bind('click', register);
	};
	pc.net.logout = function() {
		
		var ok = confirm('Are you sure you want to logout? Press OK/YES to continue.');
		
		if (!ok) return;
		
		pc.net.post('logout');
		pc.user = {
			id: false,
			alias: '',
			stars: 0,
			friends: {},
			progress: false
		};
		pc.personal = {};
		pc.game.event.trigger('update.user');
	};
	
	pc.net.setProgress = function( personal, progress ) {
	
		if (pc.user.id === false) return;
		
		pc.net.post('progress', {}, function( data ) {
			if (data.error) return alert('An error occurred trying to save your progress. Please try again later.');
			
			for (var i = 0; i < 16; i++) data.key = hex_md5(data.key + pc.game.name + i);
			
			pc.net.post('progress', {personal: JSON.stringify(personal), progress: JSON.stringify(progress), game: pc.game.name, key: data.key}, function( data ) {
				
				if (data.error) return alert('An error occurred trying to save your progress. Please try again later.');
				
				pc.user.progress[pc.game.name] = progress;
				pc.personal[pc.game.name] = personal;
			});
		});
	};
	
	$('#login a').live('click', pc.net.login);
	$('#logout a').live('click', pc.net.logout);
	
	pc.overlay = function( id ) {
		
		var close = function() {
			$('#' + id).removeClass('open').fadeTo(400, 0).unbind('close', close);
			$('#overlay').fadeTo(400, 0, function() {
				$('#overlay').hide();
				$('#' + id).hide();
			});
		};
		
		$('#overlay').show().fadeTo(400, 0.4);
		$('#' + id).addClass('open').show().fadeTo(400, 1).bind('close', close);
	};
})();
