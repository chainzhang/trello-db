const env = require('../.env');
const TrelloDb = require('../');

const db = new TrelloDb({
    key: env.key,
    token: env.token
});

db.board('70RyU5WL').lists((err, lists) => {
    if (err) return console.error(lists);
    console.log(lists);
});

db.board('70RyU5WL').cardsInList('node', (err, cards) => {
    if (err) return console.error(cards);
    console.log(cards);
});

db.board('70RyU5WL').cardsInList('node', (err, cards) => {
    if (err) return console.error(cards);
    console.log(cards.map(c => c.attachments));
}, { attachment: true });