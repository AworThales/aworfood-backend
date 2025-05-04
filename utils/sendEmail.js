import nodemailer from "nodemailer";

const sendEmail = async (options) => {
    const transport = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        service: process.env.SMTP_SERVICE,
        auth: {
            user: process.env.SMTP_MAIL,
            pass: process.env.SMTP_PASSWORD,
        },
    });

    const mailOptions = {
        from: `${process.env.SMTP_FROM_NAME} <${process.env.SMTP_FROM_EMAIL}>`,
        to: options.email,
        subject: options.subject,
        html: options.message,
        ...(options.cc && { cc: options.cc }),   // Add CC if provided
        ...(options.bcc && { bcc: options.bcc }) // Add BCC if provided
    };

    await transport.sendMail(mailOptions);
};

export default sendEmail;


  // from: process.env.SMTP_MAIL,

// import nodemailer from "nodemailer";

// const sendEmail = async (options) => {
//   const transport = nodemailer.createTransport({
//     host: process.env.SMTP_HOST,
//     port: process.env.SMTP_PORT,
//     auth: {
//       user: process.env.SMTP_EMAIL,
//       pass: process.env.SMTP_PASSWORD,
//     },
//   });

//   const message = {
//     from: `${process.env.SMTP_FROM_NAME} <${process.env.SMTP_FROM_EMAIL}>`,
//     to: options.email,
//     subject: options.subject,
//     html: options.message,
//   };

//   await transport.sendMail(message);
// };

// export default sendEmail;


// import nodemailer from "nodemailer";

// const sendEmail = async (options) => {
//   const transporter = nodemailer.createTransport({
//     host: process.env.SMPT_HOST,
//     port: process.env.SMPT_PORT,
//     service: process.env.SMPT_SERVICE,
//     auth:{
//         user: process.env.SMPT_MAIL,
//         pass: process.env.SMPT_PASSWORD,
//     },
// });

// const mailOptions = {
//     from: process.env.SMPT_MAIL,
//     to: options.email,
//     subject: options.subject,
//     text: options.message,
// };

//   await transporter.sendMail(message);
// };

// export default sendEmail;

