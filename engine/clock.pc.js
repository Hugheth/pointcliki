/*
 *  1. Events must have a id property that is unique to other events
 *  2. If event has self property then this becomes the "this" property when the function is called
 *  3. There is no way to remove delayed events, so make sure at the start of the event that it is
 *     still the needed behaviour for the event to run, or whether the object has been removed etc.
 *
 */
(function() {

	// Clock
	pc.Clock = function( id, speed ) {
		// Properties
		this.id = id;
		// Time
		this.time = 0;
		// Frame
		this.frame = 0;
		// Speed
		this.speed = speed || 50;
		// Duration
		this.dur = 1000 / this.speed;
		// Interval
		this.interval = null;
		// Paused
		this.paused = true;

		// Delayed events
		this.delayEvents = [];
		// Always events
		this.alwaysEvents = {};
		
		var t = this;
		// Tick	
		this.tick = function() {
		
			if (t.paused) return;
						
			// Get the new time
			var cur = (new Date()).getTime();
			var time = cur - t.beginTime + t.pausedTime;
		
			// Check if enough time has passed since the last
			// frame, namely over half the framerate
			if (time - t.lastTime > t.dur / 2) {
		
				// Commit time
				t.time = time;
				// Trigger
				t.trigger();
				
				t.frame++;

				// Update last time
				t.lastTime = time;
			}
		};
		// Trigger
		this.trigger = function() {
			
			var events = t.alwaysEvents;
			
			var keep = {};
		
			// Ongoing events
			for (var i in events) {
			
				var status = events[i](t);
				if (status === true) keep[i] = events[i];
			}
			// Update events
			t.alwaysEvents = keep;
		
			// Delayed events
			while (t.delayEvents.length) {
				
				if (t.delayEvents[0].time <= this.time) {
				
					var event = t.delayEvents.shift();
					
					var status = event(t);
					
					event.clock = null;
					
					if (status >= 0) t.delayEvent(event.id, event, status);
				
				} else {
					break;
				}
			}
		};
		
		this.beginTime = 0;
		this.offsetTime = 0;
		this.pausedTime = 0;
		this.lastTime = 0;
	};
	pc.Clock.prototype = {
		start: function() {
			this.interval = setInterval(this.tick, this.dur);
			
			// Mark the first time
			if (!this.beginTime)
				this.beginTime = (new Date()).getTime();
			
			// Add to offset the duration of recently paused time
			if (this.pausedTime)
				this.offsetTime += (new Date()).getTime() - this.pausedTime;
			this.pausedTime = 0;
			
			this.paused = false;
		},
		stop: function() {
			clearInterval(this.interval);
			this.interval = null;
			
			this.pausedTime = (new Date()).getTime();
		
			this.paused = true;
		},
		reset: function() {
			this.time = 0;
			this.beginTime = 0;
			this.offsetTime = 0;
			this.pausedTime = 0;
			this.delayEvents = {};
			this.alwaysEvents = {};
		},
		setSpeed: function( speed ) {
			clearInterval(this.interval);
			
			this.speed = speed;
			
			this.dur = 1000 / speed;
			
			if (!this.paused)
				this.interval = setInterval(this.tick, this.dur);
			else
				this.interval = null;
		},
		delayEvent: function( id, event, delayTime ) {
		
			// Check for clock
			if (event.clock) return;
			
			event.id = id;
			
			// Don't allow negative or false times that might block up the event object
			if (delayTime === false || delayTime < 0) return;
			
			event.clock = this;
			event.time = (event.time || this.time) - (-delayTime);
			
			var done = false;
			
			// Add to priority queue of events
			for (var i in this.delayEvents) {
			
			 	if (this.delayEvents[i].time > event.time) {
			 	
			 		this.delayEvents.splice(i, 0, event);
			 		
			 		done = true;
			 		break;
			 	}
			}
			
			if (!done) this.delayEvents.push(event);
		},
		addEvent: function( id, event ) {

			this.alwaysEvents[id] = event;
		},
		removeEvent: function( id ) {
			delete this.alwaysEvents[id];
		}
	};
})();
