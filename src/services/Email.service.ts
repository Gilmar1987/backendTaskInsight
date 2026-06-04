import nodemailer from 'nodemailer';
import { env } from '../config/env';

class EmailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: Number(env.SMTP_PORT),
      secure: false,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS
      }
    });
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
             <p>Atenciosamente,<br/>Equipe TaskInsight</p>`
    });
  }
}

export const emailService = new EmailService();