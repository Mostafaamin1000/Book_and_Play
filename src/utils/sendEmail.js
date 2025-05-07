// utils/sendEmail.js
import nodemailer from 'nodemailer';

const sendEmail = async ({
    to = '',
    subject ='',
    text='' ,
    html = '',
    attachments=[]  }={}) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

 const info =  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject,
    text,
    html,
    attachments
  });
  return info
};

export default sendEmail;
