import nodemailer from 'nodemailer';

export async function sendLowStockAlert(productName: string, currentStock: number, minStock: number) {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
    console.warn('SMTP settings not configured. Skipping email alert.');
    return;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const mailOptions = {
    from: `"POS System" <${process.env.SMTP_USER}>`,
    to: process.env.ALERT_EMAIL || process.env.SMTP_USER, // Default to sender if not specified
    subject: `⚠️ Alerta de Stock: ${productName}`,
    html: `
      <div style="font-family: sans-serif; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #d32f2f;">Alerta de Stock Bajo</h2>
        <p>El producto <strong>${productName}</strong> ha alcanzado un nivel crítico de stock.</p>
        
        <ul style="background: #f9f9f9; padding: 15px; list-style: none; border-radius: 4px;">
          <li><strong>Stock Actual:</strong> ${currentStock}</li>
          <li><strong>Mínimo Permitido:</strong> ${minStock}</li>
        </ul>

        <p>Por favor, reponer inventario lo antes posible.</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
        <small style="color: #888;">POS & Inventario System</small>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email alert sent for ${productName}`);
  } catch (error) {
    console.error('Error sending email alert:', error);
  }
}
