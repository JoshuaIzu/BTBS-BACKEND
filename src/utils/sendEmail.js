const { BrevoClient } = require("@getbrevo/brevo");

const client = new BrevoClient({
    apiKey: process.env.BREVO_API_KEY,
});

const sendEmail = async (email, subject, text, options = {}) => {
    try {
        const response = await client.transactionalEmails.sendTransacEmail({
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

        console.log("Email sent successfully:", response);

        return response;
    } catch (error) {
        console.error("Brevo email error:", error);

        throw new Error("Failed to send email");
    }
};

module.exports = sendEmail;