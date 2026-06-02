import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { supabaseAdmin } from '@/app/lib/supabase-admin';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email wajib diisi.' },
        { status: 400 }
      );
    }

    // Validate SMTP configuration
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = process.env.SMTP_PORT;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const smtpFrom = process.env.SMTP_FROM || smtpUser;

    if (!smtpHost || !smtpPort || !smtpUser || !smtpPass) {
      console.error('SMTP configuration is incomplete. Check your .env.local file.');
      return NextResponse.json(
        { error: 'Konfigurasi email server belum lengkap. Hubungi administrator.' },
        { status: 500 }
      );
    }

    // Generate password reset link via Supabase Admin API
    // This creates the link WITHOUT sending Supabase's default email
    const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email,
      options: {
        redirectTo: `${origin}/reset-password`,
      },
    });

    if (linkError) {
      // Don't reveal if email exists or not for security
      console.error('Supabase generateLink error:', linkError.message);
      return NextResponse.json({
        message: 'Jika email terdaftar, tautan pemulihan telah dikirim.'
      });
    }

    // Extract the token from the generated link
    const actionLink = linkData?.properties?.action_link;
    if (!actionLink) {
      console.error('No action link returned from Supabase');
      return NextResponse.json({
        message: 'Jika email terdaftar, tautan pemulihan telah dikirim.'
      });
    }

    // Create SMTP transporter
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: parseInt(smtpPort, 10),
      secure: parseInt(smtpPort, 10) === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    // Send the email
    await transporter.sendMail({
      from: `"VeriKost Malang" <${smtpFrom}>`,
      to: email,
      subject: 'Reset Kata Sandi - VeriKost Malang',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin:0;padding:0;background-color:#f1f5f9;font-family:'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f1f5f9;padding:40px 20px;">
            <tr>
              <td align="center">
                <table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
                  
                  <!-- Header -->
                  <tr>
                    <td style="background:linear-gradient(135deg,#2563eb,#0ea5e9);padding:32px 32px 24px;text-align:center;">
                      <div style="display:inline-block;background:rgba(255,255,255,0.2);border-radius:12px;padding:8px 16px;margin-bottom:12px;">
                        <span style="color:#ffffff;font-size:20px;font-weight:900;letter-spacing:-0.5px;">VK</span>
                      </div>
                      <h1 style="color:#ffffff;font-size:22px;font-weight:800;margin:0 0 4px;">VeriKost<span style="opacity:0.9;">Malang</span></h1>
                      <p style="color:rgba(255,255,255,0.85);font-size:13px;margin:0;">Pencarian Kost Terverifikasi</p>
                    </td>
                  </tr>

                  <!-- Body -->
                  <tr>
                    <td style="padding:32px;">
                      <h2 style="color:#1e293b;font-size:18px;font-weight:700;margin:0 0 8px;">Reset Kata Sandi</h2>
                      <p style="color:#64748b;font-size:14px;line-height:1.6;margin:0 0 24px;">
                        Kami menerima permintaan untuk mereset kata sandi akun VeriKost Anda. Klik tombol di bawah untuk membuat kata sandi baru.
                      </p>
                      
                      <!-- CTA Button -->
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td align="center" style="padding:8px 0 24px;">
                            <a href="${actionLink}" 
                               style="display:inline-block;background:linear-gradient(135deg,#2563eb,#0ea5e9);color:#ffffff;text-decoration:none;font-size:14px;font-weight:700;padding:14px 36px;border-radius:12px;box-shadow:0 4px 12px rgba(37,99,235,0.3);">
                              Reset Kata Sandi
                            </a>
                          </td>
                        </tr>
                      </table>

                      <div style="background:#f8fafc;border-radius:10px;padding:16px;border:1px solid #e2e8f0;">
                        <p style="color:#64748b;font-size:12px;line-height:1.5;margin:0;">
                          ⏰ Link ini berlaku selama <strong>1 jam</strong>.<br>
                          🔒 Jika Anda tidak meminta reset kata sandi, abaikan email ini.
                        </p>
                      </div>

                      <p style="color:#94a3b8;font-size:11px;margin:24px 0 0;line-height:1.5;">
                        Jika tombol tidak berfungsi, salin dan buka link berikut di browser:<br>
                        <a href="${actionLink}" style="color:#2563eb;word-break:break-all;font-size:11px;">${actionLink}</a>
                      </p>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="background:#f8fafc;padding:20px 32px;text-align:center;border-top:1px solid #e2e8f0;">
                      <p style="color:#94a3b8;font-size:11px;margin:0;">
                        &copy; ${new Date().getFullYear()} VeriKost Malang. Email ini dikirim otomatis, jangan membalas email ini.
                      </p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });

    return NextResponse.json({
      message: 'Jika email terdaftar, tautan pemulihan telah dikirim.'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server. Silakan coba lagi nanti.' },
      { status: 500 }
    );
  }
}
