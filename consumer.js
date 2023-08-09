const amqplib = require('amqplib')
const nodemailer = require('nodemailer')
require('dotenv').config()

const publisher = async () => {

    let transporter = nodemailer.createTransport({
        host: "smtp.mail.me.com",
        port: 587,
        tls: {
            rejectUnauthorized: true,
            minVersion: "TLSv1.2",
        },
        auth: {
            user: "umut.karapinar01@icloud.com",
            pass: "dvmy-tjts-lkpm-znzb",
        },
    });



    try {
        const connection = await amqplib.connect("amqp://localhost:5672")
        const channel = await connection.createChannel()
        const exchange = await channel.assertExchange(process.env.EXCHANGE_NAME, 'topic', {
            durable: false
        })

        await channel.assertQueue(process.env.QUEUE_NAME, {
            exclusive: true
        })
        channel.bindQueue(process.env.QUEUE_NAME, exchange.exchange, 'sys.mail')
        channel.consume(process.env.QUEUE_NAME, async message => {
            console.log(message.content.toString());

            let parse = JSON.parse(message.content.toString());
            transporter
                .sendMail({                                                     //mail gönerem işlemini yapan arakaş
                    from: ' "AI lı bir şeler A.Ş." <' + parse.from.address + '>',
                    to: parse.to,
                    subject: parse.subject,
                    html: parse.html,
                })
                .then(() => {
                    channel.ack(message)
                })
                .catch((error) => {
                    console.log(error);
                });


        })
    } catch (error) {
        console.log(error)
    }

}

publisher()