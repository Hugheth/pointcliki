(function() {

	pc.util.tmx2viewport = function( game, width, height, tmxMap, factory ) {
	
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
		
		for (var i in tmxMap.groups) {
		
			var group = tmxMap.groups[i];
		
			var active = new pc.Canvas(tmxMap.id + '.' + group.name, width, height);
			var scene = pc.game.scene = new pc.Container(tmxMap.id + '.' + group.name + ".scene");
			active.setContainer(scene);
			
			view.addCanvas(active, 0, 0, n);
			game.addCanvas(active);
			
			// Iterate through objects
			for (var j in group.objects) {
			
				var object = group.objects[j];
				
				// Remove faulty offset problem
				object.y -= 64;
				
				if (factory[object.gid])
					factory[object.gid].apply(scene, [object]);
			}
			
			n++;
		}
		
		return view;
	};
})();
