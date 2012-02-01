(function() {

	pc.TileCanvas = function( name, width, height, tileWidth, tileHeight, cols, rows, texture ) {
		
		// Buffer to allow translation without blurring
		this.buffer = [
			$('<canvas width="0" height="0"></canvas>'),
			$('<canvas width="0" height="0"></canvas>'),
			$('<canvas width="0" height="0"></canvas>'),
			$('<canvas width="0" height="0"></canvas>')
		];
		this.bctx = [
			this.buffer[0][0].getContext('2d'),
			this.buffer[1][0].getContext('2d'),
			this.buffer[2][0].getContext('2d'),
			this.buffer[3][0].getContext('2d')
		];
		this.fresh = [false, false, false, false];
		this.bufferWidth = 0;
		this.bufferHeight = 0;
		
		// Location of top-left quad
		this.u = Infinity;
		this.v = Infinity;
		
		this.tileWidth = parseInt(tileWidth);
		this.tileHeight = parseInt(tileHeight);
		this.rows = rows || 0;
		this.cols = cols || 0;
		
		// Super
		pc.Canvas.apply(this, [name, width, height]);
		
		// Texture
		this.texture = texture || null;
		
		this.tiles = [];
		this.container = null;
		
		var area = this.rows * this.cols;
		
		for (var i = 0; i < area; i++)
			this.tiles[i] = null;
			
		this.recentChanges = [];
		
		var t = this;		
		// Render the contents of the tiles
		this.render = function( clock ) {
				
			if (clock && clock != t.clock) return;
			if (t.valid) return true;
						
			if (-t.x < t.u) t.updateBuffer();
			else if (-t.y < t.v) t.updateBuffer();
			else if (-t.x > t.u + t.bufferWidth) t.updateBuffer();
			else if (-t.y > t.v + t.bufferHeight) t.updateBuffer();
			
			while (t.recentChanges.length) {
			
				var xy = t.recentChanges.shift();
							
				var texW = t.texture.width / t.tileWidth;
				var texH = t.texture.height / t.tileHeight;
				
				// Calculate the current tile
				var n = xy[0] + xy[1] * this.cols;
				
				var tile = t.tiles[n];
				
				t.bctx[0].clearRect(xy[0] * t.tileWidth - t.u, xy[1] * t.tileHeight - t.v, tileWidth, tileHeight);
				t.bctx[1].clearRect(xy[0] * t.tileWidth - t.u - t.bufferWidth, xy[1] * t.tileHeight - t.v, tileWidth, tileHeight);
				t.bctx[2].clearRect(xy[0] * t.tileWidth - t.u, xy[1] * t.tileHeight - t.v - t.bufferHeight, tileWidth, tileHeight);
				t.bctx[3].clearRect(xy[0] * t.tileWidth - t.u - t.bufferWidth, xy[1] * t.tileHeight - t.v - t.bufferHeight, tileWidth, tileHeight);
				
				if (isNaN(n)) continue;
			
				t.bctx[0].drawImage(
					t.texture,
					(tile % texW) * this.tileWidth,
					Math.floor(tile / texW) * this.tileHeight,
					t.tileWidth,
					t.tileHeight,
					xy[0] * t.tileWidth - t.u,
					xy[1] * t.tileHeight - t.v,
					t.tileWidth,
					t.tileHeight
				);
				
				t.bctx[1].drawImage(
					t.texture,
					(tile % texW) * this.tileWidth,
					Math.floor(tile / texW) * this.tileHeight,
					t.tileWidth,
					t.tileHeight,
					xy[0] * t.tileWidth - t.u - t.bufferWidth,
					xy[1] * t.tileHeight - t.v,
					t.tileWidth,
					t.tileHeight
				);
				
				t.bctx[2].drawImage(
					t.texture,
					(tile % texW) * this.tileWidth,
					Math.floor(tile / texW) * this.tileHeight,
					t.tileWidth,
					t.tileHeight,
					xy[0] * t.tileWidth - t.u,
					xy[1] * t.tileHeight - t.v - t.bufferHeight,
					t.tileWidth,
					t.tileHeight
				);
				
				t.bctx[3].drawImage(
					t.texture,
					(tile % texW) * this.tileWidth,
					Math.floor(tile / texW) * this.tileHeight,
					t.tileWidth,
					t.tileHeight,
					xy[0] * t.tileWidth - t.u - t.bufferWidth,
					xy[1] * t.tileHeight - t.v - t.bufferHeight,
					t.tileWidth,
					t.tileHeight
				);
			}
		
			t.recentChanges = [];
			
			t.ctx.clearRect(0, 0, t.width, t.height);
						
			t.ctx.drawImage(t.buffer[0][0], t.x + t.u, t.y + t.v);
			t.ctx.drawImage(t.buffer[1][0], t.x + t.u + t.bufferWidth, t.y + t.v);
			t.ctx.drawImage(t.buffer[2][0], t.x + t.u, t.y + t.v + t.bufferHeight);
			t.ctx.drawImage(t.buffer[3][0], t.x + t.u + t.bufferWidth, t.y + t.v + t.bufferHeight);
			
			t.valid = true;
			
			return true;
		};
	}
	pc.TileCanvas.prototype = {
	
		invalidateTile: function( x, y ) {
		
			this.valid = false;
			
			this.recentChanges.push([x, y]);
			
			if (!this.clock) this.render();
		},
		// Invalidate part of the rendered area
		invalidateArea: function( x, y, width, height ) {
				
			this.valid = false;
			
			// Get the tiles in the invalid area
			var cols = Math.ceil(width / this.tileWidth);
			var rows = Math.ceil(height / this.tileHeight);
			
			var tx = Math.floor((x - this.x) / this.tileWidth);
			var ty = Math.floor((y - this.y) / this.tileHeight);
			
			for (var i = Math.max(0, tx); i < Math.min(tx + cols, this.cols - 1); i++)
				for (var j = Math.max(0, ty); j < Math.min(ty + rows, this.rows - 1); j++)
					this.recentChanges.push([i, j]);
	
			if (!this.clock) this.render();
		},
		updateBuffer: function() {
		
			var texW = this.texture.width / this.tileWidth;
			var texH = this.texture.height / this.tileHeight;
		
			var oldu = this.u;
			var oldv = this.v;
		
			this.u = -(this.x + (this.x > 0 ? this.bufferWidth: 0) - this.x % this.bufferWidth);
			this.v = -(this.y + (this.y > 0 ? this.bufferHeight: 0) - this.y % this.bufferHeight);

			if (oldu == this.u && oldv == this.v) return;
			
			var su = 0, sv = 0;
			var nu = 2, nv = 2;
			
			// Check if small change, in which case we can re-use graphics
			 if (oldu + this.bufferWidth == this.u && oldv == this.v) {
			 
				 if (this.fresh[1] && this.fresh[3]) {
					 
					this.bctx[0].clearRect(0, 0, this.bufferWidth, this.bufferHeight);
					this.bctx[2].clearRect(0, 0, this.bufferWidth, this.bufferHeight);
				
					this.bctx[0].drawImage(this.buffer[1][0], 0, 0);
					this.bctx[2].drawImage(this.buffer[3][0], 0, 0);
					su = 1;
				
					this.fresh[0] = false;
					this.fresh[2] = false;
				}
				
			} else if (oldu - this.bufferWidth == this.u && oldv == this.v) {
			
				if (this.fresh[0] && this.fresh[2]) {
				
					this.bctx[1].clearRect(0, 0, this.bufferWidth, this.bufferHeight);
					this.bctx[3].clearRect(0, 0, this.bufferWidth, this.bufferHeight);
				
					this.bctx[1].drawImage(this.buffer[0][0], 0, 0);
					this.bctx[3].drawImage(this.buffer[2][0], 0, 0);
					nu = 1;
				}
				
				this.fresh[1] = false;
				this.fresh[3] = false;
				
			} else if (oldv + this.bufferHeight == this.v && oldu == this.u) {
			
				if (this.fresh[0] && this.fresh[1]) {
				
					this.bctx[2].clearRect(0, 0, this.bufferWidth, this.bufferHeight);
					this.bctx[3].clearRect(0, 0, this.bufferWidth, this.bufferHeight);
				
					this.bctx[2].drawImage(this.buffer[0][0], 0, 0);
					this.bctx[3].drawImage(this.buffer[1][0], 0, 0);
					nv = 1;
				}
				
				this.fresh[2] = false;
				this.fresh[3] = false;
				
			} else if (oldv - this.bufferHeight == this.v && oldu == this.u) {
			
				if (this.fresh[2] && this.fresh[3]) {
					
					this.bctx[0].clearRect(0, 0, this.bufferWidth, this.bufferHeight);
					this.bctx[1].clearRect(0, 0, this.bufferWidth, this.bufferHeight);
				
					this.bctx[0].drawImage(this.buffer[2][0], 0, 0);
					this.bctx[1].drawImage(this.buffer[3][0], 0, 0);
					sv = 1;
				}
				
				this.fresh[0] = false;
				this.fresh[1] = false;
			}
			
			// Update buffer
			var xi = su, yi = sv;
						
			for (var v = sv * this.bufferHeight; v < this.bufferHeight * nv; v += this.bufferHeight) {				
				for (var u = su * this.bufferWidth; u < this.bufferWidth * nu; u += this.bufferWidth) {
				
					var i = xi + yi * 2;
					
					this.fresh[i] = true;
					
					this.bctx[i].clearRect(0, 0, this.bufferWidth, this.bufferHeight);	
					
					this.bctx[i].save();
					this.bctx[i].translate(- this.u - u, - this.v - v);
								
					for (var y = 0; y < this.bufferHeight; y+= this.tileHeight) {
						for (var x = 0; x < this.bufferWidth; x += this.tileWidth) {						
						
							var tx = this.u + u + x;
							var ty = this.v + v + y;
							
							if (tx < 0 || ty < 0) continue;					
							if (tx >= this.cols * this.tileWidth || ty >= this.rows * this.tileHeight) continue;
							
							// Calculate the current tile
							var n = tx / this.tileWidth;
							n += ty / this.tileHeight * this.cols;
													
							// Render tile
							var tile = parseInt(this.tiles[n]);
							
							if (isNaN(tile)) continue;
							
							this.bctx[i].drawImage(
								this.texture,
								(tile % texW) * this.tileWidth,
								Math.floor(tile / texW) * this.tileHeight,
								this.tileWidth,
								this.tileHeight,
								tx,
								ty,
								this.tileWidth,
								this.tileHeight
							);
						}
					}
					this.bctx[i].restore();
					xi++;
				}
				xi = su;
				yi++;
			}
		},
		setSize: function( x, y ) {
		
			if (x !== false) {
			
				this.width = x;
				this.bufferWidth = x - x % this.tileWidth + this.tileWidth;
				
				for (var i in this.buffer)
					this.buffer[i].attr('width', this.bufferWidth);
					
				this.dom.attr('width', x);
			}
			if (y !== false) {
			
				this.height = y;
				this.bufferHeight = y - y % this.tileHeight + this.tileHeight;
				
				for (var i in this.buffer)
					this.buffer[i].attr('height', this.bufferHeight);
					
				this.dom.attr('height', y);
			}
		},
		destroy: function() {
			// Super
			pc.Canvas.prototype.destroy.apply(this, []);
			
			this.buffer = null;
			this.bctx = null;
			this.texture = null;
		}
	};
	pc.TileCanvas.prototype = $.extend({}, pc.Canvas.prototype, pc.TileCanvas.prototype);
})();
