(function() {

	pc.util.tmx2viewport = function( game, width, height, tmxMap ) {
	
		var view = new pc.Viewport(tmxMap.id + '.view', width, height);
		
		var n = 0;
		
		for (var i in tmxMap.layers) {
		
			var layer = tmxMap.layers[i];
			var tileset = tmxMap.tilesets[i];
			
			// Create backdrop
			var tex = game.assets[tileset.file];
		
			if (tex) {
			
				var tiles = new pc.TileCanvas(tmxMap.id + '.' + layer.name, width, height, tileset.tileWidth, tileset.tileHeight, layer.width, layer.height, tex);
			
				view.addCanvas(tiles, 0, 0, n);
				game.addCanvas(tiles);
								
				tiles.tiles = layer.data;
				tiles.valid = false;
				
			} else {
				console.warn('Cannot load the texture file [' + tileset.file + '] for the tile canvas [' + tiles.id + ']');
			}
						
			n++;
		}
		return view;
	};
})();
