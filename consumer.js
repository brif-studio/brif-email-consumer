const amqplib = require('amqplib')
const mailService = require('./mailing/MailService')
require('dotenv').config()

const consumer = async () => {

    try {
        let connection = await amqplib.connect({
            protocol: 'amqp',
            hostname: process.env.RABBITMQ_HOST,
            port: process.env.RABBITMQ_PORT,
            username: process.env.RABBITMQ_USERNAME,
            password: process.env.RABBITMQ_PASSWORD,
            vhost: process.env.RABBITMQ_USERNAME,
            heartbeat: 10
        })
        console.log('Connected to RabbitMQ')

        connection.on('close', async ()=>{
            connection = await amqplib.connect({
                protocol: 'amqp',
                hostname: process.env.RABBITMQ_HOST,
                port: process.env.RABBITMQ_PORT,
                username: process.env.RABBITMQ_USERNAME,
                password: process.env.RABBITMQ_PASSWORD,
                vhost: process.env.RABBITMQ_USERNAME,
                heartbeat: 10
            })
        })

        connection.on('error', (err) => {
            console.log(err)
        })

        connection.on('blocked', (reason) => {
            console.log(reason)
        })

        const channel = await connection.createChannel()
        const exchange = await channel.assertExchange(process.env.EXCHANGE_NAME, 'topic', {
            durable: false
        })

        await channel.assertQueue(process.env.QUEUE_NAME, {
            durable: true
        })
        channel.bindQueue(process.env.QUEUE_NAME, exchange.exchange, 'sys.mail')
        channel.consume(process.env.QUEUE_NAME, async message => {
            let mail = JSON.parse(message.content.toString());
            mailService.sendMail(mail)
        })
    } catch (error) {
        console.log(error)
    }

}

consumer()