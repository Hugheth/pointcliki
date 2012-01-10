(function() {

	pc.Action = function( id, clock, object, tween, duration, easing ) {
		// Properties
		this.id = id;
		// Clock
		this.clock = clock || null;
		// Object
		this.object = object || null;
		// Target properties
		this.tween = tween || {};
		// Duration
		this.duration = duration || 1000;
		// Easing function
		this.easing = easing || 'linear';
		
		// Original properties
		this.original = {};
		
		// Start time
		this.startTime = 0;
		
		var t = this;
		// On step
		this.step = function() {
		
			// Check object to invalidate
			if (t.object.invalidateArea)
				t.object.invalidateArea(0, 0, 32, 32);
		
			if (t.clock.time >= t.startTime + t.duration) return t.end();
		
			for (var i in t.tween)
				t.object[i] = pc.easing[t.easing](t.clock.time - t.startTime, t.original[i], t.tween[i] - t.original[i], t.duration);
		
			return true;
		};
	};
	pc.Action.prototype = {
		start: function() {
		
			this.startTime = this.clock.time;
		
			// Copy over information
			for (var i in this.tween)
				this.original[i] = this.object[i];

			// Add step event to clock
			this.clock.addEvent(this.id + '.step', this.step);
		},
		stop: function() {
		
			// Remove step event
			this.clock.removeEvent(this.id + '.step');
		},
		end: function() {
		
			for (var i in this.tween)
				this.object[i] = this.tween[i];
				
			// Remove step event
			this.clock.removeEvent(this.id + '.step');
		},
		cancel: function() {
		
			for (var i in this.original)
				this.object[i] = this.tween[i];
				
			// Remove step event
			this.clock.removeEvent(this.id + '.step');
		}
	};
})();
