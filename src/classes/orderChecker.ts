import * as request from 'request-promise-native';
import userAgent from "../static/userAgent";
import extractData from "../utils/extractData";
import webHook from "../utils/webhook";

export default class orderChecker {
    private stoken: string;
    private orderdetails: string[] = [];
    private email: string;
    private password: string;
    private webhook: string;
    private jar: any = request.jar();

    constructor(email: string, password: string, webHook?: string) {
        this.email = email;
        this.password = password;
        this.webhook = webHook;
    }

    public async start() {
        await this.getstoken();
        if (await this.login()) {
            if (await this.history()) {
                this.orderdetail();
            }
        }
    }

    private async getstoken () {
        const options = {
            method: 'GET',
            uri: 'https://www.solebox.com/mein-konto/',
            headers: {
                'User-Agent': userAgent
            },
        };
    
        try {
            const body = await request(options);
            this.stoken = body.split('"stoken" value="')[1].split('"')[0];
            return true;
        } catch (e) {
            console.error(e);
            return false;
        }
    }

    private async login () {
        const options = {
            method: 'POST',
            uri: 'https://www.solebox.com/index.php?',
            jar: this.jar,
            headers: {
                'User-Agent': userAgent
            },
            formData: {
                'stoken': this.stoken,
                'lang': 0, 
                'actcontrol': 'account',
                'fnc': 'login_noredirect',
                'cl': 'account',
                'lgn_usr': this.email,
                'lgn_pwd': this.password
            },
        };

        try {
            const body = await request(options);
            if (body.includes('<div class="Title">Mein solebox-Konto</div>')) {
                return true;
            } else {
                return false;
            }
        } catch (e) {
            console.error(e);
            return false;
        }
    }

    private async history () {
        const options = {
            method: 'GET',
            uri: 'https://www.solebox.com/bestellhistorie/',
            jar: this.jar,
            headers: {
                'User-Agent': userAgent
            }
        }

        try {
            const body = await request(options);

            const orders = body.split('https://www.solebox.com/index.php?cl=account_orderdetails&order=')
            for (let i = 1; i < orders.length; i++) {
                const order = orders[i];
                const orderNumber = order.split('"')[0]
                this.orderdetails.push(orderNumber)
            } 
            
            const message = {
                'username': 'Solebox Order Checker',
                'icon_url': 'https://i.imgur.com/RVEu3p7.png',
                'attachments': [
                    {
                        'color': '#000000',
                        'title': 'No Order found',
                        'title_link': 'https://www.solebox.com',
                        'fields': [
                            {
                                'title': 'Account',
                                'value': 'E-Mail: ' + this.email + '\n' + 'Password: ' + this.password,
                                'short': false
                            }
                        ]
                    }
                ]
            }

            if (this.orderdetails.length == 0) {
                if (this.webhook) await webHook.postOne(this.webhook, message); 
                return false;
            } else {
                return true;
            }
        } catch (e) {
            console.error(e);
            return false;
        }   
    }

    private async orderdetail () {
        for (let i = 0; i < this.orderdetails.length; i++) {
            const options = {
                method: 'GET',
                uri: 'https://www.solebox.com/index.php?lang=1&cl=account_orderdetails&order=' + this.orderdetails[i],
                jar: this.jar,
                headers: {
                    'User-Agent': userAgent
                }
            }

            try {
                const body = await request(options);
                await (new extractData(body, this.webhook).start());
                return true;
            } catch (e) {
                console.error(e);
                return false;
            }
        } 
    }
}