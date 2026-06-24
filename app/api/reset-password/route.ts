import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { supabaseAdmin } from '@/app/lib/supabase-admin';

const globalForOtp = global as unknown as {
  otpStore?: Map<string, { otp: string; expires: number; verified: boolean }>;
  rateLimitStore?: Map<string, number[]>;
};

const otpStore = globalForOtp.otpStore ?? new Map<string, { otp: string; expires: number; verified: boolean }>();
const rateLimitStore = globalForOtp.rateLimitStore ?? new Map<string, number[]>();

if (process.env.NODE_ENV !== 'production') {
  globalForOtp.otpStore = otpStore;
  globalForOtp.rateLimitStore = rateLimitStore;
}

function checkRateLimit(key: string, limit = 5, windowMs = 60000) {
  const now = Date.now();
  const timestamps = rateLimitStore.get(key) || [];
  const activeTimestamps = timestamps.filter(ts => now - ts < windowMs);
  
  if (activeTimestamps.length >= limit) {
    const oldestActive = activeTimestamps[0];
    const resetTime = Math.ceil((oldestActive + windowMs - now) / 1000);
    return { allowed: false, remaining: 0, resetTime };
  }
  
  return {
    allowed: true,
    remaining: limit - activeTimestamps.length,
    resetTime: 0
  };
}

function recordRateLimitHit(key: string) {
  const now = Date.now();
  const timestamps = rateLimitStore.get(key) || [];
  timestamps.push(now);
  rateLimitStore.set(key, timestamps);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    let { action, email } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email wajib diisi.' }, { status: 400 });
    }

    email = email.trim().toLowerCase();

    const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';
    const ipKey = `ip_${ip}_${action}`;
    const emailKey = `email_${email}_${action}`;

    const ipLimit = checkRateLimit(ipKey);
    const emailLimit = checkRateLimit(emailKey);

    if (!ipLimit.allowed || !emailLimit.allowed) {
      const resetTime = Math.max(ipLimit.resetTime, emailLimit.resetTime);
      return NextResponse.json(
        { error: `Terlalu banyak permintaan. Silakan tunggu ${resetTime} detik sebelum mencoba lagi.` },
        { status: 429 }
      );
    }

    recordRateLimitHit(ipKey);
    recordRateLimitHit(emailKey);

    if (action === 'send') {
      const { data: profile, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single();

      if (profileError || !profile) {
        return NextResponse.json({
          message: 'Jika email terdaftar, kode OTP pemulihan telah dikirim.'
        });
      }

      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      otpStore.set(email, { otp, expires: Date.now() + 5 * 60 * 1000, verified: false });

      const smtpHost = process.env.SMTP_HOST;
      const smtpPort = process.env.SMTP_PORT;
      const smtpUser = process.env.SMTP_USER;
      const smtpPass = process.env.SMTP_PASS;
      const smtpFrom = process.env.SMTP_FROM || smtpUser;

      if (!smtpHost || !smtpPort || !smtpUser || !smtpPass) {
        return NextResponse.json(
          { error: 'Konfigurasi email server belum lengkap.' },
          { status: 500 }
        );
      }

      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: parseInt(smtpPort, 10),
        secure: parseInt(smtpPort, 10) === 465,
        auth: { user: smtpUser, pass: smtpPass },
      });

      await transporter.sendMail({
        from: `"VeriKost Malang" <${smtpFrom}>`,
        to: email,
        subject: 'Kode OTP Reset Kata Sandi - VeriKost Malang',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="margin:0;padding:0;background-color:#f1f5f9;font-family:'Segoe UI',Roboto,sans-serif;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f1f5f9;padding:40px 20px;">
              <tr>
                <td align="center">
                  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
                    <tr>
                      <td style="background:linear-gradient(135deg,#2563eb,#0ea5e9);padding:32px;text-align:center;">
                        <h1 style="color:#ffffff;font-size:22px;font-weight:800;margin:0;">VeriKost Malang</h1>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:32px;">
                        <h2 style="color:#1e293b;font-size:18px;font-weight:700;margin:0 0 8px;">Reset Kata Sandi</h2>
                        <p style="color:#64748b;font-size:14px;line-height:1.6;margin:0 0 24px;">
                          Gunakan kode OTP di bawah ini untuk melanjutkan proses verifikasi reset kata sandi Anda:
                        </p>
                        <div style="background:#f8fafc;border:2px dashed #cbd5e1;border-radius:16px;padding:20px;text-align:center;margin-bottom:24px;">
                          <span style="font-size:36px;font-weight:800;letter-spacing:8px;color:#2563eb;font-family:monospace;">${otp}</span>
                        </div>
                        <div style="background:#fffbeb;border-radius:10px;padding:16px;border:1px solid #fef3c7;margin-bottom:24px;">
                          <p style="color:#b45309;font-size:12px;line-height:1.5;margin:0;">
                            ⚠️ Jangan berikan kode OTP ini kepada siapa pun.
                          </p>
                        </div>
                        <p style="color:#64748b;font-size:12px;margin:0;">
                          ⏰ Kode ini hanya berlaku selama 5 menit.
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
        message: 'Jika email terdaftar, kode OTP pemulihan telah dikirim.'
      });
    }

    if (action === 'verify') {
      const { otp } = body;
      const record = otpStore.get(email);

      if (!record || record.otp !== otp || Date.now() > record.expires) {
        return NextResponse.json({ error: 'Kode OTP tidak valid atau kedaluwarsa.' }, { status: 400 });
      }

      record.verified = true;
      otpStore.set(email, record);

      return NextResponse.json({ message: 'OTP terverifikasi.' });
    }

    if (action === 'reset') {
      const { password } = body;
      const record = otpStore.get(email);

      if (!record || !record.verified) {
        return NextResponse.json({ error: 'Verifikasi OTP diperlukan terlebih dahulu.' }, { status: 400 });
      }

      const { data: profile, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single();

      if (profileError || !profile) {
        return NextResponse.json({ error: 'Pengguna tidak ditemukan.' }, { status: 404 });
      }

      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        profile.id,
        { password: password }
      );

      if (updateError) {
        return NextResponse.json({ error: updateError.message }, { status: 400 });
      }

      otpStore.delete(email);

      return NextResponse.json({ message: 'Kata sandi berhasil diperbarui.' });
    }

    return NextResponse.json({ error: 'Aksi tidak valid.' }, { status: 400 });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server. Silakan coba lagi nanti.' },
      { status: 500 }
    );
  }
}
