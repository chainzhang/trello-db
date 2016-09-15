'use strict';

const IS_TESTING = (process.env.NODE_ENV == 'testing');

const async = require('async');
const assert = require('assert');
const Trello = require("node-trello");

class TrelloDb
{
    constructor(params) {
        this.params = params || {};
        this.injectedResolver = params.resolver;

        this.boardSetting = {};
        this.timeout = params.timeout;

        this.defaultResolver = function(url, done) {
            let timer;
        
            if (this.timeout) {
                timer = setTimeout(() => {
                    done(new Error('timeout'));
                    done = null;
                }, this.timeout);
            }

            return this.getTrelloClient().get(url, (err, data) => {
                if (!done) return;
                if (timer) clearTimeout(timer);
                return done(err, data);
            });
        }
    }

    getTrelloClient() {
        const self = this;
        if (!this.trelloClient) {
            ['key', 'token'].forEach(k => assert(self.params[k], `params.${k} is required`));
            this.trelloClient = new Trello(this.params.key, this.params.token);
        }
        return this.trelloClient;
    }

    injectResolver(func) {
        this.injectedResolver = func;
    }

    resolve(url, done) {
        if (this.injectedResolver) {
            return this.injectedResolver.bind(this)(url, done, this.defaultResolver);
        }
        return this.defaultResolver(url, done);
    }

    board(id) {
        if (!this.boardSetting[id]) {
            this.boardSetting[id] = {};
        }
        this.boardId = id;
        return this;
    }

    lists(filter, cb) {
        if (typeof(filter) == 'function' && !cb) {
            cb = filter;
            filter = null;
        }
        assert(this.boardId, 'use board(id) to select board before fetching.');
        this.resolve(`/1/boards/${this.boardId}/lists`, (err, data) => {
            if (err) return cb(err);
            return cb(null, filter ? data.filter(filter) : data);
        });
    }

    list(id, done) {
        this.lists(i => i.name == id || i.id == id, (err, lists) => {
            if (err) return done(err);
            if (lists.length == 0) return done(null, null);
            return done(null, lists.pop());
        });
    }

    cardsInList(id, done, opt) {
        opt = opt || {};
        const self = this;

        const withAttachments = opt.attachment || false;

        return this.list(id, (err, list) => {
            if (err) return done(err);
            if (!list) return done(new Error(`list:${id} not found`));
            async.waterfall([
                (done) => self.resolve(`/1/list/${list.id}/cards`, done),
                (cards, done) => {
                    if (!withAttachments) return done(null, cards);
                    async.series(cards.map(card => {
                        return (done) => {
                            self.resolve(`/1/cards/${card.id}/attachments`, (err, attachments) => {
                                card.attachments = attachments;
                                return done(null, card);
                            });
                        }
                    }), done);
                },
            ], done);
        });
    }
}

module.exports = TrelloDb;