/*-------------------------------------------*\
    Scroll To Top
\*-------------------------------------------*/

$("#ScrollToTop").click(function () {
    $("html, body").animate({ scrollTop: 0 }, 1000);
});
//Animación Botón Subir , aparecer y desaparecer botón según scroll top+200px
$(function () {
    var header = $(".scroll-top");
    $(window).scroll(function () {
        var scroll = $(window).scrollTop();
        if (scroll >= 200) header.removeClass("scroll-top").addClass("go-up");
        else header.removeClass("go-up").addClass("scroll-top");
    });
});