<?php

test('guest is redirected to login from the root page', function () {

    $response = $this->get('/');

    $response->assertRedirect(
        route('login')
    );
});


test('login page can be opened', function () {

    $response = $this->get(
        route('login')
    );

    $response->assertOk();
});