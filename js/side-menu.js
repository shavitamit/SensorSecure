// JS used to toggle the side menu from an open to closed state



// JS Used for sub section links within the side menu
$(function() {        
         $('.category-link').click(function() {
    $(".category-sub-link").toggleClass('show-sub-link');
    
});   // put jQuery code here    
});


// JS used to move side menu up/down when scrolling

$(document).ready(function() {
   $(window).scroll(function() {
       
       var headerH = $('header').outerHeight(true);
       console.log(headerH);
       var scrollTopVal = $(this).scrollTop();
        if ( scrollTopVal > headerH ) {
            $("nav").addClass("scroll-up");
        } else {
            $("nav").removeClass("scroll-up");
        }
 });
 });