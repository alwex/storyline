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

$app->register(new Silex\Provider\MonologServiceProvider(), array(
    'monolog.logfile' => __DIR__ . '/../app.log',
));

$app->register(new Silex\Provider\DoctrineServiceProvider(), array(
    'db.options' => array(
        'driver' => 'pdo_sqlite',
        'path' => __DIR__ . '/../app.db',
    )
));

$app['db']->query('CREATE TABLE IF NOT EXISTS cards (id INTEGER PRIMARY KEY, title TEXT, content TEXT, pos INTEGER)');

$app->get('/cards', function () {
    $output = 'some posts';

    return new Response(json_encode($output));
});

$app->post('/cards', function (Request $request) use ($app) {
    $cards = json_decode($request->get('cards'));

//    $app['db']->query('DELETE FROM cards');
    foreach ($cards as $index => $card) {
        $app['monolog']->addDebug('Testing the Monolog logging.' . $index);

        $q = $app['db']->createQueryBuilder();
        $q->insert('cards')
            ->values([
                'title' => '?',
                'content' => '?',
                'pos' => '?',
            ])
            ->setParameter(0, $card->title)
            ->setParameter(1, $card->content)
            ->setParameter(2, $index);

        $app['db']->query($q->toString());
    }

    return new Response('save ok', 201);
});

$app->run();
