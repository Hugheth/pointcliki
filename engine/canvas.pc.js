(function() {
	// Canvas
	pc.Canvas = function( id, width, height ) {
		// Properties
		this.id = id;
		this.game = null;
		// Dimensions
		this.width = 0;
		this.height = 0;
		
		// Container rendering
		this.container = null;
		
		// Position relative to container
		this.x = 0;
		this.y = 0;
		/* TODO
		this.scaleX = 1;
		this.scaleY = 1;
		this.rotate = 0;
		*/
		// Clock
		this.clock = null;
		// DOM
		this.dom = $('<canvas id="' + id + '" width="0" height="0"></canvas>');
		// Context
		this.ctx = this.dom[0].getContext('2d');
		
		// Event
		this.event = this.dom;
		
		// Resize
		this.setSize(width, height);
		
		// Invalid
		this.valid = false;
		
		var t = this;
		
		// Render the contents of the container
		this.render = function() {
		
			if (!t.container) return;
			if (t.valid) return true;
					
			t.ctx.clearRect(0, 0, t.width, t.height);
		
			t.ctx.save();
			t.ctx.translate(t.x, t.y);
		
			t.container.renderArea(
				t.ctx,
				-t.x,
				-t.y,
				t.width,// / t.scaleX,
				t.height// / t.scaleY
			);
			t.ctx.restore();
			
			// TODO - Transform
						
			t.valid = true;
			return true;
		};
	};
	pc.Canvas.prototype = {
		// Set the size - if either dimension 0 then leave as before
		setSize: function( x, y ) {
			
			this.width = x;
			this.height = y;
			
			this.dom.attr(('width'), x || this.dom.attr('width'));
			this.dom.attr(('height'), y || this.dom.attr('height'));
		},
		// Set the clock to render with
		setClock: function( clock ) {
		
			if (this.clock) this.clock.removeEvent(this.id + '.render');
		
			this.clock = clock;
			
			if (clock != null)
				clock.addEvent(this.id + '.render', this.render);
		},
		// Set the container
		setContainer: function( container ) {
		
			if (this.container) delete this.container.canvases[this.id];
			
			container.canvases[this.id] = this;
			
			this.container = container;
		},
		
		// Invalidate the rendered area
		invalidateArea: function( x, y, width, height ) {
			// Quit early to save work ahead
			if (!this.valid) return;
			
			var rect = pc.math.intersectRects([-this.x, -this.y, this.width, this.height], [x, y, width, height]);
			
			if (rect) this.valid = false;
			
			if (!this.clock) this.render();
		},
		getTexture: function() {
			return this.dom[0];
		}
	};
})();
