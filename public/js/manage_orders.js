jQuery(document).ready(function () {
    let $selectAll = jQuery('#select-all');

    $selectAll.click(function () {
        jQuery(".order-checkbox").prop('checked', $selectAll.prop('checked'));
    });
});
