import nodemailer from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport'; // 1. Importe a tipagem de SMTP
import { env } from '../config/env';



class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    // 2. Defina explicitamente o objeto com a tipagem do SMTP
    const smtpOptions: SMTPTransport.Options = {
      host: '64.233.186.108', // Força o IPv4 do Gmail para evitar o erro ENETUNREACH
      port: Number(env.SMTP_PORT), // Geralmente 587
      secure: false, // false para 587
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS
      },
      tls: {
        rejectUnauthorized: false,
        // 3. O 'servername' precisa obrigatoriamente ficar aqui dentro para o TLS validar o certificado do Gmail
        servername: env.SMTP_HOST || 'smtp.gmail.com' 
      }
    };

    this.transporter = nodemailer.createTransport(smtpOptions);
  }

  async sendTaskCreatedEmail(user: { email: string; name: string }, task: { title: string; dueDate: Date | null }) {
    await this.transporter.sendMail({
      from: `"TaskInsight" <${env.SMTP_USER}>`,
      to: user.email,
      subject: `Nova tarefa atribuída: ${task.title}`,
      html: `<h1>Olá ${user.name},</h1>
             <p>Uma nova tarefa foi atribuída a você:</p>
             <ul>
               <li><strong>Título:</strong> ${task.title}</li>
               ${task.dueDate ? `<li><strong>Data de vencimento:</strong> ${task.dueDate.toLocaleDateString('pt-BR')}</li>` : ''}
             </ul>
             <p>Acesse o sistema para mais detalhes.</p>
             <p>Atenciosamente,<br/>Equipe TaskInsight</p>`,
      headers: {
        'X-Priority': '1',
        'X-MSMail-Priority': 'High',
        'Importance': 'High'
      }
    });
  }

  async sendPasswordResetEmail(user: { email: string; name: string }, resetUrl: string) {
    await this.transporter.sendMail({
      from: `"TaskInsight" <${env.SMTP_USER}>`,
      to: user.email,
      subject: 'Recuperação de senha — TaskInsight',
      html: `<h2>Recuperação de senha</h2>
             <p>Olá, <strong>${user.name}</strong>!</p>
             <p>Clique no link abaixo para redefinir sua senha. O link é válido por <strong>1 hora</strong>.</p>
             <a href="${resetUrl}">Redefinir senha</a>
             <p>Se você não solicitou isso, ignore este email.</p>`
    });
  }
}

export const emailService = new EmailService();
export default emailService;