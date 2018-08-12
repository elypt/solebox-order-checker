import * as request from 'request-promise-native';
import userAgent from "../static/userAgent";

export default class shippingStatus {
    public static async dhl (tracking: string) {
        const options = {
            method: 'GET',
            uri: tracking,
            headers: {
                'User-Agent': userAgent
            },
        };
    
        try {
            const body = await request(options);
            return body.split('<div>Status: ')[1].split('</div>')[0];
        } catch (e) {
            console.error(e);
            return false;
        }
    }
}