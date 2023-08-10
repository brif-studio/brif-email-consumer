const nodemailer = require('nodemailer')
require('dotenv').config()
const fs = require('fs');

class NodemailerService {

    createTransport = (options) => {
        const transport = nodemailer.createTransport({
            host: process.env.SERVER_HOST,
            port: process.env.SERVER_PORT,
            tls: {
                rejectUnauthorized: true,
                minVersion: "TLSv1.2",
            },

            auth: {
                user: process.env.ICLOUD_ADDRESS,
                pass: process.env.ICLOUD_PASSWORD,
            },
        })
        return transport
    }

    sendMail = (mail) => {
        this.createTransport(null).sendMail(
            {
                to: mail.to,
                from: ' "AI!lı bir şeler A.Ş." <' + process.env.SENDER_ADDRESS + '>',
                subject: mail.subject,
                html: mail.html,
                
              //  profilePhoto: fs.createReadStream('/home/rsa-key-20230807/consumer/brif-email-consumer/img/asd.png')
            },
            function (err, info) {
                if (err) {
                    throw err
                }
                console.log(info)
            }
        )
    }

}

module.exports = NodemailerService