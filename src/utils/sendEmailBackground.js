const { BrevoClient } = require("@getbrevo/brevo");

const client = new BrevoClient({
    apiKey: process.env.BREVO_API_KEY,
});


const sendEmailBackground = (email, subject, text, options = {}) => {
    setImmediate(async () => {
        try {
            await client.transactionalEmails.sendTransacEmail({
                sender: {
                    name: "BTBS",
                    email: process.env.BREVO_SENDER_EMAIL,
                },
                to: [
                    {
                        email: email,
                    },
                ],
                subject: subject,
                textContent: text,
                htmlContent:
                    options.html ||
                    `<div>
              <p>${text.replace(/\n/g, "<br>")}</p>
            </div>`,
            });
            console.log(`Background email sent successfully to ${email}`);
        } catch (error) {
            console.error(`Background email error to ${email}:`, error.message);
            // Log error but don't throw since this is running in background
        }
    });
};

module.exports = sendEmailBackground;