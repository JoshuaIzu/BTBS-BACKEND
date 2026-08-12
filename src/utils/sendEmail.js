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



const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async (to, subject, text, options = {}) => {
    try {
        const { data, error } = await resend.emails.send({
            from: process.env.EMAIL_FROM,
            to: [to],
            subject: subject,
            text: text,
            html: options.html || `<p>${text}</p>`,
        });

        if (error) {
            console.error("Resend error:", error);

            throw new Error(error.message || "Failed to send email");
        }

        console.log("Email sent successfully:", data.id);

        return data;
    } catch (error) {
        console.error("Error sending email:", error);

        throw new Error("Failed to send email");
    }
};

module.exports = sendEmail;

