$(document).ready(function () {
    // cached jQuery objects
    let $cartContainer = $('.cart-container');
    let $cartBody = $cartContainer.find('.body');
    let $cartList = $cartBody.find('ul').eq(0);
    let $totalPrice = $cartContainer.find('.checkout').find('span');
    let $cartTrigger = $cartContainer.children('.cart-trigger');
    let cartCount = $cartTrigger.children('.count');
    let $undoButton = $cartContainer.find('.undo');
    let undoTimeoutId;

    // TODO: ajax get items in shopping cart. If there are any, put them inside the cart

    if ($cartContainer.length > 0) {

        let $addToCartButton = $('.add-to-cart-trigger');

        // add album to cart
        $addToCartButton.on('click', function (event) {
            event.preventDefault();
            addToCart($(this));
        });

        // toggle cart open/close
        $cartTrigger.on('click', function (event) {
            event.preventDefault();
            toggleCart();
        });

        // close cart when clicking on the .cart-container::before (bg layer)
        $cartContainer.on('click', function (event) {
            if ($(event.target).is($(this))) {
                toggleCart(true);
            }
        });

        //delete an item from the cart
        $cartList.on('click', '.delete-item', function (event) {
            event.preventDefault();
            removeAlbum($(event.target).parents('.album'));
        });

        //update item quantity
        $cartList.on('change', 'select', function (event) {
            updateTotalNumAndPrice();
        });

        //reinsert item deleted from the cart
        $undoButton.on('click', 'a', function (event) {
            clearInterval(undoTimeoutId);
            event.preventDefault();

            // for some weird webkit css attributes stuff
            $cartList.find('.deleted').addClass('undo-deleted').one('webkitAnimationEnd oanimationend msAnimationEnd animationend', function () {
                $(this).off('webkitAnimationEnd oanimationend msAnimationEnd animationend').removeClass('deleted undo-deleted').removeAttr('style');
                updateTotalNumAndPrice();
            });

            $undoButton.removeClass('visible');
        });
    }

    /**
     * Toggle the cart
     *
     * @param isOpen
     */
    function toggleCart(isOpen) {
        let isCartOpen = typeof isOpen === 'undefined' ? $cartContainer.hasClass('cart-open') : isOpen;

        if (isCartOpen) {
            $cartContainer.removeClass('cart-open');
            //reset undo
            clearInterval(undoTimeoutId);
            $undoButton.removeClass('visible');
            $cartList.find('.deleted').remove();

            setTimeout(function () {
                $cartBody.scrollTop(0);
                //check if cart is empty to hide it
                if (Number(cartCount.find('li').eq(0).text()) === 0) {
                    $cartContainer.addClass('empty');
                }
            }, 500);
        } else {
            $cartContainer.addClass('cart-open');
        }
    }

    /**
     * Add an album to cart
     *
     * @param trigger
     */
    function addToCart(trigger) {
        let isCartEmpty = $cartContainer.hasClass('empty');

        //update cart album list
        addAlbumLi(trigger.data('id'), trigger.data('title'), trigger.data('price'));

        //update number of items
        updateTotalNumItems(isCartEmpty);

        //update total price
        updateTotalPrice(trigger.data('price'), true);

        //show cart
        $cartContainer.removeClass('empty');
    }

    /**
     * Add an album as a <li> item
     *
     * @param albumId
     */
    function addAlbumLi(albumId, albumTitle, albumPrice) {
        /*
         TODO: get the correct album id
         this is just a album placeholder you should insert an item with the selected album info
         replace albumId, albumName, price and url with your real album info
         */

        let albumAdded = $(
            `<li class="album">
                <div class="album-image">
                    <a href="/item/${albumId}"><img src="/image/albums/small/${albumId}" width="80px" alt="album image"></a>
                </div>
                <div class="album-details">
                    <div class="album-details-title"><a href="/item/${albumId}">${albumTitle}</a></div>
                    <div class="album-actions">
                        <span class="delete-item">
                            <a href="#0">Delete</a>
                        </span>
                        <span class="quantity">
                            <label for="album-${albumId}">Qty</label>
                            <span class="select">
                                <select id="album-${albumId}" name="quantity">
                                        <option value="1">1</option>
                                        <option value="2">2</option>
                                        <option value="3">3</option>
                                        <option value="4">4</option>
                                        <option value="5">5</option>
                                        <option value="6">6</option>
                                        <option value="7">7</option>
                                        <option value="8">8</option>
                                        <option value="9">9</option>
                                </select>
                            </span>
                        </span>
                        <span class="price">$${albumPrice}</span>
                    </div>
                </div>
            </li>`);

        $cartList.prepend(albumAdded);
    }

    /**
     * Remove album from cart
     *
     * @param album
     */
    function removeAlbum(album) {
        clearInterval(undoTimeoutId);
        $cartList.find('.deleted').remove();

        let topPosition = album.offset().top - $cartBody.children('ul').offset().top;
        let albumQuantity = Number(album.find('.quantity').find('select').val());
        let albumTotalPrice = Number(album.find('.price').text().replace('$', '')) * albumQuantity;

        album.css('top', topPosition + 'px').addClass('deleted');

        //update items count + total price
        updateTotalPrice(albumTotalPrice, false);
        updateTotalNumItems(true, -albumQuantity);
        $undoButton.addClass('visible');

        //wait 10 seconds before completely remove the item
        undoTimeoutId = setTimeout(function () {
            $undoButton.removeClass('visible');
            $cartList.find('.deleted').remove();
        }, 10000);
    }

    /**
     * Update the total number of items. This function is triggered when user delete items or change the quantity from cart.
     */
    function updateTotalNumAndPrice() {
        let total = 0;
        let price = 0;

        $cartList.children('li:not(.deleted)').each(function () {
            let quantity = Number($(this).find('select').val());
            total = total + quantity;
            price = price + quantity * Number($(this).find('.price').text().replace('$', ''));
        });

        $totalPrice.text(price.toFixed(2));
        cartCount.find('li').eq(0).text(total);
        cartCount.find('li').eq(1).text(total + 1);
    }

    /**
     * Update total number of items after the user added an item.
     *
     * @param isCartEmpty
     * @param quantity
     */
    function updateTotalNumItems(isCartEmpty, quantity) {
        if (typeof quantity === 'undefined') {
            let actual = Number(cartCount.find('li').eq(0).text()) + 1;
            let next = actual + 1;

            if (isCartEmpty) {
                cartCount.find('li').eq(0).text(actual);
                cartCount.find('li').eq(1).text(next);
            } else {
                cartCount.addClass('update-count');

                setTimeout(function () {
                    cartCount.find('li').eq(0).text(actual);
                }, 150);

                setTimeout(function () {
                    cartCount.removeClass('update-count');
                }, 200);

                setTimeout(function () {
                    cartCount.find('li').eq(1).text(next);
                }, 230);
            }
        } else {
            let actual = Number(cartCount.find('li').eq(0).text()) + quantity;
            let next = actual + 1;

            cartCount.find('li').eq(0).text(actual);
            cartCount.find('li').eq(1).text(next);
        }
    }

    /**
     * Update the total price after the user added an item.
     *
     * @param price
     * @param isAddition
     */
    function updateTotalPrice(price, isAddition) {
        let currentPrice = Number($totalPrice.text());
        let delta = Number(price);

        if (isAddition) {
            $totalPrice.text((currentPrice + delta).toFixed(2));
        } else {
            $totalPrice.text((currentPrice - delta).toFixed(2));
        }
    }
});
