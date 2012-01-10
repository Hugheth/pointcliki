(function() {

	pc.MapCanvas = function( name, width, height, tileWidth, tileHeight, rows, cols ) {
	
		// Super
		pc.TileCanvas.apply(this, [name, width, height, tileWidth, tileHeight, rows, cols]);
		
		this.map = null;
	}
	pc.TileCanvas.prototype = {
		setTile: function( x, y, object ) {
		
		}
		
	};
	
	$.extend(pc.TileCanvas.prototype, pc.Canvas.prototype);
})();
