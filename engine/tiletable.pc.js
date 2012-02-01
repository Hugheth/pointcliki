(function() {
	// Simple data structure to store objects on a grid
	pc.TileTable = function( name ) {
		this.objects = {};
		this.types = {};
		this.tiles = {};
	};
	pc.TileTable.prototype = {
	
		addObject: function( obj ) {
			this.objects[obj.id] = [obj.tileX, obj.tileY];
			if (!this.tiles[obj.tileX + ' ' + obj.tileY])
				this.tiles[obj.tileX + ' ' + obj.tileY] = [obj];
			else
				this.tiles[obj.tileX + ' ' + obj.tileY].push(obj);
			
			if (this.types[obj.type])
				this.types[obj.type].push(obj);
			else
				this.types[obj.type] = [obj];
		},	
		updateObject: function( obj ) {
			this.removeObject(obj);
			this.addObject(obj);
		},
		removeObject: function( obj ) {
			var info = this.objects[obj.id];
			
			var tile = this.tiles[info[0] + ' ' + info[1]];
			var i = 0;
			
			if (tile) {
				while (i < tile.length) {
					if (tile[i].id == obj.id)
						tile.splice(0, 1);
					else
						i++;
				}
			}
			
			for (var i in this.types) {
				if (this.types[i].id = obj.id) {
					this.types[i].splice(i, 1);
					break;
				}
			}
			
			delete this.objects[obj.id];
		},
		objectsOf: function( type ) {
			return this.types[type] || [];
		},
		objectsAt: function( x, y, type ) {
			if (!type)
				return this.tiles[x + ' ' + y];
			
			var objs = this.tiles[x + ' ' + y];
			var arr = [];
			
			for (var i in objs)
				if (objs[i].type == type) arr.push(objs[i]);
			
			return arr;
		}
	};
})();
