/**
 * Utility helper untuk mengirim pesan Telegram via HTTP API resmi Telegram Bot.
 * 100% on-demand tanpa library eksternal.
 */
export async function sendTelegramMessage(
  chatId: string,
  text: string
): Promise<{ success: boolean; error?: string }> {
  const token = process.env.TELEGRAM_BOT_TOKEN;

  if (!token) {
    console.warn('TELEGRAM_BOT_TOKEN belum diset di environment variable.');
    return { success: false, error: 'TELEGRAM_BOT_TOKEN belum dikonfigurasi.' };
  }

  try {
    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
        disable_web_page_preview: false,
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.ok) {
      console.error('Telegram API error:', data);
      let desc = data.description || 'Gagal mengirim pesan Telegram.';
      if (desc.includes('chat not found')) {
        desc = 'Chat tidak ditemukan. Pastikan Anda sudah membuka bot Anda di Telegram dan menekan tombol START (/start) terlebih dahulu, serta Chat ID berupa angka yang benar.';
      }
      return {
        success: false,
        error: desc,
      };
    }

    return { success: true };
  } catch (error) {
    console.error('Error in sendTelegramMessage:', error);
    return { success: false, error: 'Terjadi kesalahan saat menghubungi API Telegram.' };
  }
}
