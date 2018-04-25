$(document).ready(function() {

    ymaps.ready(init);
    var myMap, marker;

    function init(){     
        myMap = new ymaps.Map ("map", {
            center: [55.715693, 37.683196],
            zoom: 16,
            controls: []
        });

        var marker = new ymaps.Placemark([55.715693, 37.683196], {
            // hintContent: 'Пол',
            // balloonContentHeader: 'Ресторан на Попова',
            // balloonContentBody: 'Мы всегда рады угостить Вас вкусными бургерами!',
            // balloonContentFooter: 'Заходите в гости!',
        }, {
            iconLayout: 'default#image',
            iconImageHref: 'img/pin.png',
            iconImageSize: [46, 57],
            iconImageOffset: [-23, -57],
        }); // burger 1


        myMap.geoObjects.add(marker);
        // burger1.balloon.open();


        myMap.behaviors.disable('scrollZoom'); 
    }



}); //ready END