$(document).ready(function(){
    $(".btn-color").hover(
      function() {
        $(this).css({
          "background-color": "rgb(0, 184, 250)",
          "transform": "scale(1)",
          "box-shadow": "0 4px 10px rgba(0, 0, 0, 0.3)"
        });
      },
      function() {
        $(this).css({
          "background-color": "rgb(245, 135, 120)",
          "transform": "scale(1)",
          "box-shadow": "none"
        });
      }
    );
  });