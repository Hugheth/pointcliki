(function() {

	if (!console) console = {log: function() {}, warn: function() {}, error: function() {}};

	pc = { uid: 0, util: {} };
	
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
	
	// Game
	pc.Game = function( name ) {
		// Properties
		this.name = name;
		// Canvases
		this.canvases = {};
		// Render clock
		this.renderClock = null;
		// Logic clock
		this.logicClock = null;
		// Frame
		this.frame = 0;
		// Current time since start
		this.time;
		
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
			
			var errorset = [];
			
			var count = images.length + sounds.length + objs.length;
			
			for (var i in images) {
			
				var src = 'graphics/' + images[i];
				this.assets[src] = false;
			
				var img = new Image();
				
				var t = this;
				img.onload = function() {
					t.assets[this._src] = this;
					
					count--;
					
					if (!count) callback(errorset);
				};
				img._src = src;
				img.src = src;
			}
			// TODO sounds
			
			/*
				for (var i in sounds) {
	
					count++;
		
					this.assets[i] = true;
		
					var aud = new Audio();
					aud.onload = 
				}
			*/
			for (var i in objs) {
			
				this.assets[objs[i]] = false;
				
				var t = this;
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
						
						if (!count) callback(errorset);
					},
					error: function() {
						errorset.push(obj);
						delete t.assets[obj];
						count--;
						
						if (!count) callback(errorset);
					}
				});			
			}
		}
	};
})();
