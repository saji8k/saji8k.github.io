function getTaxRate() {
    var tax = {};
    // Canadian Tax Rates
    // http://www.canadabusiness.ca/eng/page/2651/
    tax['CA-AB'] = 5;
    tax['CA-BC'] = 12;
    tax['CA-MB'] = 13;
    tax['CA-NB'] = 13;
    tax['CA-NL'] = 13;
    tax['CA-NT'] = 5;
    tax['CA-NS'] = 15;
    tax['CA-NU'] = 5;
    tax['CA-ON'] = 13;
    tax['CA-PE'] = 14;
    tax['CA-QC'] = 5;
    tax['CA-SK'] = 10;
    tax['CA-YT'] = 5;
    // EU VAT Rates
    // http://www.vatlive.com/vat-rates/european-vat-rates/eu-vat-rates/
    tax['AT'] = 20;
    tax['BE'] = 21;
    tax['BG'] = 20;
    tax['HR'] = 25;
    tax['CY'] = 19;
    tax['CZ'] = 21;
    tax['DK'] = 25;
    tax['EE'] = 20;
    tax['FI'] = 24;
    tax['FR'] = 20;
    tax['DE'] = 19;
    tax['EL'] = 23;
    tax['HU'] = 27;
    tax['IE'] = 23;
    tax['IT'] = 22;
    tax['LV'] = 21;
    tax['LT'] = 21;
    tax['LU'] = 17;
    tax['MT'] = 18;
    tax['NL'] = 21;
    tax['PL'] = 23;
    tax['PT'] = 23;
    tax['RO'] = 24;
    tax['SK'] = 20;
    tax['SI'] = 22;
    tax['ES'] = 21;
    tax['SE'] = 25;
    tax['GB'] = 20;
    // Japan JCT
    tax['JP'] = 8;

    var country = $('#country').val();
    if (country == 'CA') {
        country = country + "-" + $('#state').val();
    }
    var taxrate = tax[country];
    if(typeof taxrate === 'undefined') taxrate = 0;
    return taxrate;
}

function displayTotal() {
    var currencies = {}
    currencies['USD'] = 0;
    currencies['CAD'] = 1;
    var prices = [1999, 2899];
    var quantity = 1;
    // Buying Gift Codes
    if ($('#item-quantity').val() == 1) {
        quantity = $('#item-quantity').val();
    }
    // Buying Parental Consent
    if ($('#item-pc').val() == 1) {
        prices = [50, 50];
    }

    var currency = 'USD';
    if ($('#country').val() == 'CA') {
        currency = 'CAD';
    }
    var price = prices[currencies[currency]] * quantity;

    var taxrate = getTaxRate();
    var tax = price * taxrate;
    if ($('#country').val() == 'CA' && $("#state").val() == 'XX') {
        tax = 0;
    }
    var total = price * 100 + tax;
    // Convert amounts to dollars
    var dprice = price / 100;
    var dtax = tax / 10000;
    var dtotal = total / 10000;

    if (tax > 0) {
        // Country with tax
        $("#store-skuval").text('$' + dprice.toFixed(2));
        $("#store-taxlabel").text('Tax (' + taxrate + '%)');
        $("#store-taxval").text('$' + dtax.toFixed(2));
        $("#store-totlabel").text('Total');
        $("#store-skurow").show();
        $("#store-taxrow").show();
    } else {
        // Country with no tax
        $("#store-skurow").hide();
        $("#store-taxrow").hide();
        $("#store-totlabel").text($("#store-skulabel").text());
    }
    $("#store-buyval").text(currency + ' $' + dprice.toFixed(2));
    $("#store-totval").text(currency + ' $' + dtotal.toFixed(2));
}

function readCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for(var i=0;i < ca.length;i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1,c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
}

function stripePubKey() {
    Stripe.setPublishableKey('pk_live_drMgCx1outKAhI96oa2Btjqm');
}

function stripeResponseHandler(status, response) {
  var $form = $('#store-form');
  if (response.error) {
    // Show the errors on the form
    $form.find('#store-payetitle').text('Payment Failed');
    $form.find('#store-payemsg').text(response.error.message);
    $form.find('#store-paymsg').html('');
    $form.find('button').prop('disabled', false);
  } else {
    // response contains id and card, which contains additional card details
    var token = response.id;
    // Insert the token into the form so it gets submitted to the server
    $form.append($('<input type="hidden" name="stripeToken" />').val(token));
    $form.find('#store-paymsg').html('<i class="fa fa-spinner fa-spin"></i> Your payment is being processed');
    // and submit
    $form.get(0).submit();
  }
};

function displayPayment() {
    // Show / Hide CC Input Fields
    // If Stripe Credit Card
    if ($("input[name=processor]:checked").val() == 1) {
        $("#store-cardinfo").show();
    }
    // If PayPal
    if ($("input[name=processor]:checked").val() == 2) {
        $("#store-cardinfo").hide();
    }
}

function displayProvince() {
    // Show / Hide Canadian Province Field
    if ($('#country').val() == 'CA') {
        $("#store-state").show();
    } else {
        $("#state").val('XX');
        $("#store-state").hide();
    }
    displayTotal();
}

/*
    /store/noteloop/
*/

if ($("body#store-noteloop").length > 0) {
    // JQuery Payment Form Validation
    $('#cc-num').payment('formatCardNumber');
    $('#cc-exp').payment('formatCardExpiry');
    $('#cc-cvc').payment('formatCardCVC');
    // Set Stripe Pub Key
    stripePubKey();

    // Custom Form Validation
    $('#store-form').validator({
        disable: false,
        custom: {
            state: function($el) {
                if ($('#country').val() == 'CA') {
                    if ($('#state').val() == 'XX')
                        return false;
                }
                return true;
            },
            ccnum: function($el) {
                // If Stripe Credit Card
                if ($("input[name=processor]:checked").val() == 1) {
                    if (!$.payment.validateCardNumber($('#cc-num').val())) {
                        return false;
                    }
                }
                return true;
            },
            ccexp: function($el) {
                // If Stripe Credit Card
                if ($("input[name=processor]:checked").val() == 1) {
                    if (!$.payment.validateCardExpiry($('#cc-exp').payment('cardExpiryVal'))) {
                        return false;
                    }
                }
                return true;
            },
            cccvc: function($el) {
                // If Stripe Credit Card
                if ($("input[name=processor]:checked").val() == 1) {
                    var cardType = $.payment.cardType($('#cc-num').val());
                    if (!$.payment.validateCardCVC($('#cc-cvc').val(), cardType)) {
                        return false;
                    }
                }
                return true;
            },
            giftc: function($el) {
                return true;
            }
        },
        errors: {
            state: "Please Select your Province",
            ccnum: "Invalid Credit Card Number",
            ccexp: "Invalid Expiry Date",
            cccvc: "Invalid Card Code",
            giftc: "Invalid Gift Code"
        }
    })

    $("input[name=processor]:radio").change(function() {
        // Re-Validate CC Input Fields
        $('#cc-num').trigger('input');
        $('#cc-exp').trigger('input');
        $('#cc-cvc').trigger('input');
        // Show / Hide CC Input Fields
        displayPayment();
    });

    if ($("#payment").length > 0) {
        $(document).ready(function() {
            displayPayment();
        });
    }

    $("#country").change(function() {
        // Show / Hide Canadian Province Field
        displayProvince();
    });

    if ($("#country").length > 0) {
        $(document).ready(function() {
            displayProvince();
        });
    }

    $("#state").change(function() {
        if ($("#state").val() != 'XX') {
            // Display Canadian Sales Tax
            displayTotal();
        }
    });

    $("#item-quantity").change(function() {
        displayTotal();
    });

    $('#store-form').validator().on('submit', function (e) {
        if (!e.isDefaultPrevented()) {
            // If Stripe Credit Card
            if ($("input[name=processor]:checked").val() == 1) {
                // Submitted Form is Valid
                var $form = $('#store-form');
                // Disable the submit button to prevent repeated clicks
                $form.find('button').prop('disabled', true);
                $form.find('#store-paymsg').html('<i class="fa fa-spinner fa-spin"></i> Preparing Payment');
                // Create Stripe Token
                try {
                    Stripe.card.createToken({
                    number: $('#cc-num').val(),
                    exp: $('#cc-exp').val(),
                    cvc: $('#cc-cvc').val(),
                    address_state: $('#state').val(),
                    address_country: $('#country').val()
                    }, stripeResponseHandler);
                }
                catch(error) {
                    $form.find('#store-payetitle').text('Payment Failed');
                    $form.find('#store-payemsg').text(error.message);
                    $form.find('button').prop('disabled', false);
                }
                // Prevent the form from submitting with the default action
                return false;
            }
            // If PayPal
            if ($("input[name=processor]:checked").val() == 2) {
                // Submitted Form is Valid
                var $form = $('#store-form');
                // Disable the submit button to prevent repeated clicks
                $form.find('button').prop('disabled', true);
                $form.find('#store-paymsg').html('<i class="fa fa-spinner fa-spin"></i> Your payment is being processed');
                return true;
            }
        }
    });
}