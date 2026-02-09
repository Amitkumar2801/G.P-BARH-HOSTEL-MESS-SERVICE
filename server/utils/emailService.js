// placeholder email service
module.exports = {
  sendEmail: async (to, subject, text) => {
    // integrate nodemailer or external service
    console.log('sendEmail', to, subject);
  }
};
