'use strict';

const async = require('async');
const should = require('should');
const TrelloDb = require('../');
const util = require('util');


const db = new TrelloDb({
    /**
     * inject a resolver to test api without connect to trello
     */
    resolver: (url, done) => {
        const routes = {
            lists: /\/1\/boards\/(.*)\/lists(\/(.*))?/,
            cards: /\/1\/list\/(.*)\/cards(\/(.*))?/
        }
        async.each(Object.keys(routes), (key, done) => {
            const pattern = routes[key];
            if (pattern.test(url)) return done(key);
            done();
        }, (key) => {
            switch (key) {
                case 'lists': return done(null, [ { name: 'test', id: 'list-1' } ]);
                case 'cards': return done(null, [ { name: 'card', id: 'card-1' } ]);
            }
            return done(new Error('invalid request'));
        });
    } 
});

describe('TrelloDb', () => {

    it('board', (done) => {
        db.board('test').boardId.should.be.exactly('test');
        done();
    });

    it('lists', (done) => {
        db.board('test').lists((err, lists) => {
            if (err) return done(err);
            lists.should.containEql({ id: 'list-1', name: 'test' });
            done();
        });
    });

    it('list', (done) => {
        async.parallel([
            (done) => {
                db.board('test').list('test', (err, list) => {
                    if (err) return done(err);
                    list.name.should.be.exactly('test');
                    list.id.should.be.exactly('list-1');
                    done();
                });
            },
            (done) => {
                db.board('test').list('test1', (err, list) => {
                    if (err) return done(err);
                    (!list).should.be.true();
                    done();
                });
            }
        ], done);
    })

    it('getCardsIn', (done) => {
        db.board('test').cardsInList('test', (err, cards) => {
            if (err) return done(err);
            cards.should.containEql({ id: 'card-1', name: 'card' })
            done();
        });
    });

});