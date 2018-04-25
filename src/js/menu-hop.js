$(document).ready(function() {
    const buttons = $('.menu__button');
    const menuHop = $('.menu__hop');
    let flag = false;

    buttons.on('click touchstart', e =>{
        e.preventDefault();

        if (!menuHop.hasClass('js-shown') && !flag) {
            flag = true;
            menuHop.addClass('js-shown');
            menuHop.stop(true,true).slideDown(400, function() {
                flag = false;
            });
        }; 
        if (menuHop.hasClass('js-shown') && !flag) {
            flag = true;
            menuHop.removeClass('js-shown');
            menuHop.stop(true,true).slideUp(400, function() {
                flag = false;
            });
        };
    }); //click END
}); //ready END