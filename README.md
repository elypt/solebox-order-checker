# Solebox order checker

## Setup
1. Install NodeJS https://nodejs.org/
2. Open CMD and change directory to the solebox-order-checker folder
3. Type `npm install` and wait until it is finished
4. Type `npm run build`

## Config
Replace `email` in accounts with your Solebox E-Mail and `password` with your Solebox Password\
Replace `https://discordapp.com/api/webhooks/` after `webhookurl` with your Webhook.
###### For one Account
```json
{
    "accounts": [
        "email:password"
    ],
    "useWebhook": true,
    "webhookurl": "https://discordapp.com/api/webhooks/"
}
```
###### For more than one account
You have to separate each one with a comma.\
**WARNING: There must not be a comma after the last account.**
```json
{
    "accounts": [
        "email:password",
        "email:password"
    ],
    "useWebhook": true,
    "webhookurl": "https://discordapp.com/api/webhooks/"
}
```
## Run
Type `npm start` in CMD

## Output example
![example](https://i.imgur.com/pD34BUE.jpg)

## Credits
Thanks to [EmojiOne](https://www.emojione.com/) for providing free emoji icons