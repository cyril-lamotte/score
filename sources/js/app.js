(function($) {

"use strict";

app.init = function() {

  app.checkCompatibility();

  // For dev.
  app.deleteDb();

  // Prod.
  //app.createDB();

};

app.init();


// Execute code when the DOM is fully loaded.
$(function() {

  // Get players & totals.
  $('#get-data').on('click', function (event) {
    app.getPlayersList();
  });

}); // /ready


})(jQuery);
