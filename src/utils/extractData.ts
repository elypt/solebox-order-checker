import * as request from 'request-promise-native';
import webHook from "./webhook";
import shippingStatus from "./shippingStatus";

export default class extractData {
    private body: string;
    private webhook: string;

    constructor (body: string, webHook: string) {
        this.body = body;
        this.webhook = webHook;
    }

    public async start () {
        return this.orderdetails(this.body);
    }

    public async orderdetails (body: string) {
        const orderNr = body.split('<strong>Your Order-Nr. ')[1].split('<')[0]
        const timestamp = body.split('</strong><br> ')[0].split('<br>')[1].split('from ')[1]
        const shippingNr = body.split('<strong>Your Shipping-Nr. ')[1].split('</strong><br>')[0]
        let tracking = body.split('<a target="_blank" href="')[1].split('">Tracking Shipment')[0]
        const soleboxstatus = body.split('<font color=')[1].split('>')[1].split('<')[0]
        const fullname = body.split('<dd>')[2].split('<br>')[0].replace(/(^[ \t]*\n)/gm, '').replace(/\t/g, '')
        const street = body.split('<dd>')[2].split('<br>')[2].replace(/(^[ \t]*\n)/gm, '').replace(/\t/g, '')
        const city = body.split('<dd>')[2].split('<br>')[3].replace(/(^[ \t]*\n)/gm, '').replace(/\t/g, '')
        const shippingMethod = body.split('<strong>Shipping method</strong>')[1].split('</h3>')[1].split('</div>')[0].replace(/\s/g,'')
        let shippingstatus;

        if (shippingMethod == 'DHL') {
            tracking = 'https://nolp.dhl.de/nextt-online-public/en/search?piececode=' + shippingNr; 
            shippingstatus = await (shippingStatus.dhl(tracking));
        } else {
            shippingstatus = 'UPS support comming soon';
        }

        const message = {
            'username': 'Solebox Order Checker',
            'icon_url': 'https://i.imgur.com/RVEu3p7.png',
            'attachments': [
                {
                    'color': '#000000',
                    'author_name': 'Solebox Order-Nr. ' + orderNr + ' \nfrom ' + timestamp,
                    'title': 'Tracking Shipment ' + shippingMethod,
                    'title_link': tracking,
                    'fields': [
                        {
                            'title': 'Address',
                            'value': fullname + '\n' + street + '\n' + city,
                            'short': true
                        }, {
                            'title': 'Solebox Status',
                            'value': soleboxstatus,
                            'short': true
                        }, {
                            'title': 'Shipping Status ' + shippingMethod,
                            'value': shippingstatus,
                            'short': true
                        }
                    ]
                }
            ]
        }

        const basketItems = body.split('<tr class="basketItem"')

        for (let i = 1; i < basketItems.length; i++) {
            const basketItem = basketItems[i];
            const quantity = basketItem.split('<td class="quantity">')[1].split('x')[0].replace(/\s/g,'');
            const description = basketItem.split('<b>')[1].split('</b>')[0];
            const size = basketItem.split('<span>')[1].split('</span>')[0].replace(/\s/g,'');
            const price = basketItem.split('<td class="basketCenter">')[2].split('€')[0].replace(/\s/g,'');

            let itemfields = [];
            itemfields[0] = { "title": description, 'short': false };
            itemfields[1] = { "title": 'Size', 'value': size, 'short': true };
            itemfields[2] = { "title": 'Quantity', 'value': quantity, 'short': true };
            itemfields[3] = { "title": 'Total', 'value': price + ' €', 'short': true };
            message.attachments[0].fields.push(itemfields[0], itemfields[1], itemfields[2], itemfields[3]) 
        } 

        if (this.webhook) await (webHook.postOne(this.webhook, message));
    }
}