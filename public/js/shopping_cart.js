jQuery(document).ready(function () {
    // cached jQuery objects
    let $cartContainer = jQuery('.cart-container');
    let $cartBody = $cartContainer.find('.body');
    let $cartList = $cartBody.find('ul').eq(0);
    let $totalPrice = $cartContainer.find('.checkout').find('span');
    let $cartTrigger = $cartContainer.children('.cart-trigger');
    let cartCount = $cartTrigger.children('.count');
    let $undoButton = $cartContainer.find('.undo');
    let undoTimeoutId;

    // if the user is not logged in, don't load these bunch of scripts
    if ($cartContainer.length > 0) {
        let $addToCartButton = jQuery('.add-to-cart-trigger');

        // retrieve shopping cart for this user.
        retrieveShoppingCart();

        // add album to cart
        $addToCartButton.on('click', function (event) {
            event.preventDefault();

            let trigger = jQuery(this);
            let albumId = trigger.data('id');
            let albumTitle = trigger.data('title');
            let albumPrice = trigger.data('price');

            addToCart(albumId, albumTitle, albumPrice, 1);
        });

        // toggle cart open/close
        $cartTrigger.on('click', function (event) {
            event.preventDefault();
            toggleCart();
        });

        // close cart when clicking on the .cart-container::before (background layer)
        $cartContainer.on('click', function (event) {
            if (jQuery(event.target).is(jQuery(this))) {
                toggleCart(true);
            }
        });

        //delete an item from the cart
        $cartList.on('click', '.delete-item', function (event) {
            event.preventDefault();

            let albumLi = jQuery(event.target).parents('.album');
            removeAlbum(albumLi);
        });

        //update item quantity
        $cartList.on('change', 'select', function (event) {
            let id = jQuery(event.target).parents('.album').data("id");
            let newQuantity = event.target.value;
            updateQuantity(id, newQuantity, updateTotalNumAndPrice);
        });

        //reinsert item deleted from the cart
        $undoButton.on('click', 'a', function (event) {
            clearInterval(undoTimeoutId);
            event.preventDefault();

            // for some weird webkit css attributes stuff
            $cartList.find('.deleted').addClass('undo-deleted').one('webkitAnimationEnd oanimationend msAnimationEnd animationend', function () {
                jQuery(this).off('webkitAnimationEnd oanimationend msAnimationEnd animationend').removeClass('deleted undo-deleted').removeAttr('style');
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
            // close the cart
            $cartContainer.removeClass('cart-open');

            //reset undo timeout, and delete the album in the undo
            removeAlbumInUndo();
            $undoButton.removeClass('visible');

            setTimeout(function () {
                $cartBody.scrollTop(0);
                //check if cart is empty to hide it
                if (Number(cartCount.find('li').eq(0).text()) === 0) {
                    $cartContainer.addClass('empty');
                }
            }, 500);
        } else {
            // open the cart
            $cartContainer.addClass('cart-open');
        }
    }

    /**
     * Retrieve the shopping cart from server
     */
    function retrieveShoppingCart() {
        jQuery.get("/shopping_cart/")
            .done(function (data) {
                // hide error messsage
                $("#warning").empty().hide();

                for (let item of data) {
                    addToChartFrontEnd(item.id, item.album_id, item.title, item.price, item.quantity);
                }
            })
            .fail(function (data) {
                $("#warning").empty().append(`<span>${data.responseText}</span>`).show();
                console.log(data);
            });
    }

    /**
     * Add an album to cart, AND post data to server.
     *
     * @param albumId
     * @param albumTitle
     * @param albumPrice
     * @param albumQuantity
     */
    function addToCart(albumId, albumTitle, albumPrice, albumQuantity) {
        let body = {
            albumId: albumId,
            quantity: albumQuantity
        };

        // let the server know will ya
        jQuery.post("/shopping_cart/", body)
            .done(function (data) {
                // hide error messsage
                $("#warning").empty().hide();

                addToChartFrontEnd(data.id, albumId, albumTitle, albumPrice, albumQuantity);
            })
            .fail(function (data) {
                $("#warning").empty().append(`<span>${data.responseText}</span>`).show();
                console.log(data);
            });
    }

    /**
     * Add an album to cart at the front end. This method only update the DOM without posting data to server.
     *
     * @param shoppingCartDetailId
     * @param albumId
     * @param albumTitle
     * @param albumPrice
     * @param albumQuantity
     */
    function addToChartFrontEnd(shoppingCartDetailId, albumId, albumTitle, albumPrice, albumQuantity) {
        let isCartEmpty = $cartContainer.hasClass('empty');

        //update cart album list
        addAlbumLi(shoppingCartDetailId, albumId, albumTitle, albumPrice, albumQuantity);

        //update number of items
        updateTotalNumItems(isCartEmpty, albumQuantity);

        //update total price
        updateTotalPrice(albumPrice, albumQuantity, true);

        //show cart
        $cartContainer.removeClass('empty');
    }

    /**
     * Add an album as a <li> item
     *
     * @param shoppingCartDetailId
     * @param albumId
     * @param albumTitle
     * @param albumPrice
     * @param albumQuantity
     */
    function addAlbumLi(shoppingCartDetailId, albumId, albumTitle, albumPrice, albumQuantity) {
        let html = `<li class="album" data-id="${shoppingCartDetailId}">
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
                            <label for="album-${albumId}">Quantity</label>
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
            </li>`;

        html = html.replace(`value="${albumQuantity}"`, `value="${albumQuantity}" selected`);

        let albumAdded = jQuery(html);

        $cartList.prepend(albumAdded);
    }

    /**
     * Remove album from cart.
     *
     * @param albumLi the &lt;li&gt; element in shopping cart, the one representing an album
     */
    function removeAlbum(albumLi) {
        // remove the album in undo first
        removeAlbumInUndo();

        let shoppingCartDetailsId = albumLi.data('id');
        let topPosition = albumLi.offset().top - $cartBody.children('ul').offset().top;
        let albumQuantity = Number(albumLi.find('.quantity').find('select').val());
        let albumPrice = Number(albumLi.find('.price').text().replace('$', ''));

        albumLi.css('top', topPosition + 'px').addClass('deleted');

        //update items count + total price
        updateTotalPrice(albumPrice, albumQuantity, false);
        updateTotalNumItems(true, -albumQuantity);
        $undoButton.addClass('visible');

        //wait 10 seconds before completely remove the item
        undoTimeoutId = setTimeout(function () {
            removeAlbumFromServer(shoppingCartDetailsId, function () {
                $undoButton.removeClass('visible');
                $cartList.find('.deleted').remove();
            });
        }, 10000);
    }

    /**
     * Delete the album in undo area
     */
    function removeAlbumInUndo() {
        let deletedAlbumLi = $cartList.find('.deleted');
        if (deletedAlbumLi.length > 0) {
            let shoppingCartDetailsId = deletedAlbumLi.data('id');

            removeAlbumFromServer(shoppingCartDetailsId, function () {
                clearInterval(undoTimeoutId);
                deletedAlbumLi.remove();
            });
        }
    }

    /**
     * Remove album from cart, AND remove it from server side as well.
     *
     * @param shoppingCartDetailsId
     * @param callback
     */
    function removeAlbumFromServer(shoppingCartDetailsId, callback) {
        // let the server know will ya
        jQuery.ajax({url: `/shopping_cart/${shoppingCartDetailsId}`, method: 'DELETE'})
            .done(function () {
                // hide error messsage
                $(".warning").empty().hide();

                callback();
            })
            .fail(function (data) {
                $("#warning").empty().append(`<span>${data.responseText}</span>`).show();
                console.log(data);
            });
    }

    /**
     * Update the quantity of the album
     *
     * @param shoppingCartDetailsId
     * @param newQuantity
     * @param callback
     */
    function updateQuantity(shoppingCartDetailsId, newQuantity, callback) {
        // let the server know will ya
        jQuery.ajax({url: `/shopping_cart/${shoppingCartDetailsId}`, method: 'PATCH', data: {quantity: newQuantity}})
            .done(function () {
                // hide error messsage
                $(".warning").empty().hide();

                callback();
            })
            .fail(function (data) {
                $("#warning").empty().append(`<span>${data.responseText}</span>`).show();
                console.log(data);
            });
    }

    /**
     * Update the total number of items. This function is triggered when user delete items or change the quantity from cart.
     */
    function updateTotalNumAndPrice() {
        let total = 0;
        let price = 0;

        $cartList.children('li:not(.deleted)').each(function () {
            let quantity = Number(jQuery(this).find('select').val());
            total = total + quantity;
            price = price + quantity * Number(jQuery(this).find('.price').text().replace('$', ''));
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
     * @param quantity
     * @param isAddition
     */
    function updateTotalPrice(price, quantity, isAddition) {
        let currentPrice = Number($totalPrice.text());
        let singlePrice = Number(price);
        let quantityNum = Number(quantity);
        let delta = singlePrice * quantityNum;

        if (isAddition) {
            $totalPrice.text((currentPrice + delta).toFixed(2));
        } else {
            $totalPrice.text((currentPrice - delta).toFixed(2));
        }
    }
});
