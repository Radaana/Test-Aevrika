$(document).ready(function() {
    const questions = $('.questions__button');
    const answers = questions.next();
    const close = $('.questions__hide');

    questions.on('click touchstart', function(e) {
        // console.log(e);
        e.preventDefault();
        let $this = $(this);
        let thisAnswer = $this.next();

        if(!thisAnswer.hasClass('js-shown')) {
            questions.stop(true,true).slideDown();
            $this.stop(true,true).slideUp();
            answers.stop(true,true).slideUp();
            answers.removeClass('js-shown');
            thisAnswer.stop(true,true).slideDown();
            thisAnswer.addClass('js-shown');
        };
    }); //click END

    close.on('click touchstart', function(e) {
        // console.log(e);
        e.preventDefault();
        let $this = $(this);
        let thisAnswer = $this.closest('.questions__answer');
        let thisQuestion = thisAnswer.prev();

        if( thisAnswer.hasClass('js-shown')) {

            thisAnswer.stop(true,true).slideUp();
            thisAnswer.removeClass('js-shown');
            thisQuestion.stop(true,true).slideDown();
        };
    }); //click END
}); //ready END