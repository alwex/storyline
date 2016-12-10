<?php
/**
 * Created by PhpStorm.
 * User: alexandreguidet
 * Date: 8/12/16
 * Time: 9:22 AM
 */

require_once __DIR__ . '/../vendor/autoload.php';

use Silex\Application;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

$app = new Application();
$app['debug'] = true;

$dbFile = __DIR__ . '/../app.db';
if (!file_exists($dbFile)) {
    touch($dbFile);
}

$app->register(new Silex\Provider\MonologServiceProvider(), array(
    'monolog.logfile' => __DIR__ . '/../app.log',
));

$app->register(new Silex\Provider\DoctrineServiceProvider(), array(
    'db.options' => array(
        'driver' => 'pdo_sqlite',
        'path' => $dbFile,
    )
));

$app['db']->query('CREATE TABLE IF NOT EXISTS cards (id INTEGER PRIMARY KEY, title TEXT, content TEXT, pos INTEGER, kind TEXT)');

$app->get('/cards', function () use ($app) {
    $cards = $app['db']->fetchAll('SELECT * FROM cards');

    return new Response(json_encode($cards));
});

$app->post('/cards', function (Request $request) use ($app) {
    $cards = json_decode($request->get('cards'));

    $app['db']->query('DELETE FROM cards');
    foreach ($cards as $index => $card) {
        $app['monolog']->addDebug('Testing the Monolog logging.' . $index);

        $app['db']->insert('cards', [
            'title' => $card->title,
            'content' => $card->content,
            'kind' => $card->kind,
            'pos' => $index
        ]);
    }

    return new Response(json_encode('save ok'), 201);
});

$app->run();
