(function() {

  /*
    An arbiter records the game state in a number
    of reversible steps that allows the game to be
    serialized and altered in retrospect which is
    useful for network gaming. An operation must be
    defined with its inverse, upon which point it
    be committed to the arbiter to perform at any
    point. The arbiter can be rolled back to an
    earlier state, where upon all future operations
    are forgotten except input operations, which
    cannot be added to the arbiter by any other
    operations. After rolling back, other input
    operations may be added and these are then
    performed by the arbiter at the correct time
    during re-simulation to the present.
  */
  pc.Arbiter = function( id, clock ) {
  
    this.id = id;
  
    this.tick = function( c ) {
//      console.log(c);
      
      
      return true;
    }
  }

})();
