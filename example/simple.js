const env = require('../.env');
const TrelloDb = require('../');

const db = new TrelloDb({
    key: env.key,
    token: env.token
});

db.board(env.board).lists((err, lists) => {
    if (err) return console.error(lists);
    console.log(lists);
});

db.board(env.board).cardsInList('node', (err, cards) => {
    if (err) return console.error(cards);
    console.log(cards);
});

db.board(env.board).cardsInList('node', (err, cards) => {
    if (err) return console.error(cards);
    console.log(cards.map(c => c.attachments));
}, { attachment: true });