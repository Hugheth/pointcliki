(function() {
	// Easing object
	pc.easing = {
	
		linear: function(t, b, c, d) {
			return c*(t/=d)*t + b;
		},
		'ease-in-out': function(t, b, c, d) {
			if (t < d/2) return 2*c*t*t/(d*d) + b;
			var ts = t - d/2;
			return -2*c*ts*ts/(d*d) + 2*c*ts/d + c/2 + b;    
		},
		'ease-in': function(t, b, c, d) {
			return c*(t/=d)*t + b;
		},
		'ease-out': function(t, b, c, d) {
			return -c*t*t/(d*d) + 2*c*t/d + b;
		}
}
})();
