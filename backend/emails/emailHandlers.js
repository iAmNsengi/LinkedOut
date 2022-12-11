import { mailtrapClient, sender } from "../lib/mailtrap";

export const sendWelcomeEmail = async (email, name, profileUrl) => {
  const recipient = [{ email }];
  try {
    const res = await mailtrapClient.send({
      from: sender,
      to: recipient,
      subject: "Welcome to LinkedOut",
      html: createWelcomeEmailTemplate(name, profileUrl),
      category: "welcome",
    });
  } catch (error) {
    console.error("Error in sendWelcomeEmail ", error);
  }
};
