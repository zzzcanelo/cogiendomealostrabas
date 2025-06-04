
$(function () {
    setCountDown();
});
/*
function postPayment(params) {
    window.localStorage.setItem(KEYS.PaymentsUrl, apiBaseUrl + '/payments');
    window.localStorage.setItem(KEYS.PaymentsParams, JSON.stringify(params));

    $.ajax({
        url: apiBaseUrl + '/payments',
        method: "POST",
        data: params,
        crossDomain: true,
        cache: false,
        beforeSend: function (xhr) {
            xhr.setRequestHeader("Authorization", "Bearer " + paymentToken);
        }
    })
        .done(function (response) {

            window.localStorage.setItem(KEYS.PaymentsResponse, JSON.stringify(response));

            if (response.providerId == Provider.MERCADO_PAGO &&
                (response.responseMessage == "in_process"
                    || response.responseMessage == "pending_contingency"
                    || response.responseMessage == "pending_review_manual")) {
                window.location = inProcessPaymentUrl;
                return;
            }

            if (response.providerId == Provider.MERCADO_PAGO && response.responseMessage != "accredited"){
                window.location = rejectedPaymentUrl;
                return;
            }

            window.location = approvedPaymentUrl;
        })
        .fail(function (jqXHR, textStatus, error) {

            window.localStorage.setItem(KEYS.PaymentsResponse, error);
            window.location = rejectedPaymentUrl;
        });
}
 */

function setCountDown() {
    const limit = moment().add(5, 'minutes');
    const intervalId = window.setInterval(updateTimer, 1000);

    function updateTimer() {
        const now = moment();
        if (limit._d > now._d) {
            var minutes = countdown(limit._d).minutes;
            var seconds = countdown(limit._d).seconds;
            minutes = minutes < 10 ? '0' + minutes : minutes.toString();
            seconds = seconds < 10 ? '0' + seconds : seconds.toString();
            var message = minutes + ':' + seconds;

            $('#timer').text(message);
        }
        else {
            $('#timer').text('00:00');
            window.clearInterval(intervalId);
        }
    }
};
