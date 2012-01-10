(function() {

	pc.math = {};

	// Intersecting rectangle of two identical but translated/scaled rectangles [x, y, width, height]
	pc.math.intersectRects = function( rect1, rect2 ) {
		
		var tx = Math.max(rect1[0], rect2[0]);
		var ty = Math.max(rect1[1], rect2[1]);
		
		var cross = [tx, ty, Math.min(rect1[0] + rect1[2], rect2[0] + rect2[2]) - tx, Math.min(rect1[1] + rect1[3], rect2[1] + rect2[3]) - ty];
		
		if (cross[2] <= 0 || cross[3] <= 0) return false;
		
		return cross;
	};
})();
