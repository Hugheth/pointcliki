(function() {
	// Sprite
	pc.Sprite = function( id, texture, width, height, u, v ) {
		// Properties
		this.id = id;
		// Position relative to container
		this.x = 0;
		this.y = 0;
		this.order = 0;
		
		this.scaleX = 1;
		this.scaleY = 1;
		
		this.rotate = 0;
		
		// Dimensions
		this.width = width || texture.width;
		this.height = height || texture.height;
		// Container rendering
		this.parent = null;
		
		this.alpha = 1;
		
		// Texture
		this.texture = texture || null;
		this.u = u || 0;
		this.v = v || 0;
		
		// Bounds
		this.bounds = [0, 0, this.width, this.height];
	};
	pc.Sprite.prototype = {
		renderArea: function( ctx, x, y, width, height ) {
		
			var rect = pc.math.intersectRects([x, y, width, height], [this.x, this.y, this.width, this.height]);
			
			if (!rect) return;
			
			if (!this.texture) {
				console.error('Can\'t render sprite [' + this.id + '] as it has no texture');
				return;
			}
			
			ctx.globalAlpha = this.alpha;
			
			ctx.save();
			ctx.translate(rect[0], rect[1]);
			ctx.scale(this.scaleX, this.scaleY);
			ctx.rotate(this.angle);
		
			ctx.drawImage(
				this.texture,
				this.u + rect[0] - this.x,
				this.v + rect[1] - this.y,
				rect[2],
				rect[3],
				0,
				0,
				rect[2],
				rect[3]
			);
			
			ctx.restore();
		},
		invalidateArea: function( x, y, width, height ) {
			if (this.parent) this.parent.invalidateArea(x + this.x, y + this.y, width, height);
		}
	};
})();
