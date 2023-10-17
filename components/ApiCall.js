import {getApiDataProgressPayment} from './APIHelper.js';

export async function sendErrorReason(
  liveUrl,
  order_code,
  error_message,
  token,
) {
  const Ddata = {
    order_code: order_code,
    error_message: error_message,
  };
  try {
    const response = await getApiDataProgressPayment(
      `${liveUrl}error-reason`,
      'POST',
      JSON.stringify(Ddata),
      token,
    );
  } catch (error) {
    console.log('error:', error);
  }
}
