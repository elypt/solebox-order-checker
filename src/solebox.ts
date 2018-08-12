import * as fs from 'fs';
import orderChecker from "./classes/orderchecker";
import webHook from "./utils/webhook";

// Emoji artwork provided by EmojiOne ​http://emojione.com​

const message = {
    'username': 'Solebox Order Checker',
    'icon_url': 'https://i.imgur.com/RVEu3p7.png',
    'attachments': [
        {
            'thumb_url': 'https://i.imgur.com/rglTDYq.png',
            'color': '#000000',
            'title': 'Thanks for using',
            'title_link': 'https://github.com/elypt',
            'fields': [
                {
                    'title': 'GitHub',
                    'value': '@elypt',
                    'short': false
                }
            ]
        }
    ]
}

const config = JSON.parse(fs.readFileSync('./config.json').toString('utf8'));

if (config.useWebhook) webHook.postOne(config.webhookurl, message);

(async function main () {
    for (const account of config.accounts) {
        const [ username, password ] = account.split(':');
        if (config.useWebhook) {
            const check = new orderChecker(username, password, config.webhookurl).start();
            await check;
        } else {
            const check = new orderChecker(username, password).start();
            await check;
        }
    }
})()
