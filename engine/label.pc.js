(function() {
	// Label
	pc.Label = function( id, text, size, color, font ) {
		// Properties
		this.id = id;
		// Position relative to container
		this.x = 0;
		this.y = 0;
		this.order = 0;
		/* TODO
		this.scaleX = 1;
		this.scaleY = 1;
		this.rotate = 0;
		*/
		// Container rendering
		this.parent = null;
		
		this.text = text;
		this.lines = text.split("\n");
		this.size = size || 14;
		this.lineHeight = this.size * 1.5;
		this.color = color || '#000000'
		
		this.alpha = 1;
		
		// Font
		this.font = font || 'Arial';
		
		// Bounds
		this.bounds = [0, 0, Infinity, Infinity];
	};
	pc.Label.prototype = {
		renderArea: function( ctx, x, y, width, height ) {
		
			ctx.setAlpha(this.alpha);
			
			ctx.font = this.size + 'px ' + this.font;
			ctx.fillStyle = this.color;
			
			// Tighten bounds on text size by measuring it.
			// Can only be done with ctx provided so done during render.
			if (this.bounds[2] == Infinity) {
				var dim = ctx.measureText(this.text);
				this.bounds[2] = dim.width;
				this.bounds[3] = this.lineHeight * this.lines.length + 2;
			}
		
			for (var i in this.lines) {
				ctx.fillText(
					this.lines[i],
					this.x,
					this.y + i * this.lineHeight
				);
			}
		},
		invalidateArea: function( x, y, width, height ) {
			if (this.parent) this.parent.invalidateArea(x + this.x, y + this.y, width, height);
		}
	};
})();
