(function() {
	// Container
	pc.Container = function( id ) {
		// Properties
		this.id = id;
		// Nodes
		this.nodes = [];
		// Bounds
		this.bounds = [0, 0, 0, 0];
		// Position relative to container
		this.x = 0;
		this.y = 0;
		this.order = 0;
		
		this.canvases = {};
		
		/* TODO
		this.scaleX = 1;
		this.scaleY = 1;
		this.rotate = 0;
		*/
		// Container parent
		this.parent = null;
	};
	pc.Container.prototype = {
		addNode: function( node, order ) {
			
			node.order = order || 0;
			
			var done = false;
			
			for (var i in this.nodes) {
				if (this.nodes[i].order < order) {
					this.nodes.splice(i, 0, node);
					done = true;
					break;
				}
			}
			
			if (!done) this.nodes.push(node);
			
			// Enlarge bounds
			this.bounds[0] = Math.min(this.bounds[0], this.x + node.bounds[0]);
			this.bounds[1] = Math.min(this.bounds[1], this.y + node.bounds[1]);
			this.bounds[2] = Math.max(this.bounds[2], this.x + node.bounds[2]);
			this.bounds[3] = Math.max(this.bounds[3], this.y + node.bounds[3]);
			
			// Update node
			if (node.parent) parent.removeChild(node);
			node.parent = this;	
		},
		removeNode: function( node ) {
		
			for (var i = 0; i < this.nodes.length; i++) {
				if (node.id == this.nodes[i].id) {
					this.nodes.splice(i, 1);
					break;
				}
			}
			
			// Check if the removing node is on the edge of the container's bounds
			if (
				   this.bounds[0] == node.bounds[0] + this.x
				|| this.bounds[1] == node.bounds[1] + this.y
				|| this.bounds[2] == node.bounds[2] + this.x
				|| this.bounds[3] == node.bounds[3] + this.y
			)
			this.updateBounds();
			
			// Update node
			node.parent = null;
		},
		setNodeOrder: function( node, order ) {
			
			this.removeNode(node);
			this.addNode(node, order);
		},
		
		invalidateArea: function( x, y, width, height ) {
			
			if (this.parent) this.parent.invalidateArea(x + this.x, y + this.y, width, height);
						
			for (var i in this.canvases)
				this.canvases[i].invalidateArea(x + this.x, y + this.y, width, height);
		},
		
		renderArea: function( ctx, x, y, width, height ) {

			// Translate
			ctx.save();
			ctx.translate(this.x, this.y);

			for (var i in this.nodes) {
			
				var node = this.nodes[i];
				
				// Get intersecting rectangle
				var rect = pc.math.intersectRects(
					[x, y, width, height],
					[
						node.x + node.bounds[0],
						node.y + node.bounds[1],
						node.bounds[2] - node.bounds[0],
						node.bounds[3] - node.bounds[1]
					]
				);				
				if (!rect) continue;
				
				node.renderArea(
					ctx,
					rect[0],
					rect[1],
					rect[2],
					rect[3]
				);
			}
			
			ctx.restore();
		},
		
		// Calculate bounds
		updateBounds: function() {
			
			this.bounds = [Infinity, Infinity, -Infinity, -Infinity];
			
			var some = false;
			
			for (var i in this.nodes) {
				some = true;
				var node = this.nodes[i];
				this.bounds[0] = Math.min(this.bounds[0], this.x + node.bounds[0]);
				this.bounds[1] = Math.min(this.bounds[1], this.y + node.bounds[1]);
				this.bounds[2] = Math.max(this.bounds[2], this.x + node.bounds[2]);
				this.bounds[3] = Math.max(this.bounds[3], this.y + node.bounds[3]);				
			}
			
			if (!some)
				this.bounds = [0, 0, 0, 0];
		}
	};
})();
