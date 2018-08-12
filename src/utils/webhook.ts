import * as request from 'request-promise-native';

export default class webhook {
    public static async postOne (uri: string, message: any) {
        if (uri.endsWith('/')) {
            uri += 'slack';
        } else {
            uri += '/slack';
        }

        await request({
            method: 'POST',
            uri,
            json: true,
            body: message
        }).catch((e: any) => {
            let retry;
            try {
                retry = JSON.parse(e.message.split(' - ')[1]).retry_after;
            } catch(e) {
                retry = undefined;
            } finally {
                console.log('Error sending message')
                setTimeout(() => {
                    this.postOne(uri, message);
                }, retry?retry:5000);
            }
        })
    }
}