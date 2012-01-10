(function() {

	pc.TMXMap = function( id, data ) {
		
		this.id = id;
		
		var xml = $(data);
		// Get root node - different in some browsers
		xml = xml.filter('map') || xml.find('map') || xml;
		
		this.width = xml.attr('width');
		this.height = xml.attr('height');
		
		this.tilesets = [];
		
		var t = this;
		
		xml.find('tileset').each(function() {
		
			var set = $(this);
			var img = set.children('img');
			
			t.tilesets.push({
			
				file: img.attr('source').substr(3),
				tileWidth: set.attr('tilewidth'),
				tileHeight: set.attr('tileHeight')
			});		
		});
		
		this.layers = [];
		
		xml.find('layer').each(function() {
		
			var layer = $(this);
			var data = layer.children('data').html();
			
			data = pc.TMXMap.decodeData(data, 4);
			
			for (var i in data) {
				if (data[i] == 0) data[i] = NaN;
				else data[i]--;
			}
			
			t.layers.push({
			
				name: layer.attr('name'),
				width: layer.attr('width'),
				height: layer.attr('height'),
				data: data
			});	
		});
	};
	// Code based on code from the cocos2d javascript engine
	// Thanks to Ryan Williams
	pc.TMXMap.decodeData = function( data, bytes ) {
	
		var dec = new JXG.Util.Unzip(JXG.Util.Base64.decodeAsArray(data)).unzip()[0][0], ar = [], i, j, len;
		for (i = 0, len = dec.length/bytes; i < len; i++){
			
			ar[i] = 0;
			for (j = bytes-1; j >= 0; --j)
				ar[i] += dec.charCodeAt((i *bytes) +j) << (j *8);
		}
		return ar;
	};
})();
