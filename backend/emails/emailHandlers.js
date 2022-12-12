import { mailtrapClient, sender } from "../lib/mailtrap.js";
import { createWelcomeEmailTemplate } from "./emailTemplates.js";

export const sendWelcomeEmail = async (email, name, profileUrl) => {
  const recipient = email;
  console.log(recipient, "recipient----------");

  try {
    const res = await mailtrapClient.send({
      from: sender,
      to: recipient,
      subject: "Welcome to LinkedOut",
      html: createWelcomeEmailTemplate(name, profileUrl),
      category: "welcome",
    });

    console.log("Welcome email sent successfully");
  } catch (error) {
    console.error("Error in sendWelcomeEmail ", error?.message);
    throw error;
  }
};
