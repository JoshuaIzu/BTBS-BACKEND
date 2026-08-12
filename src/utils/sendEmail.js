const { BrevoClient } = require("@getbrevo/brevo");

const client = new BrevoClient({
    apiKey: process.env.BREVO_API_KEY,
});

const sendEmail = async (options) => {
    try {
        const response = await client.transactionalEmails.sendTransacEmail({
            sender: {
                name: "BTBS",
                email: process.env.BREVO_SENDER_EMAIL,
            },

            to: [
                {
                    email: options.email,
                },
            ],

            subject: options.subject,

            htmlContent: options.html,

            textContent: options.text,
        });

        console.log("Email sent successfully:", response);

        return response;
    } catch (error) {
        console.error("Brevo email error:", error);

        throw new Error("Failed to send email");
    }
};

module.exports = sendEmail;