$(document).ready(function () {
    let $cartContainer = $('.cart-container');

    // TODO: album id
    let albumId = 0;

    // cached jQuery objects
    let $cartBody = $cartContainer.find('.body');
    let $cartList = $cartBody.find('ul').eq(0);
    let $totalPrice = $cartContainer.find('.checkout').find('span');
    let $cartTrigger = $cartContainer.children('.cart-trigger');
    let cartCount = $cartTrigger.children('.count');
    let $addToCartButton = $('.add-to-cart-button');
    let $undoButton = $cartContainer.find('.undo');
    let undoTimeoutId;

    // TODO: ajax get items in shopping cart. If there are any, put them inside the cart

    if ($cartContainer.length > 0) {

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
            quickUpdateCart();
        });

        //reinsert item deleted from the cart
        $undoButton.on('click', 'a', function (event) {
            clearInterval(undoTimeoutId);
            event.preventDefault();
            $cartList.find('.deleted').addClass('undo-deleted').one('webkitAnimationEnd oanimationend msAnimationEnd animationend', function () {
                $(this).off('webkitAnimationEnd oanimationend msAnimationEnd animationend').removeClass('deleted undo-deleted').removeAttr('style');
                quickUpdateCart();
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

    function addToCart(trigger) {
        let isCartEmpty = $cartContainer.hasClass('empty');

        //update cart album list

        /*
        TODO: get the correct album id
         this is just a album placeholder you should insert an item with the selected album info
         replace albumId, albumName, price and url with your real album info
         */
        albumId = albumId + 1;

        let albumAdded = $(
            `<li class="album">
                <div class="album-image">
                    <a href="/item/${albumId}"><img src="/image/albums/small/${albumId}" width="80px" alt="album image"></a>
                </div>
                <div class="album-details">
                    <div class="album-details-title"><a href="/item/${albumId}">Album Name</a></div>
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
                        <span class="price">$25.99</span>
                    </div>
                </div>
            </li>`);

        $cartList.prepend(albumAdded);

        //update number of items
        updateCartCount(isCartEmpty);

        //update total price
        updateCartTotal(trigger.data('price'), true);

        //show cart
        $cartContainer.removeClass('empty');
    }

    function removeAlbum(album) {
        clearInterval(undoTimeoutId);
        $cartList.find('.deleted').remove();

        let topPosition = album.offset().top - $cartBody.children('ul').offset().top,
            albumQuantity = Number(album.find('.quantity').find('select').val()),
            albumTotalPrice = Number(album.find('.price').text().replace('$', '')) * albumQuantity;

        album.css('top', topPosition + 'px').addClass('deleted');

        //update items count + total price
        updateCartTotal(albumTotalPrice, false);
        updateCartCount(true, -albumQuantity);
        $undoButton.addClass('visible');

        //wait 8sec before completely remove the item
        undoTimeoutId = setTimeout(function () {
            $undoButton.removeClass('visible');
            $cartList.find('.deleted').remove();
        }, 8000);
    }

    function quickUpdateCart() {
        let quantity = 0;
        let price = 0;

        $cartList.children('li:not(.deleted)').each(function () {
            let singleQuantity = Number($(this).find('select').val());
            quantity = quantity + singleQuantity;
            price = price + singleQuantity * Number($(this).find('.price').text().replace('$', ''));
        });

        $totalPrice.text(price.toFixed(2));
        cartCount.find('li').eq(0).text(quantity);
        cartCount.find('li').eq(1).text(quantity + 1);
    }

    function updateCartCount(emptyCart, quantity) {
        if (typeof quantity === 'undefined') {
            let actual = Number(cartCount.find('li').eq(0).text()) + 1;
            let next = actual + 1;

            if (emptyCart) {
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

    function updateCartTotal(price, bool) {
        bool ? $totalPrice.text((Number($totalPrice.text()) + Number(price)).toFixed(2)) : $totalPrice.text((Number($totalPrice.text()) - Number(price)).toFixed(2));
    }

});
