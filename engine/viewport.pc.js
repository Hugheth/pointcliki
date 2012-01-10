(function() {

	// Canvas layers
	pc.Viewport = function( id, width, height ) {
	
		this.id = id;
		
		this.x = 0;
		this.y = 0;
		
		this.width = width || 0;
		this.height = height || 0;
	
		this.dom = $('<div id="' + id + '" class="viewport"></div>');
		
		this.event = this.dom;

		var t = this;
		this.dom.click(function( e ) {
			t.event.trigger('tap', { x: e.offsetX, y: e.offsetY });
		});
		
		this.canvases = {};
		
		this.dom.css({
			width: this.width,
			height: this.height
		});
	};
	pc.Viewport.prototype = {
	
		addCanvas: function( canvas, x, y, order, driftX, driftY ) {
		
			this.removeCanvas(canvas);
		
			canvas.viewport = this;
			canvas.viewX = x || 0;
			canvas.viewY = y || 0;
			canvas.driftX = driftX || 0;
			canvas.driftY = driftY || 0;
			
			canvas.dom.css({
				position: 'absolute',
				left: canvas.viewX,
				top: canvas.viewY,
				zIndex: order
			});
			
			this.canvases[canvas.id] = canvas;
			
			if (order)
				this.dom.children().eq(order - 1).after(canvas.dom);
			else
				this.dom.prepend(canvas.dom);
		},
		removeCanvas: function( canvas ) {
			
			this.dom.children('#' + canvas.id).remove();
			
			canvas.viewport = null;
			
			delete this.canvases[canvas.id];
		},
		invalidate: function() {
		
			for (var i in this.canvases) {
				var c = this.canvases[i];
				c.x = this.x;
				c.y = this.y;
				c.valid = false;
			}
		}
	};
})();
