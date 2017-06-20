jQuery(document).ready(function () {
    let $moneyText = jQuery("#money-text");
    let text = "Please sit tight and wait while we are becoming rich ";
    let i = 0;
    let dots = [
        ".",
        ". .",
        ". . ."
    ];

    let timer = setInterval(function () {
        i++;
        $moneyText.text(text + dots[i % 3]);
    }, 800);

    setTimeout(function () {
        clearInterval(timer);
        $moneyText.text("Excellent. We've got your money");
        jQuery("#order-link").show();
    }, 6000);
});
