(function() {

	if (!window.console) console = {log: function() {}, warn: function() {}, error: function() {}};

	pc = { uid: 0, util: {} };
	
	// Check compatability
	if (!$('<canvas></canvas>')[0].getContext)
		alert('Your browser is out of date and cannot display pointCliki games. Please update it to the latest version!');
		
	else if (!$('<audio></audio>')[0].play)
		alert('Your browser is out of date and cannot play pointCliki sounds. Please update it to the latest version!');
	
	// Keyboard polling
	var keyMap = {};	// Store a map of all the keys
	// Events to detect key presses
	$(document).keydown(function( e ){
		keyMap[e.keyCode] = true;
		
		var arr = [37, 38, 39, 40];
		for (var i in arr) if (e.keyCode == arr[i]) return false;
	});
	$(document).keyup(function( e ){
		keyMap[e.keyCode] = false;
	});
	// Return whether a key is currently pressed
	pc.keyPressed = function( code ) {
		return !!(keyMap[code]);
	};
	
	// Mute sound effects / music
	$('#options .music').live('click', function() {
		if ($(this).hasClass('mute')) {
			$(this).removeClass('mute');
			$(this).html('Music <b>on</b>');
			pc.game.resumeSound(pc.music);
		} else {
			$(this).addClass('mute');
			$(this).html('Music <b>off</b>');
			pc.game.pauseSound(pc.music);
		}
	});
	$('#options .effects').live('click', function() {
		if ($(this).hasClass('mute')) {
			$(this).removeClass('mute');
			$(this).html('Effects <b>on</b>');
			pc.mute = false
		} else {
			$(this).addClass('mute');
			$(this).html('Effects <b>off</b>');
			pc.mute = true;
		}
	});
	
	// Game
	pc.Game = function( name, render, logic, arbiter ) {
		// Properties
		this.name = name;
		// Canvases
		this.canvases = {};
		// Render clock
		this.renderClock = render;
		// Logic clock
		this.logicClock = logic;
		
		// Arbiter
		this.arbiter = arbiter;
		
		if (arbiter)
  		logic.addEvent(arbiter.id + '.tick', arbiter.tick);
		
		// Progress and stats
		this.stats = pc.user[name] || {};
		this.progress = pc.personal[name] || {};
		
		// Event
		this.event = $('<span></span>');
		
		// Assets
		this.assets = {};
	};
	
	var startTime = 0, interval = 0;
	
	pc.Game.prototype = {
	
		addCanvas: function( canvas ) {
		
			this.canvases[canvas.name] = canvas;
			
			canvas.game = this;			
			canvas.setClock(this.renderClock);
		},
		removeCanvas: function( canvas ) {
			delete this.canvases[canvas.name];
			
			canvas.game = null;
			canvas.setClock(null);
		},
		loadAssets: function( images, sounds, objs, callback ) {
		
		  $('#tag').html('0%');
			
			var errorset = [];
				
			var max = images.length + objs.length;
			var count = max;
			
			for (var i in images) {
			
				var src = 'graphics/' + images[i];
				this.assets[src] = false;
			
				var img = new Image();
				
				var t = this;
				img.onload = function() {
                
					t.assets[this._src] = this;
					
					count--;
					
				  $('#tag').html(Math.floor((1 - count / max) * 100) + '%');
					
					if (!count) callback(errorset);
				};
                img._src = src;
				img.src = src;
			}
            
			for (var i in sounds) {

					var src = 'sounds/' + sounds[i];
					  
				var aud = $('<audio></audio>');

				this.assets[src] = aud;

				var t = this;

				var type = src.split('.');
				type = type[type.length - 1];

				aud.append('<source type="audio/mp3" src="' + src + '.mp3"/>');
				aud.append('<source type="audio/ogg" src="' + src + '.ogg"/>');
			}
				
			for (var i in objs) {
			
				this.assets[objs[i]] = false;
				
				var t = this;
				(function() {
					var obj = objs[i];
			
					$.ajax({
						url: obj,
						success: function( data ) {
							if (data)
								
								t.assets[obj] = data;
								
							else {
								errorset.push(obj);
								delete t.assets[obj];
							}
							
							count--;
							
					  $('#tag').html(Math.floor((1 - count / max) * 100) + '%');
					  
							if (!count) callback(errorset);
						},
						error: function() {
							errorset.push(obj);
							delete t.assets[obj];
							count--;
							
							if (!count) callback(errorset);
						}
					});	
				})();
			}
		},
			
		playSound: function( sound, volume, loop ) {

			if (pc.mute) return;
			
			var channel = this.assets['sounds/' + sound].clone();

			$('body').append(channel);

			if (loop) channel[0].loop = true;

			if (volume === 0 || volume) 
				channel[0].volume = volume;
			else
				channel[0].volume = 1;

			if (channel[0].play) {
				channel[0].addEventListener('ended', function() {
					channel.remove();
				}, false);
				channel[0].play();
			}

			return channel;
		},
		
		pauseSound: function( channel ) {
			if (channel[0].pause)
				channel[0].pause();
		},
		resumeSound: function( channel ) {
			if (channel[0].play)
				channel[0].play();
		},
		
		stopSound: function( channel ) {
			channel.remove();
		}
	};
})();
