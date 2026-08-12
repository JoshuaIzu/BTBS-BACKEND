// const nodemailer = require('nodemailer');
// const ejs = require('ejs');
// const path = require('path');

// const sendEmail = async (to, subject, text, options = {}) => {
//     try {
//         const transporter = nodemailer.createTransport({
//             service: 'Gmail',
//             auth: {
//                 user: process.env.EMAIL_USER,
//                 pass: process.env.EMAIL_PASS,
//             },
//         });

//         let html;
//         if (options.template) {
//             const templatePath = path.join(__dirname, '..', '..', 'views', 'emails', options.template);
//             html = await ejs.renderFile(templatePath, options.data || {});
//         }

//         const mailOptions = {
//             from: process.env.EMAIL_USER,
//             to,
//             subject,
//             text,
//             html,
//         };

//         await transporter.sendMail(mailOptions);
//     } catch (error) {
//         console.error('Error sending email:', error);
//         throw new Error('Failed to send email');
//     }
// };

// module.exports = sendEmail;



const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
    try {
        const transporter = nodemailer.createTransport({
            host: process.env.MAIL_SERVER,
            port: parseInt(process.env.MAIL_PORT), // Good practice to parse string to integer
            secure: process.env.MAIL_SECURE === 'true',
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS,
            },
        });

        const message = {
            from: `Developer <${process.env.MAIL_USER}>`,
            to: options.email,
            subject: options.subject,
            html: options.html,
            text: options.text,
        };

        const info = await transporter.sendMail(message);
        console.log("Message sent successfully: %s", info.messageId);
        return info;

    } catch (error) {
        console.error("Nodemailer failed. Attempting fallback method...", error.message);

        // Call your Resend fallback logic here
        // const fallbackInfo = await sendWithResend(options);
        // return fallbackInfo;
    }
};

module.exports = sendEmail;