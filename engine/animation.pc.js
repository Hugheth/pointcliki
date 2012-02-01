(function() {
	// Animation
	pc.Animation = function( id, width, height, texture, u, v, clock, cols, rows, durs, loop ) {
		
		// Extend from sprite
		pc.Sprite.apply(this, [id, texture, width, height, u, v]);
		
		// Dimensions to use in animation
		this.cols = cols || 0;
		this.rows = rows || 0;
		
		this.baseU = this.u;
		this.baseV = this.v;
		this.currentFrame = 0;
		this.loop = (loop === undefined) ? true : loop;
		this.frameTime = 0;
		
		// Playing
		this.playing = false;
		
		// Durations
		this.durations = durs || [];
		
		// Clock to use
		this.clock = clock || null;
		
		var t = this;
		// Animate
		this.nextFrame = function( clock ) {
		
			if (clock != t.clock) return;
			if (!t.playing) return;
			
			if (clock.time < t.frameTime) return true;
			
			t.currentFrame++;
			
			if (t.durations.length == t.currentFrame) {
			
				if (t.loop) t.currentFrame = 0;
				else t.stop();
			}
			
			t.u = t.baseU + (t.currentFrame % t.cols) * t.width;
			t.v = t.baseV + Math.floor(t.currentFrame / t.cols) * t.height;
			
			t.invalidateArea(0, 0, t.width, t.height);
			
			// Calculate the time of the next frame change, or offset from the
			// current clock time if this is already in the past. This prevents
			// the animation from falling behind in the case that there is a time
			// jump (e.g. computer put on sleep)
			t.frameTime += t.durations[t.currentFrame];
			
			if (t.frameTime < clock.time)
				t.frameTime = clock.time + t.durations[t.currentFrame];
			
			return true;
		};
	};
	pc.Animation.prototype = {
		
		start: function() {
			
			if (!this.clock) {
				console.log('No clock for animation [' + this.id + '] to use');
				return;
			}
			
			this.frameTime = this.clock.time + this.durations[this.currentFrame];
			
			this.clock.addEvent(this.id + '.nextFrame', this.nextFrame);
			
			this.playing = true;
		},
		stop: function() {
			this.playing = false;
			
			this.clock.removeEvent(this.id + '.nextFrame');
		},
		change: function( u, v, cols, rows, durs, loop ) {
			
			this.frameTime -= this.durations[this.currentFrame];
			
			this.currentFrame = 0;
			this.baseU = u;
			this.baseV = v;
			this.u = u;
			this.v = v;
			this.cols = cols;
			this.rows = rows;
			this.durations = durs;
			this.loop = loop;
			
			this.frameTime += this.durations[0];
		}
	};
	pc.Animation.prototype = $.extend({}, pc.Sprite.prototype, pc.Animation.prototype);
})();
